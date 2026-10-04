(() => {
  "use strict";

  const CONFIG = {
    storageKey: "herzlabor-v2-progress",
    factDate: "04.10.2026",
    sources: {
      heart: "https://herzstiftung.de/infos-zu-herzerkrankungen/herzinfarkt/ursachen",
      heartEmergency: "https://herzstiftung.de/infos-zu-herzerkrankungen/herzinfarkt/anzeichen",
      organ: "https://www.organspende-info.de/",
      organLaw: "https://www.organspende-info.de/gesetzliche-grundlagen/entscheidungsloesung/",
      organRequirements: "https://www.organspende-info.de/organspende/voraussetzungen/",
      blood: "https://www.blutspende.de/blutspende/wissenswertes-ueber-blut-blutgruppen"
    }
  };

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const nearbyPrompt = document.getElementById("nearbyPrompt");
  const missionList = document.getElementById("missionList");
  const statusText = document.getElementById("statusText");
  const progressBar = document.getElementById("progressBar");
  const panelTitle = document.getElementById("panelTitle");
  const panelIntro = document.getElementById("panelIntro");
  const worldSubtitle = document.getElementById("worldSubtitle");
  const toastEl = document.getElementById("toast");

  const introModal = document.getElementById("introModal");
  const questModal = document.getElementById("questModal");
  const infoModal = document.getElementById("infoModal");
  const questTitle = document.getElementById("questTitle");
  const questSubtitle = document.getElementById("questSubtitle");
  const questIcon = document.getElementById("questIcon");
  const questKicker = document.getElementById("questKicker");
  const questContent = document.getElementById("questContent");
  const questFeedback = document.getElementById("questFeedback");
  const questActionBtn = document.getElementById("questActionBtn");
  const hintBox = document.getElementById("hintBox");
  const infoTitle = document.getElementById("infoTitle");
  const infoBody = document.getElementById("infoBody");

  const baseQuests = [
    { id:"blood", name:"Blutlabor", icon:"🩸", subtitle:"Blutbestandteile", x:130, y:115, color:"#a63d54" },
    { id:"vessels", name:"Gefäßstation", icon:"🛣️", subtitle:"Arterie, Vene, Kapillare", x:475, y:110, color:"#3a7ca5" },
    { id:"heart", name:"Herzkammer", icon:"❤️", subtitle:"Pumpe und Blutweg", x:800, y:120, color:"#c7435c" },
    { id:"circulation", name:"Kreislaufzentrale", icon:"🔄", subtitle:"Lunge – Herz – Körper", x:210, y:455, color:"#7d68b4" },
    { id:"measure", name:"Messlabor", icon:"📈", subtitle:"Puls und Blutdruck", x:730, y:455, color:"#4b9b7d" }
  ];
  const baseFinal = { id:"final", name:"Notfall-Zentrale", icon:"🚨", x:480, y:310, color:"#d19036", kind:"final" };
  const researchDoor = { id:"researchDoor", name:"Forschungstrakt", icon:"🚪", x:875, y:510, color:"#69d4ff", kind:"portal" };

  const hubPortals = [
    { id:"portalHeart", name:"Herzproblem", icon:"🫀", subtitle:"KHK & Herzinfarkt", x:190, y:250, color:"#e75b6f", branch:"heartBranch", kind:"portal" },
    { id:"portalOrgan", name:"Organspende", icon:"🫱🏻‍🫲🏽", subtitle:"Medizin, Recht & Ethik", x:480, y:250, color:"#9b83d4", branch:"organBranch", kind:"portal" },
    { id:"portalBlood", name:"Blutgruppen", icon:"🧬", subtitle:"AB0, Rhesus & Transfusion", x:770, y:250, color:"#4db2c9", branch:"bloodBranch", kind:"portal" },
    { id:"backBase", name:"Zurück ins Herzlabor", icon:"↩️", x:480, y:520, color:"#7d8ba3", kind:"back", targetWorld:"base" }
  ];

  const branchStages = {
    heartBranch: [
      {id:"heart1", name:"Versorgung des Herzens", icon:"🫀", subtitle:"Wer bringt Sauerstoff zum Herzmuskel?", x:150,y:150,color:"#e75b6f"},
      {id:"heart2", name:"Engstelle", icon:"🧱", subtitle:"Wie entsteht eine KHK?", x:455,y:130,color:"#d8b65e"},
      {id:"heart3", name:"Herzinfarkt", icon:"⚠️", subtitle:"Vom Plaque zum Gefäßverschluss", x:790,y:170,color:"#c84454"},
      {id:"heart4", name:"Notfall", icon:"☎️", subtitle:"Erkennen und richtig reagieren", x:500,y:455,color:"#ff7b65"},
      {id:"backHubH", name:"Zurück zum Forschungstrakt", icon:"↩️", x:110,y:515,color:"#7d8ba3",kind:"back",targetWorld:"hub"}
    ],
    organBranch: [
      {id:"organ1", name:"Patientenfall", icon:"🏥", subtitle:"Warum braucht jemand ein Spenderorgan?", x:150,y:145,color:"#967bd0"},
      {id:"organ2", name:"Zwei Voraussetzungen", icon:"🔐", subtitle:"Tod feststellen + Zustimmung", x:455,y:125,color:"#6a8ec9"},
      {id:"organ3", name:"Wer entscheidet?", icon:"⚖️", subtitle:"Rechte und Regeln in Deutschland", x:790,y:165,color:"#9d83d8"},
      {id:"organ4", name:"Entscheidungsraum", icon:"💭", subtitle:"Argumente prüfen – selbst entscheiden", x:500,y:455,color:"#b08dd7"},
      {id:"backHubO", name:"Zurück zum Forschungstrakt", icon:"↩️", x:110,y:515,color:"#7d8ba3",kind:"back",targetWorld:"hub"}
    ],
    bloodBranch: [
      {id:"blood1", name:"Antigen-Labor", icon:"🔬", subtitle:"Was macht A, B, AB und 0 aus?", x:150,y:145,color:"#44aec4"},
      {id:"blood2", name:"Antikörper-Scanner", icon:"🧪", subtitle:"Warum verträgt sich nicht jedes Blut?", x:455,y:125,color:"#5bb2c6"},
      {id:"blood3", name:"Transfusionspuzzle", icon:"🩸", subtitle:"Welcher Beutel passt zur Patientin?", x:790,y:165,color:"#cf5264"},
      {id:"blood4", name:"Notfall-Depot", icon:"🧰", subtitle:"Rhesusfaktor & 0 negativ", x:500,y:455,color:"#5e9ec8"},
      {id:"backHubB", name:"Zurück zum Forschungstrakt", icon:"↩️", x:110,y:515,color:"#7d8ba3",kind:"back",targetWorld:"hub"}
    ]
  };

  const branchMeta = {
    heartBranch:{title:"Im Herzen", subtitle:"Forschungsweg: KHK & Herzinfarkt", icon:"🫀", color:"#e75b6f"},
    organBranch:{title:"Transplantationszentrum", subtitle:"Forschungsweg: Organspende", icon:"🫱🏻‍🫲🏽", color:"#9b83d4"},
    bloodBranch:{title:"Transfusionslabor", subtitle:"Forschungsweg: Blutgruppen", icon:"🧬", color:"#4db2c9"}
  };

  let state = loadState();
  let world = state.world || "base";
  let activeQuest = null;
  let hintIndex = 0;
  let selectedAvatar = state.avatar || "🧑‍🔬";
  let keys = {};
  let touchDir = null;
  let lastTs = 0;
  let toastTimer = null;

  const player = { x: state.playerX || 480, y: state.playerY || 520, r:19, speed:215 };

  function defaultState(){
    return {
      completed:{}, finalDone:false,
      branchProgress:{heartBranch:{},organBranch:{},bloodBranch:{}},
      branchComplete:{heartBranch:false,organBranch:false,bloodBranch:false},
      avatar:"🧑‍🔬", playerX:480, playerY:520, world:"base"
    };
  }
  function loadState(){
    try{
      const raw=localStorage.getItem(CONFIG.storageKey);
      const d=defaultState();
      if(!raw)return d;
      const s=JSON.parse(raw);
      return {...d,...s,branchProgress:{...d.branchProgress,...(s.branchProgress||{})},branchComplete:{...d.branchComplete,...(s.branchComplete||{})}};
    }catch{return defaultState();}
  }
  function saveState(){
    state.avatar=selectedAvatar; state.playerX=Math.round(player.x); state.playerY=Math.round(player.y); state.world=world;
    try{localStorage.setItem(CONFIG.storageKey,JSON.stringify(state));}catch{}
  }
  function baseCount(){return baseQuests.filter(q=>state.completed[q.id]).length;}
  function allBaseComplete(){return baseCount()===baseQuests.length;}
  function branchStepCount(branch){return Object.values(state.branchProgress[branch]||{}).filter(Boolean).length;}
  function allBranchesComplete(){return Object.values(state.branchComplete).every(Boolean);}
  function showToast(msg){clearTimeout(toastTimer);toastEl.textContent=msg;toastEl.classList.add("show");toastTimer=setTimeout(()=>toastEl.classList.remove("show"),2500);}

  function getWorldTargets(){
    if(world==="base") return [...baseQuests,baseFinal,researchDoor];
    if(world==="hub") return hubPortals;
    return branchStages[world] || [];
  }
  function branchName(branch){return branchMeta[branch]?.title || "Forschungsweg";}
  function stageIndex(branch,id){return (branchStages[branch]||[]).filter(x=>!x.kind).findIndex(x=>x.id===id);}
  function stageUnlocked(branch,id){
    const idx=stageIndex(branch,id); if(idx<=0)return true;
    const prev=(branchStages[branch]||[]).filter(x=>!x.kind)[idx-1];
    return !!state.branchProgress[branch][prev.id];
  }

  function switchWorld(next){
    world=next;
    if(next==="base"){player.x=790;player.y=515;}
    else if(next==="hub"){player.x=480;player.y=510;}
    else {player.x=110;player.y=500;}
    saveState(); updateUI(); showToast(next==="hub"?"Drei neue Forschungswege sind geöffnet.": next==="base"?"Zurück im Herzlabor.":`${branchName(next)} betreten.`);
  }

  function updateUI(){
    missionList.innerHTML="";
    if(world==="base"){
      worldSubtitle.textContent="Mission Kreislauf · Ebene 1";
      panelTitle.textContent="Ebene 1: Herzlabor";
      panelIntro.textContent="Wiederhole und stabilisiere fünf bekannte Bereiche. Danach öffnet sich der Forschungstrakt.";
      const count=baseCount();
      statusText.textContent=`${count} von 5 Bereichen stabil${state.finalDone?" · Forschungstrakt offen":""}`;
      progressBar.style.width=`${((count+(state.finalDone?1:0))/6)*100}%`;
      baseQuests.forEach(q=>missionList.appendChild(missionItem(q,!!state.completed[q.id],false)));
      const finalItem={name:"Notfall-Zentrale",icon:"🚨",subtitle:allBaseComplete()?"Systemzusammenhang lösen":"erst nach 5 Bereichen"};
      missionList.appendChild(missionItem(finalItem,state.finalDone,!allBaseComplete()));
      const researchItem={name:"Forschungstrakt",icon:"🚪",subtitle:"3 neue Anschlusswelten"};
      missionList.appendChild(missionItem(researchItem,false,!state.finalDone,state.finalDone?"OFFEN":"🔒"));
      return;
    }
    if(world==="hub"){
      worldSubtitle.textContent="Forschungstrakt · Ebene 2";
      panelTitle.textContent="Wähle deinen Forschungsweg";
      panelIntro.textContent="Hier lernst du Neues. Die drei Wege können in beliebiger Reihenfolge bearbeitet werden.";
      const done=Object.values(state.branchComplete).filter(Boolean).length;
      statusText.textContent=`${done} von 3 Forschungswegen abgeschlossen`;
      progressBar.style.width=`${(done/3)*100}%`;
      hubPortals.filter(p=>p.branch).forEach(p=>{
        const b=p.branch; const c=branchStepCount(b);
        missionList.appendChild(missionItem({name:p.name,icon:p.icon,subtitle:`${c}/4 Stationen · ${p.subtitle}`},state.branchComplete[b],false));
      });
      if(allBranchesComplete()){
        const e=document.createElement("div");e.className="mission-item done";e.innerHTML=`<div class="mi-icon">🏆</div><div><strong>Forschungsauftrag erfüllt</strong><span>Alle drei Anschlusswelten abgeschlossen</span></div><div class="state">✓</div>`;missionList.appendChild(e);
      }
      return;
    }
    const meta=branchMeta[world];
    const steps=(branchStages[world]||[]).filter(x=>!x.kind);
    const done=branchStepCount(world);
    worldSubtitle.textContent=meta.subtitle;
    panelTitle.textContent=meta.title;
    panelIntro.textContent="Die Stationen bauen aufeinander auf. Entdecke den Zusammenhang Schritt für Schritt.";
    statusText.textContent=`${done} von ${steps.length} Stationen gelöst${state.branchComplete[world]?" · Forschungsweg abgeschlossen":""}`;
    progressBar.style.width=`${(done/steps.length)*100}%`;
    steps.forEach((s,i)=>missionList.appendChild(missionItem(s,!!state.branchProgress[world][s.id],!stageUnlocked(world,s.id),`${i+1}/${steps.length}`)));
  }
  function missionItem(q,done,locked,customState){
    const el=document.createElement("div"); el.className=`mission-item ${done?"done":""} ${locked?"locked":""}`;
    const stateText=done?"✓ GELÖST":locked?"🔒":customState||"⚠ OFFEN";
    el.innerHTML=`<div class="mi-icon">${q.icon}</div><div><strong>${q.name}</strong><span>${q.subtitle||""}</span></div><div class="state">${stateText}</div>`;
    return el;
  }

  function drawWorld(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(world==="base")drawBaseWorld();
    else if(world==="hub")drawHubWorld();
    else if(world==="heartBranch")drawHeartWorld();
    else if(world==="organBranch")drawOrganWorld();
    else drawBloodWorld();
    getWorldTargets().forEach(drawTarget);
    drawPlayer();
  }
  function drawFloor(bg="#101b2f"){
    ctx.fillStyle=bg;ctx.fillRect(0,0,960,600);
    ctx.strokeStyle="rgba(255,255,255,.035)";ctx.lineWidth=1;
    for(let x=24;x<960;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,600);ctx.stroke();}
    for(let y=0;y<600;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
  }
  function drawBaseWorld(){
    drawFloor("#101b2f");
    const zones=[
      [35,42,260,185,"BLUTLABOR","rgba(166,61,84,.13)"],[350,42,260,185,"GEFÄSSE","rgba(58,124,165,.13)"],[665,42,260,185,"HERZ","rgba(199,67,92,.13)"],
      [35,390,570,150,"KREISLAUFZENTRALE","rgba(125,104,180,.13)"],[665,390,260,150,"MESSLABOR","rgba(75,155,125,.13)"],[365,270,230,75,"NOTFALL-ZENTRALE","rgba(209,144,54,.09)"]
    ];
    zones.forEach(z=>{ctx.fillStyle=z[5];roundRect(ctx,z[0],z[1],z[2],z[3],16,true,false);ctx.fillStyle="rgba(255,255,255,.48)";ctx.font="700 14px system-ui";ctx.fillText(z[4],z[0]+12,z[1]+22);});
    ctx.fillStyle="rgba(105,212,255,.07)";roundRect(ctx,810,445,120,100,14,true,false);ctx.fillStyle="rgba(180,230,255,.7)";ctx.font="700 11px system-ui";ctx.fillText("FORSCHUNG",825,466);
  }
  function drawHubWorld(){
    drawFloor("#0c1730");
    ctx.fillStyle="rgba(105,212,255,.06)";roundRect(ctx,70,70,820,390,30,true,false);
    ctx.fillStyle="#dbeeff";ctx.font="900 28px system-ui";ctx.textAlign="center";ctx.fillText("FORSCHUNGSTRAKT",480,75);
    ctx.font="500 14px system-ui";ctx.fillStyle="rgba(219,238,255,.7)";ctx.fillText("Drei Portale · drei neue Lernwege",480,100);ctx.textAlign="left";
    drawPortalArch(190,250,"#e75b6f");drawPortalArch(480,250,"#9b83d4");drawPortalArch(770,250,"#4db2c9");
  }
  function drawPortalArch(x,y,color){
    ctx.save();ctx.translate(x,y);ctx.fillStyle="rgba(0,0,0,.28)";roundRect(ctx,-76,-98,152,196,28,true,false);ctx.strokeStyle=color;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,-24,62,Math.PI,0);ctx.lineTo(62,65);ctx.lineTo(-62,65);ctx.closePath();ctx.stroke();ctx.fillStyle=color;ctx.globalAlpha=.12;ctx.fill();ctx.restore();
  }
  function drawHeartWorld(){
    drawFloor("#2b0f1b");
    ctx.save();ctx.translate(480,300);ctx.fillStyle="rgba(188,55,75,.28)";ctx.beginPath();ctx.moveTo(0,190);ctx.bezierCurveTo(-250,70,-250,-130,-80,-125);ctx.bezierCurveTo(-10,-125,0,-60,0,-60);ctx.bezierCurveTo(0,-60,10,-125,80,-125);ctx.bezierCurveTo(250,-130,250,70,0,190);ctx.fill();ctx.restore();
    ctx.strokeStyle="rgba(255,184,190,.23)";ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(480,190);ctx.bezierCurveTo(590,190,700,235,760,330);ctx.stroke();ctx.lineWidth=7;ctx.strokeStyle="rgba(255,225,120,.55)";ctx.beginPath();ctx.moveTo(476,170);ctx.bezierCurveTo(560,175,650,220,715,315);ctx.stroke();
    ctx.fillStyle="rgba(255,230,232,.7)";ctx.font="800 15px system-ui";ctx.fillText("DU BIST IM HERZEN",35,38);
  }
  function drawOrganWorld(){
    drawFloor("#15162f");
    const rooms=[[50,65,260,180,"PATIENTENZIMMER"],[350,55,240,190,"INTENSIVSTATION"],[640,65,270,180,"RECHT & ENTSCHEIDUNG"],[315,360,380,170,"ETHIKRAUM"]];
    rooms.forEach(([x,y,w,h,l])=>{ctx.fillStyle="rgba(155,131,212,.08)";roundRect(ctx,x,y,w,h,18,true,false);ctx.strokeStyle="rgba(190,172,235,.2)";roundRect(ctx,x,y,w,h,18,false,true);ctx.fillStyle="rgba(235,229,255,.6)";ctx.font="700 13px system-ui";ctx.fillText(l,x+12,y+22);});
    ctx.fillStyle="rgba(255,255,255,.12)";ctx.fillRect(332,70,4,420);ctx.fillRect(616,70,4,420);
  }
  function drawBloodWorld(){
    drawFloor("#071f2b");
    ctx.fillStyle="rgba(77,178,201,.08)";roundRect(ctx,45,55,870,470,24,true,false);
    for(let i=0;i<18;i++){const x=70+(i*97)%820,y=80+((i*53)%400);ctx.fillStyle="rgba(200,68,88,.12)";ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,112,132,.18)";ctx.lineWidth=4;ctx.stroke();}
    ctx.fillStyle="rgba(213,248,255,.68)";ctx.font="800 15px system-ui";ctx.fillText("TRANSFUSIONSLABOR · Erythrozyten im Modell",35,38);
  }

  function drawTarget(q){
    const near=distance(player.x,player.y,q.x,q.y)<85;
    let done=false, locked=false;
    if(world==="base"){
      if(baseQuests.some(x=>x.id===q.id))done=!!state.completed[q.id];
      if(q.id==="final"){done=state.finalDone;locked=!allBaseComplete();}
      if(q.id==="researchDoor")locked=!state.finalDone;
    } else if(world==="hub" && q.branch){done=!!state.branchComplete[q.branch];}
    else if(branchMeta[world] && !q.kind){done=!!state.branchProgress[world][q.id];locked=!stageUnlocked(world,q.id);}

    ctx.save();ctx.translate(q.x,q.y);
    const color=locked?"#5f6c80":done?"#56d68b":q.color||"#69d4ff";
    ctx.fillStyle="rgba(4,10,20,.8)";roundRect(ctx,-34,-27,68,54,10,true,false);
    ctx.strokeStyle=near?"#fff":color;ctx.lineWidth=near?3:2;roundRect(ctx,-34,-27,68,54,10,false,true);
    ctx.fillStyle=color;ctx.globalAlpha=.88;ctx.fillRect(-23,-16,46,17);ctx.globalAlpha=1;
    ctx.font="700 19px system-ui";ctx.textAlign="center";ctx.fillStyle="#f6f8fc";ctx.fillText(locked?"🔒":q.icon,0,20);
    ctx.font="700 10px system-ui";ctx.fillStyle="rgba(255,255,255,.74)";ctx.fillText((q.name||"").toUpperCase().slice(0,22),0,44);
    ctx.restore();
  }
  function drawPlayer(){ctx.save();ctx.translate(player.x,player.y);ctx.fillStyle="rgba(0,0,0,.28)";ctx.beginPath();ctx.ellipse(0,20,17,7,0,0,Math.PI*2);ctx.fill();ctx.font="36px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(selectedAvatar,0,0);ctx.restore();}
  function roundRect(c,x,y,w,h,r,fill,stroke){if(w<2*r)r=w/2;if(h<2*r)r=h/2;c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();if(fill)c.fill();if(stroke)c.stroke();}
  function distance(x1,y1,x2,y2){return Math.hypot(x2-x1,y2-y1);}
  function movePlayer(dx,dy,dt){if(!dx&&!dy)return;const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;const step=player.speed*dt;player.x=Math.max(28,Math.min(932,player.x+dx*step));player.y=Math.max(32,Math.min(565,player.y+dy*step));saveState();}
  function nearestInteractable(){let best=null,bestD=Infinity;getWorldTargets().forEach(q=>{const d=distance(player.x,player.y,q.x,q.y);if(d<bestD){bestD=d;best=q;}});return bestD<95?best:null;}

  function interact(){
    if(anyModalOpen())return;
    const q=nearestInteractable(); if(!q){showToast("Geh näher an ein Terminal.");return;}
    if(world==="base"){
      if(q.id==="final"){if(!allBaseComplete())return showToast("Erst alle fünf Laborbereiche stabilisieren.");return openQuest("final");}
      if(q.id==="researchDoor"){if(!state.finalDone)return showToast("Der Forschungstrakt öffnet nach der Notfall-Zentrale.");return switchWorld("hub");}
      return openQuest(q.id);
    }
    if(world==="hub"){
      if(q.kind==="back")return switchWorld(q.targetWorld);
      if(q.branch)return switchWorld(q.branch);
    }
    if(branchMeta[world]){
      if(q.kind==="back")return switchWorld(q.targetWorld);
      if(!stageUnlocked(world,q.id))return showToast("Diese Station öffnet erst nach der vorherigen Aufgabe.");
      return openQuest(q.id);
    }
  }
  function anyModalOpen(){return questModal.classList.contains("open")||introModal.classList.contains("open")||infoModal.classList.contains("open");}
  function gameLoop(ts){const dt=Math.min((ts-lastTs)/1000||0,.04);lastTs=ts;let dx=0,dy=0;if(keys.ArrowLeft||keys.a||keys.A||touchDir==="left")dx--;if(keys.ArrowRight||keys.d||keys.D||touchDir==="right")dx++;if(keys.ArrowUp||keys.w||keys.W||touchDir==="up")dy--;if(keys.ArrowDown||keys.s||keys.S||touchDir==="down")dy++;if(!anyModalOpen())movePlayer(dx,dy,dt);drawWorld();const near=nearestInteractable();nearbyPrompt.classList.toggle("hidden",!near||anyModalOpen());if(near)nearbyPrompt.textContent=near.kind==="portal"||near.kind==="back"?"E / Enter: betreten":"E / Enter: untersuchen";requestAnimationFrame(gameLoop);}

  function openQuest(id){
    activeQuest=id;hintIndex=0;hintBox.classList.add("hidden");questFeedback.className="quest-feedback hidden";questFeedback.textContent="";
    const data=questData(id);questIcon.textContent=data.icon;questKicker.textContent=data.kicker||"MISSION";questTitle.textContent=data.title;questSubtitle.textContent=data.subtitle;questContent.innerHTML=data.html;questActionBtn.textContent=data.actionLabel||"Prüfen";questActionBtn.onclick=()=>data.check();wireInteractiveButtons();questModal.classList.add("open");
  }
  function closeQuest(){questModal.classList.remove("open");activeQuest=null;hintBox.classList.add("hidden");}
  function completeBase(id,msg){if(id==="final")state.finalDone=true;else state.completed[id]=true;saveState();updateUI();feedback(true,msg+(id!=="final"?"<br><br>✓ Dieser Laborbereich ist jetzt stabil.":"<br><br>🚪 Der Forschungstrakt ist jetzt geöffnet."));questActionBtn.textContent="Schließen";questActionBtn.onclick=closeQuest;}
  function completeBranch(branch,id,msg){state.branchProgress[branch][id]=true;const steps=(branchStages[branch]||[]).filter(x=>!x.kind);state.branchComplete[branch]=steps.every(s=>state.branchProgress[branch][s.id]);saveState();updateUI();feedback(true,msg+(state.branchComplete[branch]?"<br><br>🏁 Forschungsweg abgeschlossen. Kehre zum Forschungstrakt zurück und wähle einen weiteren Weg.":"<br><br>✓ Nächste Station freigeschaltet."));questActionBtn.textContent="Schließen";questActionBtn.onclick=closeQuest;}
  function feedback(good,msg){questFeedback.className=`quest-feedback ${good?"good":"bad"}`;questFeedback.innerHTML=msg;}
  function wireInteractiveButtons(){
    questContent.querySelectorAll(".option-btn[data-group]").forEach(btn=>btn.addEventListener("click",()=>{const g=btn.dataset.group;questContent.querySelectorAll(`.option-btn[data-group="${g}"]`).forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");}));
    questContent.querySelectorAll(".option-btn[data-toggle-group]").forEach(btn=>btn.addEventListener("click",()=>btn.classList.toggle("selected")));
  }
  function selectedValue(group){const el=questContent.querySelector(`.option-btn.selected[data-group="${group}"]`);return el?el.dataset.value:null;}
  function selectedToggleValues(group){return [...questContent.querySelectorAll(`.option-btn.selected[data-toggle-group="${group}"]`)].map(x=>x.dataset.value).sort();}
  function checkSimple(expected,success,complete){let missing=false,wrong=false;Object.entries(expected).forEach(([g,v])=>{const got=selectedValue(g);if(!got)missing=true;else if(got!==v)wrong=true;});if(missing)return feedback(false,"Bearbeite zuerst alle Teilaufgaben. Nutze bei Bedarf den H.E.R.Z.-Tipp.");if(wrong)return feedback(false,"Noch nicht ganz. Prüfe den Zusammenhang noch einmal.");complete(success);}
  function checkSelects(expected,success,complete){let missing=false,wrong=false;Object.entries(expected).forEach(([k,v])=>{const el=questContent.querySelector(`[data-answer="${k}"]`);if(!el||!el.value)missing=true;else if(el.value!==v)wrong=true;});if(missing)return feedback(false,"Fülle zuerst alle Felder aus.");if(wrong)return feedback(false,"Einige Zuordnungen stimmen noch nicht. Nutze den Tipp und prüfe Ursache und Wirkung.");complete(success);}

  function questData(id){
    const base={blood:bloodQuest,vessels:vesselQuest,circulation:circulationQuest,heart:heartQuest,measure:measureQuest,final:finalQuest};
    if(base[id])return base[id]();
    const branch={heart1,heart2,heart3,heart4,organ1,organ2,organ3,organ4,blood1,blood2,blood3,blood4};
    return branch[id]();
  }

  // -------- EBENE 1: Wiederholung --------
  function bloodQuest(){return {icon:"🩸",title:"Blutlabor",subtitle:"Blutbestandteile und ihre Kernaufgaben",hints:["Blutplasma transportiert gelöste Stoffe.","Erythrozyten: Sauerstoff · Leukozyten: Abwehr · Thrombozyten: Wundverschluss."],html:`
    <p class="task-title">Ordne die Kernaufgaben zu.</p><div class="match-grid">
    ${matchRow("plasma","Blutplasma",["","gelöste Stoffe transportieren","Sauerstoff transportieren","Krankheitserreger abwehren","Wundverschluss unterstützen"])}
    ${matchRow("ery","Erythrozyten",["","gelöste Stoffe transportieren","Sauerstoff transportieren","Krankheitserreger abwehren","Wundverschluss unterstützen"])}
    ${matchRow("leu","Leukozyten",["","gelöste Stoffe transportieren","Sauerstoff transportieren","Krankheitserreger abwehren","Wundverschluss unterstützen"])}
    ${matchRow("thr","Thrombozyten",["","gelöste Stoffe transportieren","Sauerstoff transportieren","Krankheitserreger abwehren","Wundverschluss unterstützen"])}
    </div><div class="alert-card"><strong>⚠ STÖRFALL:</strong> Eine Wunde hört nicht auf zu bluten.</div>${options("wound",[["Thrombozyten sind besonders wichtig.","yes"],["Leukozyten transportieren den Sauerstoff.","no"]])}`,actionLabel:"Labor prüfen",check:()=>{
      let bad=false,missing=false;const ex={plasma:"gelöste Stoffe transportieren",ery:"Sauerstoff transportieren",leu:"Krankheitserreger abwehren",thr:"Wundverschluss unterstützen"};Object.entries(ex).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`);if(!e.value)missing=true;else if(e.value!==v)bad=true;});if(!selectedValue("wound"))missing=true;if(selectedValue("wound")&&selectedValue("wound")!=="yes")bad=true;if(missing)return feedback(false,"Bearbeite zuerst alle Aufgaben.");if(bad)return feedback(false,"Prüfe die vier Kernaufgaben noch einmal.");completeBase("blood","Blut hat verschiedene Bestandteile mit unterschiedlichen Aufgaben. Das ist später bei Blutspenden wichtig.");}};}
  function vesselQuest(){return {icon:"🛣️",title:"Gefäßstation",subtitle:"Flussrichtung, Bau und Funktion",hints:["Arterie = vom Herzen weg. Vene = zum Herzen hin.","Kapillaren sind sehr fein und ermöglichen Stoffaustausch."],html:`<div class="match-grid">
    ${matchRow("away","vom Herzen weg",["","Arterie","Vene","Kapillare"])}${matchRow("toward","zum Herzen hin",["","Arterie","Vene","Kapillare"])}${matchRow("exchange","Stoffaustausch",["","Arterie","Vene","Kapillare"])}</div>
    <div class="alert-card"><strong>⚠ STÖRFALL:</strong> Ein Gefäß zu einem Organ ist verschlossen.</div>${options("blocked",[["Weniger Blut und Sauerstoff erreichen das Gewebe.","yes"],["Das Organ produziert selbst neues Blut.","no"]])}`,actionLabel:"Gefäßnetz prüfen",check:()=>{let bad=false,missing=false;const ex={away:"Arterie",toward:"Vene",exchange:"Kapillare"};Object.entries(ex).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`);if(!e.value)missing=true;else if(e.value!==v)bad=true;});if(!selectedValue("blocked"))missing=true;if(selectedValue("blocked")&&selectedValue("blocked")!=="yes")bad=true;if(missing)return feedback(false,"Bearbeite zuerst alle Aufgaben.");if(bad)return feedback(false,"Prüfe Flussrichtung und Stoffaustausch.");completeBase("vessels","Gefäße bilden das Transportnetz. Wird ein Gefäß blockiert, kann Gewebe zu wenig Sauerstoff erhalten.");}};}
  function circulationQuest(){return {icon:"🔄",title:"Kreislaufzentrale",subtitle:"Doppelter Blutkreislauf",hints:["rechte Herzhälfte → Lunge → linke Herzhälfte → Körper → rechte Herzhälfte","In der Lunge nimmt das Blut Sauerstoff auf."],html:`<div class="match-grid">${matchRow("c1","Start: rechte Herzhälfte →",["","Lunge","Körper"])}${matchRow("c2","danach →",["","linke Herzhälfte","rechte Herzhälfte"])}${matchRow("c3","danach →",["","Körper","Lunge"])}${matchRow("c4","danach →",["","rechte Herzhälfte","linke Herzhälfte"])}</div>${options("lung",[["In der Lunge nimmt das Blut Sauerstoff auf und gibt Kohlenstoffdioxid ab.","yes"],["Die Lunge bildet das Blut.","no"]])}`,actionLabel:"Kreislauf prüfen",check:()=>{const ex={c1:"Lunge",c2:"linke Herzhälfte",c3:"Körper",c4:"rechte Herzhälfte"};let bad=false,missing=false;Object.entries(ex).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`);if(!e.value)missing=true;else if(e.value!==v)bad=true;});if(!selectedValue("lung"))missing=true;if(selectedValue("lung")&&selectedValue("lung")!=="yes")bad=true;if(missing)return feedback(false,"Bearbeite zuerst alle Aufgaben.");if(bad)return feedback(false,"Der Blutweg stimmt noch nicht ganz.");completeBase("circulation","Lungen- und Körperkreislauf arbeiten als verbundenes System zusammen.");}};}
  function heartQuest(){return {icon:"❤️",title:"Herzkammer",subtitle:"Pumpe, Blutweg und Herzklappen",hints:["Körper → Hohlvene → rechter Vorhof → rechte Herzkammer → Lungenarterie → Lunge","Lunge → Lungenvene → linker Vorhof → linke Herzkammer → Aorta → Körper"],html:`<div class="match-grid">${matchRow("h1","Aus dem Körper über …",["","Hohlvene","Aorta","Lungenvene"])}${matchRow("h2","zur Lunge über …",["","Lungenarterie","Lungenvene","Aorta"])}${matchRow("h3","aus der Lunge über …",["","Lungenvene","Lungenarterie","Hohlvene"])}${matchRow("h4","in den Körper über …",["","Aorta","Hohlvene","Lungenvene"])}</div>${options("valve",[["Herzklappen verhindern, dass Blut einfach zurückfließt.","yes"],["Herzklappen bilden Sauerstoff.","no"]])}`,actionLabel:"Herz prüfen",check:()=>{const ex={h1:"Hohlvene",h2:"Lungenarterie",h3:"Lungenvene",h4:"Aorta"};let bad=false,missing=false;Object.entries(ex).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`);if(!e.value)missing=true;else if(e.value!==v)bad=true;});if(!selectedValue("valve"))missing=true;if(selectedValue("valve")&&selectedValue("valve")!=="yes")bad=true;if(missing)return feedback(false,"Bearbeite zuerst alle Aufgaben.");if(bad)return feedback(false,"Prüfe den Weg durch rechte und linke Herzhälfte.");completeBase("heart","Das Herz ist eine Pumpe mit gerichteten Wegen. Die Klappen helfen, Rückfluss zu verhindern.");}};}
  function measureQuest(){return {icon:"📈",title:"Messlabor",subtitle:"Puls und Blutdruck",hints:["Bei Bewegung brauchen Muskeln mehr Sauerstoff; die Pulsfrequenz steigt meist.","120/80: 120 = systolisch, 80 = diastolisch."],html:`<div class="bp-box"><div class="bp-value"><div>Ruhe</div><div class="big">72</div><small>pro Minute</small></div><div class="bp-value"><div>nach Bewegung</div><div class="big">116</div><small>pro Minute</small></div><div class="bp-value"><div>Erholung</div><div class="big">86</div><small>pro Minute</small></div></div>${options("pulse",[["Nach Bewegung steigt der Puls, weil Muskeln mehr Sauerstoff brauchen.","yes"],["Nach Bewegung sinkt der Puls immer sofort.","no"]])}<div class="match-grid" style="margin-top:12px">${matchRow("sys","120 mmHg",["","systolischer Wert","diastolischer Wert"])}${matchRow("dia","80 mmHg",["","systolischer Wert","diastolischer Wert"])}</div>`,actionLabel:"Messwerte prüfen",check:()=>{const ex={sys:"systolischer Wert",dia:"diastolischer Wert"};let bad=false,missing=false;Object.entries(ex).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`);if(!e.value)missing=true;else if(e.value!==v)bad=true;});if(!selectedValue("pulse"))missing=true;if(selectedValue("pulse")&&selectedValue("pulse")!=="yes")bad=true;if(missing)return feedback(false,"Bearbeite zuerst alle Aufgaben.");if(bad)return feedback(false,"Prüfe Pulsveränderung und Blutdruckwerte.");completeBase("measure","Puls und Blutdruck zeigen unterschiedliche Aspekte der Herz-Kreislauf-Arbeit.");}};}
  function finalQuest(){return {icon:"🚨",kicker:"FINALE EBENE 1",title:"Systemcheck",subtitle:"Verbinde Pumpfunktion, Bluttransport und Sauerstoffversorgung.",hints:["Ohne Pumpen wird Blut nicht ausreichend transportiert.","Dann erhalten Organe zu wenig Sauerstoff."],html:`<div class="alert-card"><strong>SYSTEMKRITISCH:</strong> Das Herz pumpt nicht mehr ausreichend.</div><div class="match-grid">${matchRow("f1","1. zuerst",["","Blut wird nicht ausreichend transportiert","Zellen werden geschädigt","Organe erhalten zu wenig Sauerstoff"])}${matchRow("f2","2. dann",["","Organe erhalten zu wenig Sauerstoff","Blut wird nicht ausreichend transportiert","Zellen werden geschädigt"])}${matchRow("f3","3. schließlich",["","Zellen können geschädigt werden","Organe erhalten zu wenig Sauerstoff","Blut wird nicht ausreichend transportiert"])}</div><div class="aha-card"><strong>AHA:</strong> Du hast jetzt das ganze System verstanden. Im Forschungstrakt geht es nicht mehr nur um Wiederholung – dort lernst du neue Zusammenhänge.</div>`,actionLabel:"Forschungstrakt öffnen",check:()=>checkSelects({f1:"Blut wird nicht ausreichend transportiert",f2:"Organe erhalten zu wenig Sauerstoff",f3:"Zellen können geschädigt werden"},"Du hast die Ursache-Wirkungs-Kette gelöst.",msg=>completeBase("final",msg))};}

  // -------- FORSCHUNGSWEG 1: KHK & HERZINFARKT --------
  function heart1(){return {icon:"🫀",kicker:"NEUES WISSEN · AHA 1",title:"Wer versorgt eigentlich das Herz?",subtitle:"Du bist im Herzen – aber der Herzmuskel braucht selbst Sauerstoff.",hints:["Das Blut in den Herzkammern fließt nicht einfach direkt in den Herzmuskel.","Eigene Gefäße auf der Herzoberfläche versorgen den Herzmuskel: die Herzkranzgefäße."],html:`<div class="branch-banner">🫀 Forschungsweg Herzproblem</div><div class="discovery-card"><strong>Beobachtung:</strong> Das Herz pumpt sauerstoffreiches Blut in den Körper. Trotzdem braucht auch der Herzmuskel selbst ständig Sauerstoff.</div><p class="task-title">Wie bekommt der Herzmuskel Sauerstoff?</p>${options("supply",[["Über die Herzkranzgefäße (Koronararterien), die den Herzmuskel mit Blut versorgen.","coronary"],["Direkt aus dem Blut, das gerade durch die Herzkammern fließt.","inside"],["Der Herzmuskel braucht keinen Sauerstoff.","none"]])}<div class="aha-card"><strong>AHA:</strong> Das Herz versorgt den Körper – und hat dafür ein eigenes Versorgungsnetz.</div><p class="source-note">Fachliche Grundlage: Deutsche Herzstiftung · Herzkranzgefäße versorgen den Herzmuskel.</p>`,actionLabel:"AHA prüfen",check:()=>checkSimple({supply:"coronary"},"Richtig: Die Herzkranzgefäße bringen Blut und Sauerstoff zum Herzmuskel.",msg=>completeBranch("heartBranch","heart1",msg))};}
  function heart2(){return {icon:"🧱",kicker:"NEUES WISSEN · AHA 2",title:"Wenn die Versorgung enger wird",subtitle:"Wie aus einer Gefäßverengung eine koronare Herzkrankheit werden kann.",hints:["Ablagerungen in der Gefäßwand heißen Plaques.","Je enger das Herzkranzgefäß, desto schwieriger kann die Sauerstoffversorgung des Herzmuskels werden – besonders bei Belastung."],html:`<div class="vessel-demo"><div class="vessel-tube"><div class="plaque left"></div><div class="plaque right"></div><div class="flow-dot"></div></div></div><p class="task-title">Was siehst du im Modell?</p>${options("narrow",[["Plaques verengen den Innenraum des Herzkranzgefäßes; weniger Blut kann hindurchfließen.","yes"],["Das Herzkranzgefäß wird durch Plaques weiter und transportiert mehr Sauerstoff.","no"]])}<p class="task-title">Warum merkt man eine Verengung oft zuerst bei Belastung?</p>${options("load",[["Der Herzmuskel braucht bei Belastung mehr Sauerstoff, die verengten Gefäße können den Bedarf schlechter decken.","yes"],["Bei Belastung braucht der Herzmuskel keinen Sauerstoff mehr.","no"]])}<div class="fact-card"><span class="tag">Begriff</span><strong>Koronare Herzkrankheit (KHK)</strong>: Erkrankung der Herzkranzgefäße, bei der Ablagerungen die Gefäße verengen können.</div>`,actionLabel:"Gefäß untersuchen",check:()=>checkSimple({narrow:"yes",load:"yes"},"Du hast den Zusammenhang erkannt: Verengte Herzkranzgefäße können den Herzmuskel schlechter mit Sauerstoff versorgen.",msg=>completeBranch("heartBranch","heart2",msg))};}
  function heart3(){return {icon:"⚠️",kicker:"NEUES WISSEN · AHA 3",title:"Vom Plaque zum Herzinfarkt",subtitle:"Ein Herzinfarkt ist ein Problem der Blutversorgung des Herzmuskels.",hints:["Ein Plaque kann aufbrechen. Dann kann sich ein Blutgerinnsel bilden.","Verschließt das Gerinnsel ein Herzkranzgefäß, wird Herzmuskelgewebe hinter dem Verschluss nicht mehr ausreichend versorgt."],html:`<div class="vessel-demo"><div class="vessel-tube"><div class="plaque left"></div><div class="plaque right"></div><div class="clot"></div></div></div><p class="task-title">Baue die Ursache-Wirkungs-Kette.</p><div class="match-grid">${matchRow("mi1","1",["","Plaque kann aufbrechen","Herzmuskel bekommt zu wenig Sauerstoff","Blutgerinnsel kann Gefäß verschließen","Herzmuskelzellen können absterben"])}${matchRow("mi2","2",["","Blutgerinnsel kann Gefäß verschließen","Plaque kann aufbrechen","Herzmuskel bekommt zu wenig Sauerstoff","Herzmuskelzellen können absterben"])}${matchRow("mi3","3",["","Herzmuskel bekommt zu wenig Sauerstoff","Blutgerinnsel kann Gefäß verschließen","Herzmuskelzellen können absterben"])}${matchRow("mi4","4",["","Herzmuskelzellen können absterben","Herzmuskel bekommt zu wenig Sauerstoff","Plaque kann aufbrechen"])}</div><div class="aha-card"><strong>AHA:</strong> Beim Herzinfarkt ist nicht „das ganze Herz plötzlich kaputt“. Ein verschlossenes Herzkranzgefäß unterbricht die Versorgung eines Bereichs des Herzmuskels.</div>`,actionLabel:"Infarkt erklären",check:()=>checkSelects({mi1:"Plaque kann aufbrechen",mi2:"Blutgerinnsel kann Gefäß verschließen",mi3:"Herzmuskel bekommt zu wenig Sauerstoff",mi4:"Herzmuskelzellen können absterben"},"Die Kette stimmt: Verschluss → Sauerstoffmangel → Schädigung des Herzmuskels.",msg=>completeBranch("heartBranch","heart3",msg))};}
  function heart4(){return {icon:"☎️",kicker:"TRANSFER · NOTFALL",title:"Zeit ist Herzmuskel",subtitle:"Was ist bei Verdacht auf einen Herzinfarkt wichtig?",hints:["Typische Warnzeichen können starke Brustschmerzen oder Druck/Enge, Atemnot, kalter Schweiß, Übelkeit oder Schmerzen in anderen Körperregionen sein.","Beschwerden können unterschiedlich sein. Bei Verdacht auf einen Herzinfarkt ist schnelle medizinische Hilfe wichtig: 112."],html:`<div class="patient-card"><div class="patient-avatar">🧑</div><div><strong>Fall:</strong><p>Eine Person hat plötzlich starke Schmerzen und Druck im Brustkorb, ist blass und kaltschweißig. Sie bekommt schlecht Luft.</p></div></div><p class="task-title">Was ist die sicherste Reaktion?</p>${options("emergency",[["Sofort den Rettungsdienst über 112 rufen.","112"],["Erst einmal mehrere Stunden abwarten.","wait"],["Die Person allein nach Hause schicken.","home"]])}<p class="task-title">Warum zählt Zeit?</p>${options("time",[["Je länger ein Herzkranzgefäß verschlossen ist, desto mehr Herzmuskelgewebe kann geschädigt werden.","damage"],["Weil das Blut nach fünf Minuten seine Blutgruppe ändert.","blood"]])}<div class="fact-card"><span class="tag">Wichtig</span>Das Spiel stellt keine Diagnose. Es zeigt nur: Ein möglicher Herzinfarkt ist ein medizinischer Notfall.</div>`,actionLabel:"Notfall lösen",check:()=>checkSimple({emergency:"112",time:"damage"},"Richtig: Bei Verdacht auf einen Herzinfarkt zählt schnelle Hilfe. In Deutschland wird der Rettungsdienst über 112 alarmiert.",msg=>completeBranch("heartBranch","heart4",msg))};}

  // -------- FORSCHUNGSWEG 2: ORGANSPENDE --------
  function organ1(){return {icon:"🏥",kicker:"NEUES WISSEN · FALL 1",title:"Ein Organ kann ausfallen",subtitle:"Warum kann eine Transplantation notwendig werden?",hints:["Eine Transplantation ersetzt die Funktion eines schwer geschädigten Organs durch ein Spenderorgan.","Nach dem Tod können in Deutschland unter bestimmten Voraussetzungen Herz, Lunge, Leber, Nieren, Bauchspeicheldrüse und Dünndarm gespendet werden."],html:`<div class="patient-card"><div class="patient-avatar">🧑‍🦱</div><div><strong>Fall Mika (fiktiv)</strong><p>Mikas Herz ist schwer erkrankt. Trotz Behandlung kann es den Körper nicht mehr ausreichend versorgen. Das Transplantationsteam prüft, ob ein Spenderherz helfen kann.</p></div></div><p class="task-title">Was bedeutet Transplantation?</p>${options("tx",[["Ein funktionsfähiges Organ wird auf einen schwer erkrankten Menschen übertragen, um die fehlende Organfunktion zu ersetzen.","replace"],["Ein Organ wird nur fotografiert und wieder eingesetzt.","photo"]])}<p class="task-title">Welche Organe können nach dem Tod in Deutschland gespendet werden?</p>${options("organs",[["Herz, Lunge, Leber, Nieren, Bauchspeicheldrüse und Dünndarm.","six"],["Nur Herz und Niere.","two"],["Jedes beliebige Körperteil gilt automatisch als Organtransplantation.","all"]])}<div class="aha-card"><strong>AHA:</strong> Für manche schwer kranke Menschen kann ein Spenderorgan eine fehlende Organfunktion ersetzen. Gleichzeitig gibt es deutlich weniger Spenderorgane als Menschen auf Wartelisten.</div>`,actionLabel:"Fall verstehen",check:()=>checkSimple({tx:"replace",organs:"six"},"Du hast verstanden, was eine Organtransplantation leisten kann – und welche Organe postmortal gespendet werden können.",msg=>completeBranch("organBranch","organ1",msg))};}
  function organ2(){return {icon:"🔐",kicker:"NEUES WISSEN · ZWEI SCHLÜSSEL",title:"Wann ist eine Organspende nach dem Tod möglich?",subtitle:"Medizinische und rechtliche Voraussetzungen",hints:["Schlüssel 1: Der unumkehrbare Ausfall der gesamten Hirnfunktionen muss zweifelsfrei festgestellt sein.","Schlüssel 2: Es muss eine Zustimmung zur Organspende vorliegen oder der Wille entsprechend geklärt werden.","Hirntod ist nicht dasselbe wie Koma. Beim Hirntod sind sämtliche Hirnfunktionen unumkehrbar ausgefallen; damit ist der Tod festgestellt."],html:`<div class="discovery-card"><strong>Im Intensivzimmer:</strong> Maschinen können Kreislauf und Atmung noch eine Zeit lang künstlich aufrechterhalten. Dadurch können Organe weiter durchblutet werden.</div><p class="task-title">Welche zwei Voraussetzungen müssen für eine postmortale Organspende erfüllt sein?</p>${options("lock1",[["Der unumkehrbare Ausfall der gesamten Hirnfunktionen ist festgestellt.","brain"],["Die Person schläft sehr tief.","sleep"]])}${options("lock2",[["Eine Zustimmung zur Organspende liegt vor bzw. der Wille wird geklärt.","consent"],["Organe dürfen automatisch immer entnommen werden.","automatic"]])}<p class="task-title">Welche Aussage ist richtig?</p>${options("coma",[["Hirntod und Koma sind nicht dasselbe.","different"],["Hirntod bedeutet nur, dass jemand bewusstlos ist und wieder aufwachen kann.","same"]])}`,actionLabel:"Zwei Schlüssel prüfen",check:()=>checkSimple({lock1:"brain",lock2:"consent",coma:"different"},"Beide Schlüssel sind nötig: zweifelsfrei festgestellter Tod durch unumkehrbaren Ausfall der gesamten Hirnfunktionen und eine geklärte Zustimmung.",msg=>completeBranch("organBranch","organ2",msg))};}
  function organ3(){return {icon:"⚖️",kicker:"NEUES WISSEN · RECHT",title:"Wer entscheidet?",subtitle:`Regeln in Deutschland · Stand ${CONFIG.factDate}`,hints:["In Deutschland gilt die Entscheidungslösung: Organe werden nicht automatisch entnommen.","Ab 14 Jahren kann ein Widerspruch erklärt werden; ab 16 Jahren kann die Bereitschaft zur Spende erklärt werden.","Ist keine Entscheidung bekannt, werden Angehörige nach dem mutmaßlichen Willen der verstorbenen Person gefragt."],html:`<div class="fact-card"><span class="tag">Deutschland</span>Es gilt die <strong>Entscheidungslösung</strong>. Eine Entnahme setzt Zustimmung voraus. Ein dokumentiertes Nein ist ebenfalls verbindlich.</div><p class="task-title">Ordne die Altersgrenzen zu.</p><div class="match-grid">${matchRow("age14","ab vollendetem 14. Lebensjahr",["","Widerspruch erklären","Zustimmung zur Spende erklären"])}${matchRow("age16","ab vollendetem 16. Lebensjahr",["","Zustimmung zur Spende erklären","nur Angehörige dürfen entscheiden"])}</div><p class="task-title">Es liegt keine bekannte Entscheidung vor. Was passiert?</p>${options("family",[["Die nächsten Angehörigen werden gebeten, nach dem bekannten oder mutmaßlichen Willen der verstorbenen Person zu entscheiden.","will"],["Das Krankenhaus darf automatisch alle Organe entnehmen.","auto"]])}<div class="aha-card"><strong>AHA:</strong> Mitbestimmung bedeutet auch: <em>Ja</em>, <em>Nein</em> und eine spätere Änderung der Entscheidung sind möglich. Niemand muss sich im Unterricht öffentlich festlegen.</div>`,actionLabel:"Regeln prüfen",check:()=>{let bad=false,missing=false;const a=questContent.querySelector('[data-answer="age14"]'),b=questContent.querySelector('[data-answer="age16"]');if(!a.value||!b.value||!selectedValue("family"))missing=true;if(a.value&&a.value!=="Widerspruch erklären")bad=true;if(b.value&&b.value!=="Zustimmung zur Spende erklären")bad=true;if(selectedValue("family")&&selectedValue("family")!=="will")bad=true;if(missing)return feedback(false,"Bearbeite zuerst alle Aufgaben.");if(bad)return feedback(false,"Prüfe die Altersgrenzen und die Entscheidungslösung noch einmal.");completeBranch("organBranch","organ3","Richtig: Das Selbstbestimmungsrecht steht im Mittelpunkt. Ein dokumentierter Wille ist maßgeblich; ohne bekannte Entscheidung werden Angehörige einbezogen.");}};}
  function organ4(){return {icon:"💭",kicker:"ETHIK · KEINE MUSTERANTWORT",title:"Warum entscheiden Menschen unterschiedlich?",subtitle:"Fakten prüfen, Werte respektieren, eigene Position entwickeln",hints:["Eine ethische Entscheidung kann persönliche Werte, religiöse oder spirituelle Überzeugungen, Vorstellungen vom Körper nach dem Tod, Vertrauen oder Unsicherheit berücksichtigen.","Fakten lassen sich prüfen. Persönliche Wertentscheidungen können trotzdem unterschiedlich ausfallen.","Du darfst hier Ja, Nein oder ‚noch unsicher‘ wählen. Diese Auswahl wird nicht gespeichert."],html:`<div class="patient-card"><div class="patient-avatar">🧑‍🦱</div><div><strong>Mika wartet weiterhin auf ein Spenderherz.</strong><p>Dass Spenderorgane gebraucht werden, ist ein Fakt. Ob jemand die eigenen Organe nach dem Tod spenden möchte, bleibt trotzdem eine persönliche Entscheidung.</p></div></div><div class="ethic-grid"><div class="ethic-item"><strong>Perspektive A:</strong> „Ich möchte nach meinem Tod anderen Menschen helfen.“</div><div class="ethic-item"><strong>Perspektive B:</strong> „Ich möchte nicht, dass nach meinem Tod Organe entnommen werden.“</div><div class="ethic-item"><strong>Perspektive C:</strong> „Ich bin noch unsicher und möchte mich erst weiter informieren.“</div></div><p class="task-title">Welche Aussage passt zu einer fairen ethischen Auseinandersetzung?</p>${options("fair",[["Man informiert sich über Fakten und respektiert, dass Menschen zu unterschiedlichen persönlichen Entscheidungen kommen können.","respect"],["Nur eine Entscheidung ist moralisch erlaubt; alle anderen müssen überzeugt werden.","force"]])}<div class="reflection"><strong>Nur für dich:</strong><p>Wie ist dein Stand <em>jetzt</em>? Deine Auswahl wird nicht gespeichert und nicht bewertet.</p>${options("private",[["Ich könnte mir eine Organspende vorstellen.","yes"],["Ich möchte das für mich nicht.","no"],["Ich weiß es noch nicht und brauche mehr Informationen.","unsure"]])}</div><p class="source-note">Hinweis: Gründe für Zustimmung, Ablehnung oder Unsicherheit können sehr verschieden sein. Das BIÖG nennt u. a. religiöse/ethische/spirituelle Gründe, Unsicherheit, Körpervorstellungen und Vertrauen als Themen der Entscheidungsfindung.</p>`,actionLabel:"Entscheidungsraum verlassen",check:()=>{if(!selectedValue("fair")||!selectedValue("private"))return feedback(false,"Beantworte die Fairness-Frage und wähle für dich eine der drei privaten Möglichkeiten.");if(selectedValue("fair")!=="respect")return feedback(false,"Eine faire Auseinandersetzung trennt überprüfbare Fakten von persönlichen Wertentscheidungen und respektiert unterschiedliche Positionen.");completeBranch("organBranch","organ4","Du hast Fakten und persönliche Werte getrennt. Deine persönliche Auswahl wurde nicht gespeichert. Informierte Selbstbestimmung ist das Ziel – nicht eine bestimmte Antwort.");}};}

  // -------- FORSCHUNGSWEG 3: BLUTGRUPPEN --------
  function blood1(){return {icon:"🔬",kicker:"NEUES WISSEN · AHA 1",title:"Blutgruppen sitzen auf den Erythrozyten",subtitle:"A, B, AB und 0 unterscheiden sich durch Merkmale auf der Zelloberfläche.",hints:["Antigen A auf den roten Blutkörperchen → Blutgruppe A.","Antigen B → Blutgruppe B. Beide → AB. Keine A/B-Merkmale → 0."],html:`<div class="rbc"><span class="antigen a1">A</span><span class="antigen b1">B</span></div><div class="discovery-card"><strong>Neuer Begriff:</strong> Ein <strong>Antigen</strong> ist hier ein Merkmal auf der Oberfläche roter Blutkörperchen.</div><p class="task-title">Ordne die Oberflächenmerkmale zu.</p><div class="match-grid">${matchRow("A","Blutgruppe A",["","Antigen A","Antigen B","Antigen A und B","kein A-/B-Antigen"])}${matchRow("B","Blutgruppe B",["","Antigen B","Antigen A","Antigen A und B","kein A-/B-Antigen"])}${matchRow("AB","Blutgruppe AB",["","Antigen A und B","Antigen A","Antigen B","kein A-/B-Antigen"])}${matchRow("O","Blutgruppe 0",["","kein A-/B-Antigen","Antigen A","Antigen B","Antigen A und B"])}</div><div class="aha-card"><strong>AHA:</strong> Blutgruppen sind nicht einfach „Farben“ von Blut. Sie beschreiben bestimmte Merkmale auf roten Blutkörperchen.</div>`,actionLabel:"Antigene prüfen",check:()=>checkSelects({A:"Antigen A",B:"Antigen B",AB:"Antigen A und B",O:"kein A-/B-Antigen"},"Du kannst die vier AB0-Blutgruppen jetzt über ihre Oberflächenmerkmale unterscheiden.",msg=>completeBranch("bloodBranch","blood1",msg))};}
  function blood2(){return {icon:"🧪",kicker:"NEUES WISSEN · AHA 2",title:"Der Antikörper-Scanner",subtitle:"Warum kann falsches Blut gefährlich werden?",hints:["Blutgruppe A: Antikörper gegen B. Blutgruppe B: Antikörper gegen A.","Blutgruppe AB: keine Anti-A-/Anti-B-Antikörper. Blutgruppe 0: Anti-A und Anti-B.","Treffen passende Antikörper auf fremde A/B-Antigene, kann es zu gefährlichen Transfusionsreaktionen kommen."],html:`<div class="fact-card"><span class="tag">Plasma</span>Im Blutplasma befinden sich Antikörper. Sie können fremde A- oder B-Merkmale erkennen.</div><p class="task-title">Ordne die Antikörper im vereinfachten AB0-Modell zu.</p><div class="match-grid">${matchRow("antiA","Blutgruppe A",["","Anti-B","Anti-A","Anti-A und Anti-B","keine Anti-A/Anti-B"])}${matchRow("antiB","Blutgruppe B",["","Anti-A","Anti-B","Anti-A und Anti-B","keine Anti-A/Anti-B"])}${matchRow("antiAB","Blutgruppe AB",["","keine Anti-A/Anti-B","Anti-A","Anti-B","Anti-A und Anti-B"])}${matchRow("antiO","Blutgruppe 0",["","Anti-A und Anti-B","keine Anti-A/Anti-B","Anti-A","Anti-B"])}</div><p class="task-title">Was kann bei einer unverträglichen Transfusion passieren?</p>${options("reaction",[["Antikörper können auf fremde Merkmale reagieren; es kann zu einer lebensgefährlichen Transfusionsreaktion kommen.","danger"],["Die Blutgruppe des Empfängers ändert sich einfach dauerhaft zur Spendergruppe.","change"]])}`,actionLabel:"Scanner auswerten",check:()=>{let bad=false,missing=false;const ex={antiA:"Anti-B",antiB:"Anti-A",antiAB:"keine Anti-A/Anti-B",antiO:"Anti-A und Anti-B"};Object.entries(ex).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`);if(!e.value)missing=true;else if(e.value!==v)bad=true;});if(!selectedValue("reaction"))missing=true;if(selectedValue("reaction")&&selectedValue("reaction")!=="danger")bad=true;if(missing)return feedback(false,"Bearbeite zuerst alle Aufgaben.");if(bad)return feedback(false,"Prüfe: A trägt A und hat Anti-B; B trägt B und hat Anti-A; AB hat beide Antigene; 0 keine A/B-Antigene.");completeBranch("bloodBranch","blood2","Du hast das Grundprinzip verstanden: Spender-Erythrozyten dürfen nicht mit den Antikörpern der empfangenden Person unverträglich sein.");}};}
  function blood3(){return {icon:"🩸",kicker:"MINISPIEL · TRANSFUSION",title:"Welcher Blutbeutel passt?",subtitle:"Vereinfachtes Modell für Erythrozytenkonzentrate",hints:["Patientin A− kann im vereinfachten Modell A− oder 0− Erythrozyten erhalten.","Ein rhesusnegativer Empfänger soll rhesusnegative Erythrozyten erhalten.","In der echten Medizin werden Blutgruppe und Verträglichkeit im Labor geprüft. Es gibt weitere Blutgruppensysteme."],html:`<div class="patient-card"><div class="patient-avatar">👩</div><div><strong>Fall Lina (fiktiv)</strong><p>Nach starkem Blutverlust braucht Lina ein Erythrozytenkonzentrat. Ihre Blutgruppe ist <strong>A Rh−</strong>.</p></div></div><p class="task-title">Welche zwei Blutbeutel passen im vereinfachten Modell?</p>${options("bags",[["A− und 0−","A-O-"],["A+ und 0+","A+O+"],["B− und AB−","B-AB-"]])}<p class="task-title">Warum passt 0− als Erythrozytenspende?</p>${options("oReason",[["Erythrozyten der Blutgruppe 0 tragen keine A- oder B-Antigene; bei 0− fehlt zusätzlich das wichtige Rhesus-D-Merkmal.","markers"],["0− enthält überhaupt keine Blutzellen.","empty"]])}<div class="aha-card"><strong>AHA:</strong> „Passt“ bedeutet nicht einfach gleiche Farbe oder gleiche Zahl – entscheidend sind Oberflächenmerkmale und Antikörper.</div><div class="fact-card"><span class="tag">Echte Medizin</span>Vor Transfusionen werden Blutgruppen bestimmt und Verträglichkeitstests durchgeführt. Das Spiel vereinfacht auf AB0 + Rhesus bei roten Blutkörperchen.</div>`,actionLabel:"Transfusion prüfen",check:()=>checkSimple({bags:"A-O-",oReason:"markers"},"Lina kann im vereinfachten Erythrozyten-Modell A− oder 0− erhalten. Die Verträglichkeit wird in der Medizin zusätzlich getestet.",msg=>completeBranch("bloodBranch","blood3",msg))};}
  function blood4(){return {icon:"🧰",kicker:"TRANSFER · BLUTSPENDE",title:"Warum Blutspenden so gezielt eingesetzt werden",subtitle:"Blutgruppen, Rhesusfaktor und Blutbestandteile verbinden sich.",hints:["0 Rh− gilt bei Erythrozyten als universell kompatibel und ist deshalb besonders für Notfälle wichtig.","Gespendetes Vollblut wird häufig in Bestandteile aufgetrennt. So können Erythrozyten, Plasma oder Thrombozyten gezielt eingesetzt werden."],html:`<div class="discovery-card"><strong>Notfalllager:</strong> Die Blutgruppe einer verletzten Person ist noch unbekannt. Für rote Blutkörperchen ist 0 Rh− besonders wichtig, weil diese Erythrozyten keine A-/B-Antigene und kein Rhesus-D-Merkmal tragen.</div><p class="task-title">Welche Aussage ist korrekt?</p>${options("universal",[["0 Rh− wird bei Erythrozyten als Universalspender-Blutgruppe bezeichnet.","yes"],["AB Rh+ ist Universalspender für Erythrozyten.","no"]])}<p class="task-title">Warum kann eine Blutspende gezielt verschiedenen Patient:innen helfen?</p>${options("components",[["Vollblut kann in Bestandteile wie Erythrozyten, Plasma und Thrombozyten aufgetrennt und gezielt eingesetzt werden.","split"],["Nach der Spende entstehen automatisch neue Blutgruppen.","new"]])}<div class="aha-card"><strong>Verbindung zu Ebene 1:</strong> Jetzt weißt du nicht nur, <em>was</em> Erythrozyten, Plasma und Thrombozyten tun – sondern auch, warum diese Bestandteile bei einer Blutspende getrennt genutzt werden können.</div>`,actionLabel:"Depot freigeben",check:()=>checkSimple({universal:"yes",components:"split"},"Forschungsweg gelöst: Blutgruppen entscheiden über Verträglichkeit, und Blutbestandteile können gezielt für unterschiedliche medizinische Situationen eingesetzt werden.",msg=>completeBranch("bloodBranch","blood4",msg))};}

  function shuffleCopy(items){
    const a=[...items];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  function matchRow(key,label,optionsArr){
    const hasPlaceholder=optionsArr[0]==="";
    const shuffled=shuffleCopy(hasPlaceholder?optionsArr.slice(1):optionsArr);
    const shown=hasPlaceholder?["",...shuffled]:shuffled;
    return `<div class="match-label">${label}</div><select class="match-select" data-answer="${key}">${shown.map((o,i)=>`<option value="${escapeHtml(o)}">${hasPlaceholder&&i===0?"Bitte wählen …":escapeHtml(o)}</option>`).join("")}</select>`;
  }
  function options(group,items){
    const shuffled=shuffleCopy(items);
    return `<div class="option-grid">${shuffled.map(([label,val])=>`<button type="button" class="option-btn" data-group="${group}" data-value="${escapeHtml(val)}">${label}</button>`).join("")}</div>`;
  }
  function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));}
  function currentHints(){try{return questData(activeQuest).hints||[];}catch{return[];}}
  function showHint(){if(!activeQuest)return;const hints=currentHints();if(!hints.length)return;hintBox.textContent=`H.E.R.Z. ${hintIndex+1}/${hints.length}: ${hints[hintIndex]}`;hintBox.classList.remove("hidden");hintIndex=(hintIndex+1)%hints.length;}
  function speakQuest(){if(!("speechSynthesis" in window))return showToast("Vorlesen wird von diesem Browser nicht unterstützt.");const text=[questTitle.textContent,questSubtitle.textContent,questContent.innerText].join(". ").slice(0,4500);speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="de-DE";u.rate=.95;speechSynthesis.speak(u);}

  function showHelp(){infoTitle.textContent="So funktioniert das Herzlabor";infoBody.innerHTML=`<p>Laufe mit WASD oder Pfeiltasten zu einem Terminal und drücke <strong>E</strong>, <strong>Enter</strong> oder <strong>UNTERSUCHEN</strong>.</p><p><strong>Ebene 1</strong> wiederholt die bekannten Inhalte. Nach dem Systemcheck öffnet sich der <strong>Forschungstrakt</strong> mit drei neuen Lernwegen.</p><p>In den Forschungswegen bauen die Stationen aufeinander auf. Der H.E.R.Z.-Roboter gibt Tipps ohne Punktabzug.</p><p><strong>Datenschutz:</strong> Keine Namen oder Antworten werden versendet. Nur der Fortschritt bleibt lokal im Browser.</p>`;infoModal.classList.add("open");}
  function showSources(){infoTitle.textContent="Fakten & Quellen";infoBody.innerHTML=`<p>Die neuen Forschungswege wurden fachlich auf aktuelle, öffentlich zugängliche Informationsangebote gestützt. <strong>Stand: ${CONFIG.factDate}</strong>.</p><div class="fact-card"><strong>Herz/KHK/Herzinfarkt</strong><br><a href="${CONFIG.sources.heart}" target="_blank" rel="noopener">Deutsche Herzstiftung – Ursachen des Herzinfarkts</a><br><a href="${CONFIG.sources.heartEmergency}" target="_blank" rel="noopener">Deutsche Herzstiftung – Anzeichen und schnelles Handeln</a></div><div class="fact-card"><strong>Organspende</strong><br><a href="${CONFIG.sources.organ}" target="_blank" rel="noopener">BIÖG – organspende-info.de</a><br><a href="${CONFIG.sources.organRequirements}" target="_blank" rel="noopener">Voraussetzungen</a> · <a href="${CONFIG.sources.organLaw}" target="_blank" rel="noopener">Entscheidungslösung</a></div><div class="fact-card"><strong>Blutspende & Blutgruppen</strong><br><a href="${CONFIG.sources.blood}" target="_blank" rel="noopener">DRK-Blutspendedienst – Blut & Blutgruppen</a></div><p class="source-note">Die Transfusions-Minispiele sind ausdrücklich als vereinfachtes Lernmodell für Erythrozyten und die Systeme AB0/Rhesus gekennzeichnet. Medizinisch werden vor Transfusionen weitere Prüfungen durchgeführt.</p>`;infoModal.classList.add("open");}

  window.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault();keys[e.key]=true;if((e.key==="e"||e.key==="E"||e.key==="Enter")&&!e.repeat)interact();},{passive:false});
  window.addEventListener("keyup",e=>{keys[e.key]=false;});
  document.querySelectorAll(".move-btn").forEach(btn=>{const dir=btn.dataset.dir;const on=()=>touchDir=dir,off=()=>{if(touchDir===dir)touchDir=null;};btn.addEventListener("pointerdown",e=>{e.preventDefault();on();});btn.addEventListener("pointerup",off);btn.addEventListener("pointercancel",off);btn.addEventListener("pointerleave",off);});
  document.getElementById("interactBtn").addEventListener("click",interact);
  document.getElementById("closeQuestBtn").addEventListener("click",closeQuest);
  document.getElementById("hintBtn").addEventListener("click",showHint);
  document.getElementById("speakBtn").addEventListener("click",speakQuest);
  document.getElementById("mapHelpBtn").addEventListener("click",showHelp);
  document.getElementById("sourceBtn").addEventListener("click",showSources);
  document.getElementById("closeInfoBtn").addEventListener("click",()=>infoModal.classList.remove("open"));
  document.getElementById("closeInfoMainBtn").addEventListener("click",()=>infoModal.classList.remove("open"));
  document.querySelectorAll(".avatar-btn").forEach(btn=>{btn.classList.toggle("selected",btn.dataset.avatar===selectedAvatar);btn.addEventListener("click",()=>{document.querySelectorAll(".avatar-btn").forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");selectedAvatar=btn.dataset.avatar;saveState();});});
  document.getElementById("startBtn").addEventListener("click",()=>{introModal.classList.remove("open");canvas.focus();showToast("Stabilisiere zuerst die fünf bekannten Laborbereiche.");});
  document.getElementById("resetBtn").addEventListener("click",()=>{if(!confirm("Herzlabor wirklich zurücksetzen? Der lokale Fortschritt wird gelöscht."))return;state=defaultState();world="base";selectedAvatar=state.avatar;player.x=480;player.y=520;saveState();updateUI();showToast("Herzlabor zurückgesetzt.");});
  canvas.addEventListener("click",e=>{const rect=canvas.getBoundingClientRect();const mx=(e.clientX-rect.left)*(canvas.width/rect.width),my=(e.clientY-rect.top)*(canvas.height/rect.height);const hit=getWorldTargets().find(q=>distance(mx,my,q.x,q.y)<50);if(hit){if(distance(player.x,player.y,hit.x,hit.y)<110)interact();else showToast("Lauf zuerst zu diesem Terminal.");}});

  // Lehrkraft-Demo: ?demo=hub oder ?demo=heart / organ / blood
  const demo=new URLSearchParams(location.search).get("demo");
  if(demo){state.completed={blood:true,vessels:true,heart:true,circulation:true,measure:true};state.finalDone=true;if(demo==="hub")world="hub";if(demo==="heart")world="heartBranch";if(demo==="organ")world="organBranch";if(demo==="blood")world="bloodBranch";player.x=480;player.y=510;saveState();}

  updateUI();requestAnimationFrame(gameLoop);
})();
