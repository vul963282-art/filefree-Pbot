const urls = require('./../../pdata/data_dongdev/datajson/vdgai.json');
const axios = require('axios');
const fs = require('fs');

class Command {
  constructor(options) {
    this.config = options;
    global.client = global.client || {};
    global.client.xx = global.client.xx || null;
    global.vdgai_attachments = [];
  }

  async onLoad(api) {
    let isLoading = false;

    if (!global.client.xx) {
      global.client.xx = setInterval(async () => {
        if (isLoading === true || global.vdgai_attachments.length > 5) return;
        isLoading = true;

        // Tải ngẫu nhiên 5 video trong danh sách
        try {
          const attachments = await Promise.all(
            [...Array(5)].map(() => downloadAndUpload(urls[Math.floor(Math.random() * urls.length)]))
          );
          console.log(attachments);
          global.vdgai_attachments.splice(0, global.vdgai_attachments.length, ...attachments);
        } catch (e) {
          // Xử lý lỗi nếu cần
        }
        isLoading = false;
      }, 1000 * 25); // 25 giây
    }


    async function downloadFile(url, ext) {
      // Tải file về dạng arraybuffer
      const resp = await axios.get(url, { responseType: 'arraybuffer' });
      const path = __dirname + `/cache/${Date.now()}.${ext}`;
      fs.writeFileSync(path, resp.data);
      // Xóa sau 1 phút
      setTimeout(fs.unlinkSync, 60 * 1000, path);
      return fs.createReadStream(path);
    }

    async function downloadAndUpload(url) {
      // Upload file lên facebook và trả về metadata
      const res = await api.httpPostFormData('https://upload.facebook.com/ajax/mercury/upload.php', {
        'upload_1024': await downloadFile(url, 'mp4')
      });
      // Lấy attachment từ kết quả trả về
      const result = Object.entries(JSON.parse(res.replace('for (;;);', '')).payload?.metadata?.[0] || {})[0];
      return result;
    }
  }

  async run({ api, event }) {
    // Gửi random 1 video trong danh sách đã tải lên facebook
    const send = (msg, attachment) => api.sendMessage(msg, event.threadID, attachment, event.messageID);
    console.log(global.vdgai_attachments);
    send('ok', global.vdgai_attachments.slice(0, 1));
  }
}

module.exports = new Command({
  name: 'vdgai',
  version: '0.0.1',
  hasPermssion: 0,
  credits: 'DC-Nam',
  description: '',
  commandCategory: 'Tiện ích',
  usages: '[]',
  cooldowns: 8
});