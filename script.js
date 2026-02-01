// ======================================================
// CONFIG POSTES + COULEURS
// ======================================================

const POSTES = [
  "GB",
  "D (D)", "D (C)", "D (G)",
  "AL (D)", "MD", "AL (G)",
  "M (D)", "M (C)", "M (G)",
  "MO (D)", "MO (C)", "MO (G)",
  "BT (C)",
];

const POSTE_COLORS = {
  "GB": "#3C3C5A",
  "D (D)": "#02796F",
  "D (C)": "#02796F",
  "D (G)": "#02796F",
  "AL (D)": "#0D7741",
  "MD": "#0D7741",
  "AL (G)": "#0D7741",
  "M (D)": "#08397D",
  "M (C)": "#08397D",
  "M (G)": "#08397D",
  "MO (D)": "#5F1084",
  "MO (C)": "#5F1084",
  "MO (G)": "#5F1084",
  "BT (C)": "#8D1363",
};

const STATUTS = [
  "Titulaire important",
  "Remplaçant",
  "Jeune joueur",
  "Joueur secondaire",
];

const STATUT_COLORS = {
  "Titulaire important": "#16a34a",
  "Remplaçant": "#2563eb",
  "Joueur secondaire": "#f59e0b",
  "Jeune joueur": "#7c3aed",
};

const POSTE_ORDER = {
  "GB": 0,
  "D (D)": 1,
  "D (C)": 2,
  "D (G)": 3,
  "AL (D)": 4,
  "MD": 5,
  "AL (G)": 6,
  "M (D)": 7,
  "M (C)": 8,
  "M (G)": 9,
  "MO (D)": 10,
  "MO (C)": 11,
  "MO (G)": 12,
  "BT (C)": 13
};

function posteRank(p) {
  return POSTE_ORDER[(p || "").trim()] ?? 999;
}

// ======================================================
// FONCTIONS TRI AUTOMATIQUE POSTES
// ======================================================

function sortStatsByPoste(data) {
  data.sort((a, b) => {
    const ra = posteRank(a?.[1]);
    const rb = posteRank(b?.[1]);
    if (ra !== rb) return ra - rb;

    const na = (a?.[0] || "").toLowerCase();
    const nb = (b?.[0] || "").toLowerCase();
    return na.localeCompare(nb);
  });
}

// Couleur cellule (cadre) Note / NoteE
function applyNoteCellColor(td, value, type) {
  const raw = (value || "").toString().replace(",", ".").trim();
  const v = parseFloat(raw);

  td.classList.remove("note-good-cell", "note-bad-cell");
  if (Number.isNaN(v)) return;

  if (type === "note") {
    if (v >= 7.0) td.classList.add("note-good-cell");
    else if (v <= 5.9) td.classList.add("note-bad-cell");
  } else if (type === "noteE") {
    if (v >= 7.5) td.classList.add("note-good-cell");
    else if (v <= 6.5) td.classList.add("note-bad-cell");
  }
}


// ======================================================
// SAUVEGARDE DES CHAMPS SIMPLES data-save
// ======================================================

function initSimpleSaves() {
  document.querySelectorAll("[data-save]").forEach((el) => {
    const key = el.dataset.save;
    el.value = localStorage.getItem(key) || "";
    el.addEventListener("input", () => {
      localStorage.setItem(key, el.value);
    });
  });
}

// ======================================================
// BADGES (POSTE + STATUT)
// ======================================================

function applyPosteBadge(select) {
  const color = POSTE_COLORS[select.value];
  if (color) {
    select.style.backgroundColor = color;
    select.style.color = "#fff";
    select.style.fontWeight = "bold";
    select.style.fontSize = "12px";
    select.style.padding = "4px 8px";
    select.style.borderRadius = "6px";
    select.style.border = "1px solid rgba(255,255,255,0.2)";
  } else {
    select.style.backgroundColor = "#e5e7eb";
    select.style.color = "#4b5563";
    select.style.fontWeight = "normal";
    select.style.border = "1px solid #d1d5db";
  }
}

function applyStatutBadge(select) {
  const color = STATUT_COLORS[select.value];
  if (color) {
    select.style.backgroundColor = color;
    select.style.color = "#fff";
    select.style.fontWeight = "bold";
    select.style.fontSize = "12px";
    select.style.padding = "4px 8px";
    select.style.borderRadius = "6px";
    select.style.border = "1px solid rgba(255,255,255,0.2)";
  } else {
    select.style.backgroundColor = "#e5e7eb";
    select.style.color = "#4b5563";
    select.style.fontWeight = "normal";
    select.style.border = "1px solid #d1d5db";
  }
}

// ======================================================
// TRANSFERTS (arrivees / departs)
// ======================================================

function loadTable(name) {
  const tbody = document.querySelector(`table[data-table="${name}"] tbody`);
  if (!tbody) return; // ✅ évite crash sur les pages qui n'ont pas ce tableau

  const data = JSON.parse(localStorage.getItem(name) || "[]");
  tbody.innerHTML = "";

  data.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    // Nom
    const nameTd = document.createElement("td");
    nameTd.contentEditable = true;
    nameTd.innerText = row[0] || "";
    if (row[4] === true) nameTd.classList.add("loan-name");
    nameTd.addEventListener("input", () => {
      row[0] = nameTd.innerText;
      localStorage.setItem(name, JSON.stringify(data));
    });
    tr.appendChild(nameTd);

    // Poste préféré
    const posteTd = document.createElement("td");
    posteTd.className = "poste-cell";
    const select = document.createElement("select");

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choisir un poste ▼";
    placeholder.disabled = true;
    select.appendChild(placeholder);

    POSTES.forEach((poste) => {
      const opt = document.createElement("option");
      opt.value = poste;
      opt.textContent = poste;
      select.appendChild(opt);
    });

    select.value = row[1] || "";
    applyPosteBadge(select);

    select.addEventListener("change", () => {
      row[1] = select.value;
      applyPosteBadge(select);
      localStorage.setItem(name, JSON.stringify(data));
    });

    posteTd.appendChild(select);
    tr.appendChild(posteTd);

    // Tous les postes
    createEditableCell(tr, row, 2, name, data);

    // Valeur
    createEditableCell(tr, row, 3, name, data);

    // Prêt
    const loanTd = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = row[4] === true;
    checkbox.addEventListener("change", () => {
      row[4] = checkbox.checked;
      localStorage.setItem(name, JSON.stringify(data));
      loadTable(name);
    });
    loanTd.appendChild(checkbox);
    tr.appendChild(loanTd);

    // Suppr
    const deleteTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "✖";
    btn.className = "delete-btn";
    btn.addEventListener("click", () => {
      data.splice(rowIndex, 1);
      localStorage.setItem(name, JSON.stringify(data));
      loadTable(name);
    });
    deleteTd.appendChild(btn);
    tr.appendChild(deleteTd);

    tbody.appendChild(tr);
  });
}

function createEditableCell(tr, row, colIndex, name, dataRef) {
  const td = document.createElement("td");
  td.contentEditable = true;
  td.innerText = row[colIndex] || "";
  td.addEventListener("input", () => {
    row[colIndex] = td.innerText;
    localStorage.setItem(name, JSON.stringify(dataRef));
  });
  tr.appendChild(td);
}

function addRow(name) {
  const data = JSON.parse(localStorage.getItem(name) || "[]");
  data.push(["", "", "", "", false]);
  localStorage.setItem(name, JSON.stringify(data));
  loadTable(name);
}

// ======================================================
// OBJECTIFS
// ======================================================

function objectivesKey(type) { return `objectives_${type}`; }
function loadObjectives(type) { return JSON.parse(localStorage.getItem(objectivesKey(type)) || "[]"); }
function saveObjectives(type, items) { localStorage.setItem(objectivesKey(type), JSON.stringify(items)); }

function renderObjectives(type) {
  const listEl = document.getElementById(`objective-list-${type}`);
  if (!listEl) return;

  const items = loadObjectives(type);
  listEl.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "objective-row";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = item.done === true;

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.className = "objective-text";
    textInput.value = item.text || "";

    const status = document.createElement("span");
    status.className = "objective-status";
    status.textContent = cb.checked ? "✅" : "❌";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "objective-del";
    del.textContent = "Suppr.";

    cb.addEventListener("change", () => {
      const updated = loadObjectives(type);
      const idx = updated.findIndex((x) => x.id === item.id);
      if (idx >= 0) {
        updated[idx].done = cb.checked;
        saveObjectives(type, updated);
        status.textContent = cb.checked ? "✅" : "❌";
      }
    });

    textInput.addEventListener("input", () => {
      const updated = loadObjectives(type);
      const idx = updated.findIndex((x) => x.id === item.id);
      if (idx >= 0) {
        updated[idx].text = textInput.value;
        saveObjectives(type, updated);
      }
    });

    del.addEventListener("click", () => {
      const updated = loadObjectives(type).filter((x) => x.id !== item.id);
      saveObjectives(type, updated);
      renderObjectives(type);
    });

    row.appendChild(cb);
    row.appendChild(textInput);
    row.appendChild(status);
    row.appendChild(del);

    listEl.appendChild(row);
  });
}

function addObjective(type) {
  const input = document.querySelector(`[data-objective-input="${type}"]`);
  if (!input) return;
  const text = (input.value || "").trim();
  if (!text) return;

  const items = loadObjectives(type);
  items.push({
    id: crypto?.randomUUID ? crypto.randomUUID() : Date.now() + "_" + Math.random(),
    text,
    done: false,
  });

  saveObjectives(type, items);
  input.value = "";
  renderObjectives(type);
}

function setupObjectiveEnter(type) {
  const input = document.querySelector(`[data-objective-input="${type}"]`);
  if (!input) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addObjective(type);
    }
  });
}

// ======================================================
// EFFECTIF
// ======================================================

function squadKey(group) { return `squad_${group}`; }
function loadSquad(group) { return JSON.parse(localStorage.getItem(squadKey(group)) || "[]"); }
function saveSquad(group, data) { localStorage.setItem(squadKey(group), JSON.stringify(data)); }

function makeEditableSquadCell(group, data, rowIndex, colIndex) {
  const td = document.createElement("td");
  td.contentEditable = true;
  td.innerText = data[rowIndex][colIndex] || "";
  td.addEventListener("input", () => {
    data[rowIndex][colIndex] = td.innerText;
    saveSquad(group, data);
  });
  return td;
}

function makeStarCell(group, data, row, valueIndex) {
  const td = document.createElement("td");

  const wrap = document.createElement("div");
  wrap.className = "star-wrap";

  const stars = document.createElement("div");
  stars.className = "stars";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "5";
  slider.step = "0.5";
  slider.className = "star-slider";

  const val = typeof row[valueIndex] === "number" ? row[valueIndex] : parseFloat(row[valueIndex] || "0");
  slider.value = isNaN(val) ? 0 : val;

  const setFill = (v) => {
    const pct = (Math.max(0, Math.min(5, v)) / 5) * 100;
    stars.style.setProperty("--fill", `${pct}%`);
  };

  setFill(parseFloat(slider.value));

  slider.addEventListener("input", () => {
    const v = parseFloat(slider.value);
    row[valueIndex] = v;
    saveSquad(group, data);
    setFill(v);
  });

  wrap.appendChild(stars);
  wrap.appendChild(slider);
  td.appendChild(wrap);
  return td;
}

function renderSquad(group) {
  const table = document.querySelector(`table[data-squad="${group}"]`);
  if (!table) return;

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  const data = loadSquad(group);

  data.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    tr.appendChild(makeEditableSquadCell(group, data, rowIndex, 0)); // num

    const nameTd = makeEditableSquadCell(group, data, rowIndex, 1); // nom
    if (row[8] === true) nameTd.classList.add("loan-name");
    tr.appendChild(nameTd);

    tr.appendChild(makeEditableSquadCell(group, data, rowIndex, 2)); // age

    // Poste
    const bestTd = document.createElement("td");
    const sel = document.createElement("select");
    sel.appendChild(new Option("Choisir ▼", "", true, !row[3]));
    sel.options[0].disabled = true;

    POSTES.forEach((p) => sel.appendChild(new Option(p, p, false, row[3] === p)));
    sel.value = row[3] || "";
    applyPosteBadge(sel);

    sel.addEventListener("change", () => {
      row[3] = sel.value;
      saveSquad(group, data);
      applyPosteBadge(sel);
    });

    bestTd.className = "poste-cell";
    bestTd.appendChild(sel);
    tr.appendChild(bestTd);

    tr.appendChild(makeEditableSquadCell(group, data, rowIndex, 4)); // autre poste
    tr.appendChild(makeStarCell(group, data, row, 5)); // niveau
    tr.appendChild(makeStarCell(group, data, row, 6)); // potentiel

    // Statut
    const statusTd = document.createElement("td");
    const statusSel = document.createElement("select");
    statusSel.appendChild(new Option("Statut ▼", "", true, !row[7]));
    statusSel.options[0].disabled = true;

    STATUTS.forEach((s) => statusSel.appendChild(new Option(s, s, false, row[7] === s)));
    statusSel.value = row[7] || "";
    applyStatutBadge(statusSel);

    statusSel.addEventListener("change", () => {
      row[7] = statusSel.value;
      saveSquad(group, data);
      applyStatutBadge(statusSel);
    });

    statusTd.appendChild(statusSel);
    tr.appendChild(statusTd);

    // Prêt
    const loanTd = document.createElement("td");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = row[8] === true;

    cb.addEventListener("change", () => {
      row[8] = cb.checked;
      saveSquad(group, data);
      renderSquad(group);
    });

    loanTd.appendChild(cb);
    tr.appendChild(loanTd);

    // Suppr
    const delTd = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "✖";

    delBtn.addEventListener("click", () => {
      data.splice(rowIndex, 1);
      saveSquad(group, data);
      renderSquad(group);
    });

    delTd.appendChild(delBtn);
    tr.appendChild(delTd);

    tbody.appendChild(tr);
  });
}

function addSquadRow(group) {
  const data = loadSquad(group);
  data.push(["", "", "", "", "", 0, 0, "", false]);
  saveSquad(group, data);
  renderSquad(group);
}

// ======================================================
// STATS
// ======================================================

function statsKey() { return "stats_firstteam"; }
function loadStats() { return JSON.parse(localStorage.getItem(statsKey()) || "[]"); }
function saveStats(d) { localStorage.setItem(statsKey(), JSON.stringify(d)); }

function applyNoteColor(inputEl, type) {
  const raw = (inputEl.value || "").replace(",", ".").trim();
  const v = parseFloat(raw);

  inputEl.classList.remove("note-good", "note-bad");
  if (Number.isNaN(v)) return;

  if (type === "note") {
    if (v >= 7.0) inputEl.classList.add("note-good");
    else if (v <= 5.9) inputEl.classList.add("note-bad");
  } else if (type === "noteE") {
    if (v >= 7.5) inputEl.classList.add("note-good");
    else if (v <= 6.5) inputEl.classList.add("note-bad");
  }
}

function renderStats() {
  const table = document.querySelector('table[data-stats="firstteam"]');
  if (!table) return;

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  const data = loadStats();

  // ✅ Tri automatique par poste au rendu
  sortStatsByPoste(data);
  saveStats(data);

  data.forEach((row, i) => {
    const tr = document.createElement("tr");

    for (let c = 0; c < 7; c++) {
      const td = document.createElement("td");

      // ✅ COLONNE POSTE (c=1) : dropdown + badge couleur
      if (c === 1) {
        const sel = document.createElement("select");
        sel.className = "poste-cell";

        const ph = new Option("Choisir ▼", "", true, !(row[1] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        POSTES.forEach(p => sel.appendChild(new Option(p, p, false, row[1] === p)));

        sel.value = row[1] || "";
        applyPosteBadge(sel);

        sel.onchange = () => {
          data[i][1] = sel.value;
          saveStats(data);
          applyPosteBadge(sel);

          // ✅ re-tri direct après changement de poste
          sortStatsByPoste(data);
          saveStats(data);
          renderStats();
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // --- Autres colonnes : input normal
      const input = document.createElement("input");
      input.value = row[c] || "";
      input.style.textAlign = "center";

      // ✅ Cadre couleur sur la cellule pour Note & NoteE
      if (c === 5) applyNoteCellColor(td, input.value, "note");
      if (c === 6) applyNoteCellColor(td, input.value, "noteE");

      input.oninput = () => {
        data[i][c] = input.value;
        saveStats(data);

        if (c === 5) applyNoteCellColor(td, input.value, "note");
        if (c === 6) applyNoteCellColor(td, input.value, "noteE");
      };

      td.appendChild(input);
      tr.appendChild(td);
    }

    // Suppr
    const tdDel = document.createElement("td");
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "✖";
    del.onclick = () => {
      data.splice(i, 1);
      saveStats(data);
      renderStats();
    };

    tdDel.appendChild(del);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });
}


function addStatsRow() {
  const d = loadStats();
  d.push(["", "", "", "", "", "", ""]);
  saveStats(d);
  renderStats();
}

function importFromSquad() {
  const groups = ["gardiens", "defenseurs", "milieux", "attaquants"];
  const stats = loadStats();
  const names = new Set(stats.map((s) => (s[0] || "").toLowerCase()));

  groups.forEach((g) => {
    loadSquad(g).forEach((p) => {
      const nom = (p[1] || "").trim();
      const poste = (p[3] || "").trim();
      if (nom && !names.has(nom.toLowerCase())) {
        stats.push([nom, poste, "", "", "", "", ""]);
      }
    });
  });

  sortStatsByPoste(stats);
  saveStats(stats);
  renderStats();
}

// ======================================================
// INIT GLOBAL (UNIQUE)
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  initSimpleSaves();

  // Objectifs (page saison)
  if (document.getElementById("objective-list-club")) {
    renderObjectives("club");
    renderObjectives("me");
    setupObjectiveEnter("club");
    setupObjectiveEnter("me");
  }

  // Transferts (page saison)
  loadTable("arrivees");
  loadTable("departs");

  // Effectif
  if (document.querySelector('table[data-squad="gardiens"]')) {
    ["gardiens", "defenseurs", "milieux", "attaquants"].forEach(renderSquad);
  }

  // Stats
  if (document.querySelector('table[data-stats="firstteam"]')) {
    renderStats();
  }

  if (document.querySelector('table[data-scouting="main"]')) {
  renderScouting();
  }

  if (document.querySelector('table[data-scouting="youth"]')) {
  renderScoutingYouth()
  
  document.addEventListener("DOMContentLoaded", () => {
  initSimpleSaves();
});
}


});

/* ======================================================
   SCOUTING (page Scouting)
   Colonnes :
   0 nom
   1 age
   2 poste (dropdown + badge)
   3 autre poste
   4 contrat
   5 valeur
   6 type de transfert (dropdown + badge)
   7 état du transfert (dropdown + badge)
   8 pourquoi / but
   9 reco recruteur (dropdown + badge)
   10 statut (dropdown + badge)
====================================================== */

function scoutingKey() { return "scouting_main"; }
function loadScouting() { return JSON.parse(localStorage.getItem(scoutingKey()) || "[]"); }
function saveScouting(d) { localStorage.setItem(scoutingKey(), JSON.stringify(d)); }

// --- Reco recruteur ---
const RECO_LEVELS = ["A+", "A", "A-", "B", "C", "D"];
const RECO_COLORS = {
  "A+": "#16a34a",  // vert fort
  "A":  "#22c55e",  // vert
  "A-": "#84cc16",  // vert/jaune
  "B":  "#f59e0b",  // orange
  "C":  "#fb7185",  // rose/rouge clair
  "D":  "#dc2626"   // rouge fort
};

// --- Type de transfert ---
const TRANSFER_TYPES = ["Transfert", "Prêt", "Fin de contrat"];
const TRANSFER_TYPE_COLORS = {
  "Transfert": "#2563eb",     // bleu
  "Prêt": "#7c3aed",          // violet
  "Fin de contrat": "#0f766e" // teal
};

// --- Etat du transfert ---
const TRANSFER_STATES = ["Observation", "Offre Faite", "Accepté", "Recruté", "Refusé", "Pas suite"];
const TRANSFER_STATE_COLORS = {
  "Observation": "#6b7280",  // gris
  "Offre Faite": "#f59e0b",  // orange
  "Accepté": "#22c55e",      // vert
  "Recruté": "#16a34a",      // vert foncé
  "Refusé": "#dc2626",       // rouge
  "Pas suite": "#111827"     // noir/gris très foncé
};

// Badge générique (pour Type/Etat)
function applyBadge(select, colors) {
  const color = colors[select.value];
  if (color) {
    select.style.backgroundColor = color;
    select.style.color = "#fff";
    select.style.fontWeight = "bold";
    select.style.borderRadius = "8px";
    select.style.border = "1px solid rgba(255,255,255,0.2)";
  } else {
    select.style.backgroundColor = "#e5e7eb";
    select.style.color = "#4b5563";
    select.style.fontWeight = "normal";
    select.style.border = "1px solid #d1d5db";
  }
}

// Badge Reco
function applyRecoBadge(select) {
  const color = RECO_COLORS[select.value];
  if (color) {
    select.style.backgroundColor = color;
    select.style.color = "#fff";
    select.style.fontWeight = "bold";
    select.style.borderRadius = "8px";
    select.style.border = "1px solid rgba(255,255,255,0.2)";
  } else {
    select.style.backgroundColor = "#e5e7eb";
    select.style.color = "#4b5563";
    select.style.fontWeight = "normal";
    select.style.border = "1px solid #d1d5db";
  }
}

function addScoutingRow() {
  const d = loadScouting();
  d.push(["", "", "", "", "", "", "", "", "", "", ""]);
  saveScouting(d);
  renderScouting();
}

function renderScouting() {
  const table = document.querySelector('table[data-scouting="main"]');
  if (!table) return;

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  const data = loadScouting();

  data.forEach((row, i) => {
    const tr = document.createElement("tr");

    for (let c = 0; c <= 10; c++) {
      const td = document.createElement("td");

      // 2 Poste (dropdown + badge)
      if (c === 2) {
        const sel = document.createElement("select");
        const ph = new Option("Choisir ▼", "", true, !(row[2] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        POSTES.forEach(p => sel.appendChild(new Option(p, p, false, row[2] === p)));
        sel.value = row[2] || "";
        applyPosteBadge(sel);

        sel.onchange = () => {
          data[i][2] = sel.value;
          saveScouting(data);
          applyPosteBadge(sel);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // 6 Type de transfert (dropdown + badge)
      if (c === 6) {
        const sel = document.createElement("select");
        const ph = new Option("Type ▼", "", true, !(row[6] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        TRANSFER_TYPES.forEach(t => sel.appendChild(new Option(t, t, false, row[6] === t)));
        sel.value = row[6] || "";
        applyBadge(sel, TRANSFER_TYPE_COLORS);

        sel.onchange = () => {
          data[i][6] = sel.value;
          saveScouting(data);
          applyBadge(sel, TRANSFER_TYPE_COLORS);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // 7 Etat du transfert (dropdown + badge)
      if (c === 7) {
        const sel = document.createElement("select");
        const ph = new Option("État ▼", "", true, !(row[7] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        TRANSFER_STATES.forEach(s => sel.appendChild(new Option(s, s, false, row[7] === s)));
        sel.value = row[7] || "";
        applyBadge(sel, TRANSFER_STATE_COLORS);

        sel.onchange = () => {
          data[i][7] = sel.value;
          saveScouting(data);
          applyBadge(sel, TRANSFER_STATE_COLORS);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // 9 Reco recruteur (dropdown + badge)
      if (c === 9) {
        const sel = document.createElement("select");
        const ph = new Option("Reco ▼", "", true, !(row[9] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        RECO_LEVELS.forEach(r => sel.appendChild(new Option(r, r, false, row[9] === r)));
        sel.value = row[9] || "";
        applyRecoBadge(sel);

        sel.onchange = () => {
          data[i][9] = sel.value;
          saveScouting(data);
          applyRecoBadge(sel);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // 10 Statut (dropdown + badge)
      if (c === 10) {
        const sel = document.createElement("select");
        const ph = new Option("Statut ▼", "", true, !(row[10] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        STATUTS.forEach(s => sel.appendChild(new Option(s, s, false, row[10] === s)));
        sel.value = row[10] || "";
        applyStatutBadge(sel);

        sel.onchange = () => {
          data[i][10] = sel.value;
          saveScouting(data);
          applyStatutBadge(sel);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // 8 Pourquoi/But -> textarea (plus pratique)
      if (c === 8) {
        const ta = document.createElement("textarea");
        ta.value = row[8] || "";
        ta.oninput = () => {
          data[i][8] = ta.value;
          saveScouting(data);
        };
        td.appendChild(ta);
        tr.appendChild(td);
        continue;
      }

      // Autres colonnes -> input
      const input = document.createElement("input");
      input.value = row[c] || "";
      input.style.textAlign = "center";

      if (c === 1) input.type = "number"; // âge

      input.oninput = () => {
        data[i][c] = input.value;
        saveScouting(data);
      };

      td.appendChild(input);
      tr.appendChild(td);
    }

    // Suppr
    const tdDel = document.createElement("td");
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "✖";
    del.onclick = () => {
      data.splice(i, 1);
      saveScouting(data);
      renderScouting();
    };
    tdDel.appendChild(del);
    tr.appendChild(tdDel);

    tbody.appendChild(tr);
  });
}

/* ======================================================
   SCOUTING JEUNES (≤ 18 ans) + NATIONALITE
   Table data-scouting="youth"
   Colonnes (0..13) :
   0 nom
   1 nationalite
   2 age
   3 poste
   4 autre poste
   5 contrat
   6 valeur
   7 type transfert
   8 état transfert
   9 pourquoi / but
   10 reco
   11 statut
   12 intérêt
   13 anniversaire (date)
====================================================== */

function scoutingYouthKey(){ return "scouting_youth"; }
function loadScoutingYouth(){ return JSON.parse(localStorage.getItem(scoutingYouthKey()) || "[]"); }
function saveScoutingYouth(d){ localStorage.setItem(scoutingYouthKey(), JSON.stringify(d)); }

const YOUTH_INTEREST = [
  "Intéressé (Transfert)",
  "Intéressé (Prêt)",
  "Pas intéressé"
];

const YOUTH_INTEREST_COLORS = {
  "Intéressé (Transfert)": "#16a34a",
  "Intéressé (Prêt)": "#2563eb",
  "Pas intéressé": "#dc2626"
};

function addScoutingYouthRow(){
  const d = loadScoutingYouth();
  d.push(["", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
  saveScoutingYouth(d);
  renderScoutingYouth();
}

function renderScoutingYouth(){
  const table = document.querySelector('table[data-scouting="youth"]');
  if (!table) return;

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  const data = loadScoutingYouth();

  data.forEach((row, i) => {
    const tr = document.createElement("tr");

    for (let c = 0; c <= 13; c++){
      const td = document.createElement("td");

      // Poste (index 3)
      if (c === 3) {
        const sel = document.createElement("select");
        const ph = new Option("Choisir ▼", "", true, !(row[3] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        POSTES.forEach(p => sel.appendChild(new Option(p, p, false, row[3] === p)));
        sel.value = row[3] || "";
        applyPosteBadge(sel);

        sel.onchange = () => {
          data[i][3] = sel.value;
          saveScoutingYouth(data);
          applyPosteBadge(sel);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // Type transfert (index 7)
      if (c === 7) {
        const sel = document.createElement("select");
        const ph = new Option("Type ▼", "", true, !(row[7] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        TRANSFER_TYPES.forEach(t => sel.appendChild(new Option(t, t, false, row[7] === t)));
        sel.value = row[7] || "";
        applyBadge(sel, TRANSFER_TYPE_COLORS);

        sel.onchange = () => {
          data[i][7] = sel.value;
          saveScoutingYouth(data);
          applyBadge(sel, TRANSFER_TYPE_COLORS);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // Etat transfert (index 8)
      if (c === 8) {
        const sel = document.createElement("select");
        const ph = new Option("État ▼", "", true, !(row[8] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        TRANSFER_STATES.forEach(s => sel.appendChild(new Option(s, s, false, row[8] === s)));
        sel.value = row[8] || "";
        applyBadge(sel, TRANSFER_STATE_COLORS);

        sel.onchange = () => {
          data[i][8] = sel.value;
          saveScoutingYouth(data);
          applyBadge(sel, TRANSFER_STATE_COLORS);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // Pourquoi / But (index 9) -> textarea
      if (c === 9) {
        const ta = document.createElement("textarea");
        ta.value = row[9] || "";
        ta.oninput = () => {
          data[i][9] = ta.value;
          saveScoutingYouth(data);
        };
        td.appendChild(ta);
        tr.appendChild(td);
        continue;
      }

      // Reco (index 10)
      if (c === 10) {
        const sel = document.createElement("select");
        const ph = new Option("Reco ▼", "", true, !(row[10] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        RECO_LEVELS.forEach(r => sel.appendChild(new Option(r, r, false, row[10] === r)));
        sel.value = row[10] || "";
        applyRecoBadge(sel);

        sel.onchange = () => {
          data[i][10] = sel.value;
          saveScoutingYouth(data);
          applyRecoBadge(sel);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // Statut (index 11)
      if (c === 11) {
        const sel = document.createElement("select");
        const ph = new Option("Statut ▼", "", true, !(row[11] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        STATUTS.forEach(s => sel.appendChild(new Option(s, s, false, row[11] === s)));
        sel.value = row[11] || "";
        applyStatutBadge(sel);

        sel.onchange = () => {
          data[i][11] = sel.value;
          saveScoutingYouth(data);
          applyStatutBadge(sel);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // Intérêt (index 12) -> dropdown + badge
      if (c === 12) {
        const sel = document.createElement("select");
        const ph = new Option("Intérêt ▼", "", true, !(row[12] || "").trim());
        ph.disabled = true;
        sel.appendChild(ph);

        YOUTH_INTEREST.forEach(x => sel.appendChild(new Option(x, x, false, row[12] === x)));
        sel.value = row[12] || "";
        applyBadge(sel, YOUTH_INTEREST_COLORS);

        sel.onchange = () => {
          data[i][12] = sel.value;
          saveScoutingYouth(data);
          applyBadge(sel, YOUTH_INTEREST_COLORS);
        };

        td.appendChild(sel);
        tr.appendChild(td);
        continue;
      }

      // Date anniversaire (index 13) -> date
      if (c === 13) {
        const input = document.createElement("input");
        input.type = "date";
        input.value = row[13] || "";
        input.oninput = () => {
          data[i][13] = input.value;
          saveScoutingYouth(data);
        };
        td.appendChild(input);
        tr.appendChild(td);
        continue;
      }

      // Inputs standards
      const input = document.createElement("input");
      input.value = row[c] || "";
      input.style.textAlign = "center";

      // âge (index 2)
      if (c === 2) input.type = "number";

      input.oninput = () => {
        data[i][c] = input.value;
        saveScoutingYouth(data);
      };

      td.appendChild(input);
      tr.appendChild(td);
    }

    // Suppr
    const tdDel = document.createElement("td");
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "✖";
    del.onclick = () => {
      data.splice(i, 1);
      saveScoutingYouth(data);
      renderScoutingYouth();
    };
    tdDel.appendChild(del);
    tr.appendChild(tdDel);

    tbody.appendChild(tr);
  });
}

// ======================================================
// UTILS GLOBAUX
// ======================================================
function exportDataJSON(){
  const data = {};
  for (let i = 0; i < localStorage.length; i++){
    const k = localStorage.key(i);
    data[k] = localStorage.getItem(k);
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  const season = (localStorage.getItem("settings_seasonName") || "FM_tool").replace(/\s+/g, "_");
  a.href = URL.createObjectURL(blob);
  a.download = `${season}_backup.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importDataJSON(event){
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try{
      const obj = JSON.parse(reader.result);

      // merge dans localStorage
      Object.keys(obj).forEach(k => {
        localStorage.setItem(k, obj[k]);
      });

      alert("✅ Données importées ! Recharge la page.");
    } catch(e){
      alert("❌ JSON invalide.");
    }
  };
  reader.readAsText(file);
}

function resetAllData(){
  if (!confirm("Tout supprimer ? (irréversible)")) return;
  localStorage.clear();
  alert("✅ Réinitialisé. Recharge la page.");
}

function resetOnlyStats(){
  if (!confirm("Réinitialiser uniquement les Statistiques ?")) return;
  localStorage.removeItem("stats_firstteam");
  alert("✅ Stats supprimées. Recharge la page.");
}

function resetOnlySquad(){
  if (!confirm("Réinitialiser uniquement l’Effectif ?")) return;
  ["gardiens","defenseurs","milieux","attaquants"].forEach(g => {
    localStorage.removeItem(`squad_${g}`);
  });
  alert("✅ Effectif supprimé. Recharge la page.");
}

async function exportCurrentPagePDF(){
  const { jsPDF } = window.jspdf;

  // On capture toute la page
  const canvas = await html2canvas(document.body, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Calcul taille image dans A4
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pdfWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let y = 0;
  if (imgHeight <= pdfHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  } else {
    // Multi-pages
    let heightLeft = imgHeight;
    while (heightLeft > 0) {
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      y -= pdfHeight;
      if (heightLeft > 0) pdf.addPage();
    }
  }

  const season = (localStorage.getItem("settings_seasonName") || "FM_tool").replace(/\s+/g, "_");
  pdf.save(`${season}_${document.title.replace(/\s+/g, "_")}.pdf`);
}

async function exportAllPagesPDF(){
  // ✅ Liste des pages à exporter (adapte si besoin)
  const pages = [
    { file: "index.html",        name: "Accueil" },
    { file: "season.html",       name: "Saison" },
    { file: "squad.html",     name: "Effectif" },
    { file: "stats.html",        name: "Statistiques" },
    { file: "scouting.html",     name: "Scouting" },
    { file: "scouting_youth.html", name: "Scouting_Jeunes" },
    { file: "review.html",        name: "Bilan" },
    { file: "settings.html",     name: "Parametres" },
  ];

  const season = (localStorage.getItem("settings_seasonName") || "FM_tool")
    .trim()
    .replace(/\s+/g, "_");

  const zip = new JSZip();

  // petite UI simple (optionnel)
  const oldText = document.title;
  document.title = "Export en cours…";

  try {
    // Iframe cachée (une seule, réutilisée)
    const frame = document.createElement("iframe");
    frame.className = "export-frame";
    document.body.appendChild(frame);

    for (let i = 0; i < pages.length; i++){
      const p = pages[i];

      // Charge la page dans l'iframe
      await loadIframe(frame, p.file);

      // Convertit en PDF
      const pdfBlob = await iframeToPdfBlob(frame);

      // Ajoute au ZIP
      zip.file(`${season}_${p.name}.pdf`, pdfBlob);
    }

    // Génère le zip
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${season}_PDF.zip`);

    alert("✅ Export terminé !");
  } catch (e) {
    console.error(e);
    alert("❌ Export impossible. Lance le projet via Live Server (pas file://) et réessaie.");
  } finally {
    document.title = oldText;
    const f = document.querySelector(".export-frame");
    if (f) f.remove();
  }
}

function loadIframe(frame, url){
  return new Promise((resolve, reject) => {
    frame.onload = () => {
      // petit délai pour laisser le CSS + JS s'appliquer (localStorage, rendu…)
      setTimeout(resolve, 250);
    };
    frame.onerror = reject;
    frame.src = url;
  });
}

async function iframeToPdfBlob(frame){
  const { jsPDF } = window.jspdf;

  const doc = frame.contentDocument;
  const body = doc.body;

  // Capture la page entière de l'iframe
  const canvas = await html2canvas(body, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: doc.documentElement.scrollWidth,
    windowHeight: doc.documentElement.scrollHeight
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pdfWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let position = 0;
  let heightLeft = imgHeight;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0){
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  return pdf.output("blob");
}
