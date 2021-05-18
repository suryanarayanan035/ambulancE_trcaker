import { compareHashAndData, hashData } from "../../common/hashingandcryption";
import { HospitalModel } from "../models/Hospital";
import { getAvailableAmbulancesByHospital } from "./ambulance";
export const saveHospital = async (hospital) => {
  const model = new HospitalModel({
    ...hospital,
    _id: hospital.mobile,
    password: await hashData(hospital.password),
  });
  try {
    const response = await model.save();
    console.log(`Hospital Data saved successfully: ${response}`);
    return {
      hasError: false,
    };
  } catch (error) {
    console.error(`Error occured while storing hospital data ${error}`);
    return {
      hasError: true,
    };
  }
};

export const checkIfHospitalExists = async (hospitalId: String) => {
  const response = await HospitalModel.findById(hospitalId).select(
    "name mobile location address "
  );
  if (response != null) {
    return {
      isHospitalExists: true,
      hospital: response,
    };
  }
  return {
    isHospitalExists: false,
  };
};

export const listHospitalsNearBy = async (location, district) => {
  const hospitals = await HospitalModel.aggregate([
    {
      $geoNear: {
        near: location,
        distanceField: "dist.calculated",
        maxDistance: 3000,
        minDistance: 0,
        query: { "address.district": district },
        includeLocs: "dist.location",
        spherical: true,
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);
  console.log("hospitals", hospitals);
  if (hospitals != null && hospitals?.length > 0) {
    return {
      areHospitalsAvailable: true,
      hospitals,
    };
  }
  return { areHospitalsAvailable: false };
};

export const validateHospitalLogin = async (hospitalId, passwordFromUser) => {
  const response = await HospitalModel.findById({ _id: hospitalId }).select(
    "password"
  );
  const { result, hasError } = await compareHashAndData(
    passwordFromUser,
    response.password
  );
  if (hasError || !result) {
    return {
      isValid: false,
    };
  }

  return { isValid: true };
};
