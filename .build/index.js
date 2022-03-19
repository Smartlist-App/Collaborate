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
var import_EventActions = __toModule(require("./EventActions"));
const app = (0, import_express.default)();
app.set("view engine", "ejs");
app.use(import_express_ejs_layouts.default);
app.use(import_express.default.json());
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
  socket.on("chat-message", (data) => {
    io.to(token).emit("chat-message", data);
  });
  socket.on("add-menu", async (data) => {
    data.parent = new ObjectId(data.parent);
    data.categories = data.categories.filter(String);
    let res = await (0, import_EventActions.createEventData)(data, "Food");
    let d = __spreadProps(__spreadValues({}, data), {
      _id: res.insertedId.toString()
    });
    console.log(d);
    io.to(token).emit("add-menu-res", d);
  });
  socket.on("delete-menu", async (id) => {
    try {
      let res = await (0, import_EventActions.deleteEventData)(id, "Food");
    } catch (err) {
      console.log(err);
    }
    io.to(token).emit("delete-menu-res", id);
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
      event: await (0, import_EventActions.eventInfo)(req.path.replace("/events/", ""), req),
      layout: false
    });
  }
  next();
});
app.get(["/", "/pages/event-website"], async (req, res) => {
  res.render(req.path == "/pages/event-website" ? "pages/event-website" : "index", {
    event: await (0, import_EventActions.eventInfo)(token, req),
    layout: false
  });
});
app.post("/add-attendee", async (req, res) => {
  console.log(req.body);
  let eventData2 = await (0, import_EventActions.createEventData)({
    name: req.body.name,
    email: req.body.email,
    attributes: req.body.attributes,
    phone: req.body.phone,
    parent: new ObjectId(req.body.parent)
  }, "Attendees");
  console.log(eventData2);
  res.json([true]);
});
app.get("/pages/overview", async (req, res) => {
  res.render("pages/overview", {
    event: await (0, import_EventActions.eventInfo)(token, req),
    layout: false
  });
});
app.get("/pages/menu", async (req, res) => {
  res.render("pages/menu", {
    data: await (0, import_EventActions.eventData)(token, "Food"),
    layout: false
  });
});
app.get("/pages/attendees", async (req, res) => {
  res.render("pages/attendees", {
    data: await (0, import_EventActions.eventData)(token, "Attendees"),
    layout: false
  });
});
app.get("/pages/lists", async (req, res) => {
  res.render("pages/lists", {
    data: await (0, import_EventActions.eventData)(token, "Lists"),
    layout: false
  });
});
app.get("/pages/items", async (req, res) => {
  res.render("pages/items", {
    data: await (0, import_EventActions.eventData)(token, "Items"),
    layout: false
  });
});
app.get("/pages/outline", async (req, res) => {
  res.render("pages/outline", {
    data: await (0, import_EventActions.eventData)(token, "Outline"),
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
