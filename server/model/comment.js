const { Schema, model } = require("mongoose");

const CommentSchema = new Schema({
  who: { type: Schema.Types.ObjectId, ref: "User" },
  when: { type: Date, default: Date.now() },
  what: String,
  task: { type: Schema.Types.ObjectId, ref: "Task" }
});

module.exports = model("Comment", CommentSchema);
