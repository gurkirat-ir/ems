const mongoose = require("mongoose");
const uri = require("./config").db.uri();
const User = require("./server/model/user");
const { createHash } = require("crypto");
mongoose.Promise = require("bluebird");
(async () => {
  try {
    mongoose.connect(uri, {
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

let args = process.argv.splice(2);
if (args.length < 3) {
  console.warn("usage: init.js  <name> <email> <password>");
  process.exit(1);
}

var name = args[0];
var email = args[1];
var password = createHash("sha256")
  .update(args[2])
  .digest("base64");
var role = "hr";

(async () => {
  await User.db.dropDatabase();
  console.log("[!] DB Dropped");
  new User({ name, email, password, role }).save();
  console.log("[!] Created HR");
  console.log("[!] Login Creds %s:%s", email, args[2]);
})();
