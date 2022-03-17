import express from "express";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const DATABASE_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@smartlist-events.4zcyg.mongodb.net/Smartlist-Events?retryWrites=true&w=majority`;

function eventInfo(id: string, req): Promise<Array> {
  return new Promise((resolve, reject) => {
    if (id.length !== 24) {
      resolve(false);
      return;
    }
    if (req.session.eventCache) {
      resolve(req.session.eventCache);
      return;
    }
    MongoClient.connect(DATABASE_URL, (err, db: any) => {
      if (err) throw err;
      let dbo = db.db("Events");
      let query = { _id: new ObjectId(id) };
      dbo
        .collection("EventList")
        .find(query)
        .toArray((err: any, result: any) => {
          if (err) throw err;
          result = result[0];
          req.session.eventCache = result;
          resolve(result);
          db.close();
        });
    });
  });
}
function eventData(parent: string, table: string): Promise<Array> {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DATABASE_URL, (err, db: any) => {
      if (err) throw err;
      let dbo = db.db("Events");
      let query = { parent: new ObjectId(parent) };
      dbo
        .collection(table)
        .find(query)
        .toArray((err: any, result: any) => {
          if (err) throw err;
          resolve(result);
          db.close();
        });
    });
  });
}

function createEventData(data: Object, table: string): Promise<string> {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DATABASE_URL, (err, db: any) => {
      if (err) throw err;
      var dbo = db.db("Events");
      dbo.collection(table).insertOne(data, (err: any, res: any) => {
        if (err) throw err;
        resolve(res);
        db.close();
      });
    });
  });
}

function deleteEventData(id: string, table: string): Promise<string> {
	return new Promise((reject, resolve) => {
		MongoClient.connect(DATABASE_URL, (err, db) => {
		  if (err) throw err;
		  let dbo = db.db("Events")
		  let query = { _id: new ObjectId(id) }
		  dbo.collection(table).deleteOne(query, (err, obj) => {
		    if (err) throw err;
				resolve("1 document deleted")
		    db.close()
		  });
		});	
	})
}

const app = express();

app.set("view engine", "ejs");
app.use(expressLayouts);

app.set("trust proxy", 1); // trust first proxy

const server = require("http").createServer(app);
const io = require("socket.io")(server);

const token = "6227ea2c7aabff48117758b7";

interface Event {
  title: string;
  short_description: string;
  description: string;
  budget: number;
  datetime: "2022-03-11T19:44:58.419Z";
  location: "Discord";
  cost: 10;
  private: false;
  contact?: {
    email?: string;
    twitter?: string;
    discord?: string;
    github?: string;
  };
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
