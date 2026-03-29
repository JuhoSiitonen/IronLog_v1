// ═══════════════════════════════════════════════════════════════════
// NAVIGATION & RENDER
// ═══════════════════════════════════════════════════════════════════
function navigate(view){
  A.view=view;
  render();
  window.scrollTo(0,0);
}

function setPreviewBlock(idx){
  A.previewBlockIdx=idx;
  render();
}

function cancelWorkout(){
  const done=doneSets();
  if(done>0){
    quitWithoutCompleting();
  }else{
    if(!confirm(t('workout_cancel')))return;
    stopElapsed();
    clearInterval(A._restInterval);A._restEndTime=null;
    A.restTimer=null;
    A.sessionStart=null;
    navigate("home");
  }
}

const _quitLines={
  en:[
    "Are you sure? The weights won't lift themselves.",
    "Quitting? Your muscles just filed a complaint.",
    "Leaving already? Even the dumbbells are disappointed.",
    "Really? You were doing so well\u2026",
    "Your future self just shed a single tear.",
    "The iron remembers. It always remembers.",
  ],
  fi:[
    "Oletko varma? Painot eivät nosta itseään.",
    "Lopetat? Lihaksesi jättivät juuri valituksen.",
    "Lähdetkö jo? Käsipainotkin ovat pettyneitä.",
    "Oikeasti? Meni niin hyvin\u2026",
    "Tuleva sinäsi vuodatti juuri kyyneleen.",
    "Rauta muistaa. Se muistaa aina.",
  ]
};
function quitWithoutCompleting(){
  const lines=_quitLines[getLang()]||_quitLines.en;
  const line=lines[Math.floor(Math.random()*lines.length)];
  const modal=document.createElement('div');
  modal.className='modal-overlay';
  modal.id='quit-modal';
  modal.innerHTML=`
    <div class="modal-sheet" style="padding:28px 24px 36px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🏳️</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:900;color:#f2f0ea;margin-bottom:8px">${t('quit_title')}</div>
      <div style="font-size:14px;color:#9090b0;margin-bottom:24px;line-height:1.5">${esc(line)}</div>
      <div style="font-size:12px;color:#9090b0;margin-bottom:20px">${t('quit_save_info')}</div>
      <button class="btn-primary" style="background:#ff4455;margin-bottom:10px" onclick="confirmQuit()">${t('quit_confirm')}</button>
      <button class="btn-ghost" onclick="closeQuit()">${t('quit_keep')}</button>
    </div>`;
  document.body.appendChild(modal);
}
function closeQuit(){
  const m=document.getElementById('quit-modal');
  if(m)m.remove();
}
function confirmQuit(){
  closeQuit();
  let blockId,blockLabel,dayId,dayLabel;
  if(A.isCustomSession){
    blockId=null;blockLabel=null;dayId='custom';dayLabel=t('custom_workout_label');
  }else{
    const block=BLOCKS[A.blockIdx];
    const day=block?block.days.find(d=>d.id===A.activeDayId):null;
    blockId=block?block.id:null;blockLabel=block?block.label:null;
    dayId=A.activeDayId;dayLabel=day?day.label:'';
  }
  const session={
    id:Date.now(),
    date:new Date().toISOString(),
    blockId,blockLabel,dayId,dayLabel,
    duration:Math.round((Date.now()-A.sessionStart)/60000),
    partial:true,
    exercises:A.sessionExercises.map(ex=>({
      id:ex.id,libId:ex.libId,name:ex.name,muscle:ex.muscle,
      sets:(A.sessionSets[ex.id]||[]).filter(s=>s.done).map(s=>s.secs!==undefined?{secs:s.secs,done:s.done}:{reps:s.reps,weight:s.weight,done:s.done})
    })).filter(ex=>ex.sets.length>0)
  };
  if(session.exercises.length>0){
    A.history=[...A.history,session];
    ls.set(SK.history,A.history);
  }
  stopElapsed();
  clearInterval(A._restInterval);A._restEndTime=null;
  A.restTimer=null;
  A.sessionStart=null;
  if(A.isCustomSession)A.isCustomSession=false;
  if(A.isCustomProgramSession)A.isCustomProgramSession=false;
  navigate("home");
}

function render(){
  const app=document.getElementById('app');
  if(!app)return;
  // Show onboarding if no profile
  if(!getProfile()&&A.view!=='onboarding'){A.view='onboarding';}
  let html='';
  if(A.view==='onboarding')html=viewOnboarding();
  else if(A.view==='home')html=viewHome();
  else if(A.view==='workout')html=viewWorkout();
  else if(A.view==='complete')html=viewComplete();
  else if(A.view==='history')html=viewHistory();
  else if(A.view==='program')html=viewProgram();
  else if(A.view==='custom')html=viewCustom();
  else if(A.view==='settings')html=viewSettings();
  app.innerHTML=html;
  // After render, bind kg inputs (oninput in HTML attr can't pass complex args)
  if(A.view==='workout'){
    A.sessionExercises.forEach(ex=>{
      (A.sessionSets[ex.id]||[]).forEach((_,idx)=>{
        const el=document.getElementById(`kg-inp-${ex.id}-${idx}`);
        if(el){
          const exId=ex.id;
          const i=idx;
          el.oninput=function(){updateKg(exId,i,this.value);};
        }
      });
    });
    // Re-attach rest bar state
    refreshRestBar();
  }
}

// ═══════════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════════
render();
if('serviceWorker'in navigator){navigator.serviceWorker.register('/sw.js');}
