const mongoose = require("mongoose");
export const AmbulanceSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  driverName: {
    type: String,
    minLength: 3,
    required: true,
  },
  driverMobile: {
    type: String,
    minLength: 10,
    maxLength: 10,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  vehicleNo: {
    type: String,
    required: true,
  },
  hospital: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
  },
});

export const AmbulanceModel = mongoose.model(
  "ambulance",
  AmbulanceSchema,
  "ambulance"
);
