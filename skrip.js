// ==UserScript==
// @name         E-TA FT UNMUL Bulk Input Bimbingan
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  Bulk Input bimbingan skripsi. Isi form asli + klik Simpan Data secara otomatis.
// @author       Antigravity
// @match        https://e-office.ft.unmul.ac.id/mahasiswa/e-ta/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var STORAGE_KEY = 'bulk_bimbingan_queue';

    // Cek antrian di SEMUA halaman - jika ada, redirect ke form
    try {
        var pending = sessionStorage.getItem(STORAGE_KEY);
        if (pending) {
            var pq = JSON.parse(pending);
            if (pq.length > 0 && !window.location.href.includes('tambah_bimbingan_skripsi')) {
                console.log('[Bulk] Ada antrian, redirect ke form...');
                window.location.href = 'https://e-office.ft.unmul.ac.id/mahasiswa/e-ta/tambah_bimbingan_skripsi';
                return;
            }
        }
    } catch(e) {}

    if (!window.location.href.includes('tambah_bimbingan_skripsi')) return;

    // Tunggu halaman selesai loading termasuk CKEditor dan Select2
    window.addEventListener('load', function() {
        setTimeout(startBulk, 1500);
    });

    function findTargetForm() {
        var forms = document.querySelectorAll('form');
        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            if (form.querySelector('input[name="date_bimbingan"]') &&
                form.querySelector('select[name="bagian_bimbingan"]') &&
                form.querySelector('select[name="user_id_pembimbing"]') &&
                form.querySelector('textarea[name="isi_bimbingan"]')) {
                return form;
            }
        }
        return document.querySelector('form');
    }

    function startBulk() {
        var mainForm = findTargetForm();
        if (!mainForm) { console.log('[Bulk] No form'); return; }

        // Field asli (nama dari debug)
        var fDate = mainForm.querySelector('input[name="date_bimbingan"]');
        var fPosisi = mainForm.querySelector('select[name="bagian_bimbingan"]');
        var fDosen = mainForm.querySelector('select[name="user_id_pembimbing"]');
        var fUraian = mainForm.querySelector('textarea[name="isi_bimbingan"]');

        // Submit button - cari di dalam form DAN di luar
        var fSubmit = mainForm.querySelector('input[type="submit"]') ||
                      mainForm.querySelector('button[type="submit"]') ||
                      document.querySelector('input[value="Simpan Data"]') ||
                      document.querySelector('.form-actions input[type="submit"]') ||
                      document.querySelector('input[type="submit"]');

        console.log('[Bulk v7] Date:', fDate ? fDate.name : 'X');
        console.log('[Bulk v7] Posisi:', fPosisi ? fPosisi.name : 'X');
        console.log('[Bulk v7] Dosen:', fDosen ? fDosen.name + ' (' + fDosen.options.length + ')' : 'X');
        console.log('[Bulk v7] Uraian:', fUraian ? fUraian.name : 'X');
        console.log('[Bulk v7] Submit:', fSubmit ? 'FOUND (' + fSubmit.value + ')' : 'X');
        console.log('[Bulk v7] CKEditor:', window.CKEDITOR ? 'loaded' : 'not loaded');
        if (window.CKEDITOR && window.CKEDITOR.instances) {
            for (var k in window.CKEDITOR.instances) {
                console.log('[Bulk v7] CKEditor instance:', k);
            }
        }

        if (!fDate || !fPosisi || !fDosen || !fUraian) {
            console.log('[Bulk] Missing fields, abort');
            return;
        }

        var dosenOptionsHtml = fDosen.innerHTML;

        // =============================================
        // Fungsi: isi form asli dan submit secara native
        // =============================================
        function fillAndSubmit(data) {
            console.log('[Bulk] Filling form with:', data);

            // 1. Tanggal
            fDate.value = data.date;
            if (fDate.hasAttribute('readonly')) fDate.removeAttribute('readonly');

            // 2. Posisi
            fPosisi.value = data.posisi;

            // 3. Dosen
            fDosen.value = data.dosen;
            if (window.jQuery && window.jQuery.fn.select2) {
                window.jQuery(fDosen).val(data.dosen).trigger('change');
            }

            // 4. Uraian - gunakan CKEditor API jika tersedia
            var editorInstance = null;
            if (window.CKEDITOR && window.CKEDITOR.instances) {
                // Cari CKEditor instance untuk textarea isi_bimbingan
                editorInstance = window.CKEDITOR.instances.editor1 || null;
                if (!editorInstance) {
                    // Coba cari berdasarkan nama
                    for (var n in window.CKEDITOR.instances) {
                        editorInstance = window.CKEDITOR.instances[n];
                        break;
                    }
                }
            }

            if (editorInstance) {
                console.log('[Bulk] Setting CKEditor data...');
                editorInstance.setData(data.uraian, function() {
                    console.log('[Bulk] CKEditor data set, syncing...');
                    editorInstance.updateElement();
                    console.log('[Bulk] Textarea value after sync:', fUraian.value.substring(0, 100));
                    doSubmit();
                });
            } else {
                console.log('[Bulk] No CKEditor, setting textarea directly');
                fUraian.value = data.uraian;
                doSubmit();
            }
        }

        function doSubmit() {
            // Override confirm agar otomatis OK (tombol asli punya onclick="return confirm(...)")
            window.confirm = function() { return true; };

            // Debug: log semua data form sebelum submit
            var fd = new FormData(mainForm);
            console.log('[Bulk] Form data sebelum submit:');
            for (var pair of fd.entries()) {
                console.log('[Bulk]   ' + pair[0] + ': ' + String(pair[1]).substring(0, 80));
            }

            if (mainForm.requestSubmit && fSubmit) {
                console.log('[Bulk] Submitting with requestSubmit()...');
                mainForm.requestSubmit(fSubmit);
            } else if (fSubmit) {
                console.log('[Bulk] Clicking submit button (native)...');
                fSubmit.click();
            } else {
                console.log('[Bulk] No submit button, using form.submit()...');
                mainForm.submit();
            }
        }

        // =============================================
        // Cek antrian
        // =============================================
        var queue = [];
        try {
            var stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) queue = JSON.parse(stored);
        } catch(e) {}

        if (queue.length > 0) {
            var current = queue.shift();
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

            // Progress bar
            var pbar = document.createElement('div');
            pbar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#3b82f6;color:#fff;text-align:center;padding:15px;font-size:16px;font-weight:bold;';
            pbar.textContent = 'Bulk: Menyimpan data ke-' + current._index + ' (sisa ' + queue.length + ')';
            document.body.appendChild(pbar);

            // Isi dan submit
            fillAndSubmit(current);
            return;
        }

        // =============================================
        // UI Bulk Input
        // =============================================
        var style = document.createElement('style');
        style.textContent =
            '.bpanel{background:#fff;border:2px solid #3b82f6;border-radius:8px;padding:20px;margin:15px 0;}' +
            '.bcard{background:#f9fafb;border:1px solid #ddd;border-radius:8px;padding:15px 15px 15px 15px;margin-bottom:12px;position:relative;}' +
            '.bcard .bdel{position:absolute;top:8px;right:8px;background:#ef4444;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:12px;}';
        document.head.appendChild(style);

        var panel = document.createElement('div');
        panel.className = 'bpanel';
        panel.innerHTML =
            '<h4 style="margin:0 0 12px;color:#1e40af"><strong>Bulk Input Bimbingan</strong></h4>' +
            '<p style="color:#888;font-size:13px;margin-bottom:12px">Isi beberapa data sekaligus. Halaman akan reload otomatis per data.</p>' +
            '<div id="brows"></div>' +
            '<div style="margin-top:12px">' +
            '<button type="button" id="badd" class="btn btn-primary" style="margin-right:8px"><i class="fa fa-plus"></i> Tambah Baris</button>' +
            '<button type="button" id="bsave" class="btn btn-success"><i class="fa fa-paper-plane"></i> Simpan Semua</button>' +
            '</div>';

        // Cari tempat insert
        var insertTarget = document.querySelector('.innerLR');
        if (insertTarget) {
            var alertBlock = insertTarget.querySelector('.alert');
            if (alertBlock) {
                alertBlock.parentElement.insertBefore(panel, alertBlock.nextSibling);
            } else {
                insertTarget.insertBefore(panel, insertTarget.firstChild);
            }
        } else {
            mainForm.parentElement.insertBefore(panel, mainForm);
        }

        var brows = document.getElementById('brows');
        var badd = document.getElementById('badd');
        var bsave = document.getElementById('bsave');

        function addRow() {
            var d = new Date();
            var ds = String(d.getDate()).padStart(2,'0') + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + d.getFullYear();

            var r = document.createElement('div');
            r.className = 'bcard';
            r.innerHTML =
                '<button type="button" class="bdel"><i class="fa fa-trash"></i></button>' +
                '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:10px">' +
                '<div style="flex:1;min-width:170px"><label style="font-weight:bold;display:block;margin-bottom:3px">Tanggal</label>' +
                '<input type="text" class="form-control bd" value="' + ds + '"></div>' +
                '<div style="flex:1;min-width:170px"><label style="font-weight:bold;display:block;margin-bottom:3px">Posisi</label>' +
                '<select class="form-control bp"><option value="Proposal">Proposal</option><option value="Hasil">Hasil</option><option value="Pendadaran">Pendadaran</option></select></div>' +
                '</div>' +
                '<div style="margin-bottom:10px"><label style="font-weight:bold;display:block;margin-bottom:3px">Dosen Pembimbing</label>' +
                '<select class="form-control bds"><option value="">Pilih Dosen...</option>' + dosenOptionsHtml + '</select></div>' +
                '<div><label style="font-weight:bold;display:block;margin-bottom:3px">Uraian</label>' +
                '<textarea class="form-control bu" rows="3" placeholder="Ketik uraian bimbingan..."></textarea></div>';

            r.querySelector('.bdel').onclick = function() {
                if (brows.children.length > 1) r.remove();
                else alert('Minimal 1!');
            };
            brows.appendChild(r);

            if (window.jQuery) {
                setTimeout(function() {
                    if (window.jQuery.fn.select2) window.jQuery(r).find('.bds').select2({width:'100%',placeholder:'Cari dosen...',allowClear:true});
                    if (window.jQuery.fn.datepicker) window.jQuery(r).find('.bd').datepicker({format:'dd-mm-yyyy',autoclose:true,todayHighlight:true});
                }, 200);
            }
        }

        addRow();
        badd.onclick = addRow;

        bsave.onclick = function() {
            var cards = brows.querySelectorAll('.bcard');
            var items = [];
            for (var i = 0; i < cards.length; i++) {
                var c = cards[i];
                var date = c.querySelector('input.bd').value.trim();
                var posisi = c.querySelector('select.bp').value;
                var dosen = c.querySelector('select.bds').value;
                var uraian = c.querySelector('textarea.bu').value.trim();
                if (!date || !dosen || !uraian) {
                    alert('Baris ' + (i+1) + ' belum lengkap!');
                    return;
                }
                items.push({_index:i+1, date:date, posisi:posisi, dosen:dosen, uraian:uraian});
            }
            if (!confirm('Simpan ' + items.length + ' data?\nHalaman akan reload otomatis.')) return;

            // Simpan sisanya ke antrian, proses yang pertama
            var first = items.shift();
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));

            fillAndSubmit(first);
        };

        console.log('[Bulk v7] Ready!');
    }
})();
