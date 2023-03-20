const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const webAppUrl  = 'https://sage-zabaione-378b67.netlify.app';
const bot = new TelegramBot(process.env.ACCSHOP_TOKEN, {polling: true});

const app = express();

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
  const {queryId, accounts, totalPrice} = request.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'успех',
      input_message_content: {
        message_text: 'Поздравляю вы приобрели товар на сумму: ' + totalPrice
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

app.listen(process.env.PORT, ()=> {
  console.log('server started on PORT ' + process.env.PORT);
});

