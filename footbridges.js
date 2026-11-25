import {cut} from './paper-art.js';
import {riverX} from './riverbank.js';

export function timberBridge(H,z,colour,name){
  const cx=riverX(z),span=5.75,half=1.34,height=.18;
  const deck=cut(H,[[-span,-half],[span,-half],[span,half],[-span,half]],P=>{
    P.fill(colour);
    for(let i=0;i<26;i++){
      const x=-span+i*2*span/26;
      P.g.fillStyle=['#bea07d','#c9aa80','#b99873','#d0b08b'][i%4];P.g.fillRect(x+.024,-half,2*span/26-.043,half*2);
      P.g.fillStyle='#876c50';P.g.fillRect(x+.08,half-.21,.075,.075);P.g.fillRect(x+.08,-half+.14,.075,.075);
    }
  },{thickness:.12,pxPerUnit:28});
  deck.rotation.x=-Math.PI/2;deck.position.set(cx,height,z);H.scene.add(deck);
  const railPts=[[-span,0],[-span,.78]];
  for(let i=0;i<8;i++){
    const x=-span+i*2*span/8;railPts.push([x,.87],[x+.16,.87],[x+.16,.59],[x+2*span/8-.02,.59]);
  }
  railPts.push([span,.85],[span+.08,.85],[span+.08,0],[span-.12,0],[span-.12,.38]);
  for(let i=7;i>=1;i--){
    const x=-span+i*2*span/8;railPts.push([x+.16,.38],[x+.16,0],[x,0],[x,.38]);
  }
  railPts.push([-span+.16,.38],[-span+.16,0]);
  const rail=cut(H,railPts,P=>{
    P.fill(colour);P.g.fillStyle='#f2dbb4';P.g.fillRect(-span,.53,span*2,.045);
    for(let i=0;i<=8;i++){const x=-span+i*2*span/8;P.g.fillStyle='#e8c792';P.g.fillRect(x,.74,.165,.06);}
  },{thickness:.095,pxPerUnit:25});
  for(const side of [-1,1]){
    const part=rail.clone();part.position.set(cx,height,z+side*half);H.scene.add(part);
    H.walk.wall(cx-span,part.position.z,cx+span,part.position.z,{r:.075,name});
  }
  H.walk.add({heightAt(x,pz){return Math.abs(x-cx)<=span&&Math.abs(pz-z)<=half?height+.015:null}});
}
