/**
 * Get the most latest date from array of objects
 * @param {Array} dates array of objects which contain column "createdAt"
 * @returns {Date} latest date from array
 */
const maxDate = (dates) => new Date(Math.max.apply(null, dates.map((e) => new Date(e.createdAt))));

/**
 * Get the last date from array of objects
 * @param {Array} dates array of objects which contain column "createdAt"
 * @returns {Date} last date from array of objects
 */
const minDate = (dates) => new Date(Math.min.apply(null, dates.map((e) => new Date(e.createdAt))));

module.exports = { maxDate, minDate };
