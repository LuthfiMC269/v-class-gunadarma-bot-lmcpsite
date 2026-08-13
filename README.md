# 📌 VClass WhatsApp Bot

Bot WhatsApp otomatis untuk:

* 📚 Monitoring tugas VClass
* 📢 Notifikasi ke grup WhatsApp
* ⏰ Reminder deadline tugas
* 🎓 Cek nilai UTS
* 🔐 Sistem user premium

---

## 🚀 Fitur

* 🔔 Notifikasi tugas otomatis dari VClass
* ⏰ Reminder deadline tugas
* 📅 Notifikasi jadwal UTS
* 📊 Cek nilai UTS via command
* 🔐 Sistem user premium
* 🔎 OSINT mahasiswa (premium only)

---

## 🧱 Teknologi

* Node.js (WhatsApp Bot)
* Python (scraping & processing)
* whatsapp-web.js
* Puppeteer

---

## 📁 Struktur Project

```
.
├── python/            
├── uts/               
├── bot.js             
├── jadwal.py          
├── package.json
├── requirements.txt
└── README.md
```

---

## ⚙️ Konfigurasi Environment (.env)

Project ini menggunakan file `.env` untuk menyimpan data sensitif dan konfigurasi penting.
Buat file `.env` lalu isi seperti berikut:

```
VCLASS_USERNAME=
VCLASS_PASSWORD=
COURSE_IDS=
WHATSAPP_GROUP_NAME=
OWNER_NUMBER=628xxxxxxxxx@c.us
```

---

## 🧩 Penjelasan Variabel

* **VCLASS_USERNAME** → Username akun VClass
* **VCLASS_PASSWORD** → Password akun VClass
* **COURSE_IDS** → ID course yang dipantau (pisahkan dengan koma jika lebih dari satu)
* **WHATSAPP_GROUP_NAME** → Nama grup WhatsApp (harus sama persis)
* **OWNER_NUMBER** → Nomor owner bot (format: `628xxx@c.us`)

---

## 📦 Instalasi

### 1. Clone Repository

```
git clone https://github.com/Aghitsniii/v-class-gunadarma-bot
cd v-class-gunadarma-bot
```

### 2. Install Dependency

#### Node.js

```
npm install
```

#### Python

```
pip install -r requirements.txt
```

---

## ▶️ Menjalankan Bot

```
node bot.js atau npm start
```

Scan QR WhatsApp saat pertama kali menjalankan.

---

## 💬 Command

### 👑 Owner Only

```
/addpremium 628xxxx
```

### 🔐 Premium User

```
/osintmahasiswa nim|id_prodi|id_sp
```

### 📊 User

```
/ceknilaiuts 12345678
```

---

## 📜 License

Free to use & modify.
