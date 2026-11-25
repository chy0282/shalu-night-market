const W = 720, H = 165;
const ink = '#574337', wood = '#875a43', jade = '#648678', moss = '#8b9d71';
const red = '#ad5243', blush = '#d99072', ivory = '#f7e8c7', ochre = '#dbad66';
const playing = new WeakMap();

function trace(g, pts) {
  g.beginPath(); g.moveTo(...pts[0]);
  for (const p of pts.slice(1)) {
    if (p.length === 2) g.lineTo(...p);
    else if (p.length === 4) g.quadraticCurveTo(...p);
    else g.bezierCurveTo(...p);
  }
}
function paper(g, pts, color, edge = ink, width = 1.5) {
  trace(g, pts); g.closePath(); g.fillStyle = color; g.fill();
  if (edge) { g.strokeStyle = edge; g.lineWidth = width; g.stroke(); }
}
function line(g, pts, color = ink, width = 1.65) {
  trace(g, pts); g.strokeStyle = color; g.lineWidth = width; g.stroke();
}
function rect(g, x, y, w, h, color) {
  g.fillStyle = color; g.fillRect(x,y,w,h);
}
function oval(g, x, y, rx, ry, color, edge, width = 1.4) {
  g.beginPath(); g.ellipse(x,y,rx,ry,0,0,Math.PI*2); g.fillStyle = color; g.fill();
  if (edge) { g.strokeStyle = edge; g.lineWidth = width; g.stroke(); }
}
function at(g,x,y,s,fn) { g.save(); g.translate(x,y); g.scale(s,s); fn(); g.restore(); }
function clamp(x) { return Math.max(0,Math.min(1,x)); }
function ease(x) { x = clamp(x); return x*x*(3-2*x); }

function ridge(g, y, color, phase) {
  const pts = [[-5,H],[-5,y]];
  for (let i=0;i<=18;i++) {
    const x=i*43, h=y+Math.sin(i*1.51+phase)*10+Math.cos(i*.81)*7;
    pts.push([x-20,h-10,x,h]);
  }
  pts.push([W+5,H]); paper(g,pts,color,null);
}

function windowFrame(g,x,y,w,h) {
  rect(g,x,y,w,h,'#dcc89e'); rect(g,x+3,y+3,w-6,h-6,'#e9dec0');
  for(let i=0;i<=4;i++) {
    const xx=x+i*w/4;
    line(g,[[xx,y+1],[xx,y+h-1]],'#947653',2);
  }
  for(const t of [.18,.74,.86])line(g,[[x,y+h*t],[x+w,y+h*t]],'#a78b66',1.4);
  line(g,[[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]],wood,2.4);
}

function smallLantern(g,x,y,s=1) {
  at(g,x,y,s,()=>{
    line(g,[[0,-18],[0,-10]],wood);
    oval(g,0,0,10,11,red,ink);
    oval(g,0,0,6.4,10.2,'#d17c56'); oval(g,-.8,-.5,2.7,9.3,'#e9a968');
    rect(g,-5,-11,10,2.6,ochre);rect(g,-5,9,10,2.8,ochre);
    line(g,[[0,12],[0,19]],red,2.2);
  });
}

function umbrella(g,x,y,s=1,color='#93a779') {
  at(g,x,y,s,()=>{
    line(g,[[0,-13],[0,24],[-1,29,-6,26]],wood,2.8);
    paper(g,[[-30,1],[-18,-17,-2,-18],[0,-20],[2,-18],[19,-17,31,1],
      [23,-3,16,2],[8,-3,0,2],[-7,-3,-15,2],[-22,-3,-30,1]],color);
    for(const n of [-16,0,16])line(g,[[0,-17],[n*.7,-10,n,1]],'#607e62',1.1);
  });
}

function bridge(g,x,y,s=1,painted=false) {
  at(g,x,y,s,()=>{
    paper(g,[[-36,13],[-32,4,-20,-2],[-2,-15,18,-6],[31,-2,38,10],[38,17],
      [28,17],[15,-5,-2,-1],[-17,0,-24,17],[-36,17]],painted?'#cba77c':'#c5b99d');
    line(g,[[-36,10],[-18,-7,2,-8],[23,-8,38,10]],painted?red:'#8b806a',3.1);
    line(g,[[-35,6],[-16,-11,2,-12],[22,-12,37,6]],painted?'#ddc17a':ivory,2);
    if(painted)line(g,[[-35,14],[-15,-4,3,-4],[22,-4,37,14]],'#7b9989',2);
    for(let i=0;i<5;i++){const xx=-31+15*i;const yy=-7+Math.abs(xx)*.36;line(g,[[xx,yy],[xx,yy-4]],wood,2.1)}
  });
}

function tree(g,x,y,s=1,willow=false) {
  at(g,x,y,s,()=>{
    paper(g,[[-5,23],[-1,14,-3,1],[-12,-11],[-10,-14],[0,-5],
      [10,-16],[12,-13],[4,-1],[2,16,6,23]],'#8e7251');
    const green=willow?'#8ca16c':'#83a083';
    paper(g,[[-30,-7],[-30,-18,-19,-20],[-12,-30,0,-24],[11,-30,20,-19],
      [30,-19,31,-9],[26,-3,18,-7],[12,0,7,-5],[0,2,-8,-5],[-16,0,-21,-7],[-25,-2,-30,-7]],green);
    if(willow)for(let i=0;i<14;i++){
      const xx=-28+i*4.3, hi=-13-Math.sin(i/13*Math.PI)*8,low=-1+Math.sin(i*1.7)*4;
      paper(g,[[xx,hi],[xx+2,hi-1],[xx+2,low+4,xx-2,low+13],[xx-1,low+3,xx,hi]],i%2?moss:'#739172',null);
    }
    else for(const [xx,yy] of [[-18,-14],[-6,-21],[7,-17],[19,-12]]) {
      line(g,[[xx-5,yy+3],[xx-2,yy-3,xx+4,yy]],'#b3c39b',2);
    }
  });
}

function figure(g,x,y,s,{pose='',coat=jade,head=0,hat=true,mirror=false,modern=false,ponytail=false}={}) {
  g.save();g.translate(x,y);g.scale(mirror?-s:s,s);
  const chin=pose==='疑'?2:0;
  line(g,[[-5,17],[-5,27],[-11,28]],ink,4.6);
  line(g,[[5,17],[6,26],[12,26]],ink,4.4);
  paper(g,[[-7,-4],[-13,4],[-16,20],[-8,21],[2,19],[14,21],[10,1],[5,-5]],coat);
  if(modern){
    paper(g,[[-8,-3],[0,0],[7,-4],[4,3],[0,1],[-4,4]],ivory,'#b4ab95',.8);
    line(g,[[-13,15],[12,15]],'#566c78',1.6);
    line(g,[[-5,23],[-5,26]],ivory,3);line(g,[[6,22],[6,25]],ivory,3);
  }else{
    line(g,[[-6,-3],[2,4],[-7,11]],ivory,2);
    line(g,[[-12,12],[11,12]],'#a86547',2.5);
  }
  const arm = pose==='招' ? [[9,2],[18,-3],[22,-13]] :
    pose==='喜' ? [[9,2],[17,-3],[19,-8]] : pose==='悟' ? [[8,3],[15,-2],[15,-11]] :
    pose==='怒' ? [[9,2],[17,8],[6,12]] : [[9,2],[17,8],[21,5]];
  line(g,arm,ink,6);line(g,arm,coat,4.1);
  const end=arm.at(-1);oval(g,end[0],end[1],2.6,3.5,'#e2b590',ink,.8);
  const elbow=pose==='怒'?[[ -9,3],[-17,8],[-4,11]]:[[ -9,3],[-14,9],[-14,13]];
  line(g,elbow,ink,5.6);line(g,elbow,coat,3.9);
  g.save(); g.translate(0,-13+head);g.rotate(pose==='疑'?-.13:pose==='怒'?.10:0);
  paper(g,[[-11,-9],[-5,-15,5,-12],[12,-10,12,-3],[16,2],[13,4],
    [12,12,4,14],[-4,14+chin,-8,9],[-13,5,-12,-2]],'#e8bd95');
  paper(g,[[-12,1],[-16,-7,-10,-14],[-4,-18,4,-15],[11,-15,13,-7],
    [7,-8,4,-9],[2,-4,-4,-4],[-7,2,-8,6],[-10,1,-12,1]],ink);
  if(hat){
    paper(g,[[-12,-9],[-11,-18,-5,-20],[3,-22,9,-17],[12,-12],[4,-11],[-4,-11,-12,-9]],'#4e6565');
    line(g,[[-12,-10],[0,-14,11,-12]],'#c0b58c',1.4);
  } else if(!modern) oval(g,-10,-13,6,6,'#51413b',ink,.9);
  else if(ponytail){
    paper(g,[[-9,-9],[-21,-17,-20,-8],[-20,-4,-23,0],[-16,0,-13,-5]],'#51413b',ink,1.2);
    oval(g,-12,-8,1.7,2.4,red);
  }
  // Eyebrow, eye and mouth carry the tea speaker's feeling as well as the pose.
  if(pose==='疑')line(g,[[4,-5],[8,-8,11,-6]],ink,1.6);
  if(pose==='怒')line(g,[[3,-6],[10,-2]],ink,1.8);
  if(pose==='喜'||pose==='悟')line(g,[[5,0],[7,-3,10,0]],ink,1.6);
  else oval(g,8,0,1.45,pose==='招'?2.1:1.7,ink);
  oval(g,6,5.8,2.4,1.35,blush);
  if(pose==='招'||pose==='疑')oval(g,10,8.1,2,2.4,'#986b55');
  else line(g,[[7.7,9],[9.5,pose==='怒'?7:11.7,12,9]],'#8e6050',1.1);
  g.restore();g.restore();
}

function blind(g,x,y,w,h,tint) {
  paper(g,[[x,y],[x+w,y],[x+w,y+h-2],[x+w-6,y+h],[x+6,y+h],[x,y+h-2]],tint,'#a18964',.9);
  for(let i=3;i<h;i+=5)line(g,[[x+1,y+i],[x+w-1,y+i]],'#b59e70',.65);
  line(g,[[x+w*.16,y],[x+w*.16,y+h-1]],'#8b785a',.85);
  line(g,[[x+w*.84,y],[x+w*.84,y+h-1]],'#8b785a',.85);
}

// The ancient shops frame the activity. Inside the puppet panels and printed book
// the children meet the places they recognise from school, home and Hong Kong.
function backdrop(g,place) {
  const indoor=['class','art','music','library','kitchen','room','bedroom','door','rain','party'];
  if(indoor.includes(place)){
    rect(g,-80,-77,160,77,'#e8dcc0');
    if(place==='class'||place==='art'||place==='music'){
      rect(g,-69,-66,104,37,wood);rect(g,-67,-64,100,33,'#638576');
      line(g,[[-65,-32],[34,-32]],'#c8ad82',2);
      if(place==='music'){
        for(let i=0;i<5;i++)line(g,[[-60,-57+i*3],[23,-57+i*3]],'#abbca1',.8);
        for(const [x,y] of [[-47,-47],[-30,-50],[-13,-45],[7,-52]]){
          oval(g,x,y,2.5,1.5,'#ddd9b9');line(g,[[x+2,y],[x+2,y-7]],'#ddd9b9',1);
        }
      } else {
        line(g,[[-59,-56],[-47,-56]],'#b2bea4',1.3);line(g,[[-59,-51],[-40,-51]],'#aac1ac',1.1);
      }
      oval(g,59,-54,8,8,ivory,wood,1);line(g,[[59,-58],[59,-54],[63,-52]],ink,1);
    }else if(place==='library'){
      rect(g,-72,-65,88,42,wood);rect(g,-70,-63,84,38,'#af9671');
      for(let shelf=0;shelf<2;shelf++)for(let i=0;i<12;i++){
        const h=10+(i*7+shelf)%6,x=-67+i*6.5,y=-44+shelf*18;
        rect(g,x,y-h,4.5,h,[jade,red,'#bb975f','#929ba3'][i%4]);rect(g,x+.5,y-4,3,1,'#e8d8b9');
      }
      rect(g,-73,-44,91,2,wood);
    }else if(place==='kitchen'||place==='party'){
      for(let i=0;i<3;i++){rect(g,-73+i*37,-68,34,21,'#b79b75');rect(g,-71+i*37,-66,30,17,'#d7bc90');rect(g,-55+i*37,-52,5,1,wood)}
      rect(g,-79,-32,151,6,'#ad936f');rect(g,-79,-26,151,11,'#cfb692');
      if(place==='party')for(const [x,c] of [[40,red],[53,ochre],[66,jade]]){line(g,[[x,-56],[x+2,-41]],wood,.8);oval(g,x,-61,5,7,c,wood,.9)}
    }else if(place==='bedroom'){
      rect(g,-77,-64,46,28,'#a18a68');rect(g,-75,-62,42,24,'#c2d4c5');
      rect(g,23,-33,7,27,wood);paper(g,[[26,-27],[67,-26],[77,-17],[28,-17]],'#a2ad96',wood,1);
      oval(g,35,-28,7,3.2,ivory);rect(g,28,-18,49,4,wood);
    }else{
      rect(g,-66,-63,66,33,'#a38d6b');rect(g,-63,-60,60,27,'#c8d8c8');
      for(const x of [-44,-23])line(g,[[x,-60],[x,-33]],'#aa997a',1.3);
      if(place==='rain')for(let i=0;i<8;i++)line(g,[[-61+i*7,-56+(i%3)*4],[-64+i*7,-47+(i%3)*4]],'#7e9fa2',.9);
      if(place==='door'){rect(g,24,-68,32,55,'#9c7b59');rect(g,27,-66,26,51,'#c8a880');oval(g,48,-41,1.4,1.4,ink)}
    }
    rect(g,-80,-11,160,11,'#c3ac88');line(g,[[-80,-12],[80,-12]],'#a28c6f',1.4);return;
  }
  rect(g,-80,-77,160,77,'#dfdbc0');
  if(place==='court'||place==='playground'){
    rect(g,-80,-48,160,33,'#c3baa4');
    for(let i=0;i<7;i++)rect(g,-71+i*21,-43,10,12,'#8da89f');
    rect(g,-80,-24,160,24,'#be9785');line(g,[[-80,-4],[24,-16,80,-13]],'#e6d2a9',1.7);
    if(place==='court'){rect(g,49,-60,19,13,'#e7dfca');line(g,[[61,-59],[61,-18]],'#9a8d75',1.5);line(g,[[53,-51],[63,-51]],red,1.8)}
    return;
  }
  if(place==='street'||place==='bus'||place==='station'||place==='market'){
    for(let i=0;i<5;i++) {
      const x=-80+i*33,h=28+(i*13)%26;
      rect(g,x,-21-h,32,h,['#b1bbc0','#c5b497','#a8b9ad'][i%3]);
      for(let j=0;j<3;j++)for(let k=0;k<2;k++)rect(g,x+4+j*9,-18-h+k*12,5,7,'#869b9a');
    }
    rect(g,-80,-22,160,22,'#bcaf96');line(g,[[-80,-16],[80,-16]],'#e9d6aa',2);
    if(place==='bus'||place==='station'){
      rect(g,47,-61,3,44,'#738274');paper(g,[[40,-59],[57,-59],[57,-49],[40,-49]],'#dfc89e',wood,1);
    }
    if(place==='market'){
      for(let i=0;i<9;i++)rect(g,-72+i*12,-58,12,8,i%2?'#e1bf9c':'#aa7862');
      line(g,[[-70,-50],[-70,-21]],wood,1.5);line(g,[[33,-50],[33,-21]],wood,1.5);
    }
    return;
  }
  paper(g,[[-80,-32],[-65,-55,-45,-42],[-35,-54,-18,-51],[8,-67,32,-46],[51,-58,80,-38],[80,0],[-80,0]],'#b6c2a7',null);
  if(['beach','harbour','ferry','lookout'].includes(place)){
    if(place!=='beach')for(let i=0;i<11;i++){
      const x=-76+i*14,h=9+(i*7)%18;rect(g,x,-33-h,8+i%4,h,'#a9b6ac');
    }
    rect(g,-80,-33,160,33,'#a5c1b2');
    for(let i=0;i<9;i++)line(g,[[-80+i*20,-26+i%3*4],[-74+i*20,-24+i%3*4,-66+i*20,-26+i%3*4]],'#d6d9bb',.9);
    if(place==='beach')paper(g,[[-80,-12],[-25,-18,14,-8],[56,-5,80,-13],[80,0],[-80,0]],'#d3bc91',null);
    if(place==='ferry'){rect(g,-80,-5,160,5,'#ae9272');line(g,[[-80,-13],[80,-13]],wood,1.3)}
    if(place==='lookout'){
      at(g,33,-24,.22,()=>motif(g,'ferry'));
      paper(g,[[-80,-12],[-47,-21,-20,-14],[10,-19,33,-12],[58,-14,80,-6],[80,0],[-80,0]],'#9cad8d',null);
    }
  }else{
    paper(g,[[-80,-22],[-46,-37,-16,-28],[28,-37,80,-25],[80,0],[-80,0]],'#a9b693',null);
    if(place==='park'){tree(g,-64,-33,.69);tree(g,59,-34,.53);line(g,[[-80,-5],[-40,-13,0,-7],[43,-3,80,-10]],'#d7cbab',4)}
    if(place==='trail')paper(g,[[-54,0],[-37,-14,-5,-18],[12,-22,17,-31],[25,-33],[26,-18,-1,-15],[-24,-10,-35,0]],'#d3bc91',null);
  }
}

function book(g,color=jade) {
  paper(g,[[-17,-13],[-1,-11],[15,-14],[16,12],[1,16],[-16,13]],color,ink,1.4);
  paper(g,[[-16,-15],[-6,-16,0,-12],[8,-17,15,-16],[15,9],[8,7,1,12],[-6,7,-16,9]],ivory,wood,1.1);
  line(g,[[0,-12],[1,12]],'#b8a382',1);
  for(const x of [-12,3])for(let i=0;i<3;i++)line(g,[[x,-9+i*6],[x+7,-8+i*6]],'#b3a688',1);
}
function ball(g,color='#c58b63') {
  oval(g,0,0,14,14,color,ink);line(g,[[-13,-4],[0,0,13,5]],ink,1.25);
  line(g,[[-7,-12],[6,0,8,11]],ink,1.1);line(g,[[-11,9],[-3,2,-3,-13]],ink,1.15);
}
function pencil(g,color=ochre) {
  paper(g,[[-13,12],[-11,5],[9,-17],[14,-13],[-6,10]],color,ink,1.15);
  paper(g,[[-13,12],[-11,5],[-6,10]],ivory,ink,.7);line(g,[[-13,12],[-11,10]],ink,1.4);
}
function bag(g) {
  line(g,[[-10,-4],[-11,-18,-3,-19],[7,-21,9,-5]],wood,3.4);
  paper(g,[[-15,-8],[14,-9],[18,15],[-17,16]],'#c6a979',ink);
  line(g,[[-11,-3],[-9,12],[12,11]],'#e0c596',1.35);
}
function bottle(g) {
  paper(g,[[-5,-17],[5,-17],[6,-12],[9,-8],[9,14],[6,17],[-6,17],[-9,14],[-9,-8],[-6,-12]],'#9cb7ae');
  rect(g,-5,-21,10,5,'#617e7b');rect(g,-8,-1,16,9,ivory);line(g,[[-3,3],[3,3]],jade,1.4);
}
function cake(g) {
  oval(g,0,12,25,5,'#d7cbae',wood,1);
  paper(g,[[-18,-4],[18,-4],[18,10],[0,16,-18,10]],'#d39b79',ink);
  oval(g,0,-4,18,5.5,'#f7e7c6',ink,1.15);
  paper(g,[[-12,-13],[10,-13],[10,-3],[-12,-3]],'#efcea7',wood,1);
  paper(g,[[-16,-13],[-1,-23],[15,-13]],'#cb8c79',wood,1);
  for(const x of [-8,3])rect(g,x,-11,4,4,'#8ba9a6');
  oval(g,13,-3,2.7,3.5,red);line(g,[[12,-6],[15,-7]],jade,.8);
}
function flower(g){
  line(g,[[0,2],[1,21]],jade,2.2);
  paper(g,[[1,13],[-12,12,-13,5],[-1,4,1,13]],moss,jade,.9);
  for(let i=0;i<6;i++)oval(g,Math.cos(i*Math.PI/3)*7,Math.sin(i*Math.PI/3)*7-5,6,6,blush,wood,.7);
  oval(g,0,-5,5,5,ochre,wood,.7);
}
function footprints(g){
  for(const [x,y] of [[-7,6],[5,-5],[-4,-13]]){
    oval(g,x,y,3.4,5.8,'#a28d71');oval(g,x,y+7,2.9,1.7,'#a28d71');
  }
}

function dailyProp(g,kind){
  switch(kind){
    case 'butterfly':butterfly(g,0,0,.82,'#d9a677');break;
    case 'little-fish':at(g,0,1,.73,()=>motif(g,'fish'));break;
    case 'book':book(g);break;
    case 'colours':for(const [x,c] of [[-7,red],[0,ochre],[7,jade]])at(g,x,0,.85,()=>pencil(g,c));break;
    case 'case':
      paper(g,[[-20,-8],[-14,-12],[15,-9],[20,-4],[19,9],[15,12],[-15,11],[-20,6]],'#8ca5ae');
      line(g,[[-17,-4],[16,-3]],goldInk,2.2);rect(g,-13,-4,3,5,wood);
      for(const [x,y] of [[-6,3],[4,5],[11,2]])oval(g,x,y,1.5,1.5,ivory);break;
    case 'model':
      paper(g,[[-23,8],[-13,-2],[-5,0],[3,5],[-1,10]],'#c68b69');
      paper(g,[[5,5],[13,-8],[17,-6],[14,0],[24,2],[23,6],[13,5],[8,9]],'#87a09b');
      line(g,[[1,-8],[2,-12]],wood,1);line(g,[[4,-5],[8,-9]],wood,1);break;
    case 'bottle':bottle(g);break;
    case 'library-label':
      rect(g,-21,-18,43,34,'#b69c77');
      for(let i=0;i<6;i++){rect(g,-19+i*6,-13+(i%2)*3,4.7,20-i%2*3,[jade,red,ochre][i%3]);rect(g,-18+i*6,1,2.5,2,ivory)}
      rect(g,-22,8,45,5,wood);
      for(const x of [-5,5])oval(g,x,6,2.5,2.5,'#b88b62',wood,.8);
      oval(g,0,9,6,5,'#c79c72',wood,.9);
      oval(g,-2.2,8.5,.8,.8,ink);oval(g,2.2,8.5,.8,.8,ink);oval(g,0,11,1.1,.8,ink);break;
    case 'papercut':
      butterfly(g,0,0,.99,'#b95f50');
      for(const direction of [-1,1]){g.save();g.scale(direction,1);
        paper(g,[[3,-2],[9,-12],[11,-13],[10,-8],[4,-1]],ivory,null);
        oval(g,12,6,2.6,1.7,ivory);g.restore()}
      break;
    case 'prints':footprints(g);break;
    case 'gift':
      paper(g,[[-17,-3],[16,-7],[17,12],[-14,17]],'#d7b58e');paper(g,[[-20,-8],[16,-12],[18,-6],[-18,-2]],'#d39a7c');
      line(g,[[-2,-10],[0,15]],red,3);line(g,[[-2,-10],[-13,-19,-7,-18],[-2,-17,-2,-11],[5,-22,10,-18],[12,-14,0,-11]],red,2.4);break;
    case 'ball':ball(g);break;
    case 'note':
      paper(g,[[-17,-30],[15,-31],[17,-28],[17,21],[-17,21]],'#c3d1c1',wood,1.3);
      line(g,[[-16,-13],[16,-13]],wood,1);line(g,[[-12,-8],[-12,3]],wood,2);
      paper(g,[[-5,-10],[10,-12],[10,1],[6,6],[-5,5]],'#e3c78d','#9d8156',1);
      oval(g,2,-9,2,2,red);for(let y=-4;y<4;y+=3)line(g,[[-3,y],[6,y-1]],wood,.8);break;
    case 'cake':cake(g);break;
    case 'bus':
      paper(g,[[-23,-14],[-19,-18],[18,-18],[22,-13],[22,10],[-22,10]],'#bd715a');
      for(const y of [-14,-4])for(let i=0;i<5;i++)rect(g,-19+i*7.6,y,5.8,6,'#d0ded2');
      for(const x of [-14,12]){oval(g,x,10,4.1,4.1,ink);oval(g,x,10,1.5,1.5,'#d2c7ad')}
      break;
    case 'bag':bag(g);break;
    case 'direction':
      rect(g,-2,-17,4,36,wood);paper(g,[[-18,-15],[13,-15],[22,-9],[13,-4],[-18,-4]],'#769489',wood,1.2);
      line(g,[[-8,-10],[9,-10]],ivory,2);line(g,[[6,-13],[10,-10],[6,-7]],ivory,1.6);break;
    case 'baton':
      line(g,[[-15,12],[14,-14]],ink,7);line(g,[[-15,12],[14,-14]],'#c47c66',4.6);
      for(const [x,y] of [[-12,-4],[-8,-8]])line(g,[[x-4,y],[x+4,y-4]],'#a29d83',1.1);break;
    case 'gather':
      for(const [x,y,c] of [[-12,2,jade],[0,-1,red],[11,3,'#7892a1']]){
        oval(g,x,y-5,4.5,4.5,'#dcaf89',ink,1);
        paper(g,[[x-5,y],[x+5,y],[x+7,y+13],[x-7,y+13]],c,wood,.9);
      }break;
    case 'warning':
      paper(g,[[0,-19],[22,16],[-21,16]],'#ddb568',wood,1.5);line(g,[[0,-8],[0,4]],ink,2.6);oval(g,0,10,1.8,1.8,ink);break;
    case 'picnic':
      line(g,[[-14,-2],[-10,-22,0,-19],[13,-19,15,-3]],wood,2.5);
      paper(g,[[-21,-3],[21,-3],[16,15],[-16,15]],'#c5a571',wood,1.3);
      for(const x of [-13,-6,1,8,15])line(g,[[x,0],[x-1,12]],'#9d7a52',.9);
      for(const y of [3,8])line(g,[[-18,y],[18,y]],'#ab845b',1);break;
    case 'cookies':
      oval(g,0,6,24,10,'#d2c6a8',wood,1);
      for(const [x,y] of [[-11,5],[2,-1],[12,7]]){oval(g,x,y,8,5.8,'#cc9d68',wood,.9);for(const dx of [-3,2])oval(g,x+dx,y+(dx%2),1,1,wood)}
      break;
    case 'meal':
      paper(g,[[-17,1],[17,1],[15,13,5,15],[-6,15],[-15,12,-17,1]],'#b4c5b8');
      oval(g,0,1,17,5.8,ivory,wood,1.1);line(g,[[5,0],[22,-16]],wood,1.7);line(g,[[8,1],[26,-13]],wood,1.7);break;
    case 'picture':
      paper(g,[[-22,-16],[20,-14],[22,14],[-22,15]],ivory,wood,1.2);
      paper(g,[[-18,11],[-8,-4],[1,4],[11,-6],[18,9]],moss,null);oval(g,9,-8,3.6,3.6,ochre);break;
    case 'bike':
      for(const x of [-13,15]){oval(g,x,8,9,9,ivory,ink,1.5);oval(g,x,8,1.5,1.5,ink)}
      line(g,[[-13,8],[-6,-5],[3,8],[-13,8],[-3,8],[9,-7],[15,8]],'#778f87',2.5);
      line(g,[[-9,-7],[-3,-7]],wood,2.2);line(g,[[8,-10],[14,-11]],ink,1.7);break;
    case 'goal':
      line(g,[[-21,7],[-21,-14],[20,-14],[20,8]],ivory,3.4);
      for(let x=-19;x<20;x+=6)line(g,[[x,-13],[x,4]],'#aaab92',.8);
      for(let y=-9;y<6;y+=5)line(g,[[-20,y],[20,y]],'#aaab92',.8);
      at(g,1,4,.56,()=>ball(g,ivory));break;
    case 'map':
      paper(g,[[-21,-12],[-8,-16],[6,-11],[20,-16],[20,12],[5,16],[-9,12],[-21,16]],'#d2cfab');
      line(g,[[-9,-14],[-9,12]],'#b2a17a',1);line(g,[[5,-11],[5,15]],'#b2a17a',1);
      line(g,[[-15,8],[-9,0,-3,3],[1,5,6,-3],[10,-8,15,-7]],red,1.8);break;
    case 'dolphin':
      paper(g,[[-21,6],[-12,-4,-5,-5],[-3,-12],[3,-6],[10,-8,16,-4],[22,-3,25,-4],
        [22,1,18,1],[13,9,3,9],[5,13],[-3,10],[-10,9,-15,12],[-19,15,-25,15],[-23,11,-20,9],[-26,7,-27,3]],'#eacabe',wood,1.3);
      oval(g,14,-2,1.1,1.1,ink);waterRipples(g);break;
    case 'flower':flower(g);break;
    case 'kite':
      paper(g,[[0,-20],[20,-3],[0,13],[-18,-3]],'#d5ad78',wood,1.4);
      paper(g,[[0,-20],[20,-3],[0,-3]],red,null);
      line(g,[[-18,-3],[20,-3]],wood,1);line(g,[[0,-20],[0,13]],wood,1);
      line(g,[[0,13],[-2,21,-11,19],[-16,17,-18,21]],wood,1.1);break;
    case 'broom':
      line(g,[[-10,10],[13,-20]],wood,2.5);
      paper(g,[[-12,2],[-5,7],[-12,21],[-24,12]],'#bd9f6d',wood,1.2);
      line(g,[[-10,6],[-17,16]],'#957950',1);break;
    case 'cloth':
      paper(g,[[-18,-10],[13,-13],[21,9],[-10,16]],'#8da9a0',wood,1.2);
      line(g,[[-7,-6],[-1,9]],'#c0cdaf',1.1);line(g,[[11,-8],[17,7]],'#c0cdaf',1.1);break;
    case 'umbrella':umbrella(g,0,0,.72);break;
    case 'music':
      for(const [x,y] of [[-12,4],[1,-3],[13,-8]]){oval(g,x,y+3,4.2,2.8,ink);line(g,[[x+3,y+3],[x+3,y-12]],ink,1.8)}
      line(g,[[4,-15],[16,-20]],ink,2.2);break;
    case 'fruit':at(g,0,0,.72,()=>motif(g,'apple'));break;
    case 'water':
      paper(g,[[-15,-8],[13,-8],[11,13],[-10,13]],'#a2bab2');oval(g,-1,-8,14,3.5,'#c2d4c8',wood,.9);break;
    case 'rain':
      cloud(g,-3,-8,.65);for(let i=0;i<5;i++)line(g,[[-16+i*8,1+i%2*4],[-20+i*8,11+i%2*4]],'#72969b',1.7);break;
    case 'sun':
      oval(g,0,0,11,11,'#d9ab65','#af8753',1);
      for(let i=0;i<8;i++)line(g,[[Math.cos(i*Math.PI/4)*15,Math.sin(i*Math.PI/4)*15],[Math.cos(i*Math.PI/4)*20,Math.sin(i*Math.PI/4)*20]],ochre,1.7);break;
    case 'tree':tree(g,0,0,.73);break;
    case 'pack':
      line(g,[[-8,-10],[-8,-20,0,-18],[8,-19,9,-10]],wood,2);
      paper(g,[[-15,-8],[-8,-14,7,-13],[15,-12,17,-5],[17,13],[12,17],[-12,17],[-16,13]],'#8da8ad');
      paper(g,[[-11,2],[11,2],[12,12],[-11,12]],'#aabbbc',wood,1);line(g,[[-8,5],[9,5]],wood,1);break;
    case 'rope':
      line(g,[[-19,-7],[-22,13,-7,14],[10,23,18,-5]],'#aa745f',2);line(g,[[-20,-7],[-16,-14]],wood,3);line(g,[[17,-5],[20,-13]],wood,3);break;
    case 'shuttle':
      oval(g,-1,11,7,3.5,'#9c7250',ink,.8);
      for(const [x,y,c] of [[-12,-16,'#cc8274'],[0,-22,ochre],[12,-14,jade]]){
        paper(g,[[-1,9],[x-6,y+6,x,y],[x+7,y+10,0,8]],c,wood,.9);line(g,[[-1,8],[x,y+3]],ivory,.75);
      }break;
    case 'desk':
      rect(g,-20,-4,40,5,'#b99469');rect(g,-16,1,3,15,wood);rect(g,13,1,3,15,wood);
      paper(g,[[-13,-6],[2,-8],[10,-3],[-7,-2]],'#81a39b',wood,.85);break;
    case 'board':
      rect(g,-22,-17,44,30,wood);rect(g,-20,-15,40,26,'#557b68');
      line(g,[[-16,-10],[-7,-10]],ivory,1);line(g,[[-16,-6],[-4,-6]],ivory,.9);
      paper(g,[[1,2],[13,-1],[16,4],[4,8]],'#bb9b75',wood,.8);break;
    case 'sea':case 'sand':case 'foam':
      paper(g,[[-22,-16],[20,-15],[22,15],[-21,16]],ivory,wood,1.2);
      rect(g,-17,-10,34,18,kind==='sand'?'#dfbe83':'#8db7bb');
      if(kind==='foam')for(let i=0;i<3;i++)line(g,[[-15,i*4-5],[-9,-9+i*4,-3,-5+i*4],[4,0+i*4,13,-5+i*4]],'#f7f3db',1.5);
      if(kind==='sand')for(let i=0;i<15;i++)oval(g,-13+i*11%28,-6+i*7%12,.65,.5,'#be995e');break;
    case 'beat':
      paper(g,[[-14,16],[-6,-17],[6,-17],[15,16]],'#a67b58',wood,1.2);
      paper(g,[[-9,8],[-3,-12],[4,-12],[10,8]],ivory,wood,.8);line(g,[[0,9],[8,-10]],ink,1.5);break;
    case 'conduct':line(g,[[-13,12],[16,-16]],wood,2.4);oval(g,-13,12,3.5,2.5,'#ba9873',ink,.9);break;
    case 'take-book':case 'return-book':
      dailyProp(g,'library-label');g.save();g.translate(kind==='take-book'?9:-10,0);g.rotate(-.14);rect(g,-3,-19,9,28,'#c58c6d');rect(g,-1,-3,4,3,ivory);g.restore();break;
    case 'steam':
      oval(g,0,7,23,7,'#cfb28d',wood,1);
      at(g,0,5,.55,()=>motif(g,'fish'));
      for(const x of [-8,5])line(g,[[x,0],[x-4,-7,x,-11],[x+3,-14,x+1,-19]],'#b3ac93',1.05);break;
    case 'stir':
      paper(g,[[-19,-3],[-10,9,4,9],[17,8,19,-2]],'#777d72');
      for(const x of [-10,-3,3,9])oval(g,x,-3+x%2,4,2.5,moss,wood,.6);
      line(g,[[16,-2],[25,-7]],wood,3);line(g,[[0,-4],[13,-17]],wood,1.8);break;
    case 'soup':
      paper(g,[[-16,-4],[16,-4],[14,12],[-13,12]],'#a2b2a1',wood,1.3);oval(g,0,-4,16,4.5,'#d5b374',wood,1);
      line(g,[[4,-4],[17,-19]],wood,2);break;
    case 'kite-tree':case 'kite-roof':case 'kite-hill':
      if(kind==='kite-tree')tree(g,-1,8,.57);
      else if(kind==='kite-roof'){rect(g,-14,4,27,16,'#d2ba93');paper(g,[[-19,6],[-2,-8],[19,6]],red,wood,1)}
      else paper(g,[[-25,18],[-16,0,-1,-4],[10,-7,24,18]],moss,jade,1);
      at(g,9,-12,.50,()=>dailyProp(g,'kite'));break;
    case 'temperature':
      line(g,[[-15,12],[13,-15]],ink,6);line(g,[[-15,12],[13,-15]],'#e0ddbe',4.3);
      oval(g,-14,11,3.1,3.1,red);line(g,[[-12,10],[1,-3]],red,1.4);
      for(let i=0;i<4;i++)line(g,[[i*3-3,1-i*3],[i*3-1,3-i*3]],wood,.65);break;
    case 'quilt':
      paper(g,[[-22,-4],[9,-9],[22,6],[-10,15]],'#8fa9a0',wood,1.2);
      for(const x of [-12,-3,6])line(g,[[x,-4],[x+10,8]],'#d4d5af',1.2);break;
    case 'wash':
      dailyProp(g,'meal');for(const [x,y] of [[-18,2],[-14,-5],[10,6],[5,-4]])oval(g,x,y,2.8,2.8,'#dce9d5','#95b6ad',.8);break;
    case 'shirt':
      paper(g,[[-10,-10],[-5,-16],[5,-16],[10,-10],[19,-6],[15,1],[10,-1],[10,15],[-10,15],[-10,-1],[-16,1],[-20,-5]],'#94ada8',wood,1.1);
      line(g,[[-5,-13],[0,-8,5,-13]],ivory,1.3);line(g,[[-10,7],[10,7]],'#bfd0bd',1.2);break;
    case 'rain-window':case 'rain-leaf':case 'rain-pot':
      if(kind==='rain-window')windowFrame(g,-18,-15,36,32);
      else if(kind==='rain-leaf')at(g,-1,4,.73,()=>leaf(g));
      else{paper(g,[[-13,1],[13,1],[10,16],[-9,16]],'#c59476');at(g,0,-4,.61,()=>flower(g))}
      for(let i=0;i<4;i++)line(g,[[-17+i*11,-16-(i%2)*3],[-20+i*11,-8-(i%2)*3]],'#6e96a1',1.4);break;
    case 'paper-cup':
      paper(g,[[-11,-10],[11,-10],[8,14],[-7,14]],'#d2b48d',wood,1.2);oval(g,0,-10,11,3.3,ivory,wood,.9);break;
    case 'can':
      paper(g,[[-9,-12],[9,-12],[9,13],[-9,13]],'#98b2ad',wood,1.1);oval(g,0,-12,9,3,'#c6c9b7',wood,.8);
      line(g,[[-8,9],[8,9]],ivory,1.2);line(g,[[-8,-7],[8,-7]],ivory,1.2);break;
    case 'towers':
      for(const [x,h,c] of [[-20,26,'#93a6a3'],[-8,37,'#8d9cab'],[5,21,'#ac9e8c']]){
        rect(g,x,16-h,12,h,c);for(let j=0;j<Math.floor(h/7);j++)for(let k=0;k<2;k++)rect(g,x+2+k*5,18-h+j*7,3,3,'#d9d9bf');
      }break;
    case 'sail':
      paper(g,[[-20,8],[21,8],[14,14],[-14,14]],'#a37b58',wood,1);
      line(g,[[0,7],[0,-19]],wood,1.5);paper(g,[[-2,-18],[-3,5],[-18,5]],ivory,wood,.9);paper(g,[[2,-12],[14,5],[2,5]],'#bf8971',wood,.9);break;
    case 'bird':
      paper(g,[[-24,-3],[-16,-15,-7,-4],[0,-1,4,1],[12,-10,23,-6],[12,-5,5,7],[1,9,-4,5],[-15,-4,-24,-3]],'#e9e5cc',wood,1.15);break;
    case 'vendor':dailyProp(g,'fruit');line(g,[[12,-14],[18,-18]],'#967955',1.6);line(g,[[14,-10],[22,-11]],'#967955',1.4);break;
    case 'chat':
      for(const [x,y,c] of [[-9,-5,ivory],[8,3,'#d6d9b9']]){oval(g,x,y,10,7,c,wood,1);paper(g,[[x-5,y+4],[x-7,y+11],[x+1,y+6]],c,wood,.7);for(let i=0;i<3;i++)oval(g,x-3+i*3,y,.8,.8,wood)}
      break;
    case 'trolley':
      line(g,[[-17,-17],[-12,-17],[-9,8],[19,8]],wood,2.7);
      rect(g,-8,-8,21,14,'#be9a70');line(g,[[1,-7],[2,4]],ivory,1.5);
      for(const x of [-6,14])oval(g,x,12,3.8,3.8,ink);break;
    case 'help':
      line(g,[[-20,8],[-11,-3],[-3,-2],[1,0]],'#879ca4',8);
      line(g,[[21,-8],[13,-8],[5,0]],'#ba927a',8);oval(g,1,0,4.7,3.1,'#dfb18a',wood,1);break;
    case 'steps':
      paper(g,[[-20,17],[-20,10],[-10,10],[-10,3],[0,3],[0,-4],[11,-4],[11,-12],[21,-12],[21,17]],'#b1aa96',wood,1);
      for(const [x,y] of [[-20,10],[-10,3],[0,-4],[11,-12]])line(g,[[x,y+1],[x+9,y+1]],ivory,1.2);break;
    case 'hall':case 'living-room':case 'shop':
      if(kind==='hall'){
        for(const x of [-18,-6,6,18]){rect(g,x,-14,3,28,'#a79e87');rect(g,x-1,-14,6,3,'#c0b193')}
        line(g,[[-21,16],[21,16]],'#ae9474',1.4);
      }else if(kind==='living-room'){
        paper(g,[[-18,-7],[-15,-13],[12,-13],[16,-8],[16,10],[-17,10]],'#92a9a0',wood,1.1);
        rect(g,-20,-2,6,13,'#7b9b92');rect(g,12,-2,7,13,'#7b9b92');
      }else{
        rect(g,-15,-6,30,23,'#d3bd9b');rect(g,-9,0,10,17,wood);
        for(let i=0;i<6;i++)rect(g,-18+i*6,-11,6,8,i%2?'#e3c393':'#bb8270');
      }
      at(g,18,-14,.42,()=>dailyProp(g,'sun'));break;
    case 'scissors':
      for(const x of [-9,2])oval(g,x,8,4.8,5.5,ivory,red,2.4);
      line(g,[[-6,4],[10,-17]],'#839496',2.4);line(g,[[0,4],[-11,-16]],'#839496',2.4);break;
    case 'mat':
      paper(g,[[-23,-3],[10,-14],[25,5],[-9,18]],'#a2b39a',wood,1);
      for(let i=0;i<4;i++)line(g,[[-19+i*7,-2-i*2],[-8+i*7,14-i*2]],ivory,1.1);
      for(let i=0;i<3;i++)line(g,[[-18+i*4,i*5], [13+i*3,-9+i*5]],'#7d9d89',1.1);break;
  }
}

const stageLife = [
  [['playground','rope','shuttle','ball'],['class','desk','board','broom'],['art','sea','sand','foam'],['music','beat','conduct','music'],['library','take-book','book','return-book']],
  [['kitchen','steam','stir','soup'],['park','kite-tree','kite-roof','kite-hill'],['bedroom','temperature','water','quilt'],['room','wash','shirt','broom'],['rain','rain-window','rain-leaf','rain-pot']],
  [['beach','bottle','paper-cup','can'],['ferry','towers','sail','bird'],['market','vendor','chat','trolley'],['trail','help','pack','steps'],['street','hall','living-room','shop']]
];
const teaLife = [
  [['class','case'],['class','model'],['class','bottle'],['library','library-label'],['art','papercut']],
  [['door','prints'],['room','gift'],['park','ball'],['kitchen','note'],['party','cake']],
  [['beach','prints'],['bus','bus'],['market','bag'],['station','direction'],['lookout','view']]
];
const booksLife = [
  [['class','book'],['playground','baton'],['class','gather'],['art','colours'],['court','ball']],
  [['room','scissors'],['park','mat'],['kitchen','cookies'],['room','meal'],['room','picture']],
  [['park','bike'],['library','book'],['court','goal'],['trail','map'],['harbour','dolphin']]
];

function stage(g,question,progress) {
  rect(g,0,0,W,H,'#e3d2b3');
  ridge(g,75,'#c3c6a5',1);ridge(g,90,'#b4bd9f',3.4);
  const [place,...props]=lessonScene(stageLife,question)||['park','butterfly','bird','little-fish'];
  for(let i=0;i<3;i++){
    const x=151+i*209;
    // Three little cut scenes hinge above the same stage boards.
    paper(g,[[x-86,117],[x+58,113],[x+79,124],[x-71,129]],'#a88b6d','#7b6752',1);
    const t=ease((progress*1.42-i*.145));
    const open=i===2?.10+.90*t:.81+.19*t;
    g.save();g.translate(x,120);g.transform(1,0,-.18*(1-open),open,0,0);
    const edges=[[-79,0],[-78,-70],[-32,-77],[72,-67],[72,0]];
    paper(g,edges,ivory,'#a28a68',1);g.save();trace(g,edges);g.closePath();g.clip();
    backdrop(g,place);g.restore();
    const stages=[
      {pose:'招',coat:'#af7363',ponytail:false},
      {pose:'喜',coat:'#688392',ponytail:true},
      {pose:'悟',coat:'#80966c',ponytail:false}
    ];
    line(g,[[12,-62],[22,-28],[21,-2]],'#97866d',.9);
    figure(g,18,-26,.94,{...stages[i],hat:false,modern:true});
    at(g,-30,-27,1.01,()=>dailyProp(g,props[i]));
    g.restore();
  }
  rect(g,0,126,W,8,'#a37e58');rect(g,0,134,W,31,'#9a5141');rect(g,0,137,W,2,'#d9bb7c');
  for(let x=13;x<W;x+=23) {
    paper(g,[[x,152],[x+8,145],[x+16,152],[x+8,159]],'#c38e63','#a86c50',1);
    oval(g,x+8,152,2.3,2.3,'#ddbb78');
  }
  for(const side of [0,1]){
    g.save();g.translate(side?W:0,0);g.scale(side?-1:1,1);
    paper(g,[[0,1],[48,1],[43,32,31,62],[27,71],[33,97,31,128],[12,124,0,129]],'#a95346',ink,1.8);
    for(const xx of [8,18,31])line(g,[[xx,6],[xx+1,31,21,63]],'#c98662',1.6);
    line(g,[[0,67],[19,69,30,63]],ochre,4.2);
    g.restore();
  }
  rect(g,0,0,W,12,'#7e4b3d');rect(g,0,10,W,4,ochre);
  for(let i=0;i<12;i++){
    const x=i*60;
    paper(g,[[x,14],[x+60,14],[x+48,27,x+29,28],[x+12,27,x,14]],'#aa5548','#895041',1);
    line(g,[[x+5,15],[x+30,36,x+55,15]],'#ddb077',1.4);
  }
}

const simileArt = [
  [['banyan','umbrella'],['runner','arrow'],['garden-dew','pearls'],['umbrellas','flowers'],['laughter','chime']],
  [['cheeks','apple'],['sleeping-cat','yarn'],['candyfloss','cloud'],['full-moon','silver-dish'],['swimmer','fish']],
  [['lion-rock','lion'],['ferry','leaf'],['rainbow','bridge'],['hill-path','hill-ribbon'],['reservoir','mirror']]
];

function lessonScene(table, question) {
  if (!question?.sceneId) return null;
  const [,set,questionNo]=question.sceneId.split('-');
  return table[Number(set)-1]?.[Number(questionNo)-1]||null;
}

function leaf(g) {
  paper(g,[[-32,8],[-18,-11,6,-12],[24,-12,33,-17],[32,0,15,10],[-10,20,-32,8]],'#9eaf78');
  line(g,[[-37,13],[-16,7,2,1],[17,-5,29,-13]],'#627e5e',2);
  for(const [x,y] of [[-17,7],[-3,2],[11,-4]]) {
    line(g,[[x-3,y-5],[x,y],[x+5,y+5]],'#728d64',1);
  }
}
function waterRipples(g) {
  for(const [x,y,w] of [[-30,14,14],[-5,19,20],[4,9,18],[-22,25,13]]) {
    line(g,[[x,y],[x+w*.45,y+2,x+w,y]],'#83a59a',1.45);
  }
}
function butterfly(g,x,y,s,color) {
  at(g,x,y,s,()=>{
    paper(g,[[-1,0],[-17,-22,-21,-13],[-25,-2,-9,3],[-22,7,-15,14],[-8,18,-1,7]],color);
    paper(g,[[1,0],[16,-23,21,-14],[25,-5,10,2],[22,6,16,13],[9,17,1,7]],color);
    oval(g,-12,-7,3,2.8,ochre);oval(g,12,-8,3,2.8,ochre);
    line(g,[[0,-3],[0,8]],ink,2.3);
    line(g,[[-5,-8],[0,-3],[5,-9]],ink,1.3);
  });
}
function cloud(g, x, y, s=1) {
  at(g,x,y,s,()=>paper(g,[[-29,9],[-36,4,-31,-2],[-28,-8,-20,-7],
    [-20,-16,-12,-17],[-3,-19,1,-15],[11,-27,23,-17],[27,-14,27,-9],
    [38,-9,37,0],[41,8,28,10]],'#faf1d7','#a6af9f',1.4));
}
function chime(g) {
  line(g,[[0,-27],[0,-20]],wood);
  paper(g,[[-21,-2],[-15,-21,0,-20],[16,-21,21,-2]],'#91a58e');
  for(const x of [-14,-5,5,14]){
    line(g,[[x,0],[x,6]],wood,1);
    line(g,[[x,5],[x,16+(x%3)*2]],'#9f7954',3.5);
    line(g,[[x-1,5],[x-1,14+(x%3)*2]],goldInk,1);
  }
  line(g,[[0,-2],[0,22]],wood,1.2);
  paper(g,[[-1,20],[7,21],[4,32],[-3,30]],red,ink,1);
}
const goldInk = '#edca86';

function motif(g,kind) {
  switch(kind) {
    case 'lotus-leaf':
      paper(g,[[-33,2],[-29,-12,-9,-15],[13,-19,30,-8],[38,2,25,10],[9,16,1,12],
        [1,5],[-6,12],[-25,14,-33,2]],moss,jade);
      for(const [x,y] of [[-27,-2],[-14,-10],[12,-12],[26,-3],[19,8]])line(g,[[0,2],[x,y]],'#c1ca9d',1.1);
      line(g,[[0,3],[4,15,0,22]],jade,1.65);break;
    case 'full-moon':
      oval(g,0,0,26,26,'#47586a');oval(g,1,-2,20,20,'#f4d68d','#e4c17a',1.3);
      oval(g,-3,-8,5,2.4,'#efd094');oval(g,8,6,4,2.4,'#e9cb90');
      line(g,[[-33,10],[-22,8,-12,9]],'#afbbad',1.5);line(g,[[14,16],[25,13,33,15]],'#afbbad',1);
      break;
    case 'ferry':
      paper(g,[[-34,8],[-24,6],[-20,0],[24,0],[29,6],[36,5],[31,14],[20,18],[-18,18],[-30,14]],'#507b70');
      paper(g,[[-27,4],[-22,-14],[-15,-16],[16,-16],[24,-12],[27,4]],'#f4ead2');
      for(const y of [-12,-4])for(const x of [-18,-10,-2,6,14])rect(g,x,y,5,4,'#688d91');
      rect(g,-27,-6,54,1.8,wood);rect(g,-23,-17,46,2.2,red);
      line(g,[[-21,11],[19,11,30,9]],ivory,1.5);waterRipples(g);break;
    case 'leaf': leaf(g);waterRipples(g);break;
    case 'garden-dew':
      at(g,1,0,.92,()=>leaf(g));
      for(const [x,y,s] of [[-11,-1,5.1],[4,-5,3.9],[16,-7,2.8]]){
        oval(g,x,y,s,s,'#c2d8c6','#7f9e8a',1.1);oval(g,x-1.2,y-1.3,s*.35,s*.28,'#fffae1');
      }
      break;
    case 'pearls':
      for(const [x,y,s] of [[-21,8,8.5],[-8,-5,8],[5,11,9.5],[16,-7,7.8],[27,6,6.6]]){
        oval(g,x+1,y+2,s,s*.86,'#d3c5a8');oval(g,x,y,s,s,'#eee7cf','#a49a82',1.2);oval(g,x-s*.3,y-s*.35,s*.28,s*.19,'#fffbea');
      }break;
    case 'banyan':
      tree(g,0,0,1);
      for(const x of [-20,-16,12,16,19]){
        line(g,[[x,-7],[x+1,-1,x,6+Math.abs(x)%6]],'#9a8460',.9);
      }break;
    case 'runner':
      line(g,[[-37,24],[34,24]],'#bb9983',1.3);
      line(g,[[-33,20],[-17,20]],'#a5aa97',1.5);line(g,[[-32,3],[-17,3]],'#a5aa97',1.2);
      line(g,[[0,5],[-7,18],[-24,11]],'#584c49',6.4);
      line(g,[[2,5],[14,5],[21,20]],'#584c49',6.4);
      line(g,[[-23,12],[-27,9]],ivory,3.2);line(g,[[20,20],[27,20]],ivory,3.2);
      paper(g,[[-4,-11],[6,-15],[12,-9],[5,7],[-7,5]],'#b76b50');
      line(g,[[1,-9],[-10,-4],[-15,-10]],ink,4);line(g,[[7,-10],[17,-5],[21,-12]],'#c59570',4.2);
      oval(g,11,-19,7.5,7.8,'#e9b991',ink,1.1);
      paper(g,[[3,-20],[0,-26,7,-27],[19,-30,20,-22],[13,-24,11,-21],[6,-19]],ink,null);
      oval(g,15,-19,1,1,ink);break;
    case 'arrow':
      line(g,[[-26,10],[28,-11]],wood,3);
      paper(g,[[22,-14],[34,-14],[27,-4],[26,-10]],'#6e817b',ink,1);
      paper(g,[[-25,5],[-33,4],[-28,10],[-34,17],[-25,14],[-18,7]],'#c8845f',ink,1);
      line(g,[[-30,-1],[-13,-6]],'#b5ac93',1.3);line(g,[[1,-14],[17,-19]],'#b5ac93',1.1);break;
    case 'umbrellas':
      umbrella(g,-17,-3,.61,blush);umbrella(g,15,-5,.65,'#85a3a3');umbrella(g,0,9,.67,'#dfb969');break;
    case 'flowers':
      for(const [x,y,s,c] of [[-19,0,.75,blush],[16,-4,.86,'#a98fa6'],[0,7,.76,'#d6ad60']]){
        line(g,[[x,y+3],[x+1,23]],jade,1.7);
        for(let i=0;i<5;i++)oval(g,x+5*s*Math.cos(1.26*i),y+5*s*Math.sin(1.26*i),5.5*s,5.5*s,c,ink,.65);
        oval(g,x,y,2.6*s,2.6*s,ochre);
      }break;
    case 'rainbow':
      for(const [i,color] of ['#c27c71','#d69871','#ddba76','#9ba77b','#80a191','#869aac','#9b8ba6'].entries()){
        const r=29-i*2.5;
        g.beginPath();g.arc(0,11,r,Math.PI,Math.PI*2);g.strokeStyle=color;g.lineWidth=3;g.stroke();
      }
      cloud(g,-26,15,.35);cloud(g,27,15,.32);break;
    case 'bridge':bridge(g,0,2,.99,true);break;
    case 'reservoir':
      paper(g,[[-35,4],[-22,-1,-5,-2],[18,-2,33,3],[29,15,7,18],[-20,20,-35,11]],'#a6bfb1','#8da89a',.8);
      paper(g,[[-32,-2],[-17,-18,-4,-9],[9,-20,28,-2]],'#a2b19a',null);
      paper(g,[[-29,2],[-11,14,-4,8],[9,15,24,3]],'#90ad9f',null);waterRipples(g);break;
    case 'mirror':
      oval(g,0,-2,23,21,'#d3aa6c','#877353',2);oval(g,0,-2,18.2,16.5,'#c0d4cb','#857a5f',1.6);
      line(g,[[-11,3],[0,-8]],'#e6e9d9',2.7);line(g,[[-6,6],[4,-4]],'#e6e9d9',1.4);
      paper(g,[[-11,23],[-5,18],[6,18],[12,23]],'#967453');break;
    case 'laughter':
    case 'cheeks': {
      const laughing=kind==='laughter';
      paper(g,[[-21,22],[-19,14,-7,12],[6,11,14,17],[19,23]],laughing?'#b07d73':'#749086');
      oval(g,-20,-13,5.2,5.2,ink);oval(g,18,-13,5.2,5.2,ink);
      paper(g,[[-18,-14],[-13,-23,0,-22],[18,-24,20,-8],[22,8,11,14],
        [0,23,-11,16],[-23,9,-18,-14]],'#edbf99');
      paper(g,[[-19,-4],[-24,-18,-12,-22],[-2,-31,11,-23],[21,-21,22,-7],
        [15,-10,12,-12],[12,-7,4,-7],[1,-9],[-4,-5,-11,-6],[-13,1,-17,2]],ink,null);
      for(const ex of [-7,9]){
        if(laughing)line(g,[[ex-3,0],[ex,-4,ex+3,0]],ink,1.85);
        else line(g,[[ex-2,1],[ex+2,2]],ink,1.9);
        oval(g,ex+(ex<0?-2:1),6,laughing?3.4:5.25,laughing?1.9:3.3,laughing?'#df9d83':'#cd7b69');
      }
      if(laughing){
        paper(g,[[-4,6],[2,8,7,5],[6,14,-1,13]],'#aa665b','#8b5849',1);
        line(g,[[23,-7],[28,-10,29,-14]],'#aa966f',1.4);line(g,[[24,0],[32,-1,36,-7]],'#aa966f',1.35);
      }else line(g,[[-1,11],[2,13,5,10]],'#936b55',1.1);
      break;
    }
    case 'chime':chime(g);break;
    case 'cloud':cloud(g,-2,0,1.07);break;
    case 'candyfloss':
      line(g,[[-5,26],[1,2]],wood,2.5);line(g,[[-4,21],[1,2]],ochre,1);
      paper(g,[[-13,10],[-23,5,-19,-3],[-24,-14,-13,-18],[-9,-26,1,-24],[10,-28,15,-20],
        [23,-19,22,-10],[28,-3,19,3],[16,12,5,11],[-4,16,-13,10]],'#f8efe0','#b8a68f',1.2);
      for(const [x,y] of [[-13,-5],[4,-15],[7,3]])line(g,[[x-3,y+2],[x-2,y-3,x+5,y]],'#dfd1b9',1.2);
      break;
    case 'umbrella':umbrella(g,0,0,1);break;
    case 'hill-path':
    case 'hill-ribbon':
      paper(g,[[-35,20],[-28,8,-20,-6],[-7,-24,-1,-22],[11,-16,20,-5],[30,6,35,20]],kind==='hill-path'?'#9ba780':'#aab599',jade,1);
      paper(g,[[-27,20],[-12,5,6,5],[21,1,10,-4],[0,-7,2,-15],[6,-12],[7,-8,15,-6],[32,3,12,9],[-8,12,-16,20]],
        kind==='hill-path'?'#d8bc8c':'#81a6ab',kind==='hill-path'?'#aa956c':'#75979a',.9);
      break;
    case 'sleeping-cat':
      oval(g,-1,3,26,19,'#c9996f',ink);
      paper(g,[[-15,9],[-22,1,-26,7],[-32,18,-14,20],[2,24,14,11],[19,6,15,4],[7,11,-2,12]],'#b77b51',ink,1.1);
      paper(g,[[0,-10],[3,-23],[10,-17],[18,-16],[26,-23],[26,-11],[29,-7,23,0],[10,6,2,-1]],'#d4a779',ink,1.2);
      line(g,[[6,-5],[8,-2,11,-5]],ink,1.1);line(g,[[17,-5],[20,-2,22,-5]],ink,1.1);
      oval(g,15,-1,1.6,1,wood);line(g,[[-18,-4],[-14,0]],'#a77853',2);line(g,[[-11,-8],[-7,-3]],'#a77853',2);break;
    case 'yarn':
      line(g,[[4,16],[14,26,24,18],[32,12,36,17]],red,2);
      oval(g,0,0,23,22,'#cb8e7f',ink);
      for(let i=0;i<5;i++){
        line(g,[[-17+i*4,-12-i],[3+i,-7,18+i*.5,4-i*2]],'#a96861',1.15);
        line(g,[[-20+i,3+i*3],[-20+i,16+i,2+i*4,19-i*.8]],'#a96861',1.15);
      }break;
    case 'silver-dish':
      oval(g,0,0,26,24,'#9da9a3','#687c77',1.6);
      oval(g,0,0,22,20,'#deE0cf','#b3beb2',1.4);
      line(g,[[-17,6],[-9,16,3,16]],'#f4eddb',2.7);line(g,[[6,-16],[16,-14,18,-7]],'#f4eddb',1.9);break;
    case 'swimmer':
      rect(g,-34,8,67,12,'#bdd4c9');waterRipples(g);
      line(g,[[-28,12],[-13,8],[0,-1],[9,-1]],'#7199a1',6);
      oval(g,12,-2,7.4,7,'#ebbc91',ink,1.1);
      paper(g,[[4,-3],[3,-13,13,-12],[20,-11,21,-4],[12,-5,5,-1]],'#7e9cb1',ink,1.05);
      line(g,[[9,-2],[20,-3]],ink,2);line(g,[[-7,3],[2,-13],[18,-17]],'#d5a982',4);
      break;
    case 'fish':
      paper(g,[[-19,-2],[-30,-12],[-28,1],[-33,11],[-18,7]],'#bb7757');
      paper(g,[[-22,2],[-12,-16,11,-10],[22,-7,29,2],[11,18,-9,12],[-16,10,-22,2]],'#d3a466',ink,1.4);
      oval(g,19,0,2.2,2.2,ink);line(g,[[10,-6],[5,2,10,8]],'#937552',1.1);
      for(const x of [-12,-6,0])line(g,[[x,-1],[x+4,4,x+6,0]],'#b0875a',1.1);
      break;
    case 'lion-rock':
      paper(g,[[-36,20],[-23,8],[-18,1],[-14,1],[-11,-7],[-9,-16],[-3,-18],[3,-13],[9,-11],[8,-5],
        [20,-2,29,11],[36,21]],'#99a48b','#73836e',1.3);
      paper(g,[[-31,21],[-16,8],[-12,6],[-6,-9],[1,-10],[-2,-3],[11,4],[18,13],[29,21]],'#adb391',null);
      line(g,[[-13,1],[-8,-5,-7,-13]],'#839079',1.1);break;
    case 'lion':
      paper(g,[[-24,13],[-30,12,-31,1],[-33,-6,-28,-7],[-23,-8,-24,-3],[-30,-3,-26,4],[-20,7]],ochre,ink,1);
      paper(g,[[-23,10],[-21,-4,-10,-6],[-2,-7,8,-3],[16,-2,17,7],[18,13,26,14],[26,19],[1,19],[-7,16],[-22,18]],'#d2ad6c');
      paper(g,[[5,7],[1,-4,6,-12],[9,-20,16,-20],[22,-24,27,-18],[32,-16,30,-9],[32,-4,28,1],[25,7,18,9]],'#ae794e');
      paper(g,[[14,-16],[19,-21,21,-15],[27,-13,27,-9],[32,-7],[31,-2],[24,1],[17,-2]],'#dab77b',ink,1);
      oval(g,25,-10,1.4,1.4,ink);line(g,[[-14,12],[-2,13,-4,18]],'#97774b',1.2);break;
    case 'apple':
      paper(g,[[-2,-12],[-11,-21,-21,-12],[-32,-1,-19,16],[-13,25,-4,19],
        [4,26,15,18],[29,6,23,-10],[14,-20,2,-13]],'#c77561',ink,1.7);
      line(g,[[0,-12],[0,-19,5,-24]],wood,2.8);
      paper(g,[[3,-19],[8,-28,18,-25],[15,-18,3,-19]],moss,jade,1);
      line(g,[[-15,-7],[-19,-2,-17,2]],'#e9ae88',2.5);break;
  }
}

function paintedScroll(g,question,progress) {
  rect(g,0,0,W,H,'#d9cbb2');
  ridge(g,65,'#b8c4ac',.9);ridge(g,91,'#9eafa0',2.6);
  rect(g,0,106,W,59,'#97afa5');
  for(let i=0;i<13;i++)line(g,[[i*64-22,128+i%3*9],[i*64,130+i%3*9,i*64+17,128+i%3*9]],'#bbccc0',1.4);
  // The two rolls and stiles sit on the deck of the painted boat.
  paper(g,[[71,23],[126,23],[221,14,356,22],[495,27,602,18],[642,21],[644,144],
    [524,149,369,143],[229,136,78,145]],'#aa8969',null);
  paper(g,[[69,18],[152,20,231,16],[351,14,420,20],[537,25,643,14],
    [643,135],[552,145,427,137],[306,128,225,135],[161,140,69,139]],'#f3e6c5','#a68e6e',1.4);
  for(const k of [0,1]){
    const x=k?638:66;
    rect(g,x+3,11,9,136,'#806747');
    rect(g,x+1,17,15,122,'#b19970');
    rect(g,x+3,17,5,122,'#d3c39c');
    rect(g,x-1,8,18,7,wood);rect(g,x-1,143,18,7,wood);
    line(g,[[x-1,10],[x+16,10]],ochre,1.4);
  }
  for(const x of [97,626])line(g,[[x,23],[x,132]],'#d3bf99',1.2);
  line(g,[[145,112],[194,108,230,111],[270,116,299,112]],'#d3c5a4',1);
  line(g,[[429,113],[465,109,507,111],[534,115,571,111]],'#d3c5a4',1);
  const pair=lessonScene(simileArt,question)||['lotus-leaf','umbrella'];
  at(g,229,81,1.59,()=>motif(g,pair[0]));
  // A folded leaf over the second half of the scroll lifts when the three parts are correct.
  const t=question?ease(progress):1;
  g.save();g.beginPath();g.rect(411,29,156*t,98);g.clip();
  at(g,485,80,1.56,()=>motif(g,pair[1]));g.restore();
  if(t<1){
    const w=133*(1-t),x=420+137*t;
    paper(g,[[x,38],[x+w,39],[x+w,120],[x,118]],'#e0d2af','#baa780',.9);
    line(g,[[x+w*.10,40],[x+w*.11,116]],'#c1b08e',1.3);
    line(g,[[x+w*.15,40],[x+w*.16,116]],'#efe1c0',1);
  }
  // A carved studio seal, brush and inkstone frame the art; no text in the painting.
  paper(g,[[592,115],[603,113],[605,124],[594,126]],'#ba7760',null);
  line(g,[[595,116],[601,115],[602,122],[596,123],[595,116]],'#ead4ae',.8);
  line(g,[[26,152],[49,79]],wood,4);line(g,[[26,150],[30,141]],'#544b40',3.1);
  paper(g,[[48,83],[46,74,54,65],[54,77,50,84]],ink,null);
  oval(g,678,143,23,7,'#53605c',ink,1.4);oval(g,677,141,14,3.8,'#444a47');
}

function teaRoom(g,question,progress) {
  const emotion={'咦':'疑','哼':'怒','喂':'招','噢':'悟','啊':'喜'}[question?.answer?.[0]]||'招';
  const [place,prop]=lessonScene(teaLife,question)||['class','bottle'];
  rect(g,0,0,W,H,'#dcccae');
  // The tea room's two posts frame a live paper scene from the child's own story.
  // The main action stays centred while the backdrop fills the wide opening.
  g.save();g.translate(W/2,141);g.scale(3.68,1.58);backdrop(g,place);g.restore();
  rect(g,0,140,W,25,'#c6ad89');
  for(const x of [25,177,328,481,633])line(g,[[x,165],[x+42,141]],'#b79b78',1.2);
  for(const x of [37,668]){rect(g,x,5,14,143,wood);rect(g,x+3,7,3,139,'#b08a64')}
  rect(g,0,0,W,8,'#805d45');rect(g,0,8,W,3,'#b18b5e');
  blind(g,0,10,62,50,'#d1bc89');blind(g,658,10,62,50,'#d1bc89');
  smallLantern(g,46,79,.75);smallLantern(g,675,79,.75);
  const away=prop==='bus'||prop==='bag'||emotion==='招';
  const lift=progress && emotion==='喜'? 1.6*progress:0;
  figure(g,455,98+Math.sin(progress*Math.PI)*2,1.35,{
    pose:progress>.55?'喜':'',hat:false,modern:true,ponytail:true,coat:'#a97c70',mirror:!away||progress>.55
  });
  if(prop==='bus')figure(g,508,101,1.12,{modern:true,hat:false,coat:'#8b9f83',mirror:true});
  figure(g,272,98-lift,1.55,{pose:emotion,hat:false,modern:true,coat:'#698b8b',head:(emotion==='怒'?-.8:1)*progress});
  const indoor=['class','art','library','room','door','party'].includes(place);
  if((indoor&&prop!=='prints')||prop==='bag'){
    paper(g,[[309,113],[405,113],[418,123],[299,123]],'#b49370',wood,1.1);
    rect(g,302,123,112,4,wood);rect(g,307,127,4,13,wood);rect(g,403,127,4,13,wood);
  }
  const py=prop==='prints'?132:indoor?97:97-8*progress;
  if(prop==='prints'&&place==='beach'){
    at(g,366,130,.95,()=>{
      paper(g,[[-66,-12],[64,-12],[60,-1,29,-1],[6,6,-18,1],[-40,-4,-66,2]],'#abc5b6',null);
      line(g,[[-65,2],[-40,-4,-18,1],[6,6,29,-1],[55,-1,62,-6]],'#e1e2c9',1.8);
    });
  }else if(prop==='view'){
    for(const x of [325,384]){rect(g,x,103,6,37,wood);rect(g,x+1,103,2,36,'#b59672')}
    line(g,[[310,106],[408,106]],wood,5);line(g,[[310,105],[408,105]],'#c2a37a',1.6);
  }else at(g,363,prop==='note'?110:prop==='bag'?99:py,1.14,()=>dailyProp(g,prop));
  if(emotion==='招'){
    line(g,[[300,63],[307,61,310,55]],'#a48c66',1.3);line(g,[[302,70],[314,68,318,61]],'#a48c66',1.25);
  }else if((emotion==='喜'||emotion==='悟')&&progress>.2){
    for(const [x,y] of [[294,38],[301,44]])line(g,[[x-2*progress,y+2*progress],[x+2*progress,y-2*progress]],ochre,1.4);
  }
}

function bookCover(g,x,y,w,h,color) {
  paper(g,[[x,y+4],[x+w,y],[x+w+8,y+h-1],[x+5,y+h+4]],'#b19872','#80694e',1.4);
  paper(g,[[x,y],[x+w,y-5],[x+w+6,y+h-6],[x+4,y+h]],'#ede1c3','#b5a480',1.1);
  paper(g,[[x-1,y-4],[x+w,y-9],[x+w+5,y+h-11],[x+3,y+h-4]],color,ink,1.3);
  line(g,[[x+12,y-3],[x+16,y+h-5]],'#c4bc95',1.1);
  for(let i=0;i<4;i++) {
    const yy=y+1+i*(h-7)/3,xx=x+4+(yy-y)/h*4;
    oval(g,xx+8,yy,1.3,1.3,ink);
    line(g,[[xx-1,yy+1],[xx+7,yy],[xx+8,yy-2]],ivory,1.1);
  }
}
function typeBlock(g,x,y,mark,color,angle=0,s=1) {
  g.save();g.translate(x,y);g.rotate(angle);g.scale(s,s);
  paper(g,[[-12,-15],[11,-16],[14,-13],[14,11],[-9,14],[-12,11]],'#957351','#70553e',1.25);
  paper(g,[[-13,-16],[10,-18],[11,9],[-12,11]],color,'#7a5b42',1.2);
  // Printing marks are cut into the type, with no dependence on a CJK font.
  if(mark==='？'){
    line(g,[[-6,-9],[-5,-14,1,-13],[6,-12,5,-7],[5,-5,1,-3],[0,-2,0,0]],ink,2.7);
    oval(g,0,4,1.55,1.6,ink);
  }else if(mark==='！'){
    paper(g,[[-2,-13],[2,-13],[1,0],[-1,0]],ink,null);
    oval(g,0,4,1.65,1.65,ink);
  }else if(mark==='：'){
    oval(g,0,-9,2.2,2,ink);oval(g,0,2,2.2,2,ink);
  }else if(mark==='「')line(g,[[-4,2],[-4,-11],[4,-11]],ink,2.25);
  else line(g,[[4,-10],[4,3],[-4,3]],ink,2.25);
  g.restore();
}
function printShop(g,question,progress) {
  rect(g,0,0,W,H,'#d3c2a2');
  for(let y=10;y<H;y+=21)line(g,[[0,y],[W*.40,y+4,W,y-2]],'#c9b593',.9);
  bookCover(g,-12,32,102,45,'#718c83');bookCover(g,-20,24,101,42,'#7f8d94');
  bookCover(g,633,76,103,52,'#96816e');bookCover(g,645,64,99,50,'#688479');
  // An open string-bound folio: raised centre fold, layered page edges, holes, stitches.
  paper(g,[[109,35],[276,22,341,34],[379,20,591,32],[607,132],[419,144,346,136],
    [266,147,118,139]],'#8a6a50',null);
  paper(g,[[106,27],[253,15,342,28],[414,13,590,24],[602,126],[427,139,345,130],
    [251,140,111,132]],'#c4ac83','#947857',1.3);
  paper(g,[[105,22],[266,10,342,24],[417,8,587,18],[597,117],[434,133,344,123],
    [263,136,110,124]],'#f4e5c4','#9a8161',1.5);
  paper(g,[[334,25],[341,24],[351,22],[352,122],[344,123],[337,125]],'#d3bf98',null);
  line(g,[[342,25],[343,122]],'#ae9571',1.1);
  for(let i=0;i<5;i++){
    const y=32+i*18;
    oval(g,337,y,1.5,1.4,'#96836c');oval(g,350,y-1,1.5,1.4,'#96836c');
    line(g,[[337,y],[343,y+2,350,y-1]],'#f7e9c8',2.1);
  }
  const [place,prop]=lessonScene(booksLife,question)||['class','gather'];
  g.save();g.translate(223,111);g.rotate(-.025);g.scale(.99,.99);
  paper(g,[[-85,-79],[85,-79],[85,1],[-85,1]],'#e9dbb9','#aa9472',1.2);
  g.save();g.beginPath();g.rect(-80,-76,160,74);g.clip();backdrop(g,place);
  figure(g,24,-25,.86,{modern:true,hat:false,ponytail:place==='park',coat:'#82998d',mirror:true,pose:'招'});
  at(g,-30,-28,1.05,()=>dailyProp(g,prop));g.restore();g.restore();
  const marks=question?.answer?.length?question.answer:['：','「','！','」'];
  const n=marks.length,gap=36,cx=465;
  line(g,[[377,87],[459,84,554,85]],'#b6a17b',1);
  const tray=['？','「','！','」','：'];
  // All five types are visible before solving: even a one-slot line has no answer giveaway.
  for(const [i,mark] of tray.entries()){
    const x=397+i*32,y=125+i%2*9;
    typeBlock(g,x,y,mark,'#d8bf96',(i%2?.09:-.12),.81);
  }
  for(let i=0;i<n;i++){
    const source=tray.indexOf(marks[i]);
    const toX=cx+(i-(n-1)/2)*gap,toY=74,fromX=397+source*32,fromY=125+source%2*9;
    const t=ease(progress*1.30-i*.09);
    paper(g,[[toX-12,60],[toX+11,60],[toX+12,84],[toX-11,85]],'#e9dab7','#bbab86',.8);
    if(t===0)continue;
    typeBlock(g,fromX+(toX-fromX)*t,fromY+(toY-fromY)*t-Math.sin(t*Math.PI)*12,
      marks[i],['#dfc699','#e7cda4','#e1bc89','#d9c38e'][i%4],(1-t)*(i%2?.17:-.15));
  }
  const brushY=37;
  line(g,[[546,brushY],[652,brushY-19]],'#9f7752',4.5);
  line(g,[[546,brushY-1],[649,brushY-20]],'#cfaa72',1);
  paper(g,[[550,brushY-3],[549,brushY+2],[532,brushY+4],[523,brushY+4],[535,brushY-2]],'#4f514a',ink,.8);
}

const scenes={stage,boat:paintedScroll,tea:teaRoom,books:printShop};
let fibreTile;
function paperGrain(canvas,g){
  const doc=canvas.ownerDocument||globalThis.document;
  if(!doc)return;
  if(!fibreTile){
    fibreTile=doc.createElement('canvas');fibreTile.width=73;fibreTile.height=57;
    const f=fibreTile.getContext('2d');
    let state=41909;
    const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296};
    for(let i=0;i<118;i++){
      const x=random()*73,y=random()*57;
      line(f,[[x,y],[x+random()*3+.5,y-random()*1.6]],i%3?'rgba(99,73,44,.07)':'rgba(255,250,222,.34)',.55);
    }
  }
  g.fillStyle=g.createPattern(fibreTile,'repeat');g.fillRect(0,0,W,H);
}

function render(canvas,scene,question,progress) {
  const g=canvas.getContext('2d');
  g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  g.clearRect(0,0,W,H);g.lineCap='round';g.lineJoin='round';
  scene(g,question,progress);
  paperGrain(canvas,g);
}

/** Draw one paper vignette in the supplied canvas. A solved card reveals its scene once. */
export function drawVignette(canvas,id,question=null,solved=false) {
  const scene=scenes[id];
  if(!scene)throw new RangeError('Unknown scene: '+id);
  const old=playing.get(canvas);
  if(old?.frame!=null)cancelAnimationFrame(old.frame);
  const ratio=Math.max(1,Math.min(2,globalThis.devicePixelRatio||1));
  if(canvas.width!==Math.round(W*ratio))canvas.width=Math.round(W*ratio);
  if(canvas.height!==Math.round(H*ratio))canvas.height=Math.round(H*ratio);
  const state={id,question,solved,frame:null};playing.set(canvas,state);
  const animates=solved && question && typeof requestAnimationFrame==='function'
    && !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    && !(old?.id===id&&old.question===question&&old.solved);
  if(!animates){render(canvas,scene,question,solved||!question?1:0);return}
  render(canvas,scene,question,0);
  let start;
  function frame(now) {
    if(playing.get(canvas)!==state)return;
    if(canvas.isConnected===false){state.frame=null;render(canvas,scene,question,1);return}
    start??=now;
    const t=clamp((now-start)/570);
    render(canvas,scene,question,t);
    state.frame=t<1?requestAnimationFrame(frame):null;
  }
  state.frame=requestAnimationFrame(frame);
}
