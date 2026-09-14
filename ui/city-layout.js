import { DISTRICTS } from '../src/district.js';
import districtPolygons from './district-polygons.json?v=20260914-1' with { type: 'json' };

export const MAP_SIZE = Object.freeze({ width: 1536, height: 1024 });
const pointsPath = points => `M${points.map(p => p.join(',')).join(' L')} Z`;
const labels = {
  outskirts:[220,73], university_district:[567,132], high_society:[850,107], theater_district:[1163,122],
  rail_yards:[297,237], auto_district:[647,307], tenderloin:[857,308], government_row:[1190,316],
  industrial_district:[341,426], balkan_quarter:[675,493], downtown:[931,461], chinatown:[1271,484],
  irish_quarter:[358,696], docks:[705,687], tenements:[1091,797], little_italy:[1375,786]
};
// Hand-traced district polygons are the visual source of truth. Logical x/y
// positions remain gameplay-only and are deliberately independent of these shapes.
export const CITY_LAYOUT = Object.freeze(Object.fromEntries(Object.values(DISTRICTS).map(d => {
  const points = districtPolygons.districts[d.id];
  if (!points) throw new Error(`Missing polygon for district: ${d.id}`);
  return [d.id, Object.freeze({id:d.id, points:Object.freeze(points.map(p=>Object.freeze([...p]))),
    path:pointsPath(points), center:Object.freeze(labels[d.id])})];
})));
export function containsPoint(points,x,y) {
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++) {
    const a=points[i],b=points[j];
    if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}

// Hover/inspection is presentation-only; it must never move the player or time.
export function createMapInspection(currentDistrict) {
  if(!DISTRICTS[currentDistrict])throw new Error('Unknown current district');
  let hovered=null,pinned=null;
  const validate=id=>{if(id!==null&&!DISTRICTS[id])throw new Error('Unknown district');};
  return {
    currentDistrict,
    get active(){return hovered??pinned;},
    get pinned(){return pinned;},
    hover(id){validate(id);hovered=id;},
    toggle(id){validate(id);pinned=pinned===id?null:id;hovered=null;},
    dismiss(){hovered=null;pinned=null;}
  };
}
