/* global chrome */
(function() {
  "use strict";

  var FILL_STORAGE_KEY = "bulk_bimbingan_fill_queue";
  var AUTOSUBMIT_KEY = "bulk_bimbingan_autosubmit";
  var TOTAL_KEY = "bulk_bimbingan_total";
  var DONE_KEY = "bulk_bimbingan_done";
  var STOPPED_KEY = "bulk_bimbingan_stopped";
  var PAGE_CHANNEL = "bulk-bimbingan";
  var pageBridgeReady = false;
  var pageCallbacks = {};

  // ── Inject page.js ke page context (buat akses CKEDITOR) ──────────────────
  function injectPageBridge() {
    if (pageBridgeReady) return;
    pageBridgeReady = true;
    try {
      var script = document.createElement("script");
      script.src = chrome.runtime.getURL("page.js");
      script.dataset.bulkBridge = "true";
      (document.head || document.documentElement).appendChild(script);
      // jangan remove — biar sempat execute
    } catch (e) {}
  }

  // Listen response dari page.js
  window.addEventListener("message", function(ev) {
    if (!ev || !ev.data || ev.data.source !== PAGE_CHANNEL) return;
    if (ev.data.type === "bulk-ckeditor-done" && ev.data.id && pageCallbacks[ev.data.id]) {
      pageCallbacks[ev.data.id](Boolean(ev.data.ok));
      delete pageCallbacks[ev.data.id];
    }
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  function findTargetForm() {
    var forms = document.querySelectorAll("form");
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      if (form.querySelector('input[name="date_bimbingan"]') &&
          form.querySelector('select[name="bagian_bimbingan"]') &&
          form.querySelector('select[name="user_id_pembimbing"]') &&
          form.querySelector('textarea[name="isi_bimbingan"]')) {
        return form;
      }
    }
    return document.querySelector("form");
  }

  // ── Select2 setter via page bridge ──────────────────────────────────────────
  function setSelect2Value(selectName, value) {
    injectPageBridge();
    setTimeout(function() {
      window.postMessage({
        source: PAGE_CHANNEL,
        type: "bulk-select2-set",
        selectName: selectName,
        value: String(value || "")
      }, "*");
    }, 300);
  }

  // ── Datepicker setter via page bridge ─────────────────────────────────────
  function setDatepickerValue(inputName, value) {
    injectPageBridge();
    setTimeout(function() {
      window.postMessage({
        source: PAGE_CHANNEL,
        type: "bulk-datepicker-set",
        inputName: inputName,
        value: String(value || "")
      }, "*");
    }, 300);
  }

  // ── CKEditor setter via page bridge ────────────────────────────────────────
  function setCkeditorData(value, done) {
    var callId = "bulk-cke-" + Date.now() + "-" + Math.random().toString(36).slice(2);
    injectPageBridge();
    pageCallbacks[callId] = done;
    // Beri jeda agar page.js sempat load dulu
    setTimeout(function() {
      window.postMessage({
        source: PAGE_CHANNEL,
        type: "bulk-ckeditor-set",
        id: callId,
        value: String(value || "")
      }, "*");
    }, 300);
    // Timeout fallback
    setTimeout(function() {
      if (pageCallbacks[callId]) {
        pageCallbacks[callId](false);
        delete pageCallbacks[callId];
      }
    }, 3000);
  }

  // Retry beberapa kali kalau gagal (editor belum ready)
  function setCkeditorDataRetry(value, retries, done) {
    var attempt = 0;
    function tryOnce() {
      attempt++;
      setCkeditorData(value, function(ok) {
        if (ok) {
          done(true);
        } else if (attempt < retries) {
          setTimeout(tryOnce, 800);
        } else {
          done(false);
        }
      });
    }
    tryOnce();
  }

  // ── Fill-Only Mode ─────────────────────────────────────────────────────────
  function startFillOnly() {
    var mainForm = findTargetForm();
    if (!mainForm) return;

    var fDate = mainForm.querySelector('input[name="date_bimbingan"]');
    var fPosisi = mainForm.querySelector('select[name="bagian_bimbingan"]');
    var fDosen = mainForm.querySelector('select[name="user_id_pembimbing"]');
    var fUraian = mainForm.querySelector('textarea[name="isi_bimbingan"]');
    if (!fDate || !fPosisi || !fDosen || !fUraian) return;

    function normalizeText(val) {
      return String(val || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    }

    // Konversi tanggal ke format YYYY-MM-DD yang server butuhkan
    function normalizeDate(val) {
      if (!val) return "";
      var str = String(val).trim();
      // Coba parse berbagai format
      var parts;

      // Format: DD-MM-YYYY atau DD/MM/YYYY
      parts = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (parts) {
        var dd = parts[1].padStart(2, "0");
        var mm = parts[2].padStart(2, "0");
        return parts[3] + "-" + mm + "-" + dd;
      }

      // Format: YYYY-MM-DD atau YYYY/MM/DD (sudah benar)
      parts = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
      if (parts) {
        return parts[1] + "-" + parts[2].padStart(2, "0") + "-" + parts[3].padStart(2, "0");
      }

      // Format: MM-DD-YYYY (jarang, tapi handle)
      // Kalau tidak cocok pattern manapun, return as-is
      return str;
    }

    function resolveDosenVal(val) {
      if (!val) return "";
      var str = String(val).trim();
      if (fDosen.querySelector('option[value="' + str.replace(/"/g, '\\"') + '"]')) return str;
      var target = normalizeText(str);
      var opts = fDosen.querySelectorAll("option");
      for (var i = 0; i < opts.length; i++) {
        var label = normalizeText(opts[i].textContent);
        if (label === target || (label && target && label.indexOf(target) >= 0)) return opts[i].value;
      }
      return str;
    }

    function fillForm(data) {
      // Block form submit selama proses fill
      var submitBlocked = true;
      var origSubmit = HTMLFormElement.prototype.submit;
      HTMLFormElement.prototype.submit = function() {
        if (submitBlocked) return;
        return origSubmit.apply(this, arguments);
      };
      // Block juga event submit
      function blockSubmit(e) { e.preventDefault(); e.stopImmediatePropagation(); }
      mainForm.addEventListener("submit", blockSubmit, true);

      // Tanggal — konversi ke YYYY-MM-DD
      var dateVal = normalizeDate(data.date);
      if (fDate.hasAttribute("readonly")) fDate.removeAttribute("readonly");
      fDate.value = dateVal;
      // Trigger datepicker via page context
      setDatepickerValue("date_bimbingan", dateVal);

      // Posisi/Bagian
      fPosisi.value = data.posisi;

      // Dosen — select2 (harus lewat page context karena jQuery isolated)
      var dosenVal = resolveDosenVal(data.dosen);
      fDosen.value = dosenVal;
      // Trigger via page context supaya Select2 update
      setSelect2Value("user_id_pembimbing", dosenVal);

      // Uraian → CKEditor (retry 5x)
      setCkeditorDataRetry(data.uraian, 5, function(ok) {
        if (!ok) {
          fUraian.value = data.uraian;
        }
        // Selesai fill — unblock submit setelah delay
        setTimeout(function() {
          submitBlocked = false;
          HTMLFormElement.prototype.submit = origSubmit;
          mainForm.removeEventListener("submit", blockSubmit, true);

          // Auto submit jika diaktifkan
          var shouldAutoSubmit = false;
          try {
            shouldAutoSubmit = sessionStorage.getItem(AUTOSUBMIT_KEY) === "true";
          } catch (e) {}

          // Increment done counter
          var doneCount = parseInt(sessionStorage.getItem(DONE_KEY) || "0", 10);
          sessionStorage.setItem(DONE_KEY, String(doneCount + 1));

          if (shouldAutoSubmit && sessionStorage.getItem(STOPPED_KEY) !== "true") {
            setTimeout(function() {
              var submitBtn = mainForm.querySelector('button[type="submit"], input[type="submit"]');
              if (submitBtn) {
                submitBtn.click();
              } else {
                mainForm.submit();
              }
            }, 800);
          }
        }, 500);
      });
    }

    function loadNextFill() {
      // Cek apakah dihentikan
      if (sessionStorage.getItem(STOPPED_KEY) === "true") return;

      var queue = [];
      try {
        var stored = sessionStorage.getItem(FILL_STORAGE_KEY);
        if (stored) queue = JSON.parse(stored);
      } catch (e) {}
      if (!queue.length) return;
      var current = queue.shift();
      sessionStorage.setItem(FILL_STORAGE_KEY, JSON.stringify(queue));
      fillForm(current);
    }

    loadNextFill();
  }

  // ── Message handler dari popup ─────────────────────────────────────────────
  chrome.runtime.onMessage.addListener(function(msg, _sender, sendResponse) {
    if (!msg) return;

    // Progress query
    if (msg.type === "bulk-progress") {
      var queue = [];
      try {
        var stored = sessionStorage.getItem(FILL_STORAGE_KEY);
        if (stored) queue = JSON.parse(stored);
      } catch (e) {}
      var total = parseInt(sessionStorage.getItem(TOTAL_KEY) || "0", 10);
      var done = parseInt(sessionStorage.getItem(DONE_KEY) || "0", 10);
      sendResponse({
        total: total,
        done: done,
        remaining: queue.length
      });
      return true;
    }

    // Stop command
    if (msg.type === "bulk-stop") {
      sessionStorage.setItem(FILL_STORAGE_KEY, "[]");
      sessionStorage.setItem(STOPPED_KEY, "true");
      sendResponse({ ok: true });
      return true;
    }

    // Bulk fill
    if (msg.type !== "bulk-fill" || !Array.isArray(msg.items)) return;
    sessionStorage.setItem(FILL_STORAGE_KEY, JSON.stringify(msg.items));
    sessionStorage.setItem(AUTOSUBMIT_KEY, msg.autoSubmit ? "true" : "false");
    sessionStorage.setItem(TOTAL_KEY, String(msg.total || msg.items.length));
    sessionStorage.setItem(DONE_KEY, "0");
    sessionStorage.removeItem(STOPPED_KEY);
    // Langsung isi form di halaman aktif
    setTimeout(startFillOnly, 300);
    sendResponse({ ok: true });
    return true;
  });

  // ── Auto-fill saat halaman reload (lanjut antrian) ─────────────────────────
  window.addEventListener("load", function() {
    setTimeout(function() {
      try {
        if (sessionStorage.getItem(STOPPED_KEY) === "true") return;
        var stored = sessionStorage.getItem(FILL_STORAGE_KEY);
        if (stored && JSON.parse(stored).length > 0) {
          startFillOnly();
        }
      } catch (e) {}
    }, 1200);
  });
})();
