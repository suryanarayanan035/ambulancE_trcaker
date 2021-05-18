import {
  bloodGroups,
  genders,
  journeyStatus,
  requestStatus,
} from "../../common/constants";

const mongoose = require("mongoose");
export const RequestAndJourneySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  age: {
    type: Number,
    required: true,
    minimum: 0,
  },
  gender: {
    type: String,
    required: true,
    enum: genders,
  },
  bloodGroup: {
    type: String,
    enum: bloodGroups,
  },
  isAccident: {
    type: Boolean,
    required: true,
  },
  additionalInfo: {
    type: String,
  },
  location: {
    type: Object,
    required: true,
  },

  hospital: {
    type: String,
    required: true,
  },
  ambulance: {
    type: String,
    required: true,
  },
  requestedBy: {
    type: String,
    required: true,
  },
  requestStatus: {
    type: String,
    required: true,
    enum: requestStatus,
    default: "Pending",
  },
  journeyStatus: {
    type: String,
    required: true,
    enum: journeyStatus,
    default: "Not Started",
  },
  currentLocation: {
    type: Array,
  },
});

export const RequestAndJourneyModel = mongoose.model(
  "request_and_journey",
  RequestAndJourneySchema,
  "request_and_journey"
);
