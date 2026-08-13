const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client();


client.on("qr", qr => {
    qrcode.generate(qr, {small: true});
});

client.on("ready", () => {
    console.log("READY");
    console.log(client.info);
});

client.on("message", async (msg) => {
    console.log("FROM:", msg.from);

    try {
        const contact = await msg.getContact();
        console.log("CONTACT:", contact.pushname);

        const chatId = msg.from;
        const chat = await client.getChatById(chatId);
        console.log(chat.name);

    } catch (e) {
        console.error(e);
    }
});

client.initialize();
