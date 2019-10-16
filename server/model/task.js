const { Schema, model } = require("mongoose");

const TaskSchema = new Schema({
  title: String,
  project: { type: Schema.Types.ObjectId, ref: "Project" },
  empAssigned: { type: Schema.Types.ObjectId, ref: "User" },
  createdOn: { type: Date, default: Date.now() },
  timeTaken: Date,
  deadline: Date,
  description: String,
  completedOn: Date,
  status: {
    type: String,
    enum: ["PENDING", "ON HOLD", "COMPLETED"],
    default: "PENDING"
  },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

module.exports = model("Task", TaskSchema);
