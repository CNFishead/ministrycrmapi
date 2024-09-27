import moment from "moment";
import mongoose from "mongoose";

/**
 * @description Takes in a string argument and returns an object that can be used to filter objects from the MySQL database using Sequelize operators
 * @param {string} filterOptionsString - the string to be parsed, i.e, 'isLivePro=1;name;like;John;createdAt;>=;2023-01-01'
 * @returns {object} - the parsed filter options string
 *
 * @author Austin Howard
 * @since 1.2.8
 * @version 1.2.8
 * @lastModifiedBy Austin Howard
 * @lastModified 2023-07-19T12:45:31.000-05:00
 */
export default (filterOptionsString: string) => {
  if (!filterOptionsString) return {};

  const filterOptionsObject = {} as { [key: string]: any };
  const filterOptionsArray = filterOptionsString.split(",");

  filterOptionsArray.forEach((filterOption) => {
    const [key, value] = filterOption.split(";");
    console.log(key, value);

    if (value === "true") {
      filterOptionsObject[key] = true;
    } else if (value === "false") {
      filterOptionsObject[key] = false;
    } else {
      try {
        // Use JSON.parse to safely convert the value to an object
        const parsedValue = JSON.parse(value);

        // Allow only specific operators in the object
        const allowedOperators = ["$gte", "$lte", "$gt", "$lt", "$eq", "$elemMatch", "$in", "$ne"];
        const filteredValue = Object.entries(parsedValue).reduce((acc: any, [opKey, opValue]) => {
          if (allowedOperators.includes(opKey)) {
            if (opKey === "$elemMatch" && typeof opValue === "string") {
              acc[opKey] = { $eq: opValue }; // Handle simple string equality for $elemMatch
            } else {
              const isValidDate = moment(opValue as string).isValid();
              const isNumber = !isNaN(Number(opValue));
              // case where the value is a date object, use moment to check if its a valid date
              if (isValidDate) {
                // console.log(`valid date object: ${opValue}`);
                acc[opKey] = moment(opValue as any).toDate();
                return acc;
              }
              // case where the value is a valid Number, convert it to a number
              if (isNumber) {
                // console.log(`valid number: ${opValue}`);
                acc[opKey] = Number(opValue);
                return acc;
              }
              // case where the value is a string, return the string
              acc[opKey] = opValue;
            }
          }
          return acc;
        }, {});
        // If key already exists, merge the parsed value
        filterOptionsObject[key] = {
          ...filterOptionsObject[key],
          ...filteredValue,
        };
      } catch (error) {
        // console.log(`error parsing: ${value}`);
        // console.log(`error: ${error}`);
        // If JSON.parse fails, check for valid ObjectId
        if (mongoose.Types.ObjectId.isValid(value)) {
          filterOptionsObject[key] = new mongoose.Types.ObjectId(value);
        } else {
          // If not a valid ObjectId, treat the value as a regular string or number
          filterOptionsObject[key] = isNaN(Number(value)) ? value : Number(value);
        }
      }
    }
  });

  return filterOptionsObject;
};
