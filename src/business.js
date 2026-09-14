// Businesses are immutable places in the city. "Business" is intentionally broad:
// it includes private firms, public institutions, estates, and working farms.
import { District } from './district.js';

export const BUSINESS_FIELDS = Object.freeze({
  id: 'Stable key used to identify this business in world data and future actions.',
  name: 'Player-facing name of the business or workplace.',
  type: 'Plain-language kind of place, such as bank, factory, shop, or public office.',
  district: 'District object where the business is located.',
  description: 'Short description of what happens at this place.',
  jobIds: 'Job keys currently offered at this business; empty when it is only a world location.'
});

export class Business {
  constructor(values) {
    if (!values || typeof values !== 'object' || Array.isArray(values))
      throw new Error('Business must be an object.');
    for (const key of Object.keys(values))
      if (!Object.hasOwn(BUSINESS_FIELDS, key)) throw new Error(`Unknown Business attribute: ${key}`);
    for (const key of ['id', 'name', 'type', 'description'])
      if (typeof values[key] !== 'string' || !values[key].trim())
        throw new Error(`Business needs a nonempty ${key}.`);
    if (!(values.district instanceof District))
      throw new Error('Business district must be a District object.');
    if (!Array.isArray(values.jobIds) ||
        values.jobIds.some(id => typeof id !== 'string' || !id.trim()))
      throw new Error('Business jobIds must be an array of nonempty job keys.');
    if (new Set(values.jobIds).size !== values.jobIds.length)
      throw new Error('Business jobIds cannot contain duplicates.');

    Object.assign(this, values, { jobIds: Object.freeze([...values.jobIds]) });
    Object.freeze(this);
  }
}
