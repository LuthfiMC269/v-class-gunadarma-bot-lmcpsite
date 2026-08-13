import schedule
import time
import subprocess
import datetime

def run_job():
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] Menjalankan check_vclass.py ...")
    subprocess.run(["python3", "python/check_vclass.py"])

# Jadwalkan sekali sehari (misalnya pukul 07:00)
schedule.every().day.at("09:45").do(run_job)
schedule.every().day.at("18:00").do(run_job)

print("Scheduler aktif. Menunggu waktu yang dijadwalkan...\n")

# Jalankan langsung juga sekali pertama kali
run_job()

# Looping scheduler
while True:
    schedule.run_pending()
    time.sleep(60)
