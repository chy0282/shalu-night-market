import {sound} from './sound.js';

export function soundButton(extraClass=''){
  const button=document.createElement('button');
  button.type='button';
  button.className=('sound-button '+extraClass).trim();
  button.setAttribute('aria-label','聲音設定');
  button.setAttribute('aria-haspopup','dialog');
  button.setAttribute('aria-controls','sound-panel');
  button.title='聲音設定';
  const mark=document.createElement('span'),word=document.createElement('span');
  mark.className='sound-note';mark.setAttribute('aria-hidden','true');mark.textContent='♫';
  word.className='sound-word';word.textContent='聲音';
  button.dataset.muted=String(sound.settings.muted);
  button.append(mark,word);
  return button;
}

export function initSoundSettings(onOpen,onClose){
  const panel=document.getElementById('sound-panel');
  const inputs={music:document.getElementById('music-volume'),effects:document.getElementById('effects-volume')};
  const muted=document.getElementById('sound-muted');
  let opener=null;
  function render(){
    const settings=sound.settings;
    for(const [key,input] of Object.entries(inputs)){
      const level=Math.round(settings[key]*100);
      input.value=String(level);
      input.setAttribute('aria-valuetext',level+'%');
      document.getElementById(key+'-level').textContent=level+'%';
    }
    muted.checked=settings.muted;
    document.querySelectorAll('.sound-button').forEach(b=>b.dataset.muted=String(settings.muted));
  }
  for(const [key,input] of Object.entries(inputs)){
    input.addEventListener('input',()=>{
      sound.configure({[key]:Number(input.value)/100});render();
    });
  }
  inputs.effects.addEventListener('change',()=>sound.effect('tap'));
  muted.addEventListener('change',()=>{
    sound.configure({muted:muted.checked});render();
    if(!muted.checked)sound.effect('tap');
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest('.sound-button');
    if(!button||panel.open)return;
    opener=button;sound.unlock();sound.effect('tap');render();onOpen();panel.showModal();
  });
  panel.addEventListener('close',()=>{
    onClose();if(opener?.isConnected)opener.focus({preventScroll:true});opener=null;
  });
}
