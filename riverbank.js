import * as THREE from 'three';
import {cut} from './paper-art.js';
import {crossStreets,lanes,places} from './city.js';

export const bridgeZ=1.35;
const halfSpan=5.8, halfDeck=1.43;
export const riverX=z=>.62*Math.sin((z-bridgeZ)*.21)+.032*(z-bridgeZ);
export const halfRiver=z=>3.92+.25*Math.sin(z*.34);
const bridgeY=x=>.045+1.34*(1-(x/halfSpan)**2);

export function printBanks(H){
  const sheet=H.printGround(({g,ppu,X,Z,rnd,line,water,bandOf})=>{
    const channel=[];
    for(let z=-90;z<=90;z+=.6)channel.push([riverX(z),z]);
    // Hand-set paving. Stones on the quay are narrower than those on the cross street.
    for(let row=-83;row<=83;row++){
      const z=row*.70;
      for(let col=-65;col<=65;col++){
        const x=(col+(row%2)*.5)*1.18;
        const edge=Math.abs(x-riverX(z))-halfRiver(z);
        const thoroughfare=crossStreets.some(road=>Math.abs(z-road)<1.85)||lanes.some(lane=>Math.abs(x-lane)<1.65);
        const square=places.some(p=>((x-p.x)/4.2)**2+((z-p.z)/3.2)**2<1);
        const paved=thoroughfare||square||(edge>0&&edge<2.2);
        const base=paved?['#d0c9b6','#dbd3c3','#c9c3b1','#c0bcad']:['#dbcfb4','#dcd0b5','#dbd0b8','#dfd2bd'];
        if(paved){g.fillStyle='#ab9e8b';g.fillRect(X(x),Z(z),ppu*1.18,ppu*.70)}
        g.fillStyle=base[Math.floor(rnd()*base.length)];
        g.fillRect(X(x),Z(z),ppu*(1.18-(paved?.045:.005)),ppu*(.70-(paved?.045:.005)));
        if(paved&&rnd()>.72)line([[x+.12,z+.1],[x+.41,z+.08]],.018,'#f0e3c7');
      }
    }
    for(let i=0;i<800;i++){
      const x=rnd()*75-37.5,z=rnd()*70-35;
      if(Math.abs(z-bridgeZ)<3||Math.abs(x-riverX(z))<halfRiver(z)+2.8)continue;
      g.fillStyle='rgba(134,143,100,.13)';g.beginPath();g.ellipse(X(x),Z(z),ppu*rnd()*1.1,ppu*.19,rnd(),0,Math.PI*2);g.fill();
    }
    // Printed pocket gardens occupy the blocks between the lanes.
    for(const [x,z,rx,rz] of [[-29,8,3.4,3],[-15,9.3,4.4,2.6],[-14,-20,4,1.7],[15,8,3.6,2.2],[29,9,2.8,3],[14,-21,3.3,1.8],[-29,-6,2.9,1.6],[13,23,2.9,1.4]]){
      for(let i=0;i<42;i++){
        const angle=rnd()*Math.PI*2,rad=Math.sqrt(rnd()),gx=x+Math.cos(angle)*rad*rx,gz=z+Math.sin(angle)*rad*rz;
        g.beginPath();g.fillStyle=['#a7aa85','#b9b995','#c1bea0','#afaf8f'][i%4];
        g.ellipse(X(gx),Z(gz),ppu*(.25+rnd()*.64),ppu*(.12+rnd()*.37),0,0,2*Math.PI);g.fill();
      }
    }
    const outline=bandOf(channel,t=>halfRiver(-90+t*180));
    water(outline,{colors:['#87ad9e','#719f95'],deepPts:bandOf(channel,2.65),rim:'#a9aa91',rimPts:bandOf(channel,t=>halfRiver(-90+t*180)+.23),edge:'cut',flow:1.5,marks:'none'});
    for(let i=0;i<650;i++){
      const z=rnd()*110-55,x=riverX(z)+(rnd()-.5)*halfRiver(z)*1.83,l=.18+rnd()*.95;
      line([[x,z],[x+.052,z+l*.35],[x+.02,z+l]],.026+rnd()*.038,i%4?'#a7c0ae':'#d3d6b5');
    }
    for(const side of [-1,1]){
      for(let z=-45;z<45;z+=1.1){
        const a=riverX(z)+side*(halfRiver(z)+.10),b=riverX(z+1.06)+side*(halfRiver(z+1.06)+.10);
        line([[a,z],[b,z+1.06]],.28,'#b4ad98');line([[a+side*.07,z+.04],[b+side*.07,z+1.02]],.074,'#e1d7b8');
      }
    }
  },{ppu:14,seed:307});
  sheet.material.normalScale.set(.34,.34);
  H.walk.block((x,z)=>Math.abs(x-riverX(z))<halfRiver(z)+.12);
}

export function stoneBridge(H){
  const sideBottom=x=>Math.abs(x)<4.2?.85*Math.sqrt(1-(x/4.2)**2)-.03:-.04;
  const n=30,xs=Array.from({length:n+1},(_,i)=>-halfSpan+2*halfSpan*i/n);
  const wallPts=[...xs.map(x=>[x,sideBottom(x)]),...xs.slice().reverse().map(x=>[x,bridgeY(x)+.49])];
  const wall=cut(H,wallPts,P=>{
    P.fill('#b9ab94');const g=P.g;
    for(let i=0;i<3;i++){
      const dx=.88;
      for(let x=-6+(i%2)*.46;x<6;x+=dx){
        const top=bridgeY(x)+.47-i*.29;
        g.fillStyle=['#c9bea6','#c3b59e','#cabda8'][(Math.floor((x+7)*3)+i)%3];
        g.beginPath();g.moveTo(x,top);g.lineTo(x+dx-.045,bridgeY(x+dx)+.47-i*.29);g.lineTo(x+dx-.045,bridgeY(x+dx)+.23-i*.29);g.lineTo(x,top-.24);g.fill();
      }
    }
    g.strokeStyle='#e3d7bd';g.lineWidth=.105;g.beginPath();xs.forEach((x,i)=>i?g.lineTo(x,bridgeY(x)+.41):g.moveTo(x,bridgeY(x)+.41));g.stroke();
    for(let i=0;i<=23;i++){
      const t=i/23*Math.PI,x=4.22*Math.cos(t),y=.83*Math.sin(t);
      g.strokeStyle='#8d806e';g.lineWidth=.045;
      g.beginPath();g.moveTo(x,y);g.lineTo(4.48*Math.cos(t),y+.23*Math.sin(t));g.stroke();
    }
  },{thickness:.17,pxPerUnit:37});
  for(const side of [-1,1]){
    const cheek=side<0?wall.clone():wall;cheek.position.z=bridgeZ+side*halfDeck;H.scene.add(cheek);
    H.walk.wall(-halfSpan,cheek.position.z,halfSpan,cheek.position.z,{r:.09,name:'石橋欄'});
  }
  // Each crosswise layer is a real folded slab. Walking uses the same sampled top surface.
  const deckPts=[[-halfDeck,0],[halfDeck,0],[halfDeck,1],[-halfDeck,1]];
  const slab=cut(H,deckPts,P=>{
    P.fill('#d4c4a9');const g=P.g;
    g.strokeStyle='#958979';g.lineWidth=.067;g.beginPath();g.moveTo(-halfDeck,.07);g.lineTo(halfDeck,.07);g.stroke();
    g.fillStyle='#e2d4b7';g.fillRect(-halfDeck,.12,halfDeck*2,.09);
    g.fillStyle='#afa38f';g.fillRect(-.43,.15,.027,.85);
  },{thickness:.07,pxPerUnit:35});
  for(let i=0;i<n;i++){
    const x=xs[i],next=xs[i+1],a=bridgeY(x),b=bridgeY(next),strip=slab.clone();
    const localX=new THREE.Vector3(0,0,1);
    const localY=new THREE.Vector3(next-x,b-a,0).normalize();
    const localZ=new THREE.Vector3().crossVectors(localX,localY);
    strip.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(localX,localY,localZ));
    strip.scale.y=Math.hypot(next-x,b-a)+.004;strip.position.set(x,a,bridgeZ);H.scene.add(strip);
  }
  H.walk.add({heightAt(x,z){
    if(Math.abs(x)>halfSpan||Math.abs(z-bridgeZ)>halfDeck)return null;
    const index=Math.min(n-1,Math.floor((x+halfSpan)/(2*halfSpan)*n));
    const t=(x-xs[index])/(xs[index+1]-xs[index]);
    return bridgeY(xs[index])*(1-t)+bridgeY(xs[index+1])*t+.035;
  }});
}

export function skiff(H,x,z,yaw,scale=1){
  const group=new THREE.Group();
  const side=cut(H,[[-2.7,.65],[-2.35,.22],[-1.65,.10],[1.76,.10],[2.28,.27],[2.65,.79],[1.57,.54],[-1.68,.47]],P=>{
    P.fill('#654c37');const g=P.g;for(let i=0;i<3;i++){g.fillStyle=['#a27a4e','#876444','#4e4034'][i];g.fillRect(-2.4,.20+i*.12,4.8,.065)}
  });
  for(const k of [-1,1]){const part=side.clone();part.position.z=k*.50;group.add(part)}
  const deck=cut(H,[[-2.40,-.02],[-1.7,-.52],[1.80,-.52],[2.4,0],[1.71,.52],[-1.73,.52]],P=>{
    P.fill('#ad8e60');for(let i=-2;i<2;i+=.25){P.g.fillStyle='#896e4b';P.g.fillRect(i,-.55,.035,1.1)}
  });deck.rotation.x=-Math.PI/2;deck.position.y=.35;group.add(deck);
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI,b=(i+1)/8*Math.PI;
    const z1=.55*Math.cos(a),z2=.55*Math.cos(b),y1=.42+.77*Math.sin(a),y2=.42+.77*Math.sin(b);
    const w=Math.hypot(y2-y1,z2-z1);
    const panel=cut(H,[[-.88,0],[.82,0],[.82,w],[-.88,w]],P=>{P.fill(i%2?'#757067':'#8e8473');for(const n of [-.77,-.08,.70]){P.g.fillStyle='#534c43';P.g.fillRect(n,0,.075,w)}});
    panel.position.set(0,y1,z1);panel.rotation.x=Math.atan2(z2-z1,y2-y1);group.add(panel);
  }
  group.rotation.y=yaw;group.scale.setScalar(scale);group.position.set(x,.08,z);H.scene.add(group);
}
