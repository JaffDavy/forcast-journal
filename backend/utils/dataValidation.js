function checkObject(data) {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new Error("Data must be an object");
    }
  }
  
  export function validateUpdate(data) {
    checkObject(data);
    const dataKeys = Object.keys(data);
    const expectedKeys = ["date", "discription", "weather", "temperature"];
  
    checkMissingAndUnexpectedKeys(expectedKeys, dataKeys);
  }
  
  function checkMissingAndUnexpectedKeys(expectedKeys, dataKeys) {
    const missingKeys = expectedKeys.filter((key) => !dataKeys.includes(key));
    if (missingKeys.lenth > 0) {
      throw new Error(`Missing values ${missingKeys.join(", ")}`);
    }
  
    const unexpectedKeys = dataKeys.filter((key) => !expectedKeys.includes(key));
    if (unexpectedKeys.lenth > 0) {
      throw new Error(`Unexpected values ${unexpectedKeys.join(", ")}`);
    }
  }
  
  function validateFamilyData(data) {
    checkObject(data);
    const expectedKeys = [
      "date",
      "discription",
      "weather",
      "temperature"
    ];
  
    const dataKeys = Object.keys(data);
  
    checkMissingAndUnexpectedKeys(expectedKeys, dataKeys);
  
    const { date, discription, weather, temperature } = data;
  
    if (typeof date !== "integer" || date.trim() === "") {
      throw new Error(
        "Date must be a non-empty integer",
      );
    }

    if (
      typeof discription !== "string" ||
      discription.length > 200
    ) {
      throw new Error(
        "discription must be a string with length less than 200.",
      );
    }
  
    if (
      typeof weather !== "string"
    ) {
      throw new Error("weather must be a string");
    }

    if (typeof temperature !== "number") {
      throw new Error("temprature must be a number");
    }
  }
  
  export default validateFamilyData;