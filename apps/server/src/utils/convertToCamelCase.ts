import _ from 'lodash';

// Define a type for objects with string keys and any values
type RecordWithStringKeys = { [key: string]: any };

// Utility function to convert snake_case keys to camelCase
export function convertToCamelCase<T extends RecordWithStringKeys | RecordWithStringKeys[]>(data: T): T {
  // Handle arrays of records
  if (Array.isArray(data)) {
    return data.map(item => convertToCamelCase(item)) as T;
  }

  // Handle single object
  if (data !== null && typeof data === 'object') {
    // Check if it's a Date object - preserve it as-is
    if (data instanceof Date) {
      return data as T;
    }

    // Check if it's a plain object that should be converted
    const mappedObject = _.mapKeys(
      _.mapValues(data, value => {
        // Handle null values
        if (value === null) {
          return value;
        }
        
        // Preserve Date objects
        if (value instanceof Date) {
          return value;
        }
        
        // Recursively convert nested objects or arrays (but not Dates)
        if (Array.isArray(value) || (typeof value === 'object')) {
          return convertToCamelCase(value);
        }
        
        // Return primitive values as-is
        return value;
      }),
      (value, key) => _.camelCase(key)
    ) as T;

    return mappedObject;
  }

  // Return non-object values as-is
  return data;
}
