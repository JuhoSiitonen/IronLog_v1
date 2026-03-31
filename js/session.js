// ═══════════════════════════════════════════════════════════════════
// SESSION LOGIC
// ═══════════════════════════════════════════════════════════════════
function buildInitialSets(exercises){
  const init={};
  exercises.forEach(ex=>{
    if(ex.type==='time'){
      init[ex.id]=Array.from({length:ex.sets},()=>({secs:ex.holdSec,done:false,editing:false}));
      return;
    }
    const lw=getLastWeight(ex.libId)??getLastWeight(ex.id);
    const bump=shouldIncrease(ex.id,ex.repRange[1],ex.libId);
    const w=lw?(bump?String(Math.round(lw*1.025*2)/2):String(lw)):"";
    init[ex.id]=Array.from({length:ex.sets},()=>({reps:"",weight:w,done:false,editing:false}));
  });
  return init;
}

function startWorkout(dayId,block){
  block=block||BLOCKS[A.blockIdx];
  const day=block.days.find(d=>d.id===dayId);
  A.activeDayId=dayId;
  const phase=getCurrentBlockPhase();
  A.sessionPhase=phase;
  A.sessionExercises=day.exercises.map(e=>applyPhaseToEx({...e},phase));
  A.sessionSets=buildInitialSets(A.sessionExercises);
  A.sessionStart=Date.now();
  A.elapsed=0;
  A.restTimer=null;
  clearInterval(A._restInterval);A._restEndTime=null;
  startElapsed();
  navigate("workout");
}

function swapExercise(oldId,newEx){
  closeSwap();
  A.sessionExercises=A.sessionExercises.map(e=>e.id===oldId?{...newEx}:e);
  delete A.sessionSets[oldId];
  if(newEx.type==='time'){
    A.sessionSets[newEx.id]=Array.from({length:newEx.sets},()=>({secs:newEx.holdSec,done:false,editing:false}));
  }else{
    const lw=getLastWeight(newEx.libId)??getLastWeight(newEx.id);
    const bump=shouldIncrease(newEx.id,newEx.repRange[1],newEx.libId);
    const w=lw?(bump?String(Math.round(lw*1.025*2)/2):String(lw)):"";
    A.sessionSets[newEx.id]=Array.from({length:newEx.sets},()=>({reps:"",weight:w,done:false,editing:false}));
  }
  A.swapTarget=null;
  render();
}

function cycleReps(exId,idx,repRange){
  const sets=A.sessionSets[exId];
  if(!sets)return;
  const current=parseInt(sets[idx].reps);
  const[lo,hi]=repRange;
  const next=(!sets[idx].reps||isNaN(current)||current<=lo)?hi:current-1;
  sets[idx]={...sets[idx],reps:String(next)};
  // Only re-render the specific rep button to avoid full page flicker
  const btn=document.getElementById(`rep-btn-${exId}-${idx}`);
  if(btn){
    btn.textContent=String(next);
    btn.classList.add('has-val');
    btn.classList.remove('editing');
    // Update check button opacity
    const chk=document.getElementById(`chk-btn-${exId}-${idx}`);
    if(chk)chk.disabled=false;
  }
}

function markSetDone(exId,idx){
  const sets=A.sessionSets[exId];
  if(!sets)return;
  const ex=A.sessionExercises.find(e=>e.id===exId);
  const isTime=ex&&ex.type==='time';
  if(!isTime&&!sets[idx].reps)return;
  sets[idx]={...sets[idx],done:true,editing:false};
  if(!isTime){const w=parseFloat(sets[idx].weight);if(!isNaN(w)&&w>0)saveWeight(exId,w,ex&&ex.libId);}
  startRest(getRestDuration());
  renderSetRow(exId,idx);
  updateProgress();
  updateFinishBtn();
}

function enterEditMode(exId,idx){
  A.sessionSets[exId][idx]={...A.sessionSets[exId][idx],editing:true};
  skipRest();
  renderSetRow(exId,idx);
}

function saveEdit(exId,idx){
  const set=A.sessionSets[exId][idx];
  const ex=A.sessionExercises.find(e=>e.id===exId);
  const isTime=ex&&ex.type==='time';
  if(!isTime&&!set.reps)return;
  if(!isTime){const w=parseFloat(set.weight);if(!isNaN(w)&&w>0)saveWeight(exId,w,ex&&ex.libId);}
  A.sessionSets[exId][idx]={...set,done:true,editing:false};
  renderSetRow(exId,idx);
  updateProgress();
  updateFinishBtn();
}

function updateSecs(exId,idx,val){
  const sets=A.sessionSets[exId];
  if(!sets)return;
  sets[idx]={...sets[idx],secs:val};
}

function removeExercise(exId){
  A.sessionExercises=A.sessionExercises.filter(e=>e.id!==exId);
  delete A.sessionSets[exId];
  const card=document.getElementById(`ex-card-${exId}`);
  if(card)card.remove();
  updateProgress();
  updateFinishBtn();
}

function addSet(exId){
  const ex=A.sessionExercises.find(e=>e.id===exId);
  const sets=A.sessionSets[exId];
  if(!ex||!sets)return;
  const isTime=ex.type==='time';
  const prev=sets[sets.length-1];
  const newSet=isTime
    ?{secs:prev?prev.secs:ex.holdSec,done:false,editing:false}
    :{reps:'',weight:prev?prev.weight:'',done:false,editing:false};
  sets.push(newSet);
  const idx=sets.length-1;
  const gridClass=isTime?'set-grid-time':'set-grid';
  const container=document.getElementById(`sets-container-${exId}`);
  if(container){
    const row=document.createElement('div');
    row.id=`set-row-${exId}-${idx}`;
    row.className=gridClass;
    row.innerHTML=buildSetRowHTML(ex,idx,newSet);
    container.appendChild(row);
    bindSetRowEvents(ex,idx);
  }
  _refreshSetControls(exId);
  updateProgress();
  updateFinishBtn();
}

function removeSet(exId){
  const sets=A.sessionSets[exId];
  if(!sets||sets.length<=1)return;
  const last=sets[sets.length-1];
  if(last.done)return;
  sets.pop();
  const idx=sets.length;
  const row=document.getElementById(`set-row-${exId}-${idx}`);
  if(row)row.remove();
  _refreshSetControls(exId);
  updateProgress();
  updateFinishBtn();
}

function _refreshSetControls(exId){
  const ctrl=document.getElementById(`set-controls-${exId}`);
  if(!ctrl)return;
  const sets=A.sessionSets[exId]||[];
  const canRemove=sets.length>1&&!sets[sets.length-1].done;
  const minusBtn=ctrl.querySelector('button:first-child');
  if(minusBtn)minusBtn.disabled=!canRemove;
}

function addExerciseToSession(libId){
  closeAddExercise();
  const muscle=_muscleOf(libId);
  const libEx=muscle?(LIBRARY[muscle]||[]).find(x=>x.id===libId):null;
  if(!libEx)return;
  const sessionId=`cx_add_${Date.now()}_${libId.replace('lib_','')}`;
  const lo=libEx.type==='time'?0:Math.max(1,libEx.repRange[1]-2);
  const hi=libEx.type==='time'?0:libEx.repRange[1];
  const ex={id:sessionId,libId,name:libEx.name,muscle,sets:libEx.sets,repRange:[lo,hi],type:libEx.type||null,holdSec:libEx.holdSec||null,cues:libEx.cues,ms:libEx.ms||null};
  A.sessionExercises.push(ex);
  const lw=getLastWeight(libId);
  const bump=shouldIncrease(sessionId,hi,libId);
  const w=lw?(bump?String(Math.round(lw*1.025*2)/2):String(lw)):'';
  A.sessionSets[sessionId]=libEx.type==='time'
    ?Array.from({length:libEx.sets},()=>({secs:libEx.holdSec,done:false,editing:false}))
    :Array.from({length:libEx.sets},()=>({reps:'',weight:w,done:false,editing:false}));
  const ei=A.sessionExercises.length-1;
  const cardHTML=buildExerciseCard(ex,ei);
  const anchor=document.getElementById('workout-footer');
  if(anchor){
    const div=document.createElement('div');
    div.innerHTML=cardHTML;
    const card=div.firstElementChild;
    anchor.parentNode.insertBefore(card,anchor);
    // bind kg inputs for new card
    (A.sessionSets[sessionId]||[]).forEach((_,idx)=>{
      bindSetRowEvents(ex,idx);
    });
  }
  updateProgress();
  updateFinishBtn();
}

function updateKg(exId,idx,val){
  const sets=A.sessionSets[exId];
  if(!sets)return;
  sets[idx]={...sets[idx],weight:val};
  // Auto-fill forward to all subsequent undone sets
  for(let i=idx+1;i<sets.length;i++){
    if(!sets[i].done){
      sets[i]={...sets[i],weight:val};
      const el=document.getElementById(`kg-inp-${exId}-${i}`);
      if(el)el.value=val;
    }
  }
}

function finishWorkout(){
  if(!allDone())return;
  let blockId,blockLabel,dayId,dayLabel;
  if(A.isCustomSession){
    blockId=null;blockLabel=null;dayId='custom';dayLabel=t('custom_workout_label');
  }else{
    const block=BLOCKS[A.blockIdx];
    const day=block.days.find(d=>d.id===A.activeDayId);
    blockId=block.id;blockLabel=block.label;dayId=A.activeDayId;dayLabel=day.label;
  }
  const session={
    id:Date.now(),
    date:new Date().toISOString(),
    blockId,blockLabel,dayId,dayLabel,
    duration:Math.round((Date.now()-A.sessionStart)/60000),
    exercises:A.sessionExercises.map(ex=>({
      id:ex.id,libId:ex.libId,name:ex.name,muscle:ex.muscle,
      sets:(A.sessionSets[ex.id]||[]).map(s=>s.secs!==undefined?{secs:s.secs,done:s.done}:{reps:s.reps,weight:s.weight,done:s.done})
    }))
  };
  // ── Detect new PRs (A.history doesn't include current session yet) ──
  const prs=getPRs();
  const newPRs=[];
  session.exercises.forEach(ex=>{
    if(!ex.libId)return;
    const isTimed=(ex.sets||[]).some(s=>s.secs!==undefined);
    const currentMax=isTimed
      ?Math.max(...(ex.sets||[]).map(s=>parseInt(s.secs)||0))
      :Math.max(...(ex.sets||[]).map(s=>parseFloat(s.weight)||0));
    if(!(currentMax>0))return;
    let prevBest=null;
    if(prs[ex.libId]!=null){
      prevBest=isTimed?(prs[ex.libId].secs||0):(prs[ex.libId].weight||0);
    }else{
      // Seed from existing history so existing users don't get false PRs
      let best=0;
      A.history.forEach(hs=>{
        const hx=(hs.exercises||[]).find(e=>e.libId===ex.libId);
        if(!hx)return;
        const m=isTimed
          ?Math.max(...(hx.sets||[]).map(s=>parseInt(s.secs)||0))
          :Math.max(...(hx.sets||[]).map(s=>parseFloat(s.weight)||0));
        if(m>best)best=m;
      });
      prevBest=best>0?best:null;
    }
    // Update store if new best (>= to refresh date on ties)
    if(prevBest===null||currentMax>=prevBest){
      if(isTimed)prs[ex.libId]={secs:currentMax,date:session.date};
      else prs[ex.libId]={weight:currentMax,date:session.date};
    }
    // Only announce genuine improvements over a real previous best
    if(prevBest!==null&&currentMax>prevBest){
      newPRs.push({libId:ex.libId,name:ex.name,value:currentMax,unit:isTimed?'s':'kg',prev:prevBest});
    }
  });
  ls.set(SK.prs,prs);
  session.newPRs=newPRs;
  // ────────────────────────────────────────────────────────────────────

  A.history=[...A.history,session];
  ls.set(SK.history,A.history);
  stopElapsed();
  clearInterval(A._restInterval);A._restEndTime=null;
  A.restTimer=null;
  if(A.isCustomSession){
    if(A.isCustomProgramSession){advanceCustomProgram();A.isCustomProgramSession=false;}
    A.isCustomSession=false;
  }else{
    advanceDay(A.activeDayId);
    A.blockIdx=advanceBlockIfNeeded();
    A.previewBlockIdx=A.blockIdx;
    A.activeDayId=getNextDayId();
  }
  A.completedSession=session;
  navigate("complete");
}

// ═══════════════════════════════════════════════════════════════════
// DERIVED
// ═══════════════════════════════════════════════════════════════════
function doneSets(){return Object.values(A.sessionSets).flat().filter(s=>s.done).length;}
function totalSets(){return Object.values(A.sessionSets).flat().length;}
function allDone(){
  return A.sessionExercises.length>0&&
    A.sessionExercises.every(ex=>{
      const sets=A.sessionSets[ex.id]||[];
      return sets.length>0&&sets.every(s=>s.done);
    });
}

// ═══════════════════════════════════════════════════════════════════
// PARTIAL DOM UPDATES (avoid full re-render during workout)
// ═══════════════════════════════════════════════════════════════════
function renderSetRow(exId,idx){
  const container=document.getElementById(`set-row-${exId}-${idx}`);
  if(!container)return;
  const ex=A.sessionExercises.find(e=>e.id===exId);
  if(!ex)return;
  container.innerHTML=buildSetRowHTML(ex,idx,A.sessionSets[exId][idx]);
  bindSetRowEvents(ex,idx);
}

function updateProgress(){
  const done=doneSets(),total=totalSets();
  const pct=total?Math.round(done/total*100):0;
  const fill=document.getElementById('progress-fill');
  if(fill)fill.style.width=pct+'%';
}

function updateFinishBtn(){
  const btn=document.getElementById('finish-btn');
  if(!btn)return;
  const done=doneSets(),total=totalSets();
  if(allDone()){
    btn.disabled=false;
    btn.textContent=t('workout_finish');
  }else{
    btn.disabled=true;
    btn.textContent=`${done} / ${total} ${t('workout_sets_done')}`;
  }
}
