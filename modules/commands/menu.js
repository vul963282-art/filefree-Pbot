const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "menu1",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "pcoder",
    description: "Xem danh sách lệnh đẹp, hiện đại, có ảnh!",
    commandCategory: "Người dùng",
    usages: ".../tên lệnh/all",
    cooldowns: 5
};
module.exports.languages = {
    "vi": {},
    "en": {}
}

function byte2mb(bytes) {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0, n = parseInt(bytes, 10) || 0;
    while (n >= 1024 && ++l) n = n / 1024;
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}

// Random icon cho từng lần menu
function getRandomIcons(count) {
    const allIcons = [
        '🦄','🌸','🥑','💎','🚀','🔮','🌈','🐳','🍀','🍉','🎧','🎲','🧩','🌻','🍕','🧸','🥨','🎂','🎉','🦋','🌺','🍭','🍦','🌵','🐱‍👤',
        '👑','🧠','🍓','🎮','⚡','🎨','🦖','🐼','🦊','🦚','🍔','🥕','🍣','🍩','🍿','🍫','🍤','🍩','🍪','🥟','🍦','🍟','🧁','🍰','🥜'
    ];
    const arr = [];
    for (let i = 0; i < count; i++) arr.push(allIcons[Math.floor(Math.random() * allIcons.length)]);
    return arr;
}

// Tải ảnh về cache, trả về path
async function downloadImage(url) {
    const ext = path.extname(url.split("?")[0]).split(".").pop() || "jpg";
    const cacheDir = path.join(__dirname, '..', '..', 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const filePath = path.join(cacheDir, `menu_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
    const response = await axios({ method: 'GET', url, responseType: 'arraybuffer', timeout: 15000 });
    fs.writeFileSync(filePath, response.data);
    return filePath;
}

module.exports.run = async function({ api, event, args, Currencies, __GLOBAL }) {
    const { events, commands } = global.client;
    const { cpu, osInfo } = global.nodemodule["systeminformation"];
    const pidusage = await global.nodemodule["pidusage"](process.pid);
    const moment = require("moment-timezone");
    const { threadID: tid, messageID: mid, senderID: sid } = event;
    const config = global.config;
    const time = process.uptime();
    const hours = Math.floor(time / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / 60);
    const seconds = Math.floor(time % 60);
    const timeStart = Date.now();
    const { manufacturer, brand, speed, physicalCores, cores } = await cpu();
    const { platform: OSPlatform } = await osInfo();
    const xuly = Math.floor((Date.now() - global.client.timeStart) / 4444);
    const trinhtrang = xuly < 10 ? "Đẳng cấp vip pro" :
        xuly > 10 && xuly < 100 ? "Siêu Mượt" : "Mượt";
    var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
    if (thu == 'Sunday') thu = 'Chủ Nhật'
    if (thu == 'Monday') thu = 'Thứ Hai'
    if (thu == 'Tuesday') thu = 'Thứ Ba'
    if (thu == 'Wednesday') thu = 'Thứ Tư'
    if (thu == "Thursday") thu = 'Thứ Năm'
    if (thu == 'Friday') thu = 'Thứ Sáu'
    if (thu == 'Saturday') thu = 'Thứ Bảy'
    const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss - DD/MM/YYYY");
    const admin = config.ADMINBOT;
    const NameBot = config.BOTNAME;
    const version = config.version;
    const cmds = global.client.commands;
    const TIDdata = global.data.threadData.get(tid) || {};
    var prefix = TIDdata.PREFIX || global.config.PREFIX;

    // Random icon cho đầy đủ group
    let msg = "", msg1 = "";
    let array = [];
    let i = 0;
    let type = !args[0] ? "" : args[0].toLowerCase();

    // Luôn gửi kèm ảnh đẹp, tải trước
    let imgPath, attachment;
    try {
        imgPath = await downloadImage("https://i.imgur.com/wJQKoTa.jpeg");
        attachment = fs.createReadStream(imgPath);
        setTimeout(() => fs.existsSync(imgPath) && fs.unlinkSync(imgPath), 60 * 1000);
    } catch { attachment = undefined; }

    if (type == "all") {
        for (const cmd of cmds.values()) {
            msg += `🌸 ${++i} | /${cmd.config.name}: ${cmd.config.description}\n\n`;
        }
        return api.sendMessage({body: msg, attachment}, tid, mid);
    }

    if (type) {
        for (const cmd of cmds.values()) array.push(cmd.config.name.toString());
        if (!array.find(n => n == args[0].toLowerCase())) {
            const stringSimilarity = require('string-similarity');
            commandName = args.shift().toLowerCase() || "";
            var allCommandName = [];
            const commandValues = cmds['keys']();
            for (const cmd of commandValues) allCommandName.push(cmd);
            const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
            if (checker.bestMatch.rating >= 0.5) command = global.client.commands.get(checker.bestMatch.target);
            msg = `⚡ Không tìm thấy lệnh: ${type} trong hệ thống\n📌 Lệnh gần giống: ${checker.bestMatch.target}`;
            return api.sendMessage({body: msg, attachment}, tid, mid);
        }
        const cmd = cmds.get(type).config;
        msg = `✏️ Tên lệnh: ${cmd.name}\n🚫 Quyền hạn: ${TextPr(cmd.hasPermssion)}\n📝 Mô tả: ${cmd.description}\n📍 Cách sử dụng: ${cmd.usages}\n🌸 Nhóm lệnh: ${cmd.commandCategory}\n⏱️ Thời gian chờ: ${cmd.cooldowns}s`;
        return api.sendMessage({body: msg, attachment}, tid, mid);
    } else {
        CmdCategory();
        array.sort(S("nameModule"));
        const icons = getRandomIcons(array.length);
        msg1 = `[ MENU CỦA BOT ]\n`;
        let idx = 0;
        for (const cmd of array) {
            msg += `${icons[idx++]} ${cmd.cmdCategory}: ${cmd.nameModule.length} lệnh\n🔎 Gồm: ${cmd.nameModule.join(", ")}\n\n`;
        }
        msg += `🔥 Tổng lệnh: ${global.client.commands.size} | 💧 Tổng events: ${global.client.events.size}\n${prefix}menu all để xem tất cả lệnh\n${prefix}menu + tên lệnh để xem cách sử dụng\n📅 Hôm nay: ${thu}\n⏰ Thời gian: ${timeNow}\nThả ❤️ để xem thông tin về bot`;
        api.sendMessage({body: msg1 + msg, attachment}, tid, (err, info) => {
            global.client.handleReaction.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                meta: { NameBot, version, admin, trinhtrang, prefix, commands, events, timeNow, thu, manufacturer, brand, speed, physicalCores, cores, OSPlatform, pidusage, timeStart, hours, minutes, seconds }
            });
            if (imgPath) setTimeout(() => fs.existsSync(imgPath) && fs.unlinkSync(imgPath), 60000);
        }, mid);
    }

    function CmdCategory() {
        for (const cmd of cmds.values()) {
            const { commandCategory, hasPermssion, name: nameModule } = cmd.config;
            if (!array.find(i => i.cmdCategory == commandCategory)) {
                array.push({
                    cmdCategory: commandCategory,
                    permission: hasPermssion,
                    nameModule: [nameModule]
                });
            } else {
                const find = array.find(i => i.cmdCategory == commandCategory);
                find.nameModule.push(nameModule);
            }
        }
    }
};

module.exports.handleReaction = async ({ event, api, handleReaction, Currencies, Users }) => {
    const { threadID, messageID, userID } = event;
    if (userID != handleReaction.author) return;
    if (event.reaction != "❤") return;
    api.unsendMessage(handleReaction.messageID);

    // Lấy meta truyền vào từ push (không cần gọi lại biến toàn cục)
    const { NameBot, version, admin, trinhtrang, prefix, commands, events, timeNow, thu, manufacturer, brand, speed, physicalCores, cores, OSPlatform, pidusage, timeStart, hours, minutes, seconds } = handleReaction.meta || {};

    let msg = `🤖 Tên bot: ${NameBot}\n📝 Phiên bản: ${version}\n👨‍💻 Tổng admin: ${admin?.length}\n💻 Người điều hành: Cái Hoàng Luân CU TO\n🌐 Facebook: https://www.facebook.com/profile.php?id=1053703548\n\n⏳ Bot online: ${hours} giờ ${minutes} phút ${seconds} giây\n📌 Tình trạng: ${trinhtrang}\n✏️ Dấu lệnh: ${prefix}\n🎒 Lệnh: ${commands?.size}\n📑 Events: ${events?.size}\n🗂️ Tổng: ${(commands?.size||0)+(events?.size||0)}\n🔰 Số nhóm: ${global.data.allThreadID.length}\n👥 Người dùng: ${global.data.allUserID.length}\n\n🧬 CPU: ${manufacturer} ${brand}\n⚙️ Tốc độ: ${speed}GHz\n⚔️ Cores: ${physicalCores}\n🏹 Luồng: ${cores}\n🛡️ HĐH: ${OSPlatform}\n🧪 CPU: ${pidusage?.cpu?.toFixed(1)}%\n🧫 RAM: ${byte2mb(pidusage?.memory)}\n🛠️ Độ trễ: ${Date.now() - (timeStart||Date.now())}ms\n[ ${timeNow} - ${thu} ]`;

    // Lại tải lại ảnh, tránh lỗi
    let imgPath, attachment;
    try {
        imgPath = await downloadImage("https://i.imgur.com/wJQKoTa.jpeg");
        attachment = fs.createReadStream(imgPath);
        setTimeout(() => fs.existsSync(imgPath) && fs.unlinkSync(imgPath), 60 * 1000);
    } catch { attachment = undefined; }

    return api.sendMessage({ body: msg, attachment }, threadID);
};

function S(k) {
    return function (a, b) {
        let i = 0;
        if (a[k].length > b[k].length) i = 1;
        else if (a[k].length < b[k].length) i = -1;
        return i * -1;
    }
}

function TextPr(permission) {
    return permission == 0 ? "Thành viên"
        : permission == 1 ? "Quản trị viên"
        : permission == 2 ? "Admin bot"
        : "Toàn quyền";
}