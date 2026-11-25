import * as THREE from 'three';
import {PAPER_LIGHT} from 'papercraft/lib/paperkit-3d.js';
import {places} from './city.js';
import {lanternImage} from './lanterns.js';
import {bridgeZ,riverX} from './riverbank.js';

function glowMap(){
  const c=document.createElement('canvas');c.width=c.height=64;
  const g=c.getContext('2d'),gradient=g.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(255,230,169,1)');
  gradient.addColorStop(.23,'rgba(255,191,108,.71)');
  gradient.addColorStop(.60,'rgba(251,147,72,.20)');
  gradient.addColorStop(1,'rgba(230,103,42,0)');
  g.fillStyle=gradient;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);
}
function windowPrint(){
  const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
  const glow=g.createLinearGradient(0,0,0,96);glow.addColorStop(0,'#ffaa4f');glow.addColorStop(.58,'#ffdf92');glow.addColorStop(1,'#ffbf6c');
  g.fillStyle=glow;
  const ys=[0,20,34,76,96];for(let x=0;x<4;x++)for(let i=0;i<4;i++)g.fillRect(x*24+2,ys[i]+2,21,ys[i+1]-ys[i]-4);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function shadePrint(){
  const c=document.createElement('canvas');c.width=128;c.height=64;
  const g=c.getContext('2d'),wash=g.createLinearGradient(0,0,0,64);
  wash.addColorStop(0,'#c97c48');wash.addColorStop(.21,'#ffe4ae');
  wash.addColorStop(.53,'#fff9db');wash.addColorStop(.83,'#ffcf82');wash.addColorStop(1,'#bd6a38');
  g.fillStyle=wash;g.fillRect(0,0,128,64);
  for(let x=0;x<128;x+=16){
    g.fillStyle='#a25a3180';g.fillRect(x,0,1.6,64);
    g.fillStyle='#fff3c5b0';g.fillRect(x+2,0,1.2,64);
  }
  g.fillStyle='#a1592eac';g.fillRect(0,9,128,1);g.fillRect(0,55,128,1);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

// Keep the moon and sky readable on the matte stock. The gold comes chiefly from the lamps themselves.
function marketAtmosphere(H){
  const key=H.scene.children.find(o=>o.isDirectionalLight&&o.castShadow);
  const fill=H.scene.children.find(o=>o.isDirectionalLight&&!o.castShadow);
  const sky=H.scene.children.find(o=>o.isHemisphereLight);
  const lights=[
    [key,'#aec3ee',1.18,'#c2cde4',1.57],
    [fill,'#8f9ed0',.58,'#a6b5d1',.71],
    [sky,'#94a8d4',.57,'#aec4df',.63]
  ].map(([light,start,power,end,finalPower])=>({
    light,original:light.color.clone(),originalPower:light.intensity,start:new THREE.Color(start),
    power,end:new THREE.Color(end),finalPower
  }));
  const post=window.__papercraft.post;
  const evening={haze:'#475475',hazeStart:26,hazeEnd:100,hazeAmount:.30,
    vignetteColor:'#1d2039',vignette:.09,shadowTint:'#252b4a',shadowLift:.042};
  const dayGrade=Object.fromEntries([...Object.keys(evening),'exposure','tint'].map(k=>[k,post.o[k]]));
  const dayBackground=H.scene.background.clone(),dayBounce=sky.groundColor.clone(),dayLeak=PAPER_LIGHT.leak.value.clone();
  const duskBounce=new THREE.Color('#56506c'),litBounce=new THREE.Color('#897361');
  const duskLeak=new THREE.Color('#495877'),litLeak=new THREE.Color('#736780');
  const duskSky=new THREE.Color('#455376'),litSky=new THREE.Color('#65647a');
  let last=null;
  function apply(warmth){
    if(last!==null&&Math.abs(warmth-last)<.0001)return;
    if(last===null)Object.assign(post.o,evening);
    last=warmth;
    for(const p of lights){
      p.light.color.lerpColors(p.start,p.end,warmth);
      p.light.intensity=THREE.MathUtils.lerp(p.power,p.finalPower,warmth);
    }
    sky.groundColor.lerpColors(duskBounce,litBounce,warmth);
    PAPER_LIGHT.leak.value.lerpColors(duskLeak,litLeak,warmth);
    H.scene.background.lerpColors(duskSky,litSky,warmth);
    post.o.exposure=.76+.07*warmth;
    post.o.tint=[.97+.05*warmth,.985,1.045-.035*warmth];post.apply();
  }
  function restore(){
    last=null;
    for(const p of lights){p.light.color.copy(p.original);p.light.intensity=p.originalPower}
    sky.groundColor.copy(dayBounce);PAPER_LIGHT.leak.value.copy(dayLeak);
    H.scene.background.copy(dayBackground);Object.assign(post.o,dayGrade);post.apply();
  }
  return {apply,restore};
}

export function installNightMarket(H,homes,landmarks){
  const atmosphere=marketAtmosphere(H);
  // The bridge and the city gate are independent of the four collectable district lights.
  const bridgeField=places.length,gateField=bridgeField+1;
  const fields=Array.from({length:gateField+1},()=>({level:-1,materials:[],groups:[],lamps:[]}));
  const pane=new THREE.PlaneGeometry(1,1),glow=glowMap(),panes=windowPrint(),shade=shadePrint();
  const bulbShape=new THREE.SphereGeometry(.34,10,6),capShape=new THREE.CylinderGeometry(.22,.22,.075,10);
  const cordShape=new THREE.CylinderGeometry(.022,.022,.28,5);
  const amber=['#ffb764','#ffd18a','#ffd57d','#ffac68'];
  const prizeSites=[
    [landmarks.stage,-2.12,2.45,.72],[landmarks.books,-1.30,1.85,.47],
    [homes[0].handle,-2.56,2.47,.50],[landmarks.boat,.83,2.07,.67]
  ];
  const prizeCards=places.map((p,i)=>{
    const [handle,x,y,z]=prizeSites[i],print=new THREE.TextureLoader().load(lanternImage(p.id,true));
    print.colorSpace=THREE.SRGBColorSpace;
    const card=new THREE.Mesh(pane,new THREE.MeshBasicMaterial({map:print,transparent:true,alphaTest:.07,side:THREE.DoubleSide}));
    card.scale.setScalar(1.35);card.position.set(x,y,z);card.visible=false;
    handle.pivot.children[0].add(card);return card;
  });
  function ink(zone,color,extra={},max=1){
    const m=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false,...extra});
    fields[zone].materials.push([m,max]);return m;
  }
  function glowInk(zone,color,ceiling){
    const m=new THREE.SpriteMaterial({map:glow,color,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending});
    fields[zone].materials.push([m,ceiling]);return m;
  }
  function groupAt(zone,label){
    const group=new THREE.Group();group.name=label;H.scene.add(group);fields[zone].groups.push(group);return group;
  }
  function sprite(group,m,x,y,z,width,height=width){
    const obj=new THREE.Sprite(m);obj.position.set(x,y,z);obj.scale.set(width,height,1);group.add(obj);
  }
  function pool(group,mat,x,y,z,w,d){
    const obj=new THREE.Mesh(pane,mat);obj.rotation.x=-Math.PI/2;obj.position.set(x,y,z);obj.scale.set(w,d,1);group.add(obj);
  }
  function nearest(x,z){
    let best=Infinity,zone=0;
    places.forEach((p,i)=>{const d=Math.hypot(x-p.x,z-p.z);if(d<best){best=d;zone=i}});return zone;
  }
  for(const {handle,w,h} of homes){
    const zone=nearest(handle.x,handle.z),m=ink(zone,0xffffff,{map:panes,polygonOffset:true,polygonOffsetFactor:-2});
    for(const s of [-1,1]){
      const panel=new THREE.Mesh(pane,m);panel.position.set(w*.324*s,h*.425,.055);
      panel.scale.set(w*.2,h*.30,1);handle.pivot.children[0].add(panel);
    }
  }
  function repeated(group,geo,mat,positions){
    const batch=new THREE.InstancedMesh(geo,mat,positions.length),matrix=new THREE.Matrix4();
    positions.forEach(([x,y,z],i)=>batch.setMatrixAt(i,matrix.makeTranslation(x,y,z)));
    batch.instanceMatrix.needsUpdate=true;group.add(batch);
  }
  function lanterns(group,zone,coords,color){
    const rings=[],threads=[],halo=glowInk(zone,'#ffc879',.61);
    for(const [x,y,z] of coords){
      for(const s of [-1,1]){rings.push([x,y+s*.26,z]);threads.push([x,y+s*.39,z])}
      sprite(group,halo,x,y,z,2.40);
    }
    repeated(group,bulbShape,ink(zone,color,{map:shade}),coords);
    repeated(group,capShape,ink(zone,'#b56840'),rings);
    repeated(group,cordShape,ink(zone,'#bd6a3d'),threads);
  }
  const spills=fields.map((_,i)=>ink(i,'#ffcc86',{map:glow,blending:THREE.AdditiveBlending},.88));
  places.forEach((p,i)=>{
    const group=groupAt(i,p.short+'燈串'),points=[],bulbs=[];
    const wire=new THREE.LineBasicMaterial({color:'#9a7a58',transparent:true,depthWrite:false});
    fields[i].materials.push([wire,.92]);
    for(let k=0;k<=12;k++){
      const u=k/12;
      points.push(new THREE.Vector3(p.x-3.9+7.8*u,3.85+.1*u-.54*Math.sin(Math.PI*u),p.z-.8-.25*u));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),wire));
    for(let k=1;k<12;k+=2){const {x,y,z}=points[k];bulbs.push([x,y-.39,z])}
    lanterns(group,i,bulbs,amber[i]);
    const poles=[points[0],points[12]].map(pt=>[pt.x,pt.y/2,pt.z]);
    repeated(group,new THREE.CylinderGeometry(.055,.075,3.88,6),ink(i,'#956b4c'),poles);
    pool(group,spills[i],p.x,.10,p.z-.9,9.6,5.4);
    // One unshadowed practical per span lets the hero and shopfronts actually receive its light.
    // Constant light count avoids rebuilding every paper shader when a lantern is collected.
    const light=new THREE.PointLight(amber[i],0,11,2);
    light.position.set(p.x,2.55,p.z-.95);light.name=p.short+'燈光';H.scene.add(light);
    fields[i].lamps.push([light,28]);
  });
  const streetHalos=places.map((_,i)=>glowInk(i,'#ffc879',.64));
  const streetCores=places.map((_,i)=>glowInk(i,'#ffdf9e',.98));
  for(const handle of H.hinges){
    if(!handle.group.userData.streetLantern)continue;
    const zone=nearest(handle.x,handle.z);
    sprite(handle.pivot,streetHalos[zone],1.09,2.85,.065,2.8,2.6);
    sprite(handle.pivot,streetCores[zone],1.09,2.85,.08,.86,1.06);
  }
  // Light runs along the bridges at the end and catches in the strips of paper water below.
  const bridges=groupAt(bridgeField,'橋畔的燈影'),feet=[],bridgeLamps=[];
  for(const z of [-13,bridgeZ,17]){
    const bank=riverX(z),farSide=z-1.57;
    for(const side of [-1,1]){
      const x=bank+side*5.18;feet.push([x,1.06,farSide]);bridgeLamps.push([x,2.23,farSide]);
      pool(bridges,spills[bridgeField],x+side*.40,.10,z,4.3,3.2);
      for(let k=0;k<7;k++){
        const waterZ=farSide+1.1+k*.29,waterX=riverX(waterZ)+side*(2.8-.046*k)+.13*Math.sin(k*1.85+z);
        pool(bridges,spills[bridgeField],waterX,.052,waterZ,1.0+(k%3)*.28,.14);
      }
    }
  }
  repeated(bridges,new THREE.CylinderGeometry(.065,.088,2.12,6),ink(bridgeField,'#896044'),feet);
  lanterns(bridges,bridgeField,bridgeLamps,'#ffcc78');
  const gate=landmarks.gate;
  if(gate){
    const bracket=new THREE.Group();gate.pivot.add(bracket);fields[gateField].groups.push(bracket);
    lanterns(bracket,gateField,[[-1.36,2.96,.28],[1.36,2.96,.28]],'#ffc16a');
    const foot=groupAt(gateField,'西城門的燈光');pool(foot,spills[gateField],gate.x,.12,gate.z,7.2,4.2);
  }
  function level(zone,value){
    const f=fields[zone],on=value>.001;
    if(f.level===value)return;
    f.level=value;
    for(const [m,maximum] of f.materials){m.opacity=value*maximum;m.visible=on}
    for(const g of f.groups)g.visible=on;
    for(const [lamp,power] of f.lamps)lamp.intensity=value*power;
  }
  function lightSky(){
    const streets=places.reduce((total,p,i)=>total+fields[i].level,0)/places.length;
    atmosphere.apply(.40*streets+.26*fields[bridgeField].level+.34*fields[gateField].level);
  }
  const localStrength=.66;
  let earned=new Set(),mode='welcome',replaying=false,base=[],lastFinale=-1;
  function collection(ids){
    earned=new Set(ids);
    prizeCards.forEach((card,i)=>{card.visible=mode!=='welcome'&&earned.has(places[i].id)});
  }
  function welcome(){
    mode='welcome';atmosphere.restore();fields.forEach((_,i)=>level(i,0));prizeCards.forEach(c=>c.visible=false);
  }
  function visit(fullyLit=false){
    mode=fullyLit?'lit':'explore';lastFinale=-1;
    fields.forEach((_,i)=>level(i,fullyLit?1:earned.has(places[i]?.id)?localStrength:0));
    collection(earned);lightSky();
  }
  function update(dt,reducedMotion){
    if(mode!=='explore')return;
    let changed=false;
    places.forEach((p,i)=>{
      const target=earned.has(p.id)?localStrength:0,from=fields[i].level;
      if(from===target)return;
      const step=reducedMotion?1:1-Math.exp(-3.0*dt),value=from+(target-from)*step;
      level(i,Math.abs(value-target)<.001?target:value);changed=true;
    });
    if(changed)lightSky();
  }
  function beginFinale(){
    replaying=mode==='lit';mode='finale';base=fields.map(f=>f.level);lastFinale=-1;
  }
  function set(t){
    if(t===lastFinale)return;
    if(mode!=='finale'&&mode!=='lit')beginFinale();
    lastFinale=t;
    const curtain=replaying?1-.52*THREE.MathUtils.smoothstep(t,0,.19):1;
    for(let i=0;i<fields.length;i++){
      const at=[.06,.17,.29,.40,.55,.71][i],ease=THREE.MathUtils.smoothstep(t,at,at+.25);
      const v=base[i]*curtain;level(i,v+(1-v)*ease);
    }
    lightSky();if(t===1)mode='lit';
  }
  welcome();return {welcome,visit,collection,update,beginFinale,set};
}
