/* GymBuddy V1 — app logic. No build step needed. */
/* =========================================================
   EXERCISE LIBRARY — ordered by beginner-friendliness per slot
   equip: machine | dumbbell | cable | barbell | bodyweight
   ========================================================= */
const LIB = [
 // squat pattern
 {id:"leg_press",slot:"squat",name:"Leg Press",equip:"machine",lvl:1,muscle:"Legs & glutes",tip:"Feet shoulder-width, mid-platform. Lower until knees are near 90°, then push through your whole foot.",mistake:"Don't lock your knees at the top or let your lower back lift off the pad.",start:"Start with just the sled or 1 plate per side."},
 {id:"goblet_squat",slot:"squat",name:"Goblet Squat",equip:"dumbbell",lvl:1,muscle:"Legs & glutes",tip:"Hold one dumbbell vertically at your chest. Sit between your heels, chest up, then stand tall.",mistake:"Don't let your knees cave inward — push them out over your toes.",start:"Start with a 5–8 kg dumbbell."},
 {id:"smith_squat",slot:"squat",name:"Smith Machine Squat",equip:"machine",lvl:2,muscle:"Legs & glutes",tip:"Bar on upper back, feet slightly forward. Sit down and back, then drive up.",mistake:"Don't bounce at the bottom; control the lowering for 2 seconds.",start:"Start with the empty bar."},
 {id:"box_squat",slot:"squat",name:"Bench Box Squat",equip:"bodyweight",lvl:1,muscle:"Legs & glutes",tip:"Stand in front of a bench. Sit back until you lightly touch it, then stand up without rocking.",mistake:"Don't flop onto the bench — just a light tap.",start:"Bodyweight only. Add a dumbbell when 15 reps feel easy."},
 {id:"split_squat",slot:"squat",name:"Split Squat",equip:"bodyweight",lvl:2,muscle:"Legs & glutes",tip:"One foot forward, one back. Drop the back knee straight down, then push up through the front heel.",mistake:"Don't let the front knee collapse inward.",start:"Hold a wall or rack for balance at first."},
 // hinge pattern
 {id:"leg_curl",slot:"hinge",name:"Seated Leg Curl",equip:"machine",lvl:1,muscle:"Hamstrings",tip:"Pad just above your heels. Curl down smoothly, pause, then return slowly.",mistake:"Don't lift your hips off the seat to swing the weight.",start:"Start at the lightest 2–3 pins."},
 {id:"db_rdl",slot:"hinge",name:"Dumbbell Romanian Deadlift",equip:"dumbbell",lvl:2,muscle:"Hamstrings & glutes",tip:"Soft knees. Push your hips back and slide the dumbbells down your thighs until you feel a stretch, then stand.",mistake:"Don't round your back — stop where your flat back ends.",start:"Start with 2 × 5 kg dumbbells."},
 {id:"glute_bridge",slot:"hinge",name:"Glute Bridge",equip:"bodyweight",lvl:1,muscle:"Glutes & hamstrings",tip:"Lie on your back, knees bent. Squeeze your glutes to lift your hips into a straight line, pause 1 second.",mistake:"Don't arch your lower back at the top — ribs down.",start:"Bodyweight. Add a dumbbell on your hips later."},
 {id:"cable_pullthrough",slot:"hinge",name:"Cable Pull-Through",equip:"cable",lvl:2,muscle:"Glutes & hamstrings",tip:"Face away from a low cable with the rope between your legs. Hinge back, then snap your hips forward.",mistake:"Don't pull with your arms — they're just hooks.",start:"Start light; this is about the hip movement."},
 // horizontal push
 {id:"chest_press",slot:"hpush",name:"Chest Press Machine",equip:"machine",lvl:1,muscle:"Chest & triceps",tip:"Handles at mid-chest. Press out without locking elbows, return slowly until you feel a chest stretch.",mistake:"Don't let your shoulders roll forward — keep your back on the pad.",start:"Start at 10–15 kg on the stack."},
 {id:"db_bench",slot:"hpush",name:"Dumbbell Bench Press",equip:"dumbbell",lvl:2,muscle:"Chest & triceps",tip:"Lie on a flat bench, dumbbells over your chest. Lower to chest level with elbows at 45°, press back up.",mistake:"Don't flare elbows straight out to the sides.",start:"Start with 2 × 5–7.5 kg."},
 {id:"incline_pushup",slot:"hpush",name:"Incline Push-up",equip:"bodyweight",lvl:1,muscle:"Chest & triceps",tip:"Hands on a bench or bar. Body in a straight line, lower your chest to the edge, push away.",mistake:"Don't let your hips sag.",start:"Higher surface = easier. Lower it as you get stronger."},
 {id:"cable_press",slot:"hpush",name:"Standing Cable Chest Press",equip:"cable",lvl:2,muscle:"Chest & triceps",tip:"Cables at chest height, one foot forward. Press both handles forward and together.",mistake:"Don't lean into it — stay tall.",start:"Start at the lightest setting."},
 // vertical push
 {id:"machine_shoulder",slot:"vpush",name:"Shoulder Press Machine",equip:"machine",lvl:1,muscle:"Shoulders",tip:"Handles at shoulder level. Press up without shrugging, lower with control.",mistake:"Don't arch your back off the pad.",start:"Start at 5–10 kg on the stack."},
 {id:"db_shoulder",slot:"vpush",name:"Seated Dumbbell Shoulder Press",equip:"dumbbell",lvl:1,muscle:"Shoulders",tip:"Sit upright with back support. Press dumbbells overhead, lower to ear level.",mistake:"Don't let the dumbbells drift in front of your face.",start:"Start with 2 × 4–5 kg."},
 {id:"lateral_raise",slot:"vpush",name:"Dumbbell Lateral Raise",equip:"dumbbell",lvl:1,muscle:"Shoulders",tip:"Slight bend in elbows. Raise arms out to the side to shoulder height, lower slowly.",mistake:"Don't swing — if you need momentum, go lighter.",start:"Start with 2 × 2–3 kg. Lighter than you think."},
 {id:"pike_pushup",slot:"vpush",name:"Wall Shoulder Tap Hold",equip:"bodyweight",lvl:1,muscle:"Shoulders & core",tip:"Hands on a wall at shoulder height, step back. Lean in and press away, keeping elbows at 45°.",mistake:"Don't let your head drop forward.",start:"Bodyweight. Step farther back to make it harder."},
 // vertical pull
 {id:"lat_pulldown",slot:"vpull",name:"Lat Pulldown",equip:"cable",lvl:1,muscle:"Back & biceps",tip:"Grip wider than shoulders. Pull the bar to your upper chest by driving elbows down, then return slowly.",mistake:"Don't lean way back or pull behind your neck.",start:"Start at 15–20 kg on the stack."},
 {id:"assisted_pullup",slot:"vpull",name:"Assisted Pull-up Machine",equip:"machine",lvl:1,muscle:"Back & biceps",tip:"Kneel on the pad. Pull your chest toward the bar, lower all the way down.",mistake:"More assist weight = easier. Don't pick too little assist.",start:"Start with high assistance (e.g. 30–40 kg)."},
 {id:"db_pullover",slot:"vpull",name:"Dumbbell Pullover",equip:"dumbbell",lvl:2,muscle:"Back & chest",tip:"Lie across a bench holding one dumbbell over your chest. Lower it behind your head in an arc, pull back.",mistake:"Don't bend your elbows much — keep a soft, fixed bend.",start:"Start with a 5 kg dumbbell."},
 {id:"prone_y",slot:"vpull",name:"Prone Y-Raise",equip:"bodyweight",lvl:1,muscle:"Upper back",tip:"Lie face-down, arms overhead in a Y. Lift your arms by squeezing your shoulder blades, pause, lower.",mistake:"Don't lift with your neck — keep eyes on the floor.",start:"Bodyweight. Very light plates later."},
 // horizontal pull
 {id:"seated_row",slot:"hpull",name:"Seated Cable Row",equip:"cable",lvl:1,muscle:"Back & biceps",tip:"Sit tall, slight knee bend. Pull the handle to your belly button, squeeze shoulder blades, return.",mistake:"Don't rock your torso back and forth.",start:"Start at 15–20 kg on the stack."},
 {id:"machine_row",slot:"hpull",name:"Chest-Supported Row Machine",equip:"machine",lvl:1,muscle:"Back & biceps",tip:"Chest on the pad. Pull handles back until elbows pass your ribs, pause, return slowly.",mistake:"Don't shrug your shoulders up to your ears.",start:"Start at 10–15 kg or 1 plate per side."},
 {id:"db_row",slot:"hpull",name:"One-Arm Dumbbell Row",equip:"dumbbell",lvl:1,muscle:"Back & biceps",tip:"One hand and knee on a bench. Pull the dumbbell to your hip, lower with a stretch.",mistake:"Don't twist your torso to lift it.",start:"Start with 7.5–10 kg."},
 {id:"snow_angel",slot:"hpull",name:"Reverse Snow Angel",equip:"bodyweight",lvl:1,muscle:"Upper back",tip:"Lie face-down, arms at your sides. Lift arms slightly and sweep them overhead and back.",mistake:"Don't rush — slow and controlled is the point.",start:"Bodyweight."}
];
const BYID = Object.fromEntries(LIB.map(e=>[e.id,e]));
const TEMPLATES = [["squat","hpush","vpull"],["hinge","vpush","hpull"]];
const SLOTNAME = {squat:"Legs",hinge:"Legs",hpush:"Push",vpush:"Push",vpull:"Pull",hpull:"Pull"};
const GOALS = {
  fat:{label:"Lose fat",sub:"Burn more, feel lighter",reps:"12–15",rest:45},
  muscle:{label:"Build muscle",sub:"Get stronger, look fitter",reps:"8–12",rest:90},
  fit:{label:"Get generally fit",sub:"Energy, stamina, habit",reps:"10–12",rest:60}
};
const EQUIP = [
  {k:"machine",label:"Machines",sub:"Leg press, chest press, etc."},
  {k:"cable",label:"Cable station",sub:"Lat pulldown, rows"},
  {k:"dumbbell",label:"Dumbbells & bench",sub:""},
  {k:"barbell",label:"Barbells",sub:"Not needed in V1 plans"}
];
const SETS = 3;

/* =================== STATE (localStorage) =================== */
const KEY="gymbuddy.v1";
function load(){try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch(e){}return {profile:null,history:[],active:null,events:[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
let S = load();
S.history=S.history||[]; S.events=S.events||[];
function track(type,data){S.events.push({t:Date.now(),type,...(data||{})}); if(S.events.length>400)S.events=S.events.slice(-400); save()}

/* =================== DATE HELPERS (local time) =================== */
const pad=n=>String(n).padStart(2,"0");
function dstr(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function today(){return dstr(new Date())}
function parseD(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function weekStart(s){const d=parseD(s);const wd=(d.getDay()+6)%7;d.setDate(d.getDate()-wd);return dstr(d)}
function addDays(s,n){const d=parseD(s);d.setDate(d.getDate()+n);return dstr(d)}

function weekCount(ws){return new Set(S.history.filter(h=>weekStart(h.date)===ws).map(h=>h.date)).size}
function streakWeeks(){
  const target=S.profile?.target||3; let ws=weekStart(today()); let n=0;
  if(weekCount(ws)>=target) n++;              // current week counts once met
  ws=addDays(ws,-7);                            // an unfinished current week never breaks the streak
  while(weekCount(ws)>=target){n++;ws=addDays(ws,-7)}
  return n;
}
function trainedToday(){return S.history.some(h=>h.date===today())}

/* =================== WORKOUT ENGINE =================== */
function available(){const eq=new Set([...(S.profile?.equip||[]),"bodyweight"]);return LIB.filter(e=>eq.has(e.equip))}
function pickFor(slot,exclude){
  const pool=available().filter(e=>e.slot===slot&&!exclude.includes(e.id));
  return pool[0]||LIB.find(e=>e.slot===slot&&e.equip==="bodyweight");
}
function buildWorkout(){
  const dayIndex=S.history.length; const tpl=TEMPLATES[dayIndex%2];
  const items=tpl.map(slot=>{const e=pickFor(slot,[]);return {slot,id:e.id,done:Array(SETS).fill(false),swaps:[]}});
  S.active={date:today(),dayIndex,items,startedAt:Date.now()}; save(); track("workout_generated",{dayIndex});
}
// Swap engine: deterministic, instant, works offline. Reason changes the ranking.
function swapCandidate(item,reason){
  const cur=BYID[item.id]; const tried=[item.id,...item.swaps.map(s=>s.from)];
  let pool=available().filter(e=>e.slot===item.slot&&!tried.includes(e.id));
  // allow sister slot (e.g. squat<->hinge) if pool is empty
  if(!pool.length){const sis={squat:"hinge",hinge:"squat",hpush:"vpush",vpush:"hpush",vpull:"hpull",hpull:"vpull"}[item.slot];
    pool=available().filter(e=>e.slot===sis&&!tried.includes(e.id))}
  if(!pool.length) return null;
  const score=e=>{let s=0;
    if(reason==="busy"){ if(e.equip!==cur.equip)s-=10; if(e.equip==="bodyweight"||e.equip==="dumbbell")s-=3 }
    if(reason==="unsure"){ s+=e.lvl*10; if(e.equip==="machine")s-=4 }
    if(reason==="pain"){ s+=e.lvl*10; if(e.equip==="bodyweight")s-=6 }
    return s};
  return pool.map((e,i)=>({e,s:score(e)+i*0.01})).sort((a,b)=>a.s-b.s)[0].e;
}

/* =================== CAPABILITIES (light up if present) =================== */
let DB=null, SAMPLE=null, TEAM=false, LOCAL=false;
/* Local stand-in for the hosted database: same interface, saved in this browser.
   Used when the site runs outside Claude and is opened with ?team in the URL. */
function localDB(){
  const K="gymbuddy.team", subs=[];
  const read=()=>{try{return JSON.parse(localStorage.getItem(K))||{}}catch(e){return {}}};
  const write=d=>{try{localStorage.setItem(K,JSON.stringify(d))}catch(e){} subs.forEach(f=>f())};
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  return {
    collection:name=>({
      onSnapshot(fn){const f=()=>{const c=read()[name]||{};fn({docs:Object.entries(c).map(([id,v])=>({id,exists:true,data:()=>v}))})};subs.push(f);f();return ()=>{}},
      async add(v){const d=read();(d[name]=d[name]||{})[uid()]=v;write(d)}
    }),
    doc:path=>{const [c,id]=path.split("/");return {
      onSnapshot(fn){const f=()=>{const v=(read()[c]||{})[id];fn({exists:!!v,data:()=>v})};subs.push(f);f();return ()=>{}},
      async set(v){const d=read();(d[c]=d[c]||{})[id]=v;write(d)},
      async update(v){const d=read();d[c]=d[c]||{};d[c][id]={...(d[c][id]||{}),...v};write(d)},
      async delete(){const d=read();if(d[c])delete d[c][id];write(d)}
    }}
  };
}
function exportResearch(){
  const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),interviews:INT,testers:TST},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="gymbuddy-research-"+today()+".json";a.click();
}
(async()=>{
  try{
    const cl=window.claude;
    if(!cl||!cl.use){                       // standalone website (VS Code / Netlify)
      // wait one tick so the rest of this script (state, views) has finished loading
      if(new URLSearchParams(location.search).has("team")) setTimeout(()=>{DB=localDB();TEAM=true;LOCAL=true;
        document.getElementById("teambar").classList.remove("hidden");startTeamData()},0);
      return;
    }
    const [db,user,sample]=await Promise.all([cl.use("db"),cl.use("user"),cl.use("sample")]);
    SAMPLE=sample||null;
    const can = user ? await user.canEdit() : false;
    if(db && can){DB=db;TEAM=true;document.getElementById("teambar").classList.remove("hidden");startTeamData()}
    if(VIEW==="app") render();
  }catch(e){}
})();

/* =================== UI HELPERS =================== */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg){const t=$("#toast");t.textContent=msg;t.style.display="block";clearTimeout(t._h);t._h=setTimeout(()=>t.style.display="none",2200)}
function openSheet(html){$("#sheet").innerHTML=html;$("#sheetBg").style.display="block";requestAnimationFrame(()=>$("#sheet").classList.add("open"));setTimeout(()=>{const f=$("#sheet").querySelector("button");f&&f.focus()},50)}
function closeSheet(){$("#sheet").classList.remove("open");$("#sheetBg").style.display="none"}
$("#sheetBg").onclick=closeSheet;
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSheet()});

let VIEW="app"; let OB={step:0,goal:null,equip:new Set(["machine","cable","dumbbell"]),target:3};

function render(){
  const m=$("#app");
  if(VIEW!=="app"){renderTeam(m);return}
  if(!S.profile) return renderOnboarding(m);
  if(S.active && S.active.date===today() && !S.active.finished) return renderWorkout(m);
  if(S.lastDone && S.lastDone===today() && S.showSummary) return renderSummary(m);
  return renderHome(m);
}

/* ---------- ONBOARDING (2 screens, ~30s) ---------- */
function renderOnboarding(m){
  if(OB.step===0){
    m.innerHTML=`<div class="wrap">
      <div class="disp font-extrabold mt-6" style="font-size:3.2rem;line-height:.92">Walk in.<br>Know exactly<br>what to do.</div>
      <p class="muted mt-3 text-lg">Three exercises a day, with a backup ready when a machine is taken. Two questions and you're set.</p>
      <h2 class="disp font-bold mt-8 mb-3" style="font-size:1.6rem">What's your main goal?</h2>
      <div class="grid gap-3">${Object.entries(GOALS).map(([k,g])=>`
        <button class="chip" data-goal="${k}" aria-pressed="${OB.goal===k}">
          <div class="disp font-bold" style="font-size:1.35rem">${g.label}</div><div class="muted">${g.sub}</div></button>`).join("")}
      </div></div>
      <div class="dock"><div><button class="btn btn-main" id="next" ${OB.goal?"":"disabled"}>Next</button><p class="muted text-center text-sm mt-2">Step 1 of 2</p></div></div>`;
    m.querySelectorAll("[data-goal]").forEach(b=>b.onclick=()=>{OB.goal=b.dataset.goal;renderOnboarding(m)});
    $("#next").onclick=()=>{OB.step=1;track("onboard_goal",{goal:OB.goal});renderOnboarding(m)};
  } else {
    m.innerHTML=`<div class="wrap">
      <button class="muted font-semibold mt-2" id="back">Back</button>
      <h2 class="disp font-bold mt-4 mb-1" style="font-size:1.9rem">What does your gym have?</h2>
      <p class="muted mb-4">Tick everything you've seen there. Not sure? Leave the defaults.</p>
      <div class="grid gap-3">${EQUIP.map(q=>`
        <button class="chip flex justify-between items-center" data-eq="${q.k}" aria-pressed="${OB.equip.has(q.k)}">
          <span><span class="disp font-bold" style="font-size:1.3rem">${q.label}</span>${q.sub?`<br><span class="muted text-sm">${q.sub}</span>`:""}</span>
          <span aria-hidden="true" class="disp font-bold" style="font-size:1.4rem">${OB.equip.has(q.k)?"✓":""}</span></button>`).join("")}
      </div>
      <h3 class="disp font-bold mt-6 mb-2" style="font-size:1.4rem">Days a week you can realistically go</h3>
      <div class="grid grid-cols-3 gap-3">${[2,3,4].map(n=>`<button class="chip text-center disp font-bold" style="font-size:1.5rem" data-t="${n}" aria-pressed="${OB.target===n}">${n}</button>`).join("")}</div>
      <p class="muted text-sm mt-2">Start lower than you think. Hitting 3 beats planning 6.</p>
      </div>
      <div class="dock"><div><button class="btn btn-main" id="go">Build my plan</button><p class="muted text-center text-sm mt-2">Step 2 of 2</p></div></div>`;
    m.querySelectorAll("[data-eq]").forEach(b=>b.onclick=()=>{const k=b.dataset.eq;OB.equip.has(k)?OB.equip.delete(k):OB.equip.add(k);renderOnboarding(m)});
    m.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{OB.target=+b.dataset.t;renderOnboarding(m)});
    $("#back").onclick=()=>{OB.step=0;renderOnboarding(m)};
    $("#go").onclick=()=>{S.profile={goal:OB.goal,equip:[...OB.equip],target:OB.target,created:today()};track("onboard_done",{equip:S.profile.equip,target:OB.target});buildWorkout();render();window.scrollTo(0,0)};
  }
}

/* ---------- HOME ---------- */
function weekDots(){
  let h="";const t=today();const start=addDays(weekStart(t),-7);
  const days=new Set(S.history.map(x=>x.date));
  for(let i=0;i<14;i++){const d=addDays(start,i);h+=`<div class="dot ${days.has(d)?"on":""} ${d===t?"today":""}" title="${d}"></div>`}
  return `<div class="grid gap-1.5" style="grid-template-columns:repeat(7,22px)">${h}</div>`;
}
function renderHome(m){
  const p=S.profile, wc=weekCount(weekStart(today())), st=streakWeeks();
  const done=trainedToday();
  m.innerHTML=`<div class="wrap">
    <div class="flex justify-between items-center mt-2"><div class="disp font-extrabold" style="font-size:1.6rem">GymBuddy</div>
      <button class="muted text-sm font-semibold" id="reset">Change goal</button></div>
    <div class="card p-5 mt-4">
      <div class="flex justify-between items-end">
        <div><div class="disp font-extrabold" style="font-size:3.4rem;line-height:1">${wc}<span class="muted" style="font-size:1.8rem">/${p.target}</span></div>
        <div class="muted font-semibold">workouts this week</div></div>
        <div class="text-right"><div class="disp font-extrabold" style="font-size:2.2rem;line-height:1">${st}</div><div class="muted text-sm font-semibold">week streak</div></div>
      </div>
      <div class="bar mt-4"><i style="width:${Math.min(100,wc/p.target*100)}%"></i></div>
      <div class="mt-4">${weekDots()}</div>
    </div>
    ${done?`<div class="card p-5 mt-4"><div class="disp font-bold" style="font-size:1.6rem">Done for today.</div>
      <p class="muted mt-1">Muscles grow on rest days. Your next workout is ready whenever you walk in.</p>
      <button class="btn btn-ghost mt-4" id="again">Train again anyway</button></div>`
    :`<div class="card p-5 mt-4"><div class="disp font-bold" style="font-size:1.6rem">Today: Workout ${S.history.length%2?"B":"A"}</div>
      <p class="muted mt-1">3 exercises, about 25 minutes. ${GOALS[p.goal].label}.</p></div>`}
    <p class="muted text-sm mt-6">Your progress is saved on this phone only.</p>
  </div>
  ${done?"":`<div class="dock"><div><button class="btn btn-main" id="start">Start today's workout</button></div></div>`}`;
  const resumable=S.active&&S.active.date===today()&&!S.active.finished;
  if($("#start")&&resumable)$("#start").textContent="Resume today's workout";
  $("#start")&&($("#start").onclick=()=>{if(!resumable)buildWorkout();renderWorkout(m);window.scrollTo(0,0)});
  $("#again")&&($("#again").onclick=()=>{buildWorkout();render();window.scrollTo(0,0)});
  $("#reset").onclick=()=>{OB={step:0,goal:p.goal,equip:new Set(p.equip),target:p.target};S.profile=null;save();render()};
}

/* ---------- ACTIVE WORKOUT ---------- */
function renderWorkout(m){
  const A=S.active, g=GOALS[S.profile.goal];
  const total=A.items.length*SETS, done=A.items.reduce((a,i)=>a+i.done.filter(Boolean).length,0);
  m.innerHTML=`<div class="wrap">
    <div class="flex justify-between items-center mt-2">
      <button class="muted font-semibold" id="home">Home</button>
      <span class="tag">${done}/${total} sets</span></div>
    <h1 class="disp font-extrabold mt-3" style="font-size:2.4rem;line-height:1">Workout ${A.dayIndex%2?"B":"A"}</h1>
    <p class="muted">${SETS} sets × ${g.reps} reps. Rest ${g.rest}s between sets. Last 2 reps should feel hard, not impossible.</p>
    <div class="bar mt-3"><i style="width:${done/total*100}%"></i></div>
    <div class="grid gap-4 mt-5">${A.items.map((it,ix)=>{const e=BYID[it.id];const last=it.swaps[it.swaps.length-1];
      return `<section class="card p-4" aria-label="${esc(e.name)}">
        <div class="flex justify-between items-start gap-2">
          <div><span class="tag">${ix+1} of 3, ${SLOTNAME[it.slot]}</span>
            <h2 class="disp font-bold mt-2" style="font-size:1.7rem;line-height:1.05">${esc(e.name)}</h2>
            <div class="muted text-sm font-semibold">${esc(e.muscle)}</div></div>
          <button class="shrink-0 font-semibold text-sm px-3 py-2 rounded-xl" style="border:2px solid var(--line)" data-swap="${ix}">Swap</button>
        </div>
        ${last?`<p class="text-sm mt-2" style="color:var(--go)">Swapped in for ${esc(BYID[last.from].name)} (${last.reason==="busy"?"equipment busy":last.reason==="unsure"?"wasn't sure how":"felt uncomfortable"}).</p>`:""}
        <p class="mt-3"><b>How:</b> ${esc(e.tip)}</p>
        <p class="mt-1 text-sm muted"><b>Avoid:</b> ${esc(e.mistake)} <b>Start:</b> ${esc(e.start)}</p>
        ${SAMPLE?`<button class="text-sm font-semibold mt-2 underline" data-ask="${ix}">Ask GymBuddy about this</button><div class="text-sm mt-2" id="ans${ix}"></div>`:""}
        <div class="flex gap-3 mt-4" role="group" aria-label="Log sets">${it.done.map((d,si)=>`
          <button class="plate" data-set="${ix}-${si}" aria-pressed="${d}" aria-label="Set ${si+1} ${d?"done":"not done"}"><span>${d?"✓":si+1}</span></button>`).join("")}
        </div></section>`}).join("")}
    </div></div>
    <div class="dock"><div><button class="btn btn-main" id="finish" ${done===0?"disabled":""}>${done===total?"Finish workout":done?`Finish with ${done}/${total} sets`:"Log a set to finish"}</button></div></div>`;
  $("#home").onclick=()=>{renderHome(m);window.scrollTo(0,0)};
  m.querySelectorAll("[data-set]").forEach(b=>b.onclick=()=>{const [i,s]=b.dataset.set.split("-").map(Number);
    const it=A.items[i];it.done[s]=!it.done[s];save();
    if(it.done[s]){track("set_logged",{ex:it.id});if(navigator.vibrate)navigator.vibrate(15);toast(`Set ${s+1} logged. Rest ${g.rest}s.`)}
    renderWorkout(m)});
  m.querySelectorAll("[data-swap]").forEach(b=>b.onclick=()=>swapSheet(+b.dataset.swap));
  m.querySelectorAll("[data-ask]").forEach(b=>b.onclick=()=>askCoach(+b.dataset.ask));
  $("#finish").onclick=finishWorkout;
}
function swapSheet(ix){
  const e=BYID[S.active.items[ix].id];track("swap_opened",{ex:e.id});
  openSheet(`<h2 id="sheetTitle" class="disp font-bold" style="font-size:1.6rem">Swap ${esc(e.name)}</h2>
   <p class="muted mb-4">Why? We'll pick a replacement that works the same muscles.</p>
   <div class="grid gap-3">
    <button class="chip" data-r="busy"><b class="disp" style="font-size:1.25rem">It's busy or not here</b><br><span class="muted text-sm">Get an option on different equipment</span></button>
    <button class="chip" data-r="unsure"><b class="disp" style="font-size:1.25rem">I don't know how to do it</b><br><span class="muted text-sm">Get the simplest version</span></button>
    <button class="chip" data-r="pain"><b class="disp" style="font-size:1.25rem">It hurts or feels wrong</b><br><span class="muted text-sm">Get a gentler option</span></button>
    <button class="btn btn-ghost" id="cx">Keep this exercise</button></div>`);
  $("#cx").onclick=closeSheet;
  $("#sheet").querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>doSwap(ix,b.dataset.r));
}
function doSwap(ix,reason){
  const it=S.active.items[ix]; const next=swapCandidate(it,reason);
  if(!next){openSheet(`<h2 id="sheetTitle" class="disp font-bold" style="font-size:1.5rem">No more options here</h2>
    <p class="muted mt-2">You've tried every alternative for this muscle group with your equipment. Skip this one today; the other two still count.</p>
    <button class="btn btn-main mt-4" id="ok">OK</button>`);$("#ok").onclick=closeSheet;track("swap_exhausted",{ex:it.id});return}
  it.swaps.push({from:it.id,to:next.id,reason}); it.id=next.id; it.done=Array(SETS).fill(false); save();
  track("swap_done",{reason,to:next.id});
  if(reason==="pain"){openSheet(`<h2 id="sheetTitle" class="disp font-bold" style="font-size:1.5rem">Swapped to ${esc(next.name)}</h2>
    <p class="mt-2">Muscle burn and next-day soreness are normal. <b>Sharp pain, joint pain, or pain that doesn't fade are not.</b> If that's what you felt, stop that movement today and ask a gym trainer or a doctor before repeating it.</p>
    <button class="btn btn-main mt-4" id="ok">Got it</button>`);$("#ok").onclick=()=>{closeSheet();renderWorkout($("#app"))};}
  else {closeSheet();toast(`Swapped in ${next.name}`);renderWorkout($("#app"))}
}
async function askCoach(ix){
  const e=BYID[S.active.items[ix].id]; const box=$("#ans"+ix);
  const q=prompt(`Ask about ${e.name} (e.g. "what weight should I pick?")`); if(!q) return;
  box.textContent="Thinking…";
  try{
    const r=await SAMPLE(`You are GymBuddy, a cautious coach for complete gym beginners. Exercise: ${e.name}. Cue: ${e.tip}. User goal: ${GOALS[S.profile.goal].label}. Question: "${q}". Answer in at most 3 short sentences, plain words. Never diagnose injuries; for pain, advise stopping and asking a trainer or doctor.`,{modelTier:"quick",onText:({text})=>box.textContent=text});
    box.textContent=r.text; track("ai_ask",{ex:e.id});
  }catch(err){box.textContent= err&&err.code==="not_granted"?"AI answers are off for this view.":"Couldn't get an answer right now. The written cues above still apply."}
}
function finishWorkout(){
  const A=S.active; const sets=A.items.reduce((a,i)=>a+i.done.filter(Boolean).length,0);
  S.history.push({date:today(),dayIndex:A.dayIndex,sets,items:A.items.map(i=>({id:i.id,sets:i.done.filter(Boolean).length,swaps:i.swaps})),mins:Math.round((Date.now()-A.startedAt)/60000)});
  A.finished=true; S.lastDone=today(); S.showSummary=true; save();
  track("workout_done",{sets,swaps:A.items.reduce((a,i)=>a+i.swaps.length,0)});
  render(); window.scrollTo(0,0);
}

/* ---------- COMPLETION & STREAK ---------- */
function renderSummary(m){
  const last=S.history[S.history.length-1]; const wc=weekCount(weekStart(today())); const t=S.profile.target; const st=streakWeeks();
  const msg = wc>=t ? "Weekly target hit. That's the whole game in month one." : `${t-wc} more this week to keep your streak.`;
  m.innerHTML=`<div class="wrap">
    <div class="disp font-extrabold mt-8" style="font-size:1.3rem;color:var(--go)">Workout ${S.history.length} complete</div>
    <div class="disp font-extrabold" style="font-size:3.6rem;line-height:.95">You showed up.</div>
    <div class="grid grid-cols-3 gap-3 mt-6">
      <div class="card p-3 text-center"><div class="disp font-extrabold" style="font-size:2.2rem">${last.sets}</div><div class="muted text-sm">sets</div></div>
      <div class="card p-3 text-center"><div class="disp font-extrabold" style="font-size:2.2rem">${wc}/${t}</div><div class="muted text-sm">this week</div></div>
      <div class="card p-3 text-center"><div class="disp font-extrabold" style="font-size:2.2rem">${st}</div><div class="muted text-sm">week streak</div></div>
    </div>
    <p class="mt-4 font-semibold">${msg}</p>
    <div class="card p-4 mt-4">${weekDots()}</div>
    <div class="card p-4 mt-4"><div class="disp font-bold" style="font-size:1.3rem">How did today feel?</div>
      <div class="grid grid-cols-3 gap-2 mt-3">${["Too easy","About right","Too hard"].map(f=>`<button class="chip text-center font-semibold" data-feel="${f}" aria-pressed="${last.feel===f}">${f}</button>`).join("")}</div>
      <p class="muted text-sm mt-2">Next time we'll ${last.feel==="Too easy"?"suggest adding a little weight":last.feel==="Too hard"?"suggest lighter weight or fewer reps":"keep the same targets"}.</p></div>
  </div>
  <div class="dock"><div><button class="btn btn-main" id="homeb">Done</button></div></div>`;
  m.querySelectorAll("[data-feel]").forEach(b=>b.onclick=()=>{last.feel=b.dataset.feel;save();track("feel",{feel:last.feel});renderSummary(m)});
  $("#homeb").onclick=()=>{S.showSummary=false;save();render();window.scrollTo(0,0)};
}

/* =========================================================
   TEAM CONSOLE — real interviews + test funnel, stored in db
   ========================================================= */
let INT=[], TST=[], SYN=null;
function startTeamData(){
  DB.collection("interviews").onSnapshot(s=>{INT=s.docs.map(d=>({_id:d.id,...d.data()})).sort((a,b)=>(a.at||0)-(b.at||0));if(VIEW!=="app")render()});
  DB.collection("testers").onSnapshot(s=>{TST=s.docs.map(d=>({_id:d.id,...d.data()})).sort((a,b)=>(a.at||0)-(b.at||0));if(VIEW!=="app")render()});
  DB.doc("synthesis/latest").onSnapshot(s=>{SYN=s.exists?s.data():null;if(VIEW==="synth")render()});
}
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{VIEW=b.dataset.view;document.querySelectorAll("[data-view]").forEach(x=>x.setAttribute("aria-selected",x===b));render();window.scrollTo(0,0)});

const Q = [
 ["routine","What does your current gym routine look like?","Walk me through your last session, start to finish."],
 ["choose","How do you decide what exercises to do?","Where did that come from? YouTube, a friend, the trainer?"],
 ["problems","What problems do you face while working out?","Tell me about the last time you felt stuck on the floor."],
 ["apps","Have you used any fitness apps? What happened?","Why did you stop?"],
 ["consistency","What makes it hard to stay consistent?","When did you last skip, and what happened that day?"],
 ["wouldUse","What would make you use a product regularly?","If it did only one thing for you, what should it be?"]
];
function renderTeam(m){
  if(VIEW==="interviews") return renderInterviews(m);
  if(VIEW==="funnel") return renderFunnel(m);
  if(VIEW==="synth") return renderSynth(m);
}
function renderInterviews(m){
  const venues=["Budget gym","Cult.fit","Society gym","Other"];
  const byV=venues.map(v=>[v,INT.filter(i=>i.venue===v).length]);
  m.innerHTML=`<div class="wrap wide">
   <div class="flex flex-wrap justify-between items-end gap-3 mt-2">
    <div><h1 class="disp font-extrabold" style="font-size:2.4rem;line-height:1">Interviews</h1>
    <p class="muted">Log each conversation right after it ends, while quotes are fresh. ${LOCAL?"Saved in this browser only. Export after every session.":"Saved to this artifact for your team."}</p>
    ${LOCAL?`<button class="underline font-semibold text-sm mt-1" id="exp">Download research data (JSON)</button>`:""}</div>
    <div class="card px-4 py-3"><span class="disp font-extrabold" style="font-size:2rem">${INT.length}</span><span class="muted"> of 5 minimum</span>
     <div class="muted text-sm">${byV.map(([v,n])=>`${v}: ${n}`).join(", ")}</div></div></div>
   <div class="grid gap-5 mt-5" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
   <form class="card p-5" id="iform" onsubmit="return false">
    <h2 class="disp font-bold" style="font-size:1.5rem">New interview</h2>
    <div class="grid grid-cols-2 gap-3">
     <div><label class="lb" for="f_name">First name</label><input class="field" id="f_name" required></div>
     <div><label class="lb" for="f_age">Age</label><input class="field" id="f_age" inputmode="numeric"></div>
     <div><label class="lb" for="f_venue">Where they train</label><select class="field" id="f_venue">${venues.map(v=>`<option>${v}</option>`).join("")}</select></div>
     <div><label class="lb" for="f_months">Months training</label><input class="field" id="f_months" inputmode="numeric"></div>
    </div>
    ${Q.map(([k,q,probe])=>`<label class="lb" for="f_${k}">${q}</label><p class="muted text-xs mb-1">Probe: ${probe}</p><textarea class="field" rows="2" id="f_${k}"></textarea>`).join("")}
    <label class="lb" for="f_obs">Key observation (what you saw, not what they said)</label><textarea class="field" rows="2" id="f_obs"></textarea>
    <label class="lb" for="f_frus">Main frustration, in one line</label><input class="field" id="f_frus">
    <label class="lb" for="f_quote">Best verbatim quote</label><textarea class="field" rows="2" id="f_quote"></textarea>
    <label class="flex items-center gap-2 mt-3 text-sm"><input type="checkbox" id="f_consent"> They agreed to be quoted (first name only)</label>
    <button class="btn btn-main mt-4" id="saveI">Save interview</button>
   </form>
   <div class="card p-5">
    <h2 class="disp font-bold" style="font-size:1.5rem">Interview matrix</h2>
    ${INT.length?`<div class="scrollx"><table class="tbl mt-2"><thead><tr><th>Participant</th><th>Venue</th><th>Routine</th><th>Observation</th><th>Frustration</th><th></th></tr></thead><tbody>
    ${INT.map(i=>`<tr><td><b>${esc(i.name)}</b>${i.age?", "+esc(i.age):""}<div class="muted text-xs">${esc(i.months||"?")} mo</div></td><td>${esc(i.venue)}</td><td>${esc(i.routine)}</td><td>${esc(i.obs)}</td><td>${esc(i.frus)}</td>
      <td><button class="text-xs underline muted" data-del="${i._id}">Delete</button></td></tr>`).join("")}</tbody></table></div>
    <h3 class="disp font-bold mt-5" style="font-size:1.2rem">Quote wall</h3>
    ${INT.filter(i=>i.quote&&i.consent).map(i=>`<blockquote class="mt-2 pl-3" style="border-left:4px solid var(--plate)">“${esc(i.quote)}”<div class="muted text-sm">${esc(i.name)}, ${esc(i.venue)}</div></blockquote>`).join("")||`<p class="muted text-sm">Quotes appear here once participants agree to be quoted.</p>`}
    <h3 class="disp font-bold mt-5" style="font-size:1.2rem">Copy for your submission</h3>
    <textarea class="field text-xs mt-1" rows="6" readonly>${esc(mdInterviews())}</textarea>`
    :`<p class="muted mt-2">No interviews yet. Aim for at least 2 venues so your insights aren't one gym's quirks.</p>`}
   </div></div></div>`;
  $("#exp")&&($("#exp").onclick=exportResearch);
  $("#saveI").onclick=async()=>{
    const v=id=>$("#"+id).value.trim(); if(!v("f_name")){toast("Add a first name");return}
    const doc={name:v("f_name"),age:v("f_age"),venue:v("f_venue"),months:v("f_months"),obs:v("f_obs"),frus:v("f_frus"),quote:v("f_quote"),consent:$("#f_consent").checked,at:Date.now()};
    Q.forEach(([k])=>doc[k]=v("f_"+k));
    try{await DB.collection("interviews").add(doc);toast("Interview saved")}catch(e){toast("Couldn't save. Check your connection and try again.")}
  };
  m.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this interview?"))try{await DB.doc("interviews/"+b.dataset.del).delete()}catch(e){toast("Couldn't delete")}});
}
function mdInterviews(){
  return "| Participant | Venue | Current routine | Key observation | Main frustration |\n|---|---|---|---|---|\n"+
   INT.map(i=>`| ${i.name}${i.age?", "+i.age:""} | ${i.venue} | ${(i.routine||"").replace(/\|/g,"/")} | ${(i.obs||"").replace(/\|/g,"/")} | ${(i.frus||"").replace(/\|/g,"/")} |`).join("\n");
}

const STAGES=[["tried","Tried the product"],["core","Completed a workout"],["reuse","Said they'd use it again"],["returned","Came back next day"],["w1","2+ workouts in week 1"],["swapped","Used Swap"]];
function funnelNums(){const n=TST.length;const c=k=>TST.filter(t=>t[k]).length;return {n,tried:c("tried"),core:c("core"),reuse:c("reuse"),returned:c("returned"),w1:c("w1"),swapped:c("swapped")}}
function pct(a,b){return b?Math.round(a/b*100)+"%":"–"}
function renderFunnel(m){
  const f=funnelNums();
  const rows=[["People approached",f.n,f.n],["Tried the product",f.tried,f.n],["Completed core action",f.core,f.tried],["Said they'd use it again",f.reuse,f.core],["Actually came back",f.returned,f.core]];
  m.innerHTML=`<div class="wrap wide">
   <h1 class="disp font-extrabold mt-2" style="font-size:2.4rem;line-height:1">Test funnel</h1>
   <p class="muted">Add everyone you approach, including people who say no. Tick stages as they happen; the numbers below are your submission table.</p>
   <div class="grid gap-5 mt-5" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
    <div class="card p-5">
     ${rows.map(([l,v,base])=>`<div class="mt-3"><div class="flex justify-between"><b>${l}</b><span><b class="disp" style="font-size:1.3rem">${v}</b> <span class="muted text-sm">${l==="People approached"?"":pct(v,base)+" of prev."}</span></span></div>
      <div class="bar mt-1"><i style="width:${f.n?v/f.n*100:0}%"></i></div></div>`).join("")}
     <div class="grid grid-cols-2 gap-3 mt-5">
      <div class="card p-3"><div class="disp font-extrabold" style="font-size:2rem">${pct(f.w1,f.core)}</div><div class="muted text-sm">Primary: 2+ workouts in week 1 (of activated)</div></div>
      <div class="card p-3"><div class="disp font-extrabold" style="font-size:2rem">${pct(f.swapped,f.core)}</div><div class="muted text-sm">Supporting: used Swap (of activated)</div></div></div>
     <h3 class="disp font-bold mt-5" style="font-size:1.2rem">Copy for your submission</h3>
     <textarea class="field text-xs mt-1" rows="7" readonly>| Metric | Number |\n|---|---|\n${rows.map(r=>`| ${r[0]} | ${r[1]} |`).join("\n")}\n| 2+ workouts in week 1 | ${f.w1} (${pct(f.w1,f.core)}) |</textarea>
    </div>
    <div class="card p-5">
     <h2 class="disp font-bold" style="font-size:1.5rem">Add a person</h2>
     <div class="grid grid-cols-2 gap-3"><div><label class="lb" for="t_name">Name or nickname</label><input class="field" id="t_name"></div>
     <div><label class="lb" for="t_venue">Where</label><input class="field" id="t_venue" placeholder="e.g. Cult.fit Sector 17"></div></div>
     <button class="btn btn-main mt-3" id="addT">Add to funnel</button>
     <div class="scrollx mt-4"><table class="tbl"><thead><tr><th>Person</th>${STAGES.map(s=>`<th>${s[1]}</th>`).join("")}<th>Notes</th></tr></thead><tbody>
     ${TST.map(t=>`<tr><td><b>${esc(t.name)}</b><div class="muted text-xs">${esc(t.venue)}</div></td>
       ${STAGES.map(([k])=>`<td><input type="checkbox" aria-label="${k}" data-tk="${t._id}|${k}" ${t[k]?"checked":""}></td>`).join("")}
       <td><input class="field text-xs" style="min-width:160px;padding:6px" data-note="${t._id}" value="${esc(t.note||"")}" placeholder="Where they got stuck"></td></tr>`).join("")}
     </tbody></table></div>
    </div></div></div>`;
  $("#addT").onclick=async()=>{const n=$("#t_name").value.trim();if(!n){toast("Add a name");return}
    try{await DB.collection("testers").add({name:n,venue:$("#t_venue").value.trim(),at:Date.now()});toast("Added")}catch(e){toast("Couldn't save")}};
  m.querySelectorAll("[data-tk]").forEach(c=>c.onchange=async()=>{const [id,k]=c.dataset.tk.split("|");try{await DB.doc("testers/"+id).update({[k]:c.checked})}catch(e){toast("Couldn't save")}});
  m.querySelectorAll("[data-note]").forEach(c=>c.onchange=async()=>{try{await DB.doc("testers/"+c.dataset.note).update({note:c.value})}catch(e){toast("Couldn't save")}});
}

function renderSynth(m){
  m.innerHTML=`<div class="wrap wide">
   <h1 class="disp font-extrabold mt-2" style="font-size:2.4rem;line-height:1">Insights</h1>
   <p class="muted">Turns your saved interviews and test notes into insights, a persona and a problem statement. It only uses what you logged, so it's only as good as your notes.</p>
   <button class="btn btn-main mt-4" style="max-width:360px" id="syn" ${SAMPLE&&INT.length?"":"disabled"}>${INT.length?`Synthesise ${INT.length} interviews`:"Log interviews first"}</button>
   ${!SAMPLE?`<p class="muted text-sm mt-2">AI synthesis isn't available in this view.</p>`:""}
   <div id="synOut" class="mt-5">${SYN?synHTML(SYN):""}</div></div>`;
  $("#syn").onclick=async()=>{
    const out=$("#synOut"); out.innerHTML=`<p class="muted">Reading your interviews…</p>`;
    const data=INT.map(i=>({name:i.name,age:i.age,venue:i.venue,months:i.months,routine:i.routine,choose:i.choose,problems:i.problems,apps:i.apps,consistency:i.consistency,wouldUse:i.wouldUse,observation:i.obs,frustration:i.frus,quote:i.consent?i.quote:""}));
    const notes=TST.filter(t=>t.note).map(t=>t.note);
    try{
      const r=await SAMPLE.json(`You are a senior product researcher. Synthesise ONLY from the interview data below; do not invent facts, names, numbers or quotes. Quotes must be copied verbatim from the "quote" fields (skip empty ones). Reply with ONLY JSON:
{"insights":[{"title":"","evidence":"which participants and what they said/did","implication":"what it means for the product"}] (exactly 3, beyond surface level: look for underlying causes like cognitive load, social anxiety, equipment bottlenecks, but only if the data supports it),
"quotes":[{"text":"","who":""}] (up to 3),
"persona":{"name":"","age":"","city":"","goal":"","behaviour":"","frustration":""} (a composite grounded in the data; name is fictional),
"problem":"2-3 sentences on why beginners drop off in the first 30 days, grounded in the data",
"gaps":"1-2 sentences on what the data does NOT yet show and who to interview next"}
INTERVIEWS: ${JSON.stringify(data)}
USER TEST NOTES: ${JSON.stringify(notes)}`,{modelTier:"complex"});
      SYN={...r,at:Date.now(),n:INT.length}; out.innerHTML=synHTML(SYN);
      try{await DB.doc("synthesis/latest").set(SYN)}catch(e){}
    }catch(e){out.innerHTML=`<p style="color:var(--warn)">Synthesis didn't finish${e&&e.code==="rate_limited"?" (rate limited — wait a minute)":""}. Your interviews are safe; try again.</p>`}
  };
}
function synHTML(s){
  return `<p class="muted text-sm">Based on ${s.n} interviews.</p>
  <div class="grid gap-4 mt-3" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
  ${(s.insights||[]).map((x,i)=>`<div class="card p-4"><div class="tag">Insight ${i+1}</div><h3 class="disp font-bold mt-2" style="font-size:1.35rem">${esc(x.title)}</h3><p class="text-sm mt-2"><b>Evidence:</b> ${esc(x.evidence)}</p><p class="text-sm mt-1"><b>So:</b> ${esc(x.implication)}</p></div>`).join("")}</div>
  <div class="card p-4 mt-4"><h3 class="disp font-bold" style="font-size:1.35rem">Persona: ${esc(s.persona?.name)}, ${esc(s.persona?.age)}, ${esc(s.persona?.city)}</h3>
   <p class="text-sm mt-1"><b>Goal:</b> ${esc(s.persona?.goal)}</p><p class="text-sm"><b>Behaviour:</b> ${esc(s.persona?.behaviour)}</p><p class="text-sm"><b>Frustration:</b> ${esc(s.persona?.frustration)}</p></div>
  <div class="card p-4 mt-4"><h3 class="disp font-bold" style="font-size:1.35rem">Problem statement</h3><p class="mt-1">${esc(s.problem)}</p></div>
  ${(s.quotes||[]).map(q=>`<blockquote class="mt-3 pl-3" style="border-left:4px solid var(--plate)">“${esc(q.text)}”<div class="muted text-sm">${esc(q.who)}</div></blockquote>`).join("")}
  <p class="muted text-sm mt-4"><b>Gaps:</b> ${esc(s.gaps)}</p>`;
}

render();
