(function() {
  "use strict";

  // ── Initial Tab Session Splash Loader (sessionStorage) ────────────────────
  var appLoader = document.getElementById("appLoader");
  if (appLoader) {
    var hasSeenSplash = sessionStorage.getItem("eta_splash_seen");
    if (hasSeenSplash) {
      appLoader.style.display = "none";
    } else {
      setTimeout(function() {
        appLoader.classList.add("hidden-loader");
        sessionStorage.setItem("eta_splash_seen", "true");
        setTimeout(function() {
          appLoader.style.display = "none";
        }, 400);
      }, 1000);
    }
  }

  // ── Custom Toast Notification System ─────────────────────────────────────
  var toastContainer = null;

  function showToast(message, type, duration) {
    type = type || "info";
    duration = duration || 3200;

    if (!toastContainer) {
      toastContainer = document.getElementById("toastContainer");
      if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.className = "toast-container";
        document.body.appendChild(toastContainer);
      }
    }

    var toast = document.createElement("div");
    toast.className = "toast-card toast-" + type;

    var iconMap = {
      info: 'ℹ️',
      success: '✓',
      warning: '⚠️',
      danger: '✕'
    };

    toast.innerHTML = '<span class="toast-icon">' + (iconMap[type] || 'ℹ️') + '</span>'
                    + '<span class="toast-msg">' + escapeHtml(message) + '</span>';

    toastContainer.appendChild(toast);

    setTimeout(function() {
      toast.classList.add("toast-hiding");
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  // ── Web Audio API Synth & Custom MP3 Sound Engine ─────────────────────────
  var audioCtx = null;
  var SOUND_STORAGE_KEY = "eta_custom_sound_config";
  
  var customSoundConfig = {
    preset: "default",
    addUrl: "",
    dupUrl: "",
    delUrl: ""
  };

  var SOUND_PRESETS = {
    default: { addUrl: "", dupUrl: "", delUrl: "" },
    pop: {
      addUrl: "https://www.myinstants.com/media/sounds/pop-sound-effect.mp3",
      dupUrl: "https://www.myinstants.com/media/sounds/pop-cat.mp3",
      delUrl: "https://www.myinstants.com/media/sounds/disappear-sound-effect.mp3"
    },
    minecraft: {
      addUrl: "https://www.myinstants.com/media/sounds/minecraft-item-pickup.mp3",
      dupUrl: "https://www.myinstants.com/media/sounds/minecraft_click.mp3",
      delUrl: "https://www.myinstants.com/media/sounds/minecraft-anvil-drop.mp3"
    }
  };

  function getAudioContext() {
    if (!audioCtx) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSynthClick() {
    var ctx = getAudioContext();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  function playSynthAdd() {
    var ctx = getAudioContext();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(783.99, now + 0.05);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  function playSynthDup() {
    var ctx = getAudioContext();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  function playSynthDel() {
    var ctx = getAudioContext();
    if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.09);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  function playSynthSuccess() {
    var ctx = getAudioContext();
    if (!ctx) return;
    var now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach(function(freq, idx) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.1, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.15);
    });
  }

  function playAudioFile(url, fallbackFn) {
    if (url && typeof url === "string" && url.trim()) {
      try {
        var a = new Audio(url.trim());
        a.volume = 0.75;
        var playPromise = a.play();
        if (playPromise !== undefined) {
          playPromise.catch(function() {
            if (fallbackFn) fallbackFn();
          });
        }
        return;
      } catch (e) {}
    }
    if (fallbackFn) fallbackFn();
  }

  var playSound = {
    click: function() {
      playSynthClick();
    },
    add: function() {
      playAudioFile(customSoundConfig.addUrl, playSynthAdd);
    },
    duplicate: function() {
      playAudioFile(customSoundConfig.dupUrl, playSynthDup);
    },
    delete: function() {
      playAudioFile(customSoundConfig.delUrl, playSynthDel);
    },
    success: function() {
      playSynthSuccess();
    }
  };

  function loadSoundConfig() {
    try {
      var raw = localStorage.getItem(SOUND_STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed) {
          customSoundConfig.preset = parsed.preset || "default";
          customSoundConfig.addUrl = parsed.addUrl || "";
          customSoundConfig.dupUrl = parsed.dupUrl || "";
          customSoundConfig.delUrl = parsed.delUrl || "";
        }
      }
    } catch (e) {}
  }

  function saveSoundConfigToStorage() {
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(customSoundConfig));
    } catch (e) {}
  }

  loadSoundConfig();

  // ── Data Dosen ─────────────────────────────────────────────────────────────
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

  // Sorted copy untuk dropdown (alfabet)
  var dosenSorted = dosenData.slice().sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  // ── DOM refs ─────────────────────────────────────────────────────────────
  var tableBody = document.getElementById("tableBody");
  var addRowBtn = document.getElementById("addRow");
  var downloadBtn = document.getElementById("downloadCsv");
  var clearBtn = document.getElementById("clearAll");

  var pembimbing1 = document.getElementById("pembimbing1");
  var pembimbing2 = document.getElementById("pembimbing2");

  var STORAGE_KEY = "eta_csv_data";

  // ── Helpers ─────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function dosenName(id) {
    for (var i = 0; i < dosenData.length; i++) {
      if (dosenData[i].id === id) return dosenData[i].name;
    }
    return "";
  }

  // ── Searchable Combobox Component ─────────────────────────────────────────
  function setupCombobox(config) {
    var hiddenEl = document.getElementById(config.hiddenId);
    var inputEl = document.getElementById(config.inputId);
    var clearEl = document.getElementById(config.clearId);
    var dropdownEl = document.getElementById(config.dropdownId);

    function renderOptions(filter) {
      var query = (filter || "").toLowerCase().trim();
      dropdownEl.innerHTML = "";
      var matches = [];

      for (var i = 0; i < dosenSorted.length; i++) {
        var d = dosenSorted[i];
        if (!query || d.name.toLowerCase().indexOf(query) >= 0 || d.id.indexOf(query) >= 0) {
          matches.push(d);
        }
      }

      if (matches.length === 0) {
        var empty = document.createElement("div");
        empty.className = "combobox-item";
        empty.style.cursor = "default";
        empty.innerHTML = '<span class="combobox-item-name" style="color:var(--muted)">Tidak ditemukan</span>';
        dropdownEl.appendChild(empty);
        return;
      }

      var limit = Math.min(matches.length, 50);
      for (var j = 0; j < limit; j++) {
        (function(item) {
          var div = document.createElement("div");
          div.className = "combobox-item";
          div.innerHTML = '<span class="combobox-item-name">' + escapeHtml(item.name) + '</span>' +
                          '<span class="combobox-item-nip">' + item.id + '</span>';
          div.addEventListener("mousedown", function(e) {
            e.preventDefault();
            selectDosen(item.id);
          });
          dropdownEl.appendChild(div);
        })(matches[j]);
      }
    }

    function selectDosen(id) {
      var name = dosenName(id);
      hiddenEl.value = id || "";
      inputEl.value = id ? name + " (" + id + ")" : "";
      clearEl.style.display = id ? "block" : "none";
      dropdownEl.classList.add("hidden");
      refreshAllDosenSelects();
      saveState();
    }

    function openDropdown() {
      var val = inputEl.value;
      if (hiddenEl.value && val.indexOf("(") >= 0) {
        renderOptions("");
      } else {
        renderOptions(val);
      }
      dropdownEl.classList.remove("hidden");
    }

    inputEl.addEventListener("focus", openDropdown);
    inputEl.addEventListener("click", openDropdown);

    inputEl.addEventListener("input", function() {
      if (hiddenEl.value) {
        hiddenEl.value = "";
        clearEl.style.display = "none";
        refreshAllDosenSelects();
        saveState();
      }
      renderOptions(inputEl.value);
      dropdownEl.classList.remove("hidden");
    });

    clearEl.addEventListener("click", function(e) {
      e.stopPropagation();
      selectDosen("");
    });

    document.addEventListener("click", function(e) {
      if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target) && !clearEl.contains(e.target)) {
        dropdownEl.classList.add("hidden");
        if (!hiddenEl.value) {
          inputEl.value = "";
        }
      }
    });

    return {
      set: selectDosen
    };
  }

  var cbP1 = setupCombobox({
    hiddenId: "pembimbing1",
    inputId: "pembimbing1Input",
    clearId: "pembimbing1Clear",
    dropdownId: "pembimbing1Dropdown"
  });

  var cbP2 = setupCombobox({
    hiddenId: "pembimbing2",
    inputId: "pembimbing2Input",
    clearId: "pembimbing2Clear",
    dropdownId: "pembimbing2Dropdown"
  });

  function refreshAllDosenSelects() {
    var rows = tableBody.querySelectorAll("tr");
    rows.forEach(function(tr) {
      var sel = tr.querySelector(".dosen-select");
      if (sel) updateDosenOptionLabels(sel);
    });
  }

  function updateDosenOptionLabels(sel) {
    var p1 = pembimbing1.value;
    var p2 = pembimbing2.value;
    var opts = sel.querySelectorAll("option");
    opts.forEach(function(o) {
      if (o.value === "P1") {
        o.textContent = p1 ? "Pembimbing 1 — " + dosenName(p1) : "Pembimbing 1 (belum diset)";
        o.disabled = !p1;
      } else if (o.value === "P2") {
        o.textContent = p2 ? "Pembimbing 2 — " + dosenName(p2) : "Pembimbing 2 (belum diset)";
        o.disabled = !p2;
      }
    });
  }

  // ── Row creation ─────────────────────────────────────────────────────────
  function createField(type, value, placeholder) {
    var el;
    if (type === "textarea") {
      el = document.createElement("textarea");
      el.value = value || "";
      if (placeholder) el.placeholder = placeholder;
      el.className = "field field-textarea";
    } else {
      el = document.createElement("input");
      el.type = type;
      el.value = value || "";
      if (placeholder) el.placeholder = placeholder;
      el.className = "field";
    }
    return el;
  }

  function createSelect(options, value) {
    var el = document.createElement("select");
    el.className = "field";
    options.forEach(function(opt) {
      var o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      el.appendChild(o);
    });
    if (value != null) el.value = value;
    return el;
  }

  // ── SVG Icon Map ────────────────────────────────────────────────────────
  var SVG_ICONS = {
    up: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>',
    down: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    ai: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> ✨',
    dup: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    del: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>'
  };

  function makeIconBtn(svgKey, title, className) {
    var b = document.createElement("button");
    b.type = "button";
    b.innerHTML = SVG_ICONS[svgKey] || svgKey;
    b.title = title;
    b.setAttribute("aria-label", title);
    b.className = className;
    return b;
  }

  function addRow(data) {
    data = data || {};
    var tr = document.createElement("tr");

    // # nomor
    var tdNo = document.createElement("td");
    tdNo.className = "table-cell cell-no";

    // urut (up/down)
    var tdOrder = document.createElement("td");
    tdOrder.className = "table-cell cell-order";
    var btnUp = makeIconBtn("up", "Naikkan baris", "btn-order");
    var btnDown = makeIconBtn("down", "Turunkan baris", "btn-order");
    btnUp.addEventListener("click", function() {
      playSound.click();
      var prev = tr.previousElementSibling;
      if (prev) { tableBody.insertBefore(tr, prev); afterChange(); }
    });
    btnDown.addEventListener("click", function() {
      playSound.click();
      var next = tr.nextElementSibling;
      if (next) { tableBody.insertBefore(next, tr); afterChange(); }
    });
    var orderWrap = document.createElement("div");
    orderWrap.className = "order-wrap";
    orderWrap.appendChild(btnUp);
    orderWrap.appendChild(btnDown);
    tdOrder.appendChild(orderWrap);

    // tanggal
    var tdDate = document.createElement("td");
    tdDate.className = "table-cell";
    var dateField = createField("date", data.date);
    tdDate.appendChild(dateField);

    // posisi
    var tdPosisi = document.createElement("td");
    tdPosisi.className = "table-cell";
    var posisiSelect = createSelect([
      { value: "Proposal", label: "Proposal" },
      { value: "Hasil", label: "Hasil" },
      { value: "Pendadaran", label: "Pendadaran" }
    ], data.posisi || "Proposal");
    tdPosisi.appendChild(posisiSelect);

    // dosen (P1/P2)
    var tdDosen = document.createElement("td");
    tdDosen.className = "table-cell";
    var dosenSelect = createSelect([
      { value: "", label: "— pilih —" },
      { value: "P1", label: "Pembimbing 1" },
      { value: "P2", label: "Pembimbing 2" }
    ], data.dosenSlot || "");
    dosenSelect.className = "field dosen-select";
    updateDosenOptionLabels(dosenSelect);
    tdDosen.appendChild(dosenSelect);

    // uraian + AI
    var tdUraian = document.createElement("td");
    tdUraian.className = "table-cell";
    var uraianWrap = document.createElement("div");
    uraianWrap.className = "uraian-wrap";
    var uraianField = createField("textarea", data.uraian, "Isi bimbingan");
    var btnAi = makeIconBtn("ai", "Generate uraian otomatis dengan AI", "btn-ai");
    btnAi.addEventListener("click", function() {
      playSound.click();
      generateUraian(posisiSelect.value, uraianField, btnAi);
    });
    uraianWrap.appendChild(uraianField);
    uraianWrap.appendChild(btnAi);
    tdUraian.appendChild(uraianWrap);

    // aksi (duplikat, hapus)
    var tdActions = document.createElement("td");
    tdActions.className = "table-cell";
    var btnDup = makeIconBtn("dup", "Duplikat baris ini", "btn-dup");
    btnDup.addEventListener("click", function() {
      playSound.duplicate();
      var clone = {
        date: dateField.value,
        posisi: posisiSelect.value,
        dosenSlot: dosenSelect.value,
        uraian: uraianField.value
      };
      var newTr = buildRowAfter(tr, clone);
      afterChange();
    });
    var btnDel = makeIconBtn("del", "Hapus baris ini", "btn-delete");
    btnDel.addEventListener("click", function() {
      playSound.delete();
      tr.remove();
      if (!tableBody.children.length) addRow();
      afterChange();
    });
    var actionsWrap = document.createElement("div");
    actionsWrap.className = "row-actions";
    actionsWrap.appendChild(btnDup);
    actionsWrap.appendChild(btnDel);
    tdActions.appendChild(actionsWrap);

    tr.appendChild(tdNo);
    tr.appendChild(tdOrder);
    tr.appendChild(tdDate);
    tr.appendChild(tdPosisi);
    tr.appendChild(tdDosen);
    tr.appendChild(tdUraian);
    tr.appendChild(tdActions);

    // autosave on any change
    [dateField, posisiSelect, dosenSelect, uraianField].forEach(function(el) {
      el.addEventListener("change", afterChange);
      el.addEventListener("input", afterChange);
    });

    tableBody.appendChild(tr);
    renumber();
    return tr;
  }

  function buildRowAfter(refTr, data) {
    var newTr = addRow(data);
    // pindahkan tepat setelah refTr
    tableBody.insertBefore(newTr, refTr.nextElementSibling);
    renumber();
    return newTr;
  }

  function renumber() {
    var rows = tableBody.querySelectorAll("tr");
    rows.forEach(function(tr, i) {
      var cell = tr.querySelector(".cell-no");
      if (cell) cell.textContent = (i + 1);
    });
  }

  // ── Collect & CSV ─────────────────────────────────────────────────────────
  function resolveDosen(slot) {
    if (slot === "P1") return pembimbing1.value || "";
    if (slot === "P2") return pembimbing2.value || "";
    return "";
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

  function escapeCsv(value) {
    var str = String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (str.indexOf("\"") >= 0 || str.indexOf(",") >= 0 || str.indexOf("\n") >= 0) {
      return "\"" + str.replace(/\"/g, "\"\"") + "\"";
    }
    return str;
  }

  function getRowData(tr) {
    return {
      date: tr.querySelector('input[type="date"]').value,
      posisi: tr.querySelectorAll("select")[0].value,
      dosenSlot: tr.querySelector(".dosen-select").value,
      uraian: tr.querySelector("textarea").value
    };
  }

  function collectRows() {
    var rows = [];
    var trs = tableBody.querySelectorAll("tr");
    trs.forEach(function(tr) {
      var d = getRowData(tr);
      var date = normalizeDate(d.date);
      var dosen = resolveDosen(d.dosenSlot);
      var uraian = (d.uraian || "").trim();
      if (date || dosen || uraian) {
        rows.push([date, d.posisi, dosen, uraian]);
      }
    });
    return rows;
  }

  function handleDownloadCsv() {
    if (!pembimbing1.value && !pembimbing2.value) {
      showToast("Pilih dosen pembimbing dulu di bagian atas.", "warning");
      return;
    }
    var rows = collectRows();
    if (!rows.length) {
      showToast("Tidak ada data bimbingan untuk diunduh.", "warning");
      return;
    }
    var missing = rows.some(function(r) { return !r[2]; });
    if (missing) {
      if (!confirm("Ada baris yang belum pilih dosen. Tetap unduh?")) return;
    }

    var originalHtml = downloadBtn.innerHTML;
    downloadBtn.classList.add("btn-loading");
    downloadBtn.innerHTML = '<svg class="spinner" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> <span>Memproses CSV...</span>';

    setTimeout(function() {
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

      downloadBtn.innerHTML = '<span>✓ CSV Terunduh!</span>';
      setTimeout(function() {
        downloadBtn.innerHTML = originalHtml;
        downloadBtn.classList.remove("btn-loading");
      }, 1400);
    }, 500);
  }

  // ── Autosave ke localStorage ──────────────────────────────────────────────
  function afterChange() {
    renumber();
    saveState();
  }

  function saveState() {
    try {
      var state = {
        p1: pembimbing1.value,
        p2: pembimbing2.value,
        rows: []
      };
      tableBody.querySelectorAll("tr").forEach(function(tr) {
        state.rows.push(getRowData(tr));
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var state = JSON.parse(raw);
      if (state.p1) cbP1.set(state.p1);
      if (state.p2) cbP2.set(state.p2);
      tableBody.innerHTML = "";
      if (state.rows && state.rows.length) {
        state.rows.forEach(function(r) { addRow(r); });
      } else {
        addRow();
      }
      refreshAllDosenSelects();
      return true;
    } catch (e) {
      return false;
    }
  }

  // ── AI Generate Uraian ────────────────────────────────────────────────────
  var AI_API_URL = "https://api.siputzx.my.id/api/ai/deepseekr1";

  function generateUraian(posisi, textareaEl, btnEl) {
    var currentText = textareaEl.value.trim();

    var systemPrompt = "Kamu adalah asisten mahasiswa skripsi Indonesia. "
      + "Tugasmu generate 1 kalimat pendek uraian bimbingan skripsi. "
      + "Kalimat harus singkat (5-12 kata), natural seperti mahasiswa menulis catatan konsultasi. "
      + "Contoh output: Perbaikan penulisan pada indentasi sub-bab | Fiksasi menggunakan VGG-19 | Perbaikan flowchart bab 3 pada sub bab perancangan proses | Pembahasan topik judul | Perbaikan penulisan rata kiri kanan | Italic pada kata asing di perbaiki lagi. "
      + "JANGAN pakai tanda petik. JANGAN penjelasan. Cukup 1 kalimat langsung ke inti. JANGAN GUNAKAN TAG THINK DAN SEBAGAINYA.";

    var userPrompt = "Generate 1 uraian bimbingan untuk posisi " + posisi + ".";
    if (currentText) {
      userPrompt += " Buat variasi berbeda dari: " + currentText;
    }

    btnEl.disabled = true;
    btnEl.textContent = "⏳";

    var url = AI_API_URL
      + "?prompt=" + encodeURIComponent(userPrompt)
      + "&system=" + encodeURIComponent(systemPrompt)
      + "&temperature=0.8";

    fetch(url)
      .then(function(res) {
        if (!res.ok) throw new Error("API error: " + res.status);
        return res.json();
      })
      .then(function(data) {
        var text = "";
        if (data && data.data && data.data.response) {
          text = data.data.response;
        } else if (data && data.data && typeof data.data === "string") {
          text = data.data;
        } else if (data && data.result) {
          text = typeof data.result === "string" ? data.result : (data.result.content || data.result.text || "");
        } else if (data && data.message) {
          text = data.message;
        }

        text = String(text || "").trim();
        text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        text = text.replace(/^["'`]+|["'`]+$/g, "").trim();
        text = text.replace(/^\d+\.\s*/, "").replace(/^[-•]\s*/, "").trim();
        text = text.split("\n")[0].trim();

        if (text) {
          textareaEl.value = text;
          afterChange();
          showToast("Uraian bimbingan berhasil di-generate!", "success");
        } else {
          showToast("AI tidak mengembalikan hasil. Coba lagi.", "danger");
        }
      })
      .catch(function(err) {
        showToast("Gagal generate: " + err.message, "danger");
      })
      .finally(function() {
        btnEl.disabled = false;
        btnEl.textContent = "✨";
      });
  }

  // ── Daftar Dosen (referensi) ──────────────────────────────────────────────
  var dosenListEl = document.getElementById("dosenList");
  var dosenSearchEl = document.getElementById("dosenSearch");

  function renderDosenList(filter) {
    var query = (filter || "").toLowerCase();
    var html = "";
    var count = 0;
    for (var i = 0; i < dosenSorted.length; i++) {
      var d = dosenSorted[i];
      if (query && d.name.toLowerCase().indexOf(query) < 0 && d.id.indexOf(query) < 0) continue;
      html += '<div class="dosen-item">' +
                '<span class="dosen-name">' + escapeHtml(d.name) + '</span>' +
                '<div class="dosen-actions">' +
                  '<code class="dosen-nip" title="Klik untuk copy">' + d.id + '</code>' +
                  '<button type="button" class="btn-mini btn-set-p1" data-id="' + d.id + '">+ P1</button>' +
                  '<button type="button" class="btn-mini btn-set-p2" data-id="' + d.id + '">+ P2</button>' +
                '</div>' +
              '</div>';
      count++;
    }
    if (!count) html = '<p class="hint">Tidak ditemukan.</p>';
    dosenListEl.innerHTML = html;
  }

  dosenListEl.addEventListener("click", function(e) {
    var target = e.target;
    if (target.classList.contains("btn-set-p1")) {
      cbP1.set(target.getAttribute("data-id"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (target.classList.contains("btn-set-p2")) {
      cbP2.set(target.getAttribute("data-id"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // ── Event wiring ──────────────────────────────────────────────────────────
  addRowBtn.addEventListener("click", function() {
    playSound.add();
    addRow();
    afterChange();
  });

  downloadBtn.addEventListener("click", function() {
    playSound.click();
    handleDownloadCsv();
  });

  clearBtn.addEventListener("click", function() {
    playSound.click();
    if (!confirm("Reset semua baris? Data pembimbing tetap tersimpan.")) return;
    tableBody.innerHTML = "";
    addRow();
    afterChange();
  });

  var downloadExtBtn = document.getElementById("downloadExtBtn");
  if (downloadExtBtn) {
    downloadExtBtn.addEventListener("click", function() {
      playSound.click();
      var originalHtml = downloadExtBtn.innerHTML;
      downloadExtBtn.classList.add("btn-loading");
      downloadExtBtn.innerHTML = '<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> <span>Menyiapkan Extension...</span>';
      
      setTimeout(function() {
        var a = document.createElement("a");
        a.href = "extension.zip";
        a.download = "extension.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();

        playSound.success();
        downloadExtBtn.innerHTML = '<span>✓ File Diunduh!</span>';
        setTimeout(function() {
          downloadExtBtn.innerHTML = originalHtml;
          downloadExtBtn.classList.remove("btn-loading");
        }, 1500);
      }, 700);
    });
  }

  dosenListEl.addEventListener("click", function(e) {
    var target = e.target;
    if (target.classList.contains("btn-set-p1") || target.classList.contains("btn-set-p2")) {
      playSound.click();
    }
  });

  dosenSearchEl.addEventListener("input", function() {
    renderDosenList(dosenSearchEl.value);
  });

  // ── Floating Gear Sound Button & Modal Dialog Wiring ───────────────────────
  var floatingSoundBtn = document.getElementById("floatingSoundBtn");
  var soundModalOverlay = document.getElementById("soundModalOverlay");
  var closeSoundModal = document.getElementById("closeSoundModal");
  var soundPresetSelect = document.getElementById("soundPresetSelect");
  var soundAddUrlInput = document.getElementById("soundAddUrl");
  var soundDupUrlInput = document.getElementById("soundDupUrl");
  var soundDelUrlInput = document.getElementById("soundDelUrl");
  var saveSoundBtn = document.getElementById("saveSoundBtn");
  var testSoundBtn = document.getElementById("testSoundBtn");
  var resetSoundBtn = document.getElementById("resetSoundBtn");

  function syncSoundPanelInputs() {
    if (soundPresetSelect) soundPresetSelect.value = customSoundConfig.preset || "default";
    if (soundAddUrlInput) soundAddUrlInput.value = customSoundConfig.addUrl || "";
    if (soundDupUrlInput) soundDupUrlInput.value = customSoundConfig.dupUrl || "";
    if (soundDelUrlInput) soundDelUrlInput.value = customSoundConfig.delUrl || "";
  }

  function openSoundModal() {
    playSound.click();
    syncSoundPanelInputs();
    if (soundModalOverlay) soundModalOverlay.classList.remove("hidden");
  }

  function closeSoundModalFn() {
    playSound.click();
    if (soundModalOverlay) soundModalOverlay.classList.add("hidden");
  }

  if (floatingSoundBtn) {
    floatingSoundBtn.addEventListener("click", openSoundModal);
  }

  if (closeSoundModal) {
    closeSoundModal.addEventListener("click", closeSoundModalFn);
  }

  if (soundModalOverlay) {
    soundModalOverlay.addEventListener("click", function(e) {
      if (e.target === soundModalOverlay) {
        closeSoundModalFn();
      }
    });
  }

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && soundModalOverlay && !soundModalOverlay.classList.contains("hidden")) {
      closeSoundModalFn();
    }
  });

  if (soundPresetSelect) {
    soundPresetSelect.addEventListener("change", function() {
      playSound.click();
      var selected = soundPresetSelect.value;
      if (SOUND_PRESETS[selected]) {
        customSoundConfig.preset = selected;
        customSoundConfig.addUrl = SOUND_PRESETS[selected].addUrl;
        customSoundConfig.dupUrl = SOUND_PRESETS[selected].dupUrl;
        customSoundConfig.delUrl = SOUND_PRESETS[selected].delUrl;
        syncSoundPanelInputs();
      }
    });
  }

  // ── Theme Manager (Dark Mode / Light Mode / System) ─────────────────────────
  var THEME_STORAGE_KEY = "eta_theme_preference";
  var themeRadios = document.querySelectorAll('input[name="themeMode"]');
  var systemMedia = window.matchMedia("(prefers-color-scheme: dark)");

  function getSavedThemePreference() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    } catch(e) {
      return "dark";
    }
  }

  function applyThemePreference(pref) {
    var effective = pref;
    if (pref === "system") {
      effective = systemMedia.matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", effective);

    if (themeRadios) {
      themeRadios.forEach(function(radio) {
        radio.checked = (radio.value === pref);
      });
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch(e) {}
  }

  var currentThemePref = getSavedThemePreference();
  applyThemePreference(currentThemePref);

  if (themeRadios) {
    themeRadios.forEach(function(radio) {
      radio.addEventListener("change", function() {
        if (this.checked) {
          applyThemePreference(this.value);
          playSound.click();
          var labelText = this.value === "dark" ? "Dark Mode" : this.value === "light" ? "Light Mode" : "Ikuti Sistem";
          showToast("Mode Tampilan diubah ke: " + labelText, "info");
        }
      });
    });
  }

  if (systemMedia && systemMedia.addEventListener) {
    systemMedia.addEventListener("change", function() {
      var saved = getSavedThemePreference();
      if (saved === "system") {
        applyThemePreference("system");
      }
    });
  }

  if (saveSoundBtn) {
    saveSoundBtn.addEventListener("click", function() {
      customSoundConfig.preset = soundPresetSelect ? soundPresetSelect.value : "custom";
      customSoundConfig.addUrl = soundAddUrlInput ? soundAddUrlInput.value.trim() : "";
      customSoundConfig.dupUrl = soundDupUrlInput ? soundDupUrlInput.value.trim() : "";
      customSoundConfig.delUrl = soundDelUrlInput ? soundDelUrlInput.value.trim() : "";
      saveSoundConfigToStorage();

      var checkedRadio = document.querySelector('input[name="themeMode"]:checked');
      if (checkedRadio) {
        applyThemePreference(checkedRadio.value);
      }

      playSound.add();
      showToast("Pengaturan aplikasi berhasil disimpan!", "success");
      if (soundModalOverlay) soundModalOverlay.classList.add("hidden");
    });
  }

  if (testSoundBtn) {
    testSoundBtn.addEventListener("click", function() {
      playSound.add();
      setTimeout(function() { playSound.duplicate(); }, 350);
      setTimeout(function() { playSound.delete(); }, 700);
    });
  }

  if (resetSoundBtn) {
    resetSoundBtn.addEventListener("click", function() {
      playSound.click();
      customSoundConfig = { preset: "default", addUrl: "", dupUrl: "", delUrl: "" };
      saveSoundConfigToStorage();
      syncSoundPanelInputs();

      applyThemePreference("dark");

      showToast("Pengaturan di-reset ke Default (Dark Mode & Default Sound).", "info");
    });
  }

  syncSoundPanelInputs();

  // ── Interactive Custom Tour Guide Engine ──────────────────────────────────
  var tourOverlay = document.getElementById("tourOverlay");
  var tourSpotlight = document.getElementById("tourSpotlight");
  var tourCard = document.getElementById("tourCard");
  var tourStepCounter = document.getElementById("tourStepCounter");
  var tourProgressBar = document.getElementById("tourProgressBar");
  var tourIconWrap = document.getElementById("tourIconWrap");
  var tourTitle = document.getElementById("tourTitle");
  var tourDescription = document.getElementById("tourDescription");
  var tourTipBox = document.getElementById("tourTipBox");
  var tourTipText = document.getElementById("tourTipText");
  var tourPrevBtn = document.getElementById("tourPrevBtn");
  var tourNextBtn = document.getElementById("tourNextBtn");
  var tourCloseBtn = document.getElementById("tourCloseBtn");
  var tourSkipBtn = document.getElementById("tourSkipBtn");
  var startTourBtn = document.getElementById("startTourBtn");

  var currentTourStepIndex = 0;
  var isTourActive = false;

  var tourSteps = [
    {
      targetId: "downloadExtBtn",
      title: "🧩 Step 1: Siapkan Extension / Script",
      icon: "🧩",
      desc: "Untuk mengotomatisasi pengisian bimbingan di E-TA FT UNMUL, download Extension Chrome (.zip) atau pasang script Tampermonkey terlebih dahulu.",
      tip: "Instalasi ini cukup dilakukan 1 kali saja di browser kamu.",
      prefPosition: "bottom"
    },
    {
      targetId: "panelPembimbing",
      title: "👨‍🏫 Step 2: Atur Dosen Pembimbing",
      icon: "🔍",
      desc: "Ketik nama atau NIP Dosen Pembimbing 1 & Pembimbing 2. Setelah diset, kamu tinggal memilih P1 atau P2 di setiap baris bimbingan secara instan.",
      tip: "Ketik beberapa huruf nama dosen untuk rekomendasi otomatis.",
      prefPosition: "bottom"
    },
    {
      targetId: "panelTable",
      title: "📝 Step 3: Isi Data Bimbingan",
      icon: "✍️",
      desc: "Masukkan Tanggal, Posisi (Proposal/Hasil/Skripsi), Dosen, dan Uraian. Gunakan tombol 'Tambah Baris' atau ikon duplikat 📋 di kolom aksi.",
      tip: "Gunakan tombol duplikat 📋 untuk mempercepat pembuatan baris baru!",
      prefPosition: "top"
    },
    {
      targetId: "aiPanel",
      title: "✨ Step 4: Generate Uraian dengan AI",
      icon: "✨",
      desc: "Bingung mau tulis uraian apa? Klik tombol ✨ di kolom uraian tabel untuk membuat kalimat deskripsi bimbingan akademis otomatis!",
      tip: "Fitur AI ini 100% gratis, praktis, dan tidak memerlukan API key.",
      prefPosition: "top"
    },
    {
      targetId: "downloadCsv",
      title: "📥 Step 5: Unduh CSV & Import ke Extension",
      icon: "🚀",
      desc: "Jika data bimbingan sudah lengkap, klik 'Unduh CSV'. Buka halaman E-TA UNMUL di browser, buka Extension Chrome, import file CSV, lalu klik 'Mulai'!",
      tip: "Extension akan otomatis mengisi & mengirim form bimbingan satu per satu.",
      prefPosition: "bottom"
    },
    {
      targetId: "floatingSoundBtn",
      title: "⚙️ Step 6: Mode Tampilan & Sound Effects",
      icon: "⚙️",
      desc: "Klik tombol gear di pojok kanan bawah ini untuk mengganti Mode Tampilan (Dark Mode, Light Mode, atau Ikuti Sistem) serta Custom Sound Effects!",
      tip: "Kamu bisa mengulang panduan ini kapan saja via tombol '🚀 Panduan Interaktif' di atas.",
      prefPosition: "top"
    }
  ];

  function positionTourCard(targetRect, prefPos) {
    if (!tourCard) return;
    var cardRect = tourCard.getBoundingClientRect();
    var cardWidth = cardRect.width || 420;
    var cardHeight = cardRect.height || 240;

    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var top = 0;
    var left = 0;
    var gap = 18;

    if (prefPos === "bottom" && targetRect.bottom + cardHeight + gap < vh) {
      top = targetRect.bottom + gap;
    } else if (prefPos === "top" && targetRect.top - cardHeight - gap > 0) {
      top = targetRect.top - cardHeight - gap;
    } else if (targetRect.bottom + cardHeight + gap < vh) {
      top = targetRect.bottom + gap;
    } else if (targetRect.top - cardHeight - gap > 0) {
      top = targetRect.top - cardHeight - gap;
    } else {
      top = Math.max(16, (vh - cardHeight) / 2);
    }

    var targetCenterX = targetRect.left + targetRect.width / 2;
    left = targetCenterX - cardWidth / 2;

    if (left < 16) left = 16;
    if (left + cardWidth > vw - 16) left = vw - cardWidth - 16;

    tourCard.style.top = Math.round(top) + "px";
    tourCard.style.left = Math.round(left) + "px";
  }

  function updateTourSpotlight() {
    if (!isTourActive) return;
    var step = tourSteps[currentTourStepIndex];
    if (!step) return;

    var targetEl = document.getElementById(step.targetId);
    if (!targetEl) return;

    var rect = targetEl.getBoundingClientRect();
    var pad = 8;

    tourSpotlight.style.top = Math.round(rect.top - pad) + "px";
    tourSpotlight.style.left = Math.round(rect.left - pad) + "px";
    tourSpotlight.style.width = Math.round(rect.width + pad * 2) + "px";
    tourSpotlight.style.height = Math.round(rect.height + pad * 2) + "px";

    positionTourCard(rect, step.prefPosition);
  }

  function renderTourStep(index) {
    if (index < 0 || index >= tourSteps.length) return;
    currentTourStepIndex = index;
    var step = tourSteps[index];

    var targetEl = document.getElementById(step.targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    tourStepCounter.textContent = "Langkah " + (index + 1) + " dari " + tourSteps.length;
    var progressPercent = ((index + 1) / tourSteps.length) * 100;
    tourProgressBar.style.width = progressPercent + "%";

    tourIconWrap.textContent = step.icon || "💡";
    tourTitle.textContent = step.title;
    tourDescription.textContent = step.desc;

    if (step.tip) {
      tourTipBox.style.display = "flex";
      tourTipText.textContent = step.tip;
    } else {
      tourTipBox.style.display = "none";
    }

    tourPrevBtn.disabled = (index === 0);

    if (index === tourSteps.length - 1) {
      tourNextBtn.textContent = "Selesai 🎉";
      tourNextBtn.classList.remove("btn-primary");
      tourNextBtn.classList.add("btn-tour");
    } else {
      tourNextBtn.textContent = "Lanjut →";
      tourNextBtn.classList.add("btn-primary");
      tourNextBtn.classList.remove("btn-tour");
    }

    setTimeout(function() {
      updateTourSpotlight();
    }, 150);

    playSound.click();
  }

  function startTour() {
    isTourActive = true;
    currentTourStepIndex = 0;
    if (tourOverlay) tourOverlay.classList.remove("hidden");
    renderTourStep(0);
  }

  function endTour(isFinished) {
    isTourActive = false;
    if (tourOverlay) tourOverlay.classList.add("hidden");
    try {
      localStorage.setItem("eta_tour_seen", "true");
    } catch(err) {}

    if (isFinished) {
      showToast("Selamat! Kamu sudah paham cara pakai E-TA Tools 🎉", "success");
      playSound.add();
    }
  }

  if (startTourBtn) {
    startTourBtn.addEventListener("click", function() {
      startTour();
    });
  }

  if (tourNextBtn) {
    tourNextBtn.addEventListener("click", function() {
      if (currentTourStepIndex < tourSteps.length - 1) {
        renderTourStep(currentTourStepIndex + 1);
      } else {
        endTour(true);
      }
    });
  }

  if (tourPrevBtn) {
    tourPrevBtn.addEventListener("click", function() {
      if (currentTourStepIndex > 0) {
        renderTourStep(currentTourStepIndex - 1);
      }
    });
  }

  if (tourCloseBtn) {
    tourCloseBtn.addEventListener("click", function() {
      endTour(false);
    });
  }

  if (tourSkipBtn) {
    tourSkipBtn.addEventListener("click", function() {
      endTour(false);
    });
  }

  window.addEventListener("resize", function() {
    if (isTourActive) updateTourSpotlight();
  });

  window.addEventListener("scroll", function() {
    if (isTourActive) updateTourSpotlight();
  }, { passive: true });

  document.addEventListener("keydown", function(e) {
    if (!isTourActive) return;

    if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      if (currentTourStepIndex < tourSteps.length - 1) {
        renderTourStep(currentTourStepIndex + 1);
      } else {
        endTour(true);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (currentTourStepIndex > 0) {
        renderTourStep(currentTourStepIndex - 1);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      endTour(false);
    }
  });

  // Auto start for first time visitors
  try {
    var hasSeenTour = localStorage.getItem("eta_tour_seen");
    if (!hasSeenTour) {
      setTimeout(function() {
        startTour();
      }, 1600);
    }
  } catch(e) {}

  // ── Init ──────────────────────────────────────────────────────────────────
  renderDosenList("");

  if (!loadState()) {
    addRow();
  }
})();
