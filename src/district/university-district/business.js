import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const UNIVERSITY_DISTRICT_BUSINESSES = Object.freeze({
  st_aldwyn_university_library: new Business({
    id: 'st_aldwyn_university_library', name: 'St. Aldwyn University Library',
    type: 'university library', district: DISTRICTS.university_district,
    description: 'A quiet academic library whose collections depend on careful cataloguing and circulation.',
    jobIds: ['library_assistant']
  })
});
