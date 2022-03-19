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

export { eventInfo, eventData, createEventData, deleteEventData }
