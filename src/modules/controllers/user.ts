import { compareHashAndData, hashData } from "../../common/hashingandcryption";
import { UserModel } from "../models/User";
export const saveUser = async (user) => {
  try {
    const model = new UserModel({
      ...user,
      _id: user.mobile,
      password: await hashData(user.password),
    });
    const response = await model.save();
    console.log(`Response of Saving user to database ${response}`);
    return {
      hasError: false,
    };
  } catch (error) {
    console.log("Error Occured while saving user data ", error);
    return {
      hasError: true,
    };
  }
};

export const checkIfUserExists = async (userId: string) => {
  try {
    const user = await UserModel.findById({ _id: userId }).select(
      "name mobile location address gender bloodGroup "
    );

    if (user != null) {
      return {
        user,
        isUserExists: true,
      };
    }
    return { isUserExists: false };
  } catch (error) {
    console.log("Error occured while checking if user exists", error);
    return {
      isUserExists: false,
    };
  }
};

export const validateUserLogin = async (userId, passwordFromUser) => {
  try {
    const response = await UserModel.findById({ _id: userId }).select(
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
    console.log("Error while retrieving password for user ", error);
    return {
      isValid: false,
    };
  }
};
