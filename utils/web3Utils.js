const fiveYearsInSeconds = 31536000 * 5;

// Count decimals of a given number
const countDecimals = (number) => {
  if (Math.floor(number) === number) return 0;

  let str = number.toString();
  //console.log("string: ", str);

  const splitted = str.split(".");
  //console.log(`decimals: 0.${splitted[1]}`);
  return splitted[1].length;
};

// Get the numbers (attributes) of a given object
const extractNumberTypes = (object) => {
  // extract object keys
  const keys = Object.keys(object);

  let numbers = [];
  keys.forEach((key) => {
    //console.log(`key ${key}: ${object[key]} - type: ${typeof object[key]}`);
    if (typeof object[key] === "number") {
      //console.log("number found: ", object[key]);
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

// Converts an array of objects to an array of arrays,
//  as solidity handles arrays of structs this way!
// ej: [{a, b, c}], {d, e, f}] -> [[a, b, c], [d, e, f]]
const convertSpeciesToArray = (species) => {
  let speciesAsArrays = [];

  species.map((specie) => {
    //console.log("before refactor: ", specie);
    specie = refactorSpecie(specie);
    //console.log("refactored...: ", specie);
    let {
      speciesAlias,
      scientificName,
      size,
      initialTCO2,
      TCO2perSecond,
      density,
    } = specie;

    const decimals = maxDecimalsOf(specie);
    //console.log("specie decimals done: ", decimals);

    let specieAsArray = [];
    specieAsArray.push(
      speciesAlias,
      scientificName,
      normalizeNumber(density, decimals), // Array normalized to count decimals on solidity
      normalizeNumber(size, decimals), // As solidity only handle numbers as integers!
      decimals,
      normalizeNumber(TCO2perSecond, decimals),
      normalizeNumber(initialTCO2, decimals),
      0,
      0,
      0
    );

    speciesAsArrays.push(specieAsArray);
  });

  return speciesAsArrays;
};

// Converts a set of objects inside an array to an
// array of arrays, as solidity handles arrays of structs this way!
// ej: [{a, b, c}], {d, e, f}] -> [[a, b, c], [d, e, f]]
const convertPointsToArray = (points) => {
  let pointsAsArrays = [];

  points.map((coordinate) => {
    coordinate = refactorPoints(coordinate);

    let { latitude, longitude } = coordinate;

    const decimals = maxDecimalsOf(coordinate);

    let coordinateAsArray = [];
    coordinateAsArray.push(
      normalizeNumber(latitude),
      normalizeNumber(longitude),
      decimals,
      0,
      0
    );

    pointsAsArrays.push(coordinateAsArray);
  });

  return pointsAsArrays;
};

// Convert numbers from strings to numbers
const refactorPoints = (points) => {
  points.latitude = Number(points.latitude);
  points.longitude = Number(points.longitude);

  return points;
};

// Convert numbers from strings to numbers
const refactorSpecie = (specie) => {
  specie.initialTCO2 = Number(getInitialTCO2([specie]));
  specie.size = Number(specie.size);
  specie.density = Number(specie.density);
  specie.TCO2perSecond = Number(specie.TCO2perSecond);

  return specie;
};

// Extract the max decimals of an object with different
// floating point numbers (decimal part)
const maxDecimalsOf = (object) => {
  const numbers = extractNumberTypes(object);

  const maxDecimals = extractMaxDecimals(numbers);

  //console.log("max decimals: ", maxDecimals);
  return maxDecimals;
};

// This function normalize a number to account for decimals
// given that solidity only work with integer numbers
const normalizeNumber = (number, decimals = 0) => {
  return Math.round(number * Math.pow(10, decimals));
};

// Get the CO2 that a given specie offsets in five years
const getInitialTCO2 = (species) => {
  let initialTCO2 = 0;

  species.map((specie) => {
    initialTCO2 += specie.TCO2perSecond * fiveYearsInSeconds;
    //console.log("initial tco2 now: ", initialTCO2);
  });

  return Math.round(initialTCO2);
};

module.exports = {
  maxDecimalsOf,
  normalizeNumber,
  convertSpeciesToArray,
  convertPointsToArray,
  getInitialTCO2,
};
