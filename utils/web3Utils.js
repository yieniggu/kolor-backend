const countDecimals = (number) => {
  if (Math.floor(number) === number) return 0;

  let str = number.toString();
  console.log("string: ", str);

  const splitted = str.split(".");
  console.log(`decimals: 0.${splitted[1]}`);
  return splitted[1].length;
};

const extractNumberTypes = (object) => {
  // extract object keys
  const keys = Object.keys(object);

  let numbers = [];
  keys.forEach((key) => {
    console.log(`key ${key}: ${object[key]} - type: ${typeof object[key]}`);
    if (typeof object[key] === "number") {
      console.log("number found: ", object[key]);
      numbers.push(object[key]);
    }
  });

  return numbers;
};

const extractMaxDecimals = (numbers) => {
  let maxDecimals = 0;
  numbers.forEach((number) => {
    let currentDecimals = countDecimals(number);
    if (currentDecimals > maxDecimals) maxDecimals = currentDecimals;
  });

  return maxDecimals;
};

const maxDecimalsOf = (object) => {
  const numbers = extractNumberTypes(object);

  const maxDecimals = extractMaxDecimals(numbers);

  console.log("max decimals: ", maxDecimals);
  return maxDecimals;
};

const normalizeNumber = (number, decimals = 0) => {
  return Math.round(number * Math.pow(10, decimals));
};

module.exports = {
  maxDecimalsOf,
  normalizeNumber,
};
