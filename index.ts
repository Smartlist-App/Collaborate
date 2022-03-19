import express from "express";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import { eventInfo, eventData, createEventData, deleteEventData } from "./EventActions"

const app = express();

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.json())

app.set("trust proxy", 1); // trust first proxy

const server = require("http").createServer(app);
const io = require("socket.io")(server);

const token = "6227ea2c7aabff48117758b7";

interface Event {
    _id: any,
    title: string,
    budget: number,
    datetime: string,
    location: string,
    cost: number,
    private: boolean,
    contact: Object,
    banner: string,
    categories: Array,
    pageStyle: string,
    attributes: Object,
    groupName: string
}

const sessionMiddleware = session({
  secret: "keyboard cat",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true },
});

app.use(sessionMiddleware);

io.use((socket: any, next: any) => sessionMiddleware(socket.request, {}, next));

io.on("connection", (socket: any) => {
  socket.join(token);
  console.log("New user: " + socket.id);
  socket.on("chat-message", (data: any) => {
    io.to(token).emit("chat-message", data);
  });

  socket.on("add-menu", async (data: any) => {
    data.parent = new ObjectId(data.parent);
		data.categories = data.categories.filter(String)
    let res = await createEventData(data, "Food");
    let d = {
      ...data,
      _id: res.insertedId.toString(),
    };
    console.log(d);
    io.to(token).emit("add-menu-res", d);
  });

	socket.on("delete-menu", async (id: string) => {
		try {
	    let res = await deleteEventData(id, "Food");
		} catch (err) {
			console.log(err)
		}
    io.to(token).emit("delete-menu-res", id);
  });

  socket.on("disconnect", () => {
    io.to(token).emit("chat-message", {
      user: {
        name: "Manu",
        email: "manuthecoder@protonmail.com",
        image:
          "https://replit.com/cdn-cgi/image/width=1920,quality=80/https://storage.googleapis.com/replit/images/1615307601188_444d33267b0ab288b076f21da2abafc2.jpeg",
      },
      event: "6227ea2c7aabff48117758b7",
      msg: "Manu has left the event",
      short: true,
    });
  });
});

app.use(async (req, res, next) => {
  if (req.path.startsWith("/events/")) {
    res.render("event-page", {
      event: await eventInfo(req.path.replace("/events/", ""), req),
      layout: false,
    });
  }
  next();
});

app.get(["/", "/pages/event-website"], async (req: any, res: any) => {
  res.render(
    req.path == "/pages/event-website" ? "pages/event-website" : "index",
    {
      event: await eventInfo(token, req),
      layout: false,
    }
  );
});

app.post("/add-attendee", async (req: any, res: any) => {
	console.log(req.body)
	let eventData = await createEventData({
		name: req.body.name,
		email: req.body.email,
		attributes: req.body.attributes,
		phone: req.body.phone,
		parent: new ObjectId(req.body.parent)
	}, "Attendees");
	console.log(eventData);
	res.json([ true ]);
});

app.get("/pages/overview", async (req: any, res: any) => {
  res.render("pages/overview", {
    event: await eventInfo(token, req),
    layout: false,
  });
});

app.get("/pages/menu", async (req: any, res: any) => {
  res.render("pages/menu", {
    data: await eventData(token, "Food"),
    layout: false,
  });
});

app.get("/pages/attendees", async (req: any, res: any) => {
  res.render("pages/attendees", {
    data: await eventData(token, "Attendees"),
    layout: false,
  });
});

app.get("/pages/lists", async (req: any, res: any) => {
  res.render("pages/lists", {
    data: await eventData(token, "Lists"),
    layout: false,
  });
});

app.get("/pages/items", async (req: any, res: any) => {
  res.render("pages/items", {
    data: await eventData(token, "Items"),
    layout: false,
  });
});

	app.get("/pages/outline", async (req: any, res: any) => {
  res.render("pages/outline", {
    data: await eventData(token, "Outline"),
    layout: false,
  });
});

app.use(express.static("src"));

app.get("/js/app.js", (req, res) => {
  res.sendFile(__dirname + "/src/js/app.js");
});

app.get("/dist/build.css", (req, res) => {
  res.sendFile("/home/runner/Events5/dist/output.css");
});

const port = process.env.PORT ?? 443;
server.listen(port, () =>
  console.log({
    message: "Smartlist collaborate is UP",
    product: "Smartlist Collaborate",
    status: "UP",
    timestamp: new Date(),
  })
);
