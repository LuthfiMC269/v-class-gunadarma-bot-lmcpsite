const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const fs = require("fs");
const qrcode = require("qrcode-terminal");
require("dotenv").config();

const GROUP_NAME = process.env.GROUP_NAME || "3KB01";
const OWNER_NUMBER = process.env.OWNER_NUMBER || "6285155260305@c.us";

const client = new Client({
    authStrategy: new LocalAuth(),
    ffmpegPath: "/usr/bin/ffmpeg",
    puppeteer: {
	executablePath: "/usr/bin/google-chrome-stable",
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    }
});

client.on("qr", qr => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
    console.log("V-Class bot is ready!!");

      const chats = await client.getChats();
      const group = chats.find(chat => chat.isGroup && chat.name === GROUP_NAME);
      if (!group) {
        console.log(`Group "${GROUP_NAME}" tidak ditemukan.`);
        return;
      } else{
        console.log("Group ID :", group.id._serialized);
	await client.sendMessage(OWNER_NUMBER, "BOT V-CLASS READY");
      }

    setInterval(() => sendToGroup(group), 120000); // kirim tugas setiap 2 menit
});

client.on("message", async (msg) => {
    const from = msg.from;
    const isGroup = msg.isGroupMsg || msg.from.endsWith("@g.us");
    const isOwner = from === OWNER_NUMBER;
    const premiumFile = "premium/premium.json";


    if (msg.body.startsWith("/antekaseng")) {
        try {
	      const media = await MessageMedia.fromUrl("https://cdn.lmcpsite.my.id/uploads/6b5ef5ba_Screenshot_from_2026-07-20_01-09-41.png");
	      return msg.reply(media);
	} catch (error) {
	    console.log(error);
        }
    }
    // Pastikan file premium.json ada
    if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, "[]");

    const premiumUsers = JSON.parse(fs.readFileSync(premiumFile, "utf-8"));

    // /addpremium hanya bisa dari owner di chat pribadi
    if (msg.body.startsWith("/addpremium") && !isGroup && isOwner) {
        const args = msg.body.split(" ");
        if (args.length !== 2) return msg.reply("Format: /addpremium 628xxxxxx");

        const number = args[1].replace(/\D/g, "") + "@c.us";

        if (!premiumUsers.includes(number)) {
            premiumUsers.push(number);
            fs.writeFileSync(premiumFile, JSON.stringify(premiumUsers, null, 2));
			console.log(`Owner Menambahkan ${number} ke daftar pengguna premium`);
            return msg.reply(`Berhasil menambahkan ${number} ke daftar premium.`);
        } else {
            return msg.reply("Nomor tersebut sudah premium.");
        }
    }
    if (msg.body.startsWith("/servertime")){
	const currentTime = new Date().toLocaleString('id-ID', { 
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'long'});
	return msg.reply(`Current Server Time: ${currentTime}`);
   }

    // /osintmahasiswa hanya untuk premium & bukan di grup
    if (msg.body.startsWith("/osintmahasiswa") && !isGroup) {
		console.log(`${from} mencoba akses /osintmahasiswa tapi bukan pengguna premium`);
        if (!premiumUsers.includes(from)) {
            return msg.reply("Fitur ini hanya tersedia untuk pengguna *Premium*.");
			
        }

	console.log(`${from} mengakses /osintmahasiswa`);
        const args = msg.body.split(" ")[1]?.split("|");
        if (!args || args.length !== 3) {
            return msg.reply("Format: /osintmahasiswa nim|id_prodi|id_sp\n\n*E.x : /osintmahasiwa 1234xxx|123xxx|053xxx*\n\n*Note: ID_SP = ID PERGURUAN TINGGI*");
        }

        const [nim, id_prodi, id_sp] = args;
        const url = `https://api.xxxx.xxx.xx.xx/......../...../....`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer XXXXXXXXXXXXXXXXXX',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
				console.log(`Gagal Mengambil data mahasiswa (${from}) - Status: ${response.status}`);
                return msg.reply(`Gagal mengambil data. Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                return msg.reply("Data mahasiswa tidak ditemukan.");
            }

            const mhs = data[0];
const alamatObj = mhs?.alamat || {};
const alamat = [
  alamatObj.jalan || '',
  alamatObj.rt && alamatObj.rw ? `RT/RW ${alamatObj.rt}/${alamatObj.rw}` : '',
  alamatObj.kelurahan ? `Kelurahan ${alamatObj.kelurahan}` : '',
  alamatObj.kab_kota?.nama ? `${alamatObj.kab_kota.nama}` : '',
  alamatObj.kode_pos ? `Kode Pos ${alamatObj.kode_pos}` : ''
].filter(Boolean).join(', ');

const handphone = mhs?.handphone || '-';
const email = mhs?.email || '-';
const ibuKandung = mhs?.ibu_kandung || '-';
const kewarganegaraan = mhs?.kewarganegaraan || '-';
const agama = mhs?.agama?.nama || '-';

const result = `*Data Mahasiswa*\n
*👤 Nama: ${mhs.nama}*
*📖 NIK: ${mhs.nik}*
*🚻 Jenis Kelamin: ${mhs.jenis_kelamin}*
*📅 Tempat, Tgl Lahir: ${mhs.tempat_lahir}, ${mhs.tgl_lahir}*
*🛐 Agama: ${agama}*
*📞 No Telepon: ${handphone}*
*📧 Email: ${email}*
*🏠 Alamat: ${alamat}*
*👩‍ Ibu Kandung: ${ibuKandung}*
*🌍 Kewarganegaraan: ${kewarganegaraan}*
*📚 Program Studi: ${mhs.terdaftar?.nama_prodi || '-'}*
*🎓 IPK: ${mhs.terdaftar?.ipk || '-'}*
*📊 Status: ${mhs.terdaftar?.status || '-'}*`;


            return msg.reply(result);
        } catch (err) {
            console.error(err);
            return msg.reply("Terjadi kesalahan saat mengambil data.");
        }
    }
});

client.initialize();

function safeParseJSON(filePath) {
    try {
        let raw = fs.readFileSync(filePath, "utf-8");
        raw = raw.replace(/,\s*([\]}])/g, "$1");
        return JSON.parse(raw);
    } catch (e) {
        console.error(`❌ Gagal mem-parse file JSON: ${filePath}`);
        console.error(e.message);
        return null;
    }
}

function formatDateString(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function isToday(dateStr) {
    const today = new Date();
    const target = new Date(dateStr);
    return today.toDateString() === target.toDateString();
}

function sendToGroup(group) {
    const tugasPath = "python/node/tugas.json";
    const sentPath = "python/node/latest_sent.json";
    const remindedPath = "python/node/last_reminded.json";

    if (!fs.existsSync(tugasPath)) {
        console.log("❌ File tugas.json tidak ditemukan!");
        return;
    }

    const tugas = safeParseJSON(tugasPath);
    if (!tugas) return;

// Log jumlah tugas
console.log(`Total tugas ditemukan: ${tugas.length}`);
console.log(`Total tugas sudah dikirim: ${tugas.length}`);
console.log("Tidak ada tugas baru untuk dikirim.");

    const sent = fs.existsSync(sentPath) ? safeParseJSON(sentPath) : [];
    const reminded = fs.existsSync(remindedPath) ? safeParseJSON(remindedPath) : [];

    const newTugas = tugas.filter(t =>
        !sent.some(s => s.judul === t.judul && s.mata_kuliah === t.mata_kuliah)
    );
   newTugas.forEach(t => {
        const pesan = `*📢 Hei, Ada Tugas nih!*\n
*📚 Mata Kuliah: ${t.mata_kuliah}*
*🏷 Tipe: ${t.tipe || 'Tugas'}*
*📝 Judul: ${t.judul}*
*⏰ Deadline: ${t.deadline || 'Tidak diketahui'}*
*🔗 Link: ${t.link}*`;

        group.sendMessage(pesan);
        console.log(`Tugas dikirim: ${t.judul}`);
    });

    fs.writeFileSync(sentPath, JSON.stringify([...sent, ...newTugas], null, 2));

    // ===== Notifikasi Pengingat Deadline =====
    const todayReminders = [];
    tugas.forEach(t => {
        if (!t.deadline || !isToday(t.deadline)) return;

        const sudahDiingatkan = reminded.some(r =>
            r.judul === t.judul &&
            r.mata_kuliah === t.mata_kuliah &&
            r.date === new Date().toISOString().slice(0, 10)
        );

        if (sudahDiingatkan) return;

        const pesan = `*⚠ Woy, ${t.tipe?.toUpperCase() || 'Tugas'} ini bakal berakhir hari ini, Gas kerjain broo jangan sampe telat!*\n
*📚 Mata Kuliah: ${t.mata_kuliah}*
*📝 Judul: ${t.judul}*
*⏰ Deadline: ${formatDateString(t.deadline)}*
*🔗 Link: ${t.link}*`;

        group.sendMessage(pesan);
        console.log(`Pengingat deadline dikirim: ${t.judul}`);

        todayReminders.push({
            judul: t.judul,
            mata_kuliah: t.mata_kuliah,
            date: new Date().toISOString().slice(0, 10)
        });
    });

    if (todayReminders.length > 0) {
        fs.writeFileSync(remindedPath, JSON.stringify([...reminded, ...todayReminders], null, 2));
    }
}

// === Pengingat Jadwal UTS ===
const pathUts = "uts/uts.js";
const pathLatestSendUts = "uts/latestsend_uts.json";

// Fungsi ambil jadwal UTS
function checkAndSendUtsSchedule(group) {
    if (!fs.existsSync(pathUts)) {
        console.log("❌ File uts.js tidak ditemukan.");
        return;
    }

    const utsList = require(`./${pathUts}`);
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const todaySendFile = fs.existsSync(pathLatestSendUts) ? JSON.parse(fs.readFileSync(pathLatestSendUts, "utf-8")) : [];

    const jadwalHariIni = utsList.filter(jadwal => {
        const tgl = new Date(jadwal.tanggal);
        const tglStr = tgl.toISOString().slice(0, 10);
        return tglStr === today;
    });

    if (jadwalHariIni.length === 0) {
        console.log("Tidak ada jadwal UTS hari ini.");
        return;
    }

    jadwalHariIni.forEach(jadwal => {
        const sudahDikirim = todaySendFile.find(d => d.tanggal === today && d.makul === jadwal.mata_kuliah);
        if (sudahDikirim) return;

        const tanggalFormatted = new Date(jadwal.tanggal).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const pesan = `*📢 Ujian Alert! Hari ini ada jadwal Ujian bro~*\n
*📚 Mata Kuliah: ${jadwal.mata_kuliah}*
*📅 Hari,Tanggal: ${jadwal.hari}, ${tanggalFormatted}*
*⏰ Waktu: ${jadwal.waktu}*
*🏫 Ruang: ${jadwal.ruang}*`;

        group.sendMessage(pesan);
        console.log(`✅ Jadwal UTS dikirim: ${jadwal.mata_kuliah}`);

        todaySendFile.push({
            tanggal: today,
            makul: jadwal.mata_kuliah
        });
    });

    fs.writeFileSync(pathLatestSendUts, JSON.stringify(todaySendFile, null, 2));
}

// Jadwalkan pengiriman UTS setiap hari jam 06:00 pagi
setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // if (hour === 13 && minute >= 0 && minute <= 20) {
		 if (hour === 07 && minute === 02) {
        const chats = await client.getChats();
        const group = chats.find(chat => chat.isGroup && chat.name === GROUP_NAME);
        if (group) {
            checkAndSendUtsSchedule(group);
        } else {
            console.log("❌ Group tidak ditemukan.");
        }
    }
}, 60000); // periksa setiap menit

client.on("message", async (msg) => {
    const from = msg.from;
    const isGroup = msg.isGroupMsg || msg.from.endsWith("@g.us")
    // cek nilai UTS
    if (msg.body.startsWith("/ceknilaiuts") && !isGroup) {
        const args = msg.body.trim().split(" ");
        if (args.length !== 2) {
            return msg.reply("Format:*/ceknilaiuts [npm]*\nContoh:\n/ceknilaiuts 1234567");
        }

        const npm = args[1].trim();
        const nilaiFile = "data/nilai.json";

        console.log(`[📘] ${from} menggunakan perintah /ceknilai dengan NPM: ${npm}`);

        if (!fs.existsSync(nilaiFile)) {
            console.log(`[⚠️] File ${nilaiFile} tidak ditemukan.`);
            return msg.reply("❌ File nilai.json tidak ditemukan.");
        }

        const data = JSON.parse(fs.readFileSync(nilaiFile, "utf-8"));
        const nilaiMahasiswa = data.filter(item => item.npm === npm);

        if (nilaiMahasiswa.length === 0) {
            console.log(`[ℹ️] Tidak ditemukan data nilai untuk NPM: ${npm}`);
            return msg.reply(`⚠️ Data nilai untuk NPM ${npm} tidak ditemukan.`);
        }

        let response = `*📄 Hasil Nilai UTS*\n`;
        response += `\n*👤 Nama:* ${nilaiMahasiswa[0].nama}`;
        response += `\n*🆔 NPM:* ${npm}\n`;

        nilaiMahasiswa.forEach((item, index) => {
            response += `\n*📚 Mata Kuliah ${index + 1}:* ${item.mata_kuliah}`;
            response += `\n*📊 Nilai:* ${item.nilai}\n`;
        });

        return msg.reply(response);
    }
});
