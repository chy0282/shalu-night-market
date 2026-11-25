import * as THREE from 'three';
import {portalRadius} from './city.js';

// The bright inner circumference is exactly the boundary that starts a workshop.
export function makePortals(H,places){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const g=canvas.getContext('2d'),mid=128,r=85;
  const wash=g.createRadialGradient(mid,mid,0,mid,mid,125);
  for(const [stop,col] of [[0,'rgba(255,216,96,.23)'],[.56,'rgba(255,200,51,.34)'],[.68,'rgba(255,193,20,.85)'],[.75,'rgba(255,206,37,.57)'],[1,'rgba(255,216,64,0)']])wash.addColorStop(stop,col);
  g.fillStyle=wash;g.fillRect(0,0,256,256);
  function ring(radius,width,colour){
    g.strokeStyle=colour;g.lineWidth=width;g.beginPath();g.arc(mid,mid,radius,0,Math.PI*2);g.stroke();
  }
  ring(r+7,3,'#8c5317');ring(r,8,'#fffcba');ring(r-6,2,'#bf761e');
  for(let i=0;i<8;i++){
    g.save();g.translate(mid,mid);g.rotate(i*Math.PI/4);g.fillStyle='#fff6ab';g.strokeStyle='#a5661e';g.lineWidth=1.5;
    g.beginPath();g.moveTo(0,99);g.lineTo(4,105);g.lineTo(0,114);g.lineTo(-4,105);g.closePath();g.fill();g.stroke();g.restore();
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const size=portalRadius*256/r,plane=new THREE.PlaneGeometry(size,size);
  const group=new THREE.Group();group.name='四個街區的遊戲金圈';H.scene.add(group);
  const inks=places.map(place=>{
    const ink=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,toneMapped:false});
    const mesh=new THREE.Mesh(plane,ink);mesh.rotation.x=-Math.PI/2;mesh.position.set(place.x,.075,place.z);
    mesh.renderOrder=2;mesh.name=place.name+'入口金圈';group.add(mesh);return ink;
  });
  return {update(t,still){inks.forEach((ink,i)=>{ink.opacity=still?1:.92+.08*Math.sin(t*3+i)})},visible(show){group.visible=show}};
}
