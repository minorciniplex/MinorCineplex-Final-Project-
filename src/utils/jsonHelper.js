/**
 * Safely parse JSON string with fallback values
 * @param {string} jsonString - The JSON string to parse
 * @param {any} fallbackValue - Value to return if parsing fails or input is invalid
 * @returns {any} Parsed object or fallback value
 */
export function safeJsonParse(jsonString, fallbackValue = null) {
  // Check if input is valid
  if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
    return fallbackValue;
  }

  // If already an object, return as-is
  if (typeof jsonString === 'object') {
    return jsonString;
  }

  // Try to parse
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString, error);
    return fallbackValue;
  }
}

/**
 * Safely parse router query parameters that may be JSON strings
 * @param {object} query - Router query object
 * @param {string} key - Key to parse
 * @param {any} fallbackValue - Value to return if parsing fails
 * @returns {any} Parsed value or fallback
 */
export function parseQueryParam(query, key, fallbackValue = null) {
  const value = query[key];
  
  if (!value) {
    return fallbackValue;
  }

  // Handle URL encoded strings
  if (typeof value === 'string' && value.includes('%')) {
    try {
      const decoded = decodeURIComponent(value);
      return safeJsonParse(decoded, fallbackValue);
    } catch (error) {
      console.warn('Failed to decode URI component:', value, error);
      return safeJsonParse(value, fallbackValue);
    }
  }

  return safeJsonParse(value, fallbackValue);
} 