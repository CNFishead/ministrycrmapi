import mongoose from 'mongoose';

/**
 * @description takes in a string argument and returns an object that can be used to filter objects from the database
 * @param {string} filterOptionsString - the string to be parsed, i.e, 'isLivePro=true;isLivePro;false'
 * @returns {object} - the parsed filter options string
 *
 * @author Austin Howard
 * @since 1.2.0
 * @version 1.2.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2023-07-19T12:45:31.000-05:00
 */
export default (filterOptionsString: string) => {
  if (!filterOptionsString) return {};

  const filterOptionsObject = {} as any;
  const filterOptionsArray = filterOptionsString.split(',');

  filterOptionsArray.forEach((filterOption) => {
    const [key, value] = filterOption.split(';');

    if (value === 'true') {
      filterOptionsObject[key] = true;
    } else if (value === 'false') {
      filterOptionsObject[key] = false;
    } else {
      try {
        // Use JSON.parse to safely convert the value to an object
        const parsedValue = JSON.parse(value);

        // Allow only specific operators in the object
        const allowedOperators = ['$gte', '$lte', '$gt', '$lt', '$eq'];
        const filteredValue = Object.entries(parsedValue).reduce((acc: any, [opKey, opValue]) => {
          if (allowedOperators.includes(opKey)) {
            acc[opKey] = isNaN(Number(opValue)) ? opValue : Number(opValue);
          }
          return acc;
        }, {});
        // If key already exists, merge the parsed value
        filterOptionsObject[key] = { ...filterOptionsObject[key], ...filteredValue };
      } catch (error) {
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
