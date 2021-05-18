const bcrypt = require("bcrypt");
const util = require("util");
const hash = util.promisify(bcrypt.hash);
const compare = util.promisify(bcrypt.compare);
export const hashData = async (data: string) => {
  try {
    const saltRounds = 10;
    const hashValue = await hash(data, saltRounds);
    return hashValue;
  } catch (error) {
    console.log(`Error while hashing data ${error}`);
    return "";
  }
};

export const compareHashAndData = async (data: String, hash: String) => {
  try {
    const result = await compare(data, hash);
    return { result, hasError: false };
  } catch (error) {
    console.log(`Error occured while comapring ${error}`);
    return { hasError: true };
  }
};
