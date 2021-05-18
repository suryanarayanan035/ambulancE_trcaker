import { compareHashAndData, hashData } from "../../common/hashingandcryption";
import { HospitalModel } from "../models/Hospital";
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
  try {
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
  } catch (error) {
    console.log("Error while checking if hospital exists", error);
    return {
      isHospitalExists: false,
    };
  }
};

export const listHospitalsNearBy = async (location, district, hospitalType) => {
  try {
    let query;
    if (hospitalType === "" || hospitalType === undefined) {
      query = { "address.district": district };
    } else {
      query = { "address.district": district, type: hospitalType };
    }
    const hospitals = await HospitalModel.aggregate([
      {
        $geoNear: {
          near: location,
          distanceField: "dist.calculated",
          maxDistance: 3000,
          minDistance: 0,
          query: query,
          includeLocs: "dist.location",
          spherical: true,
        },
      },
      {
        $project: {
          _id: 1,
          "dist.calculated": 1,
          "dist.location": 1,
        },
      },
      {
        $sort: {
          "dist.calculated": 1,
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
  } catch (error) {
    console.log("Error while fetching nearby hospitals");
    return {
      areHospitalsAvailable: false,
    };
  }
};

export const validateHospitalLogin = async (hospitalId, passwordFromUser) => {
  try {
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
  } catch (error) {
    console.log("Error while retrieving hospital password", error);
    return {
      isValid: true,
    };
  }
};
