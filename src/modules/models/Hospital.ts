import { types } from "../../common/constants";

const mongoose = require("mongoose");
export const HospitalSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  mobile: {
    type: String,
    minLength: 10,
    maxLength: 10,
    required: true,
  },
  password: {
    type: String,
    required: true,
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
  type: {
    type: String,
    enum: types,
  },
});

export const HospitalModel = mongoose.model(
  "hospital",
  HospitalSchema,
  "hospital"
);
