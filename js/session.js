// ═══════════════════════════════════════════════════════════════════
// SESSION LOGIC
// ═══════════════════════════════════════════════════════════════════
function buildInitialSets(exercises){
  const init={};
  exercises.forEach(ex=>{
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
  A.sessionExercises=day.exercises.map(e=>({...e}));
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
  const lw=getLastWeight(newEx.libId)??getLastWeight(newEx.id);
  const bump=shouldIncrease(newEx.id,newEx.repRange[1],newEx.libId);
  const w=lw?(bump?String(Math.round(lw*1.025*2)/2):String(lw)):"";
  A.sessionSets[newEx.id]=Array.from({length:newEx.sets},()=>({reps:"",weight:w,done:false,editing:false}));
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
  if(!sets||!sets[idx].reps)return;
  const w=parseFloat(sets[idx].weight);
  const ex=A.sessionExercises.find(e=>e.id===exId);
  sets[idx]={...sets[idx],done:true,editing:false};
  if(!isNaN(w)&&w>0)saveWeight(exId,w,ex&&ex.libId);
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
  if(!set.reps)return;
  const w=parseFloat(set.weight);
  const ex=A.sessionExercises.find(e=>e.id===exId);
  if(!isNaN(w)&&w>0)saveWeight(exId,w,ex&&ex.libId);
  A.sessionSets[exId][idx]={...set,done:true,editing:false};
  renderSetRow(exId,idx);
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
  const block=BLOCKS[A.blockIdx];
  const day=block.days.find(d=>d.id===A.activeDayId);
  const session={
    id:Date.now(),
    date:new Date().toISOString(),
    blockId:block.id,blockLabel:block.label,
    dayId:A.activeDayId,dayLabel:day.label,
    duration:Math.round((Date.now()-A.sessionStart)/60000),
    exercises:A.sessionExercises.map(ex=>({
      id:ex.id,libId:ex.libId,name:ex.name,muscle:ex.muscle,
      sets:(A.sessionSets[ex.id]||[]).map(s=>({reps:s.reps,weight:s.weight,done:s.done}))
    }))
  };
  A.history=[...A.history,session];
  ls.set(SK.history,A.history);
  advanceDay(A.activeDayId);
  stopElapsed();
  clearInterval(A._restInterval);A._restEndTime=null;
  A.restTimer=null;
  // Check if block should advance based on session count
  A.blockIdx=advanceBlockIfNeeded();
  A.previewBlockIdx=A.blockIdx;
  A.activeDayId=getNextDayId();
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
