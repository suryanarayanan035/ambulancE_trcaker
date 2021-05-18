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
};

export const getRequestDetails = async (requestId) => {
  const request = await RequestAndJourneyModel.find({ _id: requestId }).select(
    "driverName ambulance vehicleNo journeyStatus requestStatus"
  );
  if (!request) {
    return {
      isRequestFound: false,
    };
  }
  return {
    isRequestFound: true,
    request,
  };
};

export const updateRequestStatus = async (requestDetails) => {
  const { requestId, requestStatus } = requestDetails;
  const isUpdated = await RequestAndJourneyModel.update(
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
};

export const updateJourneyStatus = async (requestDetails) => {
  const { requestId, ambulanceId, journeyStatus } = requestDetails;
  const isUpdated = await RequestAndJourneyModel.update(
    { _id: requestId },
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
      isUpadted: true,
    };
  }
  return {
    isUpdated: false,
  };
};
