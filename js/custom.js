// ═══════════════════════════════════════════════════════════════════
// CUSTOM WORKOUT BUILDER + SAVED WORKOUTS + MY PROGRAM
// ═══════════════════════════════════════════════════════════════════

// ── Tab navigation ──
function customSetTab(tab){A.customTab=tab;render();}

// ── Muscle selection & exercise management (builder) ──
function customSelectMuscle(muscle){A.customMuscle=muscle;render();}

function customAdd(libId){
  const base=_libFind(libId);
  if(!base)return;
  const muscle=_muscleOf(libId);
  A.customExercises=[...A.customExercises,{
    libId,name:base.name,muscle,
    sets:base.sets,
    repTarget:base.type==='time'?null:base.repRange[1],
    holdSec:base.type==='time'?base.holdSec:null,
    type:base.type||null,
    repRange:base.repRange||[0,0],
    cues:base.cues,ms:base.ms||null,
  }];
  render();
}

function customRemove(idx){
  A.customExercises=A.customExercises.filter((_,i)=>i!==idx);
  render();
}

function customAdjSets(idx,delta){
  const ex=A.customExercises[idx];
  if(!ex)return;
  const next=Math.max(1,Math.min(10,ex.sets+delta));
  A.customExercises=A.customExercises.map((e,i)=>i===idx?{...e,sets:next}:e);
  const el=document.getElementById(`cx-sets-${idx}`);
  if(el)el.textContent=next;
  else render();
}

function customAdjRep(idx,delta){
  const ex=A.customExercises[idx];
  if(!ex)return;
  if(ex.type==='time'){
    const next=Math.max(5,Math.min(300,ex.holdSec+delta));
    A.customExercises=A.customExercises.map((e,i)=>i===idx?{...e,holdSec:next}:e);
    const el=document.getElementById(`cx-rep-${idx}`);
    if(el)el.textContent=next+t('workout_sec');
    else render();
  }else{
    const next=Math.max(1,Math.min(50,ex.repTarget+delta));
    A.customExercises=A.customExercises.map((e,i)=>i===idx?{...e,repTarget:next}:e);
    const el=document.getElementById(`cx-rep-${idx}`);
    if(el)el.textContent=next;
    else render();
  }
}

// ── Workout name (called from oninput) ──
function customSetName(val){A.customWorkoutName=val;}

// ── Save current builder workout to saved list ──
function saveCurrentWorkout(){
  const name=(A.customWorkoutName||'').trim();
  if(!name||!A.customExercises.length)return;
  const saved=getSavedWorkouts();
  const workout={id:Date.now(),name,exercises:A.customExercises.map(ex=>({...ex}))};
  ls.set(SK.savedWorkouts,[...saved,workout]);
  A.savedWorkouts=getSavedWorkouts();
  A.customWorkoutName='';
  A.customExercises=[];
  A.customTab='saved';
  render();
}

// ── Load / start / delete saved workouts ──
function loadSavedWorkout(id){
  const w=getSavedWorkouts().find(w=>w.id===id);
  if(!w)return;
  A.customExercises=w.exercises.map(ex=>({...ex}));
  A.customWorkoutName=w.name;
  A.customTab='build';
  render();
}

function startSavedWorkout(id){
  const w=getSavedWorkouts().find(w=>w.id===id);
  if(!w)return;
  A.customExercises=w.exercises.map(ex=>({...ex}));
  A.customWorkoutName=w.name;
  startCustomWorkout();
}

function deleteSavedWorkout(id){
  if(!confirm(t('custom_delete_confirm')))return;
  const saved=getSavedWorkouts().filter(w=>w.id!==id);
  ls.set(SK.savedWorkouts,saved);
  const prog=getCustomProgram();
  if(prog){
    prog.workouts=prog.workouts.filter(e=>e.workoutId!==id);
    if(prog.currentIdx>=prog.workouts.length)prog.currentIdx=0;
    saveCustomProgramToLS(prog);
  }
  A.savedWorkouts=getSavedWorkouts();
  render();
}

// ── Custom program management ──
function addToProgram(workoutId){
  const prog=getCustomProgram()||{workouts:[],currentIdx:0,sessionsDone:0,active:false};
  if(prog.workouts.find(e=>e.workoutId===workoutId))return;
  prog.workouts.push({workoutId,sessions:4});
  saveCustomProgramToLS(prog);
  render();
}

function removeFromProgram(idx){
  const prog=getCustomProgram();
  if(!prog)return;
  prog.workouts.splice(idx,1);
  if(prog.currentIdx>=prog.workouts.length)prog.currentIdx=0;
  saveCustomProgramToLS(prog);
  render();
}

function moveProgramEntry(idx,dir){
  const prog=getCustomProgram();
  if(!prog)return;
  const ni=idx+dir;
  if(ni<0||ni>=prog.workouts.length)return;
  const tmp=prog.workouts[idx];
  prog.workouts[idx]=prog.workouts[ni];
  prog.workouts[ni]=tmp;
  saveCustomProgramToLS(prog);
  render();
}

function adjProgramSessions(idx,delta){
  const prog=getCustomProgram();
  if(!prog)return;
  prog.workouts[idx].sessions=Math.max(1,Math.min(20,(prog.workouts[idx].sessions||4)+delta));
  saveCustomProgramToLS(prog);
  const el=document.getElementById(`prog-sess-${idx}`);
  if(el)el.textContent=prog.workouts[idx].sessions;
  else render();
}

function activateProgram(){
  const prog=getCustomProgram();
  if(!prog||!prog.workouts.length)return;
  prog.active=true;
  saveCustomProgramToLS(prog);
  navigate('home');
}

function deactivateProgram(){
  const prog=getCustomProgram();
  if(!prog)return;
  prog.active=false;
  saveCustomProgramToLS(prog);
  render();
}

// ── Start a session from the active custom program ──
function startCustomProgramSession(){
  const prog=getCustomProgram();
  if(!prog||!prog.workouts.length)return;
  const idx=prog.currentIdx%prog.workouts.length;
  const workoutId=prog.workouts[idx].workoutId;
  const workout=getSavedWorkouts().find(w=>w.id===workoutId);
  if(!workout){alert(t('custom_prog_missing'));return;}
  A.customExercises=workout.exercises.map(ex=>({...ex}));
  A.customWorkoutName=workout.name;
  A.isCustomProgramSession=true;
  startCustomWorkout();
}

// ── Start an ad-hoc custom session ──
function startCustomWorkout(){
  if(!A.customExercises.length)return;
  const sessionExercises=A.customExercises.map((ex,i)=>{
    const lo=ex.type==='time'?0:Math.max(1,(ex.repTarget!=null?ex.repTarget:ex.repRange[1])-2);
    const hi=ex.type==='time'?0:(ex.repTarget!=null?ex.repTarget:ex.repRange[1]);
    return{
      id:`cx_${i}_${ex.libId.replace('lib_','')}`,
      libId:ex.libId,name:ex.name,muscle:ex.muscle,
      sets:ex.sets,repRange:[lo,hi],
      type:ex.type,holdSec:ex.holdSec,
      cues:ex.cues,ms:ex.ms,
    };
  });
  A.isCustomSession=true;
  A.sessionExercises=sessionExercises;
  A.sessionSets=buildInitialSets(sessionExercises);
  A.sessionStart=Date.now();
  A.elapsed=0;
  A.restTimer=null;
  clearInterval(A._restInterval);A._restEndTime=null;
  startElapsed();
  navigate('workout');
}

// ═══════════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════════

function viewCustom(){
  const tab=A.customTab||'build';
  const tabsHTML=['build','saved','program'].map(id=>`
    <button class="chart-pill${tab===id?' active':''}" onclick="customSetTab('${id}')">${t('custom_tab_'+id)}</button>`).join('');

  let content='';
  if(tab==='build')content=_buildTabHTML();
  else if(tab==='saved')content=_savedTabHTML();
  else content=_programTabHTML();

  return`
  <div class="hdr"><div class="logo">RAUTALOKI</div></div>
  <div class="page">
    <div class="h2">${t('custom_title')}</div>
    <div class="chart-pills" style="margin-bottom:16px">${tabsHTML}</div>
    ${content}
  </div>
  ${navHTML('custom')}`;
}

function _buildTabHTML(){
  const muscles=Object.keys(LIBRARY);
  const muscle=A.customMuscle||muscles[0];

  const pillsHTML=muscles.map(m=>`
    <button class="chart-pill${muscle===m?' active':''}" onclick="customSelectMuscle('${m}')">
      ${esc(t('muscle_'+m))}
    </button>`).join('');

  const addedIds=new Set(A.customExercises.map(e=>e.libId));
  const exRowsHTML=(LIBRARY[muscle]||[]).map(ex=>{
    const isAdded=addedIds.has(ex.id);
    const lw=ex.type==='time'?null:getLastWeight(ex.id);
    const meta=ex.type==='time'
      ?`${ex.sets} ${t('workout_sets')} · ${ex.holdSec}${t('workout_sec')}`
      :`${ex.sets} ${t('workout_sets')} · ${ex.repRange[0]}–${ex.repRange[1]} ${t('workout_reps')}`;
    return`
    <div class="custom-ex-row${isAdded?' custom-ex-added':''}">
      <div class="custom-ex-info">
        <div style="font-size:14px;font-weight:700;color:${isAdded?'#d4a846':'#f2f0ea'}">${ex.ms?`<a href="https://www.muscleandstrength.com/exercises/${ex.ms}.html" target="_blank" rel="noopener" class="ex-name-link">${esc(t(ex.id||ex.name))} <span class="ex-video-icon">▶</span></a>`:esc(t(ex.id||ex.name))}</div>
        <div style="font-size:11px;color:#9090b0;margin-top:2px">${meta}${lw?` · <span style="color:#d4a846;font-weight:700">${lw}kg</span>`:''}</div>
      </div>
      <button class="custom-add-btn${isAdded?' custom-add-btn--added':''}" onclick="${isAdded?'':'customAdd(\''+esc(ex.id)+'\')'}" ${isAdded?'disabled':''}>
        ${isAdded?'✓':'+ '+t('custom_add')}
      </button>
    </div>`;
  }).join('');

  let listHTML='';
  if(A.customExercises.length===0){
    listHTML=`<div style="text-align:center;color:#9090b0;font-size:13px;padding:20px 0">${t('custom_empty_start')}</div>`;
  }else{
    A.customExercises.forEach((ex,i)=>{
      const repDisplay=ex.type==='time'?ex.holdSec+t('workout_sec'):String(ex.repTarget);
      listHTML+=`
      <div class="card" style="padding:12px 14px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <div style="font-size:14px;font-weight:700">${esc(t(ex.libId||ex.name))}<span class="mtag">${esc(t('muscle_'+ex.muscle))}</span></div>
          </div>
          <button onclick="customRemove(${i})" style="background:none;border:none;color:#9090b0;font-size:18px;padding:0 0 0 8px;line-height:1">×</button>
        </div>
        <div style="display:flex;gap:16px;align-items:center">
          <div class="custom-stepper-group">
            <span style="font-size:10px;color:#9090b0;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:4px">${t('custom_sets')}</span>
            <div class="custom-stepper">
              <button onclick="customAdjSets(${i},-1)">−</button>
              <span id="cx-sets-${i}">${ex.sets}</span>
              <button onclick="customAdjSets(${i},1)">+</button>
            </div>
          </div>
          <div class="custom-stepper-group">
            <span style="font-size:10px;color:#9090b0;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:4px">${ex.type==='time'?t('workout_col_time'):t('workout_col_reps')}</span>
            <div class="custom-stepper">
              <button onclick="customAdjRep(${i},${ex.type==='time'?-5:-1})">−</button>
              <span id="cx-rep-${i}">${repDisplay}</span>
              <button onclick="customAdjRep(${i},${ex.type==='time'?5:1})">+</button>
            </div>
          </div>
        </div>
      </div>`;
    });
  }

  const canStart=A.customExercises.length>0;
  const canSave=canStart&&(A.customWorkoutName||'').trim().length>0;
  return`
    <div class="sec-title">${t('custom_muscles')}</div>
    <div class="chart-pills" style="margin-bottom:12px">${pillsHTML}</div>
    <div class="card" style="padding:8px 0;margin-bottom:20px">${exRowsHTML}</div>
    <div class="sec-title">${t('custom_selected')} · ${A.customExercises.length}</div>
    ${listHTML}
    ${canStart?`
    <div style="margin-top:12px">
      <input type="text" id="workout-name-inp" placeholder="${t('custom_name_placeholder')}" value="${esc(A.customWorkoutName||'')}"
        oninput="customSetName(this.value)"
        style="width:100%;box-sizing:border-box;background:#12121e;border:1px solid #1c1c2e;color:#f2f0ea;font-size:14px;padding:10px 14px;border-radius:10px;margin-bottom:8px;outline:none">
      <button class="btn-primary" style="background:#1e1e30;color:#d4a846;border:1px solid #d4a84644;margin-bottom:8px" onclick="saveCurrentWorkout()" ${canSave?'':'disabled'}>
        ${t('custom_save')}
      </button>
    </div>`:''}
    <div style="height:4px"></div>
    <button class="btn-primary" onclick="startCustomWorkout()" ${canStart?'':'disabled'}>
      ${canStart?t('custom_start'):t('custom_empty_start')}
    </button>`;
}

function _savedTabHTML(){
  const saved=getSavedWorkouts();
  if(!saved.length)return`<div style="text-align:center;color:#9090b0;font-size:14px;padding:40px 0">${t('custom_no_saved')}</div>`;
  const prog=getCustomProgram();
  const inProgIds=new Set((prog?prog.workouts:[]).map(e=>e.workoutId));
  return saved.map(w=>`
    <div class="card" style="padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:16px;font-weight:700;color:#f2f0ea">${esc(w.name)}</div>
          <div style="font-size:12px;color:#9090b0;margin-top:2px">${w.exercises.length} ${t('stat_exercises').toLowerCase()}</div>
        </div>
        <button onclick="deleteSavedWorkout(${w.id})" style="background:none;border:none;color:#9090b0;font-size:18px;padding:0;line-height:1">×</button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-ghost" style="flex:1;font-size:13px;padding:8px 0" onclick="loadSavedWorkout(${w.id})">${t('custom_load')}</button>
        <button class="btn-ghost" style="flex:1;font-size:13px;padding:8px 0;color:#d4a846;border-color:#d4a846" onclick="startSavedWorkout(${w.id})">${t('custom_start_saved')}</button>
        ${inProgIds.has(w.id)?
          `<button class="btn-ghost" style="flex:1;font-size:13px;padding:8px 0;color:#4a9a5e;border-color:#4a9a5e" disabled>✓ ${t('custom_in_prog')}</button>`:
          `<button class="btn-ghost" style="flex:1;font-size:13px;padding:8px 0" onclick="addToProgram(${w.id})">${t('custom_add_to_prog')}</button>`
        }
      </div>
    </div>`).join('');
}

function _programTabHTML(){
  const prog=getCustomProgram();
  const saved=getSavedWorkouts();

  if(!prog||!prog.workouts.length){
    return`
    <div style="text-align:center;color:#9090b0;font-size:14px;padding:32px 0 12px">${t('custom_prog_empty')}</div>
    <div style="text-align:center;font-size:12px;color:#9090b0">${t('custom_prog_add_hint')}</div>`;
  }

  const isActive=prog.active;
  const curIdx=prog.currentIdx%prog.workouts.length;
  const curEntry=prog.workouts[curIdx];
  const curWorkout=saved.find(w=>w.id===curEntry.workoutId)||{name:'?'};

  const activeAlert=isActive?`
    <div class="scard" style="margin-bottom:16px;border-left:3px solid #4a9a5e">
      <div style="font-size:11px;color:#4a9a5e;font-weight:700;letter-spacing:.08em;margin-bottom:3px">● ${t('custom_prog_active')}</div>
      <div style="font-size:13px;color:#f2f0ea">${t('custom_prog_on')} <strong>${esc(curWorkout.name)}</strong></div>
      <div style="font-size:12px;color:#9090b0;margin-top:2px">${prog.sessionsDone||0} / ${curEntry.sessions} ${t('custom_prog_sessions').toLowerCase()}</div>
    </div>`:'';

  const entriesHTML=prog.workouts.map((entry,i)=>{
    const w=saved.find(w=>w.id===entry.workoutId)||{name:'?',exercises:[]};
    const isCurrent=isActive&&(i===curIdx);
    return`
    <div class="card" style="padding:12px 14px;margin-bottom:8px${isCurrent?';border-color:#4a9a5e':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <div style="font-size:14px;font-weight:700;color:${isCurrent?'#4a9a5e':'#f2f0ea'}">${isCurrent?'● ':''} ${esc(w.name)}</div>
          <div style="font-size:11px;color:#9090b0">${w.exercises.length} ${t('stat_exercises').toLowerCase()}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button onclick="moveProgramEntry(${i},-1)" ${i===0?'disabled':''} style="background:none;border:1px solid #1c1c2e;color:#9090b0;font-size:14px;width:28px;height:28px;border-radius:8px;cursor:pointer">↑</button>
          <button onclick="moveProgramEntry(${i},1)" ${i===prog.workouts.length-1?'disabled':''} style="background:none;border:1px solid #1c1c2e;color:#9090b0;font-size:14px;width:28px;height:28px;border-radius:8px;cursor:pointer">↓</button>
          <button onclick="removeFromProgram(${i})" style="background:none;border:none;color:#9090b0;font-size:18px;padding:0;width:28px;height:28px;cursor:pointer">×</button>
        </div>
      </div>
      <div class="custom-stepper-group">
        <span style="font-size:10px;color:#9090b0;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:4px">${t('custom_prog_sessions')}</span>
        <div class="custom-stepper">
          <button onclick="adjProgramSessions(${i},-1)">−</button>
          <span id="prog-sess-${i}">${entry.sessions}</span>
          <button onclick="adjProgramSessions(${i},1)">+</button>
        </div>
      </div>
    </div>`;
  }).join('');

  return`
  ${activeAlert}
  ${entriesHTML}
  <div style="height:12px"></div>
  ${isActive?
    `<button class="btn-ghost" style="color:#9090b0;border-color:#1c1c2e" onclick="deactivateProgram()">${t('custom_prog_deactivate')}</button>`:
    `<button class="btn-primary" onclick="activateProgram()">${t('custom_prog_activate')}</button>`
  }
  <div style="font-size:11px;color:#9090b0;text-align:center;margin-top:8px">${t('custom_prog_add_hint')}</div>`;
}
