const { Schema, model } = require("mongoose");

let UserSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String },
  role: { type: String, enum: ["hr", "employee", "employer"] },
  name: String,
  projAssigned: [{ type: Schema.Types.ObjectId, ref: "Project" }]
});

module.exports = model("User", UserSchema);
