import moment from 'moment';
import { date } from 'faker';
/**
 * Get the most latest date from array of objects
 * @param {Array} dates array of objects which contain column "createdAt"
 * @returns {Date} latest date from array
 */
const maxDate = (dates: Array<{ createdAt: Date }>): Date => moment.max(dates.map((date) => moment(date.createdAt))).toDate();

/**
 * Get the last date from array of objects
 * @param {Array} dates array of objects which contain column "createdAt"
 * @returns {Date} last date from array of objects
 */
const minDate = (dates: Array<{ createdAt: Date }>): Date => moment.min(dates.map((date) => moment(date.createdAt))).toDate(); 

export { maxDate, minDate };
