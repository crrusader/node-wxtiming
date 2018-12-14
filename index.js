const Wechat = require('wechat4u');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const CronJob = require('cron').CronJob;

let bot;
let username;
let USERNAME = '文件传输助手';
// 尝试获取本地登录数据，免扫码
try {
    bot = new Wechat(require('./sync-data.json'));
} catch (e) {
    bot = new Wechat();
}

if (bot.PROP.uin) {
    bot.restart();
} else {
    bot.start();
}

// 生成二维码
bot.on('uuid', uuid => {
    qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
        small: true
    });
    console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid);
});

// 登录成功
bot.on('login', () => {
    console.log('登录成功');
    fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData));
});

// 登出成功
bot.on('logout', () => {
    console.log('登出成功');
    fs.unlinkSync('./sync-data.json');
});

bot.on('contacts-updated', contacts => {
    if (!username) {
        // console.log('联系人数量: ', Object.keys(bot.contacts).length,bot.Contact);
        if (bot.Contact.getSearchUser(USERNAME).length) {
            username = bot.Contact.getSearchUser(USERNAME)[0].UserName;
            console.log('获取目标用户成功: ', username);
        }
    }
});

// CronJon 时间节点 （秒，分，时，天，月，年）
/**
 * <*>为默认任何时间，及every
 */

new CronJob('00 39 17 * * *', function () {
    if (username) {
        bot.sendMsg('嘻嘻嘻', username)
            .catch(err => {
                bot.emit('send error', err);
            });
    }
}, null, true, 'Asia/Shanghai');

new CronJob('00 00 00 * * *', function () {
    if (username) {
        bot.sendMsg('12点了', username)
            .catch(err => {
                bot.emit('send error', err);
            });
    }
}, null, true, 'Asia/Shanghai');