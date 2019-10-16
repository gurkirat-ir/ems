const { Schema, model } = require("mongoose");

let ProjectSchema = new Schema({
  title: String,
  description: String,
  deadline: Date,
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  empAssigned: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdOn: { type: Date, default: Date.now() },
  status: {
    type: String,
    enum: ["PENDING", "ON HOLD", "COMPLETED"],
    default: "PENDING"
  }
});

module.exports = model("Project", ProjectSchema);
