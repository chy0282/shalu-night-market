import * as THREE from 'three';
import {townBounds,places,portalRadius} from './city.js';
const size=.58,left=townBounds.x0+.32,top=townBounds.z0+.32;
const cols=Math.floor((townBounds.x1-left)/size)+1,rows=Math.floor((townBounds.z1-top)/size)+1;
const point=i=>[left+(i%cols)*size,top+Math.floor(i/cols)*size];

export function makeTrail(H){
  const grid=new Uint8Array(cols*rows);
  grid.forEach((_,i)=>{
    const [x,z]=point(i),s=H.walk.surface(x,z);
    grid[i]=s&&H.walk.why(x,z,s.y)===null?1:0;
  });
  function nearest(x,z){
    let best=-1,dist=Infinity;
    grid.forEach((walkable,i)=>{
      if(!walkable)return;
      const [a,b]=point(i),d=(a-x)**2+(b-z)**2;
      if(d<dist){best=i;dist=d}
    });
    return best;
  }
  function route(x,z,target){
    const start=nearest(x,z),end=nearest(target.x,target.z);
    if(start<0||end<0)return [];
    const otherPortals=places.filter(p=>p!==target&&Math.hypot(p.x-x,p.z-z)>portalRadius+.8);
    const parent=new Int16Array(grid.length).fill(-1),queue=[start];parent[start]=start;
    for(let k=0;k<queue.length&&parent[end]<0;k++){
      const cur=queue[k];
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const col=cur%cols+dx,n=cur+dx+dz*cols;
        if(col<0||col>=cols||!grid[n]||parent[n]!==-1)continue;
        const [nx,nz]=point(n);
        if(otherPortals.some(p=>(p.x-nx)**2+(p.z-nz)**2<(portalRadius+.5)**2))continue;
        parent[n]=cur;queue.push(n);
      }
    }
    if(parent[end]<0)return [];
    const result=[[target.x,target.z]];
    for(let i=end;i!==start;i=parent[i])result.push(point(i));
    return result.reverse();
  }
  const mark=new THREE.CircleGeometry(.195,4);
  mark.rotateX(-Math.PI/2);
  const marks=new THREE.InstancedMesh(mark,new THREE.MeshBasicMaterial({color:'#f5b12d',toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1}),85);
  marks.frustumCulled=false;marks.count=0;H.scene.add(marks);
  const matrix=new THREE.Matrix4();let lastIndex=0,lastPath=[],active=null,wait=0,bearing=0;
  function update(x,z,target,dt){
    wait-=dt;if(!target){marks.count=0;active=null;return}
    if(wait>0&&target===active)return;
    wait=.23;
    if(target!==active||!lastPath.length||Math.min(...lastPath.slice(lastIndex).map(([a,b])=>Math.hypot(a-x,b-z)))>1.7){
      lastPath=route(x,z,target);lastIndex=0;active=target;
    }
    while(lastIndex+1<lastPath.length){
      const [a,b]=lastPath[lastIndex],[c,d]=lastPath[lastIndex+1];
      if(Math.hypot(a-x,b-z)<.76||Math.hypot(c-x,d-z)<Math.hypot(a-x,b-z)){lastIndex++;continue}break;
    }
    const aim=lastPath[Math.min(lastIndex+2,lastPath.length-1)];
    if(aim)bearing=Math.atan2(aim[0]-x,-(aim[1]-z))*180/Math.PI+H.view.yaw;
    let count=0;
    for(let j=lastIndex;j<lastPath.length&&count<85;j+=2){
      const [a,b]=lastPath[j],s=H.walk.surface(a,b);
      if(s){matrix.makeTranslation(a,s.y+.09,b);marks.setMatrixAt(count++,matrix)}
    }
    marks.count=count;marks.instanceMatrix.needsUpdate=true;
  }
  return {get bearing(){return bearing},update,route,hide(){marks.count=0;active=null}};
}
