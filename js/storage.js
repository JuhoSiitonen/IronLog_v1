// ═══════════════════════════════════════════════════════════════════
// STORAGE (must be first — everything else depends on ls)
// ═══════════════════════════════════════════════════════════════════
const SK={weights:"il_weights",history:"il_history",nextDay:"il_nextDay",blockStart:"il_blockStart",blockIdx:"il_blockIdx",savedWorkouts:"il_saved_workouts",customProgram:"il_custom_program"};
const ls={
  get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
};

// ═══════════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════════
function getProfile(){return ls.get("il_profile")||null;}
function saveProfile(p){ls.set("il_profile",p);}
function getSettings(){return ls.get("il_settings")||{restSeconds:90};}
function saveSetting(key,val){const s=getSettings();s[key]=val;ls.set("il_settings",s);}
function getRestDuration(){const s=getSettings();return s.restSeconds!==undefined?s.restSeconds:90;}
function getSavedWorkouts(){return ls.get(SK.savedWorkouts)||[];}
function getCustomProgram(){return ls.get(SK.customProgram)||null;}
function saveCustomProgramToLS(prog){ls.set(SK.customProgram,prog);}
