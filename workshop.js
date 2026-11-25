import {sound} from './sound.js';
import {soundButton} from './sound-settings.js';
import {guidePortrait} from './story-art.js';
import {lessons} from './lessons.js';
import {lanternImage} from './lanterns.js';
import {el,button,focusTitle} from './city.js';
const steps={stage:'挑選一句，接成排比句。',boat:'看圖選出三張詞卡。可以拖入，也可以點空格再點詞卡。',tea:'把歎詞拖進對話框，或點一下字卡填入。',books:'點選空格，再把合適的標點放進去。'};
const titles={stage:'接上第三句',boat:'看圖砌比喻句',tea:'選出合適的歎詞',books:'補上正確的標點'};
const classroomPictures=JSON.parse(document.getElementById('classroom-pictures')?.textContent||'{}');

function picture(sceneId,description){
  const figure=el('figure','paper-picture'),img=el('img','exercise-picture');
  img.alt=description;img.draggable=false;
  img.addEventListener('load',()=>figure.classList.toggle('panoramic',img.naturalWidth>2.7*img.naturalHeight),{once:true});
  img.addEventListener('error',()=>figure.replaceChildren(el('figcaption','picture-description',description)),{once:true});
  img.src=classroomPictures[sceneId]||'./book-assets/pictures/'+sceneId+'.webp';
  figure.append(img);return figure;
}

const roles=['本體','喻詞','喻體'];
function shuffled(list){
  const copy=list.slice();
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[j],copy[i]]=[copy[i],copy[j]]}
  return copy;
}

export function openWorkshop(panel,place,previousVisits,{back,complete,collect}){
  const data=lessons[place.id],setIndex=previousVisits%data.sets.length;
  const questions=place.id==='tea'?shuffled(data.sets[setIndex]):data.sets[setIndex];
  let index=0,phase='review',values=[],active=0,solved=false,order=[],awarded=false,drag=null;
  const answers=[];
  let questionPicture,slots=[],feedback,check,tray,readerFrame,progressTrack,stopDrag=null,chosenSlot=false,provisional=null;
  panel.className='workshop-page';panel.style.setProperty('--ink',place.color);
  function cancelDrag(){
    if(stopDrag){const fn=stopDrag;stopDrag=null;fn()}
    drag?.ghost.remove();drag=null;
  }
  function shell(title){
    cancelDrag();panel.replaceChildren();
    panel.scrollTop=0;
    const article=el('article','workshop '+place.id+' '+phase);
    article.setAttribute('aria-label',place.name+' · '+place.topic);
    const head=el('div','paper-head'),names=el('div','book-heading'),stamp=el('img','station-stamp');
    stamp.src=lanternImage(place.id,true);stamp.alt='';
    names.append(el('p','kicker',place.bank+'　／　'+place.name),el('h2','',title));
    head.append(stamp,names,soundButton());
    if(phase!=='reward')head.append(button('返回古城','text-btn book-back',()=>awarded?collect(place):back(place)));
    const sheet=el('div','learning-spread');
    article.append(head,sheet);panel.append(article);panel.hidden=false;return sheet;
  }
  function nextButton(sheet,text,fn){
    const footer=el('div','work-foot');
    footer.append(button(text,'primary book-next',fn));sheet.after(footer);
  }
  function numberedSteps(items,kind){
    const list=el('ol','numbered-steps '+kind);
    items.forEach((item,i)=>{
      const row=el('li'),number=el('span','step-number',String(i+1));
      number.setAttribute('aria-hidden','true');
      const copy=el('div','step-copy');
      if(kind==='knowledge-list'){
        const [term,meaning]=item;
        copy.append(el('strong','knowledge-term',term),document.createTextNode(meaning));
      }else copy.textContent=item;
      row.append(number,copy);list.append(row);
    });
    return list;
  }
  function playExample(){
    const demo=el('div','play-example'),line=el('p','demo-line'),slot=el('span','demo-slot','　');
    const [before,word,after]=data.demo;
    const hint=el('p','demo-hint','點一下字卡，試放進空格。');
    const key=button(word,'demo-key',()=>{
      const filled=slot.classList.toggle('filled');sound.effect(filled?'sparkle':'tap');
      slot.textContent=filled?word:'　';key.textContent=filled?'再試一次':word;
      hint.textContent=filled?'字卡已放進空格，可以連起來讀。':'點一下字卡，試放進空格。';
    });
    hint.setAttribute('role','status');line.append(document.createTextNode(before),slot,document.createTextNode(after));
    demo.append(hint,line,key);return demo;
  }
  function guideBook(openPage='review'){
    sound.effect('page');phase=openPage;const card=shell(titles[place.id]);card.classList.add('guide-spread');
    const knowledge=el('section','guide-leaf knowledge-leaf'),rules=el('section','guide-leaf rules-leaf');
    const heading=(label,leaf)=>{
      const h=el('h3','leaf-title',label);leaf.setAttribute('aria-label',label);leaf.append(h);return h;
    };
    heading('知識重溫',knowledge);
    knowledge.append(el('p','topic-label',data.topic),numberedSteps(data.review,'knowledge-list'));
    const example=el('div','teaching-example'),caption=el('div','example-caption');
    caption.append(el('b','','例句'),el('p','',data.example));
    example.append(picture(place.id+'-example',data.exampleAlt),caption);
    knowledge.append(example);
    knowledge.append(button('看看玩法','book-next page-turn',()=>guideBook('instructions')));
    const ruleTitle=heading('遊戲玩法',rules);
    rules.append(numberedSteps(data.ruleSteps,'rule-list'),playExample());
    const actions=el('div','leaf-actions');
    actions.append(button('回看重溫','book-back page-turn',()=>guideBook('review')),
      button('開始挑戰（'+questions.length+' 題）','primary book-next',()=>{phase='question';newQuestion()}));
    rules.append(actions);card.append(knowledge,rules);
    if(openPage==='instructions'){ruleTitle.tabIndex=-1;ruleTitle.focus({preventScroll:true})}
    else focusTitle(panel);
  }
  function newQuestion(){
    sound.effect('page');
    const q=questions[index],saved=answers[index];
    values=saved?saved.values.slice():q.answer.map(()=>'');active=saved?.active??0;solved=saved?.solved??false;
    order=saved?saved.order:shuffled(q.options);slots=[];chosenSlot=false;provisional=null;
    const card=shell(titles[place.id]);
    const meter=el('div','meter');
    meter.append(el('b','','第 '+(index+1)+' 題 ／ 共 '+questions.length+' 題'));
    progressTrack=el('div','lantern-track');progressTrack.setAttribute('role','progressbar');progressTrack.setAttribute('aria-label','本關已答對題數');
    progressTrack.setAttribute('aria-valuemin','0');progressTrack.setAttribute('aria-valuemax',String(questions.length));
    const trackFill=el('span','lantern-fill'),marker=el('span','progress-star');marker.setAttribute('aria-hidden','true');progressTrack.append(trackFill,marker);
    const lamp=el('img','track-prize');lamp.src=lanternImage(place.id,true);lamp.alt=place.lantern;
    meter.append(progressTrack,lamp);card.before(meter);
    card.classList.add('question-spread');card.dataset.scene=q.sceneId;
    const observation=el('div','observe-leaf'),assembly=el('div','answer-leaf');
    questionPicture=picture(q.sceneId,q.pictureDescription||q.context);
    const context=place.id==='boat'?'看看圖中的兩樣事物。它們有甚麼相似？':q.context;
    observation.append(questionPicture,el('p','context',context));card.append(observation,assembly);
    const prompt=el('div','prompt '+place.id+'-prompt');
    function makeSlot(i){
      const slot=button('','answer-slot',()=>{
        if(solved)return;
        if(provisional&&i!==provisional.slot){
          const {word,before,slot:source}=provisional;
          values[source]=before;put(word,i);
        }else sound.effect('tap');
        provisional=null;chosenSlot=true;active=i;refresh();
      });
      slot.dataset.slot=i;slots.push(slot);return slot;
    }
    if(place.id==='boat'){
      const parts=el('div','role-grid');roles.forEach((role,i)=>{
        const cell=el('div','role');cell.append(el('b','',role),makeSlot(i));parts.append(cell);
      });prompt.append(parts);
    }else{
      const words=q.prompt.split('＿');
      words.forEach((s,i)=>{if(i>0)prompt.append(makeSlot(i-1));prompt.append(document.createTextNode(s))});
    }
    assembly.append(prompt);tray=el('div','choices');tray.setAttribute('aria-label','可用字卡');
    order.forEach(word=>{
      const b=button(word,'choice',event=>{
        if(event.detail===0||!b.suppressClick){
          const adjust=!chosenSlot&&values.length>1?{slot:active,before:values[active],word}:null;
          put(word,active);provisional=adjust;chosenSlot=false;
        }
        b.suppressClick=false;
      });
      b.dataset.word=word;bindDrag(b,word);tray.append(b);
    });assembly.append(tray);
    const foot=el('div','answer-foot');
    feedback=el('div',saved?.feedbackClass??'feedback',saved?.message??steps[place.id]);feedback.setAttribute('role','status');
    const companion=el('div','reader-feedback');readerFrame=el('span','reader-portrait');readerFrame.setAttribute('aria-hidden','true');companion.append(readerFrame,feedback);
    const previous=button(index?'上一題':'回看玩法','book-back',()=>{remember();if(index){index--;newQuestion()}else guideBook('instructions')});
    check=button(solved?nextLabel():'核對答案','primary book-next',checkAnswer);
    foot.append(previous,companion,check);card.after(foot);refresh();focusTitle(panel);
  }
  function remember(){
    answers[index]={values:values.slice(),active,solved,order,message:feedback.textContent,feedbackClass:feedback.className};
  }
  function nextLabel(){return index+1===questions.length?'取花燈':'下一題'}
  function refresh(){
    const correctCount=questions.filter((_,i)=>i===index?solved:answers[i]?.solved).length;
    progressTrack.style.setProperty('--filled',(100*correctCount/questions.length)+'%');
    progressTrack.setAttribute('aria-valuenow',String(correctCount));
    const pose=solved?'celebrate':feedback.classList.contains('retry')?'hint':'neutral';
    if(readerFrame.dataset.pose!==pose){
      readerFrame.dataset.pose=pose;readerFrame.replaceChildren(guidePortrait('traveler',pose));
    }
    check.closest('.answer-foot').dataset.result=solved?'success':pose==='hint'?'retry':'open';
    slots.forEach((b,i)=>{
      b.classList.toggle('active',!solved&&i===active);b.classList.toggle('empty',!values[i]);
      b.classList.toggle('correct',solved);b.classList.toggle('retry-slot',pose==='hint'&&!values[i]);b.disabled=solved;
      b.textContent=values[i]||(place.id==='books'?'　':place.id==='tea'?'□':place.id==='stage'?'放入第三句':'放入詞卡');
      b.setAttribute('aria-label',(place.id==='boat'?roles[i]:'第 '+(i+1)+' 格')+'，'+(values[i]||'待填'));
    });
    check.disabled=!solved&&values.some(v=>!v);
    for(const b of tray.children){b.disabled=solved;b.classList.toggle('in-use',values.includes(b.dataset.word));b.setAttribute('aria-pressed',String(values.includes(b.dataset.word)))}
  }
  function put(word,slot){
    if(solved||phase!=='question')return;
    sound.effect('tap');
    provisional=null;values[slot]=word;const missing=values.findIndex(v=>!v);active=missing>=0?missing:slot;
    feedback.textContent=missing>=0?'繼續填好餘下的空格。':'填好了，可以核對答案。';
    feedback.className='feedback';refresh();
  }
  function bindDrag(b,word){
    b.addEventListener('pointerdown',e=>{
      if(solved||drag||e.button!==0)return;
      b.suppressClick=false;
      const pointer=e.pointerId,x=e.clientX,y=e.clientY;
      const ghost=el('div','drag-ghost',word);ghost.style.setProperty('--ink',place.color);
      drag={ghost};let moved=false;b.setPointerCapture(pointer);
      const move=ev=>{
        if(ev.pointerId!==pointer)return;
        if(!moved&&Math.hypot(ev.clientX-x,ev.clientY-y)<6)return;
        if(!moved){moved=true;b.suppressClick=true;document.body.append(ghost)}
        ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';
        const hit=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-slot]');
        slots.forEach(s=>s.classList.toggle('over',s===hit));
      };
      const detach=()=>{
        b.removeEventListener('pointermove',move);b.removeEventListener('pointerup',end);b.removeEventListener('pointercancel',cancel);
        b.removeEventListener('lostpointercapture',cancel);if(b.hasPointerCapture(pointer))b.releasePointerCapture(pointer);
        slots.forEach(s=>s.classList.remove('over'));ghost.remove();drag=null;stopDrag=null;
      };
      const end=ev=>{
        if(ev.pointerId!==pointer)return;
        const hit=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-slot]');
        if(moved&&hit&&slots.includes(hit))put(word,Number(hit.dataset.slot));
        detach();
      };
      const cancel=ev=>{if(ev.pointerId===pointer){b.suppressClick=true;detach()}};
      stopDrag=detach;b.addEventListener('pointermove',move);b.addEventListener('pointerup',end);b.addEventListener('pointercancel',cancel);b.addEventListener('lostpointercapture',cancel);
    });
  }
  function checkAnswer(){
    provisional=null;chosenSlot=false;
    if(solved){
      remember();if(index+1===questions.length){reward();return}
      index++;newQuestion();return;
    }
    const q=questions[index],incorrect=values.findIndex((v,i)=>v!==q.answer[i]);
    if(incorrect>=0){
      sound.effect('tap');
      q.answer.forEach((word,i)=>{if(word!==values[i])values[i]=''});
      active=incorrect;feedback.className='feedback retry';feedback.textContent='再試一次。'+q.hint;refresh();return;
    }
    sound.effect('correct');solved=true;feedback.className='feedback success';feedback.textContent='答對了！'+q.explanation;
    if(place.id==='boat')feedback.textContent='答對了！'+q.answer.join('')+'。'+q.explanation;
    questionPicture.classList.add('unfold');
    check.textContent=nextLabel();refresh();remember();
    if(index+1===questions.length&&!awarded){awarded=true;complete(place)}
  }
  function reward(){
    sound.effect('sparkle');phase='reward';const card=shell(place.lantern+'亮起來了！');
    const gift=el('div','reward-wrap');const art=el('img','reward-lantern');art.alt=place.lantern;art.src=lanternImage(place.id,true);
    const display=el('div','prize-stage');
    const halo=el('div','prize-halo');halo.setAttribute('aria-hidden','true');
    for(let i=0;i<5;i++)halo.append(el('i'));
    display.append(halo,art);
    const note=el('div','reward-note');note.append(el('b','prize-seal','✓　完成五題'),el('h3','',place.lantern),el('p','',previousVisits?'你又完成了一組'+place.topic+'挑戰。':place.owner+'把這盞花燈送給你，帶它回城吧！'));
    gift.append(display,note);card.append(gift);
    nextButton(card,'提起花燈',()=>collect(place));focusTitle(panel);
  }
  guideBook();
  return {close:()=>{cancelDrag();if(awarded)collect(place);else back(place)}};
}
