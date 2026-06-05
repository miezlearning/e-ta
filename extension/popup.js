/* global chrome */
(function() {
  "use strict";

  // ── DOM refs ───────────────────────────────────────────────────────────────
  var fileInput = document.getElementById("csvFile");
  var btnFill = document.getElementById("btnFill");
  var btnStop = document.getElementById("btnStop");
  var btnClear = document.getElementById("btnClear");
  var autoSubmitEl = document.getElementById("autoSubmit");
  var statusEl = document.getElementById("status");

  var progressSection = document.getElementById("progressSection");
  var progressCount = document.getElementById("progressCount");
  var progressBar = document.getElementById("progressBar");
  var progressBarWrap = document.getElementById("progressBarWrap");
  var progressStatus = document.getElementById("progressStatus");

  var logSection = document.getElementById("logSection");
  var logList = document.getElementById("logList");
  var logBadge = document.getElementById("logBadge");

  var parsedItems = [];
  var totalItems = 0;
  var pollInterval = null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setStatus(text) {
    statusEl.textContent = text;
  }

  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function updateProgress(done, total, statusText) {
    show(progressSection);
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    progressCount.textContent = done + " / " + total;
    progressBar.style.width = pct + "%";
    progressBarWrap.setAttribute("aria-valuenow", pct);
    progressBarWrap.setAttribute("aria-valuemax", "100");
    if (statusText) progressStatus.textContent = statusText;
  }

  function addLogEntry(index, text, state) {
    show(logSection);
    // state: done, active, pending, error
    var existing = document.getElementById("log-" + index);
    if (existing) {
      existing.querySelector(".log-icon").className = "log-icon log-icon--" + state;
      existing.querySelector(".log-icon").textContent = iconFor(state);
      var logText = existing.querySelector(".log-text");
      logText.textContent = text;
      logText.className = "log-text" + (state === "pending" ? " log-text--muted" : "");
      return;
    }
    var li = document.createElement("li");
    li.className = "log-item";
    li.id = "log-" + index;
    li.setAttribute("aria-label", "Baris " + (index + 1) + ": " + text);
    li.innerHTML =
      '<span class="log-icon log-icon--' + state + '" aria-hidden="true">' + iconFor(state) + '</span>' +
      '<span class="log-text' + (state === "pending" ? " log-text--muted" : "") + '">' + escapeHtml(text) + '</span>';
    logList.appendChild(li);
    logBadge.textContent = logList.children.length;
    // Auto scroll to bottom
    li.scrollIntoView({ block: "nearest" });
  }

  function iconFor(state) {
    if (state === "done") return "\u2713";
    if (state === "active") return "\u25B6";
    if (state === "error") return "\u2717";
    return "\u2022";
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function itemLabel(item, idx) {
    var date = item.date || "-";
    var posisi = item.posisi || "-";
    return (idx + 1) + ". " + date + " \u2014 " + posisi;
  }

  // ── CSV Parser ─────────────────────────────────────────────────────────────
  function normalizeHeader(h) {
    return String(h || "").trim().toLowerCase().replace(/\s+/g, "_");
  }

  function parseCsv(text) {
    var rows = [];
    var i = 0;
    var field = "";
    var row = [];
    var inQuotes = false;

    while (i < text.length) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          row.push(field);
          field = "";
        } else if (ch === "\n") {
          row.push(field);
          rows.push(row);
          row = [];
          field = "";
        } else if (ch === "\r") {
          // skip
        } else {
          field += ch;
        }
      }
      i += 1;
    }

    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }

    return rows.filter(function(r) {
      return r.some(function(c) { return String(c || "").trim() !== ""; });
    });
  }

  function mapRows(rows) {
    if (!rows.length) return [];

    var header = rows[0].map(normalizeHeader);
    var hasHeader = header.some(function(h) {
      return ["date", "tanggal", "posisi", "dosen", "uraian"].indexOf(h) >= 0;
    });

    var startIdx = hasHeader ? 1 : 0;
    var items = [];

    for (var i = startIdx; i < rows.length; i++) {
      var r = rows[i];
      var item = { date: "", posisi: "", dosen: "", uraian: "" };

      if (hasHeader) {
        for (var c = 0; c < header.length; c++) {
          var key = header[c];
          var val = r[c] != null ? String(r[c]).trim() : "";
          if (key === "date" || key === "tanggal") item.date = val;
          if (key === "posisi") item.posisi = val;
          if (key === "dosen") item.dosen = val;
          if (key === "uraian") item.uraian = val;
        }
      } else {
        item.date = r[0] != null ? String(r[0]).trim() : "";
        item.posisi = r[1] != null ? String(r[1]).trim() : "";
        item.dosen = r[2] != null ? String(r[2]).trim() : "";
        item.uraian = r[3] != null ? String(r[3]).trim() : "";
      }

      if (item.date || item.posisi || item.dosen || item.uraian) {
        items.push(item);
      }
    }

    return items;
  }

  function readFile(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() { resolve(reader.result); };
      reader.onerror = function() { reject(reader.error); };
      reader.readAsText(file);
    });
  }

  // ── Progress Polling ───────────────────────────────────────────────────────
  function startPolling(tab) {
    stopPolling();
    pollInterval = setInterval(function() {
      if (!tab || !tab.id) return;
      chrome.tabs.sendMessage(tab.id, { type: "bulk-progress" }, function(resp) {
        if (chrome.runtime.lastError || !resp) return;
        var done = resp.done || 0;
        var total = resp.total || totalItems;
        var remaining = resp.remaining || 0;
        var current = resp.current;

        updateProgress(done, total,
          remaining > 0 ? "Mengisi baris " + (done + 1) + "..." : "Selesai!"
        );

        // Update log entries
        for (var i = 0; i < total; i++) {
          if (i < done) {
            addLogEntry(i, itemLabel(parsedItems[i], i), "done");
          } else if (i === done && remaining > 0) {
            addLogEntry(i, itemLabel(parsedItems[i], i) + " (mengisi...)", "active");
          } else {
            addLogEntry(i, itemLabel(parsedItems[i], i), "pending");
          }
        }

        if (remaining === 0 && done >= total) {
          updateProgress(total, total, "Semua baris berhasil dikirim!");
          setStatus("Selesai! " + total + " baris telah diproses.");
          stopPolling();
          btnStop.disabled = true;
          btnFill.disabled = false;
        }
      });
    }, 1500);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  function resetAll() {
    parsedItems = [];
    totalItems = 0;
    btnFill.disabled = true;
    btnStop.disabled = true;
    btnClear.disabled = true;
    fileInput.value = "";
    setStatus("Belum ada file.");
    hide(progressSection);
    hide(logSection);
    logList.innerHTML = "";
    logBadge.textContent = "0";
    progressBar.style.width = "0%";
    stopPolling();
  }

  fileInput.addEventListener("change", function() {
    var file = fileInput.files && fileInput.files[0];
    if (!file) { resetAll(); return; }

    readFile(file)
      .then(function(text) {
        var rows = parseCsv(String(text || ""));
        parsedItems = mapRows(rows);
        if (!parsedItems.length) {
          setStatus("CSV tidak terbaca atau kosong.");
          btnFill.disabled = true;
          btnClear.disabled = false;
          return;
        }
        totalItems = parsedItems.length;
        setStatus("Terbaca " + parsedItems.length + " baris. Siap diproses.");
        btnFill.disabled = false;
        btnClear.disabled = false;
        btnStop.disabled = true;

        // Show preview in log
        hide(progressSection);
        show(logSection);
        logList.innerHTML = "";
        for (var i = 0; i < parsedItems.length; i++) {
          addLogEntry(i, itemLabel(parsedItems[i], i), "pending");
        }
      })
      .catch(function(err) {
        setStatus("Gagal baca file: " + String(err));
        btnFill.disabled = true;
        btnClear.disabled = false;
      });
  });

  btnFill.addEventListener("click", function() {
    if (!parsedItems.length) return;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var tab = tabs && tabs[0];
      if (!tab || !tab.id) {
        setStatus("Tab aktif tidak ditemukan.");
        return;
      }

      var payload = {
        type: "bulk-fill",
        items: parsedItems,
        autoSubmit: autoSubmitEl.checked,
        total: parsedItems.length
      };

      chrome.tabs.sendMessage(tab.id, payload, function(resp) {
        if (chrome.runtime.lastError) {
          setStatus("Gagal kirim: buka halaman E-TA dulu.");
          return;
        }
        if (resp && resp.ok) {
          setStatus("Proses dimulai...");
          btnFill.disabled = true;
          btnStop.disabled = false;
          updateProgress(0, totalItems, "Mengisi baris 1...");
          addLogEntry(0, itemLabel(parsedItems[0], 0) + " (mengisi...)", "active");
          startPolling(tab);
        } else {
          setStatus("Gagal. Coba refresh halaman E-TA.");
        }
      });
    });
  });

  btnStop.addEventListener("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var tab = tabs && tabs[0];
      if (!tab || !tab.id) return;
      chrome.tabs.sendMessage(tab.id, { type: "bulk-stop" }, function() {
        setStatus("Proses dihentikan.");
        btnStop.disabled = true;
        btnFill.disabled = false;
        stopPolling();
        progressStatus.textContent = "Dihentikan oleh user.";
      });
    });
  });

  btnClear.addEventListener("click", resetAll);

  // ── On popup open, check if there's an active process ─────────────────────
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs && tabs[0];
    if (!tab || !tab.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "bulk-progress" }, function(resp) {
      if (chrome.runtime.lastError || !resp) return;
      if (resp.total > 0 && resp.remaining > 0) {
        totalItems = resp.total;
        setStatus("Proses sedang berjalan...");
        btnFill.disabled = true;
        btnStop.disabled = false;
        btnClear.disabled = false;
        updateProgress(resp.done, resp.total, "Mengisi baris " + (resp.done + 1) + "...");
        startPolling(tab);
      }
    });
  });
})();
