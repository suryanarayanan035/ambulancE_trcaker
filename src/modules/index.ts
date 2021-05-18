require("dotenv").config({ path: "src/config/.env" });
import { hashData } from "../common/hashingandcryption";
import { connectToDB } from "../config/db";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser());
connectToDB();
const userRouter = require("./routes/user");
const hospitalRouter = require("./routes/hospital");
const ambulanceRouter = require("./routes/ambulance");
const requestAndJourneyRouter = require("./routes/requestandjourney");
app.use("/user", userRouter);
app.use("/hospital", hospitalRouter);
app.use("/ambulance", ambulanceRouter);
app.use("/request-and-journey", requestAndJourneyRouter);
app.listen(process.env.PORT, () => {
  console.log(`Server strated at port ${process.env.PORT}`);
});
