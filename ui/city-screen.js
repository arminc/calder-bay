import { DISTRICTS } from './session.js';
import { CITY_LAYOUT, MAP_SIZE, createMapInspection } from './city-layout.js?v=20260914-2';
import { themes, CITY_ARTWORK } from './district-art.js';
import { renderClock } from './clock.js';
import { mountDistrictPreview } from './district-preview.js';

export function showCity(session){
const state=session.snapshot();
const inspection=createMapInspection(state.player.district);
const $=id=>document.getElementById(id);
const stage=$('map-stage'),card=$('district-card');
const names=id=>themes[id].name;
const current=CITY_LAYOUT[state.player.district];
const [px,py]=current.center;
// One uncut city illustration, fitted in full. No camera, zoom, drag or extra scenes.
// Names, regions, location and clock are entirely independent of the bitmap.
stage.innerHTML=`<svg id="city-map" class="${new URLSearchParams(location.search).has('debug-districts')?'debug-districts':''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}" preserveAspectRatio="none" role="group" aria-label="City map. Hover or focus a district to inspect it. Click Little Italy or the Docks to explore. Other districts show information; Escape dismisses it."><image href="${CITY_ARTWORK}" width="${MAP_SIZE.width}" height="${MAP_SIZE.height}" aria-hidden="true"/><g id="district-regions">${Object.values(CITY_LAYOUT).map(g=>`<path class="district-hit" data-district="${g.id}" d="${g.path}" tabindex="0" role="button" aria-label="${DISTRICTS[g.id].name}${g.id===state.player.district?', your current location':''}" aria-pressed="false"/><path class="district-outline" data-outline="${g.id}" d="${g.path}" aria-hidden="true"/>`).join('')}</g><g aria-hidden="true">${Object.values(CITY_LAYOUT).map(g=>`<text class="district-label${g.id===state.player.district?' current':''}" data-label="${g.id}" x="${g.center[0]}" y="${g.center[1]}">${names(g.id).toUpperCase()}</text>`).join('')}</g><g class="player-marker" transform="translate(${px} ${py+28})" role="img" aria-label="You are at ${names(current.id)}"><circle class="location-ring" r="11"/><path class="location-symbol" d="M0,-7L5,0 0,7 -5,0Z"/><rect x="-52" y="17" width="104" height="20" rx="1" fill="#241b15e8" stroke="#ae8d5d" stroke-width=".6"/><text y="31">YOU ARE HERE</text></g></svg>`;
const svg=$('city-map');
const preview=mountDistrictPreview();
$('district-preview-entry')?.remove();
const entry=document.createElement('button');
entry.id='district-preview-entry';entry.className='district-preview-entry';
entry.innerHTML='Explore district prototypes ↗<small>Little Italy · Single overview / The Docks · Connected streets</small>';
entry.addEventListener('click',()=>preview.open('little_italy'));
$('game').append(entry);
renderClock($('clock'), state.elapsedHours);
let pointer=null;

function positionCard(id){
  const game=$('game').getBoundingClientRect();
  const [x,y]=CITY_LAYOUT[id].center;
  const projected=new DOMPoint(x,y).matrixTransform(svg.getScreenCTM());
  const anchor=pointer??{x:projected.x,y:projected.y};
  const margin=12,gap=24,w=card.offsetWidth,h=card.offsetHeight;
  let left=anchor.x-game.left+gap,top=anchor.y-game.top+gap;
  if(left+w>game.width-margin)left=anchor.x-game.left-w-gap;
  if(top+h>game.height-margin)top=anchor.y-game.top-h-gap;
  card.style.left=`${Math.max(margin,Math.min(left,game.width-w-margin))}px`;
  card.style.top=`${Math.max(margin,Math.min(top,game.height-h-margin))}px`;
}
function render(){
  const id=inspection.active;
  for(const el of svg.querySelectorAll('[data-district]')){
    const active=el.dataset.district===id,pinned=el.dataset.district===inspection.pinned;
    el.classList.toggle('active',active);el.classList.toggle('pinned',pinned);
    el.setAttribute('aria-pressed',String(pinned));
    if(active)el.setAttribute('aria-describedby','district-card');else el.removeAttribute('aria-describedby');
  }
  for(const el of svg.querySelectorAll('[data-outline]')){
    const active=el.dataset.outline===id,pinned=el.dataset.outline===inspection.pinned;
    el.classList.toggle('active',active);el.classList.toggle('pinned',pinned);
  }
  for(const el of svg.querySelectorAll('[data-label]'))el.classList.toggle('active',el.dataset.label===id);
  card.hidden=!id;
  if(!id)return;
  $('district-name').textContent=names(id);
  $('district-description').textContent=DISTRICTS[id].description;
  $('district-location').hidden=id!==state.player.district;
  positionCard(id);
}
for(const region of svg.querySelectorAll('[data-district]')){
  const id=region.dataset.district;
  region.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;pointer={x:e.clientX,y:e.clientY};inspection.hover(id);render();});
  region.addEventListener('pointerleave',e=>{if(e.pointerType==='touch')return;inspection.hover(null);pointer=null;render();});
  region.addEventListener('focus',()=>{pointer=null;inspection.hover(id);render();});
  region.addEventListener('blur',()=>{inspection.hover(null);render();});
  region.addEventListener('click',e=>{
    if(preview.open(id)){inspection.dismiss();render();return;}
    pointer=e.detail?{x:e.clientX,y:e.clientY}:null;
    inspection.toggle(id);render();
    $('announcement').textContent=inspection.pinned?`${names(id)} selected. ${DISTRICTS[id].description}`:'District information dismissed.';
  });
  region.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();if(preview.open(id)){inspection.dismiss();render();return;}inspection.toggle(id);pointer=null;render();}
    const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if(moves[e.key]){
      e.preventDefault();const p=DISTRICTS[id].position,[dx,dy]=moves[e.key];
      const next=Object.values(DISTRICTS).find(d=>d.position.x===p.x+dx&&d.position.y===p.y+dy);
      if(next)svg.querySelector(`[data-district="${next.id}"]`).focus();
    }
  });
}
$('game').addEventListener('click',e=>{if(!e.target.closest('[data-district]')){inspection.dismiss();render();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){inspection.dismiss();render();}});
window.addEventListener('resize',()=>{if(inspection.active){pointer=null;positionCard(inspection.active);}});

}
