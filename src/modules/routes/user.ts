import {
  checkIfUserExists,
  saveUser,
  validateUserLogin,
} from "../controllers/user";

const express = require("express");
const router = express.Router();
router.post("/", async (req, res, next) => {
  const user = req.body.user;
  console.log(req.body.user);
  const { hasError } = await saveUser(user);
  if (hasError) {
    return res.status(500).send({ hasError });
  }
  return res.status(201).send({ hasError });
});

router.get("/:userId", async (req, res, next) => {
  const { userId } = req.params;
  console.log(`${userId}`);
  const response = await checkIfUserExists(userId);
  if (response.isUserExists) {
    return res.status(200).send(response);
  }
  return res.status(404).send(response);
});

router.post("/login", async (req, res, next) => {
  const { loginDetails } = req.body;
  const { userId, password } = loginDetails;
  const { isValid } = await validateUserLogin(userId, password);
  if (isValid) {
    return res.status(200).send({ isValid });
  }
  return res.status(200).send({ isValid });
});
module.exports = router;
