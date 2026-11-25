import * as THREE from 'three';
import {paperMaterial} from 'papercraft/lib/paperkit-3d.js';
import {cut} from './paper-art.js';
import {townBounds} from './city.js';
import {riverX,halfRiver} from './riverbank.js';

const bayWidth=5.4,wallThickness=.66;

// A masonry print on the face of a thick, die-cut strip of card.
function stonework(P){
  const g=P.g,b=P.box,course=.34,brick=.91;
  P.fill('#9f9f8d');
  const stones=['#a3a594','#a8a894','#989e91','#aead98','#9da496','#aaa893'];
  let seed=315;
  function roll(){seed=seed*16807%2147483647;return seed/2147483647}
  for(let row=0,y=b.y0;y<b.y1;row++,y+=course){
    for(let x=b.x0-(row%2)*brick*.5;x<b.x1;x+=brick){
      g.fillStyle=stones[Math.floor(roll()*stones.length)];
      g.fillRect(x+.025,y+.026,brick-.043,course-.038);
      g.fillStyle='#d5ceb566';g.fillRect(x+.055,y+course-.045,brick*.83,.025);
      g.fillStyle='#746f613c';g.fillRect(x+.024,y+.021,brick-.05,.026);
    }
  }
  g.fillStyle='#72796c';g.fillRect(b.x0,b.y0,b.w,.12);
  g.fillStyle='#c4baa0';g.fillRect(b.x0,b.y0+.12,b.w,.055);
}

function wallBay(H){
  const w=bayWidth,pitch=w/4,shoulder=1.52,crown=1.95;
  const outline=[[-w/2,0],[w/2,0],[w/2,shoulder]];
  for(let i=0;i<4;i++){
    const right=w/2-i*pitch-.20;
    outline.push([right,shoulder],[right,crown-.045],[right-.055,crown],
      [right-.76,crown],[right-.82,crown-.045],[right-.82,shoulder]);
  }
  outline.push([-w/2,shoulder]);
  return cut(H,outline,P=>{
    stonework(P);
    P.g.fillStyle='#bfbba4';P.g.fillRect(-w/2,1.25,w,.10);
    P.g.fillStyle='#777e72';P.g.fillRect(-w/2,1.19,w,.06);
    for(let i=0;i<4;i++){
      const x=w/2-i*pitch-.62;
      P.g.fillStyle='#58685e';P.g.fillRect(x-.065,1.56,.13,.23);
      P.g.fillStyle='#d9ccb0';P.g.fillRect(x+.06,1.56,.035,.23);
    }
  },{thickness:wallThickness,pxPerUnit:39});
}

// Negative space below the arcade lets the printed river continue under the wall.
function waterGate(H){
  const outline=[[-4.5,0]];
  for(const x of [-2.7,0,2.7]){
    for(let i=0;i<=12;i++){
      const a=Math.PI*(1-i/12);
      outline.push([x+1.12*Math.cos(a),.14+1.00*Math.sin(a)]);
    }
    outline.push([x+1.12,0]);
  }
  outline.push([4.5,0],[4.5,1.65],[-4.5,1.65]);
  return cut(H,outline,P=>{
    stonework(P);const g=P.g;
    for(const x of [-2.7,0,2.7]){
      g.strokeStyle='#c6bea5';g.lineWidth=.17;g.beginPath();g.ellipse(x,.14,1.19,1.08,0,0,Math.PI);g.stroke();
      for(let i=0;i<=9;i++){
        const a=i*Math.PI/9;g.strokeStyle='#787d70';g.lineWidth=.036;g.beginPath();
        g.moveTo(x+1.12*Math.cos(a),.14+1.01*Math.sin(a));
        g.lineTo(x+1.28*Math.cos(a),.14+1.16*Math.sin(a));g.stroke();
      }
    }
    g.fillStyle='#788573';g.fillRect(-4.5,1.40,9,.09);
    g.fillStyle='#c5b99e';g.fillRect(-4.5,1.52,9,.11);
  },{thickness:.79,pxPerUnit:40});
}

// Eight eave corners/midpoints let the roof turn up at each hip, like scored paper.
function watchRoof(H){
  const edge=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
  const position=[],colors=[],uv=[],color=new THREE.Color();
  const paper=document.createElement('canvas');paper.width=192;paper.height=128;
  const g=paper.getContext('2d');g.fillStyle='#faf5e7';g.fillRect(0,0,192,128);
  for(let y=8;y<120;y+=18){
    g.fillStyle='#a6aea4';g.fillRect(0,y,192,2);
    g.fillStyle='#e8e5c9';g.fillRect(0,y+2,192,1);
  }
  for(let x=0;x<192;x+=16){
    g.fillStyle='#a8b4a8';g.fillRect(x,0,2,120);
    g.fillStyle='#e6e9d4';g.fillRect(x+2,0,2,120);
  }
  const texture=new THREE.CanvasTexture(paper);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=H.paper.map.anisotropy;
  const bands=[
    [1.13,3.22,.07],[1.83,3.14,.22],[1.83,3.23,.23],
    [1.17,3.45,.10],[.61,3.82,.04],[.14,4.25,0],[.03,4.41,0]
  ];
  const paint=['#5d5145','#bb966b','#566965','#647774','#5b6c6d','#b18c57'];
  const strips=[.035,.035,.08,.40,.73,.97,.97];
  function vertex(band,i,u){
    const [r,y,lift]=bands[band],[x,z]=edge[i%8];
    position.push(x*r,y+(i%2===0?lift:0),z*r);
    colors.push(color.r,color.g,color.b);
    uv.push(.5+(u-.5)*Math.min(1,r/1.83),strips[band]);
  }
  bands.slice(1).forEach((_,j)=>{
    for(let i=0;i<8;i++){
      color.set(paint[j]).multiplyScalar(i%2===0?1:.95);
      const u=(i%2)*.5;
      vertex(j,i,u);vertex(j+1,i+1,u+.5);vertex(j,i+1,u+.5);
      vertex(j,i,u);vertex(j+1,i,u);vertex(j+1,i+1,u+.5);
    }
  });
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(position,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geometry.computeVertexNormals();
  const material=paperMaterial({map:texture,normalMap:H.paper.normalMap,normalScale:.16,vertexColors:true,side:THREE.DoubleSide});
  return new THREE.Mesh(geometry,material);
}

export function addCityWalls(H){
  const root=new THREE.Group();root.name='沙呂城城牆';H.scene.add(root);
  const bay=wallBay(H),arcade=waterGate(H),roof=watchRoof(H);
  const pier=cut(H,[[-.26,0],[.26,0],[.21,1.65],[.23,1.65],[.23,1.80],[-.23,1.80],[-.23,1.65],[-.21,1.65]],stonework,
    {thickness:.94,pxPerUnit:32});
  const towerFace=cut(H,[[-1.25,0],[1.25,0],[1.07,2.04],[-1.07,2.04]],P=>{
    stonework(P);P.g.fillStyle='#707c70';P.g.fillRect(-1.12,1.75,2.24,.13);
    P.g.fillStyle='#d0c4a5';P.g.fillRect(-1.12,1.91,2.24,.09);
  },{thickness:.14,pxPerUnit:42});
  const gallery=cut(H,[[-1.11,1.93],[1.11,1.93],[1.11,3.38],[-1.11,3.38]],P=>{
    P.fill('#d6c4a0');const g=P.g;
    g.fillStyle='#785448';g.fillRect(-1.11,1.95,2.22,.21);g.fillRect(-1.11,3.07,2.22,.27);
    for(const x of [-.98,0,.98])g.fillRect(x-.07,2.05,.14,1.13);
    for(const x of [-.49,.49]){
      g.fillStyle='#4e5c58';g.fillRect(x-.30,2.46,.60,.49);
      g.fillStyle='#a07b57';g.fillRect(x-.028,2.45,.056,.52);g.fillRect(x-.31,2.67,.62,.05);
    }
  },{thickness:.095,pxPerUnit:36});
  for(const print of [bay,arcade,pier,towerFace])print.material[1].color.set('#a8a58e');
  const batches=new Map(),transform=new THREE.Object3D();
  function stamp(model,x,z,yaw=0,sx=1,sy=1){
    transform.position.set(x,.012,z);transform.rotation.set(0,yaw,0);transform.scale.set(sx,sy,1);transform.updateMatrix();
    if(!batches.has(model))batches.set(model,[]);
    batches.get(model).push(transform.matrix.clone());
  }
  function run(ax,az,bx,bz,height){
    const dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz),count=Math.max(1,Math.round(length/bayWidth));
    const yaw=-Math.atan2(dz,dx);
    for(let i=0;i<count;i++){
      const t=(i+.5)/count;
      stamp(bay,ax+t*dx,az+t*dz,yaw,length/(count*bayWidth),height);
      if(i%2===1)stamp(pier,ax+i*dx/count,az+i*dz/count,yaw,1,height);
    }
  }
  // The inner face meets the existing walk area's limit. Corner pavilions stand outside it.
  const west=townBounds.x0-wallThickness/2,east=townBounds.x1+wallThickness/2;
  const north=townBounds.z0-wallThickness/2,south=townBounds.z1+wallThickness/2;
  for(const z of [north,south]){
    const center=riverX(z),half=halfRiver(z)+.38,height=z===south?.74:1;
    run(west-.12,z,center-half,z,height);run(center+half,z,east+.12,z,height);
    stamp(arcade,center,z,0,half/4.5,height);
  }
  run(west,north,west,south,.9);run(east,north,east,south,.9);
  for(const x of [west,east])for(const z of [north,south]){
    const cx=x+(x===west?-1:1)*.89,cz=z+(z===north?-1:1)*.89;
    for(let side=0;side<4;side++){
      const angle=side*Math.PI/2,nx=Math.sin(angle),nz=Math.cos(angle);
      stamp(towerFace,cx+1.14*nx,cz+1.14*nz,angle);
      stamp(gallery,cx+nx,cz+nz,angle);
    }
    stamp(roof,cx,cz);
  }
  for(const [model,matrices] of batches){
    const batch=new THREE.InstancedMesh(model.geometry,model.material,matrices.length);
    matrices.forEach((matrix,i)=>batch.setMatrixAt(i,matrix));
    batch.instanceMatrix.needsUpdate=true;batch.castShadow=true;batch.receiveShadow=true;
    root.add(batch);
  }
  return root;
}
