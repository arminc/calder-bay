import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { createSession, createInitialState, applyAction, sequenceRandom, DISTRICTS } from '../ui/session.js';
import { themes, CITY_ARTWORK } from '../ui/district-art.js';
import { CITY_LAYOUT, containsPoint, createMapInspection } from '../ui/city-layout.js';

test('presentation session produces exactly the engine travel, work, housing and scouting outcomes', () => {
  const commands = [
    { type: 'travel', to: 'tenements', mode: 'public_transit' },
    { type: 'travel', to: 'docks', mode: 'walk' },
    { type: 'work', job: 'stevedore', district: 'docks' },
    { type: 'rest', home: 'harbor_house_hotel' },
    { type: 'scout_marks' }
  ];
  const draws=Array(100).fill(0.5);
  const session=createSession({random:sequenceRandom(draws)});
  let expected=createInitialState();
  const random=sequenceRandom(draws);
  for(const command of commands){
    const result=applyAction(expected,command,{random});
    assert.deepEqual(session.dispatch(command),result);
    expected=result.state;
  }
});

test('view snapshots and rejected commands cannot mutate simulation state', () => {
  const initialState=createInitialState();
  const session=createSession({initialState});
  initialState.player.money=999;
  session.snapshot().player.energy=0;
  const before=session.snapshot();
  assert.throws(()=>session.dispatch({type:'travel',to:'docks',mode:'walk'}),/already/);
  assert.deepEqual(session.snapshot(),before);
  assert.equal(before.player.money,40);
  assert.equal(before.player.energy,100);
});

test('one city illustration has a named, correctly placed hit region for every engine district', async () => {
  assert.deepEqual(Object.keys(themes).sort(),Object.keys(DISTRICTS).sort());
  assert.deepEqual(Object.keys(CITY_LAYOUT).sort(),Object.keys(DISTRICTS).sort());
  const png=await readFile(new URL(`../${CITY_ARTWORK}`,import.meta.url));
  assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
  for(const district of Object.values(DISTRICTS)) {
    const geometry=CITY_LAYOUT[district.id];
    assert.match(geometry.path,/^M/);
    assert.deepEqual(Object.values(CITY_LAYOUT).filter(g=>containsPoint(g.points,...geometry.center)).map(g=>g.id),[district.id]);
    for(const other of Object.values(DISTRICTS)) {
      if(other.position.y===district.position.y&&other.position.x>district.position.x)
        assert.ok(CITY_LAYOUT[other.id].center[0]>geometry.center[0]);
      if(other.position.x===district.position.x&&other.position.y>district.position.y)
        assert.ok(CITY_LAYOUT[other.id].center[1]>geometry.center[1]);
    }
  }
});

test('open harbor water is not part of a district hit region',()=>{
  for(const point of [[20,500],[300,950],[820,1000]])
    assert.equal(Object.values(CITY_LAYOUT).filter(g=>containsPoint(g.points,...point)).length,0);
});

test('hover, pin, leave and dismiss keep the starting location and engine state unchanged',()=>{
  const session=createSession(),before=session.snapshot();
  const map=createMapInspection(before.player.district);
  assert.equal(map.currentDistrict,'docks');
  assert.equal(map.active,null);
  map.hover('downtown');assert.equal(map.active,'downtown');
  map.hover(null);assert.equal(map.active,null);
  map.toggle('chinatown');assert.equal(map.active,'chinatown');
  map.hover('little_italy');assert.equal(map.active,'little_italy');
  map.hover(null);assert.equal(map.active,'chinatown');
  map.toggle('chinatown');assert.equal(map.active,null);
  map.toggle('docks');map.dismiss();assert.equal(map.active,null);
  assert.throws(()=>map.hover('missing'),/Unknown district/);
  assert.deepEqual(session.snapshot(),before);
});

test('engine files never depend on the removable presentation layer or browser globals', async () => {
  async function inspect(dir){
    for(const item of await readdir(dir,{withFileTypes:true})){
      const path=`${dir}/${item.name}`;
      if(item.isDirectory())await inspect(path);
      else if(path.endsWith('.js'))assert.doesNotMatch(await readFile(path,'utf8'),/from\s+['"][^'"]*ui\/|\b(?:window|document|localStorage)\./,path);
    }
  }
  await inspect(new URL('../src',import.meta.url).pathname);
});
