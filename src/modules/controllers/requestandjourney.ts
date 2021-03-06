const mongoose = require("mongoose");
import { Mongoose } from "mongoose";
import { HospitalModel } from "../models/Hospital";
import { RequestAndJourneyModel } from "../models/RequestAndJourney";
import {
  changeAmbulanceAvailability,
  checkIfAmbulanceExists,
} from "./ambulance";

export const saveRequestAndJourney = async (requestAndJourney) => {
  try {
    const model = new RequestAndJourneyModel({
      ...requestAndJourney,
      currentLocation: [{ ...requestAndJourney.location }],
    });
    const response = await model.save();
    console.log(`Response of savig requestandjoureny details: ${response}`);
    return {
      hasError: false,
      requestId: response._id,
    };
  } catch (error) {
    console.log(`Error occured while saving RequestAndJourneyData ${error}`);
    return {
      hasError: true,
    };
  }
};

export const listAllPendingRequestsByHospital = async (hospitalId) => {
  try {
    const response = await RequestAndJourneyModel.find({
      hospital: hospitalId,
      requestStatus: "Pending",
    }).select("_id isAccident age");
    if (!response) {
      return {
        hasRequests: false,
      };
    }

    return {
      hasRequests: true,
      requests: response,
    };
  } catch (error) {
    console.log(
      "Error occured while listing pending requests  by hospital ",
      error
    );
    return {
      hasRequest: false,
    };
  }
};

export const getRequestDetails = async (requestId) => {
  try {
    const request = await RequestAndJourneyModel.findById({
      _id: mongoose.Types.ObjectId(requestId),
    }).select(
      "name age mobile gender isAccident bloodGroup requestedBy  ambulance location "
    );
    console.log("Request details rsponse", request);
    if (!request) {
      return {
        isRequestFound: false,
      };
    }
    return {
      isRequestFound: true,
      request,
    };
  } catch (error) {
    console.log("error occured while retrieving request details", error);
    return {
      isRequestFound: false,
    };
  }
};

export const updateRequestStatus = async (requestDetails) => {
  try {
    const { requestId, requestStatus } = requestDetails;
    let currentLocation = null;
    if (requestStatus == "Accepted") {
      const { hasError, location } = await getInitialCurrentLocation(requestId);
      if (hasError) {
        return {
          isUpdated: false,
        };
      }
      currentLocation = location;
    }
    const isUpdated = await RequestAndJourneyModel.updateOne(
      {
        _id: mongoose.Types.ObjectId(requestId),
        requestStatus: { $nin: ["Accepted", "Rejected"] },
      },
      {
        requestStatus: requestStatus,
        $push: { currentLocation: currentLocation },
      }
    );
    if (!isUpdated) {
      return {
        isUpdated: false,
      };
    }
    if (requestStatus === "Rejected") {
      return {
        isUpdated: true,
      };
    }
    const { isRequestFound, request } = await getRequestDetails(requestId);
    if (!isRequestFound) {
      return {
        isUpdated: false,
      };
    }

    const { ambulance } = request;
    const { hasAvailabilityChanged } = await changeAmbulanceAvailability(
      ambulance,
      false
    );
    if (hasAvailabilityChanged) {
      return {
        isUpdated: true,
      };
    }
    return {
      isUpdated: false,
    };
  } catch (error) {
    console.log("Error while updating journey request status", error);
    return {
      isUpdated: false,
    };
  }
};

export const updateJourneyStatus = async (journeyDetails) => {
  const { requestId, ambulanceId, journeyStatus } = journeyDetails;
  try {
    const isUpdated = await RequestAndJourneyModel.updateOne(
      {
        _id: mongoose.Types.ObjectId(requestId),
        requestStatus: "Accepted",
        journeyStatus: { $ne: "Ride Completed" },
      },
      { journeyStatus: journeyStatus }
    );
    console.log("update request staus response", isUpdated);
    if (!isUpdated || isUpdated?.nModified == 0) {
      return {
        isUpdated: false,
      };
    }

    if (journeyStatus != "Ride Completed") {
      return {
        isUpdated: true,
      };
    }

    const ambulanceAvailability = true;

    const { hasAvailabilityChanged } = await changeAmbulanceAvailability(
      ambulanceId,
      ambulanceAvailability
    );
    if (hasAvailabilityChanged) {
      return {
        isUpdated: true,
      };
    }
    return {
      isUpdated: false,
    };
  } catch (error) {
    console.error("error", error);
    return {
      isUpdated: false,
    };
  }
};

export const getLocationUpdates = async (requestId) => {
  try {
    const response = await RequestAndJourneyModel.find({
      _id: mongoose.Types.ObjectId(requestId),
    }).select("currentLocation journeyStatus location ambulance hospital ");
    if (!response) {
      return {
        hasError: true,
      };
    }
    return {
      hasError: false,
      locationUpdate: response,
    };
  } catch (error) {
    console.log("Error while getting location updates", error);
    return {
      hasError: true,
    };
  }
};

export const getLocationUpdatesUser = async (requestId) => {
  try {
    const response = await RequestAndJourneyModel.findById({
      _id: mongoose.Types.ObjectId(requestId),
    }).select("currentLocation ambulance location journeyStatus requestStatus");
    if (!response) {
      return {
        hasError: true,
      };
    }
    const { hasError, ambulance } = await checkIfAmbulanceExists(
      response.ambulance
    );
    if (hasError) {
      return {
        hasError: true,
      };
    }

    return {
      hasError: false,
      locationUpdate: response,
      ambulanceDetails: ambulance,
    };
  } catch (error) {
    console.log("Error while getting location updates", error);
    return {
      hasError: true,
    };
  }
};

export const getInitialCurrentLocation = async (requestId) => {
  const response = await RequestAndJourneyModel.findById({
    _id: mongoose.Types.ObjectId(requestId),
  }).select("hospital");
  if (!response) {
    return {
      hasError: true,
    };
  }
  const { hospital } = response;
  const hospitalLocationResponse = await HospitalModel.findById({
    _id: hospital,
  }).select("location");
  if (!hospitalLocationResponse) {
    return { hasError: true };
  }
  return { hasError: false, location: hospitalLocationResponse.location };
};

export const updateLocation = async (locationUpdateDetails) => {
  try {
    const { requestId, location } = locationUpdateDetails;
    const response = await RequestAndJourneyModel.updateOne(
      { _id: mongoose.Types.ObjectId(requestId) },
      { $push: { currentLocation: location } }
    );
    console.log("update location repsonse", response);
    if (response.nModified == 0) {
      return {
        hasError: true,
      };
    }
    return {
      hasError: false,
    };
  } catch (error) {
    console.log("Error occured while updating location details", error);
    return {
      hasError: true,
    };
  }
};

export const getRequestsByUser = async (userId) => {
  const requests = await RequestAndJourneyModel.find({ requestedBy: userId });
  if (!requests) {
    return {
      hasError: true,
    };
  }
  console.log("Response of getting requests by user");
  return {
    hasError: false,
    requests,
  };
};

export const getRequestDetailsByAmbulance = async (ambulanceId) => {
  const request = await RequestAndJourneyModel.find({
    ambulance: ambulanceId,
    requestStatus: "Accepted",
    journeyStatus: { $ne: "Ride Completed" },
  }).limit(1);
  if (!request) {
    return {
      hasError: true,
    };
  }
  console.log("Response of getting requests by ambulance", request);
  return {
    hasError: false,
    request,
  };
};

export const getLocationUpdatesAmbulance = async (ambulanceId) => {
  try {
    const response = await RequestAndJourneyModel.find({
      ambulance: ambulanceId,
      requestStatus: "Accepted",
      journeyStatus: { $ne: "Ride Completed" },
    }).select("currentLocation ambulance location journeyStatus requestStatus");
    if (!response) {
      return {
        hasError: true,
      };
    }
    const { hasError, ambulance } = await checkIfAmbulanceExists(
      response.ambulance
    );
    if (hasError) {
      return {
        hasError: true,
      };
    }

    return {
      hasError: false,
      locationUpdate: response[0],
      ambulanceDetails: ambulance,
    };
  } catch (error) {
    console.log("Error while getting location updates", error);
    return {
      hasError: true,
    };
  }
};
