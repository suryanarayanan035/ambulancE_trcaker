import {
  checkIfHospitalExists,
  listHospitalsNearBy,
  saveHospital,
} from "../controllers/hospital";
import { updateRequestStatus } from "../controllers/requestandjourney";

const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  console.log(`Body for saving hospital request ${req.body}`);
  const { hospital } = req.body;
  const { hasError } = await saveHospital(hospital);
  if (hasError) {
    return res.status(500).send({ hasError });
  }
  return res.status(201).send({ hasError });
});

router.get("/:hospitalId", async (req, res, next) => {
  const { hospitalId } = req.params;
  const response = await checkIfHospitalExists(hospitalId);
  if (response.isHospitalExists) {
    return res.status(200).send(response);
  }
  return res.status(404).send(response);
});

router.post("/request-status", async (req, res, next) => {
  const { requestDetails } = req.body;
  const { isUpdated } = await updateRequestStatus(requestDetails);
  if (!isUpdated) {
    return res.status(500).send({ hasError: true });
  }
  return res.status(200).send({
    hasError: false,
  });
});

module.exports = router;
