import {
  listAllPendingRequestsByHospital,
  saveRequestAndJourney,
  updateJourneyStatus,
} from "../controllers/requestandjourney";

const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  console.log(
    `Body for incoming request \n Path:/requestandjourney \n Method:POST ${req.body}`
  );
  const { requestAndJourneyDetails } = req.body;
  const { hasError } = await saveRequestAndJourney(requestAndJourneyDetails);
  if (hasError) {
    return res.status(500).send({ hasError: true });
  }
  return res.status(201).send({ hasError: false });
});

router.get("/:hospitalId", async (req, res, next) => {
  console.log(
    `Params for incoming requeset \n path:/requestandjoureny/:hospitalId \n Method:GET ${req.params}`
  );
  const { hospitalId } = req.params;
  const { hasRequests, requests } = await listAllPendingRequestsByHospital(
    hospitalId
  );
  if (!hasRequests) {
    return res
      .status(404)
      .send({ errorMessage: "no_request_found", hasError: true });
  }

  return res.status(200).send({ hasError: false, requests });
});
module.exports = router;

router.post("/journey-status", async (req, res, next) => {
  const { requestDetails } = req.body;
  const { isUpdated } = await updateJourneyStatus(requestDetails);
  if (!isUpdated) {
    return res.status(500).send({ hasError: true });
  }
  return res.status(200).send({
    hasError: false,
  });
});

module.exports = router;
