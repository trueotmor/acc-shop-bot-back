const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const {MongoClient} = require('mongodb');

const TelegramBot = require('node-telegram-bot-api');
const webAppUrl  = 'https://sage-zabaione-378b67.netlify.app';
const bot = new TelegramBot(process.env.ACCSHOP_TOKEN, {polling: true});

const client = new MongoClient(process.env.DB_URL);

const start = async () => {
  try {
    await client.connect();
    console.log('соединение установлено');
    await client.db().createCollection('accounts');
    const accounts = client.db().collection('accounts');

    accounts.insertOne({
      "username": "lett",
      "userid": "1231234",
      "account": {
        "level": "80",
        "heroes": [
          "ashlin",
          "gubeg",
          "alisa"
        ]
      }
    })

    const user = await accounts.findOne({name: 'lett'});
    console.log("пользователь: " + user);
    
  } catch (error) {
    console.log(error);
  }
}

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Привет!', {
        reply_markup: {
            keyboard: [
              [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
            ]
        }
    });

    await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
      reply_markup: {
          inline_keyboard: [
              [{text: 'Сделать заказы', web_app: {url: webAppUrl}}]
          ]
      }
    })
  }

  if(msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      await bot.sendMessage(chatId,'Спасибо за обратную связь');
      await bot.sendMessage(chatId,'Ваша страна: ' + data?.country);
      await bot.sendMessage(chatId,'Ваша улица: ' + data?.street);

      setTimeout(async ()=>{
        await bot.sendMessage(chatId,'Всю информацию вы получите в этом чате')
      }, 1500)
    } catch (e){
      console.log(e);
    }
  }
});

app.post ('/web-data', async (request)=>{
  const {queryId, accounts = [], totalPrice} = request.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'успех',
      input_message_content: {
        message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${accounts.map(item => item.title).join(', ')}`
      }
    })
    return res.status(200).JSON({});    
  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'не успех',
      input_message_content: {
        message_text: 'не удалось приобрести товар'
      }
    })
    return res.status(500).JSON({});    
  }

  
})

start();

app.listen(process.env.PORT, ()=> {
  console.log('server started on PORT ' + process.env.PORT);
});

