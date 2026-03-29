// ═══════════════════════════════════════════════════════════════════
// PROGRAM GENERATOR — builds blocks based on profile (freq + sex)
// ═══════════════════════════════════════════════════════════════════

// Helper: pick from library by id
function _libFind(id){
  for(const g of Object.values(LIBRARY)){const x=g.find(e=>e.id===id);if(x)return x;}
  return null;
}
// Auto-detect muscle group from library
function _muscleOf(libId){
  for(const[g,arr]of Object.entries(LIBRARY)){if(arr.find(e=>e.id===libId))return g;}
  return"";
}
// Build exercise entry: Ex(blockNumber, libraryId, optionalOverrides)
function Ex(bn,libId,ov){
  const base=_libFind(libId);if(!base)return null;
  const o=ov||{};
  return{id:`b${bn}_${libId.replace('lib_','')}`,libId:libId,name:base.name,muscle:_muscleOf(libId),
    sets:o.sets!==undefined?o.sets:base.sets,repRange:o.repRange||base.repRange,cues:o.cues||base.cues,ms:base.ms||null};
}

function generateBlocks(profile){
  const f=profile.freq;  // 2-5
  const isFemale=profile.sex==="female";

  if(f===2) return gen2Day(isFemale);
  if(f===3) return gen3Day(isFemale);
  if(f===4) return gen4Day(isFemale);
  return gen5Day(isFemale);
}

function gen2Day(fem){
  // 2 days/week: Full Body A & B, higher volume per session, 4 blocks
  const blocks=[];
  const themes=["Barbell Compounds","Dumbbell & Machine","Strength Focus","Volume & Isolation"];
  const dayLabels=[{id:"A",label:"Full Body A",emoji:"💪"},{id:"B",label:"Full Body B",emoji:"⚡"}];

  // Block 1: Barbell Compounds
  blocks.push({id:1,label:"Block 1",theme:themes[0],days:[
    {id:"A",label:"Full Body A",focus:"Squat · Push · Pull · Arms",emoji:"💪",exercises:fem?[
      Ex(1,"lib_squat"),Ex(1,"lib_hip_thrust",{sets:4}),Ex(1,"lib_bench",{sets:3}),Ex(1,"lib_cable_row",{sets:4}),
      Ex(1,"lib_rdl"),Ex(1,"lib_lat_pull"),Ex(1,"lib_lat_raise"),Ex(1,"lib_abduction"),Ex(1,"lib_bb_curl")
    ]:[
      Ex(1,"lib_squat"),Ex(1,"lib_bench"),Ex(1,"lib_cable_row",{sets:4}),Ex(1,"lib_incline_db"),
      Ex(1,"lib_lat_pull"),Ex(1,"lib_rdl"),Ex(1,"lib_lat_raise"),Ex(1,"lib_bb_curl"),Ex(1,"lib_skull")
    ]},
    {id:"B",label:"Full Body B",focus:"Hinge · Press · Row · Glutes",emoji:"⚡",exercises:fem?[
      Ex(1,"lib_deadlift"),Ex(1,"lib_leg_press"),Ex(1,"lib_db_ohp"),Ex(1,"lib_db_row",{sets:4}),
      Ex(1,"lib_leg_curl"),Ex(1,"lib_cable_fly"),Ex(1,"lib_glute_bridge"),Ex(1,"lib_face_pull"),Ex(1,"lib_standing_calf")
    ]:[
      Ex(1,"lib_deadlift"),Ex(1,"lib_ohp"),Ex(1,"lib_db_row",{sets:4}),Ex(1,"lib_leg_press"),
      Ex(1,"lib_cable_fly"),Ex(1,"lib_face_pull"),Ex(1,"lib_skull"),Ex(1,"lib_hammer"),Ex(1,"lib_standing_calf")
    ]}
  ]});

  // Block 2: Dumbbell & Machine
  blocks.push({id:2,label:"Block 2",theme:themes[1],days:[
    {id:"A",label:"Full Body A",focus:"Machine Legs · DB Push · Pull",emoji:"💪",exercises:fem?[
      Ex(2,"lib_hack_squat"),Ex(2,"lib_hip_thrust",{sets:4}),Ex(2,"lib_db_bench"),Ex(2,"lib_chest_row",{sets:4}),
      Ex(2,"lib_seated_curl"),Ex(2,"lib_pec_deck"),Ex(2,"lib_cable_raise"),Ex(2,"lib_cable_kickback"),Ex(2,"lib_seated_calf")
    ]:[
      Ex(2,"lib_hack_squat"),Ex(2,"lib_db_bench"),Ex(2,"lib_chest_row",{sets:4}),Ex(2,"lib_pec_deck"),
      Ex(2,"lib_pullover_cable"),Ex(2,"lib_seated_curl"),Ex(2,"lib_cable_raise"),Ex(2,"lib_incline_curl"),Ex(2,"lib_pushdown")
    ]},
    {id:"B",label:"Full Body B",focus:"Hinge · Shoulders · Back · Iso",emoji:"⚡",exercises:fem?[
      Ex(2,"lib_trap_dl"),Ex(2,"lib_leg_press"),Ex(2,"lib_db_ohp"),Ex(2,"lib_sa_cable_row",{sets:4}),
      Ex(2,"lib_leg_ext"),Ex(2,"lib_db_pullover"),Ex(2,"lib_rear_delt"),Ex(2,"lib_abduction"),Ex(2,"lib_leg_press_calf")
    ]:[
      Ex(2,"lib_trap_dl"),Ex(2,"lib_db_ohp"),Ex(2,"lib_sa_cable_row",{sets:4}),Ex(2,"lib_leg_press"),
      Ex(2,"lib_db_pullover"),Ex(2,"lib_rear_delt"),Ex(2,"lib_pushdown"),Ex(2,"lib_spider_curl"),Ex(2,"lib_seated_calf")
    ]}
  ]});

  // Block 3: Strength
  blocks.push({id:3,label:"Block 3",theme:themes[2],days:[
    {id:"A",label:"Full Body A",focus:"Heavy Squat · Bench · Row",emoji:"💪",exercises:fem?[
      Ex(3,"lib_squat",{sets:4,repRange:[4,8]}),Ex(3,"lib_hip_thrust",{sets:4,repRange:[6,10]}),Ex(3,"lib_bench",{sets:4,repRange:[6,8]}),
      Ex(3,"lib_bb_row",{sets:4,repRange:[6,8]}),Ex(3,"lib_leg_curl"),Ex(3,"lib_lat_raise"),Ex(3,"lib_cable_kickback"),Ex(3,"lib_standing_calf",{sets:4})
    ]:[
      Ex(3,"lib_squat",{sets:5,repRange:[4,6]}),Ex(3,"lib_bench",{sets:5,repRange:[4,6]}),Ex(3,"lib_bb_row",{sets:4,repRange:[6,8]}),
      Ex(3,"lib_dips",{sets:3,repRange:[6,10]}),Ex(3,"lib_pullup"),Ex(3,"lib_lat_raise"),Ex(3,"lib_cable_curl"),Ex(3,"lib_standing_calf",{sets:4})
    ]},
    {id:"B",label:"Full Body B",focus:"Heavy Hinge · OHP · Pull",emoji:"⚡",exercises:fem?[
      Ex(3,"lib_deadlift",{sets:4,repRange:[3,6]}),Ex(3,"lib_leg_press",{sets:3,repRange:[8,12]}),Ex(3,"lib_db_ohp",{sets:4}),
      Ex(3,"lib_chest_row",{sets:4}),Ex(3,"lib_leg_ext"),Ex(3,"lib_face_pull"),Ex(3,"lib_abduction"),Ex(3,"lib_seated_calf",{sets:4})
    ]:[
      Ex(3,"lib_deadlift",{sets:5,repRange:[3,5]}),Ex(3,"lib_ohp",{sets:5,repRange:[4,6]}),Ex(3,"lib_tbar_row",{sets:4,repRange:[6,8]}),
      Ex(3,"lib_leg_press",{sets:3,repRange:[8,12]}),Ex(3,"lib_incline_db"),Ex(3,"lib_face_pull"),Ex(3,"lib_close_bench"),Ex(3,"lib_hammer")
    ]}
  ]});

  // Block 4: Volume
  blocks.push({id:4,label:"Block 4",theme:themes[3],days:[
    {id:"A",label:"Full Body A",focus:"High-Rep Legs · Push · Pull",emoji:"💪",exercises:fem?[
      Ex(4,"lib_goblet_squat"),Ex(4,"lib_hip_thrust",{sets:4,repRange:[12,15]}),Ex(4,"lib_db_bench",{sets:3,repRange:[12,15]}),
      Ex(4,"lib_cable_row",{sets:4,repRange:[12,15]}),Ex(4,"lib_leg_ext",{sets:4}),Ex(4,"lib_arnold_press"),Ex(4,"lib_cable_kickback"),Ex(4,"lib_leg_press_calf")
    ]:[
      Ex(4,"lib_goblet_squat"),Ex(4,"lib_db_bench",{sets:4,repRange:[10,15]}),Ex(4,"lib_cable_row",{sets:4,repRange:[10,15]}),
      Ex(4,"lib_cable_fly"),Ex(4,"lib_lat_pull",{repRange:[12,15]}),Ex(4,"lib_arnold_press"),Ex(4,"lib_conc_curl"),Ex(4,"lib_overhead_tri")
    ]},
    {id:"B",label:"Full Body B",focus:"High-Rep Hinge · Shoulders · Arms",emoji:"⚡",exercises:fem?[
      Ex(4,"lib_rdl",{sets:4,repRange:[10,15]}),Ex(4,"lib_leg_press",{repRange:[15,20]}),Ex(4,"lib_db_ohp",{repRange:[10,15]}),
      Ex(4,"lib_db_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_seated_curl"),Ex(4,"lib_cable_raise",{sets:4}),Ex(4,"lib_glute_bridge"),Ex(4,"lib_seated_calf",{sets:4})
    ]:[
      Ex(4,"lib_rdl",{sets:4,repRange:[10,15]}),Ex(4,"lib_db_ohp",{repRange:[10,15]}),Ex(4,"lib_db_row",{sets:4,repRange:[10,15]}),
      Ex(4,"lib_leg_press",{repRange:[15,20]}),Ex(4,"lib_pec_deck"),Ex(4,"lib_cable_raise",{sets:4}),Ex(4,"lib_reverse_curl"),Ex(4,"lib_overhead_tri")
    ]}
  ]});

  return blocks;
}

function gen3Day(fem){
  // 3 days/week: Full Body A/B/C — the classic layout
  const blocks=[];

  // Block 1: Barbell Compounds
  blocks.push({id:1,label:"Block 1",theme:"Barbell Compounds",days:[
    {id:"A",label:"Full Body A",focus:"Squat · Push · Pull",emoji:"💪",exercises:fem?[
      Ex(1,"lib_squat"),Ex(1,"lib_hip_thrust",{sets:4}),Ex(1,"lib_bench",{sets:3}),Ex(1,"lib_cable_row",{sets:4}),
      Ex(1,"lib_lat_pull"),Ex(1,"lib_lat_raise"),Ex(1,"lib_bb_curl")
    ]:[
      Ex(1,"lib_squat"),Ex(1,"lib_bench"),Ex(1,"lib_cable_row",{sets:4}),Ex(1,"lib_incline_db"),
      Ex(1,"lib_lat_pull"),Ex(1,"lib_lat_raise"),Ex(1,"lib_bb_curl")
    ]},
    {id:"B",label:"Full Body B",focus:"Hinge · Vertical Push · Triceps",emoji:"⚡",exercises:fem?[
      Ex(1,"lib_deadlift"),Ex(1,"lib_ohp",{sets:3}),Ex(1,"lib_db_row",{sets:4}),Ex(1,"lib_leg_press"),
      Ex(1,"lib_cable_fly",{sets:3}),Ex(1,"lib_face_pull"),Ex(1,"lib_cable_kickback")
    ]:[
      Ex(1,"lib_deadlift"),Ex(1,"lib_ohp"),Ex(1,"lib_db_row",{sets:4}),Ex(1,"lib_leg_press"),
      Ex(1,"lib_cable_fly"),Ex(1,"lib_face_pull"),Ex(1,"lib_skull")
    ]},
    {id:"C",label:"Full Body C",focus:"Unilateral · Arms · Glutes",emoji:"🔱",exercises:fem?[
      Ex(1,"lib_split_squat"),Ex(1,"lib_rdl"),Ex(1,"lib_leg_curl"),Ex(1,"lib_leg_ext"),
      Ex(1,"lib_glute_bridge"),Ex(1,"lib_abduction"),Ex(1,"lib_standing_calf",{sets:4})
    ]:[
      Ex(1,"lib_split_squat"),Ex(1,"lib_rdl"),Ex(1,"lib_leg_curl"),Ex(1,"lib_leg_ext"),
      Ex(1,"lib_hammer"),Ex(1,"lib_hip_thrust"),Ex(1,"lib_standing_calf",{sets:4})
    ]}
  ]});

  // Block 2: Dumbbell & Machine
  blocks.push({id:2,label:"Block 2",theme:"Dumbbell & Machine",days:[
    {id:"A",label:"Full Body A",focus:"Squat · Push · Pull",emoji:"💪",exercises:fem?[
      Ex(2,"lib_hack_squat"),Ex(2,"lib_hip_thrust",{sets:4}),Ex(2,"lib_db_bench",{sets:3}),Ex(2,"lib_chest_row",{sets:4}),
      Ex(2,"lib_pullover_cable"),Ex(2,"lib_cable_raise"),Ex(2,"lib_incline_curl")
    ]:[
      Ex(2,"lib_hack_squat"),Ex(2,"lib_db_bench"),Ex(2,"lib_chest_row",{sets:4}),Ex(2,"lib_pec_deck"),
      Ex(2,"lib_pullover_cable"),Ex(2,"lib_cable_raise"),Ex(2,"lib_incline_curl")
    ]},
    {id:"B",label:"Full Body B",focus:"Hinge · Vertical Push · Triceps",emoji:"⚡",exercises:fem?[
      Ex(2,"lib_trap_dl"),Ex(2,"lib_db_ohp"),Ex(2,"lib_sa_cable_row",{sets:4}),Ex(2,"lib_leg_press_n"),
      Ex(2,"lib_db_pullover"),Ex(2,"lib_rear_delt"),Ex(2,"lib_cable_kickback")
    ]:[
      Ex(2,"lib_trap_dl"),Ex(2,"lib_db_ohp"),Ex(2,"lib_sa_cable_row",{sets:4}),Ex(2,"lib_leg_press_n"),
      Ex(2,"lib_db_pullover"),Ex(2,"lib_rear_delt"),Ex(2,"lib_pushdown")
    ]},
    {id:"C",label:"Full Body C",focus:"Unilateral · Arms · Glutes",emoji:"🔱",exercises:fem?[
      Ex(2,"lib_lunge"),Ex(2,"lib_nordic"),Ex(2,"lib_seated_curl"),Ex(2,"lib_leg_ext"),
      Ex(2,"lib_glute_bridge"),Ex(2,"lib_abduction"),Ex(2,"lib_seated_calf",{sets:4})
    ]:[
      Ex(2,"lib_lunge"),Ex(2,"lib_nordic"),Ex(2,"lib_seated_curl"),Ex(2,"lib_leg_ext"),
      Ex(2,"lib_spider_curl"),Ex(2,"lib_glute_bridge"),Ex(2,"lib_seated_calf",{sets:4})
    ]}
  ]});

  // Block 3: Power & Strength
  blocks.push({id:3,label:"Block 3",theme:"Power & Strength",days:[
    {id:"A",label:"Full Body A",focus:"Heavy Squat · Push · Pull",emoji:"💪",exercises:fem?[
      Ex(3,"lib_squat",{sets:4,repRange:[4,8]}),Ex(3,"lib_hip_thrust",{sets:4,repRange:[6,10]}),Ex(3,"lib_bench",{sets:4,repRange:[6,8]}),
      Ex(3,"lib_bb_row",{sets:4,repRange:[6,8]}),Ex(3,"lib_lat_pull"),Ex(3,"lib_lat_raise"),Ex(3,"lib_cable_curl")
    ]:[
      Ex(3,"lib_squat",{sets:5,repRange:[4,6]}),Ex(3,"lib_bench",{sets:5,repRange:[4,6]}),Ex(3,"lib_bb_row",{sets:4,repRange:[6,8]}),
      Ex(3,"lib_dips",{repRange:[6,10]}),Ex(3,"lib_pullup"),Ex(3,"lib_lat_raise"),Ex(3,"lib_cable_curl")
    ]},
    {id:"B",label:"Full Body B",focus:"Heavy Hinge · OHP · Row",emoji:"⚡",exercises:fem?[
      Ex(3,"lib_deadlift",{sets:4,repRange:[3,6]}),Ex(3,"lib_db_ohp",{sets:4}),Ex(3,"lib_tbar_row",{sets:4,repRange:[6,8]}),
      Ex(3,"lib_leg_press"),Ex(3,"lib_cable_fly"),Ex(3,"lib_face_pull"),Ex(3,"lib_cable_kickback")
    ]:[
      Ex(3,"lib_deadlift",{sets:5,repRange:[3,5]}),Ex(3,"lib_ohp",{sets:5,repRange:[4,6]}),Ex(3,"lib_tbar_row",{sets:4,repRange:[6,8]}),
      Ex(3,"lib_leg_press"),Ex(3,"lib_incline_db",{repRange:[8,10]}),Ex(3,"lib_face_pull"),Ex(3,"lib_close_bench")
    ]},
    {id:"C",label:"Full Body C",focus:"Unilateral · Strength · Glutes",emoji:"🔱",exercises:fem?[
      Ex(3,"lib_split_squat",{sets:4,repRange:[6,10]}),Ex(3,"lib_sumo_dl",{sets:4}),Ex(3,"lib_leg_curl"),
      Ex(3,"lib_step_up"),Ex(3,"lib_hip_thrust",{sets:4,repRange:[8,12]}),Ex(3,"lib_abduction"),Ex(3,"lib_standing_calf",{sets:4})
    ]:[
      Ex(3,"lib_split_squat",{sets:4,repRange:[6,10]}),Ex(3,"lib_sumo_dl",{sets:4}),Ex(3,"lib_leg_curl"),
      Ex(3,"lib_step_up"),Ex(3,"lib_hammer",{repRange:[8,12]}),Ex(3,"lib_hip_thrust",{sets:4}),Ex(3,"lib_standing_calf",{sets:4})
    ]}
  ]});

  // Block 4: Isolation & Volume
  blocks.push({id:4,label:"Block 4",theme:"Isolation & Volume",days:[
    {id:"A",label:"Full Body A",focus:"High-Rep Squat · Push · Pull",emoji:"💪",exercises:fem?[
      Ex(4,"lib_goblet_squat"),Ex(4,"lib_hip_thrust",{sets:4,repRange:[12,15]}),Ex(4,"lib_db_bench",{sets:3,repRange:[10,15]}),
      Ex(4,"lib_cable_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_lat_pull",{repRange:[12,15]}),Ex(4,"lib_arnold_press"),Ex(4,"lib_cable_kickback")
    ]:[
      Ex(4,"lib_goblet_squat"),Ex(4,"lib_db_bench",{repRange:[10,15]}),Ex(4,"lib_cable_row",{sets:4,repRange:[10,15]}),
      Ex(4,"lib_cable_fly"),Ex(4,"lib_lat_pull",{repRange:[12,15]}),Ex(4,"lib_arnold_press"),Ex(4,"lib_conc_curl")
    ]},
    {id:"B",label:"Full Body B",focus:"High-Rep Hinge · Shoulders · Arms",emoji:"⚡",exercises:fem?[
      Ex(4,"lib_rdl",{sets:4,repRange:[10,15]}),Ex(4,"lib_leg_press",{repRange:[15,20]}),Ex(4,"lib_db_ohp",{repRange:[10,15]}),
      Ex(4,"lib_db_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_cable_raise",{sets:4}),Ex(4,"lib_glute_bridge",{repRange:[15,20]}),Ex(4,"lib_seated_calf",{sets:4})
    ]:[
      Ex(4,"lib_rdl",{sets:4,repRange:[10,15]}),Ex(4,"lib_db_ohp",{repRange:[10,15]}),Ex(4,"lib_db_row",{sets:4,repRange:[10,15]}),
      Ex(4,"lib_leg_press",{repRange:[15,20]}),Ex(4,"lib_pec_deck"),Ex(4,"lib_cable_raise",{sets:4}),Ex(4,"lib_overhead_tri")
    ]},
    {id:"C",label:"Full Body C",focus:"Unilateral · Pump · Glutes",emoji:"🔱",exercises:fem?[
      Ex(4,"lib_lunge",{repRange:[12,16]}),Ex(4,"lib_good_morning"),Ex(4,"lib_seated_curl",{sets:4}),Ex(4,"lib_leg_ext",{sets:4,repRange:[15,20]}),
      Ex(4,"lib_abduction"),Ex(4,"lib_cable_kickback"),Ex(4,"lib_seated_calf",{sets:4})
    ]:[
      Ex(4,"lib_lunge",{repRange:[12,16]}),Ex(4,"lib_good_morning"),Ex(4,"lib_seated_curl",{sets:4}),Ex(4,"lib_leg_ext",{sets:4,repRange:[15,20]}),
      Ex(4,"lib_reverse_curl"),Ex(4,"lib_hip_thrust"),Ex(4,"lib_seated_calf",{sets:4})
    ]}
  ]});

  // Block 5: Cable & Unilateral
  blocks.push({id:5,label:"Block 5",theme:"Cable & Unilateral",days:[
    {id:"A",label:"Full Body A",focus:"Unilateral Squat · Cable Push/Pull",emoji:"💪",exercises:fem?[
      Ex(5,"lib_split_squat",{sets:4}),Ex(5,"lib_hip_thrust",{sets:4}),Ex(5,"lib_cable_fly",{sets:4}),Ex(5,"lib_sa_cable_row",{sets:4}),
      Ex(5,"lib_pullover_cable"),Ex(5,"lib_cable_raise",{sets:4}),Ex(5,"lib_cable_kickback")
    ]:[
      Ex(5,"lib_split_squat",{sets:4}),Ex(5,"lib_cable_fly",{sets:4}),Ex(5,"lib_sa_cable_row",{sets:4}),
      Ex(5,"lib_low_cable_fly"),Ex(5,"lib_pullover_cable"),Ex(5,"lib_cable_raise",{sets:4}),Ex(5,"lib_cable_curl")
    ]},
    {id:"B",label:"Full Body B",focus:"Hinge · Press · Row · Triceps",emoji:"⚡",exercises:fem?[
      Ex(5,"lib_rdl",{sets:4}),Ex(5,"lib_leg_press"),Ex(5,"lib_db_ohp"),Ex(5,"lib_tbar_row",{sets:4}),
      Ex(5,"lib_db_pullover"),Ex(5,"lib_face_pull"),Ex(5,"lib_abduction")
    ]:[
      Ex(5,"lib_rdl",{sets:4}),Ex(5,"lib_db_ohp"),Ex(5,"lib_tbar_row",{sets:4}),Ex(5,"lib_leg_press"),
      Ex(5,"lib_db_pullover"),Ex(5,"lib_face_pull"),Ex(5,"lib_pushdown")
    ]},
    {id:"C",label:"Full Body C",focus:"Unilateral · Pump · Calves",emoji:"🔱",exercises:fem?[
      Ex(5,"lib_step_up"),Ex(5,"lib_good_morning"),Ex(5,"lib_leg_curl"),Ex(5,"lib_leg_ext"),
      Ex(5,"lib_glute_bridge"),Ex(5,"lib_cable_kickback"),Ex(5,"lib_leg_press_calf")
    ]:[
      Ex(5,"lib_step_up"),Ex(5,"lib_good_morning"),Ex(5,"lib_leg_curl"),Ex(5,"lib_leg_ext"),
      Ex(5,"lib_spider_curl"),Ex(5,"lib_hip_thrust"),Ex(5,"lib_leg_press_calf")
    ]}
  ]});

  // Block 6: Hybrid Strength–Hypertrophy
  blocks.push({id:6,label:"Block 6",theme:"Hybrid Strength–Hypertrophy",days:[
    {id:"A",label:"Full Body A",focus:"Squat · Push · Pull",emoji:"💪",exercises:fem?[
      Ex(6,"lib_squat",{sets:4,repRange:[6,10]}),Ex(6,"lib_hip_thrust",{sets:4,repRange:[8,12]}),Ex(6,"lib_incline_db",{sets:3}),
      Ex(6,"lib_bb_row",{sets:4,repRange:[6,10]}),Ex(6,"lib_pec_deck"),Ex(6,"lib_arnold_press"),Ex(6,"lib_hammer")
    ]:[
      Ex(6,"lib_squat",{sets:4,repRange:[6,10]}),Ex(6,"lib_incline_db"),Ex(6,"lib_bb_row",{sets:4,repRange:[6,10]}),
      Ex(6,"lib_pec_deck"),Ex(6,"lib_pullup"),Ex(6,"lib_arnold_press"),Ex(6,"lib_hammer")
    ]},
    {id:"B",label:"Full Body B",focus:"Hinge · OHP · Row · Triceps",emoji:"⚡",exercises:fem?[
      Ex(6,"lib_deadlift",{sets:4,repRange:[4,6]}),Ex(6,"lib_leg_press"),Ex(6,"lib_ohp",{sets:3}),
      Ex(6,"lib_chest_row",{sets:4}),Ex(6,"lib_cable_fly"),Ex(6,"lib_upright_row"),Ex(6,"lib_cable_kickback")
    ]:[
      Ex(6,"lib_deadlift",{sets:4,repRange:[4,6]}),Ex(6,"lib_ohp",{sets:4,repRange:[6,10]}),Ex(6,"lib_chest_row",{sets:4}),
      Ex(6,"lib_hack_squat"),Ex(6,"lib_cable_fly"),Ex(6,"lib_upright_row"),Ex(6,"lib_dips_tri")
    ]},
    {id:"C",label:"Full Body C",focus:"Unilateral · Strength · Glutes",emoji:"🔱",exercises:fem?[
      Ex(6,"lib_split_squat",{sets:4,repRange:[6,10]}),Ex(6,"lib_sumo_dl"),Ex(6,"lib_nordic"),Ex(6,"lib_leg_ext"),
      Ex(6,"lib_hip_thrust",{sets:4}),Ex(6,"lib_abduction"),Ex(6,"lib_standing_calf",{sets:4})
    ]:[
      Ex(6,"lib_split_squat",{sets:4,repRange:[6,10]}),Ex(6,"lib_sumo_dl"),Ex(6,"lib_nordic"),Ex(6,"lib_leg_ext"),
      Ex(6,"lib_conc_curl"),Ex(6,"lib_hip_thrust",{sets:4}),Ex(6,"lib_standing_calf",{sets:4})
    ]}
  ]});

  return blocks;
}

function gen4Day(fem){
  // 4 days/week: Upper/Lower split, 4 blocks
  const blocks=[];

  // Block 1
  blocks.push({id:1,label:"Block 1",theme:"Barbell Compounds",days:[
    {id:"A",label:"Upper A",focus:"Horizontal Push/Pull",emoji:"💪",exercises:fem?[
      Ex(1,"lib_bench",{sets:3}),Ex(1,"lib_cable_row",{sets:4}),Ex(1,"lib_incline_db",{sets:3}),
      Ex(1,"lib_lat_pull"),Ex(1,"lib_lat_raise"),Ex(1,"lib_face_pull"),Ex(1,"lib_bb_curl")
    ]:[
      Ex(1,"lib_bench"),Ex(1,"lib_cable_row",{sets:4}),Ex(1,"lib_incline_db"),
      Ex(1,"lib_lat_pull"),Ex(1,"lib_lat_raise"),Ex(1,"lib_bb_curl"),Ex(1,"lib_skull")
    ]},
    {id:"B",label:"Lower A",focus:"Squat · Glutes · Hamstrings",emoji:"🦵",exercises:fem?[
      Ex(1,"lib_squat"),Ex(1,"lib_hip_thrust",{sets:4}),Ex(1,"lib_rdl"),Ex(1,"lib_leg_ext"),
      Ex(1,"lib_leg_curl"),Ex(1,"lib_abduction"),Ex(1,"lib_standing_calf",{sets:4})
    ]:[
      Ex(1,"lib_squat"),Ex(1,"lib_rdl"),Ex(1,"lib_leg_press"),Ex(1,"lib_leg_ext"),
      Ex(1,"lib_leg_curl"),Ex(1,"lib_hip_thrust"),Ex(1,"lib_standing_calf",{sets:4})
    ]},
    {id:"C",label:"Upper B",focus:"Vertical Push/Pull · Arms",emoji:"⚡",exercises:fem?[
      Ex(1,"lib_ohp",{sets:3}),Ex(1,"lib_db_row",{sets:4}),Ex(1,"lib_cable_fly"),
      Ex(1,"lib_pullover_cable"),Ex(1,"lib_rear_delt"),Ex(1,"lib_hammer"),Ex(1,"lib_pushdown")
    ]:[
      Ex(1,"lib_ohp"),Ex(1,"lib_db_row",{sets:4}),Ex(1,"lib_cable_fly"),
      Ex(1,"lib_pullover_cable"),Ex(1,"lib_rear_delt"),Ex(1,"lib_hammer"),Ex(1,"lib_pushdown")
    ]},
    {id:"D",label:"Lower B",focus:"Hinge · Unilateral · Calves",emoji:"🔱",exercises:fem?[
      Ex(1,"lib_deadlift"),Ex(1,"lib_split_squat"),Ex(1,"lib_glute_bridge"),Ex(1,"lib_seated_curl"),
      Ex(1,"lib_step_up"),Ex(1,"lib_cable_kickback"),Ex(1,"lib_seated_calf",{sets:4})
    ]:[
      Ex(1,"lib_deadlift"),Ex(1,"lib_split_squat"),Ex(1,"lib_leg_press"),Ex(1,"lib_seated_curl"),
      Ex(1,"lib_step_up"),Ex(1,"lib_hip_thrust"),Ex(1,"lib_seated_calf",{sets:4})
    ]}
  ]});

  // Block 2
  blocks.push({id:2,label:"Block 2",theme:"Dumbbell & Machine",days:[
    {id:"A",label:"Upper A",focus:"DB Press · Machine Row",emoji:"💪",exercises:fem?[
      Ex(2,"lib_db_bench"),Ex(2,"lib_chest_row",{sets:4}),Ex(2,"lib_pec_deck"),
      Ex(2,"lib_lat_pull"),Ex(2,"lib_cable_raise"),Ex(2,"lib_rear_delt"),Ex(2,"lib_incline_curl")
    ]:[
      Ex(2,"lib_db_bench"),Ex(2,"lib_chest_row",{sets:4}),Ex(2,"lib_pec_deck"),
      Ex(2,"lib_lat_pull"),Ex(2,"lib_cable_raise"),Ex(2,"lib_incline_curl"),Ex(2,"lib_pushdown")
    ]},
    {id:"B",label:"Lower A",focus:"Machine Squat · Glutes",emoji:"🦵",exercises:fem?[
      Ex(2,"lib_hack_squat"),Ex(2,"lib_hip_thrust",{sets:4}),Ex(2,"lib_leg_curl"),Ex(2,"lib_leg_ext"),
      Ex(2,"lib_lunge"),Ex(2,"lib_abduction"),Ex(2,"lib_leg_press_calf")
    ]:[
      Ex(2,"lib_hack_squat"),Ex(2,"lib_leg_press"),Ex(2,"lib_leg_curl"),Ex(2,"lib_leg_ext"),
      Ex(2,"lib_lunge"),Ex(2,"lib_hip_thrust"),Ex(2,"lib_leg_press_calf")
    ]},
    {id:"C",label:"Upper B",focus:"DB Shoulders · Cable Work",emoji:"⚡",exercises:fem?[
      Ex(2,"lib_db_ohp"),Ex(2,"lib_sa_cable_row",{sets:4}),Ex(2,"lib_cable_fly"),
      Ex(2,"lib_db_pullover"),Ex(2,"lib_face_pull"),Ex(2,"lib_spider_curl"),Ex(2,"lib_overhead_tri")
    ]:[
      Ex(2,"lib_db_ohp"),Ex(2,"lib_sa_cable_row",{sets:4}),Ex(2,"lib_cable_fly"),
      Ex(2,"lib_db_pullover"),Ex(2,"lib_face_pull"),Ex(2,"lib_spider_curl"),Ex(2,"lib_overhead_tri")
    ]},
    {id:"D",label:"Lower B",focus:"Hinge · Unilateral",emoji:"🔱",exercises:fem?[
      Ex(2,"lib_trap_dl"),Ex(2,"lib_split_squat"),Ex(2,"lib_glute_bridge"),Ex(2,"lib_seated_curl"),
      Ex(2,"lib_nordic"),Ex(2,"lib_cable_kickback"),Ex(2,"lib_seated_calf",{sets:4})
    ]:[
      Ex(2,"lib_trap_dl"),Ex(2,"lib_split_squat"),Ex(2,"lib_leg_press_n"),Ex(2,"lib_seated_curl"),
      Ex(2,"lib_nordic"),Ex(2,"lib_good_morning"),Ex(2,"lib_seated_calf",{sets:4})
    ]}
  ]});

  // Block 3: Strength
  blocks.push({id:3,label:"Block 3",theme:"Strength Focus",days:[
    {id:"A",label:"Upper A",focus:"Heavy Bench · Row",emoji:"💪",exercises:fem?[
      Ex(3,"lib_bench",{sets:4,repRange:[6,8]}),Ex(3,"lib_bb_row",{sets:4,repRange:[6,8]}),Ex(3,"lib_incline_db"),
      Ex(3,"lib_lat_pull"),Ex(3,"lib_lat_raise"),Ex(3,"lib_face_pull"),Ex(3,"lib_cable_curl")
    ]:[
      Ex(3,"lib_bench",{sets:5,repRange:[4,6]}),Ex(3,"lib_bb_row",{sets:4,repRange:[6,8]}),Ex(3,"lib_dips",{repRange:[6,10]}),
      Ex(3,"lib_pullup"),Ex(3,"lib_lat_raise"),Ex(3,"lib_cable_curl"),Ex(3,"lib_close_bench")
    ]},
    {id:"B",label:"Lower A",focus:"Heavy Squat · Glutes",emoji:"🦵",exercises:fem?[
      Ex(3,"lib_squat",{sets:4,repRange:[4,8]}),Ex(3,"lib_hip_thrust",{sets:4,repRange:[6,10]}),Ex(3,"lib_leg_press"),
      Ex(3,"lib_leg_curl"),Ex(3,"lib_leg_ext"),Ex(3,"lib_abduction"),Ex(3,"lib_standing_calf",{sets:4})
    ]:[
      Ex(3,"lib_squat",{sets:5,repRange:[4,6]}),Ex(3,"lib_leg_press"),Ex(3,"lib_leg_curl"),
      Ex(3,"lib_leg_ext"),Ex(3,"lib_hip_thrust"),Ex(3,"lib_standing_calf",{sets:4})
    ]},
    {id:"C",label:"Upper B",focus:"Heavy OHP · Pull",emoji:"⚡",exercises:fem?[
      Ex(3,"lib_db_ohp",{sets:4}),Ex(3,"lib_chest_row",{sets:4}),Ex(3,"lib_cable_fly"),
      Ex(3,"lib_pullover_cable"),Ex(3,"lib_rear_delt"),Ex(3,"lib_hammer"),Ex(3,"lib_pushdown")
    ]:[
      Ex(3,"lib_ohp",{sets:5,repRange:[4,6]}),Ex(3,"lib_tbar_row",{sets:4,repRange:[6,8]}),Ex(3,"lib_incline_db"),
      Ex(3,"lib_pullover_cable"),Ex(3,"lib_face_pull"),Ex(3,"lib_hammer"),Ex(3,"lib_pushdown")
    ]},
    {id:"D",label:"Lower B",focus:"Heavy Hinge · Unilateral",emoji:"🔱",exercises:fem?[
      Ex(3,"lib_deadlift",{sets:4,repRange:[3,6]}),Ex(3,"lib_split_squat",{sets:4,repRange:[6,10]}),Ex(3,"lib_glute_bridge"),
      Ex(3,"lib_nordic"),Ex(3,"lib_step_up"),Ex(3,"lib_cable_kickback"),Ex(3,"lib_seated_calf",{sets:4})
    ]:[
      Ex(3,"lib_deadlift",{sets:5,repRange:[3,5]}),Ex(3,"lib_split_squat",{sets:4,repRange:[6,10]}),Ex(3,"lib_sumo_dl"),
      Ex(3,"lib_nordic"),Ex(3,"lib_step_up"),Ex(3,"lib_hip_thrust"),Ex(3,"lib_seated_calf",{sets:4})
    ]}
  ]});

  // Block 4: Volume
  blocks.push({id:4,label:"Block 4",theme:"Volume & Pump",days:[
    {id:"A",label:"Upper A",focus:"Push Volume",emoji:"💪",exercises:fem?[
      Ex(4,"lib_db_bench",{sets:3,repRange:[10,15]}),Ex(4,"lib_cable_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_cable_fly"),
      Ex(4,"lib_lat_pull",{repRange:[12,15]}),Ex(4,"lib_arnold_press"),Ex(4,"lib_rear_delt"),Ex(4,"lib_bb_curl")
    ]:[
      Ex(4,"lib_db_bench",{sets:4,repRange:[10,15]}),Ex(4,"lib_cable_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_cable_fly"),
      Ex(4,"lib_lat_pull",{repRange:[12,15]}),Ex(4,"lib_arnold_press"),Ex(4,"lib_conc_curl"),Ex(4,"lib_overhead_tri")
    ]},
    {id:"B",label:"Lower A",focus:"Quad & Glute Volume",emoji:"🦵",exercises:fem?[
      Ex(4,"lib_goblet_squat"),Ex(4,"lib_hip_thrust",{sets:4,repRange:[12,15]}),Ex(4,"lib_rdl"),Ex(4,"lib_leg_ext",{sets:4}),
      Ex(4,"lib_seated_curl",{sets:4}),Ex(4,"lib_abduction"),Ex(4,"lib_leg_press_calf")
    ]:[
      Ex(4,"lib_goblet_squat"),Ex(4,"lib_rdl"),Ex(4,"lib_leg_press",{repRange:[15,20]}),Ex(4,"lib_leg_ext",{sets:4}),
      Ex(4,"lib_seated_curl",{sets:4}),Ex(4,"lib_hip_thrust"),Ex(4,"lib_leg_press_calf")
    ]},
    {id:"C",label:"Upper B",focus:"Pull Volume · Arms",emoji:"⚡",exercises:fem?[
      Ex(4,"lib_db_ohp",{repRange:[10,15]}),Ex(4,"lib_db_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_pec_deck"),
      Ex(4,"lib_pullover_cable"),Ex(4,"lib_cable_raise",{sets:4}),Ex(4,"lib_hammer"),Ex(4,"lib_pushdown")
    ]:[
      Ex(4,"lib_db_ohp",{repRange:[10,15]}),Ex(4,"lib_db_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_pec_deck"),
      Ex(4,"lib_pullover_cable"),Ex(4,"lib_cable_raise",{sets:4}),Ex(4,"lib_spider_curl"),Ex(4,"lib_pushdown")
    ]},
    {id:"D",label:"Lower B",focus:"Hinge Volume · Unilateral",emoji:"🔱",exercises:fem?[
      Ex(4,"lib_rdl",{sets:4,repRange:[10,15]}),Ex(4,"lib_lunge"),Ex(4,"lib_glute_bridge",{repRange:[15,20]}),
      Ex(4,"lib_good_morning"),Ex(4,"lib_leg_curl"),Ex(4,"lib_cable_kickback"),Ex(4,"lib_seated_calf",{sets:4})
    ]:[
      Ex(4,"lib_rdl",{sets:4,repRange:[10,15]}),Ex(4,"lib_lunge"),Ex(4,"lib_leg_press",{repRange:[15,20]}),
      Ex(4,"lib_good_morning"),Ex(4,"lib_leg_curl"),Ex(4,"lib_hip_thrust"),Ex(4,"lib_seated_calf",{sets:4})
    ]}
  ]});

  return blocks;
}

function gen5Day(fem){
  // 5 days/week: Push / Pull / Legs / Upper / Lower, 4 blocks
  const blocks=[];

  // Block 1
  blocks.push({id:1,label:"Block 1",theme:"Barbell Foundation",days:[
    {id:"A",label:"Push",focus:"Chest · Shoulders · Triceps",emoji:"💪",exercises:fem?[
      Ex(1,"lib_bench",{sets:3}),Ex(1,"lib_incline_db",{sets:3}),Ex(1,"lib_ohp",{sets:3}),
      Ex(1,"lib_cable_fly"),Ex(1,"lib_lat_raise"),Ex(1,"lib_pushdown")
    ]:[
      Ex(1,"lib_bench"),Ex(1,"lib_incline_db"),Ex(1,"lib_ohp",{sets:3}),
      Ex(1,"lib_cable_fly"),Ex(1,"lib_lat_raise"),Ex(1,"lib_skull")
    ]},
    {id:"B",label:"Pull",focus:"Back · Biceps · Rear Delts",emoji:"⚡",exercises:fem?[
      Ex(1,"lib_cable_row",{sets:4}),Ex(1,"lib_lat_pull"),Ex(1,"lib_db_row",{sets:3}),
      Ex(1,"lib_face_pull"),Ex(1,"lib_rear_delt"),Ex(1,"lib_bb_curl")
    ]:[
      Ex(1,"lib_cable_row",{sets:4}),Ex(1,"lib_lat_pull"),Ex(1,"lib_db_row",{sets:3}),
      Ex(1,"lib_face_pull"),Ex(1,"lib_rear_delt"),Ex(1,"lib_bb_curl"),Ex(1,"lib_hammer")
    ]},
    {id:"C",label:"Legs",focus:"Squat · Hinge · Glutes · Calves",emoji:"🦵",exercises:fem?[
      Ex(1,"lib_squat"),Ex(1,"lib_hip_thrust",{sets:4}),Ex(1,"lib_rdl"),Ex(1,"lib_leg_ext"),
      Ex(1,"lib_leg_curl"),Ex(1,"lib_abduction"),Ex(1,"lib_standing_calf",{sets:4})
    ]:[
      Ex(1,"lib_squat"),Ex(1,"lib_rdl"),Ex(1,"lib_leg_press"),Ex(1,"lib_leg_ext"),
      Ex(1,"lib_leg_curl"),Ex(1,"lib_hip_thrust"),Ex(1,"lib_standing_calf",{sets:4})
    ]},
    {id:"D",label:"Upper",focus:"Compound Push/Pull · Arms",emoji:"🔱",exercises:fem?[
      Ex(1,"lib_db_bench",{sets:3}),Ex(1,"lib_chest_row",{sets:4}),Ex(1,"lib_db_ohp",{sets:3}),
      Ex(1,"lib_pullover_cable"),Ex(1,"lib_cable_raise"),Ex(1,"lib_hammer")
    ]:[
      Ex(1,"lib_db_bench"),Ex(1,"lib_chest_row",{sets:4}),Ex(1,"lib_db_ohp"),
      Ex(1,"lib_pullover_cable"),Ex(1,"lib_cable_raise"),Ex(1,"lib_incline_curl"),Ex(1,"lib_pushdown")
    ]},
    {id:"E",label:"Lower",focus:"Hinge · Unilateral · Calves",emoji:"🏋️",exercises:fem?[
      Ex(1,"lib_deadlift"),Ex(1,"lib_split_squat"),Ex(1,"lib_glute_bridge"),Ex(1,"lib_seated_curl"),
      Ex(1,"lib_step_up"),Ex(1,"lib_cable_kickback"),Ex(1,"lib_seated_calf",{sets:4})
    ]:[
      Ex(1,"lib_deadlift"),Ex(1,"lib_split_squat"),Ex(1,"lib_leg_press"),Ex(1,"lib_seated_curl"),
      Ex(1,"lib_step_up"),Ex(1,"lib_good_morning"),Ex(1,"lib_seated_calf",{sets:4})
    ]}
  ]});

  // Block 2
  blocks.push({id:2,label:"Block 2",theme:"Dumbbell & Cable",days:[
    {id:"A",label:"Push",focus:"DB Press · Flies · Delts",emoji:"💪",exercises:fem?[
      Ex(2,"lib_db_bench"),Ex(2,"lib_pec_deck"),Ex(2,"lib_db_ohp",{sets:3}),
      Ex(2,"lib_cable_fly"),Ex(2,"lib_cable_raise"),Ex(2,"lib_overhead_tri")
    ]:[
      Ex(2,"lib_db_bench"),Ex(2,"lib_pec_deck"),Ex(2,"lib_db_ohp"),
      Ex(2,"lib_cable_fly"),Ex(2,"lib_cable_raise"),Ex(2,"lib_pushdown"),Ex(2,"lib_overhead_tri")
    ]},
    {id:"B",label:"Pull",focus:"Rows · Pulldowns · Curls",emoji:"⚡",exercises:fem?[
      Ex(2,"lib_chest_row",{sets:4}),Ex(2,"lib_sa_cable_row",{sets:3}),Ex(2,"lib_pullover_cable"),
      Ex(2,"lib_rear_delt"),Ex(2,"lib_face_pull"),Ex(2,"lib_incline_curl")
    ]:[
      Ex(2,"lib_chest_row",{sets:4}),Ex(2,"lib_sa_cable_row",{sets:3}),Ex(2,"lib_pullover_cable"),
      Ex(2,"lib_rear_delt"),Ex(2,"lib_face_pull"),Ex(2,"lib_incline_curl"),Ex(2,"lib_spider_curl")
    ]},
    {id:"C",label:"Legs",focus:"Machine Squat · Glutes · Hams",emoji:"🦵",exercises:fem?[
      Ex(2,"lib_hack_squat"),Ex(2,"lib_hip_thrust",{sets:4}),Ex(2,"lib_leg_curl"),Ex(2,"lib_leg_ext"),
      Ex(2,"lib_lunge"),Ex(2,"lib_abduction"),Ex(2,"lib_leg_press_calf")
    ]:[
      Ex(2,"lib_hack_squat"),Ex(2,"lib_leg_press"),Ex(2,"lib_leg_curl"),Ex(2,"lib_leg_ext"),
      Ex(2,"lib_lunge"),Ex(2,"lib_hip_thrust"),Ex(2,"lib_leg_press_calf")
    ]},
    {id:"D",label:"Upper",focus:"Press · Row · Accessories",emoji:"🔱",exercises:fem?[
      Ex(2,"lib_bench",{sets:3}),Ex(2,"lib_db_row",{sets:4}),Ex(2,"lib_arnold_press"),
      Ex(2,"lib_lat_pull"),Ex(2,"lib_cable_fly"),Ex(2,"lib_bb_curl")
    ]:[
      Ex(2,"lib_bench",{sets:3}),Ex(2,"lib_db_row",{sets:4}),Ex(2,"lib_arnold_press"),
      Ex(2,"lib_lat_pull"),Ex(2,"lib_cable_fly"),Ex(2,"lib_hammer"),Ex(2,"lib_close_bench")
    ]},
    {id:"E",label:"Lower",focus:"Hinge · Unilateral · Glutes",emoji:"🏋️",exercises:fem?[
      Ex(2,"lib_trap_dl"),Ex(2,"lib_split_squat"),Ex(2,"lib_glute_bridge"),Ex(2,"lib_nordic"),
      Ex(2,"lib_seated_curl"),Ex(2,"lib_cable_kickback"),Ex(2,"lib_seated_calf",{sets:4})
    ]:[
      Ex(2,"lib_trap_dl"),Ex(2,"lib_split_squat"),Ex(2,"lib_leg_press_n"),Ex(2,"lib_nordic"),
      Ex(2,"lib_seated_curl"),Ex(2,"lib_good_morning"),Ex(2,"lib_seated_calf",{sets:4})
    ]}
  ]});

  // Block 3: Strength
  blocks.push({id:3,label:"Block 3",theme:"Strength Phase",days:[
    {id:"A",label:"Push",focus:"Heavy Press · Shoulders",emoji:"💪",exercises:fem?[
      Ex(3,"lib_bench",{sets:4,repRange:[6,8]}),Ex(3,"lib_incline_db"),Ex(3,"lib_ohp",{sets:3,repRange:[6,10]}),
      Ex(3,"lib_cable_fly"),Ex(3,"lib_lat_raise"),Ex(3,"lib_pushdown")
    ]:[
      Ex(3,"lib_bench",{sets:5,repRange:[4,6]}),Ex(3,"lib_incline_db",{repRange:[8,10]}),Ex(3,"lib_ohp",{sets:3,repRange:[4,8]}),
      Ex(3,"lib_dips",{repRange:[6,10]}),Ex(3,"lib_lat_raise"),Ex(3,"lib_close_bench")
    ]},
    {id:"B",label:"Pull",focus:"Heavy Row · Pull-Up",emoji:"⚡",exercises:fem?[
      Ex(3,"lib_bb_row",{sets:4,repRange:[6,8]}),Ex(3,"lib_lat_pull"),Ex(3,"lib_chest_row",{sets:3}),
      Ex(3,"lib_face_pull"),Ex(3,"lib_rear_delt"),Ex(3,"lib_cable_curl")
    ]:[
      Ex(3,"lib_bb_row",{sets:4,repRange:[6,8]}),Ex(3,"lib_pullup"),Ex(3,"lib_tbar_row",{sets:3}),
      Ex(3,"lib_face_pull"),Ex(3,"lib_rear_delt"),Ex(3,"lib_bb_curl"),Ex(3,"lib_hammer")
    ]},
    {id:"C",label:"Legs",focus:"Heavy Squat · Deadlift",emoji:"🦵",exercises:fem?[
      Ex(3,"lib_squat",{sets:4,repRange:[4,8]}),Ex(3,"lib_hip_thrust",{sets:4,repRange:[6,10]}),Ex(3,"lib_rdl"),
      Ex(3,"lib_leg_ext"),Ex(3,"lib_leg_curl"),Ex(3,"lib_abduction"),Ex(3,"lib_standing_calf",{sets:4})
    ]:[
      Ex(3,"lib_squat",{sets:5,repRange:[4,6]}),Ex(3,"lib_rdl"),Ex(3,"lib_leg_press"),
      Ex(3,"lib_leg_ext"),Ex(3,"lib_leg_curl"),Ex(3,"lib_hip_thrust"),Ex(3,"lib_standing_calf",{sets:4})
    ]},
    {id:"D",label:"Upper",focus:"Strength Accessories",emoji:"🔱",exercises:fem?[
      Ex(3,"lib_db_bench"),Ex(3,"lib_sa_cable_row",{sets:4}),Ex(3,"lib_db_ohp"),
      Ex(3,"lib_pullover_cable"),Ex(3,"lib_cable_raise"),Ex(3,"lib_hammer")
    ]:[
      Ex(3,"lib_db_bench"),Ex(3,"lib_sa_cable_row",{sets:4}),Ex(3,"lib_db_ohp"),
      Ex(3,"lib_pullover_cable"),Ex(3,"lib_cable_raise"),Ex(3,"lib_incline_curl"),Ex(3,"lib_overhead_tri")
    ]},
    {id:"E",label:"Lower",focus:"Heavy Hinge · Unilateral",emoji:"🏋️",exercises:fem?[
      Ex(3,"lib_deadlift",{sets:4,repRange:[3,6]}),Ex(3,"lib_split_squat",{sets:4,repRange:[6,10]}),Ex(3,"lib_glute_bridge"),
      Ex(3,"lib_nordic"),Ex(3,"lib_step_up"),Ex(3,"lib_cable_kickback"),Ex(3,"lib_seated_calf",{sets:4})
    ]:[
      Ex(3,"lib_deadlift",{sets:5,repRange:[3,5]}),Ex(3,"lib_split_squat",{sets:4,repRange:[6,10]}),Ex(3,"lib_sumo_dl"),
      Ex(3,"lib_nordic"),Ex(3,"lib_step_up"),Ex(3,"lib_good_morning"),Ex(3,"lib_seated_calf",{sets:4})
    ]}
  ]});

  // Block 4: Volume
  blocks.push({id:4,label:"Block 4",theme:"Volume & Pump",days:[
    {id:"A",label:"Push",focus:"High-Rep Chest · Delts",emoji:"💪",exercises:fem?[
      Ex(4,"lib_db_bench",{sets:3,repRange:[10,15]}),Ex(4,"lib_pec_deck"),Ex(4,"lib_arnold_press"),
      Ex(4,"lib_cable_fly"),Ex(4,"lib_cable_raise",{sets:4}),Ex(4,"lib_overhead_tri")
    ]:[
      Ex(4,"lib_db_bench",{repRange:[10,15]}),Ex(4,"lib_pec_deck"),Ex(4,"lib_arnold_press"),
      Ex(4,"lib_cable_fly"),Ex(4,"lib_cable_raise",{sets:4}),Ex(4,"lib_pushdown"),Ex(4,"lib_overhead_tri")
    ]},
    {id:"B",label:"Pull",focus:"High-Rep Rows · Curls",emoji:"⚡",exercises:fem?[
      Ex(4,"lib_cable_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_lat_pull",{repRange:[12,15]}),Ex(4,"lib_db_row",{sets:3,repRange:[10,15]}),
      Ex(4,"lib_rear_delt"),Ex(4,"lib_face_pull"),Ex(4,"lib_incline_curl")
    ]:[
      Ex(4,"lib_cable_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_lat_pull",{repRange:[12,15]}),Ex(4,"lib_db_row",{sets:3,repRange:[10,15]}),
      Ex(4,"lib_rear_delt"),Ex(4,"lib_face_pull"),Ex(4,"lib_conc_curl"),Ex(4,"lib_spider_curl")
    ]},
    {id:"C",label:"Legs",focus:"High-Rep Quads · Glutes",emoji:"🦵",exercises:fem?[
      Ex(4,"lib_goblet_squat"),Ex(4,"lib_hip_thrust",{sets:4,repRange:[12,15]}),Ex(4,"lib_rdl",{repRange:[10,15]}),
      Ex(4,"lib_leg_ext",{sets:4,repRange:[15,20]}),Ex(4,"lib_seated_curl",{sets:4}),Ex(4,"lib_abduction"),Ex(4,"lib_leg_press_calf")
    ]:[
      Ex(4,"lib_goblet_squat"),Ex(4,"lib_rdl",{repRange:[10,15]}),Ex(4,"lib_leg_press",{repRange:[15,20]}),
      Ex(4,"lib_leg_ext",{sets:4,repRange:[15,20]}),Ex(4,"lib_seated_curl",{sets:4}),Ex(4,"lib_hip_thrust"),Ex(4,"lib_leg_press_calf")
    ]},
    {id:"D",label:"Upper",focus:"Pump Push/Pull · Arms",emoji:"🔱",exercises:fem?[
      Ex(4,"lib_bench",{sets:3,repRange:[10,15]}),Ex(4,"lib_chest_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_db_ohp",{repRange:[10,15]}),
      Ex(4,"lib_pullover_cable"),Ex(4,"lib_lat_raise"),Ex(4,"lib_bb_curl")
    ]:[
      Ex(4,"lib_bench",{sets:3,repRange:[10,15]}),Ex(4,"lib_chest_row",{sets:4,repRange:[10,15]}),Ex(4,"lib_db_ohp",{repRange:[10,15]}),
      Ex(4,"lib_pullover_cable"),Ex(4,"lib_lat_raise"),Ex(4,"lib_hammer"),Ex(4,"lib_pushdown")
    ]},
    {id:"E",label:"Lower",focus:"Volume Hinge · Unilateral",emoji:"🏋️",exercises:fem?[
      Ex(4,"lib_rdl",{sets:4,repRange:[10,15]}),Ex(4,"lib_lunge"),Ex(4,"lib_glute_bridge",{repRange:[15,20]}),
      Ex(4,"lib_good_morning"),Ex(4,"lib_leg_curl"),Ex(4,"lib_cable_kickback"),Ex(4,"lib_seated_calf",{sets:4})
    ]:[
      Ex(4,"lib_rdl",{sets:4,repRange:[10,15]}),Ex(4,"lib_lunge"),Ex(4,"lib_leg_press",{repRange:[15,20]}),
      Ex(4,"lib_good_morning"),Ex(4,"lib_leg_curl"),Ex(4,"lib_hip_thrust"),Ex(4,"lib_seated_calf",{sets:4})
    ]}
  ]});

  return blocks;
}

// Active blocks — generated from profile or default
let BLOCKS=[];
function reloadBlocks(){
  const p=getProfile();
  if(p)BLOCKS=generateBlocks(p);
}
reloadBlocks();
