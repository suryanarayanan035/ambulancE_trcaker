import { compareHashAndData, hashData } from "../../common/hashingandcryption";
import { AmbulanceModel } from "../models/Ambulance";
import { listHospitalsNearBy } from "./hospital";
const mongoose = require("mongoose");
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
  try {
    const response = await AmbulanceModel.findById(ambulanceId).select(
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
  } catch (error) {
    console.log("Error whicle checking if ambulance exists", error);
    return {
      hasError: true,
    };
  }
};

export const getAvailableAmbulancesByHospital = async (hospitalId: string) => {
  try {
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
  } catch (error) {
    console.log("error whille reteiving ambulances details by hospital", error);
    return { areAmbulancesAvailable: false };
  }
};

export const listAvaialbleAmbulancesNearby = async (district, hospitalType) => {
  try {
    /** Getting nearbby hospitals in a given district */
    const { hospitals, areHospitalsAvailable } = await listHospitalsNearBy(
      district,
      hospitalType
    );
    /** checking if any hospital is available */
    if (areHospitalsAvailable) {
      let availableAmbulances = [{}];
      availableAmbulances.pop();
      for (let i = 0; i < hospitals.length; i++) {
        const { _id, name } = hospitals[i];
        const { ambulances, areAmbulancesAvailable } =
          await getAvailableAmbulancesByHospital(_id);
        if (areAmbulancesAvailable) {
          for (let j = 0; j < ambulances?.length; j++) {
            const ambulance = {
              hospitalName: name,

              ...ambulances[j]._doc,
            };
            availableAmbulances.push(ambulance);
          }
          return {
            areAmbulancesAvailable: true,
            ambulances: availableAmbulances,
          };
        }
        return {
          areAmbulancesAvailable: false,
        };
      }
    }

    return { areAmbulancesAvailable: false };
  } catch (error) {
    console.log("Error occured while listing nearby ambulances ", error);
    return {
      areAmbulancesAvailable: false,
    };
  }
};

export const changeAmbulanceAvailability = async (ambulanceId, isAvailable) => {
  try {
    const response = await AmbulanceModel.updateOne(
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
  } catch (error) {
    console.log(`Error while updating ambulance availability ${error}`);
    return {
      hasAvailabilityChanged: false,
    };
  }
};

export const validateAmbulanceLogin = async (ambulanceId, passwordFromUser) => {
  try {
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
  } catch (error) {
    console.log("error while retreiving password for ambulance", error);
    return {
      isValid: false,
    };
  }
};
