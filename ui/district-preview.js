import { renderLittleItaly } from './little-italy-scene.js';
import { PREVIEW_DISTRICTS, visiblePlaces } from './district-preview-data.js';
const labels = { shops: 'Shop', work: 'Work', crime: 'Crime' };
const symbols = { shops: '◇', work: '⚒', crime: '♠' };

// A shared architectural renderer: location records and staging remain separate.
function building(p, index, x, y, width, dock) {
  const height = (dock ? 116 : 154) + (index % 3) * 20;
  const colors = dock ? ['#596461', '#69716b', '#485553'] : ['#98755c', '#b09573', '#836755'];
  const windows = Array.from({ length: dock ? 4 : 6 }, (_, i) => {
    const wx = 17 + (i % 3) * ((width - 34) / 3), wy = -height + 30 + Math.floor(i / 3) * 38;
    return `<rect x="${wx}" y="${wy}" width="19" height="27" fill="${i % 3 === 1 ? '#d9b778' : '#303d3b'}" stroke="#342f28" stroke-width="3"/><path d="M${wx + 9} ${wy}v27M${wx} ${wy + 12}h19" stroke="#8f8067"/>`;
  }).join('');
  return `<g transform="translate(${x} ${y})"><path d="M0 0l-15 -9v-${height}l15 9" fill="#3d3d35"/><rect y="-${height}" width="${width}" height="${height}" fill="${colors[index % 3]}"/><path d="M-6 -${height}h${width + 12}v-9H-6z" fill="#393e37"/><path d="M0 -${height - 10}h${width}" stroke="#d0b791" opacity=".5"/>${windows}<rect x="14" y="-53" width="${width - 28}" height="53" fill="#263733" stroke="#514939" stroke-width="4"/><rect x="${width / 2 - 12}" y="-49" width="24" height="49" fill="#172925"/><path d="M${width / 2} -42v34" stroke="#a59267"/><rect x="8" y="-76" width="${width - 16}" height="22" fill="#d6c39a"/><text x="${width / 2}" y="-61" text-anchor="middle" fill="#342e25" font-size="${width < 180 ? 10 : 13}" letter-spacing="1">${p.name.toUpperCase()}</text>${p.kind === 'shops' ? `<path d="M8 -53h${width - 16}l9 15H-1z" fill="${dock ? '#7b8b84' : '#803e32'}"/><path d="M20 -53l-3 15m27 -15l-1 15m27 -15v15m27 -15l2 15" stroke="#d9c9a2" stroke-width="9"/>` : ''}<path d="M-10 4h${width + 24}l18 10H0z" fill="#b4aa8b" opacity=".65"/></g>`;
}
function scene(d, layout, street, filter, selected) {
  const dock = d === PREVIEW_DISTRICTS.docks;
  const places = visiblePlaces(d, layout, street);
  const points = places.map((p, i) => layout === 'overview' ? { x: 65 + (i < 4 ? i : i - 4) * 255 + (i < 4 ? 0 : 105), y: i < 4 ? 330 : 570, w: 190 } : { x: 90 + i * 325, y: 475 + (i % 2) * 22, w: 255 });
  return `<div class="dp-art"><svg viewBox="0 0 1100 680" role="img" aria-label="${d.name}: ${layout === 'overview' ? 'district overview' : d.streets[street]}"><defs><linearGradient id="dp-sky" x2="0" y2="1"><stop stop-color="${dock ? '#556c70' : '#9c9a7a'}"/><stop offset="1" stop-color="#d0ba8f"/></linearGradient><pattern id="dp-cobbles" width="32" height="14" patternUnits="userSpaceOnUse"><path d="M0 0h32M0 14h32M16 0v7M0 7h32M5 7v7" fill="none" stroke="#b0a68d" stroke-opacity=".16"/></pattern></defs><rect width="1100" height="680" fill="url(#dp-sky)"/><circle cx="855" cy="105" r="45" fill="#e8d5a0" opacity=".55"/><g fill="#4a5751" opacity=".32">${Array.from({ length: 15 }, (_, i) => `<rect x="${i * 80}" y="${155 - i % 4 * 23}" width="67" height="160"/>`).join('')}</g>${dock ? '<path d="M50 270h1000v130H50z" fill="#748f8d"/><path d="M650 242h360l-40 42H690z" fill="#334746"/><path d="M820 242V125m0 10l125 93H820M150 270V72l175 40-175 14m120 -10v110" fill="none" stroke="#374946" stroke-width="7"/>' : '<path d="M20 125Q450 220 1050 142" fill="none" stroke="#524f3e" stroke-width="2"/><path d="M335 163v30h30v-27m30 5v29h22v-26m44 3v27h32v-26" fill="#ded2ad"/>'}<path d="M0 290L1100 320V680H0z" fill="${dock ? '#465553' : '#696957'}"/><path d="M0 290L1100 320V680H0z" fill="url(#dp-cobbles)"/><path d="M0 435L1100 460M0 455L1100 480" stroke="#c4b793" opacity=".3" stroke-width="3"/>${places.map((p, i) => building(p, i, points[i].x, points[i].y, points[i].w, dock)).join('')}<g fill="#242f2c" stroke="#242f2c" stroke-width="3">${[80, 380, 740, 1020].map((x, i) => `<g transform="translate(${x} ${620 - i % 2 * 190})"><circle cy="-25" r="5"/><path d="M-8 -30h16M0 -20v18m0 -13l-7 9m7 -9l7 9M0 -2l-5 14M0 -2l5 14"/></g>`).join('')}</g><g stroke="#303d36" fill="#e1c38c" stroke-width="4"><path d="M45 540V380m-9 0h18l-3 21H39zM1050 580V420m-9 0h18l-3 21h-12z"/></g></svg>${places.map((p, i) => `<button class="dp-pin ${p.kind} ${selected === p.id ? 'selected' : ''}" data-place="${p.id}" style="left:${(points[i].x + points[i].w / 2) / 11}%;top:${(points[i].y + 30) / 6.8}%" ${filter !== 'all' && filter !== p.kind ? 'hidden' : ''} aria-label="${p.name}, ${labels[p.kind]}" aria-pressed="${selected === p.id}"><span>${symbols[p.kind]}</span> ${p.name}</button>`).join('')}</div>`;
}
export function mountDistrictPreview({ onClose = () => {} } = {}) {
  document.getElementById('district-preview')?.remove();
  const root = document.createElement('section');
  root.id = 'district-preview'; root.hidden = true; root.setAttribute('aria-label', 'District exploration prototype');
  document.body.append(root);
  let directoryOpen = false, legacy = false;
  let districtId, layout, street = 0, filter = 'all', selected = null, result = false, returnFocus;
  function render(focusKey) {
    const d = PREVIEW_DISTRICTS[districtId], p = d.places.find(p => p.id === selected);
    const painted = districtId === 'little_italy' && !legacy;
    root.classList.toggle('li-immersive', painted);
    if(painted) {
      root.innerHTML = renderLittleItaly({ district: d, filter, selected, result, directoryOpen });
      if(focusKey) root.querySelector(focusKey)?.focus();
      return;
    }
    root.innerHTML = `<header class="dp-header"><button data-back>← City map</button><span>CALDER BAY <i>/</i> DISTRICT EXPLORATION</span><div class="dp-comparison"><button data-district="little_italy" aria-pressed="${districtId === 'little_italy'}">Little Italy</button><button data-district="docks" aria-pressed="${districtId === 'docks'}">The Docks</button></div></header><div class="dp-heading"><div><p class="dp-eyebrow">${layout === 'overview' ? '01 / THE WHOLE NEIGHBORHOOD' : '02 / STREET BY STREET'}</p><h1>${d.name}</h1><p>${d.atmosphere}</p></div><div class="dp-layout" aria-label="Compare layouts"><button data-layout="overview" aria-pressed="${layout === 'overview'}">Single overview</button><button data-layout="streets" aria-pressed="${layout === 'streets'}">Connected streets</button></div></div><div class="dp-body"><div class="dp-world"><div class="dp-scene-heading"><span>${layout === 'overview' ? 'The neighborhood' : d.streets[street]}</span><small>${visiblePlaces(d, layout, street, filter).length} locations shown</small></div>${scene(d, layout, street, filter, selected)}<nav class="dp-streets" aria-label="Streets">${layout === 'streets' ? d.streets.map((s, i) => `<button data-street="${i}" aria-pressed="${street === i}"><small>0${i + 1}</small> ${s} <span>→</span></button>`).join('') : '<p>One neighborhood, all seven locations. Select a sign to take a closer look.</p>'}</nav><p class="dp-caption">${layout === 'overview' ? 'Shopfronts, honest work, and the spaces in between.' : d.captions[street]}</p></div><aside class="dp-directory"><p class="dp-eyebrow">DISTRICT DIRECTORY</p><div class="dp-filters" aria-label="Location categories">${['all', 'shops', 'work', 'crime'].map(f => `<button data-filter="${f}" aria-pressed="${filter === f}">${f === 'all' ? 'All' : f === 'shops' ? 'Shops' : labels[f]}</button>`).join('')}</div><div class="dp-list">${d.places.filter(p => filter === 'all' || p.kind === filter).map(p => `<button data-place="${p.id}" aria-pressed="${selected === p.id}"><span class="dp-symbol ${p.kind}">${symbols[p.kind]}</span><span>${p.name}<small>${labels[p.kind]} · ${d.streets[p.street]}</small></span><span>↗</span></button>`).join('')}</div>${p ? `<article class="dp-details"><div class="dp-detail-top"><p class="dp-eyebrow">${labels[p.kind]} / ${d.streets[p.street]}</p><button data-dismiss aria-label="Close location details">×</button></div><h2>${p.name}</h2><p>${p.description}</p><button class="dp-action" data-action>${p.kind === 'work' ? 'Ask about the work' : p.kind === 'crime' ? 'Observe the scene' : 'Step inside'} →</button><p class="dp-result" role="status">${result ? p.outcome : ''}</p></article>` : '<div class="dp-empty"><span>◇</span><h2>Get to know the neighborhood.</h2><p>Select a place in the scene or directory to look around.</p></div>'}</aside></div><footer class="dp-footer"><span>EXPLORATION PROTOTYPE</span> Fictional encounters · no time, money, or save changes</footer>`;
    if (focusKey) root.querySelector(focusKey)?.focus();
  }
  function close() { root.hidden = true; document.getElementById('game').inert = false; onClose(); returnFocus?.focus(); }
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-back')) return close();
    if (b.dataset.district) { open(b.dataset.district, false); return; }
    if (b.hasAttribute('data-directory')) { directoryOpen = !directoryOpen; selected = null; result = false; render(directoryOpen ? '#li-directory [data-directory]' : '.li-places-toggle'); return; }
    if (b.hasAttribute('data-legacy')) { legacy = true; render('[data-layout]'); return; }
    if (b.dataset.layout) { layout = b.dataset.layout; if (selected) street = PREVIEW_DISTRICTS[districtId].places.find(p => p.id === selected).street; render(`[data-layout="${layout}"]`); }
    if (b.dataset.street !== undefined) { street = Number(b.dataset.street); selected = null; result = false; render(`[data-street="${street}"]`); }
    if (b.dataset.filter) { filter = b.dataset.filter; selected = null; result = false; render(`[data-filter="${filter}"]`); }
    if (b.dataset.place) { directoryOpen = false; selected = b.dataset.place; street = PREVIEW_DISTRICTS[districtId].places.find(p => p.id === selected).street; result = false; render('.dp-action'); }
    if (b.hasAttribute('data-dismiss')) { const previous = selected; selected = null; result = false; render(`[data-place="${previous}"]`); }
    if (b.hasAttribute('data-action')) { result = true; root.querySelector('.dp-result').textContent = PREVIEW_DISTRICTS[districtId].places.find(p => p.id === selected).outcome; }
  });
  root.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); if(selected) { const previous = selected; selected = null; result = false; render(`[data-place="${previous}"]`); } else if(directoryOpen) { directoryOpen = false; render('.li-places-toggle'); } else close(); } });
  function open(id, captureFocus = true) {
    if (!PREVIEW_DISTRICTS[id]) return false;
    if (captureFocus) returnFocus = document.activeElement;
    directoryOpen = false; legacy = false;
    districtId = id; layout = PREVIEW_DISTRICTS[id].defaultLayout; street = 0; filter = 'all'; selected = null; result = false;
    document.getElementById('game').inert = true; root.hidden = false; render('[data-back]'); return true;
  }
  return { open };
}
