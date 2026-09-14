import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { UNIVERSITY_DISTRICT_BUSINESSES } from './business.js';

export const UNIVERSITY_DISTRICT_JOBS = Object.freeze({
  library_assistant: new LegitWork({
    name: 'University library assistant', district: DISTRICTS.university_district,
    business: UNIVERSITY_DISTRICT_BUSINESSES.st_aldwyn_university_library, pay: 5,
    education: 2, hours: 8, energy: 15
  })
});
