import { checkIfAmbulanceExists } from "../controllers/ambulance";
import {
  getLocationUpdates,
  getLocationUpdatesAmbulance,
  getLocationUpdatesUser,
  getRequestDetails,
  getRequestDetailsByAmbulance,
  getRequestsByUser,
  listAllPendingRequestsByHospital,
  saveRequestAndJourney,
  updateJourneyStatus,
  updateLocation,
  updateRequestStatus,
} from "../controllers/requestandjourney";
const express = require("express");
const router = express.Router();
/** Creating a new journey */
router.post("/", async (req, res, next) => {
  console.log(
    "Body for incoming request \n Path:/requestandjourney \n Method:POST ",
    req.body.requestAndJourneyDetails
  );
  const { requestAndJourneyDetails } = req.body;
  const { hasError, requestId } = await saveRequestAndJourney(
    requestAndJourneyDetails
  );
  if (hasError) {
    return res.status(500).send({ hasError: true });
  }
  return res.status(200).send({ hasError: false, requestId });
});

router.get("/hospital/:hospitalId", async (req, res, next) => {
  console.log(
    `Params for incoming requeset \n path:/requestandjoureny/:hospitalId \n Method:GET ${req.params}`
  );
  const { hospitalId } = req.params;
  const { hasRequests, requests } = await listAllPendingRequestsByHospital(
    hospitalId
  );
  if (!hasRequests) {
    return res.status(200).send({ hasError: true });
  }

  return res.status(200).send({ hasError: false, requests });
});
/**get list of requests by user */
router.get("/user/:userId", async (req, res, next) => {
  const userId = req.params.userId;
  const { hasError, requests } = await getRequestsByUser(userId);
  if (hasError) {
    return res.status(200).send({ hasError: true });
  }
  return res.status(200).send({
    hasError: false,
    requests,
  });
});
/**Getting location updates for user */
router.get("/location/user/:requestId", async (req, res, next) => {
  const requestId = req.params.requestId;
  const { hasError, locationUpdate, ambulanceDetails } =
    await getLocationUpdatesUser(requestId);
  if (hasError) {
    return res.status(200).send({ hasError: true });
  }
  return res.status(200).send({
    hasError: false,
    locationUpdate,
    ambulanceDetails,
  });
});
/** get location updates by ambulance */
router.get("/location/ambulance/:ambulanceId", async (req, res, next) => {
  const { ambulanceId } = req.params;
  const { hasError, locationUpdate, ambulanceDetails } =
    await getLocationUpdatesAmbulance(ambulanceId);
  if (hasError) {
    return res.status(200).send({
      hasError: true,
    });
  }
  return res.status(200).send({
    hasError: false,
    locationUpdate,
    ambulanceDetails,
  });
});

/**getting location updates for ambulance */
router.get("/location/:requestId", async (req, res, next) => {
  const requestId = req.params.requestId;
  const { hasError, locationUpdate } = await getLocationUpdates(requestId);
  if (hasError) {
    return res.status(200).send({ hasError: true });
  }
  return res.status(200).send({
    hasError: false,
    locationUpdate,
  });
});

/**Updation location of ambulance */
router.put("/location/", async (req, res, next) => {
  const { locationUpdateDetails } = req.body;
  const { hasError } = await updateLocation(locationUpdateDetails);
  if (hasError) {
    return res.status(200).send({
      isUpdated: false,
    });
  }
  return res.status(200).send({
    isUpdated: true,
  });
});
/**Getting details about request */
router.get("/:requestId", async (req, res, next) => {
  const { requestId } = req.params;
  console.log("RequestId", requestId);
  const { isRequestFound, request } = await getRequestDetails(requestId);
  if (!isRequestFound) {
    return res.status(200).send({ isRequestFound: false });
  }
  const { ambulance, hasError, isAmbulanceExists } =
    await checkIfAmbulanceExists(request.ambulance);
  const {
    name,
    age,
    mobile,
    gender,
    isAccident,
    bloodGroup,
    location,
    requestedBy,
  } = request;
  const { driverName, driverMobile } = ambulance;
  return res.status(200).send({
    isRequestFound: true,
    name,
    age,
    mobile,
    gender,
    isAccident,
    bloodGroup,
    requestedBy,
    location,
    driverName,
    driverMobile,
  });
});
module.exports = router;

/** Updating request status if accepted or rejected */
router.put("/request-status", async (req, res, next) => {
  const { requestDetails } = req.body;
  const { isUpdated } = await updateRequestStatus(requestDetails);
  if (!isUpdated) {
    return res.status(500).send({ hasError: true });
  }
  return res.status(200).send({
    hasError: false,
  });
});
/** Updating journey status */
router.put("/journey-status", async (req, res, next) => {
  const { journeyDetails } = req.body;
  const { isUpdated } = await updateJourneyStatus(journeyDetails);
  if (!isUpdated) {
    return res.status(200).send({ hasError: true });
  }
  return res.status(200).send({
    hasError: false,
  });
});

/** Getting  request status by ambulance */
router.get("/ambulance/:ambulanceId", async (req, res, next) => {
  const { ambulanceId } = req.params;
  const { hasError, request } = await getRequestDetailsByAmbulance(ambulanceId);
  if (hasError) {
    return res.status(200).send({
      hasError: true,
    });
  }
  return res.status(200).send({
    hasError: false,
    request: request[0],
  });
});

module.exports = router;
