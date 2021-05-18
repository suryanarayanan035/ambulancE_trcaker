const mongoose = require("mongoose");
import { RequestAndJourneyModel } from "../models/RequestAndJourney";
import { changeAmbulanceAvailability } from "./ambulance";

export const saveRequestAndJourney = async (requestAndJourney) => {
  try {
    const model = new RequestAndJourneyModel(requestAndJourney);
    const response = await model.save();
    console.log(`Response of savig requestandjoureny details: ${response}`);
    return {
      hasError: false,
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
    });
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
      hasRequest: true,
    };
  }
};

export const getRequestDetails = async (requestId) => {
  try {
    const request = await RequestAndJourneyModel.find({
      _id: requestId,
    }).select("driverName ambulance vehicleNo journeyStatus requestStatus");
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
    const isUpdated = await RequestAndJourneyModel.updateOne(
      { _id: requestId },
      { requestStatus: requestStatus }
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
    console.log("Error while updating journey request status", true);
    return {
      isUpdated: false,
    };
  }
};

export const updateJourneyStatus = async (requestDetails) => {
  const { requestId, ambulanceId, journeyStatus } = requestDetails;
  try {
    const isUpdated = await RequestAndJourneyModel.updateOne(
      {
        _id: mongoose.Types.ObjectId(requestId),
        requestStatus: "Accepted",
        journeyStatus: { $ne: "Ride Completed" },
      },
      { journeyStatus: journeyStatus }
    );
    if (!isUpdated) {
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
