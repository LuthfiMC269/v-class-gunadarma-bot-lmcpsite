import os
import json
import re
import requests
import time
import random
import logging
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from dotenv import load_dotenv

# --- Logging setup ---
today = datetime.now().strftime("%Y-%m-%d")
log_dir = "log"
os.makedirs(log_dir, exist_ok=True)
log_path = os.path.join(log_dir, f"check_vclass_{today}.log")
logging.basicConfig(
    filename=log_path,
    filemode='a',
    format='[%(asctime)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    level=logging.INFO
)
console = logging.StreamHandler()
console.setFormatter(logging.Formatter('[%(asctime)s] %(message)s', '%H:%M:%S'))
logging.getLogger().addHandler(console)

def log(msg):
    logging.info(msg)

# --- Env and config ---
load_dotenv()
BASE_URL   = "https://v-class.gunadarma.ac.id"
USERNAME   = os.getenv("VCLASS_USERNAME")
PASSWORD   = os.getenv("VCLASS_PASSWORD")
COURSE_IDS = [cid.strip() for cid in os.getenv("COURSE_IDS", "").split(",") if cid.strip()]

session = requests.Session()
session.verify = False
requests.packages.urllib3.disable_warnings()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
})

def login():
    login_url = urljoin(BASE_URL, "login/index.php")
    try:
        log("🔐 Login ke V-Class...")
        r = session.get(login_url, timeout=20)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        token = soup.find("input", {"name": "logintoken"})
        if not token:
            raise RuntimeError("Gagal mendapatkan token login")

        payload = {
            "username": USERNAME,
            "password": PASSWORD,
            "logintoken": token["value"]
        }

        r2 = session.post(login_url, data=payload, timeout=20)
        r2.raise_for_status()
        if "login/index.php" in r2.url:
            raise RuntimeError("Login gagal: periksa USERNAME/PASSWORD")

        log("✅ Login berhasil")
        return True
    except Exception as e:
        log(f"❌ Login gagal: {e}")
        return False

def extract_deadline_assign(html):
    soup = BeautifulSoup(html, "html.parser")
    row = soup.find("th", string=re.compile(r"due date", re.IGNORECASE))
    if row:
        td = row.find_next_sibling("td")
        if td:
            return td.text.strip()
    m = re.search(r"Due date</th>\s*<td[^>]*>([^<]+)</td>", html, re.IGNORECASE)
    return m.group(1).strip() if m else "Tidak diketahui"

def extract_deadline_quiz(html):
    soup = BeautifulSoup(html, "html.parser")
    div = soup.find("div", class_="quizinfo")
    if div:
        for p in div.find_all("p"):
            if "close on" in p.text.lower():
                return re.sub(r".*close on\s", "", p.text, flags=re.IGNORECASE).strip().rstrip(".")
    m = re.search(r"This quiz will close on (.+?)\.", html)
    return m.group(1).strip() if m else "Tidak diketahui"

def scrape_tasks():
    tasks = []
    for cid in COURSE_IDS:
        try:
            course_url = f"{BASE_URL}/course/view.php?id={cid}"
            log(f"📚 Mengambil mata kuliah ID {cid} ...")
            r = session.get(course_url)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")
            h1 = soup.find("h1")
            course_name = h1.text.strip() if h1 else f"Course {cid}"
            log(f"  ➤ {course_name}")

            for li in soup.select("li.activity"):
                a = li.find("a", href=True)
                title_span = li.find("span", class_="instancename")
                if not a or not title_span:
                    continue

                href = a["href"]
                full_url = href if href.startswith("http") else urljoin(BASE_URL, href)
                raw_title = title_span.text.strip()

                if "/mod/assign/view.php" in href:
                    tipe = "Assignment"
                    detail = session.get(full_url); detail.raise_for_status()
                    dl = extract_deadline_assign(detail.text)
                elif "/mod/quiz/view.php" in href:
                    tipe = "Quiz"
                    detail = session.get(full_url); detail.raise_for_status()
                    dl = extract_deadline_quiz(detail.text)
                else:
                    tipe = "Materi"
                    dl = "-"

                clean_title = re.sub(r"\b(Quiz|Assignment|Materi)\b", "", raw_title, flags=re.IGNORECASE).strip()

                log(f"     • [{tipe}] {clean_title} → Deadline: {dl}")
                tasks.append({
                    "mata_kuliah": course_name,
                    "judul": clean_title,
                    "tipe": tipe,
                    "link": full_url,
                    "deadline": dl
                })

                time.sleep(random.uniform(3.5, 5.0))  # Delay

        except Exception as e:
            log(f"⚠️ Gagal mengambil course ID {cid}: {e}")

    log(f"📦 Total tugas ditemukan: {len(tasks)}")
    return tasks

def save_tasks(tasks):
    os.makedirs("python/node", exist_ok=True)
    path = "python/node/tugas.json"
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)
        log(f"💾 Disimpan ke {path}")
    except Exception as e:
        log(f"❌ Gagal menyimpan file: {e}")

if __name__ == "__main__":
    if login():
        tugas = scrape_tasks()
        save_tasks(tugas)
