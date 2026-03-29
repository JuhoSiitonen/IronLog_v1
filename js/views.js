// ═══════════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════════
function viewHome(){
  const prog=getCustomProgram();
  if(prog&&prog.active&&prog.workouts.length>0)return _viewHomeCustomProgram(prog);
  const block=BLOCKS[A.blockIdx]||BLOCKS[0];
  if(!block)return`<div class="page"><div class="h1">No program</div><button class="btn-primary" onclick="navigate('onboarding')">${t('home_start')}</button></div>`;
  const nextB=BLOCKS[(A.blockIdx+1)%BLOCKS.length];
  const stu=getSessionsUntilSwap();
  const nextDay=block.days.find(d=>d.id===A.activeDayId)||block.days[0];
  if(nextDay!==block.days.find(d=>d.id===A.activeDayId)){A.activeDayId=nextDay.id;}
  const totalS=A.history.length;
  const weekS=A.history.filter(h=>isThisISOWeek(h.date)).length;

  const pillsHTML=nextDay.exercises.map(ex=>{
    if(ex.type==='time')return`<span class="ex-pill"><span style="font-size:12px;color:#f2f0ea">${esc(t(ex.libId||ex.name))}</span><span style="font-size:12px;color:#9090b0">${ex.holdSec}${t('workout_sec')}</span></span>`;
    const lw=getLastWeight(ex.libId)??getLastWeight(ex.id);
    const bump=shouldIncrease(ex.id,ex.repRange[1],ex.libId);
    return`<span class="ex-pill"><span style="font-size:12px;color:#f2f0ea">${esc(t(ex.libId||ex.name))}</span>${lw?`<span style="font-size:12px;font-weight:700;color:${bump?'#d4a846':'#9090b0'}">${bump?'↑':''}${lw}kg</span>`:''}</span>`;
  }).join('');

  const swapAlert=stu<=2?`
    <div class="scard" style="margin-top:4px">
      <div style="font-size:11px;color:#e8c55a;font-weight:700;letter-spacing:.08em;margin-bottom:3px">🔄 ${t('home_block_swap_in')} ${stu} ${stu!==1?t('home_sessions'):t('home_session')}</div>
      <div style="font-size:13px;color:#f2f0ea">${t('home_coming_up')} <strong>${t('block_label')} ${nextB.id} — ${t('theme_'+nextB.theme)}</strong></div>
    </div>`:'';

  const dayListHTML=block.days.map(day=>{
    const isNext=day.id===A.activeDayId;
    const badge=isNext?`<span class="badge" style="background:#d4a84622;color:#d4a846">${t('home_next')}</span>`:'';
    return`<div class="card day-card" onclick="startWorkout('${day.id}')">
      <div>
        <div style="font-weight:700;font-size:15px">${day.emoji} ${esc(t('day_'+day.label))}</div>
        <div style="font-size:12px;color:#9090b0">${esc(t('focus_'+day.focus))}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">${badge}<span class="day-arrow">›</span></div>
    </div>`;
  }).join('');

  const freq=(getProfile()||{freq:3}).freq;
  return`
  <div class="hdr">
    <div><div class="logo">RAUTALOKI</div><div class="hdr-sub">${today()}</div></div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#e8c55a;font-weight:700;letter-spacing:.06em">${t('block_label')} ${block.id}</div>
      <div style="font-size:10px;color:#9090b0;margin-top:1px">${stu} ${stu!==1?t('home_sessions_left'):t('home_session_left')}</div>
    </div>
  </div>
  <div class="page">
    <div class="h1">${t('home_ready')}</div>
    <div class="sub">${freq} ${t('home_days_week')} ${freq<=3?t('home_full_body'):t('home_split')} ${BLOCKS.length} ${t('home_blocks_variation')}</div>
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${totalS}</div><div class="stat-lbl">${t('stat_sessions')}</div></div>
      <div class="stat-box"><div class="stat-val">${weekS}<span>/${freq}</span></div><div class="stat-lbl">${t('stat_this_week')}</div></div>
      <div class="stat-box"><div class="stat-val">${stu}</div><div class="stat-lbl">${t('stat_to_swap')}</div></div>
    </div>
    <div class="acard">
      <div style="font-size:11px;color:#d4a846;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">
        ${t('home_up_next')} · ${t('block_label')} ${block.id} · ${t('home_day')} ${nextDay.id}
      </div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;margin-bottom:2px">${nextDay.emoji} ${esc(t('day_'+nextDay.label))}</div>
      <div style="font-size:13px;color:#9090b0;margin-bottom:14px">${esc(t('focus_'+nextDay.focus))}</div>
      <div style="display:flex;flex-wrap:wrap;margin-bottom:16px">${pillsHTML}</div>
      <button class="btn-primary" onclick="startWorkout('${A.activeDayId}')">${t('home_start')}</button>
    </div>
    ${swapAlert}
    <div class="sec-title" style="margin-top:20px">${t('home_all_days')} ${t('block_label')} ${block.id}</div>
    ${dayListHTML}
  </div>
  ${navHTML("home")}`;
}

function _viewHomeCustomProgram(prog){
  const saved=getSavedWorkouts();
  const curIdx=prog.currentIdx%prog.workouts.length;
  const curEntry=prog.workouts[curIdx];
  const workout=saved.find(w=>w.id===curEntry.workoutId);
  if(!workout){
    // Saved workout was deleted — deactivate and fall back
    prog.active=false;saveCustomProgramToLS(prog);
    return viewHome();
  }
  const sessionsLeft=curEntry.sessions-(prog.sessionsDone||0);
  const nextEntry=prog.workouts[(curIdx+1)%prog.workouts.length];
  const nextWorkout=saved.find(w=>w.id===(nextEntry||{}).workoutId)||{name:'?'};
  const totalS=A.history.length;
  const freq=(getProfile()||{freq:3}).freq;
  const weekS=A.history.filter(h=>isThisISOWeek(h.date)).length;

  const pillsHTML=workout.exercises.map(ex=>{
    if(ex.type==='time')return`<span class="ex-pill"><span style="font-size:12px;color:#f2f0ea">${esc(t(ex.libId||ex.name))}</span><span style="font-size:12px;color:#9090b0">${ex.holdSec}${t('workout_sec')}</span></span>`;
    const lw=getLastWeight(ex.libId);
    return`<span class="ex-pill"><span style="font-size:12px;color:#f2f0ea">${esc(t(ex.libId||ex.name))}</span>${lw?`<span style="font-size:12px;color:#9090b0">${lw}kg</span>`:''}</span>`;
  }).join('');

  const swapAlert=sessionsLeft<=1&&prog.workouts.length>1?`
    <div class="scard" style="margin-top:4px">
      <div style="font-size:11px;color:#e8c55a;font-weight:700;letter-spacing:.08em;margin-bottom:3px">🔄 ${t('custom_prog_swap_in')} ${sessionsLeft} ${sessionsLeft!==1?t('home_sessions'):t('home_session')}</div>
      <div style="font-size:13px;color:#f2f0ea">${t('home_coming_up')} <strong>${esc(nextWorkout.name)}</strong></div>
    </div>`:'';

  const rotationHTML=prog.workouts.map((e,i)=>{
    const w=saved.find(w=>w.id===e.workoutId)||{name:'?',exercises:[]};
    const isCurrent=i===curIdx;
    return`<div class="card day-card" onclick="startCustomProgramSession()">
      <div>
        <div style="font-weight:700;font-size:15px">${esc(w.name)}</div>
        <div style="font-size:12px;color:#9090b0">${w.exercises.length} ${t('stat_exercises').toLowerCase()} · ${e.sessions} ${t('custom_prog_sessions').toLowerCase()}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        ${isCurrent?`<span class="badge" style="background:#d4a84622;color:#d4a846">${t('home_next')}</span>`:''}
        <span class="day-arrow">›</span>
      </div>
    </div>`;
  }).join('');

  return`
  <div class="hdr">
    <div><div class="logo">RAUTALOKI</div><div class="hdr-sub">${today()}</div></div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#4a9a5e;font-weight:700;letter-spacing:.06em">${t('custom_prog_active')}</div>
      <div style="font-size:10px;color:#9090b0;margin-top:1px">${sessionsLeft} ${sessionsLeft!==1?t('home_sessions_left'):t('home_session_left')}</div>
    </div>
  </div>
  <div class="page">
    <div class="h1">${t('home_ready')}</div>
    <div class="sub">${t('custom_prog_home_sub')} · ${prog.workouts.length} ${t('stat_exercises').toLowerCase()}</div>
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${totalS}</div><div class="stat-lbl">${t('stat_sessions')}</div></div>
      <div class="stat-box"><div class="stat-val">${weekS}<span>/${freq}</span></div><div class="stat-lbl">${t('stat_this_week')}</div></div>
      <div class="stat-box"><div class="stat-val">${sessionsLeft}</div><div class="stat-lbl">${t('stat_to_swap')}</div></div>
    </div>
    <div class="acard">
      <div style="font-size:11px;color:#d4a846;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">
        ${t('home_up_next')} · ${curIdx+1}/${prog.workouts.length}
      </div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;margin-bottom:10px">${esc(workout.name)}</div>
      <div style="display:flex;flex-wrap:wrap;margin-bottom:16px">${pillsHTML}</div>
      <button class="btn-primary" onclick="startCustomProgramSession()">${t('home_start')}</button>
    </div>
    ${swapAlert}
    <div class="sec-title" style="margin-top:20px">${t('custom_prog_rotation')}</div>
    ${rotationHTML}
  </div>
  ${navHTML("home")}`;
}

function viewWorkout(){
  const exercisesHTML=A.sessionExercises.map((ex,ei)=>buildExerciseCard(ex,ei)).join('');
  const done=doneSets(),total=totalSets();
  const pct=total?Math.round(done/total*100):0;
  const isDone=allDone();
  const someStarted=done>0&&!isDone;
  return`
  <div id="workout-hdr" class="hdr" style="padding-top:48px">
    <div>
      <div class="logo">RAUTALOKI</div>
      <div id="elapsed-txt" class="hdr-sub">${A.isCustomSession?esc(A.customWorkoutName||t('custom_workout_label')):`${t('block_label')} ${(BLOCKS[A.blockIdx]||{id:'?'}).id} · ${t('home_day')} ${A.activeDayId}`} · ${fmtTime(A.elapsed)}</div>
    </div>
    <button style="background:none;border:1px solid #1c1c2e;color:#d4a846;font-weight:700;font-size:18px;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center" onclick="cancelWorkout()">✕</button>
  </div>
  <div class="page">
    <div class="progress-track"><div id="progress-fill" class="progress-fill" style="width:${pct}%"></div></div>
    ${exercisesHTML}
    <div style="height:12px"></div>
    <button id="finish-btn" class="btn-primary" onclick="finishWorkout()" ${isDone?'':'disabled'}>
      ${isDone?t('workout_finish'):`${done} / ${total} ${t('workout_sets_done')}`}
    </button>
    ${isDone?'':`<div style="text-align:center;font-size:12px;color:#9090b0;margin-top:8px">${t('workout_complete_all')}</div>`}
    ${someStarted?`<button class="btn-ghost" style="margin-top:10px;color:#9090b0;border-color:#1c1c2e" onclick="quitWithoutCompleting()">${t('workout_quit')}</button>`:''}
  </div>
  <div id="rest-bar" class="rest-bar">
    <div id="rest-time" class="rest-pulse" style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:900;color:#d4a846">${t('workout_rest')} · 1:30</div>
    <button class="btn-tiny" style="color:#d4a846;border-color:#d4a846" onclick="skipRest()">${t('workout_skip')}</button>
  </div>`;
}

function viewComplete(){
  const s=A.completedSession;
  if(!s)return viewHome();
  const vol=s.exercises.reduce((a,e)=>a+e.sets.reduce((b,st)=>b+(parseFloat(st.weight)||0)*(parseFloat(st.reps)||0),0),0);
  const curBlock=BLOCKS[A.blockIdx]||BLOCKS[0];
  const nd=curBlock?curBlock.days.find(d=>d.id===getNextDayId()):null;
  const blockSwapped=curBlock&&curBlock.id!==s.blockId;
  const swapNote=blockSwapped?`
    <div class="scard" style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:#e8c55a;margin-bottom:4px;text-transform:uppercase;letter-spacing:.1em">🔄 ${t('complete_switch')}</div>
      <div style="font-size:14px;color:#f2f0ea">${t('complete_now_starting')} <strong>${t('block_label')} ${curBlock.id} — ${t('theme_'+curBlock.theme)}</strong>.</div>
    </div>`:'';
  const dayLabel=s.dayLabel?t('day_'+s.dayLabel)||s.dayLabel:s.dayLabel;
  return`
  <div class="page">
    <div class="complete-center">
      <div class="pop-in" style="font-size:72px">🏆</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:52px;font-weight:900;color:#d4a846;margin-top:12px">${t('complete_done')}</div>
      <div style="color:#9090b0;font-size:14px;margin-top:4px">${esc(dayLabel)} · ${s.duration} ${t('complete_min')}</div>
    </div>
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val">${s.duration}m</div><div class="stat-lbl">${t('stat_duration')}</div></div>
      <div class="stat-box"><div class="stat-val">${s.exercises.length}</div><div class="stat-lbl">${t('stat_exercises')}</div></div>
      <div class="stat-box"><div class="stat-val">${vol>0?Math.round(vol/100)/10+'k':'—'}</div><div class="stat-lbl">${t('stat_volume')}</div></div>
    </div>
    ${swapNote}
    <div class="card" style="margin-bottom:16px">
      <div style="font-size:12px;color:#9090b0;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em;font-weight:700">${t('complete_up_next')}</div>
      <div style="font-weight:700;font-size:16px">${nd?nd.emoji+' '+esc(t('day_'+nd.label)||nd.label):''}</div>
      <div style="font-size:13px;color:#9090b0;margin-top:2px">${nd?esc(t('focus_'+nd.focus)||nd.focus):''}</div>
    </div>
    <button class="btn-primary" onclick="navigate('home')">${t('complete_back')}</button>
  </div>`;
}

function selectChartExercise(libId){A.chartExercise=libId;render();}
function toggleSession(i){if(A._openSessions.has(i))A._openSessions.delete(i);else A._openSessions.add(i);render();}
function viewHistory(){
  const hist=[...A.history].reverse();
  // Progress chart
  let chartSection='';
  const chartExList=getExercisesWithHistory();
  if(chartExList.length>0){
    if(!A.chartExercise||!chartExList.includes(A.chartExercise))A.chartExercise=chartExList[0];
    const pills=chartExList.map(lid=>
      `<button class="chart-pill${A.chartExercise===lid?' active':''}" onclick="selectChartExercise('${lid}')">${t(lid)}</button>`
    ).join('');
    chartSection=`<div class="card" style="margin-bottom:16px">
      <div class="sec-title" style="margin-bottom:8px">${t('chart_title')}</div>
      <div class="chart-pills">${pills}</div>
      ${renderProgressChart(A.chartExercise)}
    </div>`;
  }
  let content='';
  if(!hist.length){
    content=`<div style="color:#9090b0;text-align:center;padding-top:40px">${t('history_empty')}</div>`;
  }else{
    hist.forEach((session,si)=>{
      const vol=(session.exercises||[]).reduce((a,e)=>a+(e.sets||[]).reduce((b,st)=>b+(parseFloat(st.weight)||0)*(parseFloat(st.reps)||0),0),0);
      const ds=fmtDate(session.date);
      let exRows='';
      (session.exercises||[]).forEach(ex=>{
        const exName=ex.libId?t(ex.libId):esc(ex.name);
        const isTimed=(ex.sets||[]).some(st=>st.secs!==undefined);
        if(isTimed){
          const maxSecs=Math.max(...(ex.sets||[]).map(st=>parseInt(st.secs)||0));
          if(maxSecs>0)exRows+=`<div style="display:flex;justify-content:space-between;padding-top:5px;border-top:1px solid #1c1c2e;margin-top:5px">
            <div style="font-size:13px;color:#9090b0">${exName}</div>
            <div style="font-size:13px;font-weight:700">${maxSecs}${t('workout_sec')}</div>
          </div>`;
        }else{
          const wts=(ex.sets||[]).map(st=>parseFloat(st.weight)||0).filter(w=>w>0);
          const maxW=wts.length?Math.max(...wts):0;
          if(maxW>0)exRows+=`<div style="display:flex;justify-content:space-between;padding-top:5px;border-top:1px solid #1c1c2e;margin-top:5px">
            <div style="font-size:13px;color:#9090b0">${exName}</div>
            <div style="font-size:13px;font-weight:700">${maxW}kg</div>
          </div>`;
        }
      });
      const sessionDayLabel=session.dayLabel?t('day_'+session.dayLabel)||session.dayLabel:session.dayLabel;
      content+=`<div class="card" style="cursor:pointer" onclick="toggleSession(${si})">
        <div class="row">
          <div style="font-weight:700;font-size:15px">${esc(sessionDayLabel||'')}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="text-align:right">
              <div style="font-size:11px;color:#d4a846;font-weight:700">${ds}</div>
              ${session.blockLabel?`<div style="font-size:10px;color:#9090b0;margin-top:1px">${t('block_label')} ${session.blockId||''}</div>`:''}
            </div>
            <div style="font-size:12px;color:#9090b0;transition:transform .2s;transform:rotate(${A._openSessions&&A._openSessions.has(si)?'180':'0'}deg)">▼</div>
          </div>
        </div>
        <div style="font-size:12px;color:#9090b0;margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
          <span class="tag">${session.duration} ${t('complete_min')}</span>
          <span class="tag">${(session.exercises||[]).length} ${t('history_ex')}</span>
          ${vol>0?`<span class="tag">${Math.round(vol)}kg ${t('history_vol')}</span>`:''}
          ${session.partial?`<span class="tag" style="color:#ff4455;border:1px solid #ff445533">${t('history_partial')}</span>`:''}
        </div>
        ${A._openSessions&&A._openSessions.has(si)?`<div style="margin-top:6px">${exRows}</div>`:''}
      </div>`;
    });
  }
  return`
  <div class="hdr"><div class="logo">RAUTALOKI</div></div>
  <div class="page">
    <div class="h2">${t('history_title')}</div>
    ${chartSection}
    ${content}
  </div>
  ${navHTML("history")}`;
}

function viewProgram(){
  if(!BLOCKS.length)return`<div class="page"><div class="h2">${t('program_title')}</div><div class="sub">No program yet.</div></div>${navHTML("program")}`;
  const block=BLOCKS[A.blockIdx]||BLOCKS[0];
  const nextB=BLOCKS[(A.blockIdx+1)%BLOCKS.length];
  const stu=getSessionsUntilSwap();
  const pb=BLOCKS[A.previewBlockIdx]||BLOCKS[0];

  const tabsHTML=BLOCKS.map((b,i)=>{
    const isPreview=i===A.previewBlockIdx;
    const isActive=i===A.blockIdx;
    return`<button class="block-tab"
      style="background:${isPreview?'#d4a846':'#1c1c30'};color:${isPreview?'#080810':'#9090b0'};border-color:${isActive?'#d4a846':'transparent'}"
      onclick="setPreviewBlock(${i})">${t('block_label')} ${b.id}${isActive?' ✓':''}</button>`;
  }).join('');

  const daysHTML=pb.days.map(day=>{
    let exRows='';
    day.exercises.forEach(ex=>{
      const lw=getLastWeight(ex.id);
      const exMeta=ex.type==='time'
        ?`${ex.sets} ${t('workout_sets')} · ${ex.holdSec}${t('workout_sec')}`
        :`${ex.sets} ${t('workout_sets')} · ${ex.repRange[0]}–${ex.repRange[1]} ${t('workout_reps')}`;
      exRows+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-top:1px solid #1c1c2e">
        <div>
          <div style="font-size:13px;font-weight:600">${esc(t(ex.libId||ex.name))}<span class="mtag">${esc(t('muscle_'+ex.muscle))}</span></div>
          <div style="font-size:11px;color:#9090b0">${exMeta}</div>
        </div>
        ${lw&&ex.type!=='time'?`<div style="font-size:13px;font-weight:700;color:#d4a846">${lw}kg</div>`:''}
      </div>`;
    });
    return`<div class="card" style="margin-bottom:10px">
      <div class="row" style="margin-bottom:10px">
        <div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:20px">${day.emoji} ${esc(t('day_'+day.label))}</div>
          <div style="font-size:11px;color:#9090b0">${esc(t('focus_'+day.focus))}</div>
        </div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:900;color:#1c1c2e">${day.id}</div>
      </div>
      ${exRows}
    </div>`;
  }).join('');

  const freq=(getProfile()||{freq:3}).freq;
  return`
  <div class="hdr"><div class="logo">RAUTALOKI</div></div>
  <div class="page">
    <div class="h2">${t('program_title')}</div>
    <div class="acard" style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:#d4a846;letter-spacing:.1em;margin-bottom:6px">${freq<=3?t('program_full_body'):t('program_split')} · ${freq}${t('program_per_week')} · ${BLOCKS.length} ${t('program_blocks')}</div>
      <div style="font-size:13px;color:#9090b0;line-height:1.6">
        ${BLOCKS.length} ${t('program_desc_1')} ${sessionsPerBlock()} ${t('program_desc_2')}
        ${t('program_desc_swap')}
      </div>
    </div>
    <div class="scard" style="margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:38px;font-weight:900;color:#e8c55a;line-height:1">${stu}</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:#e8c55a">${stu!==1?t('program_sessions_until'):t('program_session_until')} ${t('block_label')} ${nextB.id}</div>
        <div style="font-size:12px;color:#9090b0;margin-top:2px">${esc(t('theme_'+nextB.theme))}</div>
      </div>
    </div>
    <div class="block-grid">${tabsHTML}</div>
    <div style="font-size:12px;color:#e8c55a;font-weight:700;margin-bottom:12px">
      ${esc(t('theme_'+pb.theme))}${A.blockIdx===A.previewBlockIdx?` · ${t('program_active')}`:''}
    </div>
    ${daysHTML}
  </div>
  ${navHTML("program")}`;
}

function viewOnboarding(){
  return`
  <div class="ob-page">
    <div class="ob-title">RAUTALOKI</div>
    <div style="font-size:14px;color:#9090b0;margin-bottom:8px">${t('ob_tagline')}</div>
    <div class="ob-sub">${t('ob_subtitle')}</div>

    <div class="ob-section">
      <div class="ob-label">${t('ob_freq')}</div>
      <div class="ob-options" id="ob-freq">
        <div class="ob-opt" data-val="1" onclick="obSelect('freq',1)"><div class="ob-opt-big">1</div><div class="ob-opt-sm">${t('ob_full_body')}</div></div>
        <div class="ob-opt" data-val="2" onclick="obSelect('freq',2)"><div class="ob-opt-big">2</div><div class="ob-opt-sm">${t('ob_full_body')}</div></div>
        <div class="ob-opt" data-val="3" onclick="obSelect('freq',3)"><div class="ob-opt-big">3</div><div class="ob-opt-sm">${t('ob_full_body')}</div></div>
        <div class="ob-opt" data-val="4" onclick="obSelect('freq',4)"><div class="ob-opt-big">4</div><div class="ob-opt-sm">${t('ob_upper_lower')}</div></div>
        <div class="ob-opt" data-val="5" onclick="obSelect('freq',5)"><div class="ob-opt-big">5</div><div class="ob-opt-sm">${t('ob_ppl')}</div></div>
      </div>
    </div>

    <div class="ob-section">
      <div class="ob-label">${t('ob_iam')}</div>
      <div class="ob-sex" id="ob-sex">
        <div class="ob-opt" data-val="male" onclick="obSelect('sex','male')"><div class="ob-emoji">🧔</div><div style="font-weight:700">${t('ob_male')}</div></div>
        <div class="ob-opt" data-val="female" onclick="obSelect('sex','female')"><div class="ob-emoji">👩</div><div style="font-weight:700">${t('ob_female')}</div></div>
      </div>
    </div>

    <button class="btn-primary ob-start" id="ob-start-btn" onclick="obFinish()" disabled>
      ${t('ob_start')}
    </button>
    <div style="font-size:11px;color:#9090b0;margin-top:12px">${t('ob_change_later')}</div>
  </div>`;
}

const _obState={freq:null,sex:null};
function obSelect(key,val){
  _obState[key]=val;
  // Update UI
  const container=document.getElementById(key==='freq'?'ob-freq':'ob-sex');
  if(container){
    container.querySelectorAll('.ob-opt').forEach(el=>{
      el.classList.toggle('selected',el.getAttribute('data-val')==String(val));
    });
  }
  // Enable start button if both selected
  const btn=document.getElementById('ob-start-btn');
  if(btn)btn.disabled=!(_obState.freq&&_obState.sex);
}
function obFinish(){
  if(!_obState.freq||!_obState.sex)return;
  saveProfile({freq:_obState.freq,sex:_obState.sex});
  reloadBlocks();
  ls.set(SK.blockIdx,0);
  A.blockIdx=0;
  A.previewBlockIdx=0;
  A.activeDayId=getNextDayId();
  navigate("home");
}
function resetProfile(){
  if(!confirm(t('confirm_reset_profile')))return;
  localStorage.removeItem("il_profile");
  localStorage.removeItem(SK.blockIdx);
  ls.set(SK.nextDay,"A");
  ls.set(SK.history,[]);
  A.history=[];
  BLOCKS=[];
  navigate("onboarding");
}

function viewSettings(){
  const s=getSettings();
  const rest=s.restSeconds!==undefined?s.restSeconds:90;
  const restEnabled=rest>0;
  const profile=getProfile();
  const restOptions=[30,45,60,90,120,150,180];

  const restBtns=restOptions.map(sec=>{
    const active=sec===rest;
    const label=sec<60?`${sec}s`:`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
    return`<button class="ob-opt${active?' selected':''}" style="min-width:52px;flex:0 0 auto;padding:10px 6px"
      onclick="setRestTimer(${sec})">${label}</button>`;
  }).join('');

  const lang=getLang();
  const langBtns=`
    <button class="ob-opt${lang==='en'?' selected':''}" style="min-width:80px;flex:0 0 auto;padding:10px 6px" onclick="setLang('en')">English</button>
    <button class="ob-opt${lang==='fi'?' selected':''}" style="min-width:80px;flex:0 0 auto;padding:10px 6px" onclick="setLang('fi')">Suomi</button>`;

  const howToUse=`
    <div class="card" style="margin-top:16px">
      <div style="font-weight:700;font-size:15px;margin-bottom:10px">${t('settings_how_to')}</div>
      <div style="font-size:13px;color:#9090b0;line-height:1.7">
        <strong style="color:#f2f0ea">${t('settings_how_1')}</strong> ${t('settings_how_1b')}<br><br>
        <strong style="color:#f2f0ea">${t('settings_how_2')}</strong> ${t('settings_how_2b')}<br><br>
        <strong style="color:#f2f0ea">${t('settings_how_3')}</strong> ${t('settings_how_3b')}<br><br>
        <strong style="color:#f2f0ea">${t('settings_how_4')}</strong> ${t('settings_how_4b')}<br><br>
        <strong style="color:#f2f0ea">${t('settings_how_5')}</strong> ${t('settings_how_5b')}<br><br>
        <strong style="color:#f2f0ea">${t('settings_how_6')}</strong> ${t('settings_how_6b')}<br><br>
        <strong style="color:#f2f0ea">${t('settings_how_7')}</strong> ${t('settings_how_7b')}
      </div>
    </div>`;

  return`
  <div class="hdr"><div class="logo">RAUTALOKI</div></div>
  <div class="page">
    <div class="h2">${t('settings_title')}</div>

    <div class="sec-title">${t('settings_language')} / Kieli</div>
    <div class="card">
      <div style="display:flex;gap:6px;flex-wrap:wrap">${langBtns}</div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px">
      <div class="sec-title" style="margin:0">${t('settings_rest')}</div>
      <label class="toggle"><input type="checkbox" ${restEnabled?'checked':''} onchange="toggleRestTimer(this.checked)"><span class="slider"></span></label>
    </div>
    <div class="card" ${restEnabled?'':`style="opacity:0.4;pointer-events:none"`}>
      <div style="font-size:13px;color:#9090b0;margin-bottom:10px">${t('settings_rest_desc')}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${restBtns}</div>
    </div>

    <div class="sec-title" style="margin-top:20px">${t('settings_setup')}</div>
    <div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:14px;font-weight:700">${profile?profile.freq:'3'}× ${t('settings_per_week')} · ${profile&&profile.sex==='female'?t('settings_female'):t('settings_male')}</div>
        <div style="font-size:12px;color:#9090b0;margin-top:2px">${profile&&profile.freq<=3?t('settings_full_body'):t('settings_split')} ${t('settings_program')}</div>
      </div>
      <button class="btn-tiny" style="color:#d4a846;border-color:#d4a846" onclick="resetProfile()">${t('settings_change')}</button>
    </div>

    ${howToUse}

    <div class="sec-title" style="margin-top:20px">${t('settings_data')}</div>
    <div class="card">
      <button class="btn-ghost" style="color:#ff4455;border-color:#ff445533;margin-bottom:8px" onclick="clearAllData()">${t('settings_reset')}</button>
      <div style="font-size:11px;color:#9090b0">${t('settings_reset_warn')}</div>
    </div>
  </div>
  ${navHTML("settings")}`;
}

function setRestTimer(sec){
  saveSetting('restSeconds',sec);
  render();
}
function toggleRestTimer(on){
  if(on){
    const s=getSettings();
    const prev=s._lastRestSeconds||90;
    saveSetting('restSeconds',prev);
  }else{
    const s=getSettings();
    if(s.restSeconds>0)saveSetting('_lastRestSeconds',s.restSeconds);
    saveSetting('restSeconds',0);
  }
  render();
}

function clearAllData(){
  if(!confirm(t('confirm_clear_1')))return;
  if(!confirm(t('confirm_clear_2')))return;
  localStorage.removeItem(SK.weights);
  localStorage.removeItem(SK.history);
  localStorage.removeItem(SK.nextDay);
  localStorage.removeItem(SK.blockStart);
  localStorage.removeItem(SK.blockIdx);
  localStorage.removeItem("il_settings");
  localStorage.removeItem("il_profile");
  A.history=[];
  BLOCKS=[];
  navigate("onboarding");
}

function navHTML(active){
  const items=[
    {id:"home",icon:"🏠",labelKey:"nav_home"},
    {id:"custom",icon:"✏️",labelKey:"nav_custom"},
    {id:"history",icon:"📋",labelKey:"nav_log"},
    {id:"program",icon:"📅",labelKey:"nav_program"},
    {id:"settings",icon:"⚙️",labelKey:"nav_settings"},
  ];
  return`<nav class="nav">${items.map(it=>`
    <button class="nav-btn${active===it.id?' active':''}" onclick="navigate('${it.id}')">
      ${it.icon}<span>${t(it.labelKey)}</span>
    </button>`).join('')}</nav>`;
}
