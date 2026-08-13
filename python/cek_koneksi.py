import requests

try:
    print("🔍 Menghubungkan ke https://v-class.gunadarma.ac.id ...")
    response = requests.get("https://v-class.gunadarma.ac.id", timeout=15)
    print(f"✅ Terhubung! Status code: {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"❌ Gagal terhubung: {e}")
