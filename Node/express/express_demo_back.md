1.app.js
let express = require("express");
let path = require('path');
let bodyParser = require("body-parser");
let cors = require("cors");
let session = require("express-session");
var multer = require('multer');
var upload = multer({ dest: path.resolve(__dirname, 'public') });
let MongoStore = require('connect-mongo')(session);
let { dbUrl } = require('./settings');
let { md5 } = require('./utils');
let { UserModel, SliderModel, LessonModel } = require('./db');
let app = express();
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:8081"],
    credentials: true,
    allowedHeaders: "Content-Type,x-requested-with",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  })
);
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(
  session({
    secret: "zhufeng",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      url: dbUrl,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    })
  })
);
app.post('/uploadAvatar', upload.single('avatar'), async function (req, res, next) {
  let { userId } = req.body;
  let avatar = `${req.protocol}://${req.headers.host}/${req.file.filename}`;
  await UserModel.updateOne({ _id: userId }, { avatar });
  setTimeout(() => {
    res.send({ code: 0, data: avatar });
  }, 3000);
})
app.post('/register', async (req, res) => {
  let user = req.body;//username password email phone avatar
  user.avatar = `https://secure.gravatar.com/avatar/${md5(user.email)}?s=48`;
  user = await UserModel.create(user);
  req.session.user = user;
  res.json({ code: 0, user });
});

app.post('/login', async (req, res) => {
  let user = await UserModel.findOne(req.body);
  if (user) {
    req.session.user = user;
    res.json({ code: 0, data: user });
  } else {
    res.json({ code: 1, error: '用户未登录' });
  }
});
app.get("/validate", (req, res) => {
  let user = req.session.user;
  if (user) {
    res.json({ code: 0, data: user });
  } else {
    res.json({ code: 1, error: '当前用户未登录' });
  }
});
app.get("/logout", (req, res) => {
  req.session.user = null;
  res.json({ code: 0, data: "退出登录成功" });
});

app.get('/sliders', async function (req, res) {
  let sliders = await SliderModel.find();
  res.json({ code: 0, data: sliders });
});
app.get('/getlesson', async function (req, res) {
  let { id } = req.query;
  let lessons = await LessonModel.findById(id);
  res.json({ code: 0, data: lessons });
});
// http://getLessons/vue?offset=0&limit=5
app.get('/getLessons/:category', async function (req, res) {
  let category = req.params.category;
  let { offset, limit } = req.query;
  offset = isNaN(offset) ? 0 : parseInt(offset);//偏移量 
  limit = isNaN(limit) ? 5 : parseInt(limit); //每页条数
  let query = {};
  if (category && category != 'all')
    query.category = category;
  let total = await LessonModel.count(query);
  let list = await LessonModel.find(query).sort({ order: 1 }).skip(offset).limit(limit);
  setTimeout(function () {
    console.log({ list, hasMore: total > offset + limit });
    res.json({ code: 0, data: { list, hasMore: total > offset + limit } });
  }, 1000);
});
app.listen(8000);
2. settings.js
server\settings.js

module.exports = {
  cookieSecret: 'zhufeng',// 用于 Cookie 加密与数据库无关
  dbUrl: "mongodb://127.0.0.1:27017/zhufengketang"
}
3. utils.js
server\utils.js

function md5(val) {
  return require('crypto').createHash('md5').update(val).digest('hex');
}
module.exports = {
  md5
}
4. db\index.js
server\db\index.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const { dbUrl } = require('../settings');
const conn = mongoose.createConnection(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const UserModel = conn.model('User', new Schema({
  username: { type: String, required: true },//用户名
  password: { type: String, required: true },//密码
  email: { type: String, required: true },//邮箱
  phone: { type: String, required: true },//手机号
  avatar: { type: String, required: true }//头像
}));
const SliderModel = conn.model('Slider', new Schema({
  url: String
}));
const LessonModel = conn.model('Lesson', new Schema({
  order: Number,//顺序
  title: String,//标题
  video: String,//视频
  poster: String, //海报
  url: String,//url地址
  price: String,//价格
  category: String,//分类
}));

module.exports = {
  UserModel,
  SliderModel,
  LessonModel
}

  ; (async function () {
    let sliderList = await SliderModel.find();
    if (sliderList.length == 0) {
      SliderModel.create([
        { url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/reactnative.png' },
        { url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png' },
        { url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png' },
        { url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/wechat.png' },
        { url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/architect.jpg' }
      ]);
    }
    let lessonList = await LessonModel.find();
    if (lessonList.length == 0) {
      LessonModel.create([
        {
          order: 1,
          title: '1.React全栈架构',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥100.00元',
          category: 'react'
        },
        {
          order: 2,
          title: '2.React全栈架构',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥200.00元',
          category: 'react'
        },
        {
          order: 3,
          title: '3.React全栈架构',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥300.00元',
          category: 'react'
        },
        {
          order: 4,
          title: '4.React全栈架构',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥400.00元',
          category: 'react'
        },
        {
          order: 5,
          title: '5.React全栈架构',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥500.00元',
          category: 'react'
        },
        {
          order: 6,
          title: '6.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥100.00元',
          category: 'vue'
        },
        {
          order: 7,
          title: '7.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥200.00元',
          category: 'vue'
        },
        {
          order: 8,
          title: '8.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥300.00元',
          category: 'vue'
        },
        {
          order: 9,
          title: '9.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥400.00元',
          category: 'vue'
        },
        {
          order: 10,
          title: '10.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥500.00元',
          category: 'vue'
        },
        {
          order: 11,
          title: '11.React全栈架构',
          "video": "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥600.00元',
          category: 'react'
        },
        {
          order: 12,
          title: '12.React全栈架构',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥700.00元',
          category: 'react'
        },
        {
          order: 13,
          title: '13.React全栈架构',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥800.00元',
          category: 'react'
        },
        {
          order: 14,
          title: '14.React全栈架构',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥900.00元',
          category: 'react'
        },
        {
          order: 15,
          title: '15.React全栈架构',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/react/img/react.jpg",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/react.png',
          price: '¥1000.00元',
          category: 'react'
        },
        {
          order: 16,
          title: '16.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥600.00元',
          category: 'vue'
        },
        {
          order: 17,
          title: '17.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥700.00元',
          category: 'vue'
        },
        {
          order: 18,
          title: '18.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥800.00元',
          category: 'vue'
        },
        {
          order: 19,
          title: '19.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥900.00元',
          category: 'vue'
        },
        {
          order: 20,
          title: '20.Vue从入门到项目实战',
          video: "http://img.zhufengpeixun.cn/gee2.mp4",
          poster: "http://www.zhufengpeixun.cn/vue/img/vue.png",
          url: 'http://www.zhufengpeixun.cn/themes/jianmo2/images/vue.png',
          price: '¥1000.00元',
          category: 'vue'
        }
      ]);
    }
  })();