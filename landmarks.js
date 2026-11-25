import * as THREE from 'three';
import {cut,house} from './paper-art.js';

const paper = '#efe3c5', ink = '#453b34', timber = '#825441';
const vermilion = '#a4453f', gold = '#d6b56d', jade = '#536f66';
const tau = Math.PI * 2;

function box(g, x, y, width, height, colour) {
  g.fillStyle = colour;
  g.fillRect(x, y, width, height);
}

function polygon(g, points, colour) {
  g.fillStyle = colour;
  g.beginPath();
  points.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y));
  g.closePath();
  g.fill();
}

function stroke(g, points, colour, width) {
  g.strokeStyle = colour;
  g.lineWidth = width;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.beginPath();
  points.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y));
  g.stroke();
}

function ellipse(g, x, y, rx, ry, colour) {
  g.fillStyle = colour;
  g.beginPath();
  g.ellipse(x,y,rx,ry,0,0,tau);
  g.fill();
}

function text(g, value, x, y, height, colour) {
  g.save();
  g.translate(x,y);
  // Texture space has +Y pointing up. Font coordinates have +Y pointing down.
  g.scale(1,-1);
  g.fillStyle = colour;
  g.font = 'bold ' + height + 'px "Songti TC","PMingLiU","Microsoft JhengHei",serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(value,0,0);
  g.restore();
}

const rectangle = (x,y,w,h) => [[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
const openAmount = p => THREE.MathUtils.smoothstep(p,0,1);

// All folds have zero depth in their closed state except the thickness of the
// stacked card. The harness hinge then takes that stack down to the ground.
function paperAssembly(H) {
  const node = new THREE.Group(), folds = [];
  function panel(outline, paint, {x=0,y=0,z=0,tilt=0,angle=0,thickness=.055,print=33} = {}) {
    const mesh = cut(H,outline,paint,{thickness,pxPerUnit:print,edgeWidth:.035});
    const layer = folds.length * .018;
    node.add(mesh);
    folds.push(t => {
      mesh.position.set(x,y,layer+(z-layer)*t);
      mesh.rotation.set(tilt*t,angle*t,0,'YXZ');
    });
    return mesh;
  }
  node.userData.follow = p => {
    const t = openAmount(p);
    for (const fold of folds) fold(t);
  };
  node.userData.follow(1);
  return {node,panel};
}

function printPlaque(g, word, x, y, w, h) {
  box(g,x-w/2,y-h/2,w,h,ink);
  box(g,x-w/2+.055,y-h/2+.045,w-.11,h-.09,gold);
  box(g,x-w/2+.095,y-h/2+.085,w-.19,h-.17,'#344a46');
  text(g,word,x,y+.012,h*.66,'#fae6b0');
}

// A carved ear at either end and curved tile courses give the roof its turned-up silhouette.
function roofStrip(assembly,w,y,z,depth,colour='#4b585b') {
  const e=w/2;
  const outline=[[-e-.28,.38],[-e,.30],[-e+.34,.12],[-e+.72,.02],[e-.72,.02],
    [e-.34,.12],[e,.30],[e+.28,.38],[e+.12,.08],[e-.16,-.14],
    [e-.49,-.23],[-e+.49,-.23],[-e+.16,-.14],[-e-.12,.08]];
  assembly.panel(rectangle(-e,0,w,depth),P=>{
    P.fill(colour);
    const g=P.g;
    for(let x=-e+.10;x<e;x+=.24) {
      stroke(g,[[x,0],[x,depth]],'#2e4045',.075);
      stroke(g,[[x+.07,0],[x+.07,depth]],'#85877a',.045);
    }
    for(let v=.27;v<depth;v+=.34) stroke(g,[[-e,v],[e,v]],'#4a5555',.045);
  },{y,z,tilt:-1.13});
  assembly.panel(outline,P=>{
    P.fill('#424e50');
    stroke(P.g,[[-e-.12,.23],[-e+.21,-.005],[-e+.61,-.09],
      [e-.61,-.09],[e-.21,-.005],[e+.12,.23]],gold,.056);
  },{y,z:z+.066});
}

function landscape(g,left,bottom,w,h) {
  g.save();
  g.translate(left,bottom);g.scale(w,h);
  box(g,0,0,1,1,'#e4d5b0');
  ellipse(g,.72,.71,.095,.115,'#dab879');
  polygon(g,[[0,.15],[0,.45],[.13,.63],[.22,.59],[.34,.77],[.53,.46],
    [.67,.67],[.83,.45],[1,.60],[1,.08]],'#99a393');
  polygon(g,[[0,.03],[0,.38],[.17,.54],[.32,.26],[.52,.50],[.69,.31],[.83,.43],[1,.26],[1,0]],'#667e71');
  polygon(g,[[0,0],[0,.14],[.18,.21],[.33,.13],[.63,.18],[.79,.11],[1,.15],[1,0]],'#b7ad84');
  stroke(g,[[.04,.102],[.19,.13],[.30,.088],[.56,.12],[.69,.095]],'#e4d5aa',.018);
  g.restore();
}

function stage(H,{x,z}) {
  const a=paperAssembly(H), w=5.8, h=3.80;
  // Painted backcloth, front proscenium, two freestanding shadow puppets.
  a.panel(rectangle(-2.65,.45,5.3,2.95),P=>landscape(P.g,-2.65,.45,5.3,2.95),{z:-1.02});
  for (const side of [-1,1]) {
    a.panel(rectangle(0,.07,1.35,3.45),P=>{
      P.fill('#9d785b');
      for(let x=.07;x<1.35;x+=.27) box(P.g,x,.11,.075,3.34,'#715440');
    },{x:side*2.68,z:-.01,angle:Math.PI/2});
  }
  const puppet=[[-.44,.05],[-.26,.40],[-.17,.65],[-.43,.91],[-.50,.89],[-.54,1],
    [-.43,1.07],[-.18,.94],[-.08,1.15],[-.20,1.25],[-.22,1.47],[-.12,1.62],
    [-.01,1.67],[.21,1.58],[.22,1.43],[.31,1.34],[.19,1.28],[.15,1.15],[.35,1.04],
    [.54,1.13],[.64,1.12],[.62,.98],[.37,.82],[.21,.83],[.26,.56],[.44,.07]];
  for (const [x,colour,flip] of [[-.75,vermilion,1],[.81,'#426c76',-1]]) {
    a.panel(puppet.map(([u,v])=>[x+u*flip,v+.56]),P=>{
      P.fill(colour);const g=P.g;
      g.save();g.translate(x,.56);g.scale(flip,1);
      polygon(g,[[-.20,1.57],[.2,1.53],[.22,1.39],[.31,1.34],[.19,1.25],[.05,1.15],[-.17,1.25]],paper);
      stroke(g,[[-.14,1.46],[.03,1.39],[.14,1.42]],ink,.045);
      ellipse(g,.18,1.36,.025,.026,ink);
      stroke(g,[[-.12,1.12],[.15,.94],[-.16,.71]],gold,.08);
      box(g,-.24,.54,.57,.10,'#cead72');
      for(let i=0;i<3;i++) stroke(g,[[.03+i*.09,.48],[.10+i*.12,.10]],'#e2c691',.032);
      g.restore();
    },{z:-.44});
  }
  a.panel(rectangle(-2.74,0,5.48,.51),P=>{
    P.fill('#754635');
    for(let x=-2.55;x<2.65;x+=.61){
      box(P.g,x,.07,.48,.32,'#c19066');box(P.g,x+.055,.12,.37,.22,'#94664b');
      polygon(P.g,[[x+.12,.23],[x+.24,.30],[x+.36,.23],[x+.24,.16]],gold);
    }
  },{z:.12});
  a.panel(rectangle(-2.72,0,5.44,1.23),P=>{
    P.fill('#bb926d');for(let x=-2.50;x<2.7;x+=.32) box(P.g,x,0,.024,1.23,timber);
  },{y:.51,z:.12,tilt:-Math.PI/2});
  const curtain=[[-2.77,.43],[-2.68,3.49],[2.68,3.49],[2.77,.43],[2.39,.43],
    [2.12,.57],[2.28,1.49],[2.18,1.79],[1.83,2.15],[1.45,2.65],[.95,2.88],
    [.52,2.67],[0,2.83],[-.52,2.67],[-.95,2.88],[-1.45,2.65],[-1.83,2.15],
    [-2.18,1.79],[-2.28,1.49],[-2.12,.57],[-2.39,.43]];
  a.panel(curtain,P=>{
    P.fill('#a84744');const g=P.g;
    for(const s of [-1,1]){
      for(let i=0;i<4;i++){
        stroke(g,[[s*(1.15+i*.29),3.19],[s*(1.58+i*.2),2.45],[s*(2.31+i*.092),1.71]],i%2?'#803c39':'#cb6b54',.09);
      }
      stroke(g,[[s*2.18,1.63],[s*2.51,1.59],[s*2.73,1.74]],gold,.115);
      stroke(g,[[s*2.56,1.59],[s*2.62,1.12]],gold,.039);
    }
    box(g,-2.7,3.17,5.4,.16,'#c68b52');
    stroke(g,[[-1.41,2.79],[-.95,2.93],[-.52,2.75],[0,2.90],[.52,2.75],[.95,2.93],[1.41,2.79]],gold,.063);
  },{z:.19});
  a.panel(rectangle(-2.88,3.35,5.76,.51),P=>{
    P.fill('#644b3f');
    for(const s of [-1,1])for(let j=0;j<4;j++)ellipse(P.g,s*(1.14+j*.41),3.52,.10,.075,gold);
  },{z:.25});
  roofStrip(a,w,h,.35,1.85);
  a.panel(rectangle(-.86,0,1.72,.48),P=>printPlaque(P.g,'戲棚',0,.24,1.72,.48),
    {y:3.03,z:.37,print:47});
  H.walk.block((px,pz)=>Math.abs(px-x)<2.87&&pz>z-1.61&&pz<z+.26);
  return H.popup(null,null,{node:a.node,x,z,height:4.7,yaw:0,level:true,sight:false});
}

function boundBook(g,x,y,w,h,colour) {
  // Each thread-bound volume has an exposed page edge, stitching and a title slip.
  box(g,x+.025,y-.02,w,h,'#705b44');box(g,x,y,w,h,colour);
  box(g,x+.025,y+.015,w-.055,h*.17,'#e2d4ab');
  stroke(g,[[x+w*.14,y+h*.22],[x+w*.14,y+h*.92]],paper,.018);
  for(let i=0;i<3;i++)stroke(g,[[x+.018,y+h*(.32+i*.21)],[x+w*.14,y+h*(.36+i*.21)]],paper,.02);
  box(g,x+w*.62,y+h*.38,w*.23,h*.47,paper);
}

function books(H,{x,z}) {
  const a=paperAssembly(H), w=3.52;
  a.panel(rectangle(-1.56,.32,3.12,1.99),P=>{
    P.fill('#b8a282');const g=P.g;
    box(g,-1.50,.52,3,1.58,'#715c49');
    const covers=['#557772','#a65e4a','#72778c','#af895a'];
    for(let i=0;i<6;i++){
      const xx=-1.41+i*.46;
      boundBook(g,xx,1.39,.36,.51+(i%2)*.10,covers[i%4]);
      for(let n=0;n<3;n++)boundBook(g,xx,.64+n*.15,.40,.12,covers[(n+i)%4]);
    }
    box(g,-1.54,1.24,3.08,.11,'#b48b62');
  },{z:-.65});
  a.panel(rectangle(-1.65,0,3.3,.71),P=>{
    P.fill('#6c5746');box(P.g,-1.65,.49,3.3,.13,'#b18f6b');
    for(let i=0;i<3;i++){const x=-1.43+i*.98;box(P.g,x,.08,.87,.34,'#364e4c');box(P.g,x+.04,.11,.79,.26,jade)}
  });
  a.panel(rectangle(-1.67,0,3.34,.77),P=>{
    P.fill('#c6ad86');
    for(const [i,c] of ['#536e7f','#b66d51','#70876c'].entries()){
      boundBook(P.g,-1.35+i*.87,.15,.66,.47,c);
    }
  },{y:.71,tilt:-Math.PI/2});
  for(const s of [-1,1]){
    a.panel(rectangle(-.068,0,.136,2.73),P=>{
      P.fill(timber);box(P.g,-.051,.08,.03,2.60,'#c09b71');box(P.g,-.07,.21,.14,.13,gold);
    },{x:s*1.58,z:.025});
  }
  a.panel(rectangle(-w/2,0,w,1.25),P=>{
    P.fill('#48646a');
    for(let x=-w/2+.16;x<w/2;x+=.42)box(P.g,x,0,.145,1.25,'#77908a');
    box(P.g,-w/2,.06,w,.08,'#d0b781');
  },{y:2.58,z:.22,tilt:-1.23});
  const scallop=[[-w/2,.12],[w/2,.12],[w/2,-.13]];
  for(let i=9;i>0;i--)scallop.push([-w/2+(i-.5)*w/9,-.28],[-w/2+(i-1)*w/9,-.13]);
  a.panel(scallop,P=>{
    P.fill('#577476');box(P.g,-w/2,.015,w,.058,gold);
  },{y:2.58,z:.26});
  a.panel(rectangle(-.55,0,1.10,.43),P=>printPlaque(P.g,'書坊',0,.215,1.10,.43),{y:1.95,z:.33,print:52});
  H.walk.block((px,pz)=>Math.abs(px-x)<1.68&&pz>z-.99&&pz<z+.22);
  return H.popup(null,null,{node:a.node,x,z,height:3.1,level:true,yaw:0,sight:false});
}

function gate(H,{x,z}) {
  const a=paperAssembly(H);
  for(const s of [-1,1]){
    const x=s*1.63;
    a.panel([[-.39,0],[.39,0],[.39,.35],[.25,.49],[.18,.55],[.18,3.48],[-.18,3.48],[-.18,.55],[-.25,.49],[-.39,.35]],P=>{
      P.fill('#9f5142');const g=P.g;
      box(g,-.17,.5,.065,2.98,'#cb7860');box(g,.11,.5,.07,2.98,'#733d35');
      box(g,-.40,0,.80,.28,'#928f80');box(g,-.4,.28,.8,.20,'#b6ae94');
      for(const y of [.59,3.12,3.27])box(g,-.19,y,.38,.07,gold);
    },{x,z:.10,thickness:.18});
    a.panel([[-.46,0],[.46,0],[.46,.12],[.28,.23],[.24,.43],[-.24,.43],[-.28,.23],[-.46,.12]],
      P=>{P.fill(timber);box(P.g,-.43,.05,.86,.078,gold)},{x,y:3.28,z:.12});
  }
  a.panel(rectangle(-2.15,3.53,4.30,.56),P=>{
    P.fill('#85604c');const g=P.g;box(g,-2.1,3.61,4.2,.13,jade);box(g,-2.1,3.99,4.2,.06,gold);
    for(const s of [-1,1])for(let n=0;n<3;n++)ellipse(g,s*(1.08+n*.27),3.86,.072,.057,gold);
  },{z:.16,thickness:.13});
  roofStrip(a,4.95,4.20,.45,1.18);
  a.panel(rectangle(-.94,0,1.88,.62),P=>printPlaque(P.g,'沙呂城',0,.31,1.88,.62),
    {y:3.22,z:.48,print:48});
  const yaw=1.06;
  for(const s of [-1,1])H.walk.solid(x+s*1.63*Math.cos(yaw),z-s*1.63*Math.sin(yaw),.43);
  return H.popup(null,null,{node:a.node,x,z,yaw,height:4.8,level:true,sight:false});
}

function artBoat(H,{x,z}) {
  // A long narrow hull with turned-up ends, a pavilion and a painter's sail.
  // Its deck stays on the printed river when the galleries fold into it.
  const boat = new THREE.Group();
  const deck = cut(H,[[-2.77,0],[-2.0,-.66],[1.78,-.68],[2.77,-.03],[2.05,.61],[-1.81,.66]],P=>{
    P.fill('#b4916c');const g=P.g;
    for(let x=-2.5;x<2.6;x+=.28)box(g,x,-.72,.035,1.45,'#8e7051');
  });
  deck.rotation.x=-Math.PI/2;boat.add(deck);
  const faces = [];
  const hull=[[-2.91,.77],[-2.59,.26],[-2.15,.055],[1.98,.045],[2.51,.26],
    [2.9,.86],[2.58,.74],[2.24,.68],[1.72,.55],[-1.69,.55],[-2.39,.65]];
  for(const s of [-1,1]){
    const wall=cut(H,hull,P=>{
      P.fill('#84513d');const g=P.g;
      polygon(g,[[-2.77,.72],[-2.18,.50],[1.84,.47],[2.70,.75],[2.39,.48],[1.89,.33],[-2.06,.34]],'#b9714f');
      stroke(g,[[-2.56,.47],[-2.07,.26],[1.96,.24],[2.55,.51]],gold,.055);
      for(let x=-1.7;x<1.9;x+=.40) {
        stroke(g,[[x,.36],[x+.13,.43],[x+.28,.36]],'#e9d3a0',.039);
      }
    });
    boat.add(wall);faces.push({wall,side:s});
  }
  const cabin=paperAssembly(H);
  cabin.panel(rectangle(-1.30,0,2.60,1.13),P=>{
    P.fill('#b29268');const g=P.g;
    for(let i=0;i<3;i++){
      const x=-1.15+i*.79;
      box(g,x,.13,.68,.84,'#514b3f');box(g,x+.035,.17,.61,.76,'#d9c99c');
      stroke(g,[[x+.04,.51],[x+.61,.51]],timber,.052);
      for(let j=1;j<3;j++)stroke(g,[[x+j*.22,.17],[x+j*.22,.92]],timber,.054);
    }
  },{z:-.24});
  for(const s of [-1,1])cabin.panel(rectangle(-.073,0,.146,1.40),P=>{
    P.fill('#805441');box(P.g,-.052,.10,.039,1.18,'#d0a371');
  },{x:s*1.27,z:.38});
  roofStrip(cabin,3.05,1.40,.48,.97,'#4b6869');
  const sail=cabin.panel([[-.10,0],[.10,0],[.10,2.20],[.67,2.17],[1.19,2.25],
    [.94,2.57],[.66,2.61],[.15,2.58],[.07,2.69],[-.08,2.59]],P=>{
    P.fill(timber);const g=P.g;
    polygon(g,[[.10,2.18],[.66,2.15],[1.18,2.25],[.93,2.60],[.68,2.62],[.1,2.57]],'#bd6551');
    stroke(g,[[.13,2.48],[.58,2.52],[.88,2.49]],gold,.048);
    text(g,'畫',.55,2.38,.28,'#fff0bc');
  },{x:-1.44,z:.11,print:51});
  sail.name='畫舫小旗';
  boat.add(cabin.node);
  boat.userData.follow=p=>{
    const t=openAmount(p);
    deck.position.y=.09+.24*t;
    faces.forEach(({wall,side})=>{
      wall.position.set(0,.10,side*.45);
      wall.rotation.x=-side*(1-t)*Math.PI/2;
    });
    cabin.node.rotation.x=-(1-t)*Math.PI/2;
    cabin.node.position.set(0,.14+.34*t,.07);
    cabin.node.userData.follow(t);
  };
  return H.popup(null,null,{node:boat,x,z,yaw:1.34,
    self:true,height:3.1,level:true,sight:false});
}

function quaySign(H,{x,z}) {
  const a=paperAssembly(H);
  a.panel([[-.12,0],[.12,0],[.12,1.53],[.34,1.61],[.34,2.55],[0,2.78],
    [-.34,2.55],[-.34,1.61],[-.12,1.53]],P=>{
    P.fill('#825a40');const g=P.g;
    polygon(g,[[-.27,1.66],[.27,1.66],[.27,2.51],[0,2.68],[-.27,2.51]],'#d0b07c');
    box(g,-.22,1.71,.44,.77,'#456761');
    text(g,'畫',0,2.30,.31,paper);text(g,'舫',0,1.93,.31,paper);
    for(let i=0;i<3;i++)box(g,-.12,.43+i*.095,.24,.052,'#d3b683');
  },{print:53});
  // Two little mooring posts share a base crease with the sign.
  for(const [x,h] of [[-.76,.65],[.82,.48]]){
    a.panel([[-.09,0],[.09,0],[.09,h-.07],[.03,h],[-.09,h-.04]],P=>{
      P.fill('#8a775c');for(let i=0;i<3;i++)box(P.g,-.09,.23+i*.069,.18,.045,'#ceb787');
    },{x,z:-.11});
  }
  // A hatched mountain painting is on show at the mooring. The scroll's
  // wooden rollers and ready brush connect the boat to the simile activity.
  a.panel([[-.70,0],[-.54,0],[-.47,.78],[.45,.78],[.57,0],[.72,0],
    [.61,.92],[.74,.92],[.74,2.14],[-.75,2.14],[-.75,.92],[-.63,.92]],P=>{
    P.fill(timber);const g=P.g;
    box(g,-.72,.95,1.44,1.15,gold);box(g,-.65,1.00,1.30,1.06,paper);
    landscape(g,-.54,1.15,1.08,.73);
    box(g,-.79,2.09,1.58,.10,'#69523b');box(g,-.78,.92,1.56,.09,'#745841');
    box(g,.38,1.17,.11,.11,vermilion);
  },{x:-.54,z:-1.36,print:48});
  H.walk.solid(x,z,.20);H.walk.solid(x-.54,z-1.36,.30);
  return H.popup(null,null,{node:a.node,x,z,yaw:.12,height:2.78,level:true,sight:false});
}

function teaTable(H,{x,z}) {
  const a=paperAssembly(H);
  for(const s of [-1,1]){
    a.panel([[-.07,0],[.07,0],[.10,.63],[-.10,.63]],P=>{
      P.fill(timber);box(P.g,-.045,0,.032,.63,'#b58d68');
    },{x:s*.70});
  }
  a.panel(rectangle(-.89,.55,1.78,.17),P=>{
    P.fill('#825f48');box(P.g,-.89,.66,1.78,.04,'#ceb083');
  },{z:.09});
  a.panel(rectangle(-.90,0,1.8,.76),P=>{
    P.fill('#bfa27a');box(P.g,-.25,0,.53,.76,'#75887a');
  },{y:.72,z:.09,tilt:-Math.PI/2});
  // Rounded spout, lid, handle and two cups use the same shapes as a folded tabletop display.
  const pot=[[-.58,.28],[-.51,.23],[-.42,.06],[-.30,0],[.19,0],[.31,.09],
    [.36,.26],[.48,.28],[.56,.40],[.53,.52],[.43,.55],[.34,.49],[.27,.53],
    [.19,.61],[.06,.62],[.04,.69],[-.05,.73],[-.12,.68],[-.10,.62],[-.28,.59],
    [-.31,.52],[-.24,.48],[-.35,.41],[-.50,.49],[-.64,.53],[-.69,.49]];
  a.panel(pot,P=>{
    P.fill('#ae6246');const g=P.g;
    stroke(g,[[.34,.42],[.44,.46],[.48,.40],[.43,.33],[.36,.33]],'#694536',.052);
    stroke(g,[[-.28,.51],[-.07,.49],[.23,.50]],gold,.055);
    ellipse(g,-.10,.26,.20,.105,'#c48159');
    ellipse(g,-.16,.30,.08,.037,'#deae79');
  },{x:-.24,y:.73,z:-.13,print:52});
  for(const [x,z] of [[.47,-.24],[.68,.01]]){
    a.panel([[-.16,.21],[.16,.21],[.11,.03],[.05,0],[-.06,0],[-.12,.04]],P=>{
      P.fill('#e5dbbc');box(P.g,-.16,.14,.32,.044,'#648a86');
    },{x,y:.73,z});
  }
  H.walk.block((px,pz)=>Math.abs(px-x)<.87&&pz>z-.66&&pz<z+.16);
  return H.popup(null,null,{node:a.node,x,z,level:true,height:1.46,yaw:0,sight:false});
}

// Targets are on the through streets. The facades are set back behind each
// forecourt, keeping the cross streets and the student's arrival rings clear.
export function addLandmarks(H,track,layout) {
  const offset=(p,dx,dz)=>({x:p.x+dx,z:p.z+dz});
  const theater=offset(layout.stage,-4.30,-2.65);
  const bookshop=offset(layout.books,3.04,-2.65);
  const mooring=offset(layout.boat,-4.75,3.70);
  const eastQuay=offset(layout.boat,-2.46,2.15);
  const teahouse=offset(layout.tea,5.2,-2.65);
  const pieces={
    stage:stage(H,theater),books:books(H,bookshop),boat:artBoat(H,mooring),
    boatSign:quaySign(H,eastQuay),gate:gate(H,layout.gate),
    tea:house(H,{...teahouse,w:6.4,d:3.65,h:3.7,rise:1.72,name:'柳岸茶館',seed:5}),
    teaDecor:teaTable(H,offset(teahouse,-2.05,.69))
  };
  const radii={stage:14.8,books:12.5,boat:13.8,boatSign:13.6,gate:16.2,tea:14.4,teaDecor:11.6};
  for(const [key,piece] of Object.entries(pieces)){
    piece.group.name=key;
    track(piece,radii[key]);
  }
  return pieces;
}

export {paperAssembly,box,polygon,stroke,ellipse,text,rectangle,printPlaque,roofStrip,landscape,boundBook};
