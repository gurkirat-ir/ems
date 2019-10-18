const express = require("express");
const app = express();
const conf = require("./config");
const path = require("path");
app.all("*", (req, res) => {
  res.sendFile(path.resolve(path.join(__dirname, "maintenance.html")));
});

app.listen(conf.port, () => {
  console.log("Maintenance Mode On");
});
