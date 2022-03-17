var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var import_express = __toModule(require("express"));
var import_express_session = __toModule(require("express-session"));
var import_express_ejs_layouts = __toModule(require("express-ejs-layouts"));
var import_mongodb = __toModule(require("mongodb"));
const DATABASE_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@smartlist-events.4zcyg.mongodb.net/Smartlist-Events?retryWrites=true&w=majority`;
function eventInfo(id, req) {
  return new Promise((resolve, reject) => {
    if (id.length !== 24) {
      resolve(false);
      return;
    }
    if (req.session.eventCache) {
      resolve(req.session.eventCache);
      return;
    }
    import_mongodb.MongoClient.connect(DATABASE_URL, (err, db) => {
      if (err)
        throw err;
      let dbo = db.db("Events");
      let query = { _id: new import_mongodb.ObjectId(id) };
      dbo.collection("EventList").find(query).toArray((err2, result) => {
        if (err2)
          throw err2;
        result = result[0];
        req.session.eventCache = result;
        resolve(result);
        db.close();
      });
    });
  });
}
function eventData(parent, table) {
  return new Promise((resolve, reject) => {
    import_mongodb.MongoClient.connect(DATABASE_URL, (err, db) => {
      if (err)
        throw err;
      let dbo = db.db("Events");
      let query = { parent: new import_mongodb.ObjectId(parent) };
      dbo.collection(table).find(query).toArray((err2, result) => {
        if (err2)
          throw err2;
        resolve(result);
        db.close();
      });
    });
  });
}
function createEventData(data2, table) {
  return new Promise((resolve, reject) => {
    import_mongodb.MongoClient.connect(DATABASE_URL, (err, db) => {
      if (err)
        throw err;
      var dbo = db.db("Events");
      dbo.collection(table).insertOne(data2, (err2, res) => {
        if (err2)
          throw err2;
        resolve(res);
        db.close();
      });
    });
  });
}
function deleteEventData(id, table) {
  return new Promise((reject, resolve) => {
    import_mongodb.MongoClient.connect(DATABASE_URL, function(err, db) {
      if (err)
        throw err;
      let dbo = db.db("mydb");
      let query = { id: new import_mongodb.ObjectId(id) };
      dbo.collection("customers").deleteOne(query, (err2, obj) => {
        if (err2)
          throw err2;
        resolve("1 document deleted");
        db.close();
      });
    });
  });
}
const app = (0, import_express.default)();
app.set("view engine", "ejs");
app.use(import_express_ejs_layouts.default);
app.set("trust proxy", 1);
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const token = "6227ea2c7aabff48117758b7";
const sessionMiddleware = (0, import_express_session.default)({
  secret: "keyboard cat",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
});
app.use(sessionMiddleware);
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));
io.on("connection", (socket) => {
  socket.join(token);
  console.log("New user: " + socket.id);
  socket.on("chat-message", (data2) => {
    io.to(token).emit("chat-message", data2);
  });
  socket.on("add-menu", async (data2) => {
    data2.parent = new import_mongodb.ObjectId(data2.parent);
    data2.categories = data2.categories.filter(String);
    let res = await createEventData(data2, "Food");
    let d2 = __spreadProps(__spreadValues({}, data2), {
      _id: res.insertedId.toString()
    });
    console.log(d2);
    io.to(token).emit("add-menu-res", d2);
  });
  socket.on("delete-menu", async (id) => {
    data.parent = new import_mongodb.ObjectId(data.parent);
    data.categories = data.categories.filter(String);
    let res = await deleteEventData(id, "Food");
    io.to(token).emit("delete-menu-res", d);
  });
  socket.on("disconnect", () => {
    io.to(token).emit("chat-message", {
      user: {
        name: "Manu",
        email: "manuthecoder@protonmail.com",
        image: "https://replit.com/cdn-cgi/image/width=1920,quality=80/https://storage.googleapis.com/replit/images/1615307601188_444d33267b0ab288b076f21da2abafc2.jpeg"
      },
      event: "6227ea2c7aabff48117758b7",
      msg: "Manu has left the event",
      short: true
    });
  });
});
app.use(async (req, res, next) => {
  if (req.path.startsWith("/events/")) {
    res.render("event-page", {
      event: await eventInfo(req.path.replace("/events/", ""), req),
      layout: false
    });
  }
  next();
});
app.get(["/", "/pages/event-website"], async (req, res) => {
  res.render(req.path == "/pages/event-website" ? "pages/event-website" : "index", {
    event: await eventInfo(token, req),
    layout: false
  });
});
app.get("/pages/overview", async (req, res) => {
  res.render("pages/overview", {
    event: await eventInfo(token, req),
    layout: false
  });
});
app.get("/pages/menu", async (req, res) => {
  res.render("pages/menu", {
    data: await eventData(token, "Food"),
    layout: false
  });
});
app.get("/pages/attendees", async (req, res) => {
  res.render("pages/attendees", {
    data: await eventData(token, "Attendees"),
    layout: false
  });
});
app.use(import_express.default.static("src"));
app.get("/js/app.js", (req, res) => {
  res.sendFile(__dirname + "/src/js/app.js");
});
app.get("/dist/build.css", (req, res) => {
  res.sendFile("/home/runner/Events5/dist/output.css");
});
const port = process.env.PORT ?? 443;
server.listen(port, () => console.log({
  message: "Smartlist collaborate is UP",
  product: "Smartlist Collaborate",
  status: "UP",
  timestamp: new Date()
}));
//# sourceMappingURL=index.js.map
