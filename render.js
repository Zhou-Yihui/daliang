// render.js
// 一个轻量的字符渲染器，将笔画模板（数组 of strokes of points）绘制到 canvas。
// API:
//   renderCharToCanvas(template, canvas, options)
//   renderCharToDataURL(template, size, options) -> Promise resolves to dataURL
//   computeTemplateBBox(template) -> {minX,minY,maxX,maxY,width,height}
//   normalizeTemplate(template) -> template (cloned, origin at 0,0)
// options (可选):
//   size: {w, h} canvas size in px (default uses canvas size if rendering to canvas)
//   padding: px padding around glyph (default 8)
//   strokeWidth: preferred stroke width (default auto based on size)
//   strokeStyle: color (default '#f0c000')
//   background: null for transparent or a color string (default null)
//   center: true/false (default true)
//   simplify: number (0..1)  简单点数稀释比例 (默认 0)
//   smooth: boolean (是否做简单贝塞尔平滑，默认 false)

(function(global){
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function computeTemplateBBox(template){
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const stroke of template){
      for (const p of stroke){
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
    }
    if (!isFinite(minX)) return {minX:0,minY:0,maxX:0,maxY:0,width:0,height:0};
    return {minX,minY,maxX,maxY,width: maxX - minX, height: maxY - minY};
  }

  function normalizeTemplate(template){
    const t = deepClone(template);
    const bbox = computeTemplateBBox(t);
    for (const stroke of t){
      for (const p of stroke){
        p.x -= bbox.minX;
        p.y -= bbox.minY;
      }
    }
    return {template: t, bbox};
  }

  // Simplify stroke by sampling points (naive): keep every nth point
  function simplifyTemplate(template, ratio){
    if (!ratio || ratio <= 0 || ratio >= 1) return template;
    const out = [];
    for (const stroke of template){
      const n = stroke.length;
      if (n <= 2) { out.push(stroke.slice()); continue; }
      const keepEvery = Math.max(1, Math.floor(1 / ratio));
      const s = [];
      for (let i=0;i<n;i+=keepEvery) s.push(stroke[i]);
      if (s[s.length-1] !== stroke[n-1]) s.push(stroke[n-1]);
      out.push(s);
    }
    return out;
  }

  // optional smoothing: convert polyline to quadratic curves approximations
  // We'll just return the original points but the drawing function will use quadraticCurveTo for smoothing.
  function drawStroke(ctx, stroke, useSmooth){
    if (!stroke || stroke.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    if (!useSmooth || stroke.length < 3){
      for (let i=1;i<stroke.length;i++) ctx.lineTo(stroke[i].x, stroke[i].y);
    } else {
      // simple smoothing: midpoint quadratic segments
      for (let i=1;i<stroke.length;i++){
        const prev = stroke[i-1];
        const cur = stroke[i];
        const midX = (prev.x + cur.x)/2;
        const midY = (prev.y + cur.y)/2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }
      // last segment to last point
      const last = stroke[stroke.length-1];
      ctx.lineTo(last.x, last.y);
    }
    ctx.stroke();
  }

  function renderCharToCanvas(template, canvas, options = {}){
    if (!canvas) throw new Error('canvas required');
    const ctx = canvas.getContext('2d');
    const opt = Object.assign({
      padding: 8,
      strokeWidth: null,
      strokeStyle: '#f0c000',
      background: null,
      center: true,
      simplify: 0,
      smooth: false,
      fitToCanvas: true, // scale glyph to fit canvas - keeps aspect
    }, options);

    // handle template clones & normalize
    const {template: normTemplate, bbox} = normalizeTemplate(template);
    let usedTemplate = normTemplate;
    if (opt.simplify && opt.simplify > 0) usedTemplate = simplifyTemplate(usedTemplate, opt.simplify);

    // clear / background
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (opt.background){
      ctx.fillStyle = opt.background;
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    // compute scale to fit
    const pad = opt.padding || 0;
    const availableW = Math.max(1, canvas.width - pad*2);
    const availableH = Math.max(1, canvas.height - pad*2);
    const glyphW = bbox.width || 1;
    const glyphH = bbox.height || 1;
    let scaleX = availableW / glyphW;
    let scaleY = availableH / glyphH;
    let scale = opt.fitToCanvas ? Math.min(scaleX, scaleY) : 1;

    // If glyph is tiny (zero size), fallback
    if (!isFinite(scale) || scale <= 0) scale = 1;

    // auto stroke width if not set
    let strokeW = opt.strokeWidth;
    if (!strokeW) {
      // base stroke relative to canvas size:
      strokeW = Math.max(1, Math.min(6, Math.round(Math.min(canvas.width, canvas.height) / 50)));
    }

    ctx.save();
    ctx.translate(pad, pad);
    // center if requested
    if (opt.center) {
      const usedW = glyphW * scale;
      const usedH = glyphH * scale;
      const extraX = (availableW - usedW)/2;
      const extraY = (availableH - usedH)/2;
      ctx.translate(extraX, extraY);
    }
    ctx.scale(scale, scale);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = opt.strokeStyle;
    ctx.lineWidth = strokeW / scale; // lineWidth expressed in glyph-space

    for (const s of usedTemplate){
      drawStroke(ctx, s, opt.smooth);
    }

    ctx.restore();
  }

  // render to dataURL at given size {w,h}
  function renderCharToDataURL(template, size = {w:64,h:64}, options = {}){
    return new Promise((resolve) => {
      const c = document.createElement('canvas');
      c.width = size.w || 64;
      c.height = size.h || 64;
      renderCharToCanvas(template, c, Object.assign({}, options, {padding: options.padding ?? Math.round(Math.min(c.width,c.height)*0.08)}));
      resolve(c.toDataURL('image/png'));
    });
  }

  // utility: load stargate_chars JSON mapping: {name: template}
  async function loadCharDatabase(jsonObj){
    // jsonObj can be object or a url (string) - if string, fetch it
    if (typeof jsonObj === 'string'){
      const res = await fetch(jsonObj);
      return await res.json();
    } else {
      return jsonObj;
    }
  }

  // Export API
  global.StargateRenderer = {
    renderCharToCanvas,
    renderCharToDataURL,
    computeTemplateBBox,
    normalizeTemplate,
    loadCharDatabase,
    simplifyTemplate
  };

})(window);
