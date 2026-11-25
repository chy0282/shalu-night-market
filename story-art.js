// The same paper puppets appear around the market table and beside the reading prompts.
// Artwork is drawn on first use. Repeated visits copy the stored canvas without sharing DOM nodes.
const colors = {
  ink:'#433e37', wood:'#8a5944', darkWood:'#664939', straw:'#e3bd80',
  cream:'#fff0cb', green:'#436d61', jade:'#759687', red:'#b45b47',
  sky:'#dae1c7', hair:'#413d38', skin:'#edbd96', cheek:'#d98e70'
};
const {ink,wood,darkWood,straw,cream,green,jade,red,hair,skin,cheek} = colors;
const WIDTH=720, HEIGHT=400;
const cache=new Map();
const geometry=new Map();
function vector(d) {
  if(!geometry.has(d))geometry.set(d,new Path2D(d));
  return geometry.get(d);
}
function cut(g,d,fill,edge=ink,w=1.4) {
  const p=vector(d);
  if(fill){g.fillStyle=fill;g.fill(p)}
  if(edge){g.strokeStyle=edge;g.lineWidth=w;g.stroke(p)}
}
function pen(g,d,color,w=1.4) {cut(g,d,null,color,w)}
function oval(g,x,y,rx,ry,color,edge,w=1) {
  g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  if(color){g.fillStyle=color;g.fill()}
  if(edge){g.lineWidth=w;g.strokeStyle=edge;g.stroke()}
}
function bar(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
function wash(g,x0,y0,x1,y1,colors){
  const gradient=g.createLinearGradient(x0,y0,x1,y1);
  colors.forEach(([offset,color])=>gradient.addColorStop(offset,color));
  return gradient;
}
function placed(g,x,y,s,draw,angle=0){
  g.save();g.translate(x,y);g.rotate(angle);g.scale(s,s);draw(g);g.restore();
}
function tilted(g,x,y,angle,draw){g.save();g.translate(x,y);g.rotate(angle);draw(g);g.restore()}
function raised(g,draw,depth=3) {
  g.save();g.shadowColor='rgba(62,43,36,.29)';g.shadowOffsetX=depth*.65;
  g.shadowOffsetY=depth;g.shadowBlur=depth*1.1;draw();g.restore();
}
function groundShadow(g,x,y,w){oval(g,x+2,y+2,w,w*.14,'rgba(74,57,43,.19)')}
function circleLamp(g,lit=true,main=red) {
  pen(g,'M-5 -21 Q-6 -31 0 -32 Q6 -31 5 -21',darkWood,2);
  const outline='M-9 -20 C-20 -16 -23 4 -14 14 Q-8 21 0 21 Q12 21 17 12 C24 -1 17 -16 9 -20 Z';
  cut(g,outline,lit?main:'#9e7970');
  cut(g,'M-2 -20 Q-12 -2 -4 18 L6 18 Q13 -2 4 -20 Z',lit?'#f3b36d':'#b59685',null);
  for(const d of ['M-8 -18 Q-18 0 -10 15','M7 -18 Q17 -1 11 14','M0 -19 Q-4 -1 0 16'])pen(g,d,lit?'#ab674e':'#876d62',.9);
  bar(g,-9,-21,18,4,wood);bar(g,-9,16,18,4,wood);bar(g,-9,-20,18,1.1,lit?straw:'#b29779');
  pen(g,'M0 20 L0 25 M-2 26 L-4 34 M0 25 L0 36 M2 26 L4 34',lit?red:'#887267',1.7);
}
function petals(g,x,y,size,c) {
  placed(g,x,y,size,()=>{
    for(let i=0;i<5;i++)tilted(g,0,0,i*Math.PI*2/5,()=>cut(g,'M0 0 Q-5 -1 -4 -6 Q0 -10 2 -6 Q4 -3 0 0 Z',c,null));
    oval(g,0,0,2,2,straw);
  });
}

const wardrobe={
  traveler:{robe:'#52868a', shade:'#386870', trim:'#c1d1b6', sash:'#ad5541', facing:'#e3cb96'},
  stage:{robe:'#af5e49', shade:'#8b473b', trim:'#ebc79c', sash:'#5f705c', facing:'#dbae75'},
  boat:{robe:'#628490', shade:'#476673', trim:'#dccbb1', sash:'#985a40', facing:'#d4b67d'},
  tea:{robe:'#829979', shade:'#5c785d', trim:'#f3daba', sash:'#856448', facing:'#d4ae73'},
  books:{robe:'#846b80', shade:'#665269', trim:'#d7c4aa', sash:'#516e65', facing:'#c6997e'}
};
const guideNames={traveler:'提燈旅人',stage:'戲棚說書人',boat:'畫舫畫師',tea:'茶館小二',books:'書坊掌櫃'};

function headpiece(g,id){
  if(id==='traveler'){
    cut(g,'M-13 -79 Q-17 -91 -8 -97 Q4 -102 12 -95 Q18 -89 13 -79 Z',hair);
    pen(g,'M-13 -86 Q1 -91 15 -85','#af6449',3.3);
    cut(g,'M-34 -59 L-31 -73 Q-24 -86 -4 -86 L14 -85 Q30 -81 34 -70 L34 -58 Q3 -64 -34 -59 Z','#3c5660');
    cut(g,'M-34 -65 Q-3 -70 34 -64 L35 -58 Q1 -62 -35 -57 Z','#8fa79c');
    pen(g,'M-32 -59 Q0 -63 34 -59','#e0b97b',2);
    pen(g,'M-17 -77 Q-8 -81 2 -80','#647987',1.5);
  }else if(id==='stage'){
    cut(g,'M-33 -54 Q-38 -71 -30 -82 Q-26 -88 -18 -86 Q-14 -98 -7 -100 Q6 -105 18 -95 L29 -90 L34 -84 L29 -73 L34 -57 Z','#5d6858');
    cut(g,'M-30 -73 Q1 -85 31 -70 L34 -58 L-33 -56 Z','#76876d');
    pen(g,'M-30 -61 Q1 -69 32 -60','#e3c38d',2.7);
    pen(g,'M-14 -86 Q-12 -95 -7 -97 M15 -90 L19 -86','#89977a',1.4);
  }else if(id==='tea'){
    cut(g,'M-32 -57 L-34 -71 Q-30 -86 -14 -88 Q-4 -96 6 -91 Q23 -90 30 -79 L34 -64 L26 -51 Z','#423f37');
    cut(g,'M-34 -73 Q-6 -79 30 -68 L31 -62 Q-4 -72 -33 -65 Z','#bb634d');
    cut(g,'M25 -69 Q42 -83 47 -78 Q44 -68 34 -64 L43 -59 L49 -46 L38 -50 L29 -64 Z','#be6950');
    pen(g,'M-27 -70 Q-1 -74 25 -66','#e4a47b',1.7);
  }else if(id==='boat'){
    cut(g,'M-31 -60 Q-30 -81 -12 -87 Q8 -94 25 -80 L32 -61 Z','#51483e');
    cut(g,'M-40 -66 Q-21 -75 -10 -92 Q-2 -102 4 -99 Q19 -79 37 -73 L45 -67 Q23 -59 1 -60 Q-24 -58 -40 -66 Z','#d7b576');
    for(const d of ['M0 -96 Q-9 -80 -27 -68','M2 -94 Q0 -78 -9 -67','M4 -93 Q9 -78 15 -68','M8 -90 Q20 -76 30 -69'])pen(g,d,'#ad895e',1.1);
    pen(g,'M-38 -66 Q-1 -55 43 -68',wood,2.4);pen(g,'M-26 -61 Q-25 -39 -9 -26','#9e825e',1);
  }else{
    oval(g,24,-81,15,14,'#57504c',ink,1.5);
    pen(g,'M13 -82 Q20 -93 32 -86','#8e8075',2);
    cut(g,'M-33 -46 Q-38 -63 -29 -75 Q-22 -87 -2 -85 Q21 -89 30 -72 Q35 -62 31 -47 L25 -45 L23 -62 Q10 -60 -1 -74 Q-9 -60 -26 -58 L-26 -45 Z','#59534e');
    pen(g,'M-24 -66 Q-12 -70 -6 -78 M12 -79 Q22 -75 25 -68','#ab9b8a',1.7);
    pen(g,'M16 -78 L40 -94','#b4774f',2.6);petals(g,35,-91,.68,'#d5a287');
  }
}
function eyes(g,id,mood){
  const older=id==='stage'||id==='books';
  const happy=mood==='celebrate',thinking=mood==='hint';
  for(const dir of [-1,1]){
    g.save();g.scale(dir,1);
    const brow=happy?'M7 -48 Q15 -55 21 -48':thinking&&dir===-1?'M8 -52 Q17 -59 22 -50':'M8 -47 Q14 -52 21 -47';
    pen(g,brow,older?'#776355':'#5c4739',older?2.9:2.4);
    if(happy){
      pen(g,'M6 -35 Q12 -46 20 -36','#493830',3.6);
      pen(g,'M9 -33 Q13 -36 17 -34','#ca936f',1.15);
    }else if(id==='stage'&&!thinking){
      pen(g,'M7 -36 Q13 -45 20 -36','#534337',3);
    }else{
      const xx=14+(thinking?-2.1*dir:0),yy=thinking?-39:-37;
      oval(g,14,-37,6.05,7.1,'#fff0d8','#8b6954',.75);
      oval(g,xx,yy,4.6,5.8,'#553c32');oval(g,xx-.7*dir,yy-2,1.55,1.8,'#fff6df');
      oval(g,xx+1.4*dir,yy+2.1,.67,.65,'#d4a67f');
    }
    const rouge=g.createRadialGradient(22,-28,0,22,-28,8);
    rouge.addColorStop(0,happy?'rgba(219,104,82,.73)':'rgba(220,121,92,.55)');
    rouge.addColorStop(1,'rgba(222,133,99,0)');
    oval(g,22,-28,8,5.1,rouge);oval(g,22,-29,2.4,.85,'rgba(255,215,181,.62)');
    if(id==='books'){
      oval(g,14,-36,10.4,8.7,null,'#625d4c',1.95);pen(g,'M25 -37 L30 -40',wood,1.7);
    }
    if(id==='stage')pen(g,'M19 -38 L23 -39 M19 -32 L23 -31','#b1876c',.95);
    g.restore();
  }
  if(id==='books')pen(g,'M-4 -36 Q0 -39 4 -36',wood,1.5);
  cut(g,'M-1 -34 Q-4 -29 -1 -27 Q3 -25 4 -29 Q2 -29 -1 -34 Z','#d59b77',null);
  oval(g,-.6,-30.3,1.6,1,'#f7cda3');
  if(id==='stage'){
    cut(g,'M-13 -14 Q-5 -9 1 -12 Q9 -10 16 -16 Q13 -3 5 0 L2 -3 L-2 3 Q-3 -1 -6 -2 L-8 0 Z',wash(g,-7,-13,6,0,[[0,'#ded1b7'],[1,'#a89a82']]),'#8e816e',.9);
    cut(g,'M-2 -25 Q-8 -30 -16 -23 L-22 -22 Q-14 -18 -8 -20 L0 -24 Q10 -19 16 -20 L21 -23 Q15 -22 11 -27 Q4 -28 0 -25 Z','#978975',null);
  }
  if(happy){
    cut(g,'M-10 -23 Q0 -17 11 -24 Q10 -12 2 -12 Q-6 -11 -10 -23 Z','#824a3c','#8d5544',.9);
    cut(g,'M-7 -22 Q1 -18 8 -22 Q3 -17 -2 -18 Z','#fff1ca',null);
    cut(g,'M-4 -14 Q1 -18 6 -15 Q2 -10 -4 -14 Z','#e49b80',null);
  }else if(thinking){
    pen(g,'M-5 -20 Q0 -16 6 -21','#8e503e',2.35);
  }else{
    pen(g,'M-7 -21 Q0 -14 8 -22','#8f513f',2.25);
  }
}
function fan(g){
  cut(g,'M0 0 L-33 -22 Q-31 -28 -25 -30 L-24 -33 L-17 -35 L-14 -38 L-9 -37 Q-3 -43 2 -39 Q9 -43 14 -38 L18 -37 L23 -32 L29 -29 L31 -22 Z','#edca93');
  for(let i=-2;i<3;i++)pen(g,'M0 0 Q'+(i*5)+' -16 '+(i*13)+' '+(-38+Math.abs(i)*4),wood,.9);
  pen(g,'M-22 -27 Q-10 -30 -6 -28 Q3 -35 12 -30 L20 -29',green,1.7);
  pen(g,'M0 2 L2 9',wood,2.6);
}
function teaPot(g){
  pen(g,'M10 -5 C27 -17 26 6 15 8',darkWood,6);
  pen(g,'M10 -5 C27 -17 26 6 15 8','#a76c50',3.5);
  cut(g,'M-12 -3 Q-18 -5 -20 -13 L-27 -14 L-27 -10 Q-23 -6 -22 0 Q-20 5 -11 8 Z','#a76749');
  cut(g,'M-15 -6 Q-3 -12 10 -7 Q21 -2 17 10 Q12 18 -3 18 Q-18 16 -19 8 Q-19 0 -15 -6 Z','#bf8060');
  cut(g,'M-14 -6 Q-1 -14 12 -7 L14 -4 Q-1 -7 -16 -4 Z','#a86e52');
  oval(g,0,-11,3.1,2.7,'#986149',ink,.85);pen(g,'M-10 6 Q-2 10 5 5','#e3b685',1.7);
}
function book(g){
  cut(g,'M-16 -16 L13 -20 L17 17 L-12 21 Z','#60867c');
  cut(g,'M-12 17 L16 13 L17 17 L-12 21 Z','#e6d1a7');
  pen(g,'M-10 -15 L-6 16','#b7b799',1.2);
  for(const yy of [-12,-3,7,14])pen(g,'M-14 '+yy+' L-7 '+(yy-1),'#e3d6ad',1.3);
  cut(g,'M0 -14 L7 -15 L8 -2 L1 -1 Z','#ead9b3',null);
}
function staff(g,id){
  if(id==='stage')placed(g,42,14,.92,fan,-.22);
  if(id==='boat'){
    tilted(g,43,5,.45,()=>{
      cut(g,'M-2 -36 L2 -36 L2 24 Q0 28 -2 24 Z','#aa764d');
      cut(g,'M-3 -35 Q-7 -43 -1 -53 Q0 -59 2 -64 Q9 -50 4 -36 Z','#e3d5b1');
      cut(g,'M-1 -53 Q0 -59 2 -64 Q7 -57 6 -52 L3 -48 Z','#514d42',null);
      bar(g,-3,-37,7,6,'#987053');pen(g,'M-3 -35 L4 -35',straw,1.3);
    });
  }
  if(id==='tea')placed(g,43,11,.89,teaPot,-.03);
  if(id==='books')placed(g,32,10,.98,book,.15);
  if(id==='traveler'){
    pen(g,'M31 -2 L64 -10',wood,3.2);
    pen(g,'M59 -9 L60 0','#956a43',1.25);
    placed(g,60,16,.53,c=>circleLamp(c,true,'#c87948'));
  }
}
function gesturingHand(g,c,mood){
  if(mood==='hint'){
    cut(g,'M-26 -9 Q-38 -8 -42 3 Q-47 15 -38 19 Q-31 23 -22 15 L-11 4 L-17 -7 L-28 0 Z',c.robe);
    cut(g,'M-22 0 L-14 -9 L-5 -1 L-15 9 Z',c.trim,wood,.95);
    cut(g,'M-16 1 Q-22 -3 -22 -10 L-23 -21 Q-24 -24 -22 -25 Q-19 -27 -18 -23 L-15 -15 Q-11 -19 -8 -16 Q-4 -17 -3 -13 Q-1 -10 -4 -7 L-12 1 Z',skin,'#936c55',1.3);
    pen(g,'M-15 -14 L-12 -11 M-10 -14 L-8 -11','#c18c6e',1);
  }else if(mood==='celebrate'){
    cut(g,'M-24 -11 Q-31 -13 -39 -20 L-47 -32 L-57 -24 Q-54 -8 -42 3 Q-34 9 -28 7 L-21 1 Z',c.robe);
    cut(g,'M-56 -20 L-60 -27 L-47 -35 L-42 -28 Z',c.trim,wood,1.1);
    cut(g,'M-54 -25 Q-61 -25 -64 -33 L-68 -42 Q-69 -46 -66 -46 L-61 -40 L-64 -50 Q-65 -54 -61 -54 L-56 -45 L-56 -54 Q-56 -57 -53 -55 L-50 -45 L-47 -49 Q-44 -53 -42 -50 L-45 -40 Q-45 -35 -48 -29 Z',skin,'#936b53',1.25);
    pen(g,'M-61 -38 Q-55 -34 -53 -38','#ca9472',1.2);
  }else{
    cut(g,'M-24 -8 Q-31 -8 -34 1 L-42 21 L-35 30 L-23 27 L-16 4 Z',c.robe);
    cut(g,'M-42 20 L-34 25 L-25 23 L-25 29 L-37 34 L-43 27 Z',c.trim,wood,.85);
    cut(g,'M-39 29 Q-42 35 -38 37 Q-34 40 -30 33 L-30 29 Z',skin,'#916953',1.1);
  }
}
function puppet(g,id,mood='neutral'){
  const c=wardrobe[id];
  for(const side of [-1,1]){
    g.save();g.scale(side,1);
    cut(g,'M8 50 L23 50 L22 80 L9 81 Z','#525c59');
    cut(g,'M8 74 L23 74 L24 80 Q31 80 32 85 L30 88 L9 87 Z','#4e4940');
    pen(g,'M9 86 Q20 88 31 86','#ccb794',1.3);
    g.restore();
  }
  const robeWash=wash(g,-28,-11,30,44,[[0,c.trim],[.25,c.robe],[.68,c.robe],[1,c.shade]]);
  cut(g,'M-14 -13 Q-25 -13 -32 -4 L-30 19 L-27 36 L-34 62 Q-11 72 1 64 Q19 71 32 62 L26 33 L29 1 Q24 -10 13 -12 Z',robeWash);
  cut(g,'M9 14 L23 -2 L26 30 L32 62 Q22 66 10 65 L15 39 Z',c.shade,null);
  cut(g,'M-14 -13 L1 -6 L13 -13 L17 -9 L-8 20 L-15 18 L-1 1 L-19 -9 Z',c.trim,darkWood,.85);
  cut(g,'M-25 28 Q-2 34 26 27 L27 35 Q1 41 -26 35 Z',c.sash,darkWood,.85);
  pen(g,'M-23 30 Q0 35 24 29',c.facing,1.3);
  pen(g,'M-29 59 Q-10 66 -2 61 M4 61 Q16 65 27 60',c.facing,1.3);
  pen(g,'M-18 41 L-22 54 M14 41 L17 52',c.shade,1.4);
  if(id==='tea'){
    cut(g,'M-24 -8 Q-16 -17 -10 -12 L-17 0 L-18 20 L-26 21 L-29 6 Z','#e6d7b7',wood,1);
    pen(g,'M-26 15 L-19 14 M-26 18 L-20 17','#b67d69',1.2);
  }
  if(id==='traveler'){
    cut(g,'M-20 -9 L-15 -12 L20 26 L16 31 Z','#a17e56',darkWood,.95);
    cut(g,'M10 26 L25 24 L30 42 Q22 49 10 45 Z','#bd8c58',wood,1.1);
    pen(g,'M11 29 Q19 36 27 28','#8b6547',1.1);
  }
  if(mood!=='hint')gesturingHand(g,c,mood);
  cut(g,'M22 -9 Q32 -8 37 4 L42 2 L46 13 L38 21 Q35 23 30 18 L18 3 Z',c.robe);
  cut(g,'M35 4 L42 0 L47 10 L44 15 L39 15 Z',c.trim,wood,.9);
  staff(g,id);
  cut(g,'M38 4 Q38 -2 42 -3 Q45 -4 47 -2 Q49 1 45 4 Q44 8 40 8 Z',skin,'#916953',1);
  g.save();g.translate(0,-12);
  g.rotate(mood==='hint'?-.15:mood==='celebrate'?.07:0);
  g.scale(1.075,1.035);g.translate(0,12);
  oval(g,-31,-39,6,8,'#dba47e',ink,1.1);oval(g,30,-39,6,8,'#dba47e',ink,1.1);
  const face='M-32 -55 Q-28 -76 -6 -77 Q20 -80 31 -61 Q33 -52 33 -44 Q37 -31 26 -20 Q16 -10 3 -10 Q-14 -9 -25 -18 Q-36 -28 -33 -41 Z';
  const faceWash=g.createRadialGradient(-12,-52,3,0,-40,39);
  faceWash.addColorStop(0,'#ffdab1');faceWash.addColorStop(.60,'#f5c69b');faceWash.addColorStop(.87,'#e8ae85');faceWash.addColorStop(1,'#d99c79');
  g.save();g.shadowColor='rgba(77,47,34,.24)';g.shadowOffsetX=1;g.shadowOffsetY=2;g.shadowBlur=3.3;
  cut(g,face,faceWash,'#654d3c',1.45);g.restore();
  pen(g,'M-29 -48 Q-32 -39 -29 -32','#ffe0b7',1.55);
  pen(g,'M9 -13 Q20 -15 26 -23','#c38b6c',1.1);
  cut(g,'M-30 -46 Q-32 -58 -29 -65 Q-25 -82 -8 -82 L13 -82 Q30 -75 32 -64 L32 -45 L27 -46 L25 -63 L16 -58 L18 -67 Q10 -59 0 -59 L2 -66 Q-9 -58 -21 -56 L-26 -45 Z',id==='stage'?'#807867':hair,null);
  headpiece(g,id);eyes(g,id,mood);g.restore();
  if(mood==='hint')gesturingHand(g,c,mood);
}

function rowHouse(g,x,y,s,palette=0){
  const walls=['#e2d4b2','#e0c7a1','#d0ccb2'], roofs=['#576b67','#626b63','#6b706a'];
  placed(g,x,y,s,()=>{
    cut(g,'M-36 -37 L26 -38 L40 -32 L39 7 L-36 8 Z',walls[palette],darkWood,1.15);
    cut(g,'M26 -38 L40 -32 L39 7 L26 5 Z','#b3aa8c',null);
    bar(g,-29,-11,14,18,'#887a64');bar(g,-27,-10,4,15,'#b59b78');
    for(const xx of [-6,12]){
      bar(g,xx,-23,10,14,'#6b7468');
      bar(g,xx+4,-23,1.4,14,'#caaf87');bar(g,xx,-18,10,1.2,'#caaf87');
    }
    cut(g,'M-48 -42 Q-36 -39 -30 -45 L-22 -61 L21 -60 Q28 -44 43 -40 L49 -42 Q46 -33 34 -33 L-37 -33 Z',roofs[palette],ink,1.25);
    for(let i=0;i<7;i++){
      const xx=-21+i*6;pen(g,'M'+xx+' -57 Q'+(xx-1)+' -46 '+(xx-6)+' -38','#95a096',.85);
    }
    pen(g,'M-43 -38 Q-33 -35 -22 -36 L31 -36 Q40 -35 46 -40','#d4c5a5',1.45);
    pen(g,'M-23 -61 Q-1 -63 21 -60','#b8b69d',2.1);
    bar(g,-36,3,62,3,'#a89b81');
  });
}
function willow(g,x,y,s,wind=false){
  placed(g,x,y,s,()=>{
    cut(g,'M-8 4 Q-13 -18 -8 -45 Q-5 -70 -10 -95 L-7 -107 Q-1 -96 0 -76 Q7 -86 16 -96 L21 -100 Q17 -87 2 -68 Q3 -46 -3 -27 Q-4 -12 4 2 Z','#776e51','#5a5b49',1.3);
    const wisps=[[-7,-105,-39,-72],[-9,-107,-53,-82],[-5,-112,-37,-91],[-3,-110,-17,-64],
      [0,-111,5,-77],[6,-106,24,-71],[10,-105,38,-65],[12,-100,51,-78],[13,-98,43,-91]];
    for(const [a,b,c,d] of wisps){
      const tip=c+(wind?24:0),end=d+(wind?-7:9);
      pen(g,'M'+a+' '+b+' Q'+c+' '+(b-17)+' '+tip+' '+end,'#6e7f5d',1.55);
      for(let n=1;n<6;n++){
        const t=n/6,ct=1-t;
        const xx=ct*ct*a+2*ct*t*c+t*t*tip,yy=ct*ct*b+2*ct*t*(b-17)+t*t*end;
        tilted(g,xx,yy,wind?-.69:-.24,()=>cut(g,'M0 0 Q-4 6 -2 10 Q1 8 2 3 Z',n%2?'#799270':'#9ba780',null));
      }
    }
    pen(g,'M-5 -4 Q-9 -17 -5 -34','#9b8b67',1.2);
  });
}
function mountain(g,d,c,edge){
  cut(g,d,c,null);
  if(edge)pen(g,edge,'rgba(255,240,203,.46)',1.7);
}
function sky(g,upper,lower){
  const wash=g.createLinearGradient(0,0,0,272);
  wash.addColorStop(0,upper);wash.addColorStop(1,lower);bar(g,0,0,WIDTH,HEIGHT,wash);
}
function cloud(g,x,y,s,fill){
  placed(g,x,y,s,()=>cut(g,'M-64 7 Q-58 5 -49 6 Q-44 -4 -33 -1 Q-27 -14 -12 -7 Q0 -23 15 -11 Q24 -10 26 -4 Q42 -8 49 2 Q65 0 74 8 L-62 10 Z',fill,null));
}
function distantTown(g,c){
  mountain(g,'M0 166 Q37 135 63 138 Q80 122 102 115 L115 104 L124 106 Q139 96 156 105 Q174 108 193 122 Q211 127 218 125 Q249 115 270 126 Q297 102 321 106 Q351 81 369 101 L388 106 Q411 90 429 101 Q458 115 477 129 Q507 124 534 111 Q564 85 587 99 Q604 89 617 97 Q659 125 684 117 L720 102 L720 209 L0 209 Z',c);
  mountain(g,'M0 176 Q53 157 87 161 Q112 137 150 146 Q179 130 211 149 Q238 146 264 157 Q310 144 345 150 Q381 134 413 147 Q438 131 475 141 Q501 143 528 150 Q579 127 609 144 Q640 140 675 154 L720 132 L720 201 L0 202 Z','#96a994');
  [[38,.63],[91,.44],[130,.48],[174,.7],[219,.52],[257,.51],[301,.74],[348,.54],[386,.5],[430,.67],[476,.49],[520,.62],[567,.5],[608,.74],[652,.58],[706,.61]].forEach(([x,s],i)=>rowHouse(g,x,198,s,i%3));
}
function waves(g){
  for(let row=0;row<7;row++)for(let col=0;col<8;col++){
    const x=(col*103+row*37)%737-23,y=215+row*24+((col*11+row*3)%16),len=10+((row+col*7)%22);
    pen(g,'M'+x+' '+y+' q'+(len*.4)+' 3 '+len+' -1','rgba(246,229,188,.60)',1.4);
    if((col+row)%3===0)pen(g,'M'+(x+9)+' '+(y+4)+' q9 2 17 -1','#709d91',1.1);
  }
}
function bridge(g,x,y,s){
  placed(g,x,y,s,()=>{
    cut(g,'M-123 9 Q-87 7 -55 -18 Q-24 -45 4 -44 Q33 -44 58 -29 Q81 -15 118 -9 L122 4 L122 17 L43 16 C32 -7 17 -19 0 -18 Q-22 -18 -43 16 L-125 23 Z','#c7c1a1','#787e69',2);
    pen(g,'M-122 10 Q-83 7 -54 -17 Q-22 -42 5 -40 Q32 -40 58 -24 Q82 -10 119 -5','#ebe0b9',4);
    pen(g,'M-43 15 Q-23 -20 -1 -20 Q25 -21 44 14','#8e9380',3.4);
    for(const [a,b] of [[-104,7],[-83,0],[-58,-13],[-33,-30],[-8,-38],[18,-38],[44,-28],[71,-12],[98,-5]]){bar(g,a,b-10,3.6,10,'#8e927e');oval(g,a+1.8,b-11,2.8,2,'#d5c8a4')}
    pen(g,'M-101 -1 Q-73 -8 -50 -26 Q-19 -50 4 -48 Q31 -48 60 -33 Q88 -17 102 -15','#b0ae90',2);
    for(const [a,b] of [[-68,7],[-54,4],[-26,-21],[-13,-29],[0,-32],[15,-28],[28,-23],[50,-6],[64,0],[87,9]])pen(g,'M'+a+' '+b+' l-2 4','#a4a48a',.95);
  });
}
function coveredBoat(g,x,y,s){
  placed(g,x,y,s,()=>{
    pen(g,'M-94 15 Q-67 23 -43 18 M35 20 Q73 23 101 13','#e5dbb4',2.5);
    cut(g,'M-101 -4 Q-91 5 -73 5 L66 0 Q82 -2 98 -13 Q91 2 78 10 Q30 21 -57 16 Q-86 15 -101 -4 Z','#846546',ink,1.8);
    pen(g,'M-89 4 Q-24 15 59 5 Q82 3 93 -5','#d3ab71',2.2);
    cut(g,'M-58 3 L-55 -22 L-38 -37 L31 -39 L54 -26 L56 0 Z','#a18b63');
    cut(g,'M-44 -6 L-43 -27 L35 -29 L47 -20 L48 -5 Z','#435a52');
    for(const xx of [-40,-18,6,30]){
      bar(g,xx,-30,3,27,'#c39b67');pen(g,'M'+xx+' -24 l14 0','#b69b6a',1.4);
    }
    cut(g,'M-66 -23 Q-57 -25 -47 -38 Q-41 -45 -30 -45 L26 -47 Q40 -45 53 -36 Q60 -31 67 -33 Q62 -25 53 -24 L-47 -19 Q-59 -17 -66 -23 Z','#6e7865',ink,1.4);
    pen(g,'M-59 -22 L49 -27 Q60 -27 65 -32','#d8c89e',2);
    for(let i=0;i<8;i++)pen(g,'M'+(-37+i*9)+' -41 l-11 15','#9a9e7c',1);
    for(const xx of [-43,44]){pen(g,'M'+xx+' -24 v6',wood,1.1);placed(g,xx,-10,.31,c=>circleLamp(c,false))}
    tilted(g,66,-14,.37,()=>{pen(g,'M0 -19 L0 32',wood,2.2);cut(g,'M-1 22 Q-4 28 -3 39 L1 43 L3 26 Z','#aa8559')});
  });
}
function fringedAwning(g,x,y,s,wind=false){
  placed(g,x,y,s,()=>{
    bar(g,-77,-65,8,114,wood);bar(g,64,-60,8,113,wood);
    for(const xx of [-75,66])pen(g,'M'+xx+' -52 v98','#b78a61',1.35);
    cut(g,'M-87 -70 Q-74 -70 -66 -78 L-52 -92 L48 -92 Q59 -75 83 -70 L89 -72 Q85 -62 74 -62 L-75 -60 Z','#637365',ink,1.6);
    for(let i=0;i<9;i++)pen(g,'M'+(-50+i*12)+' -88 l-8 17','#98a087',1.2);
    pen(g,'M-83 -66 Q-67 -62 -51 -64 L68 -66 Q79 -65 85 -69','#decca0',2.6);
    bar(g,-72,-59,142,7,'#a26c50');
    cut(g,wind?'M-74 -53 L4 -53 Q-11 -45 -36 -43 Q-25 -33 -18 -31 Q-42 -31 -55 -36 Q-30 -15 -40 -5 Q-52 -19 -74 -19 Z':'M-73 -52 L-10 -53 Q-32 -40 -54 -32 Q-51 -11 -55 4 L-72 6 Z','#ad5949','#79483d',1.3);
    cut(g,wind?'M14 -53 L70 -53 Q90 -44 102 -51 Q104 -41 83 -36 Q98 -29 105 -30 Q94 -21 69 -26 Z':'M13 -53 L68 -53 L69 6 L56 0 Q53 -17 55 -32 Q34 -40 13 -53 Z','#b8654e','#79483d',1.3);
    pen(g,'M-67 -50 Q-52 -46 -44 -44 M31 -51 Q49 -44 61 -42','#d29373',1.4);
    cut(g,'M-86 44 L74 39 L86 47 L-75 55 Z','#ccab78');
    cut(g,'M-76 54 L84 47 L84 57 L-76 65 Z','#906f50');
  });
}
function storm(g){
  sky(g,'#9badaa','#e1d7b7');
  oval(g,520,69,36,36,'#dfd5b5');oval(g,518,68,31,31,'#e7dfc1');
  cloud(g,520,66,.72,'#bec4b2');cloud(g,75,38,.92,'#bbc5b8');cloud(g,591,103,.52,'#c7cbb5');
  distantTown(g,'#acb9a6');
  cut(g,'M0 194 Q192 183 318 194 Q470 192 720 179 L720 400 L0 400 Z','#90b2a6',null);
  waves(g);bridge(g,365,212,.98);
  cut(g,'M0 178 Q42 181 107 203 Q147 219 206 225 L211 236 Q118 222 66 212 L0 212 Z','#aaa48b','#92967e',1.1);
  cut(g,'M0 172 Q76 178 121 201 Q144 212 206 225 Q148 226 96 207 Q49 191 0 185 Z','#d1c4a3',null);
  fringedAwning(g,71,190,.75,true);willow(g,195,212,.78,true);
  cut(g,'M720 190 Q655 188 613 205 Q590 213 547 218 Q592 222 624 212 Q678 197 720 202 Z','#cfc3a0','#9e9c85',1.2);
  rowHouse(g,669,195,.89,1);willow(g,722,201,.85,true);
  placed(g,473,297,1.13,c=>coveredBoat(c,0,0,1),-.052);
  cut(g,'M0 304 Q126 323 213 351 L313 400 L0 400 Z','#b4a88a','#8d8d76',1.25);
  cut(g,'M0 303 Q113 315 222 355 L216 364 Q100 328 0 318 Z','#dbca9e',wood,1.2);
  for(const [x,y] of [[12,326],[53,341],[111,350],[157,369],[79,377],[194,384]])pen(g,'M'+x+' '+y+' l22 4 m3 -1 l5 -4','#a2967c',1.3);
  // Four baskets hang at visibly different angles after the wind has taken their light.
  pen(g,'M-8 11 Q93 38 208 39 Q298 40 389 21 Q472 9 538 -10','#5e6658',2.8);
  [[45,22,1.01,-.48],[130,35,.88,-.41],[232,38,.76,-.5],[332,30,.68,-.39]].forEach(([x,y,s,a])=>{
    tilted(g,x,y,a,()=>{pen(g,'M0 0 v12',darkWood,1.45);placed(g,0,34*s+10,s,c=>circleLamp(c,false))});
  });
  for(const d of ['M27 100 Q56 114 83 108 Q108 104 142 113','M113 121 Q156 137 214 115 Q263 98 284 112 Q297 125 282 128 Q263 133 259 125','M220 83 Q241 92 261 86','M549 144 Q579 140 594 125 Q607 112 631 116','M601 95 Q616 100 638 91','M109 258 Q150 265 181 246'])pen(g,d,'#e2dec1',2.1);
  for(const [x,y,a] of [[101,87,-.7],[158,116,.3],[250,96,-.44],[295,119,.2],[561,113,-.3],[610,136,-.5],[663,90,.7],[200,258,-.7],[130,283,.25]]){
    tilted(g,x,y,a,()=>{cut(g,'M-7 0 Q-2 -6 8 -2 Q2 4 -7 0 Z','#a58e60',null);pen(g,'M-6 0 l11 -1','#837851',.65)});
  }
}

function paving(g){
  const rows=[[254,64],[284,77],[325,98],[379,122]];
  for(let j=0;j<rows.length;j++){
    const [y,step]=rows[j];
    for(let i=-1;i<12;i++){
      const x=i*step+(j%2)*27;
      pen(g,'M'+(x+5)+' '+y+' q'+(step*.4)+' 2 '+(step-8)+' 0','#c7b795',1.25);
      if(i%2===0)pen(g,'M'+(x+step-4)+' '+(y+2)+' l-'+(3+j*2)+' '+(7+j*2),'#cabb9a',1.1);
    }
  }
}
function marketStall(g,x,y,reverse=false){
  g.save();g.translate(x,y);if(reverse)g.scale(-1,1);
  cut(g,'M-62 -104 L58 -104 L57 24 L-62 24 Z','#bfa786',null);
  bar(g,-52,-73,91,62,'#807b63');
  for(let i=0;i<5;i++){bar(g,-46+i*18,-72,2.4,59,'#a98f68');bar(g,-42+i*18,-65,8,17,'#8f9478')}
  bar(g,-50,-51,93,3,'#b49569');
  cut(g,'M-69 -104 L49 -107 L66 -87 L-77 -82 Z','#c4b18c',wood,1.3);
  for(let i=0;i<8;i++){
    const left=-68+i*15;
    cut(g,'M'+left+' -103 l10 0 l7 19 l-14 1 Z',i%2?'#c4a37f':'#aa7460',null);
  }
  pen(g,'M-76 -82 L66 -88','#796751',2.5);
  bar(g,-63,-81,5,117,wood);bar(g,52,-85,5,117,wood);
  cut(g,'M-69 -16 L55 -21 L70 -13 L-70 -7 Z','#c3a373',wood,1.15);
  cut(g,'M-66 -7 L63 -12 L62 23 L-65 27 Z','#aa8d67',wood,1.1);
  for(let i=0;i<9;i++)pen(g,'M'+(-60+i*14)+' -5 l1 28','#bca17b',1.3);
  g.restore();
}
function actorStamp(id){
  return master('actor-'+id,320,416,(g)=>{
    g.scale(2,2);g.translate(76,111);puppet(g,id);
  });
}
function actor(g,id,x,y,s,flip=false){
  g.save();g.translate(x,y);g.scale(flip?-s:s,s);
  const stamp=actorStamp(id);
  raised(g,()=>g.drawImage(stamp,-76,-111,160,208),2.3);g.restore();
}
function meeting(g){
  sky(g,'#d4dbbc','#f5e4bb');
  cloud(g,215,40,.92,'#f1e7c6');cloud(g,610,62,.66,'#e8e1be');
  mountain(g,'M0 137 Q44 100 84 108 Q116 88 161 108 Q186 91 212 97 Q249 65 303 87 Q335 62 379 89 Q428 71 461 87 Q518 63 549 95 Q590 86 643 111 L720 92 L720 179 L0 179 Z','#b6c2a6');
  for(const [x,s,n] of [[67,.92,0],[156,.88,1],[254,1,2],[350,.9,0],[439,1.08,1],[549,.9,2],[651,1.02,0]])rowHouse(g,x,174,s,n);
  cut(g,'M0 171 Q156 151 276 168 Q434 169 720 153 L720 400 L0 400 Z','#e5d6b2',null);
  paving(g);
  marketStall(g,36,206);marketStall(g,684,196,true);
  willow(g,574,175,.69);rowHouse(g,489,162,.65,0);
  pen(g,'M-4 -3 Q193 72 371 41 Q534 63 727 -3','#867557',2.8);
  for(const [x,y,c] of [[49,15,'#bc8164'],[90,25,'#8f9d7b'],[132,34,'#c8a464'],[176,39,'#ae7361'],[215,43,'#8d9c80'],[504,42,'#b99164'],[551,37,'#8c9e81'],[595,30,'#b68067'],[641,20,'#ba975e'],[684,9,'#849780']]){
    cut(g,'M'+x+' '+y+' l14 2 l-8 16 Z',c,null);
  }
  const neighbors=[['stage',145,245,1,false],['boat',284,218,.85,false],['tea',431,220,.85,true],['books',574,247,.98,true]];
  for(const [,x,y,s] of neighbors)groundShadow(g,x,y+s*87,37*s);
  for(const [id,x,y,s,flip] of neighbors)actor(g,id,x,y,s,flip);
  // The empty lamp frames on the communal worktable give the four friends a shared focus.
  groundShadow(g,356,342,74);
  cut(g,'M280 298 L407 294 L436 306 L302 315 Z','#c29b6a',wood,1.5);
  cut(g,'M303 311 L436 303 L435 311 L305 320 Z','#916745',darkWood,1.1);
  for(const [x,y,h] of [[289,303,27],[413,304,28],[307,315,29],[429,309,29]]){bar(g,x,y,6,h,wood);bar(g,x+1,y+2,1.8,h-4,'#bd966c')}
  placed(g,355,281,.75,c=>{
    for(const d of ['M-12 23 Q-31 -1 -12 -18','M-5 23 Q-17 -1 -6 -20','M6 23 Q16 0 5 -20','M13 22 Q29 0 12 -19'])pen(c,d,'#aa8156',2.2);
    oval(c,0,-18,13,4,'#d7bc89','#9d7850',1.5);oval(c,0,22,13,3.5,'#cab281','#9d7850',1.6);
    pen(c,'M-21 -1 Q0 4 21 -3','#b39060',1.35);
  });
  cut(g,'M304 296 l25 -2 l12 6 l-27 2 Z','#b87962',null);
  cut(g,'M376 294 l19 -2 l11 4 l-23 4 Z','#91a384',null);
  pen(g,'M318 306 l15 -1 M384 304 l21 -2','#e1cda4',2);
}
function gate(g,x,y,s){
  placed(g,x,y,s,()=>{
    cut(g,'M-130 -119 L94 -130 L122 -111 L122 42 L-128 48 Z','#b9a686',darkWood,2);
    cut(g,'M94 -128 L122 -111 L122 42 L98 41 Z','#9c8b70',null);
    cut(g,'M-128 -110 L98 -119 L97 43 L55 44 L55 -4 Q54 -44 16 -43 Q-22 -42 -26 -4 L-26 47 L-128 48 Z','#bd8c6c','#826a54',1.5);
    for(let row=0;row<8;row++){
      const yy=-99+row*19;
      for(let col=0;col<8;col++){
        const xx=-125+col*34+(row%2)*16;
        if(xx>85||yy>-49&&xx>-51&&xx<58)continue;
        pen(g,'M'+xx+' '+yy+' l26 -1 m2 1 v8','#ab8064',1.1);
      }
    }
    cut(g,'M-42 46 L-42 -4 Q-37 -55 11 -59 Q62 -62 70 -8 L70 44 L55 44 L55 -4 Q52 -43 17 -44 Q-19 -44 -26 -6 L-26 46 Z','#debb90','#9b7b60',1.35);
    for(const [a,b,c,d] of [[-42,-5,-27,-5],[-38,-27,-24,-22],[-27,-44,-17,-33],[-10,-55,-6,-42],[10,-59,11,-44],[33,-57,29,-41],[52,-45,43,-33],[64,-29,51,-23],[69,-10,55,-8]]){
      pen(g,'M'+a+' '+b+' L'+c+' '+d,'#ac8d70',1);
    }
    cut(g,'M-117 -119 L96 -126 L113 -113 L-110 -102 L-137 -110 Z','#a67a5a',darkWood,1.7);
    cut(g,'M-107 -137 L88 -144 L89 -124 L-107 -118 Z','#bd9872',wood,1.2);
    for(let i=0;i<16;i++)bar(g,-103+i*12,-137-i*.35,3.7,15,'#8f6d52');
    cut(g,'M-151 -149 Q-128 -146 -111 -153 Q-85 -166 -66 -188 L54 -194 Q75 -169 100 -158 Q120 -151 138 -161 Q133 -146 112 -137 L-122 -126 Q-143 -131 -151 -149 Z','#50665c',ink,2);
    cut(g,'M-66 -187 L52 -193 Q76 -165 101 -157 Q56 -157 -14 -153 L-110 -147 Q-86 -164 -66 -187 Z','#6e8372',null);
    for(let i=0;i<16;i++){
      const xx=-65+i*7.6;
      pen(g,'M'+xx+' '+(-184-i*.3)+' q-8 17 -22 33','#99a48b',1.35);
    }
    pen(g,'M-147 -142 Q-130 -131 -115 -134 L105 -145 Q128 -148 136 -158','#d5c59d',2.5);
    pen(g,'M-72 -188 Q-11 -189 54 -194','#aab097',4);
    cut(g,'M-79 -191 Q-69 -183 -62 -191 M50 -195 Q59 -188 66 -200',null,ink,3.5);
    // A painted cloud emblem on the lintel keeps the gate recognisable without a text label.
    cut(g,'M-30 -104 L52 -108 L53 -83 L-30 -79 Z','#667b66',wood,1.5);
    pen(g,'M-21 -91 Q-8 -88 0 -94 Q4 -101 11 -95 Q19 -102 24 -96 Q32 -94 40 -97','#d8c397',2.1);
    for(const xx of [-83,77]){
      placed(g,xx,-89,.52,c=>circleLamp(c,false));
    }
  });
}
function departure(g){
  sky(g,'#d4dabb','#fae5b5');
  oval(g,566,73,35,35,'#f9daa0');oval(g,563,72,29,29,'#f8d594');
  cloud(g,620,85,.7,'#eae2c0');cloud(g,388,53,.67,'#ece6c9');
  distantTown(g,'#b6c3a7');
  cut(g,'M0 197 Q204 174 329 191 Q473 178 720 190 L720 400 L0 400 Z','#aeb99a',null);
  cut(g,'M0 201 Q118 191 202 202 Q321 204 448 179 L465 180 Q412 189 405 202 Q416 215 481 220 Q630 233 720 266 L720 400 L0 400 Z','#d8c7a3','#b0a98c',1);
  cut(g,'M449 181 Q367 197 381 206 Q399 218 429 221 Q569 248 667 304 Q717 329 720 338 L720 400 L0 400 L0 344 Q159 262 323 217 Q355 207 353 202 Q360 193 449 181 Z','#ead6ad',null);
  for(const [x,y,s] of [[54,367,1.4],[108,320,1.1],[306,352,1.5],[364,290,.82],[503,299,.92],[588,349,1.3],[342,235,.53],[391,221,.44],[480,254,.62],[260,284,.73]]){
    placed(g,x,y,s,()=>{pen(g,'M-10 0 l18 -1 l4 2','#c4af88',1.3);pen(g,'M9 4 l9 1','#d5c29b',1)});
  }
  // Inside the gateway the road is visible through the open arch.
  cut(g,'M0 69 L152 90 L145 282 L0 308 Z','#a79473','#766e56',1.3);
  gate(g,157,225,1.13);
  willow(g,16,329,1.42);rowHouse(g,663,210,.94,1);willow(g,723,241,.85);
  cut(g,'M0 325 Q28 307 58 318 Q72 304 94 318 Q111 308 127 323 L148 327 Q98 328 47 348 L0 350 Z','#a2aa83',null);
  bar(g,521,226,6,75,wood);bar(g,523,227,1.5,72,'#bd966b');
  cut(g,'M501 228 L542 228 L554 237 L543 246 L501 248 Z','#d6ad67',wood,1.55);
  pen(g,'M512 239 l23 -1 m-5 -5 l6 5 l-6 5','#fff0bc',2.25);
  groundShadow(g,364,345,56);actor(g,'traveler',364,247,1.11);
  const halo=g.createRadialGradient(431,263,1,431,263,31);
  halo.addColorStop(0,'rgba(255,211,113,.38)');halo.addColorStop(.48,'rgba(250,201,103,.21)');halo.addColorStop(1,'rgba(255,211,113,0)');
  oval(g,431,263,31,31,halo);
  for(const [x,y,s] of [[575,305,.93],[636,335,1.38],[707,354,1.4],[101,354,.76]]){
    placed(g,x,y,s,()=>{cut(g,'M-17 0 Q-23 -13 -13 -10 L-9 -4 Q-10 -22 -5 -23 Q-1 -18 -3 -7 Q5 -21 11 -18 Q12 -12 4 -4 Q14 -12 20 -8 Q13 0 4 1 Z','#8f9e78',null);pen(g,'M-4 0 l-1 -11 M1 0 l8 -11','#b5bc91',1.1)});
  }
}

let fibre;
function addFibre(g,w,h){
  if(!fibre){
    fibre=document.createElement('canvas');fibre.width=103;fibre.height=89;
    const f=fibre.getContext('2d');
    let state=94037;
    const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296};
    for(let i=0;i<410;i++){
      const x=random()*103,y=random()*89,len=.6+random()*3;
      f.strokeStyle=i%3?'rgba(86,64,39,.095)':'rgba(255,253,226,.48)';
      f.lineWidth=.4+random()*.45;f.beginPath();f.moveTo(x,y);f.lineTo(x+len,y+random()*1.8-1.1);f.stroke();
    }
  }
  g.save();g.globalCompositeOperation='source-atop';g.fillStyle=g.createPattern(fibre,'repeat');g.fillRect(0,0,w,h);g.restore();
}
function master(key,w,h,draw){
  if(cache.has(key))return cache.get(key);
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const g=canvas.getContext('2d');g.lineJoin='round';g.lineCap='round';draw(g);
  cache.set(key,canvas);return canvas;
}
function accessibleCopy(source,description){
  const copy=document.createElement('canvas');copy.width=source.width;copy.height=source.height;
  copy.getContext('2d').drawImage(source,0,0);
  copy.setAttribute('role','img');copy.setAttribute('aria-label',description);
  return copy;
}
const scenes=[storm,meeting,departure];
const descriptions=[
  '大風吹過古城河岸。戲棚布簾翻起，河上的畫舫晃動，四盞花燈在風裏熄滅。',
  '說書人拿着摺扇，畫師執着畫筆，茶館小二端着茶壺，書坊掌櫃捧着書。他們在燈架旁相聚。',
  '小旅人提着燈，從西城門沿小路出發。金色箭頭指向前面的市集。'
];
/** Zero-based chapter index, matching the story reader. No network assets are needed. */
export function storyArt(chapter=0){
  const scene=scenes[chapter];
  if(!scene)throw new RangeError('Unknown story chapter: '+chapter);
  const canvas=master('chapter-'+chapter,1080,600,g=>{
    g.scale(1.5,1.5);scene(g);addFibre(g,WIDTH,HEIGHT);
  });
  return accessibleCopy(canvas,descriptions[chapter]);
}
const moodLabels={neutral:'',hint:'，側着頭托腮思考',celebrate:'，笑着揮手鼓勵你'};
function expressionAccents(g,mood){
  if(mood==='hint'){
    oval(g,35,-65,2.2,2.2,'#e0c387','#ae9869',.8);
    oval(g,41,-71,3.1,3,'#ecd7a3','#b29a6e',.8);
    cut(g,'M42 -80 Q38 -85 41 -89 Q42 -94 48 -94 Q52 -101 58 -97 Q66 -99 68 -92 Q75 -88 70 -82 Q70 -77 63 -77 L47 -77 Q44 -77 42 -80 Z',wash(g,46,-97,65,-77,[[0,'#fff3ca'],[1,'#e5c38a']]),'#aa9467',1.1);
  }else if(mood==='celebrate'){
    for(const [x,y,s] of [[49,-82,1],[-54,-84,.77],[62,-66,.45]]){
      placed(g,x,y,s,()=>{cut(g,'M0 -9 Q2 -3 8 -1 Q10 0 7 2 Q2 3 0 9 Q-1 10 -2 7 Q-4 2 -9 1 Q-11 0 -8 -1 Q-2 -3 -1 -8 Z','#edb85d','#a47846',1);pen(g,'M-4 -1 l3 -3','#ffedb8',1.3)});
    }
  }
}
/** A transparent, closely framed bust in its reading, thinking or congratulatory pose. */
export function guidePortrait(id='traveler',mood='neutral'){
  if(!Object.hasOwn(wardrobe,id))throw new RangeError('Unknown guide: '+id);
  if(!Object.hasOwn(moodLabels,mood))throw new RangeError('Unknown guide mood: '+mood);
  const canvas=master('portrait-'+id+'-'+mood,256,256,g=>{
    const sheet=document.createElement('canvas');sheet.width=256;sheet.height=256;
    const p=sheet.getContext('2d');p.lineJoin='round';p.lineCap='round';
    p.scale(1.68,1.68);p.translate(71,111);
    p.clip(vector('M-71 -110 L81 -110 L81 25 Q61 30 38 33 Q9 44 -14 37 Q-36 37 -53 23 L-71 17 Z'));
    puppet(p,id,mood);expressionAccents(p,mood);
    g.shadowColor='rgba(83,55,43,.23)';g.shadowOffsetX=1.9;g.shadowOffsetY=3.0;g.shadowBlur=2.4;
    g.drawImage(sheet,0,0);g.shadowColor='transparent';addFibre(g,256,256);
  });
  return accessibleCopy(canvas,guideNames[id]+moodLabels[mood]);
}
