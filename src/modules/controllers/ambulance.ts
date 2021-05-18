import { compareHashAndData, hashData } from "../../common/hashingandcryption";
import { AmbulanceModel } from "../models/Ambulance";
import { listHospitalsNearBy } from "./hospital";

export const saveAmbulance = async (ambulance) => {
  const model = new AmbulanceModel({
    ...ambulance,
    _id: ambulance.driverMobile,
    password: await hashData(ambulance.password),
  });
  try {
    const response = await model.save();
    console.log(`Ambulance Data saved successfully. ${response}`);
    return {
      hasError: false,
    };
  } catch (error) {
    console.error(`Error occured while storing ambulance data ${error}`);
    return {
      hasError: true,
    };
  }
};

export const checkIfAmbulanceExists = async (ambulanceId: string) => {
  const response = await AmbulanceModel.findById({ _id: ambulanceId }).select(
    "driverName driverMobile vehicleNo hospital isAvailable "
  );
  if (response != null) {
    return {
      hasError: false,
      isAmbulanceExists: true,
      ambulance: response,
    };
  }
  return { isAmbulanceExists: false };
};

export const getAvailableAmbulancesByHospital = async (hospitalId: string) => {
  const response = await AmbulanceModel.find({
    hospital: hospitalId,
    isAvailable: true,
  }).select("driverName vehicleNo hospital");
  console.log("Response ", response);
  if (response != null && response?.length > 0) {
    return {
      areAmbulancesAvailable: true,
      ambulances: response,
    };
  }

  return { areAmbulancesAvailable: false };
};

export const listAvaialbleAmbulancesNearby = async (location, district) => {
  /** Getting nearbby hospitals in a given district */
  const { hospitals, areHospitalsAvailable } = await listHospitalsNearBy(
    location,
    district
  );
  /** checking if any hospital is available */
  if (areHospitalsAvailable) {
    let availableAmbulances = [{}];
    for (let i = 0; i < hospitals.length; i++) {
      const { _id } = hospitals[i];
      const { ambulances, areAmbulancesAvailable } =
        await getAvailableAmbulancesByHospital(_id);
      if (areAmbulancesAvailable) {
        for (let i = 0; i < ambulances.length; i++) {
          availableAmbulances.push[ambulances[0]];
        }
        return {
          areAmbulancesAvailable: true,
          ambulances: ambulances,
        };
      }
      return {
        areAmbulancesAvailable: false,
      };
    }
  }

  return { areAmbulancesAvailable: false };
};

export const changeAmbulanceAvailability = async (ambulanceId, isAvailable) => {
  const response = await AmbulanceModel.update(
    { _id: ambulanceId },
    { isAvailable: isAvailable }
  );
  if (!response) {
    return {
      hasAvailabilityChanged: false,
    };
  }
  return {
    hasAvailabilityChanged: true,
  };
};

export const validateAmbulanceLogin = async (ambulanceId, passwordFromUser) => {
  const response = await AmbulanceModel.findById({ _id: ambulanceId }).select(
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
