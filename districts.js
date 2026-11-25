import {house,willow,shrub,lampPost} from './paper-art.js';
import {paperAssembly,box,polygon,stroke,ellipse,text,rectangle,printPlaque,boundBook,landscape} from './landmarks.js';

const red='#a9443d',saffron='#d0a45e',linen='#efdfba',wood='#765640',blue='#527585',jade='#688679',ink='#493e36';
const rackBrown='#957455',indigo='#59647a';

// The print coordinates stay in local centimetres. One crease raises each
// little street vignette; props sharing a counter open as an accordion.
function slat(a,x,y,z,w,h,colour=wood) {
  return a.panel(rectangle(-w/2,0,w,h),P=>{
    P.fill(colour);box(P.g,-w*.35,.02,w*.13,h-.04,'#c29c6e');
  },{x,y,z});
}

function table(a,x,z,width,height=1.04) {
  for(const side of [-1,1])slat(a,x+side*(width/2-.14),0,z,.14,height,wood);
  a.panel(rectangle(-width/2,0,width,.18),P=>{
    P.fill('#946749');box(P.g,-width/2,.10,width,.036,saffron);
  },{x,y:height-.16,z:z+.03});
  a.panel(rectangle(-width/2,0,width,.76),P=>{
    P.fill('#b49468');
    for(let k=-width/2+.18;k<width/2;k+=.34)box(P.g,k,.035,.021,.65,'#9c7857');
  },{x,y:height,z,tilt:-Math.PI/2});
}

function person(a,{x=0,z=0,s=1,coat=blue,hat='cap',seated=false,turn=1}) {
  const legs=seated?.22:.63;
  const outline=[[-.42,.01],[-.15,.01],[-.02,legs*.74],[.11,.02],[.42,.02],
    [.31,legs],[.46,legs+.04],[.35,legs+.52],[.60,legs+.62],[.64,legs+.76],
    [.55,legs+.83],[.32,legs+.72],[.25,legs+1.04],[.13,legs+1.12],[.22,legs+1.22],
    [.30,legs+1.36],[.36,legs+1.42],[.30,legs+1.47],[.30,legs+1.61],[.23,legs+1.74],
    [.03,legs+1.82],[-.17,legs+1.79],[-.31,legs+1.66],[-.31,legs+1.39],
    [-.22,legs+1.20],[-.12,legs+1.14],[-.34,legs+1.01],[-.46,legs+.65],
    [-.53,legs+.32],[-.36,legs+.23],[-.28,legs+.32],[-.39,legs]];
  a.panel(outline.map(([u,v])=>[u*s*turn,v*s]),P=>{
    P.fill(coat);const g=P.g;g.save();g.scale(s*turn,s);
    box(g,-.46,0,.91,legs,'#596367');
    box(g,-.46,.02,.91,.12,'#453d36');
    polygon(g,[[-.32,legs+1.82],[.31,legs+1.82],[.31,legs+1.47],[.36,legs+1.42],
      [.28,legs+1.29],[.14,legs+1.15],[-.12,legs+1.12],[-.29,legs+1.28]],'#e6b88c');
    polygon(g,[[-.34,legs+1.86],[.22,legs+1.86],[.32,legs+1.61],[.13,legs+1.64],
      [-.1,legs+1.53],[-.11,legs+1.34],[-.32,legs+1.33]],'#4f493e');
    ellipse(g,.185,legs+1.46,.027,.037,ink);
    stroke(g,[[.28,legs+1.31],[.19,legs+1.30]],'#946e52',.026);
    stroke(g,[[-.18,legs+1.13],[.20,legs+.92],[-.18,legs+.54]],linen,.075);
    box(g,-.36,legs+.35,.77,.106,saffron);
    polygon(g,[[.47,legs+.66],[.63,legs+.66],[.65,legs+.79],[.54,legs+.82]],'#dab184');
    stroke(g,[[-.31,legs+.08],[.19,legs+.06]],'#b4ba97',.055);
    if(hat==='cap'){
      polygon(g,[[-.32,legs+1.57],[-.27,legs+1.73],[-.13,legs+1.82],[.17,legs+1.82],
        [.30,legs+1.65],[.11,legs+1.61],[-.17,legs+1.60]],'#495c59');
      stroke(g,[[-.28,legs+1.63],[-.03,legs+1.67],[.24,legs+1.66]],saffron,.052);
    }
    g.restore();
  },{x,z,thickness:.085,print:36});
  if(hat==='straw'){
    a.panel([[-.54,.01],[-.48,.11],[-.14,.34],[.02,.41],[.17,.31],[.40,.13],[.56,.035],[.48,-.04],[-.45,-.04]].map(([u,v])=>[u*s,v*s]),P=>{
      P.fill('#b49661');const g=P.g;
      for(let n=0;n<8;n++){const u=(-.45+n*.13)*s;stroke(g,[[0,.37*s],[u,.02*s]],'#d9c087',.034*s)}
    },{x,y:(legs+1.65)*s,z:z+.04});
  }
}

function drum(a,x,y,z,s) {
  const outline=[[-.69,.19],[-.77,.32],[-.77,.85],[-.69,.98],[-.42,1.07],
    [.43,1.07],[.69,.98],[.78,.82],[.77,.32],[.66,.17],[.42,.09],[-.42,.09]];
  a.panel(outline.map(([u,v])=>[u*s,v*s]),P=>{
    P.fill(red);const g=P.g;g.save();g.scale(s,s);
    ellipse(g,0,.9,.74,.185,'#cfac80');ellipse(g,-.02,.93,.66,.12,linen);
    ellipse(g,0,.25,.69,.15,'#b07347');box(g,-.69,.26,1.38,.10,'#713f35');
    for(let i=0;i<7;i++){
      const u=-.57+i*.19;
      stroke(g,[[u,.42],[u+.08,.69],[u+.17,.43]],'#d69768',.035);
      ellipse(g,u,.73,.04,.034,'#e9c991');
    }
    g.restore();
  },{x,y,z});
}

function rehearsal(a) {
  // The barrel drum sits on crossed red feet beside a percussion player.
  for(const dir of [-1,1])a.panel([[-.14,0],[.12,0],[.65,.76],[.47,.79]].map(([x,y])=>[dir*x,y]),P=>P.fill('#8d5141'),{x:.57,z:.13});
  drum(a,.58,.27,.14,1.18);
  person(a,{x:-.72,z:-.13,coat:'#8b5448',hat:'cap'});
  for(const [x,y,roll] of [[-.11,1.44,.40],[-.20,1.51,1.02]]){
    a.panel([[0,0],[.04,-.015],[.04+roll,.45],[roll,.51]],P=>P.fill('#cca167'),{x,y,z:.22});
  }
  const rim=[];
  for(let i=0;i<28;i++){const angle=i/28*Math.PI*2;rim.push([Math.cos(angle)*.55,Math.sin(angle)*.55+.90])}
  a.panel(rim,P=>{
    P.fill('#b59051');ellipse(P.g,0,.90,.44,.44,'#d8b770');ellipse(P.g,0,.90,.295,.295,'#b09255');ellipse(P.g,0,.90,.145,.145,'#dfbe78');
  },{x:1.92,z:-.12});
  for(const x of [1.27,2.57])slat(a,x,0,-.19,.10,1.87);
  slat(a,1.92,1.74,-.17,1.49,.10);
  for(const x of [1.71,2.13])slat(a,x,1.28,-.15,.027,.48,saffron);
}

function bunting(a) {
  const width=5.2;
  for(const side of [-1,1]){
    slat(a,side*width/2,0,0,.13,3.45,'#886a48');
    a.panel([[-.12,0],[.12,0],[.08,.17],[0,.26],[-.08,.17]],P=>P.fill(saffron),{x:side*width/2,y:3.42});
  }
  const rope=Array.from({length:13},(_,i)=>[-width/2+width*i/12,3.36-.38*Math.sin(Math.PI*i/12)]);
  a.panel([...rope,...rope.slice().reverse().map(([x,y])=>[x,y-.052])],P=>P.fill(wood));
  for(let i=1;i<8;i++){
    const x=width*(i/8-.5),y=3.33-.38*Math.sin(Math.PI*i/8);
    a.panel([[-.25,0],[.25,0],[.22,-.55],[0,-.75],[-.22,-.55]],P=>{
      P.fill([red,'#bd965a','#66847b'][i%3]);
      stroke(P.g,[[-.17,-.13],[.17,-.13]],linen,.042);
      polygon(P.g,[[-.105,-.38],[0,-.26],[.105,-.38],[0,-.51]],'#f2cb87');
    },{x,y,z:.04,angle:(i%3-1)*.23});
  }
}

function costumeCart(a) {
  table(a,0,.05,2.9);
  const masks=[[-.91,red],[-.02,'#497a7e'],[.86,'#b98648']];
  for(const [x,col] of masks){
    a.panel([[-.37,.51],[-.32,.78],[-.25,.88],[-.14,.76],[.02,.83],[.16,.77],[.27,.87],[.36,.75],[.39,.48],[.27,.16],[0,0],[-.26,.17]],P=>{
      P.fill(linen);const g=P.g;
      for(const s of [-1,1]){
        polygon(g,[[s*.33,.75],[s*.24,.69],[s*.04,.57],[s*.13,.47],[s*.31,.47]],col);
        stroke(g,[[s*.09,.47],[s*.17,.51],[s*.28,.50]],ink,.042);
        stroke(g,[[s*.29,.37],[s*.17,.26],[s*.12,.16]],col,.077);
      }
      polygon(g,[[0,.78],[.076,.59],[.035,.43],[0,.31],[-.056,.44],[-.075,.59]],col);
      stroke(g,[[-.12,.20],[0,.23],[.12,.20]],ink,.032);
    },{x,y:1.05,z:-.02});
  }
  slat(a,-1.46,0,-.36,.15,2.88);slat(a,1.46,0,-.36,.15,2.88);
  slat(a,0,2.74,-.34,3.14,.18);
  for(const [x,col] of [[-.95,'#a34c41'],[-.09,'#a88b57'],[.76,'#697e78']]){
    a.panel([[-.27,0],[.27,0],[.29,-.40],[.39,-.89],[.18,-1.04],[-.03,-.95],[-.31,-1.01],[-.35,-.79]],P=>{
      P.fill(col);stroke(P.g,[[-.21,-.16],[.20,-.16]],linen,.06);stroke(P.g,[[-.11,-.24],[-.11,-.66],[-.18,-.79]],'#c7ae83',.04);
    },{x,y:2.81,z:-.31,angle:x*.19});
  }
}

function moonGarden(a) {
  const r=1.16,h=1.42,w=3.25;
  // The moon opening runs down to the path; its arc is cut out of the card.
  const edges=[[-w,0],[-r,0],[-r,h]];
  for(let i=1;i<=26;i++){
    const angle=Math.PI-i/26*Math.PI;
    edges.push([r*Math.cos(angle),h+r*Math.sin(angle)]);
  }
  edges.push([r,0],[w,0],[w,2.85],[2.53,3.02],[1.83,3.19],[.92,3.25],
    [0,3.30],[-.96,3.26],[-1.84,3.18],[-2.57,3.03],[-w,2.85]);
  a.panel(edges,P=>{
    P.fill('#e6ddc6');const g=P.g;
    const arc=[];for(let i=0;i<=25;i++){const theta=Math.PI-i/25*Math.PI;arc.push([1.24*Math.cos(theta),h+1.24*Math.sin(theta)])}
    stroke(g,[[-1.24,0],...arc,[1.24,0]],'#83938b',.11);
    box(g,-w,0,w*2,.30,'#a59f8b');
    for(const s of [-1,1]){
      box(g,s*2.13-.43,1.21,.86,.83,'#7e8b80');box(g,s*2.13-.37,1.27,.74,.71,'#d4cbaa');
      for(let n=-1;n<=1;n++)stroke(g,[[s*2.13+n*.19,1.27],[s*2.13+n*.19,1.98]],'#748275',.042);
      stroke(g,[[s*2.13-.37,1.63],[s*2.13+.37,1.63]],'#748275',.046);
    }
    stroke(g,[[-w,2.78],[-2.51,2.96],[-1.81,3.09],[0,3.22],[1.81,3.09],[2.51,2.96],[w,2.78]],'#435b5a',.16);
  },{thickness:.14});
}

function paperYard(a) {
  for(const x of [-2.18,2.18])slat(a,x,0,0,.13,2.86,rackBrown);
  slat(a,0,2.71,0,4.52,.13,rackBrown);
  const copies=['山','水','月','花'];
  for(let i=0;i<4;i++){
    const offset=(i%2)*.11;
    a.panel([[-.40,0],[.40,.02],[.37,-1.44+offset],[.16,-1.48+offset],[-.1,-1.42+offset],[-.41,-1.45+offset]],P=>{
      P.fill(i%2?'#e8dfc3':'#e4d5ac');const g=P.g;
      box(g,-.35,-1.34,.70,1.25,'#f1e7cb');
      text(g,copies[i],0,-.47,.47,ink);
      for(let n=0;n<4;n++)stroke(g,[[-.20,-.81-n*.11],[.07+(n%3)*.065,-.82-n*.11]],'#88836e',.028);
      box(g,.19,-1.23,.10,.11,'#ae6951');box(g,-.03,-.09,.06,.14,rackBrown);
    },{x:-1.54+i*1.02,y:2.78,z:.04,angle:(i-1.5)*.12});
  }
  person(a,{x:2.82,z:-.05,coat:'#697886',hat:'straw',turn:-1,s:.93});
}

function calligrapher(a) {
  person(a,{x:-.96,z:-.44,s:.96,coat:'#607187',seated:true});
  table(a,.72,.14,2.42,.81);
  a.panel(rectangle(-.62,-.22,1.24,.58),P=>{
    P.fill(linen);for(let q=0;q<3;q++)stroke(P.g,[[-.42,.20-q*.13],[.30-q*.058,.18-q*.13]],'#6e7160',.035);
  },{x:.52,y:.85,z:-.18,tilt:-Math.PI/2});
  a.panel([[-.21,0],[.18,0],[.22,.34],[.17,.38],[-.19,.38]],P=>{
    P.fill('#648582');box(P.g,-.22,.28,.45,.045,'#d5c694');
  },{x:1.49,y:.85,z:.04});
  for(const [offset,lean] of [[-.09,-.09],[.01,.04],[.105,.14]]){
    a.panel([[offset,0],[offset+.035,0],[offset+lean+.03,.48],[offset+lean+.065,.59],[offset+lean+.015,.71],[offset+lean-.035,.57],[offset+lean,.49]],P=>{
      P.fill('#655541');box(P.g,-.29,.45,.6,.08,'#b3985c');
    },{x:1.48,y:1.11,z:.02});
  }
  a.panel(rectangle(-.38,0,.76,.20),P=>boundBook(P.g,-.38,0,.76,.20,indigo),{x:.94,y:.85,z:.09});
}

function teacup(a,x,y,z) {
  a.panel([[-.20,.22],[.20,.22],[.16,.075],[.09,0],[-.09,0],[-.16,.075]],P=>{
    P.fill('#dfdbc0');box(P.g,-.22,.13,.44,.049,'#5e8581');
    ellipse(P.g,0,.21,.16,.031,'#9f794a');
  },{x,y,z});
}

function teaCanopy(a) {
  const top=3.35,n=8,radius=1.70;
  slat(a,0,0,0,.14,top,wood);
  for(let i=0;i<n;i++){
    const half=radius*Math.sin(Math.PI/n),reach=radius*Math.cos(Math.PI/n);
    const fall=.55,slant=Math.hypot(reach,fall);
    const angle=i/n*Math.PI*2;
    a.panel([[0,0],[-half,-slant],[-half*.34,-slant-.045],[0,-slant-.10],[half*.50,-slant-.045],[half,-slant]],P=>{
      P.fill(i%2?'#c5a468':'#ddbf82');const g=P.g;
      stroke(g,[[0,0],[-half*.96,-slant+.01]],'#a07f54',.052);
      stroke(g,[[0,-.15],[0,-slant+.05]],'#f1d99b',.043);
      stroke(g,[[-half+.045,-slant+.095],[0,-slant+.029],[half-.041,-slant+.095]],'#a0614b',.066);
    },{y:top,z:0,angle,tilt:-Math.atan2(reach,fall),thickness:.038});
  }
  a.panel([[-.10,0],[.10,0],[.10,.15],[0,.23],[-.1,.15]],P=>P.fill(red),{y:top,z:.02});
  table(a,.41,.46,1.61,.92);
  teacup(a,.21,.95,.29);teacup(a,.86,.95,.20);
  person(a,{x:-1.13,z:.01,s:.94,coat:jade,hat:'cap',seated:true});
  a.panel(rectangle(-.44,0,.88,.17),P=>P.fill(wood),{x:-1.17,y:.41,z:.12});
}

function bamboo(a) {
  const stalks=[[-1.12,2.8,-.19],[-.68,4.0,.34],[-.26,3.1,-.36],[.14,4.65,.15],[.63,3.54,.45],[1.08,2.91,.29]];
  for(const [foot,height,lean] of stalks) {
    let pts=[[foot-.056,0],[foot+.059,0],[foot+lean+.045,height],[foot+lean-.039,height]];
    a.panel(pts,P=>{
      P.fill('#85945e');const g=P.g;
      for(let y=.59;y<height;y+=.53){const x=foot+lean*y/height;stroke(g,[[x-.056,y],[x+.055,y+.01]],'#646d49',.044)}
    },{z:(foot+.4)*.11});
    for(let j=1;j<4;j++){
      const y=height*(.20+j*.19),extent=(j===3?.38:.57)*(j%2?-1:1);
      const x=foot+lean*y/height;
      const leaf=[[-.022,0],[.15*extent,.29],[.45*extent,.46],[.77*extent,.47],[1.06*extent,.38],
        [.79*extent,.35],[.62*extent,.36],[.39*extent,.32],[.51*extent,.23],[.83*extent,.15],
        [.67*extent,.084],[.4*extent,.11],[.16*extent,.18],[.012,-.01]];
      a.panel(leaf,P=>{P.fill(j%2?'#74885b':'#899867')},{x,y,z:.055+j*.012,thickness:.033});
    }
  }
}

function teaGarden(a) {
  // Camellias are arranged as overlapping cut scallops with five folded petals.
  for(let k=0;k<3;k++){
    const s=[.72,1.03,.82][k],x=-1.30+k*1.28;
    a.panel([[-1.0,.15],[-.9,.53],[-.68,.66],[-.54,.94],[-.31,.96],[-.17,1.17],[.16,1.14],[.38,.98],
      [.59,1.01],[.72,.76],[.92,.68],[1.1,.43],[1.02,.13],[.65,0],[-.70,0]].map(([u,v])=>[u*s,v*s]),P=>{
      P.fill('#627f60');const g=P.g;g.save();g.scale(s,s);
      for(let j=0;j<19;j++){
        const u=Math.sin(j*7.1+k)*.86,v=.28+(Math.sin(j*4.3+.3)+1)*.31;
        polygon(g,[[u-.13,v],[u-.02,v+.13],[u+.16,v+.16],[u+.06,v+.025]],j%2?'#87a078':'#91a17a');
      }
      for(const [u,v] of [[-.50,.54],[.12,.83],[.67,.49]]){
        for(let j=0;j<5;j++){const t=j/5*Math.PI*2;ellipse(g,u+.078*Math.cos(t),v+.075*Math.sin(t),.078,.078,'#ca8878')}
        ellipse(g,u,v,.048,.046,'#e6c588');
      }
      g.restore();
    },{x,z:k===1?-.21:.16});
  }
}

function cargoBasket(a,x,y,z,w,h,colour) {
  a.panel([[-w*.43,0],[w*.43,0],[w*.50,h*.83],[w*.43,h],[w*.21,h*1.07],
    [-w*.25,h*1.07],[-w*.47,h],[-w*.51,h*.84]],P=>{
    P.fill(colour);const g=P.g;
    for(let i=-3;i<=3;i++)stroke(g,[[w*i/7,0],[w*(i/7+.06),h]],'#d6bd8a',.038);
    for(let j=1;j<5;j++)stroke(g,[[-w*.51,h*j/5],[0,h*(j/5-.06)],[w*.51,h*j/5]],'#9e7954',.044);
    ellipse(g,0,h*.92,w*.46,h*.14,'#82664c');ellipse(g,0,h*.945,w*.37,h*.09,'#c09f6c');
  },{x,y,z});
}

function netYard(a) {
  for(const x of [-2.22,2.22])slat(a,x,0,0,.12,2.78,wood);
  const w=4.44,rows=5,cols=9;
  const points=(u,v)=>[(u-.5)*w,2.58-(.2+.28*v)*Math.sin(Math.PI*u)-v*1.62];
  // A real open mesh made from narrow paper strips, rather than an opaque blue curtain.
  for(let dir of [-1,1])for(let start=-rows;start<=cols+rows;start++){
    const pts=[];
    for(let v=0;v<=rows;v++){
      const col=start+v*dir*.64;if(col<0||col>cols)continue;
      pts.push(points(col/cols,v/rows));
    }
    if(pts.length<2)continue;
    a.panel([...pts,...pts.slice().reverse().map(([x,y])=>[x+.028,y-.022])],P=>P.fill(dir<0?'#a79671':'#776f56'),{z:dir*.021,thickness:.018,print:14});
  }
  for(let i=0;i<7;i++){
    const [x,y]=points(.06+i*.145,0);
    a.panel([[-.065,.07],[.065,.07],[.088,0],[.061,-.09],[-.06,-.09],[-.088,0]],P=>P.fill('#c89459'),{x,y,z:.046});
  }
  cargoBasket(a,-1.41,0,.50,.75,.65,'#ba9c70');
  person(a,{x:2.87,z:.29,hat:'straw',coat:'#547e80',turn:-1});
}

function paintLanding(a) {
  person(a,{x:-1.31,z:-.20,coat:'#6c8593',turn:1});
  a.panel([[-.86,0],[-.67,0],[-.57,.61],[.45,.61],[.59,0],[.77,0],[.63,.79],[.85,.79],
    [.85,2.34],[-.83,2.34],[-.83,.79],[-.71,.79]],P=>{
    P.fill(wood);const g=P.g;
    box(g,-.79,.87,1.59,1.37,'#eadfbe');landscape(g,-.65,1.05,1.30,1.02);
    box(g,.50,1.10,.094,.10,red);
  },{x:.31,z:.13});
  table(a,1.85,.13,1.40,.69);
  for(let i=0;i<3;i++)a.panel([[-.16,0],[.15,0],[.18,.20],[-.18,.20]],P=>{
    P.fill(linen);ellipse(P.g,0,.186,.145,.027,[red,blue,jade][i]);
  },{x:1.44+i*.40,y:.70,z:.02});
}

function sails(a) {
  slat(a,0,0,0,.14,4.28,rackBrown);
  // Short folded courses and bamboo battens are the visible marks of the sailmaker.
  const sheets=[{x:-.03,h:3.84,w:1.68,side:-1,c:'#d9c59c'},{x:.13,h:3.04,w:1.22,side:1,c:'#c7c1a0'}];
  for(const {x,h,w,side,c} of sheets){
    a.panel([[0,.24],[side*w,.47],[side*w*.93,h*.50],[side*w*.71,h*.82],[side*w*.38,h],[0,h*.97]],P=>{
      P.fill(c);const g=P.g;
      for(let j=1;j<6;j++){
        const yy=h*j/6;
        stroke(g,[[0,yy],[side*w*.95,yy+.12]],'#9a8769',.049);
        stroke(g,[[side*w*.13,yy+.11],[side*w*.92,yy+.22]],'#ece0b5',.036);
      }
      stroke(g,[[0,.27],[side*w,.49]],'#99704e',.086);
    },{x,z:.05,angle:side*.28});
  }
  cargoBasket(a,-1.50,0,.46,.84,.58,'#b39567');
  cargoBasket(a,1.27,0,.52,.98,.73,'#bda37b');
  cargoBasket(a,2.24,0,.10,.72,.55,'#ac8b63');
}

function alleyShop(a,{wide,cloth,word,seed}) {
  // Narrow two-storey shopfronts sit in pairs with different ridge heights,
  // window grids and awnings, giving the lanes a continuous street elevation.
  const h=3.7+(seed%3)*.28,w=wide;
  a.panel(rectangle(-w/2,0,w,h),P=>{
    P.fill(['#e2d7c2','#e6dbc5','#ded3bd'][seed%3]);const g=P.g;
    box(g,-w/2,0,w,.30,'#aaa391');box(g,-w/2,1.68,w,.15,wood);
    for(const k of [-.47,-.22,.22,.47])box(g,w*k-.045,.24,.09,h-.24,wood);
    box(g,-w*.14,.13,w*.28,1.40,'#684c39');box(g,-w*.12,.15,w*.105,1.35,'#997455');
    for(const j of [-1,1]){
      const x=j*w*.32;
      box(g,x-w*.11,.58,w*.22,.70,wood);box(g,x-w*.095,.62,w*.19,.62,'#cfb891');
      for(let q=-1;q<=1;q++)box(g,x+q*w*.05,.62,.032,.62,wood);
      box(g,x-w*.10,.90,w*.20,.035,wood);
    }
    for(let k=0;k<3;k++){
      const x=w*(k-1)*.265;
      box(g,x-w*.09,2.14,w*.18,.76,wood);box(g,x-w*.08,2.18,w*.16,.65,'#d5c19a');
      for(let j=0;j<2;j++)box(g,x+(j-.5)*w*.06,2.18,.038,.66,wood);
      box(g,x-w*.08,2.61,w*.16,.045,wood);
    }
    box(g,-w*.46,1.89,w*.92,.10,'#9e8568');
  },{z:-.25});
  const e=w/2+.20;
  a.panel([[-e,.15],[-e+.21,.09],[-e+.40,.015],[e-.40,.015],[e-.21,.09],[e,.15],[e+.09,0],
    [e-.25,-.18],[-e+.25,-.18],[-e-.09,0]],P=>{
    P.fill('#455657');stroke(P.g,[[-e,.075],[-e+.32,-.09],[e-.32,-.09],[e,.075]],'#b7ac92',.048);
  },{y:h,z:.03});
  a.panel(rectangle(-e,0,e*2,1.45),P=>{
    P.fill(seed%2?'#596565':'#676a65');const g=P.g;
    for(let x=-e+.08;x<e;x+=.22){
      box(g,x,0,.05,1.45,'#84908a');box(g,x+.06,0,.04,1.45,'#4a595b');
    }
    for(let y=.26;y<1.45;y+=.36)box(g,-e,y,e*2,.037,'#536360');
  },{y:h,z:-.01,tilt:-1.08});
  a.panel(rectangle(-w*.43,0,w*.86,.64),P=>{
    P.fill(cloth);const g=P.g;
    for(let x=-w*.40;x<w*.43;x+=.28)box(g,x,0,.039,.64,'#dbc6a0');
  },{y:1.66,z:-.25,tilt:1.05});
  printShopFlag(a,w*.38,2.53,word,cloth);
}

function printShopFlag(a,x,y,word,cloth) {
  slat(a,x,y+.69,.19,.88,.06,wood);
  a.panel([[-.29,.67],[.29,.67],[.27,-.37],[0,-.51],[-.27,-.37]],P=>{
    P.fill(cloth);const g=P.g;text(g,word,0,.18,.43,linen);
    stroke(g,[[-.21,-.27],[0,-.38],[.21,-.27]],saffron,.04);
  },{x:x+.22,y,z:.24,print:38});
}

function streetStandard(a,word,direction,cloth,foot) {
  slat(a,-.43,0,0,.12,3.36,rackBrown);
  slat(a,.02,3.22,.035,1.18,.095,rackBrown);
  const banner=[[-.36,0],[.44,0],[.40,-1.85],[foot,-2.10],[-.35,-1.85]];
  a.panel(banner,P=>{
    P.fill(cloth);const g=P.g;
    stroke(g,[[-.31,-.10],[.38,-.10]],saffron,.045);
    text(g,direction,.045,-.30,.21,'#f4d893');
    [...word].forEach((char,i)=>text(g,char,.045,-.70-i*.44,.38,linen));
    stroke(g,[[-.27,-1.80],[foot,-1.94],[.33,-1.80]],saffron,.045);
  },{y:3.23,z:.075,print:48});
}

// Full-depth buildings are interleaved with shallow folded shopfronts, courtyards
// and working spaces. Dimensions match world units used by the four destination rings.
const houses=[
  [-28.9,-20.2,5.4,3.8,3.4,1.52,-.11],[-17.8,-17.4,5.4,4.0,3.55,1.58,.02],
  [-13.3,-3.7,6.1,3.4,3.52,1.73,.06],[-29.2,-4.3,4.8,3.4,3.03,1.53,-.08],
  [-16.1,9.1,5.8,4.1,3.35,1.61,.06],[-29.2,7.9,5.0,3.65,3.20,1.65,-.11],
  [-19.25,25.9,4.15,3.65,3.05,1.45,.03],
  [14.5,-17.5,5.0,3.5,3.13,1.47,-.05],[29.0,-6.2,5.4,3.73,3.42,1.66,.09],
  [13.3,-3.1,4.7,3.3,2.99,1.63,-.08],
  [28.6,10.0,5.2,3.6,3.36,1.73,.08],[12.68,24.2,4.75,3.6,3.15,1.65,-.04]
];
const alleyShops=[
  [-17.2,-9.75,4.5,red,'鼓'],[-12.35,-9.75,4.55,'#ad8250','繡'],
  [-31.3,14.5,3.70,indigo,'墨'],[-27.25,14.55,3.81,'#748d78','紙'],
  [24.9,-21.8,3.68,jade,'茶'],[28.94,-21.84,3.91,'#a27758','陶'],
  [11.4,7.7,3.85,'#587e82','船'],[15.8,7.75,4.30,'#ae7856','帆'],
  [25.4,22.15,4.20,'#678481','網'],[30.15,22.25,4.59,'#9e7455','籮']
];

export function addDistricts(H,track,layout) {
  const homes=[],footprints=[];
  // The actual house prefab registers its own walls with the common walk field.
  for(const [i,[x,z,w,d,h,rise,yaw]] of houses.entries()){
    const handle=house(H,{x,z,w,d,h,rise,yaw,seed:35+i});
    track(handle,16.7);
    homes.push({handle,w,h});
  }

  function scene(name,builder,x,z,{width=1.2,depth=.65,height=2.8,yaw=0,back=.1,collision=true,reach=13}={}) {
    const a=paperAssembly(H);builder(a);
    const handle=H.popup(null,null,{node:a.node,x,z,yaw,height,level:true,sight:false});
    handle.group.name=name;track(handle,reach);
    if(collision){
      const c=Math.abs(Math.cos(yaw)),s=Math.abs(Math.sin(yaw));
      footprints.push({name,x:x+Math.sin(yaw)*back,z:z+Math.cos(yaw)*back,
        rx:(width*c+depth*s)/2,rz:(width*s+depth*c)/2});
    }
    return handle;
  }
  for(const [i,[x,z,w,c,word]] of alleyShops.entries()){
    scene('沿街'+word+'舖',a=>alleyShop(a,{wide:w,cloth:c,word,seed:i}),x,z,
      {width:w,depth:1.66,back:-.80,height:4.86,reach:15});
  }

  // 西北鑼鼓街. See a costumer working, then the rehearsal drums; the two
  // coloured standards frame the final approach to the puppet stage.
  scene('戲服攤',costumeCart,-29.6,-9.65,{width:3.06,depth:.78});
  scene('排演鑼鼓',rehearsal,layout.stage.x+6.25,layout.stage.z-3.12,{width:4.5,depth:.76});
  scene('戲棚彩旗',bunting,layout.stage.x-4.2,layout.stage.z+2.34,{collision:false,height:3.7});
  scene('鑼鼓街幡',a=>streetStandard(a,'鑼鼓街','西北',red,-.10),-25.16,-5.54,
    {width:.24,depth:.27,height:3.5});

  // 西南書院巷. A bookbinder's prints on a line, ink and brushes at the
  // writing bench, and a moon gate with a walkable central opening.
  scene('晾紙架',paperYard,-15.7,11.54,{width:5.89,depth:.61,yaw:.06});
  scene('抄書案',calligrapher,-26.9,21.4,{width:3.99,depth:.94});
  const gardenX=layout.books.x+8.18,gardenZ=layout.books.z+4.85;
  scene('書院月洞門',moonGarden,gardenX,gardenZ,{collision:false,height:3.38});
  for(const side of [-1,1])footprints.push({name:'書院牆',x:gardenX+2.23*side,z:gardenZ,rx:1.03,rz:.17});
  scene('書院巷幡',a=>streetStandard(a,'書院巷','西南',indigo,.19),-20.59,6.57,
    {width:.24,depth:.27,height:3.5});

  // 東北茶花里. Flowers flank the tea entrance. The umbrella, the tea drinker
  // and a thicket of bamboo read as a garden even while the teahouse is folded.
  scene('茶攤紙傘',teaCanopy,14.83,-8.08,{width:3.50,depth:1.37,back:-.15,height:3.62});
  scene('青竹',bamboo,10.35,-9.99,{width:2.49,depth:.58,height:4.7});
  scene('茶花圃',teaGarden,layout.tea.x+4.90,layout.tea.z+3.75,{width:3.91,depth:.88,height:1.28});
  scene('茶花里幡',a=>streetStandard(a,'茶花里','東北',jade,.04),18.84,-3.61,
    {width:.24,depth:.27,height:3.5});

  // 東南畫舫埠. The tall junk sails mark the quay at a distance. A fisher
  // mends a hanging net; farther along, the painter mixes inks beside a river scroll.
  scene('織網人',netYard,14.0,11.74,{width:5.85,depth:1.17,back:.12});
  scene('埠頭畫師',paintLanding,layout.boat.x+4.61,layout.boat.z+1.13,{width:4.34,depth:.95,yaw:-.09});
  scene('曬帆架',sails,layout.boat.x+10.45,layout.boat.z+5.38,{width:4.33,depth:1.40,height:4.4});
  scene('舢舨行李',a=>{
    cargoBasket(a,-1.08,0,.03,1.18,.80,'#c2a16e');cargoBasket(a,.18,0,-.08,1.00,1.02,'#ac8f64');
    cargoBasket(a,1.03,0,.38,.63,.63,'#b69c71');
  },26.61,13.17,{width:3.12,depth:1.08});
  scene('畫舫埠幡',a=>streetStandard(a,'畫舫埠','東南',blue,-.07),9.28,10.32,
    {width:.24,depth:.27,height:3.5});

  const streetTrees=[
    [-31.8,-18.73,.79],[-10.36,-19.43,.81],[-9.83,-4.05,.79],[-31.8,1.35-2.72,.73],
    [-26.1,3.92,.72],[-10.72,6.06,.85],[-15.03,24.22,.72],[-26.9,24.35,.79],
    [10.12,-23.03,.85],[18.21,-6.58,.84],[31.05,-19.42,.78],[23.96,-3.37,.73],
    [9.35,3.86,.79],[19.01,14.29,.73],[24.70,6.18,.77],[30.99,24.26,.84]
  ];
  streetTrees.forEach(([x,z,s],i)=>track(willow(H,x,z,s,i+21),13.5));
  for(const [i,[x,z]] of [[-31,-15.36],[-19.3,-8.39],[-10.26,13.7],[-26.3,9.44],[-10.6,-3.23],
    [11.00,-14.97],[24.91,-10.51],[30.64,-4.92],[10.86,4.25],[29.28,13.26],[18.1,20.16]].entries()){
    track(shrub(H,x,z,.73+(i%3)*.13,i%2===0),10.6);
    track(shrub(H,x+.99,z+.24,.54,i%3===0),9.9);
  }
  for(const [x,z] of [[-25.09,-14.97],[-20.48,-4.58],[-10.03,3.64],[-21.14,14.91],
    [30.01,-15.42],[9.4,-2.82],[9.4,14.94],[18.59,3.72],[23.23,19.62]])
    track(lampPost(H,x,z),14.6);
  return {homes,footprints};
}
