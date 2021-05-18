import { bloodGroups } from "../../common/constants";

const mongoose = require("mongoose");
export const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    minLEanngth: 3,
    required: true,
  },
  mobile: {
    type: String,
    minLength: 10,
    maxLength: 10,
    required: true,
  },
  age: {
    type: Number,
    minimum: 0,
    requiired: true,
  },
  bloodGroup: {
    type: String,
    enum: bloodGroups,
    required: true,
  },
  password: {
    type: String,
  },
  location: {
    type: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [],
      required: true,
    },
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    locality: {
      type: String,
    },
    district: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      minLength: 6,
      maxLength: 6,
      required: true,
    },
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Transgender"],
  },
});

export const UserModel = mongoose.model("user", UserSchema, "user");
