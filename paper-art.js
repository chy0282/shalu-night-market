import * as THREE from 'three';
import {boxFold, makeCard} from 'papercraft/lib/paperkit-3d.js';

const ink='#483b35', timber='#794737', cream='#eee4cb', red='#ab4538';
const TAU=Math.PI*2;
function rect(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
function line(g,points,color,width){
  g.beginPath(); points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
  g.strokeStyle=color; g.lineWidth=width; g.lineJoin='round'; g.stroke();
}
function poly(g,points,color){
  g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
  g.closePath();g.fillStyle=color;g.fill();
}
function oval(g,x,y,rx,ry,color){
  g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();
}
function label(g,word,x,y,size,color){
  g.save();g.translate(x,y);g.scale(1,-1);g.font='bold '+size+'px "Songti TC","Microsoft JhengHei",serif';
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=color;g.fillText(word,0,0);g.restore();
}
function windowPrint(g,x,y,w,h){
  rect(g,x-.07,y-.07,w+.14,h+.14,ink);rect(g,x,y,w,h,'#e4c395');
  for(let i=1;i<4;i++)rect(g,x+w*i/4-.025,y,.05,h,timber);
  for(const r of [.19,.68,.82])rect(g,x,y+r*h,w,.055,timber);
  rect(g,x-.09,y-.13,w+.18,.11,'#93745d');
}
function lantern(g,x,y,s){
  g.save();g.translate(x,y);g.scale(s,s);
  line(g,[[0,.45],[0,1.1]],ink,.04);
  oval(g,0,0,.45,.51,'#993d36');oval(g,-.03,.01,.31,.47,'#cc5140');
  oval(g,-.08,.02,.13,.44,'#e5724c');
  rect(g,-.23,.43,.46,.09,'#b99250');rect(g,-.22,-.52,.44,.1,'#bd9456');
  line(g,[[0,-.47],[0,-.78]],'#b33e2b',.065);g.restore();
}
export function cut(H,outline,paint,options={}){
  return makeCard(outline,{paper:H.paper,paint,pxPerUnit:34,edgeWidth:.035,thickness:.055,back:'mirror',...options});
}
export function house(H,{x,z,w=5,d=4,h=3.6,rise=1.8,name='',yaw=0,seed=2}){
  const roofInk=seed%2?'#484e51':'#404952';
  const building=boxFold({w,d,wallH:h,roofH:rise,overhang:.46,paper:H.paper,seed,thickness:.07,edgeWidth:.055,print:{pxPerUnit:31},paints:{
    front(P){
      P.fill(['#f1ead8',cream,'#e8e4d6'][seed%3]);const g=P.g;
      rect(g,-w/2,0,w,.37,'#9c9685');rect(g,-w/2,.36,w,.08,'#c2b7a4');
      for(const dx of [-w*.46,-w*.18,w*.18,w*.46])rect(g,dx-.055,.32,.11,h-.34,timber);
      rect(g,-w/2,h-.18,w,.15,ink);rect(g,-w/2,h*.7,w,.1,timber);
      const dw=w*.27;rect(g,-dw/2,.09,dw,h*.57,ink);
      rect(g,-dw*.43,.14,dw*.84,h*.52,'#81503b');
      for(let i=0;i<4;i++)rect(g,-dw*.36+i*dw*.20,.17,dw*.105,h*.48,'#95684d');
      windowPrint(g,-w*.424,h*.27,w*.20,h*.31);windowPrint(g,w*.225,h*.27,w*.20,h*.31);
      if(name){
        rect(g,-w*.235,h*.68,w*.47,h*.25,'#b18d58');rect(g,-w*.226,h*.695,w*.452,h*.22,'#314b46');
        label(g,name,0,h*.806,h*.167,'#fff0bf');
      }
      lantern(g,-w*.41,h*.64,.60);lantern(g,w*.41,h*.64,.60);
    },
    gable(P){P.fill('#e4dac2');const g=P.g,b=P.box;
      rect(g,b.x0,0,b.w,.38,'#9a9686');rect(g,b.x0,h*.72,b.w,.1,timber);
      windowPrint(g,b.x0+b.w*.33,h*.28,b.w*.34,h*.33);
      line(g,[[b.x0,h],[b.x0+b.w*.5,h+rise-.14],[b.x1,h]],ink,.19);
    },
    roof(P){
      P.fill(roofInk);const g=P.g,b=P.box;
      for(let y=b.y0+.23;y<b.y1;y+=.37)line(g,[[b.x0,y],[b.x1,y]],'#303b43',.045);
      for(let x=b.x0+.12;x<b.x1;x+=.30){
        line(g,[[x,b.y0],[x,b.y1]],'#737777',.075);
        line(g,[[x+.058,b.y0],[x+.058,b.y1]],'#343c43',.055);
      }
      rect(g,b.x0,b.y0,b.w,.12,'#66686a');
    }
  }});
  const rw=w/2+.57;
  const crest=cut(H,[[-rw,.62],[-rw+.2,.49],[-rw+.48,.22],[-rw+.9,.14],[rw-.9,.14],[rw-.48,.22],[rw-.2,.49],[rw,.62],[rw-.14,.18],[rw-.43,-.01],[rw-.78,-.08],[-rw+.78,-.08],[-rw+.43,-.01],[-rw+.14,.18]],P=>{P.fill('#47494a');line(P.g,[[-rw+.2,.37],[-rw+.52,.14],[-rw+.9,.07],[rw-.9,.07],[rw-.52,.14],[rw-.2,.37]],'#a69d89',.06)});
  building.userData.ridge.add(crest);
  if(name){
    // The striped cloth is scored along the beam and lies against the shop when closed.
    const awning=cut(H,[[-w*.44,-.82],[w*.44,-.82],[w*.44,0],[-w*.44,0]],P=>{
      P.fill('#597d78');for(let n=-9;n<=9;n++){rect(P.g,n*.33,-.84,.045,.85,'#aec0a6')}
      rect(P.g,-w/2,-.76,w,.08,'#d5ba86');
    });
    const frame=new THREE.Group();frame.position.set(0,h*.67,.10);frame.add(awning);building.add(frame);
    const fold=building.userData.follow;
    building.userData.follow=p=>{fold(p);frame.rotation.x=-Math.min(1,Math.max(0,p))*1.22};
  }
  const handle=H.popup(null,null,{x,z,yaw,node:building,height:h+rise,level:true,sight:false});
  const c=Math.cos(yaw),s=Math.sin(yaw);
  H.walk.block((px,pz)=>{const dx=px-x,dz=pz-z,lx=c*dx-s*dz,lz=s*dx+c*dz;return Math.abs(lx)<w/2+.1&&lz> -d-.1&&lz<.10});
  return handle;
}

export function willow(H,x,z,scale,variant){
  const pts=[[-.30,0],[.30,0],[.18,1.64],[.39,2.7],[.82,3.45]];
  function tips(start,end,count){
    for(let i=0;i<count;i++){
      const xx=start+(end-start)*i/count,w=(end-start)/count;
      const low=1.65+.45*Math.sin(i*2.21+variant*.71)+.33*Math.cos(i*.76);
      pts.push([xx,3.65+.23*Math.sin(i*1.29)],[xx+w*.18,low+.32],[xx+w*.38,low],[xx+w*.78,low+.52]);
    }
  }
  tips(.64,2.40,7);
  pts.push([2.44,3.78],[2.24,4.57],[1.83,5.01],[1.36,5.43],[.65,5.67],[-.1,5.78],[-.74,5.63],[-1.43,5.40],[-1.96,5.01],[-2.32,4.30],[-2.48,3.64]);
  tips(-2.45,-.43,8);pts.push([-.47,3.52],[-.24,2.45],[-.13,1.3]);
  const paint=P=>{
    P.fill('#6d794e');const g=P.g;
    poly(g,[[-.33,0],[.33,0],[.24,2.55],[1.1,4.28],[.66,4.4],[.01,3.19],[-.93,4.35],[-1.18,4.18],[-.26,2.5]],'#755b43');
    line(g,[[-.14,.1],[-.08,2.45],[-.8,3.95]],'#af9262',.092);
    for(let i=0;i<34;i++){
      const a=i/33,xx=-2.49+4.92*a,m=1-Math.abs(2*a-1),hi=4.10+1.54*Math.sqrt(m);
      const lo=1.59+.69*Math.sin(i*2.23+variant)+.31*Math.cos(i*.82);
      const color=['#9ca35c','#8b9a60','#648256','#a5ad70','#778f55'][i%5];
      const shoulder=xx*.78+.26,mid=xx+.13;
      poly(g,[[shoulder,hi],[shoulder+.15,hi-.14],[mid+.09,(lo+hi)/2],[xx-.11,lo],[mid-.07,(lo+hi)/2]],color);
      for(let j=0;j<5;j++){
        const t=j/5,yy=hi-.35-(hi-lo-.40)*t,bx=shoulder*(1-t)+xx*t;
        poly(g,[[bx,yy],[bx-.18,yy+.07],[bx-.14,yy-.12],[bx-.06,yy-.24]],'#b0b377');
      }
    }
  };
  return H.popup(pts,paint,{x,z,cross:'full',yaw:.34+variant*.21,scale,solid:.32,sway:.65,res:.65});
}
export function shrub(H,x,z,s,blossom=false){
  const pts=[[-1.35,0],[-1.46,.37],[-1.26,.73],[-.96,.78],[-.88,1.08],[-.51,1.26],[-.17,1.16],[.07,1.47],[.48,1.52],[.76,1.26],[.85,.96],[1.15,.98],[1.43,.69],[1.35,.25],[1.09,0]];
  return H.popup(pts,P=>{
    P.fill('#677853');const g=P.g;
    for(let i=0;i<30;i++){
      const xx=P.r()*2.8-1.4,yy=P.r()*1.5;
      oval(g,xx,yy,.22,.14,['#92a16b','#aeb27d','#7c8d5e'][i%3]);
      if(blossom&&i%3===0){oval(g,xx+.04,yy+.1,.105,.10,'#d4907a');oval(g,xx+.02,yy+.12,.045,.039,'#efc799')}
    }
  },{x,z,scale:s,res:.65,sway:.18});
}
export function lampPost(H,x,z){
  const pts=[[-.15,0],[.15,0],[.15,3.55],[1.02,3.55],[1.02,3.34],[.77,3.20],[.62,2.96],[.67,2.64],[.88,2.37],[1.04,2.32],[1.04,2.04],[1.14,2.04],[1.14,2.32],[1.33,2.42],[1.51,2.65],[1.55,2.94],[1.43,3.18],[1.17,3.34],[1.17,3.55],[1.35,3.55],[1.35,3.78],[.15,3.78],[.15,3.93],[0,4.04],[-.15,3.93]];
  const lamp=H.popup(pts,P=>{P.fill('#7a5142');rect(P.g,-.11,0,.08,3.84,'#b18d67');lantern(P.g,1.09,2.85,1);rect(P.g,-.15,.2,.3,.36,'#a3a08b')},{x,z,solid:.17,res:1.1,level:true});
  lamp.group.userData.streetLantern=true;
  return lamp;
}

