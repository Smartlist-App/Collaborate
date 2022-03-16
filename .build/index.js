var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
function eventData(parent, req, table) {
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
function createEventData(data, req, table) {
  return new Promise((resolve, reject) => {
    import_mongodb.MongoClient.connect(DATABASE_URL, function(err, db) {
      if (err)
        throw err;
      var dbo = db.db("Events");
      dbo.collection(table).insertOne(data, (err2, res) => {
        if (err2)
          throw err2;
        resolve("1 document inserted");
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
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
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
    data: await eventData(token, req, "Food"),
    layout: false
  });
});
app.get("/pages/attendees", async (req, res) => {
  res.render("pages/attendees", {
    data: await eventData(token, req, "Attendees"),
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
server.listen(port, () => console.log("server listening on port " + port));
//# sourceMappingURL=index.js.map
