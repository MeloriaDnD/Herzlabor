(() => {
  "use strict";

  const CONFIG = {
    title: "Herzlabor – Mission Kreislauf",
    storageKey: "herzlabor-v1-progress",
    finalLabel: "NOTFALL-ZENTRALE",
    nextMissionText: "Blutgruppen-Labor – wird als nächste Mission freigeschaltet."
  };

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const nearbyPrompt = document.getElementById("nearbyPrompt");
  const missionList = document.getElementById("missionList");
  const statusText = document.getElementById("statusText");
  const progressBar = document.getElementById("progressBar");
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

  const quests = [
    { id: "blood", name: "Blutlabor", icon: "🩸", subtitle: "Blutbestandteile analysieren", x: 130, y: 115, color: "#a63d54" },
    { id: "vessels", name: "Gefäßstation", icon: "🛣️", subtitle: "Arterie, Vene, Kapillare", x: 475, y: 110, color: "#3a7ca5" },
    { id: "heart", name: "Herzkammer", icon: "❤️", subtitle: "Pumpe und Blutweg", x: 800, y: 120, color: "#c7435c" },
    { id: "circulation", name: "Kreislaufzentrale", icon: "🔄", subtitle: "Lunge – Herz – Körper", x: 210, y: 455, color: "#7d68b4" },
    { id: "measure", name: "Messlabor", icon: "📈", subtitle: "Puls und Blutdruck", x: 730, y: 455, color: "#4b9b7d" }
  ];

  const finalTerminal = { id: "final", name: CONFIG.finalLabel, icon: "🚨", x: 480, y: 310, color: "#d19036" };
  const nextTerminal = { id: "next", name: "NÄCHSTE MISSION", icon: "🧬", x: 870, y: 500, color: "#596779" };

  let state = loadState();
  let activeQuest = null;
  let hintIndex = 0;
  let selectedAvatar = state.avatar || "🧑‍🔬";
  let keys = {};
  let touchDir = null;
  let lastTs = 0;
  let toastTimer = null;

  const player = {
    x: state.playerX || 480,
    y: state.playerY || 520,
    r: 19,
    speed: 215
  };

  const obstacles = [
    {x: 0, y: 0, w: 960, h: 22}, {x:0,y:578,w:960,h:22}, {x:0,y:0,w:22,h:600}, {x:938,y:0,w:22,h:600},
    {x: 315, y: 55, w: 18, h: 175}, {x: 630, y: 55, w: 18, h: 175},
    {x: 355, y: 246, w: 105, h: 18}, {x: 505, y: 246, w: 100, h: 18},
    {x: 355, y: 350, w: 105, h: 18}, {x: 505, y: 350, w: 100, h: 18}
  ];

  const roomZones = [
    {x: 35, y: 42, w: 260, h: 185, label: "BLUTLABOR", color: "rgba(166,61,84,.13)"},
    {x: 350, y: 42, w: 260, h: 185, label: "GEFÄSSE", color: "rgba(58,124,165,.13)"},
    {x: 665, y: 42, w: 260, h: 185, label: "HERZ", color: "rgba(199,67,92,.13)"},
    {x: 35, y: 390, w: 570, h: 150, label: "KREISLAUFZENTRALE", color: "rgba(125,104,180,.13)"},
    {x: 665, y: 390, w: 260, h: 150, label: "MESSLABOR", color: "rgba(75,155,125,.13)"},
    {x: 365, y: 270, w: 230, h: 75, label: "NOTFALL-ZENTRALE", color: "rgba(209,144,54,.09)"}
  ];

  function defaultState() {
    return { completed: {}, avatar: "🧑‍🔬", playerX: 480, playerY: 520, finalDone: false };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    state.avatar = selectedAvatar;
    state.playerX = Math.round(player.x);
    state.playerY = Math.round(player.y);
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch {}
  }

  function completedCount() {
    return quests.filter(q => state.completed[q.id]).length;
  }

  function allCoreComplete() { return completedCount() === quests.length; }

  function showToast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2300);
  }

  function updateUI() {
    const count = completedCount();
    statusText.textContent = `${count} von ${quests.length} Bereichen stabil${state.finalDone ? " · Finale gelöst" : ""}`;
    progressBar.style.width = `${(count / quests.length) * 100}%`;
    missionList.innerHTML = "";
    quests.forEach(q => {
      const done = !!state.completed[q.id];
      const el = document.createElement("div");
      el.className = `mission-item ${done ? "done" : ""}`;
      el.innerHTML = `<div class="mi-icon">${q.icon}</div><div><strong>${q.name}</strong><span>${q.subtitle}</span></div><div class="state">${done ? "✓ STABIL" : "⚠ OFFEN"}</div>`;
      missionList.appendChild(el);
    });
    const finalEl = document.createElement("div");
    finalEl.className = `mission-item ${state.finalDone ? "done" : allCoreComplete() ? "" : "locked"}`;
    finalEl.innerHTML = `<div class="mi-icon">🚨</div><div><strong>Finale Mission</strong><span>${allCoreComplete() ? "Notfall analysieren" : "erst nach 5 Bereichen"}</span></div><div class="state">${state.finalDone ? "✓ GELÖST" : allCoreComplete() ? "⚠ BEREIT" : "🔒"}</div>`;
    missionList.appendChild(finalEl);
  }

  function drawWorld() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#101b2f";
    ctx.fillRect(0,0,960,600);

    // floor grid
    ctx.strokeStyle = "rgba(255,255,255,.035)";
    ctx.lineWidth = 1;
    for (let x=24; x<960; x+=32) { ctx.beginPath(); ctx.moveTo(x,22); ctx.lineTo(x,578); ctx.stroke(); }
    for (let y=22; y<600; y+=32) { ctx.beginPath(); ctx.moveTo(22,y); ctx.lineTo(938,y); ctx.stroke(); }

    roomZones.forEach(z => {
      ctx.fillStyle = z.color;
      roundRect(ctx,z.x,z.y,z.w,z.h,16,true,false);
      ctx.fillStyle = "rgba(255,255,255,.48)";
      ctx.font = "700 14px system-ui";
      ctx.fillText(z.label,z.x+12,z.y+22);
    });

    // obstacles / partitions
    obstacles.forEach(o => {
      ctx.fillStyle = "#283750";
      ctx.fillRect(o.x,o.y,o.w,o.h);
      ctx.fillStyle = "rgba(255,255,255,.08)";
      ctx.fillRect(o.x,o.y,o.w,4);
    });

    // decorative tables
    drawTable(90,170,150,36);
    drawTable(410,170,140,36);
    drawTable(735,170,140,36);
    drawTable(105,495,180,28);
    drawTable(705,495,150,28);

    quests.forEach(drawTerminal);
    drawFinalTerminal();
    drawNextTerminal();
    drawPlayer();
  }

  function drawTable(x,y,w,h) {
    ctx.fillStyle = "#324665";
    roundRect(ctx,x,y,w,h,7,true,false);
    ctx.fillStyle = "#25364f";
    ctx.fillRect(x+12,y+h,8,9);
    ctx.fillRect(x+w-20,y+h,8,9);
  }

  function drawTerminal(q) {
    const done = !!state.completed[q.id];
    const near = distance(player.x,player.y,q.x,q.y) < 78;
    ctx.save();
    ctx.translate(q.x,q.y);
    ctx.fillStyle = "#0a1220";
    roundRect(ctx,-30,-24,60,48,9,true,false);
    ctx.strokeStyle = near ? "#ffffff" : done ? "#56d68b" : q.color;
    ctx.lineWidth = near ? 3 : 2;
    roundRect(ctx,-30,-24,60,48,9,false,true);
    ctx.fillStyle = done ? "#56d68b" : q.color;
    ctx.fillRect(-20,-14,40,18);
    ctx.fillStyle = "#f6f8fc";
    ctx.font = "700 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(q.icon,0,19);
    ctx.font = "700 11px system-ui";
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.fillText(q.name.toUpperCase(),0,43);
    ctx.restore();
  }

  function drawFinalTerminal() {
    const q = finalTerminal;
    const unlocked = allCoreComplete();
    const near = distance(player.x,player.y,q.x,q.y) < 85;
    ctx.save(); ctx.translate(q.x,q.y);
    ctx.fillStyle = unlocked ? "rgba(209,144,54,.2)" : "rgba(89,103,121,.15)";
    roundRect(ctx,-42,-28,84,56,11,true,false);
    ctx.strokeStyle = near ? "#fff" : unlocked ? "#ffd166" : "#596779";
    ctx.lineWidth = near ? 3 : 2;
    roundRect(ctx,-42,-28,84,56,11,false,true);
    ctx.fillStyle = unlocked ? "#ffd166" : "#66758a";
    ctx.font = "900 24px system-ui"; ctx.textAlign = "center";
    ctx.fillText(unlocked ? "🚨" : "🔒",0,8);
    ctx.font = "700 10px system-ui";
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fillText("FINALE",0,42);
    ctx.restore();
  }

  function drawNextTerminal() {
    const q = nextTerminal;
    ctx.save(); ctx.translate(q.x,q.y);
    ctx.fillStyle = "rgba(89,103,121,.13)";
    roundRect(ctx,-28,-22,56,44,9,true,false);
    ctx.strokeStyle = "#596779"; ctx.lineWidth=2;
    roundRect(ctx,-28,-22,56,44,9,false,true);
    ctx.font="18px system-ui"; ctx.textAlign="center"; ctx.fillText("🧬",0,7);
    ctx.font="700 9px system-ui"; ctx.fillStyle="rgba(255,255,255,.55)"; ctx.fillText("BALD",0,36);
    ctx.restore();
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x,player.y);
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.beginPath(); ctx.ellipse(0,20,17,7,0,0,Math.PI*2); ctx.fill();
    ctx.font = "36px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(selectedAvatar,0,0);
    ctx.restore();
  }

  function roundRect(ctx,x,y,w,h,r,fill,stroke) {
    if (w < 2*r) r = w/2; if (h < 2*r) r = h/2;
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
    if (fill) ctx.fill(); if (stroke) ctx.stroke();
  }

  function distance(x1,y1,x2,y2) { return Math.hypot(x2-x1,y2-y1); }

  function collides(nx,ny) {
    const r = player.r - 3;
    return obstacles.some(o => nx+r > o.x && nx-r < o.x+o.w && ny+r > o.y && ny-r < o.y+o.h);
  }

  function movePlayer(dx,dy,dt) {
    if (!dx && !dy) return;
    const len = Math.hypot(dx,dy) || 1;
    dx/=len; dy/=len;
    const step = player.speed * dt;
    const nx = player.x + dx*step;
    const ny = player.y + dy*step;
    if (!collides(nx,player.y)) player.x = nx;
    if (!collides(player.x,ny)) player.y = ny;
    saveState();
  }

  function nearestInteractable() {
    let items = [...quests, finalTerminal, nextTerminal];
    let best = null;
    let bestD = Infinity;
    items.forEach(q => {
      const d = distance(player.x,player.y,q.x,q.y);
      if (d < bestD) { bestD=d; best=q; }
    });
    return bestD < 92 ? best : null;
  }

  function interact() {
    if (questModal.classList.contains("open") || introModal.classList.contains("open") || infoModal.classList.contains("open")) return;
    const q = nearestInteractable();
    if (!q) { showToast("Geh näher an ein Laborterminal."); return; }
    if (q.id === "final") {
      if (!allCoreComplete()) { showToast("Die Notfall-Zentrale öffnet erst nach allen fünf Laborbereichen."); return; }
      openQuest("final");
      return;
    }
    if (q.id === "next") {
      showInfoMessage("Nächste Mission", CONFIG.nextMissionText + "\n\nNach den Ferien wartet außerdem die Mission Reanimation.");
      return;
    }
    openQuest(q.id);
  }

  function gameLoop(ts) {
    const dt = Math.min((ts-lastTs)/1000 || 0, .04); lastTs = ts;
    let dx=0,dy=0;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"] || touchDir==="left") dx--;
    if (keys["ArrowRight"] || keys["d"] || keys["D"] || touchDir==="right") dx++;
    if (keys["ArrowUp"] || keys["w"] || keys["W"] || touchDir==="up") dy--;
    if (keys["ArrowDown"] || keys["s"] || keys["S"] || touchDir==="down") dy++;
    if (!introModal.classList.contains("open") && !questModal.classList.contains("open") && !infoModal.classList.contains("open")) movePlayer(dx,dy,dt);
    drawWorld();
    const near = nearestInteractable();
    nearbyPrompt.classList.toggle("hidden", !near || introModal.classList.contains("open") || questModal.classList.contains("open") || infoModal.classList.contains("open"));
    if (near) nearbyPrompt.textContent = near.id === "next" ? "E / Enter: ansehen" : "E / Enter: untersuchen";
    requestAnimationFrame(gameLoop);
  }

  function openQuest(id) {
    activeQuest = id;
    hintIndex = 0;
    hintBox.classList.add("hidden");
    questFeedback.className = "quest-feedback hidden";
    questFeedback.textContent = "";
    const data = questData(id);
    questIcon.textContent = data.icon;
    questKicker.textContent = data.kicker || "MISSION";
    questTitle.textContent = data.title;
    questSubtitle.textContent = data.subtitle;
    questContent.innerHTML = data.html;
    questActionBtn.textContent = data.actionLabel || "Prüfen";
    questActionBtn.onclick = () => data.check();
    wireSelectableButtons();
    questModal.classList.add("open");
  }

  function closeQuest() {
    questModal.classList.remove("open");
    activeQuest = null;
    hintBox.classList.add("hidden");
  }

  function completeQuest(id, message) {
    if (id !== "final") state.completed[id] = true;
    if (id === "final") state.finalDone = true;
    saveState(); updateUI();
    feedback(true, message + (id !== "final" ? "\n\n✓ Dieser Laborbereich ist jetzt stabil. Du kannst ihn jederzeit wiederholen." : ""));
    questActionBtn.textContent = "Schließen";
    questActionBtn.onclick = closeQuest;
  }

  function feedback(good,msg) {
    questFeedback.className = `quest-feedback ${good ? "good" : "bad"}`;
    questFeedback.innerHTML = msg.replace(/\n/g,"<br>");
  }

  function wireSelectableButtons() {
    questContent.querySelectorAll(".option-btn[data-group]").forEach(btn => {
      btn.addEventListener("click", () => {
        const group = btn.dataset.group;
        questContent.querySelectorAll(`.option-btn[data-group="${group}"]`).forEach(b=>b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });
  }

  function selectedValue(group) {
    const el = questContent.querySelector(`.option-btn.selected[data-group="${group}"]`);
    return el ? el.dataset.value : null;
  }

  function checkSelections(expected, successText, id=activeQuest) {
    let missing = false, wrong=[];
    Object.entries(expected).forEach(([g,val]) => {
      const got = selectedValue(g);
      if (!got) missing = true;
      else if (got !== val) wrong.push(g);
    });
    if (missing) return feedback(false,"Bearbeite zuerst alle Teilaufgaben. Nutze bei Bedarf den H.E.R.Z.-Tipp.");
    if (wrong.length) return feedback(false,"Noch nicht ganz. Prüfe deine Antworten noch einmal. Entscheidend sind die Funktionen und die Flussrichtung.");
    completeQuest(id,successText);
  }

  function checkSelectFields(expected, successText, id=activeQuest) {
    let wrong=false, missing=false;
    Object.entries(expected).forEach(([sel,val])=>{
      const el=questContent.querySelector(`[data-answer="${sel}"]`);
      if (!el || !el.value) missing=true;
      else if (el.value !== val) wrong=true;
    });
    if (missing) return feedback(false,"Fülle zuerst alle Felder aus.");
    if (wrong) return feedback(false,"Einige Zuordnungen stimmen noch nicht. Nutze den Tipp oder lies die Beschreibungen noch einmal.");
    completeQuest(id,successText);
  }

  function questData(id) {
    if (id === "blood") return bloodQuest();
    if (id === "vessels") return vesselQuest();
    if (id === "circulation") return circulationQuest();
    if (id === "heart") return heartQuest();
    if (id === "measure") return measureQuest();
    return finalQuest();
  }

  function bloodQuest() {
    return {
      icon:"🩸", title:"Blutlabor", subtitle:"Welche Bestandteile halten das Transportsystem am Laufen?",
      hints:[
        "Vier Kernbestandteile: Blutplasma, Erythrozyten, Leukozyten und Thrombozyten.",
        "Wortbank: gelöste Stoffe · Sauerstoff · Abwehr · Blutgerinnung/Wundverschluss.",
        "Bei einer Wunde sind besonders die Thrombozyten wichtig."
      ],
      html:`
        <p class="task-title">1. Ordne jedem Bestandteil die wichtigste Aufgabe zu.</p>
        <div class="match-grid">
          ${matchRow("plasma","Blutplasma",["","Gelöste Stoffe transportieren","Sauerstoff transportieren","Krankheitserreger abwehren","Wundverschluss unterstützen"])}
          ${matchRow("ery","Erythrozyten",["","Gelöste Stoffe transportieren","Sauerstoff transportieren","Krankheitserreger abwehren","Wundverschluss unterstützen"])}
          ${matchRow("leu","Leukozyten",["","Gelöste Stoffe transportieren","Sauerstoff transportieren","Krankheitserreger abwehren","Wundverschluss unterstützen"])}
          ${matchRow("thr","Thrombozyten",["","Gelöste Stoffe transportieren","Sauerstoff transportieren","Krankheitserreger abwehren","Wundverschluss unterstützen"])}
        </div>
        <div class="alert-card"><strong>⚠ STÖRFALL:</strong> Eine kleine Wunde hört nicht auf zu bluten. Welcher Blutbestandteil ist besonders wichtig?</div>
        ${options("wound",[["Thrombozyten","thr"],["Leukozyten","leu"],["Blutplasma","plasma"]])}
        <p class="task-title">Warum kann das gefährlich sein?</p>
        ${options("danger",[["Die Person kann zu viel Blut verlieren.","loss"],["Das Blut wird sofort zu Luft.","air"]])}
      `,
      actionLabel:"Labor prüfen",
      check:()=>{
        const expected={plasma:"Gelöste Stoffe transportieren",ery:"Sauerstoff transportieren",leu:"Krankheitserreger abwehren",thr:"Wundverschluss unterstützen"};
        let wrong=false,missing=false;
        Object.entries(expected).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`); if(!e.value)missing=true; else if(e.value!==v)wrong=true;});
        if(!selectedValue("wound")||!selectedValue("danger")) missing=true;
        if(selectedValue("wound") && selectedValue("wound")!=="thr") wrong=true;
        if(selectedValue("danger") && selectedValue("danger")!=="loss") wrong=true;
        if(missing) return feedback(false,"Bearbeite zuerst alle Aufgaben.");
        if(wrong) return feedback(false,"Noch stimmt nicht alles. Denk an die vier Kernaufgaben: Transport gelöster Stoffe, Sauerstofftransport, Abwehr und Wundverschluss.");
        completeQuest("blood","Problem erkannt: Blut hat verschiedene Bestandteile mit unterschiedlichen Aufgaben. Wenn die Blutgerinnung nicht ausreichend funktioniert, kann anhaltender Blutverlust gefährlich werden.");
      }
    };
  }

  function vesselQuest() {
    return {
      icon:"🛣️", title:"Gefäßstation", subtitle:"Finde den richtigen Weg durch das Gefäßnetz.",
      hints:[
        "Arterie = vom Herzen weg. Vene = zum Herzen hin.",
        "Kapillaren sind sehr fein. Hier findet Stoffaustausch zwischen Blut und Gewebe statt.",
        "Die Namen Arterie und Vene hängen von der Flussrichtung zum Herzen ab – nicht vom Sauerstoffgehalt."
      ],
      html:`
        <p class="task-title">1. Welcher Gefäßtyp passt?</p>
        <div class="match-grid">
          ${matchRow("away","führt Blut vom Herzen weg",["","Arterie","Vene","Kapillare"])}
          ${matchRow("toward","führt Blut zum Herzen hin",["","Arterie","Vene","Kapillare"])}
          ${matchRow("exchange","Ort des Stoffaustauschs",["","Arterie","Vene","Kapillare"])}
        </div>
        <p class="task-title">2. Warum haben Arterien kräftige, elastische Wände?</p>
        ${options("arteryWall",[["Weil das Herz Blut mit Druck in die Arterien pumpt.","pressure"],["Weil Arterien Sauerstoff herstellen.","oxygen"]])}
        <div class="alert-card"><strong>⚠ STÖRFALL:</strong> Ein Gefäß zu einem Organ ist verschlossen. Was kann passieren?</div>
        ${options("blocked",[["Weniger Blut erreicht das Gewebe; es bekommt weniger Sauerstoff.","lowO2"],["Das Organ produziert dann selbst mehr Blut.","self"]])}
      `,
      actionLabel:"Gefäßnetz prüfen",
      check:()=>{
        const expected={away:"Arterie",toward:"Vene",exchange:"Kapillare"};
        let wrong=false,missing=false;
        Object.entries(expected).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`); if(!e.value)missing=true; else if(e.value!==v)wrong=true;});
        if(!selectedValue("arteryWall")||!selectedValue("blocked"))missing=true;
        if(selectedValue("arteryWall")&&selectedValue("arteryWall")!=="pressure")wrong=true;
        if(selectedValue("blocked")&&selectedValue("blocked")!=="lowO2")wrong=true;
        if(missing)return feedback(false,"Bearbeite zuerst alle Teilaufgaben.");
        if(wrong)return feedback(false,"Prüfe die Flussrichtung: Arterien führen vom Herzen weg, Venen zum Herzen hin. Kapillaren ermöglichen Stoffaustausch.");
        completeQuest("vessels","Gefäßnetz stabilisiert: Wenn ein Gefäß zu einem Organ verschlossen ist, kann weniger Blut und damit weniger Sauerstoff zum Gewebe gelangen. Zellen können dann schlechter arbeiten und bei längerem Sauerstoffmangel geschädigt werden.");
      }
    };
  }

  function circulationQuest() {
    return {
      icon:"🔄", title:"Kreislaufzentrale", subtitle:"Navigiere einen Blutstropfen durch den doppelten Blutkreislauf.",
      hints:[
        "Sauerstoffarmes Blut: rechte Herzhälfte → Lunge.",
        "Sauerstoffreiches Blut: Lunge → linke Herzhälfte → Körper.",
        "Körperkreislauf: Herz → Körper → Herz. Lungenkreislauf: Herz → Lunge → Herz."
      ],
      html:`
        <p class="task-title">1. Bringe den Blutstropfen in die richtige Reihenfolge.</p>
        <div class="sequence"><span class="blood-drop"><span>BLUT</span></span><span>Start: rechte Herzhälfte</span></div>
        <div class="match-grid" style="margin-top:10px">
          ${matchRow("step1","Danach",["","Lunge","Körper","linke Herzhälfte"])}
          ${matchRow("step2","Danach",["","Lunge","Körper","linke Herzhälfte"])}
          ${matchRow("step3","Danach",["","Lunge","Körper","rechte Herzhälfte"])}
          ${matchRow("step4","Danach",["","Körper","rechte Herzhälfte","Lunge"])}
        </div>
        <p class="task-title">2. Was passiert in der Lunge?</p>
        ${options("lung",[["Das Blut nimmt Sauerstoff auf und gibt Kohlenstoffdioxid ab.","gas"],["Die Lunge bildet Erythrozyten.","cells"]])}
        <div class="alert-card"><strong>⚠ STÖRFALL:</strong> Das Blut gelangt nur schlecht zur Lunge. Welche Folge passt?</div>
        ${options("lungBlock",[["Das Blut kann weniger Sauerstoff aufnehmen; der Körper wird schlechter versorgt.","low"],["Der Körper bekommt automatisch mehr Sauerstoff.","more"]])}
      `,
      actionLabel:"Kreislauf prüfen",
      check:()=>{
        const expected={step1:"Lunge",step2:"linke Herzhälfte",step3:"Körper",step4:"rechte Herzhälfte"};
        let wrong=false,missing=false;
        Object.entries(expected).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`); if(!e.value)missing=true; else if(e.value!==v)wrong=true;});
        if(!selectedValue("lung")||!selectedValue("lungBlock"))missing=true;
        if(selectedValue("lung")&&selectedValue("lung")!=="gas")wrong=true;
        if(selectedValue("lungBlock")&&selectedValue("lungBlock")!=="low")wrong=true;
        if(missing)return feedback(false,"Fülle zuerst den Weg aus und beantworte beide Fragen.");
        if(wrong)return feedback(false,"Noch ist der Blutweg nicht vollständig richtig. Denk an: rechte Herzhälfte → Lunge → linke Herzhälfte → Körper → rechte Herzhälfte.");
        completeQuest("circulation","Kreislauf stabil: Der Lungenkreislauf ermöglicht den Gasaustausch, der Körperkreislauf versorgt die Organe. Beide Kreisläufe sind miteinander verbunden.");
      }
    };
  }

  function heartQuest() {
    return {
      icon:"❤️", title:"Herzkammer", subtitle:"Repariere die Pumpe und kontrolliere den Blutweg.",
      hints:[
        "Körper → Hohlvene → rechter Vorhof → rechte Herzkammer → Lungenarterie → Lunge.",
        "Lunge → Lungenvene → linker Vorhof → linke Herzkammer → Aorta → Körper.",
        "Herzklappen sorgen dafür, dass Blut nicht einfach zurückfließt."
      ],
      html:`
        <p class="task-title">1. Ergänze den Weg des Blutes durch das Herz.</p>
        <div class="match-grid">
          ${matchRow("h1","Aus dem Körper kommt Blut über die …",["","Hohlvene","Aorta","Lungenvene"])}
          ${matchRow("h2","Dann gelangt es zuerst in den …",["","rechten Vorhof","linken Vorhof","linke Herzkammer"])}
          ${matchRow("h3","Von der rechten Herzkammer geht es über die … zur Lunge.",["","Lungenarterie","Lungenvene","Aorta"])}
          ${matchRow("h4","Aus der Lunge kommt Blut über die … zurück.",["","Lungenvene","Lungenarterie","Hohlvene"])}
          ${matchRow("h5","Von der linken Herzkammer geht es über die … in den Körper.",["","Aorta","Hohlvene","Lungenvene"])}
        </div>
        <p class="task-title">2. Was ist die wichtigste Aufgabe der Herzklappen?</p>
        ${options("valve",[["Sie verhindern Rückfluss und lenken das Blut in die richtige Richtung.","back"],["Sie bilden Sauerstoff im Herzen.","oxygen"]])}
        <div class="alert-card"><strong>⚠ STÖRFALL:</strong> Eine Herzklappe schließt nicht richtig. Was kann passieren?</div>
        ${options("valveFail",[["Ein Teil des Blutes kann zurückfließen; die Pumpwirkung wird schlechter.","reverse"],["Das Blut wird dadurch automatisch sauerstoffreicher.","rich"]])}
      `,
      actionLabel:"Pumpe prüfen",
      check:()=>{
        const expected={h1:"Hohlvene",h2:"rechten Vorhof",h3:"Lungenarterie",h4:"Lungenvene",h5:"Aorta"};
        let wrong=false,missing=false;
        Object.entries(expected).forEach(([k,v])=>{const e=questContent.querySelector(`[data-answer="${k}"]`); if(!e.value)missing=true; else if(e.value!==v)wrong=true;});
        if(!selectedValue("valve")||!selectedValue("valveFail"))missing=true;
        if(selectedValue("valve")&&selectedValue("valve")!=="back")wrong=true;
        if(selectedValue("valveFail")&&selectedValue("valveFail")!=="reverse")wrong=true;
        if(missing)return feedback(false,"Bearbeite zuerst alle Aufgaben.");
        if(wrong)return feedback(false,"Prüfe den Blutweg noch einmal. Die rechte Herzhälfte pumpt zur Lunge, die linke Herzhälfte in den Körper.");
        completeQuest("heart","Herzpumpe stabilisiert: Das Herz nimmt Blut auf und pumpt es weiter. Herzklappen verhindern Rückfluss. Wenn eine Klappe nicht richtig schließt, kann die Pumpwirkung schlechter werden.");
      }
    };
  }

  function measureQuest() {
    return {
      icon:"📈", title:"Messlabor", subtitle:"Lies Körpersignale: Puls und Blutdruck.",
      hints:[
        "Puls = fühlbare Druckwelle in einer Arterie. Pulsfrequenz = Pulsschläge pro Minute.",
        "Bei Bewegung brauchen Muskeln mehr Sauerstoff. Das Herz schlägt deshalb meist schneller.",
        "Beim Beispiel 120/80 mmHg: oberer Wert = systolisch (Pump-/Auswurfphase), unterer Wert = diastolisch (Entspannungs-/Füllungsphase)."
      ],
      html:`
        <p class="task-title">1. Virtueller Belastungsversuch</p>
        <div class="bp-box">
          <div class="bp-value"><div>Ruhe</div><div class="big">72</div><small>Pulsschläge/min</small></div>
          <div class="bp-value"><div>nach Bewegung</div><div class="big">116</div><small>Pulsschläge/min</small></div>
          <div class="bp-value"><div>nach Erholung</div><div class="big">86</div><small>Pulsschläge/min</small></div>
        </div>
        <p class="task-title">Was passiert direkt nach Bewegung?</p>
        ${options("pulseChange",[["Die Pulsfrequenz steigt.","up"],["Die Pulsfrequenz sinkt.","down"]])}
        <p class="task-title">Warum?</p>
        ${options("pulseWhy",[["Die Muskeln brauchen mehr Sauerstoff; das Herz transportiert mehr Blut.","oxygen"],["Die Muskeln brauchen weniger Blut.","less"]])}
        <p class="task-title">2. Blutdruck – Beispielwert 120/80 mmHg</p>
        <div class="match-grid">
          ${matchRow("sys","120 mmHg",["","systolischer Wert","diastolischer Wert"])}
          ${matchRow("dia","80 mmHg",["","systolischer Wert","diastolischer Wert"])}
        </div>
        <p class="task-title">Warum ist der obere Wert höher?</p>
        ${options("bpWhy",[["Während der Systole pumpt das Herz Blut in die Arterien; der Druck ist höher.","pump"],["Während der Systole hört das Herz auf zu arbeiten.","stop"]])}
        <div class="alert-card"><strong>⚠ STÖRFALL:</strong> Der Blutdruck ist so niedrig, dass Organe nicht ausreichend durchblutet werden. Warum ist das problematisch?</div>
        ${options("bpFail",[["Organe können zu wenig Blut und Sauerstoff erhalten.","poor"],["Organe brauchen dann gar keinen Sauerstoff mehr.","none"]])}
      `,
      actionLabel:"Messwerte prüfen",
      check:()=>{
        let wrong=false,missing=false;
        if(!selectedValue("pulseChange")||!selectedValue("pulseWhy")||!selectedValue("bpWhy")||!selectedValue("bpFail")) missing=true;
        if(selectedValue("pulseChange")&&selectedValue("pulseChange")!=="up")wrong=true;
        if(selectedValue("pulseWhy")&&selectedValue("pulseWhy")!=="oxygen")wrong=true;
        if(selectedValue("bpWhy")&&selectedValue("bpWhy")!=="pump")wrong=true;
        if(selectedValue("bpFail")&&selectedValue("bpFail")!=="poor")wrong=true;
        const sys=questContent.querySelector('[data-answer="sys"]'), dia=questContent.querySelector('[data-answer="dia"]');
        if(!sys.value||!dia.value)missing=true;
        if(sys.value&&sys.value!=="systolischer Wert")wrong=true;
        if(dia.value&&dia.value!=="diastolischer Wert")wrong=true;
        if(missing)return feedback(false,"Bearbeite zuerst alle Aufgaben.");
        if(wrong)return feedback(false,"Prüfe Puls und Blutdruck noch einmal. Bei Bewegung steigt der Puls meist. Der systolische Wert gehört zur Pump-/Auswurfphase.");
        completeQuest("measure","Messlabor stabil: Puls und Blutdruck zeigen verschiedene Aspekte der Herz-Kreislauf-Arbeit. Bei Bewegung steigt die Pulsfrequenz meist, weil arbeitende Muskeln mehr Sauerstoff benötigen.");
      }
    };
  }

  function finalQuest() {
    return {
      icon:"🚨", kicker:"FINALE", title:"Herz-Kreislauf-Notfall", subtitle:"Das Herz pumpt nicht mehr. Warum ist das gefährlich?",
      hints:[
        "Ohne Pumpbewegung wird das Blut nicht ausreichend durch den Körper transportiert.",
        "Wenn zu wenig Blut ankommt, erhalten Organe zu wenig Sauerstoff.",
        "Ordne die Ursache-Wirkungs-Kette vom Herzstillstand bis zur Organgefahr."
      ],
      html:`
        <div class="alert-card"><strong>🚨 SYSTEMKRITISCH:</strong> Die Herzpumpe steht still.</div>
        <p class="task-title">Ordne die Folgen in eine sinnvolle Kette.</p>
        <div class="match-grid">
          ${matchRow("f1","1. Herz pumpt nicht",["","Blut wird nicht ausreichend transportiert","Organe erhalten zu wenig Sauerstoff","Zellen können geschädigt werden"])}
          ${matchRow("f2","2. Danach",["","Blut wird nicht ausreichend transportiert","Organe erhalten zu wenig Sauerstoff","Zellen können geschädigt werden"])}
          ${matchRow("f3","3. Danach",["","Blut wird nicht ausreichend transportiert","Organe erhalten zu wenig Sauerstoff","Zellen können geschädigt werden"])}
        </div>
        <p class="task-title">Warum ist schnelles Handeln wichtig?</p>
        ${options("finalWhy",[["Weil besonders empfindliche Organe ohne ausreichende Sauerstoffversorgung geschädigt werden können.","damage"],["Weil Blut ohne Herz sofort zu Wasser wird.","water"]])}
      `,
      actionLabel:"Notfall analysieren",
      check:()=>{
        const e={f1:"Blut wird nicht ausreichend transportiert",f2:"Organe erhalten zu wenig Sauerstoff",f3:"Zellen können geschädigt werden"};
        let wrong=false,missing=false;
        Object.entries(e).forEach(([k,v])=>{const el=questContent.querySelector(`[data-answer="${k}"]`); if(!el.value)missing=true; else if(el.value!==v)wrong=true;});
        if(!selectedValue("finalWhy"))missing=true;
        if(selectedValue("finalWhy")&&selectedValue("finalWhy")!=="damage")wrong=true;
        if(missing)return feedback(false,"Ordne zuerst alle Folgen und beantworte die Frage.");
        if(wrong)return feedback(false,"Die Reihenfolge ist noch nicht richtig. Beginne bei der fehlenden Pumpwirkung und frage: Was passiert dann mit Bluttransport und Sauerstoffversorgung?");
        completeQuest("final","Mission erfüllt! Du hast erkannt: Ohne ausreichende Pumpwirkung kommt der Blutkreislauf zum Stillstand bzw. reicht nicht mehr aus. Organe erhalten dann zu wenig Sauerstoff.\n\n🔒 NÄCHSTE MISSION: REANIMATION – wird nach den Herbstferien freigeschaltet.");
      }
    };
  }

  function matchRow(key,label,optionsArr) {
    return `<div class="match-label">${label}</div><select class="match-select" data-answer="${key}">${optionsArr.map((o,i)=>`<option value="${escapeHtml(o)}">${i===0?"Bitte wählen …":escapeHtml(o)}</option>`).join("")}</select>`;
  }

  function options(group, items) {
    return `<div class="option-grid">${items.map(([label,val])=>`<button type="button" class="option-btn" data-group="${group}" data-value="${escapeHtml(val)}">${label}</button>`).join("")}</div>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  }

  function currentHints() {
    return questData(activeQuest).hints || [];
  }

  function showHint() {
    if (!activeQuest) return;
    const hints=currentHints();
    if(!hints.length)return;
    hintBox.textContent = `H.E.R.Z. ${hintIndex+1}/${hints.length}: ${hints[hintIndex]}`;
    hintBox.classList.remove("hidden");
    hintIndex=(hintIndex+1)%hints.length;
  }

  function speakQuest() {
    if (!("speechSynthesis" in window)) return showToast("Vorlesen wird von diesem Browser nicht unterstützt.");
    const text=[questTitle.textContent,questSubtitle.textContent,questContent.innerText].join(". ").slice(0,3500);
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text); u.lang="de-DE"; u.rate=.95; speechSynthesis.speak(u);
  }

  function showInfoMessage(title,msg) {
    document.getElementById("infoTitle").textContent=title;
    const ps=infoModal.querySelectorAll("p");
    ps.forEach((p,i)=>{ if(i===0){p.textContent=msg;} else p.style.display="none"; });
    infoModal.classList.add("open");
  }

  function restoreInfoModal() {
    document.getElementById("infoTitle").textContent="So funktioniert das Herzlabor";
    const ps=infoModal.querySelectorAll("p");
    const texts=[
      'Laufe zu einem Laborterminal. Wenn du nah genug bist, drücke E, Enter oder den Button UNTERSUCHEN.',
      'Jeder Bereich besteht aus kurzen Aufgaben und einem Störfall. Du kannst jeden Bereich erneut öffnen und üben.',
      'H.E.R.Z.-Hilfe: Zeigt Tipps und Wortbanken. Es gibt keine Strafe für Hilfen.',
      'Datenschutz: Es werden keine Namen oder Ergebnisse an einen Server gesendet. Der Fortschritt wird nur im Browser auf diesem Gerät gespeichert.'
    ];
    ps.forEach((p,i)=>{p.style.display=""; if(texts[i])p.textContent=texts[i];});
  }

  // controls
  window.addEventListener("keydown", e=>{
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    keys[e.key]=true;
    if((e.key==="e"||e.key==="E"||e.key==="Enter")&&!e.repeat) interact();
  }, {passive:false});
  window.addEventListener("keyup", e=>{keys[e.key]=false;});

  document.querySelectorAll(".move-btn").forEach(btn=>{
    const dir=btn.dataset.dir;
    const on=()=>touchDir=dir, off=()=>{if(touchDir===dir)touchDir=null;};
    btn.addEventListener("pointerdown",e=>{e.preventDefault();on();});
    btn.addEventListener("pointerup",off); btn.addEventListener("pointercancel",off); btn.addEventListener("pointerleave",off);
  });
  document.getElementById("interactBtn").addEventListener("click",interact);
  document.getElementById("closeQuestBtn").addEventListener("click",closeQuest);
  document.getElementById("hintBtn").addEventListener("click",showHint);
  document.getElementById("speakBtn").addEventListener("click",speakQuest);
  document.getElementById("mapHelpBtn").addEventListener("click",()=>{restoreInfoModal();infoModal.classList.add("open");});
  document.getElementById("closeInfoBtn").addEventListener("click",()=>infoModal.classList.remove("open"));
  document.getElementById("closeInfoMainBtn").addEventListener("click",()=>infoModal.classList.remove("open"));

  document.querySelectorAll(".avatar-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(".avatar-btn").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected"); selectedAvatar=btn.dataset.avatar; saveState();
    });
  });
  // set current selection if stored
  document.querySelectorAll(".avatar-btn").forEach(btn=>btn.classList.toggle("selected",btn.dataset.avatar===selectedAvatar));

  document.getElementById("startBtn").addEventListener("click",()=>{
    introModal.classList.remove("open");
    canvas.focus();
    showToast("Gehe zu einem Laborbereich und untersuche das Terminal.");
  });

  document.getElementById("resetBtn").addEventListener("click",()=>{
    if(!confirm("Herzlabor wirklich zurücksetzen? Der lokale Fortschritt auf diesem Gerät wird gelöscht."))return;
    state=defaultState(); selectedAvatar=state.avatar; player.x=480; player.y=520; saveState(); updateUI(); showToast("Herzlabor zurückgesetzt.");
  });

  // click terminal interaction when close enough
  canvas.addEventListener("click", e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(canvas.width/rect.width);
    const my=(e.clientY-rect.top)*(canvas.height/rect.height);
    const targets=[...quests,finalTerminal,nextTerminal];
    const hit=targets.find(q=>distance(mx,my,q.x,q.y)<48);
    if(hit){
      if(distance(player.x,player.y,hit.x,hit.y)<105) interact();
      else showToast("Lauf zuerst zu diesem Terminal.");
    }
  });

  updateUI();
  requestAnimationFrame(gameLoop);
})();
