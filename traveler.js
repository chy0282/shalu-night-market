import * as THREE from 'three';
import {paperMaterial} from 'papercraft/lib/paperkit-3d.js';

// A cut-and-fold sleeve with eight scored faces. Each face has its own section of the
// ink print, including a profile on the temples, so the traveler reads while crossing the bridge.
const ring=[[-.72,1],[.72,1],[1,.58],[1,-.58],[.72,-1],[-.72,-1],[-1,-.58],[-1,.58]];
function sleeve(rows,color,print){
  const paper=document.createElement('canvas');paper.width=1024;paper.height=128;
  const g=paper.getContext('2d');g.fillStyle=color;g.fillRect(0,0,paper.width,paper.height);
  for(let i=0;i<8;i++){
    g.save();g.translate(i*128,0);g.scale(128,128);g.beginPath();g.rect(0,0,1,1);g.clip();
    print?.(g,i);g.fillStyle='rgba(251,230,188,.19)';g.fillRect(0,0,.022,1);g.restore();
  }
  const map=new THREE.CanvasTexture(paper);map.colorSpace=THREE.SRGBColorSpace;
  const material=paperMaterial({map}),cap=paperMaterial({color});
  const vertices=[],uvs=[];
  const point=([y,w,d],i)=>[ring[i%8][0]*w,y,ring[i%8][1]*d];
  for(let k=0;k<rows.length-1;k++)for(let i=0;i<8;i++){
    const lo=rows[k],hi=rows[k+1],left=(i+.005)/8,right=(i+.995)/8;
    const v=row=>(row[0]-rows[0][0])/(rows.at(-1)[0]-rows[0][0]);
    const a=point(lo,i),b=point(lo,i+1),c=point(hi,i+1),d=point(hi,i);
    vertices.push(...a,...b,...c,...a,...c,...d);
    uvs.push(left,v(lo),right,v(lo),right,v(hi),left,v(lo),right,v(hi),left,v(hi));
  }
  const lidStart=vertices.length/3;
  for(const [row,top] of [[rows.at(-1),true],[rows[0],false]])for(let i=0;i<8;i++){
    const a=point(row,i),b=point(row,i+1);
    vertices.push(0,row[0],0,...(top?a:b),...(top?b:a));uvs.push(0,0,0,0,0,0);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geo.addGroup(0,lidStart,0);geo.addGroup(lidStart,vertices.length/3-lidStart,1);geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,[material,cap]);m.castShadow=m.receiveShadow=true;return m;
}
function patch(g,pts,color){
  g.fillStyle=color;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
}
function spot(g,x,y,rx,ry,color){g.beginPath();g.fillStyle=color;g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
const stripe=(g,y,h,c)=>{g.fillStyle=c;g.fillRect(0,y,1,h)};

export function traveler(H){
  const body=new THREE.Group();
  function put(rows,color,paint,x,y,z){
    const m=sleeve(rows,color,paint);m.position.set(x,y,z);body.add(m);return m;
  }
  const legs=[-.21,.21].map(x=>put([[0,.16,.23],[.16,.17,.22],[.51,.13,.14]],'#516072',g=>{
    stripe(g,.68,.32,'#3f3e3b');stripe(g,.88,.09,'#bfb49a');
  },x,0,.035));
  put([[0,.46,.32],[.42,.39,.26],[.95,.45,.29],[1.11,.26,.21]],'#3a7580',(g,i)=>{
    stripe(g,.83,.13,'#5b8c91');stripe(g,.89,.045,'#e5c88d');
    if(i===0){patch(g,[[0,0],[.16,0],[.71,.34],[.61,.43]],'#d6d5b6');patch(g,[[.76,0],[1,.02],[.31,.53],[.16,.52]],'#bdd2bb')}
    stripe(g,.54,.11,'#aa4933');stripe(g,.55,.028,'#dca85a');
  },0,.49,0);
  const arms=[-.49,.49].map(x=>put([[0,.11,.13],[.10,.145,.18],[.24,.165,.18],[.61,.14,.17],[.7,.08,.1]],'#4c8690',g=>{
    stripe(g,.63,.15,'#bad0b9');stripe(g,.78,.22,'#e9b18d');
  },x,.79,0));
  put([[0,.33,.26],[.18,.48,.36],[.52,.50,.37],[.78,.39,.31]],'#efbd95',(g,i)=>{
    if(i===0){
      patch(g,[[0,0],[1,0],[1,.31],[.78,.22],[.58,.31],[.64,.17],[.20,.31],[0,.34]],'#443b35');
      for(const x of [.24,.76]){spot(g,x,.52,.055,.069,'#463831');spot(g,x-.017,.50,.013,.016,'#f9e3be');spot(g,x,.71,.093,.034,'#da9c7a')}
      patch(g,[[.41,.75],[.54,.78],[.64,.72],[.56,.81],[.48,.81]],'#935e4e');
    }else if(i===1||i===7){
      stripe(g,0,.31,'#463b34');spot(g,.5,.55,.12,.085,'#513e35');spot(g,.47,.72,.23,.048,'#d89977');
    }else if(i===2||i===6){
      stripe(g,0,.57,'#453b35');spot(g,.5,.60,.27,.17,'#e5aa80');spot(g,.49,.62,.12,.08,'#bf8569');
    }else{stripe(g,0,.84,'#443a34');stripe(g,.1,.08,'#5c4c42')}
  },0,1.61,0);
  put([[0,.51,.39],[.15,.53,.4],[.29,.38,.31],[.38,.26,.21]],'#324b57',g=>{stripe(g,.58,.20,'#758d88');stripe(g,.8,.11,'#d1ae70')},0,2.22,0);
  put([[0,.18,.15],[.13,.21,.17],[.23,.16,.14]],'#493e38',g=>stripe(g,.68,.2,'#a45540'),0,2.57,-.03);
  const h=H.popup(null,null,{node:body,x:-6.65,z:1.35,height:2.80,level:true,sight:false,yaw:.29});
  H.setHero(h,{stride(distance,gait){
    const swing=Math.sin(distance*3.4)*gait;
    legs.forEach((leg,i)=>{const p=i?swing:-swing;leg.position.z=.035+p*.15;leg.position.y=Math.max(p,0)*.11});
    arms.forEach((arm,i)=>{arm.position.z=(i?-swing:swing)*.12});
  }});
  return h;
}
