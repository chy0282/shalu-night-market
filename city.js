export const places = [
  {id:'stage', name:'錦繡戲棚', short:'戲棚', bank:'西北鑼鼓街', topic:'排比句', lantern:'獅子燈', owner:'說書人', title:'替說書人接句', color:'#984536', x:-24,z:-13,
    request:'戲就要開場了！你能替我接好第三句，讓三幅畫一起立起來嗎？'},
  {id:'books', name:'墨香書坊', short:'書坊', bank:'西南書院巷', topic:'標點符號', lantern:'兔仔燈', owner:'書坊掌櫃', title:'替掌櫃排對白', color:'#74577b', x:-22,z:17,
    request:'風把書頁上的標點吹散了！請幫我把符號放回原位。'},
  {id:'tea', name:'柳岸茶館', short:'茶館', bank:'東北茶花里', topic:'歎詞', lantern:'茶壺燈', owner:'茶館小二', title:'替茶客開口', color:'#407165', x:21,z:-14,
    request:'茶館裏熱鬧極了。看看每一位客人的神情，找出他開口說的第一個字吧！'},
  {id:'boat', name:'清波畫舫', short:'畫舫', bank:'東南畫舫埠', topic:'比喻法', lantern:'鯉魚燈', owner:'畫師', title:'替畫師配畫句', color:'#376579', x:7,z:19,
    request:'我把生活中的景物寫進畫卷了。請幫我找出每句比喻裏，甚麼像甚麼。'}
];
export const placeById=Object.fromEntries(places.map(p=>[p.id,p]));

export const townBounds={x0:-34,x1:34,z0:-26,z1:26};
export const layout={...placeById,gate:{x:-25,z:1.35}};
export const crossStreets=[-13,1.35,17];
export const lanes=[-23,-7,7,21];
export const portalRadius=1.45;

export function el(tag,cls,text){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!=null)node.textContent=text;
  return node;
}
export function button(label,cls,action){
  const b=el('button',cls,label);b.type='button';b.addEventListener('click',action);return b;
}
export function focusTitle(panel){const n=panel.querySelector('h2,h1');if(n){n.tabIndex=-1;n.focus({preventScroll:true})}}
