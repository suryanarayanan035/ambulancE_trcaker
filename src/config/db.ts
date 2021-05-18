const mongoose = require("mongoose");
export const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_SRV_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("Connected successfully to monogDB");
  } catch (error) {
    console.error("Error Occured while connecting to mongodb");
  }
};
