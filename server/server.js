const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");
const { randomBytes } = require("crypto");
const path = require("path");
const fs = require("fs");
const conf = require("../config");

// creating app
const app = express();

// configuring mongoose
mongoose.Promise = require("bluebird");
(async () => {
  try {
    mongoose.connect(conf.db.uri(), {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to DB");
  } catch (error) {
    console.warn(error);
    process.exit(1);
  }
})();

// configuring express app
app.use(express.json());
app.use(express.static("dist"));
app.use(
  morgan("combined", {
    stream: fs.createWriteStream("access.log", { flags: "a" })
  })
);
app.use(
  process.env.NODE_ENV == "development" ? morgan("dev") : morgan("combined")
);
app.use(
  session({
    name: "EMS",
    secret: randomBytes(30).toString(),
    resave: false,
    saveUninitialized: true,
    store: new FileStore({
      secret: randomBytes(30).toString(),
      path: "_sessions",
      fileExtension: ".txt"
    })
  })
);
app.use(
  cors({
    origin: "http://ems.4iresearch.com/",
    credentials: true,
    methods: ["GET", "DELETE", "PUT", "POST"]
  })
);
app.use(helmet.hidePoweredBy({ setTo: "4 IR Web Sever Gateway" }));
app.use(helmet.frameguard());
app.use(helmet.xssFilter());
// making models
require("./model/comment");
require("./model/project");
require("./model/task");
require("./model/user");

// adding routers
app.use("/api/user", require("./routes/user"));
app.use("/api/task", require("./routes/task"));
app.use("/api/project", require("./routes/project"));
app.use("/api/comment", require("./routes/comment"));

app.use("*", (_req, res) => {
  res.sendFile(path.resolve(path.join("../dist", "index.html")));
});

// listening to the server
let port = parseInt(conf.port);
app.listen(port, () => {
  console.log("HTTP listening on %d", port);
});
