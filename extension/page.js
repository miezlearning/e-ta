(function() {
  "use strict";

  var CHANNEL = "bulk-bimbingan";

  function getEditor() {
    if (!window.CKEDITOR || !window.CKEDITOR.instances) return null;
    var inst = window.CKEDITOR.instances.editor1 || null;
    if (!inst) {
      for (var k in window.CKEDITOR.instances) {
        inst = window.CKEDITOR.instances[k];
        break;
      }
    }
    return inst || null;
  }

  window.addEventListener("message", function(ev) {
    if (!ev || !ev.data || ev.data.source !== CHANNEL) return;

    if (ev.data.type === "bulk-select2-set") {
      var selectName = ev.data.selectName;
      var value = String(ev.data.value || "");
      try {
        if (window.jQuery) {
          var $el = window.jQuery('select[name="' + selectName + '"]');
          if ($el.length) {
            $el.val(value).trigger("change");
          }
        }
      } catch (e) {}
      return;
    }

    if (ev.data.type === "bulk-datepicker-set") {
      var inputName = ev.data.inputName;
      var dateValue = String(ev.data.value || "");
      try {
        if (window.jQuery) {
          var $input = window.jQuery('input[name="' + inputName + '"]');
          if ($input.length) {
            $input.val(dateValue);
            if (window.jQuery.fn.datepicker) {
              $input.datepicker("setDate", dateValue);
            }
            $input.trigger("change");
          }
        }
      } catch (e) {}
      return;
    }

    if (ev.data.type !== "bulk-ckeditor-set") return;

    var id = ev.data.id;
    var value = String(ev.data.value || "");
    var inst = getEditor();

    if (!inst) {
      window.postMessage({ source: CHANNEL, type: "bulk-ckeditor-done", id: id, ok: false }, "*");
      return;
    }

    // Kalau editor belum ready, tunggu event instanceReady
    if (inst.status !== "ready") {
      inst.on("instanceReady", function() {
        doSetData(inst, id, value);
      });
      return;
    }

    doSetData(inst, id, value);
  });

  function doSetData(inst, id, value) {
    try {
      inst.setData(value, function() {
        try { inst.updateElement(); } catch (e) {}
        window.postMessage({ source: CHANNEL, type: "bulk-ckeditor-done", id: id, ok: true }, "*");
      });
    } catch (e) {
      window.postMessage({ source: CHANNEL, type: "bulk-ckeditor-done", id: id, ok: false }, "*");
    }
  }
})();
