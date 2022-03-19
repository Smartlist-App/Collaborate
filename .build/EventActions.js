var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
__export(exports, {
  createEventData: () => createEventData,
  deleteEventData: () => deleteEventData,
  eventData: () => eventData,
  eventInfo: () => eventInfo
});
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
function createEventData(data, table) {
  return new Promise((resolve, reject) => {
    import_mongodb.MongoClient.connect(DATABASE_URL, (err, db) => {
      if (err)
        throw err;
      var dbo = db.db("Events");
      dbo.collection(table).insertOne(data, (err2, res) => {
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
    import_mongodb.MongoClient.connect(DATABASE_URL, (err, db) => {
      if (err)
        throw err;
      let dbo = db.db("Events");
      let query = { _id: new import_mongodb.ObjectId(id) };
      dbo.collection(table).deleteOne(query, (err2, obj) => {
        if (err2)
          throw err2;
        resolve("1 document deleted");
        db.close();
      });
    });
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createEventData,
  deleteEventData,
  eventData,
  eventInfo
});
//# sourceMappingURL=EventActions.js.map
