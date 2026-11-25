import {createHarness} from 'papercraft/harness.js';
import {house,willow,shrub,lampPost} from './paper-art.js';
import {addCityWalls} from './city-walls.js';
import {addLandmarks} from './landmarks.js';
import {places,townBounds,layout,portalRadius} from './city.js';
import {addDistricts} from './districts.js';
import {timberBridge} from './footbridges.js';
import {makePortals} from './portals.js';
import {installNightMarket} from './night.js';
import {makeTrail} from './wayfinding.js';
import {traveler} from './traveler.js';
import {printBanks,stoneBridge,skiff,bridgeZ} from './riverbank.js';

export function buildWorld(onApproach,onWalk){
const H=createHarness({
  play:true,rotate:true,heroHeight:2.8,ground:'#d3c8ac',stock:'#f5f0e4',
  bounds:{x0:-80,x1:80,z0:-82,z1:69},walkArea:townBounds,
  view:{pitch:44,yaw:8,dist:43,fov:27,target:[-1.8,1.05,-.15],follow:[1,-2]},
  subject:[-6.65,1.35],focus:[-3.3,1.4,1.35],walk:{step:.47,radius:.29},
  light:{mapSize:1024,shadowExtent:36,distance:95,key:'#fff1d8',keyDir:[-.84,1,.57],keyIntensity:2.5,fill:'#edf0df',fillIntensity:.86,leak:'#877661'},
  lens:{taps:12,maxBlur:8,focusBand:.38,ramp:.38,depthWeight:.52,exposure:.87,contrast:1.06,tint:[1,.995,1],greenDesat:.08,ao:.72,aoRadius:.82,hazeAmount:.12,grain:.005,shadowTint:'#474643',vignette:.055}
});
H.renderer.domElement.setAttribute('aria-label','沙呂城四個街區、三座橋和四個發光金圈');
const paperPieces=[];
function track(handle,radius){paperPieces.push({handle,radius});return handle}
printBanks(H);addCityWalls(H);stoneBridge(H);
timberBridge(H,-13,'#985a44','紅欄橋');timberBridge(H,17,'#625747','木棉橋');

// Houses on the central street lead out to the four neighbourhoods.
const residences=[
  [-11,-22.0,4.2,3.2,3,1.42,.10,14],[-30.9,24.5,4.8,3.8,3.55,1.7,.02,15],
  [27.0,3.9,4.4,2.2,2.8,1.4,-.02,13],[15.1,-22.1,4.6,3,3.2,1.5,-.10,14]
];
const homes=residences.map(([x,z,w,d,h,rise,yaw,r],i)=>({handle:track(house(H,{x,z,w,d,h,rise,yaw,seed:7+i}),r),w,h}));
const trees=[[-5.8,-3.0,.90],[-5.6,7.8,.80],[-12.4,3.75,.73],[5.4,-6,.84],[9.15,9.0,.79],[-5.2,-10.8,.73],[4.5,-15.5,.88],[-17,-8,.73]];
trees.forEach(([x,z,s],i)=>track(willow(H,x,z,s,i),12.7));
const groups=[[-8,5.5],[-15,2.9],[-18,-6],[-8.9,-6.4],[-9.1,9.2],[5.1,5.1],[12.7,3.6],[8.9,-7.1],[5,-10]];
groups.forEach(([x,z],i)=>{
  track(shrub(H,x,z,.59+(i%3)*.12,i%3===0),10.8);
  track(shrub(H,x+1.12,z+.37,.39+(i%2)*.09,i%3===0),10.5);
});
for(const [x,z] of [[-6.6,-.82],[6.65,-.88],[12.9,-1.4],[-14,1.9]])track(lampPost(H,x,z),12.2);
skiff(H,-1.45,7.2,1.30,1.04);skiff(H,1.6,-8.7,1.39,.88);
const landmarks=addLandmarks(H,track,layout);
const districtArt=addDistricts(H,track,layout);
for(const f of districtArt.footprints)H.walk.block((x,z)=>Math.abs(x-f.x)<f.rx&&Math.abs(z-f.z)<f.rz);
const portals=makePortals(H,places);
const hero=traveler(H);
const trail=makeTrail(H);
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let mode='welcome',selected=null,lastZone=null,elapsed=0,lit=false,hudTime=0,onFinaleEnd=null;
let endingFrom=null;
H.start();
const game=window.__papercraft;
const night=installNightMarket(H,[{handle:landmarks.tea,w:6.4,h:3.7},...homes,...districtArt.homes],landmarks);
function fold(snap=false){
  const {x,z}=hero.group.position;
  for(const {handle,radius} of paperPieces){
    const d=Math.hypot(handle.x-x,handle.z-z);
    const open=mode==='welcome'||mode==='ending'||(lit&&mode==='explore')||d<radius||(handle.open&&d<radius+1.6)?1:0;
    if(snap)handle.reset(open);
    else if(handle.open!==open){if(motion.matches)handle.reset(open);else handle.set(open,0)}
  }
}
function explore(snap=false){
  const {x,z}=hero.group.position;
  fold(snap);
  const near=places.find(p=>Math.hypot(x-p.x,z-p.z)<portalRadius);
  if(lastZone&&Math.hypot(x-lastZone.x,z-lastZone.z)>2.15)lastZone=null;
  if(near&&!lastZone){lastZone=near;onApproach(near);return}
  let location=near?.name;
  if(!location&&Math.abs(x)<5.7)location=[[-13,'紅欄橋'],[bridgeZ,'石拱橋'],[17,'木棉橋']].find(([cz])=>Math.abs(z-cz)<1.53)?.[1];
  if(!location)location=Math.abs(z-bridgeZ)<3?(x<-21?'西城門':'河心大街'):(z<bridgeZ?(x<0?layout.stage.bank:layout.tea.bank):(x<0?layout.books.bank:layout.boat.bank));
  onWalk({x,z,location,near,selected});
}
function wideDistance(){return Math.max(127,178/Math.max(.55,H.camera.aspect))}
H.onStep((t,dt)=>{
  elapsed+=dt;
  if(mode==='welcome'){
    const sweep=motion.matches ? .45 : (1-Math.cos(elapsed*.12))/2;
    game.look(2.8-sweep*5.4,10-sweep*21,61-sweep*5,1.45);
  }else if(mode==='explore'){
    night.update(dt,motion.matches);
    portals.update(elapsed,motion.matches);trail.update(hero.group.position.x,hero.group.position.z,selected,dt);
    hudTime-=dt;if(hudTime<=0){hudTime=.07;explore()}
  }else if(mode==='ending'){
    const progress=motion.matches?1:Math.min(1,elapsed/5.8);
    const ease=progress*progress*(3-2*progress);
    const {x,y,z,dist}=endingFrom;
    game.look(x*(1-ease),z*(1-ease)+3.4*ease,dist+(wideDistance()-dist)*ease,y*(1-ease)+1.15*ease);
    night.set(progress);fold();
    if(progress===1&&onFinaleEnd){const fn=onFinaleEnd;onFinaleEnd=null;fn()}
  }
});
const stick=document.getElementById('stick'),thumb=document.getElementById('thumb');
let pointer=null;
function moveStick(event){
  if(event.pointerId!==pointer)return;
  const box=stick.getBoundingClientRect(),limit=box.width*.32;
  const dx=event.clientX-box.left-box.width/2,dy=event.clientY-box.top-box.height/2;
  const len=Math.hypot(dx,dy),factor=Math.min(1,limit/(len||1));
  thumb.style.transform='translate('+dx*factor+'px,'+dy*factor+'px)';
  if(len<limit*.17){game.steer(null);return}
  const angle=H.view.yaw*Math.PI/180,cs=Math.cos(angle),sn=Math.sin(angle);
  game.steer(dx*cs+dy*sn,dy*cs-dx*sn);
}
function release(){
  const id=pointer;pointer=null;game.steer(null);thumb.style.transform='';
  if(id!==null&&stick.hasPointerCapture(id))stick.releasePointerCapture(id);
}
stick.addEventListener('pointerdown',event=>{
  if(mode!=='explore'||pointer!==null||event.button!==0)return;
  event.preventDefault();pointer=event.pointerId;stick.setPointerCapture(pointer);moveStick(event);
});
stick.addEventListener('pointermove',moveStick);
for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,event=>{if(event.pointerId===pointer)release()});
addEventListener('blur',release);
document.addEventListener('visibilitychange',()=>{if(document.hidden)release()});
function startVisit(isLit=false){
  portals.visible(true);lit=isLit;night.visit(isLit);mode='explore';lastZone=null;selected=null;trail.hide();
  game.restart();game.view.dist=43;game.place(layout.gate.x-2.8,layout.gate.z);hero.reset(1);fold(true);
  game.enableWalking(true);game.resume();explore(true);
}
game.enableWalking(false);fold(true);hero.reset(1);
return {
  hold(){mode='held';release();game.enableWalking(false);game.pause()},
  explore(){mode='explore';game.enableWalking(true);game.resume();explore()},
  startVisit,
  select(place){selected=place;trail.hide()},
  get bearing(){return trail.bearing},
  ignore(place){lastZone=place},
  get position(){const {x,z}=hero.group.position;return {x,z}},
  markerPosition(place){
    const point=new H.THREE.Vector3(place.x,2.6,place.z).project(H.camera);
    return {x:(point.x+1)*50,y:(1-point.y)*50,visible:point.z>=-1&&point.z<=1};
  },
  finale(done){
    night.beginFinale();mode='ending';portals.visible(false);lit=true;elapsed=0;selected=null;trail.hide();release();game.enableWalking(false);
    const p=H.target;endingFrom={x:p.x,y:p.y,z:p.z,dist:H.view.dist};
    onFinaleEnd=done;fold();game.resume();
  },
  afterFinale(){
    portals.visible(true);const {x,z}=hero.group.position;
    game.restart();game.view.dist=43;game.place(x,z);hero.reset(1);
    mode='explore';fold(true);game.enableWalking(true);game.resume();explore();
  },
  setLit(value){lit=value;if(value)night.visit(true);else night.welcome()},
  collection(ids){night.collection(ids)}
};
}
