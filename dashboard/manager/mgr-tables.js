/* ================================================
   SAVORIA — MANAGER TABLE MANAGEMENT  (mgr-tables.js)
================================================ */

const MgrTablesView = {

  render() {
    const tables = DB.tables;
    const counts = {
      occupied: tables.filter(t=>t.status==='occupied').length,
      empty:    tables.filter(t=>t.status==='empty').length,
      reserved: tables.filter(t=>t.status ==='reserved').length,
      cleaning: tables.filter(t=>t.status==='cleaning').length,
    };

    return `
      <style>
        .mt-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px}
        .mt-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        @media(max-width:700px){.mt-stats{grid-template-columns:repeat(2,1fr)}}
        .mt-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px}
        @media(max-width:900px){.mt-grid{grid-template-columns:repeat(4,1fr)}}
        @media(max-width:600px){.mt-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:420px){.mt-grid{grid-template-columns:repeat(2,1fr)}}
        .mt-card{aspect-ratio:1;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;transition:transform .15s,box-shadow .15s;border:2px solid transparent;position:relative}
        .mt-card:hover{transform:scale(1.04);box-shadow:var(--shadow-md)}
        .mt-card.occupied{background:var(--red-pale);border-color:rgba(192,57,43,.25)}
        .mt-card.empty{background:var(--green-pale);border-color:rgba(45,122,71,.2)}
        .mt-card.reserved{background:var(--blue-pale);border-color:rgba(26,82,118,.2)}
        .mt-card.cleaning{background:var(--orange-pale);border-color:rgba(196,122,26,.2)}
        .mt-card-num{font-family:'Playfair Display',serif;font-size:20px;font-weight:900}
        .mt-card.occupied .mt-card-num{color:var(--red)}
        .mt-card.empty    .mt-card-num{color:var(--green)}
        .mt-card.reserved .mt-card-num{color:var(--blue)}
        .mt-card.cleaning .mt-card-num{color:var(--orange)}
        .mt-card-lbl{font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
        .mt-card.occupied .mt-card-lbl{color:rgba(192,57,43,.7)}
        .mt-card.empty    .mt-card-lbl{color:rgba(45,122,71,.7)}
        .mt-card.reserved .mt-card-lbl{color:rgba(26,82,118,.7)}
        .mt-card.cleaning .mt-card-lbl{color:rgba(196,122,26,.7)}
        .mt-badge{position:absolute;top:6px;right:6px;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff}
        .mt-badge.occupied{background:var(--red)}
        .mt-badge.reserved{background:var(--blue)}
        .mt-list-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)}
        .mt-list-item:last-child{border-bottom:none}
        
        .mt-del-btn{position:absolute;top:-6px;left:-6px;width:20px;height:20px;border-radius:50%;background:var(--bg-white);border:1px solid var(--border);color:var(--red);display:none;align-items:center;justify-content:center;font-size:10px;box-shadow:var(--shadow-sm);transition:all .15s}
        .mt-card:hover .mt-del-btn{display:flex}
        .mt-del-btn:hover{background:var(--red);color:#fff;transform:scale(1.1)}
      </style>

      <div class="mt-header">
        <div>
          <div class="page-title"><i class="fa-solid fa-table-cells" style="color:var(--gold);margin-right:8px"></i>Table Management</div>
          <div class="page-subtitle">Real-time floor management & seating</div>
        </div>
        <div style="display:flex;gap:8px">
         
          <button class="btn btn-primary btn-sm" onclick="MgrTablesView._addReservation()">
            <i class="fa-solid fa-plus"></i> Add Table
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-stats">
        ${[
          ['occupied','fa-fire','Occupied',counts.occupied,'red'],
          ['empty','fa-circle-check','Available',counts.empty,'green'],
          ['reserved','fa-calendar-check','Reserved',counts.reserved,'blue'],
          ['cleaning','fa-broom','Cleaning',counts.cleaning,'orange'],
        ].map(([s,ic,l,c,col])=>`
          <div class="card" style="text-align:center">
            <div style="width:36px;height:36px;border-radius:10px;background:var(--${col}-pale);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;color:var(--${col});font-size:14px">
              <i class="fa-solid ${ic}"></i>
            </div>
            <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900">${c}</div>
            <div style="font-size:11px;color:var(--text-3)">${l}</div>
          </div>`).join('')}
      </div>

      <!-- Legend -->
      <div style="display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap">
        ${[['occupied','red','Occupied'],['empty','green','Available'],['reserved','blue','Reserved'],['cleaning','orange','Cleaning']].map(([s,c,l])=>`
          <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-3)">
            <span style="width:10px;height:10px;border-radius:3px;background:var(--${c})"></span>${l}
          </span>`).join('')}
      </div>

      <!-- Table Grid -->
      <div class="card" style="margin-bottom:20px">
        <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;margin-bottom:14px">
          <i class="fa-solid fa-map" style="color:var(--gold);margin-right:6px"></i>Floor Map
        </div>
        <div class="mt-grid">
          ${tables.sort((a,b)=>a.num - b.num).map(t => `
            <div class="mt-card ${t.status}" onclick="MgrTablesView._tableDetail(${t.num})" title="Table ${t.num}">
              <button class="mt-del-btn" title="Delete Table" onclick="event.stopPropagation(); MgrTablesView._deleteTable(${t.num})">
                <i class="fa-solid fa-trash-can"></i>
              </button>
              ${t.status==='occupied'?`<div class="mt-badge occupied">${t.guests}</div>`:''}
              ${t.status==='reserved'?`<div class="mt-badge reserved"><i class="fa-solid fa-lock" style="font-size:7px"></i></div>`:''}
              <div class="mt-card-num">${t.num}</div>
              <div class="mt-card-lbl">${t.status}</div>
              ${t.status==='occupied'?`<div style="font-size:9px;color:rgba(192,57,43,.6)">${t.seated}</div>`:''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Occupied Tables Detail -->
      <div class="card">
        <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;margin-bottom:14px">
          <i class="fa-solid fa-fire" style="color:var(--red);margin-right:6px"></i>Occupied Tables
        </div>
        ${tables.filter(t=>t.status==='occupied').map(t=>`
          <div class="mt-list-item">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--red-pale);border:1.5px solid rgba(192,57,43,.2);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:var(--red);flex-shrink:0">${t.num}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${t.guests} guests · Waiter: ${t.waiter}</div>
              <div style="font-size:11px;color:var(--text-3)">Seated ${t.seated}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:13px;font-weight:700;color:var(--green)">${Utils.money(t.bill)}</div>
              <div style="font-size:10px;color:var(--text-3)">Current bill</div>
            </div>
            <div style="display:flex;gap:6px;margin-left:8px">
              <button class="btn btn-outline btn-sm btn-icon" title="View bill" onclick="Toast.show('Bill for Table ${t.num}: ${Utils.money(t.bill)}','info')">
                <i class="fa-solid fa-receipt"></i>
              </button>
              <button class="btn btn-outline btn-sm btn-icon" title="Mark cleaning" onclick="MgrTablesView._markCleaning(${t.num})">
                <i class="fa-solid fa-broom"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  _tableDetail(num) {
    const t = DB.tables.find(x=>x.num===num);
    if (!t) return;
    if (t.status === 'empty') {
      Toast.show(`Table ${num} is available`, 'info');
    } else if (t.status === 'occupied') {
      Toast.show(`Table ${num} · ${t.guests} guests · ${t.waiter} · Bill: ${Utils.money(t.bill)}`, 'info');
    } else if (t.status === 'reserved') {
      Toast.show(`Table ${num} reserved for ${t.seated}`, 'info');
    } else {
      Toast.show(`Table ${num} is being cleaned`, 'info');
    }
  },

  _markCleaning(num) {
    const t = DB.tables.find(x=>x.num===num);
    if (t) { t.status = 'cleaning'; t.guests = 0; t.waiter = ''; t.bill = 0; }
    Toast.show(`Table ${num} marked for cleaning`, 'success');
    TableStorage.save();
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  _addReservation() {
    document.getElementById('newTableNum').value = '';
    document.getElementById('tableError').style.display = 'none';
    Modal.open('tableModal');
  },

  _saveNewTable() {
    const numInput = document.getElementById('newTableNum');
    const errEl = document.getElementById('tableError');
    const num = parseInt(numInput.value);

    if (isNaN(num) || num <= 0) {
      errEl.textContent = 'Please enter a valid table number.';
      errEl.style.display = 'block';
      return;
    }

    // Duplicate check
    if (DB.tables.some(t => t.num === num)) {
      errEl.textContent = `Table ${num} already exists!`;
      errEl.style.display = 'block';
      return;
    }

    const newTable = {
      num: num,
      status: 'empty',
      guests: 0,
      seated: '',
      waiter: '',
      bill: 0
    };

    DB.tables.push(newTable);
    TableStorage.save();
    
    Modal.close('tableModal');
    Toast.show(`Table ${num} added successfully`, 'success');
    
    // Re-render
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  _deleteTable(num) {
    if (!confirm(`Are you sure you want to delete Table ${num}?`)) return;

    const idx = DB.tables.findIndex(t => t.num === num);
    if (idx > -1) {
      DB.tables.splice(idx, 1);
      TableStorage.save();
      Toast.show(`Table ${num} deleted`, 'info');
      
      document.getElementById('pageArea').innerHTML = this.render();
      if (this.init) this.init();
    }
  },

  init() {},
};
