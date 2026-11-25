import {places} from './city.js';
const key='baizicheng.nightmarket.v1';
const ids=places.map(p=>p.id);
function fresh(){return {earned:[],visits:{},endingPending:false}}
function read(){
  try{
    const data=JSON.parse(localStorage.getItem(key));
    if(!data||typeof data!=='object')return fresh();
    const visits={};
    for(const id of ids){const n=data.visits?.[id];visits[id]=Number.isSafeInteger(n)&&n>0?n:0}
    const earned=ids.filter(id=>Array.isArray(data.earned)&&data.earned.includes(id));
    return {earned,visits,endingPending:earned.length===4&&data.endingPending===true};
  }catch{return fresh()}
}
export const progress=read();
function write(){try{localStorage.setItem(key,JSON.stringify(progress))}catch{/* The current visit still plays if storage is unavailable. */}}
export function finishPlace(id){
  const newLamp=!progress.earned.includes(id);
  if(newLamp)progress.earned.push(id);
  progress.visits[id]=(progress.visits[id]||0)+1;
  if(newLamp&&progress.earned.length===4)progress.endingPending=true;
  write();
}
export function seenFinale(){progress.endingPending=false;write()}
export function newJourney(){progress.earned=[];progress.endingPending=false;write()}
