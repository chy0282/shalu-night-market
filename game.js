import {sound} from './sound.js';
import {initSoundSettings,soundButton} from './sound-settings.js';
import {guidePortrait} from './story-art.js';
import {buildWorld} from './world.js';
import {places,el,button,focusTitle} from './city.js';
import {showAtlas} from './atlas.js';
import {progress,finishPlace,seenFinale,newJourney} from './progress.js';
import {lanternImage} from './lanterns.js';

const id=name=>document.getElementById(name);
const screens=['welcome','story','hud','overlay','lesson-page','ending'];
let state='loading',round=null,near=null,destination=null,storyTimer=0,storyIndex=0,storyReady=false;
const signs=new Map(),reduce=matchMedia('(prefers-reduced-motion: reduce)');
const chapters=[
  '天黑了，沙呂城的夜市快要開門了。\n一陣大風吹來，四盞花燈都熄了。',
  '請到城裏的四個地方玩語文遊戲。\n每完成一個遊戲，你就會得到一盞花燈。',
  '跟着金色路標走，走進地上的金圈吧！\n集齊四盞花燈，夜市就會亮起來。'
];
function mode(name,screen){
  state=name;document.body.dataset.mode=name;
  sound.music(name==='welcome'?null:name==='story'||name==='lesson'?'reading':'exploring');
  worldCanvas().hidden=name==='lesson';
  screens.forEach(key=>id(key).hidden=key!==screen);
}
function imageLamp(p,lit,cls){
  const img=el('img',cls);img.src=lanternImage(p.id,lit);img.alt=p.lantern+(lit?'，已收集':'，待收集');return img;
}
function updateBag(){
  world.collection(progress.earned);
  const bag=id('bag');bag.replaceChildren();
  const icons=el('div','lamp-row');
  for(const p of places)icons.append(imageLamp(p,progress.earned.includes(p.id),'mini-lamp'));
  bag.append(icons,el('b','bag-count','花燈 '+progress.earned.length+' / 4'));
}
function selectDestination(p){
  sound.effect('tap');destination=p;world.select(p);toStreet();
}
function map(){
  if(state!=='explore')return;
  sound.effect('page');world.hold();mode('map','overlay');
  showAtlas(id('overlay'),{position:world.position,destination,earned:progress.earned,onPick:selectDestination,onClose:()=>{sound.effect('page');toStreet()},onFestival:finale});
}
function suggestDestination(){
  if(destination||progress.earned.length===places.length)return;
  const {x,z}=world.position;
  const next=places.filter(p=>!progress.earned.includes(p.id)).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
  destination=next;world.select(next);
}
function toStreet(){
  round=null;suggestDestination();mode('explore','hud');world.explore();id('map-open').focus({preventScroll:true});
}
async function enterPlace(p){
  if(state!=='explore')return;
  world.ignore(p);world.hold();
  if(destination?.id===p.id){destination=null;world.select(null)}
  mode('lesson','lesson-page');
  const panel=id('lesson-page');panel.className='workshop-page';
  const loading=el('article','workshop-loading','正在展開'+p.short+'的紙卷…');panel.replaceChildren(loading);
  let openWorkshop;
  try{({openWorkshop}=await import('./workshop.js'))}
  catch(error){
    console.error(error);loading.replaceChildren(el('p','','這卷題目暫時未能載入。'),button('返回古城','text-btn',toStreet));return;
  }
  round=openWorkshop(panel,p,progress.visits[p.id]||0,{
    back(place){sound.effect('page');world.ignore(place);toStreet()},
    complete(place){finishPlace(place.id);updateBag()},
    collect(place){world.ignore(place);if(progress.endingPending)finale();else{sound.effect('tap');toStreet()}}
  });
}
function walk({x,z,location,near:at}){
  if(state!=='explore')return;
  near=at;id('location').textContent=location;
  const prompt=id('reenter');prompt.hidden=!near;
  if(near)prompt.textContent=(progress.earned.includes(near.id)?'再玩':'進入')+near.short;
  const target=destination;
  const guide=id('guide');
  const close=places.find(p=>Math.hypot(p.x-x,p.z-z)<(p===target?7.5:4.5));
  const msg=close?(near?'已到'+close.name:'走進發光金圈'):target?target.bank+' · '+target.short:'走進金圈，再玩一組。';
  const help=close?(near?'可繼續逛，或再進入遊戲':close.name+' · '+close.topic):target?'跟隨金色路標，或用地圖換目的地':'四盞花燈已集齊';
  if(id('guide-name').textContent!==msg)id('guide-name').textContent=msg;
  if(id('guide-help').textContent!==help)id('guide-help').textContent=help;
  guide.classList.toggle('at-door',!!close);guide.classList.toggle('free',!target&&!close);
  id('guide-arrow').style.transform='rotate('+world.bearing+'deg)';
  for(const p of places){
    const sign=signs.get(p.id),point=world.markerPosition(p);
    const show=point.visible&&point.x>6&&point.x<94&&point.y>12&&point.y<86&&Math.hypot(x-p.x,z-p.z)<14.5;
    sign.hidden=!show;if(!show)continue;
    sign.style.left=point.x+'%';sign.style.top=point.y+'%';
    sign.classList.toggle('chosen',target===p);sign.classList.toggle('earned',progress.earned.includes(p.id));
  }
}
for(const p of places){
  const sign=el('div','world-sign');sign.textContent=p.short+' · '+p.topic;sign.style.setProperty('--ink',p.color);
  id('world-signs').append(sign);signs.set(p.id,sign);
}
function startExplore(){
  clearInterval(storyTimer);sound.typing(false);sound.effect('dreamEntry');mode('explore','hud');destination=null;world.startVisit(progress.earned.length===4&&!progress.endingPending);suggestDestination();world.explore();
  id('map-open').focus({preventScroll:true});if(progress.endingPending)finale();
}
function finishLine(){
  clearInterval(storyTimer);sound.typing(false);storyReady=true;id('story-line').textContent=chapters[storyIndex];
  id('story-next').textContent=storyIndex===chapters.length-1?'進入沙呂城':'繼續';
}
function showChapter(read=false){
  id('story-transcript').textContent=chapters[storyIndex];
  id('story-count').textContent=(storyIndex+1)+' / '+chapters.length;
  id('story-prev').hidden=storyIndex===0;
  clearInterval(storyTimer);storyReady=false;id('story-line').textContent='';
  id('story-next').textContent='顯示整段';
  if(read||reduce.matches){finishLine();return}
  sound.typing(true);
  const chars=Array.from(chapters[storyIndex]);let i=0;
  storyTimer=setInterval(()=>{id('story-line').textContent+=chars[i++];if(i>=chars.length)finishLine()},57);
}
function begin(){
  sound.unlock();sound.effect('tap');world.hold();mode('story','story');storyIndex=0;showChapter();id('story-next').focus();
}
id('story-next').addEventListener('click',()=>{
  if(!storyReady){finishLine();return}if(++storyIndex<chapters.length){sound.effect('page');showChapter()}else startExplore();
});
id('story-prev').addEventListener('click',()=>{if(storyIndex>0){sound.effect('page');storyIndex--;showChapter(true);if(storyIndex===0)id('story-next').focus()}});
id('walk-reader').append(guidePortrait('traveler'));
id('start').addEventListener('click',begin);
if(progress.earned.length){
  id('saved-visit').hidden=false;
  id('saved-visit').querySelector('span').textContent='上次已收集 '+progress.earned.length+' / 4 盞';
}
id('fresh-start').addEventListener('click',()=>{newJourney();updateBag();begin()});
id('map-open').addEventListener('click',map);
id('reenter').addEventListener('click',()=>{if(near)enterPlace(near)});
document.addEventListener('keydown',e=>{
  if(id('sound-panel').open)return;
  if(e.key==='Escape'&&state==='map'){sound.effect('page');toStreet()}
  else if(e.key==='Escape'&&state==='lesson')round?.close();
});
function finale(){
  sound.effect('dreamEntry');round=null;near=null;destination=null;mode('ending','ending');
  const card=id('ending').firstElementChild;card.hidden=true;card.replaceChildren();
  world.finale(()=>{
    seenFinale();
    const icons=el('div','festival-lamps');for(const p of places)icons.append(imageLamp(p,true,''));
    const title=el('h2','','沙呂城的夜市開張了！');
    const message=el('div','festival-message');message.append(title,el('p','','四盞花燈集齊了。看，四條街上的燈和西城門都亮起來了！'));
    card.append(icons,message);
    const actions=el('div','final-actions');
    actions.append(button('再逛夜市','primary',()=>{sound.effect('tap');mode('explore','hud');world.afterFinale()}),
      button('重新集燈','text-btn',()=>{newJourney();updateBag();world.setLit(false);begin()}));
    actions.prepend(soundButton());card.append(actions);card.hidden=false;focusTitle(card);
  });
}
const world=buildWorld(enterPlace,walk);
for(const screen of ['welcome','story'])id(screen).append(soundButton('sound-corner'));
id('hud').querySelector('.world-actions').prepend(soundButton());
initSoundSettings(()=>{if(state==='explore')world.hold()},()=>{if(state==='explore')world.explore()});
world.setLit(false);updateBag();
worldCanvas().addEventListener('webglcontextlost',event=>{
  event.preventDefault();clearInterval(storyTimer);sound.typing(false);sound.music(null);world.hold();
  id('loading').querySelector('small').textContent='畫面已暫停。重新整理可繼續探索，已收集的花燈會保留。';
  id('loading').hidden=false;
});
function worldCanvas(){return document.querySelector('body > canvas')}
mode('welcome','welcome');requestAnimationFrame(()=>{id('loading').hidden=true});
