const { Schema, model } = require("mongoose");

const OffsetRequestSchema = Schema({
  tokenId: {
    type: Number,
    required: true,
    min: 0,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  VCUs: {
    type: Number,
    default: 0,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  phone: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    default: "created",
  },
  comments: String,
});

module.exports = model("OffsetRequest", OffsetRequestSchema);
