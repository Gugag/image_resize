(function(){
  const $ = (s)=>document.querySelector(s);
  const els = {
    themeToggle: $('#themeToggle'),
    dropZone: $('#dropZone'),
    fileInput: $('#fileInput'),
    origInfo: $('#origInfo'),
    unitPx: $('#unitPx'),
    unitPct: $('#unitPct'),
    pxGroup: $('#pxGroup'),
    pctGroup: $('#pctGroup'),
    width: $('#width'),
    height: $('#height'),
    lock: $('#lock'),
    scale: $('#scale'),
    scaleOut: $('#scaleOut'),
    format: $('#format'),
    quality: $('#quality'),
    qualityOut: $('#qualityOut'),
    qualityGroup: $('#qualityGroup'),
    bgColor: $('#bgColor'),
    resizeBtn: $('#resizeBtn'),
    resetBtn: $('#resetBtn'),
    copyBtn: $('#copyBtn'),
    saveBtn: $('#saveBtn'),
    canvas: $('#canvas'),
    outInfo: $('#outInfo'),
    downloadRow: $('#downloadRow'),
    downloadBtn: $('#downloadBtn'),
  };

  (function initTheme(){
    const saved = localStorage.getItem('img-theme');
    if(saved === 'light') document.documentElement.classList.add('light');
    els.themeToggle.textContent = document.documentElement.classList.contains('light') ? '🌙' : '☀️';
  })();
  els.themeToggle.addEventListener('click', ()=>{
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('img-theme', isLight ? 'light' : 'dark');
    els.themeToggle.textContent = isLight ? '🌙' : '☀️';
  });

  let img = null, imgURL = null, ow = 0, oh = 0;

  function setReady(enabled){
    els.resizeBtn.disabled = !enabled;
    els.resetBtn.disabled = !enabled;
    els.copyBtn.disabled = !enabled;
  }
  function setHidden(el, hidden){ el.classList.toggle('hidden', !!hidden); }
  function setUnits(){
    const isPct = els.unitPct.checked;
    setHidden(els.pxGroup, isPct);
    setHidden(els.pctGroup, !isPct);
  }
  function updateQualityVisibility(){
    const f = els.format.value;
    const showQuality = (f === 'image/jpeg' || f === 'image/webp');
    setHidden(els.qualityGroup, !showQuality);
  }
  function setOrigInfo(){
    els.origInfo.textContent = `Original: ${ow} × ${oh} px`;
    setHidden(els.origInfo, false);
  }
  function onWidthChange(){
    const w = parseInt(els.width.value,10) || 0;
    if(els.lock.checked && ow && oh && w>0){
      const h = Math.round(w * oh / ow);
      els.height.value = h;
    }
  }
  function onHeightChange(){
    const h = parseInt(els.height.value,10) || 0;
    if(els.lock.checked && ow && oh && h>0){
      const w = Math.round(h * ow / oh);
      els.width.value = w;
    }
  }
  function updateScaleOut(){ els.scaleOut.textContent = `${els.scale.value}%`; }

  async function loadFile(file){
    if(imgURL) URL.revokeObjectURL(imgURL);
    imgURL = URL.createObjectURL(file);
    img = new Image();
    img.onload = () => {
      ow = img.naturalWidth; oh = img.naturalHeight;
      els.width.value = ow; els.height.value = oh;
      setOrigInfo();
      setReady(true);
      URL.revokeObjectURL(imgURL);
    };
    img.onerror = () => { alert('Could not load this image.'); };
    img.src = imgURL;
  }

  ['dragover','dragenter'].forEach(evt => {
    els.dropZone.addEventListener(evt, (e)=>{ e.preventDefault(); els.dropZone.classList.add('dragover'); });
  });
  ['dragleave','drop'].forEach(evt => {
    els.dropZone.addEventListener(evt, (e)=>{ e.preventDefault(); els.dropZone.classList.remove('dragover'); });
  });
  els.dropZone.addEventListener('drop', (e)=>{
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if(f) loadFile(f);
  });
  els.dropZone.addEventListener('click', ()=> els.fileInput.click());
  els.dropZone.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); els.fileInput.click(); }});
  els.fileInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(f) loadFile(f);
  });

  els.unitPx.addEventListener('change', setUnits);
  els.unitPct.addEventListener('change', setUnits);
  setUnits();
  els.format.addEventListener('change', updateQualityVisibility);
  updateQualityVisibility();
  els.scale.addEventListener('input', updateScaleOut); updateScaleOut();
  els.width.addEventListener('input', onWidthChange);
  els.height.addEventListener('input', onHeightChange);

  function resize(){
    if(!img){ alert('Choose an image first.'); return; }
    let targetW, targetH;

    if(els.unitPct.checked){
      const s = parseInt(els.scale.value,10) || 100;
      targetW = Math.max(1, Math.round(ow * s / 100));
      targetH = Math.max(1, Math.round(oh * s / 100));
    }else{
      targetW = parseInt(els.width.value,10) || 0;
      targetH = parseInt(els.height.value,10) || 0;
      if(els.lock.checked){
        if(targetW && !targetH) targetH = Math.round(targetW * oh / ow);
        if(targetH && !targetW) targetW = Math.round(targetH * ow / oh);
      }
      if(!targetW || !targetH){ alert('Enter width and/or height.'); return; }
    }

    const fmt = els.format.value;
    const q = parseFloat(els.quality.value) || 0.9;
    const cnv = els.canvas;
    cnv.width = targetW; cnv.height = targetH;
    const ctx = cnv.getContext('2d');

    if(fmt === 'image/jpeg'){
      ctx.fillStyle = els.bgColor.value || '#ffffff';
      ctx.fillRect(0,0,targetW,targetH);
    } else {
      ctx.clearRect(0,0,targetW,targetH);
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    cnv.toBlob((blob)=>{
      if(!blob){ alert('Failed to render.'); return; }
      const kb = (blob.size/1024).toFixed(1);
      els.outInfo.textContent = `Output: ${targetW} × ${targetH} px • ~${kb} KB`;
      setHidden(els.outInfo, false);
      setHidden(els.downloadRow, false);

      els.downloadBtn.onclick = ()=>{
        const a = document.createElement('a');
        const ext = fmt==='image/png' ? 'png' : (fmt==='image/webp' ? 'webp' : 'jpg');
        a.download = `resized-${targetW}x${targetH}.${ext}`;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a); a.click();
        setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
      };

      els.copyBtn.onclick = async ()=>{
        try{
          const pngBlob = fmt==='image/png' ? blob : await new Promise(res=> cnv.toBlob(res, 'image/png'));
          await navigator.clipboard.write([new ClipboardItem({[pngBlob.type]: pngBlob})]);
          els.copyBtn.textContent = 'Copied!';
          setTimeout(()=> els.copyBtn.textContent = 'Copy', 1200);
        }catch{ alert('Clipboard not supported here. Try Download.'); }
      };
    }, fmt, (fmt==='image/jpeg' || fmt==='image/webp') ? q : undefined);
  }

  els.resizeBtn.addEventListener('click', resize);
  els.resetBtn.addEventListener('click', ()=>{
    img = null; ow=oh=0;
    els.canvas.getContext('2d').clearRect(0,0,els.canvas.width,els.canvas.height);
    setHidden(els.origInfo, true);
    setHidden(els.downloadRow, true);
    setHidden(els.outInfo, true);
    setReady(false);
    els.fileInput.value = '';
  });
  window.addEventListener('keydown', (e)=>{ if((e.ctrlKey||e.metaKey) && e.key==='Enter') resize(); });

  function autosave(){
    const s = {
      fmt: els.format.value, q: els.quality.value, lock: els.lock.checked,
      unit: els.unitPct.checked ? 'pct' : 'px', scale: els.scale.value,
    };
    localStorage.setItem('img-resizer-settings', JSON.stringify(s));
  }
  function restore(){
    try{
      const s = JSON.parse(localStorage.getItem('img-resizer-settings')||'{}');
      if(!s) return;
      els.format.value = s.fmt || 'image/jpeg';
      els.quality.value = s.q || '0.9';
      els.lock.checked = s.lock !== false;
      if(s.unit === 'pct'){ els.unitPct.checked = true; els.unitPx.checked = false; }
      els.scale.value = s.scale || '100';
      setUnits(); updateQualityVisibility();
      els.qualityOut.textContent = `${Math.round(parseFloat(els.quality.value)*100)}%`;
      els.scaleOut.textContent = `${els.scale.value}%`;
    }catch{}
  }
  els.saveBtn.addEventListener('click', autosave);
  restore();

  els.quality.addEventListener('input', ()=>{
    els.qualityOut.textContent = `${Math.round(parseFloat(els.quality.value)*100)}%`;
  });
})();
