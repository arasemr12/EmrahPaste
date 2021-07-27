const express = require("express");
const expresslayouts = require("express-ejs-layouts");
const generator = require("generate-password");
const moment = require("moment");
const { JsonDatabase } = require("wio.db");
const veridb = new JsonDatabase({
  databasePath: "./databases/myJsonDatabase.json"
});
const Discord = require("discord.js");
const client = new Discord.Client();
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const rateLimit = require("express-rate-limit");
require('dotenv').config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30
});

app.use('/api/', limiter);

app.use(expresslayouts);
app.set("layout", "./layouts/main");

app.set("trust proxy", true);

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let online_user_count = 0;

client.on("ready", () => {
  server.listen(process.env.PORT || 3000, () => {
    console.log(`Your app is listening on 3000`);
  });
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`0 Kişi!`, { type: "WATCHING" });
});

io.on("connection", socket => {
  online_user_count++;
  client.user.setActivity(`${online_user_count} Kişi!`, { type: "WATCHING" });
  socket.on("disconnect", () => {
    online_user_count--;
    client.user.setActivity(`${online_user_count} Kişi!`, {
      type: "WATCHING"
    });
  });
});

app.get("/", (req, res) => {
  res.render("index", { title: `EmrahPaste - Home`, req });
});

app.get("/api", (req, res) => {
  res.render("api", { title: `EmrahPaste - Api`, req });
});

app.get("/contact", (req, res) => {
  res.render("contact", { title: `EmrahPaste - ${req.originalUrl}`, req });
});

app.post("/contact", (req, res) => {
  const { email, mesaj } = req.body;
  let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (email && mesaj) {
    const embed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("İletişim")
      .setAuthor(ip)
      .setDescription(
        `Yeni bir iletişim desteği: \nemail: ${email} \nmesaj: ${mesaj}`
      )
      .setTimestamp()
      .setFooter("<EmrahPaste/>");

    client.channels.cache.get(process.env.LOG_ID).send(embed);
    res.render("contact", { title: `EmrahPaste - Contact`, mesaj: `Mesaj gönderildi!`, req });
  }
});

app.get("/:id", (req, res) => {
  const { id } = req.params;
  res.redirect(`/paste/${id}`);
});

app.get("/paste/:id", (req, res) => {
  const { id } = req.params;
  if (veridb.has(id)) {
    res.render("paste", {
      veri: veridb.get(id),
      title: `EmrahPaste - /${id}`,
      req
    });
  } else {
    res.status(404).render("error", {
      err: "Can't find " + req.originalUrl,
      title: `EmrahPaste - /${id}`,
      req
    });
  }
});

app.get('/api/get/:id', (req,res) => {
  const {id} = req.params;
  if(id){
    if (veridb.has(id)) {
      const paste = veridb.get(id);
      res.json({
        veri: paste.veri,
        id: paste.id,
        tarih: paste.tarih
      })
    }else{
      res.status(404).json({
        code: '404',
        message: 'Not found.'
      })
    }
  }else{
    res.send('require id');
}})

app.post('/api/post', (req,res) => {
  let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const {paste} = req.body;
  if(paste){
    var password = generator.generate({
      length: 12,
      numbers: true
    });
    function kontrol(password) {
      if (veridb.has(password)) {
        password = generator.generate({
          length: 12,
          numbers: true
        });
        if (veridb.has(password)) {
          kontrol(password);
        } else {
          const embed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(password)
            .setURL(`https://emrahpaste.glitch.me/${password}`)
            .setAuthor(ip)
            .setDescription("Yeni bir veri!")
            .setTimestamp()
            .setFooter("<EmrahPaste/>");

          client.channels.cache.get(process.env.LOG_ID).send(embed);
          veridb.set(`${password}`, {
            veri: paste,
            ip: ip,
            id: password,
            tarih: moment().format()
          });
        }
      } else {
        const embed = new Discord.MessageEmbed()
          .setColor("#0099ff")
          .setTitle(password)
          .setURL(`https://emrahpaste.glitch.me/${password}`)
          .setAuthor(ip)
          .setDescription("Yeni bir veri!")
          .setTimestamp()
          .setFooter("<EmrahPaste/>");

        client.channels.cache.get(process.env.LOG_ID).send(embed);
        veridb.set(`${password}`, {
          veri: paste,
          ip: ip,
          id: password,
          tarih: moment().format()
        });
      }
    }
    kontrol(password);
    res.json({
      id: password,
      paste: paste
    })
  }else{
    res.send('require paste');
}})

app.post("/paste/new", (req, res) => {
  let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const { content } = req.body;
  if (content) {
    var password = generator.generate({
      length: 12,
      numbers: true
    });
    function kontrol(password) {
      if (veridb.has(password)) {
        password = generator.generate({
          length: 12,
          numbers: true
        });
        if (veridb.has(password)) {
          kontrol(password);
        } else {
          const embed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(password)
            .setURL(`https://emrahpaste.glitch.me/${password}`)
            .setAuthor(ip)
            .setDescription("Yeni bir veri!")
            .setTimestamp()
            .setFooter("<EmrahPaste/>");

          client.channels.cache.get(process.env.LOG_ID).send(embed);
          veridb.set(`${password}`, {
            veri: content,
            ip: ip,
            id: password,
            tarih: moment().format()
          });
        }
      } else {
        const embed = new Discord.MessageEmbed()
          .setColor("#0099ff")
          .setTitle(password)
          .setURL(`https://emrahpaste.glitch.me/${password}`)
          .setAuthor(ip)
          .setDescription("Yeni bir veri!")
          .setTimestamp()
          .setFooter("<EmrahPaste/>");

        client.channels.cache.get(process.env.LOG_ID).send(embed);
        veridb.set(`${password}`, {
          veri: content,
          ip: ip,
          id: password,
          tarih: moment().format()
        });
      }
    }
    kontrol(password);
    res.redirect(`/${password}`);
  } else {
    res.send("required content");
  }
});

app.use(function (req, res, next) {
  res.status(404).render("error", {
    req: req,
    err: "Can't find " + req.originalUrl,
    title: "Emrah Paste - Not found!"
  });
});

client.login(process.env.TOKEN);
