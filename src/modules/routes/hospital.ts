import {
  checkIfHospitalExists,
  listHospitalsNearBy,
  saveHospital,
  validateHospitalLogin,
} from "../controllers/hospital";
import {
  updateJourneyStatus,
  updateRequestStatus,
} from "../controllers/requestandjourney";

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

router.post("/login", async (req, res, next) => {
  const { loginDetails } = req.body;
  const { hospitalId, password } = loginDetails;
  const { isValid } = await validateHospitalLogin(hospitalId, password);
  if (isValid) {
    return res.status(200).send({ isValid });
  }
  return res.status(200).send({ isValid });
});
module.exports = router;
