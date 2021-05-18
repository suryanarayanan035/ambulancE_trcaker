import {
  checkIfAmbulanceExists,
  listAvaialbleAmbulancesNearby,
  saveAmbulance,
  validateAmbulanceLogin,
} from "../controllers/ambulance";
import { checkIfHospitalExists } from "../controllers/hospital";

const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  console.log(`Body for incoming data\n Url: /user\nMethod:POST${req.body}`);
  const { ambulance } = req.body;
  const { isHospitalExists } = await checkIfHospitalExists(ambulance.hospital);
  if (!isHospitalExists) {
    return res
      .status(400)
      .send({ hasError: true, errorMessage: "hospital_does_not_exist" });
  }
  const { hasError } = await saveAmbulance(ambulance);
  if (hasError) {
    return res.status(500).send({ hasError });
  }
  return res.status(200).send({ hasError });
});
router.get("/:ambulanceId", async (req, res, next) => {
  const { ambulanceId } = req.params;
  const response = await checkIfAmbulanceExists(ambulanceId);
  if (response.isAmbulanceExists) {
    return res.status(200).send(response);
  }
  return res.status(404).send(response);
});

router.post("/nearby-ambulances", async (req, res, next) => {
  const { location, district, hospitalType } = req.body;
  const { areAmbulancesAvailable, ambulances } =
    await listAvaialbleAmbulancesNearby(location, district, hospitalType);
  if (areAmbulancesAvailable) {
    return res.status(200).send({ hasError: false, ambulances });
  }
  return res.status(404).send({ hasError: true });
});

router.post("/login", async (req, res, next) => {
  const { loginDetails } = req.body;
  const { ambulanceId, password } = loginDetails;
  const { isValid } = await validateAmbulanceLogin(ambulanceId, password);
  if (isValid) {
    return res.status(200).send({ isValid });
  }
  return res.status(200).send({ isValid });
});

module.exports = router;
