(function() {
  "use strict";

  var tableBody = document.getElementById("tableBody");
  var addRowBtn = document.getElementById("addRow");
  var downloadBtn = document.getElementById("downloadCsv");
  var clearBtn = document.getElementById("clearAll");

  function createCellInput(type, value, options, defaultValue, placeholder) {
    var el;
    if (type === "select") {
      el = document.createElement("select");
      (options || []).forEach(function(opt) {
        var o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        el.appendChild(o);
      });
      el.value = value || defaultValue || "";
    } else if (type === "textarea") {
      el = document.createElement("textarea");
      el.value = value || "";
      if (placeholder) el.placeholder = placeholder;
    } else {
      el = document.createElement("input");
      el.type = type;
      el.value = value || "";
      if (placeholder) el.placeholder = placeholder;
    }
    el.className = "field";
    if (type === "textarea") {
      el.className += " field-textarea";
    }
    return el;
  }

  function addRow(data) {
    var tr = document.createElement("tr");

    var tdDate = document.createElement("td");
    var tdPosisi = document.createElement("td");
    var tdDosen = document.createElement("td");
    var tdUraian = document.createElement("td");
    var tdActions = document.createElement("td");

    tdDate.className = "table-cell";
    tdPosisi.className = "table-cell";
    tdDosen.className = "table-cell";
    tdUraian.className = "table-cell";
    tdActions.className = "table-cell";

    tdDate.appendChild(createCellInput("date", data && data.date));
    tdPosisi.appendChild(createCellInput("select", data && data.posisi, ["Proposal", "Hasil", "Pendadaran"], "Proposal"));
    tdDosen.appendChild(createCellInput("text", data && data.dosen, null, null, "NIP atau nama dosen"));
    var uraianField = createCellInput("textarea", data && data.uraian, null, null, "Isi bimbingan");
    tdUraian.appendChild(uraianField);

    var btnAi = document.createElement("button");
    btnAi.textContent = "✨";
    btnAi.className = "btn-ai";
    btnAi.title = "Generate uraian pakai AI";
    btnAi.addEventListener("click", function() {
      var posisi = tr.querySelector("select").value;
      generateUraian(posisi, uraianField, btnAi);
    });
    tdUraian.appendChild(btnAi);

    var btn = document.createElement("button");
    btn.textContent = "Hapus";
    btn.className = "btn-delete";
    btn.addEventListener("click", function() {
      tr.remove();
      if (!tableBody.children.length) addRow();
    });

    var btnDup = document.createElement("button");
    btnDup.textContent = "Duplikat";
    btnDup.className = "btn-dup";
    btnDup.addEventListener("click", function() {
      var cells = tr.querySelectorAll("td");
      addRow({
        date: cells[0].querySelector("input").value,
        posisi: cells[1].querySelector("select").value,
        dosen: cells[2].querySelector("input").value,
        uraian: cells[3].querySelector("textarea").value
      });
    });

    var actionsWrap = document.createElement("div");
    actionsWrap.className = "row-actions";
    actionsWrap.appendChild(btnDup);
    actionsWrap.appendChild(btn);
    tdActions.appendChild(actionsWrap);

    tr.appendChild(tdDate);
    tr.appendChild(tdPosisi);
    tr.appendChild(tdDosen);
    tr.appendChild(tdUraian);
    tr.appendChild(tdActions);

    tableBody.appendChild(tr);
  }

  function escapeCsv(value) {
    var str = String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (str.indexOf("\"") >= 0 || str.indexOf(",") >= 0 || str.indexOf("\n") >= 0) {
      return "\"" + str.replace(/\"/g, "\"\"") + "\"";
    }
    return str;
  }

  function normalizeDate(value) {
    var v = String(value || "").trim();
    if (!v) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      var parts = v.split("-");
      return parts[2] + "-" + parts[1] + "-" + parts[0];
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(v)) return v;
    return v;
  }

  function collectRows() {
    var rows = [];
    var trs = tableBody.querySelectorAll("tr");
    trs.forEach(function(tr) {
      var cells = tr.querySelectorAll("td");
      var date = normalizeDate(cells[0].querySelector("input").value);
      var posisi = cells[1].querySelector("select").value.trim();
      var dosen = cells[2].querySelector("input").value.trim();
      var uraian = cells[3].querySelector("textarea").value.trim();

      if (date || posisi || dosen || uraian) {
        rows.push([date, posisi, dosen, uraian]);
      }
    });
    return rows;
  }

  function downloadCsv() {
    var rows = collectRows();
    if (!rows.length) {
      alert("Tidak ada data.");
      return;
    }

    var csv = "tanggal,posisi,dosen,uraian\n" + rows
      .map(function(r) { return r.map(escapeCsv).join(","); })
      .join("\n");

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "bimbingan.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  addRowBtn.addEventListener("click", function() { addRow(); });
  downloadBtn.addEventListener("click", downloadCsv);
  clearBtn.addEventListener("click", function() {
    tableBody.innerHTML = "";
    addRow();
  });

  addRow();

  // ── Daftar Dosen ──────────────────────────────────────────────────────────
  var dosenData = [
    {id:"081251753882",name:"Ema Dwi Arsita, S.Ars., M.Ars."},
    {id:"08125247209",name:"Dimas Bintang Mudrajad, S.T., M.Si."},
    {id:"081258331567",name:"Ar. Arisa Aulia R. Sukardi, S.Ars., M. Ars., IAI"},
    {id:"081328268161",name:"Anwar Ibrahim Triyoga, S.Fil., M.Phil"},
    {id:"082125427932",name:"Achmad Rizky Zulfahmiddin, S.T., M.S.P."},
    {id:"085157882680",name:"Gilang Ramadhan Rakasywi, S.Ars., M.T."},
    {id:"085250000945",name:"Ar. Ikhwanul Ahfadz, S.T., M.Ars., IAI."},
    {id:"085652149007",name:"Tiffany P. Bleszynki, S.T., M.Arc."},
    {id:"196309251990091001",name:"Dr. Ir. Rudarmono, M.P."},
    {id:"196609172000121003",name:"Dr. Ir. Ibnu Hasyim, M.T."},
    {id:"196612311995121002",name:"Prof. Dr. Ir Harjuni Hasan M.Si"},
    {id:"196706172000121001",name:"Hadi Irawiraman"},
    {id:"196707152000121001",name:"Ruminsar Simbolon, S.T., M.T."},
    {id:"196810022005012001",name:"Dr. Ir. Revia Oktaviani, ST.,MT"},
    {id:"196812242000031001",name:"Dr. Ir. Nataniel Dengen, S.Si., M.Si."},
    {id:"196906152001121001",name:"Dr. Ir. Abdul Kahar, S.T., M.Si., IPM."},
    {id:"196907061995121004",name:"Prof. Dr. Ir. Dharma Widada, M.T., IPU, AER, APEC Eng."},
    {id:"196909261994121002",name:"Prof. Dr.. Fahrul Agus, S.Si., M.T."},
    {id:"196911091995122006",name:"Ir. Hj. Masayu Widiastuti, M.T., IPM"},
    {id:"197002272000121001",name:"Prof. Dr. Ir.. Tamrin, S.T.,M.T., IPU., APEC Eng"},
    {id:"197008212000121001",name:"Heri Sutanto, S.T., M.T."},
    {id:"197009272003121001",name:"Dr. Ir. Agus Winarno, ST., MT."},
    {id:"197101021995121001",name:"Muhammad Dahlan Balfas, S.T., M.T."},
    {id:"197101042000031003",name:"Fachriza Noor Abdi, S.T., M.T"},
    {id:"197101082000122002",name:"Ir. Henny Magdalena, ST., MT."},
    {id:"197104112000031001",name:"Dr. Ir. La Ode Ahmad Safar Tosungku, S.T., M.T"},
    {id:"197107222000031004",name:"Muhammad Jazir Alkas, ST., MT."},
    {id:"197110032000121002",name:"Budi Haryanto, ST., MT"},
    {id:"197112112006042001",name:"Dr.. Suryaningsi, S.Pd.,M.H"},
    {id:"197202122008121003",name:"Dr. Ir. Didit Suprihanto, S.T., M.Kom"},
    {id:"197203022000122001",name:"Dr. Ir. Retno Anjarwati, ST.MT."},
    {id:"197206231999031002",name:"Sulistyo Prabowo, A.Md., S.T.P., M.P., MPH., Ph.D."},
    {id:"197209042000121001",name:"Dr. Sc. Mustaid Yusuf, M.Si."},
    {id:"197211012001122001",name:"Ramadiani, M.Kom., Ph.D."},
    {id:"197211112000121001",name:"Ir. Windhu Nugroho, S.T., M.T."},
    {id:"197212142000121001",name:"Dr. Tiopan Henry Manto Gultom, ST,. MT."},
    {id:"197304232000121001",name:"Ir. Fatkhul Hani Rumawan, S.T., M.T."},
    {id:"197305281999031001",name:"Prof. Ir.. Haviluddin, S.Kom., M.Kom., IPM., Ph.D."},
    {id:"197307282000121001",name:"Dr. Johannes Edward Simangunsong, ST., MT."},
    {id:"197312292005011002",name:"Awang Harsa Kridalaksana, S.Kom., M.Kom."},
    {id:"197501122009122001",name:"Irma Suryani, S.Ag,M.Ag"},
    {id:"197504242003121001",name:"Dr. Ir. Wahyuda, S.T., M.T."},
    {id:"197504282001122001",name:"Prof. Dr. R. R. Harlinda Kuspradini,, S.Hut., M.P."},
    {id:"197506182008122002",name:"Rabiatul Adawiyah, LC., MA"},
    {id:"197507102005011004",name:"Ir. Edhi Sarwono, ST., M.Eng"},
    {id:"197510152008012009",name:"Waryati, S.T., M.T., M.Sc."},
    {id:"197511182003121003",name:"Dr. Ery Budiman, S.T., M.T"},
    {id:"197512172005011005",name:"Dr. Ir. Shalaho Dina Devy, ST., M. Eng."},
    {id:"197603312008121001",name:"Ir. Muslimin, S.T., M.T., IPM., ASEAN Eng."},
    {id:"197606082005012001",name:"Dr.. Dwi Ermawati Rahayu, S.T., M.T"},
    {id:"197606252005011002",name:"Dr.. Yunianto Setiawan, S.Si., M.Si."},
    {id:"197606262005011000",name:"Ir. Ali Suhardiman, S.Hut., M.P., Ph.D."},
    {id:"197607262006042001",name:"Andi Tejawati, S.Sos., M.Si."},
    {id:"197609042005012003",name:"Dyah Wahyu Wijayanti, ST., M.Eng"},
    {id:"197612262006041001",name:"Yohanes Budi Sulistioadi, S.Hut., M.Sc., M.S., Ph.D."},
    {id:"197701192008122001",name:"Dr. Joan Angelina Widians, S.Kom., M.Kom."},
    {id:"197701302005011003",name:"Zainal Arifin, S.Kom., M.Kom"},
    {id:"197701312005012002",name:"Penny Pujowati, S.P., M.Si."},
    {id:"197703112008122001",name:"Dr. Mardewi Jamal, S.T., M.T."},
    {id:"197704262023211003",name:"Ir. Heriyanto, S.T., M.T."},
    {id:"197801262008011006",name:"Dr. Eng.. Dutho Suh Utomo, S.T., M.T.,D.Eng"},
    {id:"197801282008121001",name:"Ir. Addy Suyatno, S.Kom., M.Kom."},
    {id:"197802182008122001",name:"Indah Prihatiningtyas D.S., S.T., MT., Ph.D."},
    {id:"197803022009121003",name:"Dr. Eko Heryadi, S.Hut, M.P., M.Sc"},
    {id:"197803182010121002",name:"Dr. Hairul Huda, S.T., M.T."},
    {id:"197803192010121001",name:"Ari Susandy Sanjaya, S.T., M.T."},
    {id:"197811062010121001",name:"Ibrahim, S.Si., M.Si."},
    {id:"197904222009121002",name:"Nurdin"},
    {id:"197906062005011006",name:"Prof. Dr. Ir. Hamdani, S.T., M.Cs., IPM."},
    {id:"197906272005011003",name:"Ir. H. Yudi Sukmono, ST., MT."},
    {id:"197906292005012003",name:"Ir. Farida Djumiati Sitania, S.T., M.T., IPM, ASEAN Eng."},
    {id:"197908092005011013",name:"Ir. Dedy Cahyadi, M.Cs"},
    {id:"197912192005012002",name:"Dr. Desy Rusmawaty, S.Pd., M.А"},
    {id:"198005092003122001",name:"Dr. Ir. . Muriani Emelda Isharyani, S.T., M.T., IPM."},
    {id:"198105062005012002",name:"Ir.. Indah Fitri Astuti, S.Kom, M.Cs"},
    {id:"198107032006042002",name:"Budi Nining Widarti, ST., M. Eng."},
    {id:"198202162024212011",name:"Ir.. Puspa Indah Rindawati, ST. M Ling"},
    {id:"198209012009122003",name:"Prof. Dr. Ir. Anindita Septiarini, S.T., M.Cs., IPU."},
    {id:"198303022012121002",name:"Dr. Ir. Willy Tambunan, S.T.,M.T. IPM.,ASEAN.Eng., APEC Eng."},
    {id:"198312132009122003",name:"Retno Wulandari, S.Hut, M.Sc.,Ph.D"},
    {id:"198403022008121002",name:"Ir. Arif Harjanto, S.T., M.Kom."},
    {id:"198403052008122001",name:"Ir. Dyna Marisa Khairina, S.Kom., M.Kom"},
    {id:"198405112015042002",name:"Dr. Ir. Mardiah, S.T., M.T."},
    {id:"198408062015042002",name:"Ummul Hairah, S.Pd., M.T."},
    {id:"198409292008122004",name:"Ir. hj. Septya Maharani, M. Kom"},
    {id:"198412102009121004",name:"Muhammad Busyairi, S.T., M.Sc., IPM."},
    {id:"198509212019032017",name:"Rosmasari, S.Kom., M.T"},
    {id:"198511032014042002",name:"Masna Wati, S.Si., M.T."},
    {id:"198512032012121005",name:"Ir. Tommy Trides, S.T., M.T."},
    {id:"198512292018031001",name:"Happy Nugroho, S.T., M.T."},
    {id:"198604242019032011",name:"Dr. Kezia Arum Sary, S.Ds., M.Med.Kom"},
    {id:"198608032019031006",name:"Putut Pamilih Widagdo, S.Kom., M.Kom"},
    {id:"198608302022031003",name:"Rif'an Fathoni, S.T., M.T."},
    {id:"198610222018031002",name:"Ir. Suwardi Gunawan, ST, MT"},
    {id:"198611172019031008",name:"Wira Bharata, S.AB., M.AB."},
    {id:"198612182019031007",name:"Hario Jati Setyadi, S.Kom., M.Kom"},
    {id:"198701162015042001",name:"Islamiyah,S.Kom, M.Kom"},
    {id:"198707112019031012",name:"Ir. Pandu Kusumoputro Utomo, S.T., M.Sc."},
    {id:"198707212015042004",name:"Ir. Triana Sharly Permaisuri Arifin, S.T.,M.Sc."},
    {id:"198711122020122005",name:"Ir. Lucia Litha Respati, S.T., M.E."},
    {id:"198801202019031014",name:"Petrus Fendiyanto, S.Pd., M.Si"},
    {id:"198804132019031016",name:"Dr. apt. Mukti Priastomo, M.Si."},
    {id:"198807262019031010",name:"Ir. Fahrizal Adnan, S.T., M.Sc."},
    {id:"198811062015042002",name:"Ir. Novianti Puspitasari, S.Kom., M.Eng"},
    {id:"198812162023211017",name:"Ir. Koeshadi Sasmito, S.T.,M.T"},
    {id:"198812242018031001",name:"Muhammad Amin Syam, S.Si., M.Eng."},
    {id:"198901092024211011",name:"Dr. Eko Subastian, S.Pd., M.Kom."},
    {id:"198905222018031001",name:"Medi Taruk, M.Cs"},
    {id:"198908012019031015",name:"Nanda Arista Rizki,S.Si, M.Si"},
    {id:"198911072018032001",name:"Vina Zahrotun Kamila, S.Kom, M.Kom"},
    {id:"198912302019031013",name:"Agus Kastama Putra, S.Sn., M.Sn."},
    {id:"199004042025061005",name:"Gubtha Mahendra Putra, S.Kom, M.Eng."},
    {id:"199005102014042001",name:"Ir. Ika Meicahayanti, S.T., M.T."},
    {id:"199005242019032015",name:"Resty Intan Putri, S.T.,M.Eng"},
    {id:"199006192025061002",name:"Muhammad Zulfariansyah, S.Kom., M.TI."},
    {id:"199007042020122003",name:"Ir. Dharwati Pratama Sari, S.T., M.T., M.Sc."},
    {id:"199007172025061004",name:"Reza Prakoso D.J.,S.P., M.P."},
    {id:"199009262022031005",name:"Muhammad Rizqy Septyandy, M.T."},
    {id:"199010272018031002",name:"Arwin Sanjaya, M.AB."},
    {id:"199012222024061002",name:"Ir. Ardhan Ismail, S.T., M.T"},
    {id:"199102022022032011",name:"Saferi Yohana, M.A."},
    {id:"199102132022031006",name:"Panggea Ghiyats Sabrian, S.Si. M.T.,Ph.d"},
    {id:"199105182019031017",name:"Aries Utomo, S.Pd., M.Pd."},
    {id:"199106062024061001",name:"Rajiansyah, S.Kom., M.Sc"},
    {id:"199106172024061001",name:"Ridzky Zul Asdi, S.T., M.T."},
    {id:"199107092022031002",name:"Ir. Albertus Juvensius Pontus, ST., M.T."},
    {id:"199107122020121004",name:"Ir. Restu Mukti Utomo, S.T., M.T."},
    {id:"199107272023211025",name:"Reza Wardhana, S.Kom., M.Eng."},
    {id:"199109292025061004",name:"Fredy Heri Yanto Siadari, S.T., M.T."},
    {id:"199202062022032006",name:"Febrina Zulya, ST., M.T."},
    {id:"199202122020121009",name:"Amin Padmo Azam Masa, S.Kom., M.Cs."},
    {id:"199203072022032008",name:"Indra Ariani, S.T., M.Eng."},
    {id:"199209102022031009",name:"Ahmad Moh. Nur, M.T."},
    {id:"199210302019032025",name:"Nur Rani Alham, S.pD., M.T"},
    {id:"199211062019031019",name:"Muhammad Bambang Firdaus, S.Kom., M.Kom"},
    {id:"199301082022032011",name:"Marwah Ulwatunnisa, S.Pd. M.Pd."},
    {id:"199301112022031011",name:"Ir. Adi Pandu Wirawan, M.T., IPM."},
    {id:"199301122020122010",name:"Ir.. Anisah Azizah, S.T., M.T."},
    {id:"199304062019032019",name:"Ir. Nur Asriatul Kholifah, S.Ars., M.Sc."},
    {id:"199305292019032020",name:"Tantra Diwa Larasati, S.T., M.T."},
    {id:"199308172023212069",name:"Aulia Khoirunnita, S.Kom., M.Kom"},
    {id:"199308182025061004",name:"Muhammad Fawaz Saputra, S.T., M.Eng."},
    {id:"199310222019031016",name:"Anton Prafanto, M.T"},
    {id:"199311232022032012",name:"Ir. Putri Nopianti, S.T., M.T."},
    {id:"199312032024062004",name:"Khairunnisa, S.T, M.T"},
    {id:"199405242024061001",name:"Muhammad Rivani Ibrahim, S.Kom., M.Kom"},
    {id:"199406112020121007",name:"Muhammad Labib Jundillah, S.Kom., M.Kom."},
    {id:"199407012025062008",name:"Lidwina Putri Astani, S.T., M.Eng."},
    {id:"199408022025061004",name:"Triandi Bimankalid, S.H., M.H."},
    {id:"199412152022031009",name:"Ramaulvi Muhammad Akhyar, M.Kom."},
    {id:"199501142024061003",name:"Rosyid Nurrohman, S.M., M.AB."},
    {id:"199503062025062008",name:"Aulia Fauziah Lu'ayi, S.T., M.T."},
    {id:"199503152024062002",name:"Rety Winonazada, M.T"},
    {id:"199504222023211014",name:"M. Ari Prayogo"},
    {id:"199504252025061005",name:"Ian Karunia Perkasa, S.T., M.T."},
    {id:"199505052020121012",name:"Ir.. Searphin Nugroho, S.T., M.T."},
    {id:"199508272022031003",name:"Dr. Akhmad Irsyad, S.T., M.Kom"},
    {id:"199509242024062001",name:"Riftika Rizawanti, S.Pd., MCS"},
    {id:"199512062024062002",name:"Rizqi Nadhirawaty, S.T., M.T"},
    {id:"199601292025062009",name:"Azmia Rizka Nafisah, S.T., M.T."},
    {id:"199602242025062005",name:"Dian Febrianti Pisceselia, S.Tr.T., M.T."},
    {id:"199604112024062001",name:"Kartika Tristanto, S.Ars., M.Arch"},
    {id:"199605292024062001",name:"Rahmahtriananda Faradilla, S.T., M.T"},
    {id:"199611202024062001",name:"Chalsi Mala Sari, M.T"},
    {id:"199709242024061001",name:"Mochamad Gaharu Dida Devedo, S.T., M.Eng"},
    {id:"199710052024061002",name:"Ir. M Ibadurrahman Arrasyid Supriyanto, M.Kom."},
    {id:"199802162025062011",name:"Ratri Bodromulatsih, S.Ds., M.Ars."},
    {id:"199808132025062011",name:"Ayu jelita Ningrum, S.Pd., M.Pd."},
    {id:"199811072025061006",name:"Imam Muhammad Hakim, S.T., M.T."},
    {id:"201810197206012001",name:"Rasni Alex, SE., MM."},
    {id:"202201197104242001",name:"Ir. Theresia Amelia Pawitra, S.T., M.Sc., M.Eng., IPU, ASEAN Eng."},
    {id:"2309106013",name:"MUHAMMAD AFRIZAL KESUMA"}
  ];

  var dosenListEl = document.getElementById("dosenList");
  var dosenSearchEl = document.getElementById("dosenSearch");

  function renderDosenList(filter) {
    var query = (filter || "").toLowerCase();
    var html = "";
    var count = 0;
    for (var i = 0; i < dosenData.length; i++) {
      var d = dosenData[i];
      if (query && d.name.toLowerCase().indexOf(query) < 0 && d.id.indexOf(query) < 0) continue;
      html += '<div class="dosen-item"><span class="dosen-name">' + escapeHtml(d.name) + '</span><code class="dosen-nip">' + d.id + '</code></div>';
      count++;
    }
    if (!count) html = '<p class="hint">Tidak ditemukan.</p>';
    dosenListEl.innerHTML = html;
  }

  function escapeHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  dosenSearchEl.addEventListener("input", function() {
    renderDosenList(dosenSearchEl.value);
  });

  renderDosenList("");

  // ── AI Generate Uraian ────────────────────────────────────────────────────
  var AI_STORAGE_KEY = "eta_ai_config";

  var aiBaseUrlEl = document.getElementById("aiBaseUrl");
  var aiApiKeyEl = document.getElementById("aiApiKey");
  var aiModelEl = document.getElementById("aiModel");
  var aiSaveBtn = document.getElementById("aiSaveConfig");
  var aiSaveStatus = document.getElementById("aiSaveStatus");

  // Load saved config
  function loadAiConfig() {
    try {
      var saved = JSON.parse(localStorage.getItem(AI_STORAGE_KEY) || "{}");
      if (saved.baseUrl) aiBaseUrlEl.value = saved.baseUrl;
      if (saved.apiKey) aiApiKeyEl.value = saved.apiKey;
      if (saved.model) aiModelEl.value = saved.model;
    } catch (e) {}
  }

  function saveAiConfig() {
    var config = {
      baseUrl: aiBaseUrlEl.value.trim(),
      apiKey: aiApiKeyEl.value.trim(),
      model: aiModelEl.value.trim()
    };
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(config));
    aiSaveStatus.textContent = "✓ Tersimpan";
    setTimeout(function() { aiSaveStatus.textContent = ""; }, 2000);
  }

  function getAiConfig() {
    try {
      return JSON.parse(localStorage.getItem(AI_STORAGE_KEY) || "{}");
    } catch (e) { return {}; }
  }

  function generateUraian(posisi, textareaEl, btnEl) {
    var config = getAiConfig();
    if (!config.baseUrl || !config.apiKey || !config.model) {
      alert("Set API dulu di bagian ✨ AI Uraian → Pengaturan API");
      return;
    }

    var currentText = textareaEl.value.trim();
    var prompt = "Kamu adalah asisten mahasiswa skripsi. Generate 1 kalimat pendek uraian bimbingan skripsi untuk posisi " + posisi + ". "
      + "Kalimat harus singkat (5-12 kata), natural seperti mahasiswa menulis catatan bimbingan. "
      + "Contoh: 'Perbaikan penulisan pada indentasi sub-bab', 'Fiksasi menggunakan VGG-19', 'Perbaikan flowchart bab 3'. "
      + "Jangan pakai tanda petik. Cukup 1 kalimat saja, langsung ke inti.";

    if (currentText) {
      prompt += " Konteks sebelumnya: " + currentText + ". Buat variasi yang berbeda tapi masih relevan.";
    }

    btnEl.disabled = true;
    btnEl.textContent = "⏳";

    var baseUrl = config.baseUrl.replace(/\/+$/, "");
    var endpoint = baseUrl + "/chat/completions";

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + config.apiKey
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "Generate 1 uraian bimbingan untuk posisi " + posisi }
        ],
        max_tokens: 60,
        temperature: 0.8
      })
    })
    .then(function(res) {
      if (!res.ok) throw new Error("API error: " + res.status);
      return res.json();
    })
    .then(function(data) {
      var text = "";
      if (data.choices && data.choices[0] && data.choices[0].message) {
        text = data.choices[0].message.content.trim();
      }
      // Bersihkan tanda petik kalau AI masih naro
      text = text.replace(/^["']+|["']+$/g, "").trim();
      if (text) {
        textareaEl.value = text;
      }
    })
    .catch(function(err) {
      alert("Gagal generate: " + err.message);
    })
    .finally(function() {
      btnEl.disabled = false;
      btnEl.textContent = "✨";
    });
  }

  aiSaveBtn.addEventListener("click", saveAiConfig);
  loadAiConfig();
})();
