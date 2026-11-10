// Parcelado: episódio 1. Renderizador determinístico em canvas 2D.
// window.setup(timeline) prepara tudo; window.renderAt(t) desenha o frame do tempo t (segundos).
'use strict';
const W = 1080, H = 1920;
const C = {
  noite: '#0B0A12', violeta: '#2A1840', chuva: '#1E2A44', mag: '#FF2E88', ciano: '#19E3FF',
  ambar: '#FFB020', alerta: '#FF3B30', ouro: '#C9A45C', verde: '#2EC27A', branco: '#F2EFEA', silh: '#05040A'
};
const cv = document.getElementById('c');
const X = cv.getContext('2d');
let TL = null;
const BG = {};
const RAIN = [];
const GRAIN = [];
let VIG = null, TMP = null;

// ---------- utilidades ----------
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  out: t => 1 - Math.pow(1 - t, 3),
  inout: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
};
function off(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function sceneAt(t) { for (const s of TL.scenes) if (t >= s.start && t < s.end) return s; return TL.scenes[TL.scenes.length - 1]; }
function rainK(t) { const k = TL.rain; for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t < k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], (t - k[i][0]) / (k[i + 1][0] - k[i][0])); return 0; }

function txt(ctx, s, x, y, font, fill, o = {}) {
  ctx.font = font; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.letterSpacing = o.ls || '0px';
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || 'rgba(0,0,0,.7)'; ctx.strokeText(s, x, y); }
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowB || 22; }
  ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.shadowBlur = 0; ctx.letterSpacing = '0px';
}
function measure(ctx, s, font, ls) { ctx.font = font; ctx.letterSpacing = ls || '0px'; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }
function pill(ctx, x, y, w, h, fill, stroke) { ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } }
function box(ctx, x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }

// desenha um fundo maior que o quadro com zoom/pan lento (Ken Burns)
function kb(img, p, s0, s1, dx0 = 0, dy0 = 0, dx1 = 0, dy1 = 0) {
  const s = lerp(s0, s1, p) * Math.max(W / img.width, H / img.height);
  const w = img.width * s, h = img.height * s;
  X.drawImage(img, (W - w) / 2 + lerp(dx0, dx1, p), (H - h) / 2 + lerp(dy0, dy1, p), w, h);
}
function shakeAt(t, t0, amp, decay = 7) { const d = t - t0; if (d < 0 || d > 1.2) return [0, 0]; const a = amp * Math.exp(-d * decay); return [a * Math.sin(d * 91), a * Math.cos(d * 77)]; }

// ---------- camadas globais ----------
function initRain() { const r = mulberry(11); for (let i = 0; i < 900; i++) RAIN.push({ x: r() * 1500 - 200, y: r() * (H + 300), l: 28 + r() * 80, s: 1700 + r() * 1500, g: i % 3 }); }
function drawRain(t, k, o = {}) {
  if (k <= 0.01) return;
  const n = Math.floor(RAIN.length * clamp(k)); const sl = o.slant ?? 0.2; const sp = o.speed ?? 1;
  X.save(); X.lineCap = 'round';
  for (let g = 0; g < 3; g++) {
    X.strokeStyle = `rgba(185,210,255,${(0.09 + g * 0.07) * (o.alpha ?? 1)})`; X.lineWidth = 1 + g * 0.9; X.beginPath();
    for (let i = g; i < n; i += 3) {
      const d = RAIN[i]; const y = ((d.y + d.s * sp * t) % (H + 300)) - 150; const x = ((d.x - y * sl) % 1500 + 1500) % 1500 - 200;
      X.moveTo(x, y); X.lineTo(x - d.l * sl, y + d.l);
    }
    X.stroke();
  }
  X.restore();
}
function initPost() {
  const r = mulberry(5);
  for (let k = 0; k < 4; k++) { const c = off(540, 960), g = c.getContext('2d'), im = g.createImageData(540, 960); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - .5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); GRAIN.push(c); }
  VIG = off(W, H); const g = VIG.getContext('2d'); const v = g.createRadialGradient(W / 2, H / 2, 420, W / 2, H / 2, 1180); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.78)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  TMP = off(W, H);
}
function post(t) {
  X.save(); X.globalCompositeOperation = 'overlay'; X.globalAlpha = 0.22; X.drawImage(GRAIN[Math.floor(t * 30) % 4], 0, 0, W, H); X.restore();
  X.drawImage(VIG, 0, 0);
}
function glitch(t, amt, seed) {
  if (amt <= 0) return;
  const g = TMP.getContext('2d'); g.clearRect(0, 0, W, H); g.drawImage(cv, 0, 0);
  const fr = Math.floor(t * 30);
  for (let i = 0; i < 14; i++) {
    const y = hash(fr * 13 + i + seed) * H, h = 10 + hash(fr * 7 + i) * 120, dx = (hash(fr * 3 + i * 5) - .5) * 160 * amt;
    X.drawImage(TMP, 0, y, W, h, dx, y, W, h);
  }
  X.save(); X.globalCompositeOperation = 'screen'; X.globalAlpha = .35 * amt;
  X.fillStyle = C.ciano; X.fillRect(0, hash(fr) * H, W, 6 + hash(fr + 1) * 30);
  X.fillStyle = C.mag; X.fillRect(0, hash(fr + 2) * H, W, 6 + hash(fr + 3) * 30);
  X.restore();
}

// ---------- prédios e cidade ----------
function towers(g, r, n, minH, maxH, base, w, col, winCols, winP, wmin = 40, wmax = 150) {
  for (let i = 0; i < n; i++) {
    const tw = wmin + r() * (wmax - wmin), th = minH + r() * (maxH - minH), tx = r() * w - 40;
    g.fillStyle = col; g.fillRect(tx, base - th, tw, th);
    if (r() < .35) { g.fillRect(tx + tw * .4, base - th - 40 - r() * 60, 4, 60 + r() * 50); }
    for (let yy = base - th + 12; yy < base - 6; yy += 15) for (let xx = tx + 6; xx < tx + tw - 8; xx += 12) {
      if (r() < winP) { g.globalAlpha = .25 + r() * .55; g.fillStyle = winCols[Math.floor(r() * winCols.length)]; g.fillRect(xx, yy, 5, 7); g.globalAlpha = 1; g.fillStyle = col; }
    }
  }
}
function gothicTower(g, cx, base, w, h, o = {}) {
  const col = o.col || '#0d0a17';
  g.fillStyle = col; g.beginPath();
  g.moveTo(cx - w / 2, base); g.lineTo(cx - w / 2, base - h * .62); g.lineTo(cx - w * .34, base - h * .7); g.lineTo(cx - w * .3, base - h * .82);
  g.lineTo(cx - w * .16, base - h * .9); g.lineTo(cx - w * .08, base - h * .97); g.lineTo(cx, base - h * 1.12);
  g.lineTo(cx + w * .08, base - h * .97); g.lineTo(cx + w * .16, base - h * .9); g.lineTo(cx + w * .3, base - h * .82); g.lineTo(cx + w * .34, base - h * .7);
  g.lineTo(cx + w / 2, base - h * .62); g.lineTo(cx + w / 2, base); g.fill();
  for (const s of [-1, 1]) { // torres laterais e arcobotantes
    g.beginPath(); g.moveTo(cx + s * w * .78, base); g.lineTo(cx + s * w * .78, base - h * .42); g.lineTo(cx + s * w * .72, base - h * .56); g.lineTo(cx + s * w * .66, base - h * .42); g.lineTo(cx + s * w * .66, base); g.fill();
    g.strokeStyle = col; g.lineWidth = w * .035;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(cx + s * w * .72, base - h * (.3 + k * .07)); g.quadraticCurveTo(cx + s * w * .62, base - h * (.42 + k * .07), cx + s * w * .5, base - h * (.45 + k * .07)); g.stroke(); }
  }
  const r = mulberry(o.seed || 3);
  for (let row = 0; row < 11; row++) for (let k = -2; k <= 2; k++) {
    const ww = w * .055, wx = cx + k * w * .17, wy = base - h * .08 - row * h * .052;
    if (wy < base - h * .78) continue;
    g.globalAlpha = .25 + r() * .5; g.fillStyle = row % 4 === 0 ? C.mag : (k % 2 ? C.ouro : C.ciano);
    g.beginPath(); g.moveTo(wx - ww, wy); g.lineTo(wx - ww, wy - ww * 2.2); g.quadraticCurveTo(wx - ww, wy - ww * 3.3, wx, wy - ww * 3.9); g.quadraticCurveTo(wx + ww, wy - ww * 3.3, wx + ww, wy - ww * 2.2); g.lineTo(wx + ww, wy); g.fill();
  }
  g.globalAlpha = 1;
  // rosácea
  g.save(); g.globalAlpha = .7; g.strokeStyle = C.ouro; g.lineWidth = 3; g.beginPath(); g.arc(cx, base - h * .74, w * .1, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; g.beginPath(); g.moveTo(cx, base - h * .74); g.lineTo(cx + Math.cos(a) * w * .1, base - h * .74 + Math.sin(a) * w * .1); g.stroke(); }
  g.restore();
}
function neonSign(g, s, x, y, col, size, vert, font) {
  g.save(); g.font = font || `700 ${size}px Oswald, "WenQuanYi Zen Hei", sans-serif`; g.textBaseline = 'top'; g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 26;
  if (vert) [...s].forEach((ch, i) => g.fillText(ch, x, y + i * size * 1.05)); else g.fillText(s, x, y);
  g.shadowBlur = 0; g.restore();
}

// ---------- personagens (silhuetas com luz de recorte) ----------
function rimStroke(g, path, color, lw, alpha, clip) {
  g.save(); if (clip) { g.beginPath(); g.rect(...clip); g.clip(); }
  g.globalAlpha = alpha; g.strokeStyle = color; g.lineWidth = lw; g.lineJoin = 'round'; g.shadowColor = color; g.shadowBlur = 12; g.stroke(path); g.restore();
}
// Dito de costas na moto. (cx, by) = chão sob a roda traseira
function riderBack(g, cx, by, s, t, o = {}) {
  g.save(); g.translate(cx, by); g.scale(s, s);
  const led = o.led || C.ambar;
  const P = new Path2D();
  // roda e paralama
  P.roundRect(-30, -170, 60, 175, 26);
  P.roundRect(-46, -215, 92, 54, 12);
  // corpo da moto + guidão
  P.moveTo(-78, -250); P.lineTo(78, -250); P.lineTo(60, -205); P.lineTo(-60, -205); P.closePath();
  P.roundRect(-185, -352, 370, 16, 8);
  // pernas
  P.moveTo(-70, -262); P.quadraticCurveTo(-118, -190, -104, -120); P.lineTo(-74, -112); P.quadraticCurveTo(-82, -180, -38, -242); P.closePath();
  P.moveTo(70, -262); P.quadraticCurveTo(118, -190, 104, -120); P.lineTo(74, -112); P.quadraticCurveTo(82, -180, 38, -242); P.closePath();
  P.roundRect(-112, -126, 50, 22, 8); P.roundRect(62, -126, 50, 22, 8);
  // capa de chuva (tronco)
  P.moveTo(-92, -238); P.quadraticCurveTo(-112, -330, -100, -448); P.quadraticCurveTo(0, -478, 100, -448); P.quadraticCurveTo(112, -330, 92, -238); P.quadraticCurveTo(0, -222, -92, -238);
  // braço direito
  P.moveTo(92, -440); P.quadraticCurveTo(150, -410, 162, -350); P.lineTo(136, -342); P.quadraticCurveTo(128, -392, 82, -410); P.closePath();
  // capacete
  P.ellipse(0, -545, 50, 54, 0, 0, Math.PI * 2);
  // retrovisores
  P.moveTo(-170, -350); P.lineTo(-198, -430); P.lineTo(-190, -432); P.lineTo(-162, -350); P.closePath(); P.ellipse(-200, -440, 22, 15, -.3, 0, Math.PI * 2);
  P.moveTo(170, -350); P.lineTo(198, -430); P.lineTo(190, -432); P.lineTo(162, -350); P.closePath(); P.ellipse(200, -440, 22, 15, .3, 0, Math.PI * 2);
  rimStroke(g, P, C.ciano, 7, .7, [-400, -700, 400, 800]);
  rimStroke(g, P, C.mag, 8, .75, [0, -700, 400, 800]);
  g.fillStyle = C.silh; g.fill(P);
  // brilho plástico da capa
  g.save(); g.globalAlpha = .18; g.strokeStyle = '#cfe0ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(-84, -260); g.quadraticCurveTo(-100, -340, -90, -430); g.stroke(); g.beginPath(); g.moveTo(80, -270); g.quadraticCurveTo(94, -330, 86, -420); g.stroke(); g.restore();
  // braço mecânico (esquerdo)
  g.save(); g.lineCap = 'round';
  g.strokeStyle = '#1b1c24'; g.lineWidth = 30; g.beginPath(); g.moveTo(-92, -440); g.quadraticCurveTo(-150, -410, -150, -348); g.stroke();
  g.strokeStyle = '#4a4f5e'; g.lineWidth = 5; g.beginPath(); g.moveTo(-100, -446); g.quadraticCurveTo(-156, -414, -158, -352); g.stroke();
  g.fillStyle = led; g.shadowColor = led; g.shadowBlur = 30; g.beginPath(); g.arc(-150, -365, 7, 0, Math.PI * 2); g.fill();
  g.restore();
  // lanterna traseira
  const tl = .75 + .25 * Math.sin(t * 9);
  g.save(); g.fillStyle = `rgba(255,40,40,${tl})`; g.shadowColor = '#ff2a2a'; g.shadowBlur = 30; g.fillRect(-34, -205, 68, 12); g.restore();
  // faixa refletiva do capacete
  g.fillStyle = rgba(C.ambar, .8); g.fillRect(-48, -560, 96, 8);
  // bag JÁ!
  const fl = o.bagFlicker ?? 1;
  g.save(); g.shadowColor = C.ambar; g.shadowBlur = 70 * fl;
  const bg = g.createLinearGradient(0, -520, 0, -300); bg.addColorStop(0, '#ffcf6a'); bg.addColorStop(1, '#e09010');
  g.fillStyle = bg; g.globalAlpha = .55 + .45 * fl; g.fillRect(-98, -520, 196, 210); g.restore();
  g.strokeStyle = '#7a4c00'; g.lineWidth = 4; g.strokeRect(-98, -520, 196, 210);
  g.fillStyle = 'rgba(80,40,0,.35)'; g.fillRect(-98, -350, 196, 10);
  txt(g, 'JÁ!', 0, -420, '700 74px Oswald', '#2b1a00');
  g.restore();
}
// Dito de lado, pilotando. (x, y) = linha do chão no meio das rodas
function riderSide(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const led = o.led || C.ambar;
  // farol
  g.save(); const hb = g.createLinearGradient(230, -120, 900, -60); hb.addColorStop(0, 'rgba(255,240,200,.45)'); hb.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = hb; g.beginPath(); g.moveTo(232, -128); g.lineTo(900, -230); g.lineTo(900, 40); g.closePath(); g.fill(); g.restore();
  const P = new Path2D();
  P.arc(-180, -72, 74, 0, Math.PI * 2); P.arc(190, -72, 74, 0, Math.PI * 2);
  P.moveTo(-200, -150); P.lineTo(-40, -175); P.lineTo(120, -210); P.lineTo(230, -150); P.lineTo(200, -110); P.lineTo(60, -100); P.lineTo(-120, -110); P.closePath();
  P.moveTo(150, -200); P.lineTo(205, -300); P.lineTo(225, -296); P.lineTo(176, -196); P.closePath();
  // perna
  P.moveTo(-70, -200); P.quadraticCurveTo(40, -215, 70, -180); P.lineTo(40, -95); P.lineTo(75, -95); P.lineTo(75, -80); P.lineTo(10, -80); P.lineTo(35, -165); P.quadraticCurveTo(-20, -160, -80, -165); P.closePath();
  // tronco inclinado + capa
  P.moveTo(-100, -170); P.quadraticCurveTo(-120, -320, -20, -400); P.lineTo(40, -395); P.quadraticCurveTo(60, -300, 20, -190); P.closePath();
  // capacete
  P.ellipse(40, -455, 52, 50, .2, 0, Math.PI * 2);
  rimStroke(g, P, C.ciano, 7, .75, [-500, -700, 1000, 450]);
  g.fillStyle = C.silh; g.fill(P);
  // capa esvoaçando
  g.save(); g.fillStyle = 'rgba(20,24,40,.85)'; g.beginPath(); g.moveTo(-100, -380); g.quadraticCurveTo(-180 - 30 * Math.sin(t * 14), -330, -230 - 40 * Math.sin(t * 11), -250 + 20 * Math.sin(t * 17)); g.quadraticCurveTo(-170, -240, -105, -200); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(200,220,255,.25)'; g.lineWidth = 2; g.stroke(); g.restore();
  // raios das rodas
  g.save(); g.strokeStyle = 'rgba(25,227,255,.35)'; g.lineWidth = 3;
  for (const wx of [-180, 190]) { g.beginPath(); g.arc(wx, -72, 58, 0, Math.PI * 2); g.stroke(); for (let k = 0; k < 3; k++) { const a = t * 25 + k * 2.09; g.beginPath(); g.moveTo(wx, -72); g.lineTo(wx + Math.cos(a) * 56, -72 + Math.sin(a) * 56); g.stroke(); } }
  g.restore();
  // braço mecânico
  g.save(); g.lineCap = 'round'; g.strokeStyle = '#1b1c24'; g.lineWidth = 28; g.beginPath(); g.moveTo(10, -370); g.lineTo(110, -300); g.lineTo(190, -290); g.stroke();
  g.strokeStyle = '#555b6c'; g.lineWidth = 4; g.beginPath(); g.moveTo(14, -380); g.lineTo(114, -310); g.lineTo(186, -300); g.stroke();
  g.fillStyle = led; g.shadowColor = led; g.shadowBlur = 25; g.beginPath(); g.arc(170, -292, 7, 0, Math.PI * 2); g.fill(); g.restore();
  // bag
  g.save(); g.shadowColor = o.pkg ? C.ciano : C.ambar; g.shadowBlur = 60; g.fillStyle = C.ambar; g.translate(-70, -330); g.rotate(-.18); g.fillRect(-95, -95, 150, 170); g.restore();
  g.save(); g.translate(-70, -330); g.rotate(-.18); g.strokeStyle = '#7a4c00'; g.lineWidth = 4; g.strokeRect(-95, -95, 150, 170); txt(g, 'JÁ!', -20, -10, '700 56px Oswald', '#2b1a00');
  if (o.pkg) { g.fillStyle = rgba(C.ciano, .5 + .4 * Math.sin(t * 20)); g.fillRect(-95, 60, 150, 8); }
  g.restore();
  // lanterna
  g.save(); g.fillStyle = '#ff2a2a'; g.shadowColor = '#ff2a2a'; g.shadowBlur = 25; g.fillRect(-212, -160, 22, 10); g.restore();
  g.restore();
}
// pessoa em pé genérica (silhueta)
function person(g, x, y, h, o = {}) {
  const s = h / 600; g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s);
  const P = new Path2D();
  if (o.hood) {
    P.moveTo(-110, 0); P.lineTo(-95, -300); P.quadraticCurveTo(-120, -420, -70, -470); P.quadraticCurveTo(-60, -560, 0, -575); P.quadraticCurveTo(60, -560, 70, -470); P.quadraticCurveTo(120, -420, 95, -300); P.lineTo(110, 0); P.closePath();
  } else {
    P.ellipse(0, -545, o.headR || 40, (o.headR || 40) * 1.12, 0, 0, Math.PI * 2);
    P.moveTo(-30, -500); P.lineTo(30, -500); P.lineTo(32, -480); P.lineTo(-32, -480); P.closePath();
    const bw = o.belly ? 115 : 85;
    P.moveTo(-95, -478); P.quadraticCurveTo(-bw - 10, -400, -bw, -300); P.quadraticCurveTo(-bw + 10, -250, -70, -235); P.lineTo(70, -235); P.quadraticCurveTo(bw - 10, -250, bw, -300); P.quadraticCurveTo(bw + 10, -400, 95, -478); P.closePath();
    P.moveTo(-70, -240); P.lineTo(-62, 0); P.lineTo(-14, 0); P.lineTo(0, -180); P.lineTo(14, 0); P.lineTo(62, 0); P.lineTo(70, -240); P.closePath();
    // braços
    P.moveTo(-95, -470); P.quadraticCurveTo(-125, -380, -118, -260); P.lineTo(-96, -262); P.quadraticCurveTo(-100, -370, -78, -440); P.closePath();
    if (o.armOut) { P.moveTo(85, -470); P.quadraticCurveTo(170, -400, 230, -350); P.lineTo(222, -330); P.quadraticCurveTo(160, -370, 80, -430); P.closePath(); }
    else { P.moveTo(95, -470); P.quadraticCurveTo(125, -380, 118, -260); P.lineTo(96, -262); P.quadraticCurveTo(100, -370, 78, -440); P.closePath(); }
  }
  if (o.rim) rimStroke(g, P, o.rim, 8, o.rimA ?? .7, o.rimClip);
  if (o.rim2) rimStroke(g, P, o.rim2, 7, .6, o.rim2Clip);
  g.fillStyle = o.fill || C.silh; g.fill(P);
  g.restore();
  return P;
}

// ---------- construção dos fundos (uma vez) ----------
function buildBGs() {
  // ABERTURA: espiral do Minhocão, Sé-Pietà ao fundo
  { const w = 1200, h = 2134, c = off(w, h), g = c.getContext('2d'), r = mulberry(7);
    const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#04030a'); sk.addColorStop(.3, '#241536'); sk.addColorStop(.58, '#1E2A44'); sk.addColorStop(1, '#06050b');
    g.fillStyle = sk; g.fillRect(0, 0, w, h);
    towers(g, r, 46, 300, 1000, 1350, w, '#130f21', [C.ciano, C.mag, '#ffd27a'], .12);
    gothicTower(g, 600, 1420, 330, 950, { seed: 4 });
    g.save(); g.strokeStyle = C.ouro; g.lineWidth = 6; g.shadowColor = C.ouro; g.shadowBlur = 30; g.beginPath(); g.ellipse(600, 1420 - 950 * 1.12 - 40, 80, 24, 0, 0, Math.PI * 2); g.stroke(); g.restore();
    const f = g.createLinearGradient(0, 1150, 0, 1450); f.addColorStop(0, 'rgba(42,24,64,0)'); f.addColorStop(.5, 'rgba(100,70,140,.35)'); f.addColorStop(1, 'rgba(30,42,68,0)'); g.fillStyle = f; g.fillRect(0, 1150, w, 300);
    towers(g, r, 20, 250, 650, 1620, w, '#0e0b18', [C.mag, C.ciano, C.ambar], .07);
    neonSign(g, '質屋', 70, 1180, C.mag, 72, true);
    neonSign(g, 'CRÉDITO JÁ', 820, 1240, C.ciano, 50);
    neonSign(g, 'PRÓTESES 24H', 820, 1305, C.mag, 40);
    // decks elevados da espiral
    for (let k = 0; k < 3; k++) { const yy = 1560 + k * 70; g.fillStyle = '#07060d'; g.fillRect(0, yy, w, 34 - k * 4);
      g.fillStyle = C.ambar; for (let i = 0; i < 18; i++) { g.globalAlpha = .55 - k * .15; g.fillRect(i * 70 + k * 23, yy + 4, 26, 3); } g.globalAlpha = 1; }
    g.fillStyle = '#07060d'; g.fillRect(150, 1700, 70, 500); g.fillRect(980, 1700, 70, 500);
    const gr = g.createLinearGradient(0, 1760, 0, h); gr.addColorStop(0, '#0d0c17'); gr.addColorStop(1, '#040308'); g.fillStyle = gr; g.fillRect(0, 1760, w, h - 1760);
    // reflexos no asfalto
    for (let i = 0; i < 40; i++) { const xx = r() * w; g.fillStyle = [C.mag, C.ciano, C.ambar][i % 3]; g.globalAlpha = .06 + r() * .1; g.fillRect(xx, 1780 + r() * 80, 4 + r() * 10, 200 + r() * 200); }
    g.globalAlpha = 1; BG.abertura = c; }

  // BOKEH (braço e pedido)
  { const c = off(W, H), g = c.getContext('2d'), r = mulberry(21);
    const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#0a0814'); sk.addColorStop(1, '#151b30'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
    g.filter = 'blur(18px)';
    for (let i = 0; i < 70; i++) { g.globalAlpha = .12 + r() * .3; g.fillStyle = [C.mag, C.ciano, C.ambar, C.ouro][i % 4]; g.beginPath(); g.arc(r() * W, r() * H, 20 + r() * 90, 0, Math.PI * 2); g.fill(); }
    g.filter = 'none'; g.globalAlpha = 1; BG.bokeh = c; }

  // FÁBRICA (flashback)
  { const c = off(W, H), g = c.getContext('2d'), r = mulberry(31);
    const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#1a0d0a'); sk.addColorStop(.6, '#2a140e'); sk.addColorStop(1, '#0a0504'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { g.fillStyle = 'rgba(255,170,110,.07)'; g.fillRect(60 + i * 170, 380 + j * 120, 140, 95); }
    g.fillStyle = '#0c0605'; g.fillRect(0, 1500, W, 420);
    g.strokeStyle = 'rgba(255,160,90,.12)'; g.lineWidth = 2; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(i * 90, 1500); g.lineTo(540 + (i * 90 - 540) * 2.2, 1920); g.stroke(); }
    // estrutura da prensa
    g.fillStyle = '#080404'; g.fillRect(250, 520, 90, 990); g.fillRect(740, 520, 90, 990); g.fillRect(200, 440, 680, 200); g.fillRect(220, 1340, 640, 170);
    g.fillStyle = 'rgba(255,190,60,.55)'; for (let i = 0; i < 12; i++) { g.save(); g.translate(230 + i * 55, 1350); g.transform(1, 0, -.6, 1, 0, 0); g.fillRect(0, 0, 26, 22); g.restore(); }
    // robôs ao fundo
    g.strokeStyle = '#120807'; g.lineCap = 'round';
    for (const rx of [70, 990]) { g.lineWidth = 40; g.beginPath(); g.moveTo(rx, 1500); g.lineTo(rx, 1260); g.lineTo(rx + (rx < 500 ? 120 : -120), 1150); g.stroke(); }
    BG.fabrica = c; }

  // TORRE SÉ-PIETÀ (contra-plongée)
  { const w = 1200, h = 2600, c = off(w, h), g = c.getContext('2d'), r = mulberry(41);
    const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#1b0f2c'); sk.addColorStop(.4, '#2A1840'); sk.addColorStop(1, '#0b0a12'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
    // feixes de luz
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const gg = g.createLinearGradient(600, 300, 600, 2600); gg.addColorStop(0, rgba(C.ouro, .18)); gg.addColorStop(1, rgba(C.ouro, 0)); g.fillStyle = gg; g.beginPath(); g.moveTo(600, 300); g.lineTo(-200 + i * 400, 2600); g.lineTo(-80 + i * 400, 2600); g.closePath(); g.fill(); }
    g.restore();
    // torre em perspectiva
    g.fillStyle = '#0c0916'; g.beginPath(); g.moveTo(120, h); g.lineTo(420, 700); g.lineTo(780, 700); g.lineTo(1080, h); g.fill();
    g.beginPath(); g.moveTo(420, 700); g.lineTo(470, 480); g.lineTo(530, 420); g.lineTo(600, 160); g.lineTo(670, 420); g.lineTo(730, 480); g.lineTo(780, 700); g.fill();
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(600 + s * 140, 700); g.lineTo(600 + s * 175, 380); g.lineTo(600 + s * 210, 700); g.fill(); }
    // arcobotantes
    g.strokeStyle = '#0c0916'; g.lineWidth = 34;
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const yy = 1100 + k * 300; g.beginPath(); g.moveTo(600 + s * (230 + k * 60), yy); g.quadraticCurveTo(600 + s * (420 + k * 70), yy - 180, 600 + s * (560 + k * 60), yy + 60); g.stroke(); }
    // vitrais em perspectiva
    for (let row = 0; row < 22; row++) { const yy = 800 + row * 82; const half = lerp(150, 430, (yy - 700) / (h - 700)); const ww = lerp(18, 40, row / 22);
      for (let k = -3; k <= 3; k++) { const wx = 600 + k * half / 3.6; g.globalAlpha = .25 + r() * .55; g.fillStyle = row % 5 === 0 ? C.mag : (k % 2 ? C.ouro : C.ciano);
        g.beginPath(); g.moveTo(wx - ww / 2, yy); g.lineTo(wx - ww / 2, yy - ww * 1.6); g.quadraticCurveTo(wx - ww / 2, yy - ww * 2.3, wx, yy - ww * 2.7); g.quadraticCurveTo(wx + ww / 2, yy - ww * 2.3, wx + ww / 2, yy - ww * 1.6); g.lineTo(wx + ww / 2, yy); g.fill(); } }
    g.globalAlpha = 1;
    // letreiro Pietà
    g.save(); g.font = '700 150px Goth'; g.textAlign = 'center'; g.fillStyle = '#f3e3b8'; g.shadowColor = C.ouro; g.shadowBlur = 40; g.fillText('Pietà', 600, 1010); g.restore();
    BG.pieta = c; }

  // INFOGRÁFICO
  { const c = off(W, H), g = c.getContext('2d');
    const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#120d1e'); sk.addColorStop(1, '#09080f'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(25,227,255,.05)'; g.lineWidth = 1; for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    BG.info = c; }

  // CORRIDA: camadas de paralaxe
  { const c = off(2400, 1300), g = c.getContext('2d'), r = mulberry(51);
    towers(g, r, 120, 300, 1100, 1300, 2400, '#150f24', [C.ciano, C.mag, '#ffd27a'], .14);
    BG.parFar = c;
    const c2 = off(2400, 900), g2 = c2.getContext('2d'), r2 = mulberry(52);
    towers(g2, r2, 40, 200, 700, 900, 2400, '#0b0914', [C.mag, C.ambar], .06, 80, 220);
    for (let i = 0; i < 8; i++) { const sx = 150 + i * 300; neonSign(g2, ['PIETÀ', '薬', 'JÁ!', 'BAR', '質', 'HOTEL', 'CRÉDITO', '24H'][i], sx, 200 + r2() * 300, [C.mag, C.ciano, C.ambar][i % 3], 46 + r2() * 20, i % 2 === 1); }
    BG.parMid = c2;
    const sk = off(W, H), gs = sk.getContext('2d'); const sg = gs.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#05040b'); sg.addColorStop(.5, '#241536'); sg.addColorStop(1, '#0b0a12'); gs.fillStyle = sg; gs.fillRect(0, 0, W, H); BG.parSky = sk; }

  // PORTA DO PRÉDIO DE LUXO (nota)
  { const c = off(W, H), g = c.getContext('2d'), r = mulberry(61);
    g.fillStyle = '#0a0911'; g.fillRect(0, 0, W, H);
    g.strokeStyle = rgba(C.ouro, .25); g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(80 + i * 115, 0); g.lineTo(80 + i * 115, 1500); g.stroke(); }
    const dg = g.createLinearGradient(0, 600, 0, 1500); dg.addColorStop(0, '#ffe2a8'); dg.addColorStop(1, '#c98a3a');
    g.save(); g.shadowColor = '#ffcc80'; g.shadowBlur = 80; g.fillStyle = dg; g.fillRect(330, 620, 420, 880); g.restore();
    g.strokeStyle = '#3a2810'; g.lineWidth = 8; g.strokeRect(330, 620, 420, 880); g.beginPath(); g.moveTo(540, 620); g.lineTo(540, 1500); g.stroke();
    g.fillStyle = '#0d0b12'; g.fillRect(0, 1500, W, 420);
    const rf = g.createLinearGradient(0, 1500, 0, 1920); rf.addColorStop(0, 'rgba(255,200,120,.35)'); rf.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = rf; g.fillRect(330, 1500, 420, 420);
    person(g, 540, 1500, 640, { belly: true, armOut: true, fill: '#120c06', rim: '#ffd590', rimA: .5 });
    g.save(); g.translate(540 + 230 * 640 / 600, 1500 - 350 * 640 / 600); g.strokeStyle = '#ffe9c0'; g.lineWidth = 4; g.beginPath(); g.moveTo(-14, -40); g.lineTo(14, -40); g.lineTo(0, -10); g.closePath(); g.moveTo(0, -10); g.lineTo(0, 12); g.moveTo(-10, 12); g.lineTo(10, 12); g.stroke(); g.restore();
    person(g, 860, 1920, 1100, { rim: C.ouro, rimA: .55, rimClip: [-200, -700, 200, 800] });
    g.save(); g.shadowColor = C.ambar; g.shadowBlur = 60; g.fillStyle = C.ambar; g.fillRect(740, 1260, 240, 260); g.restore();
    g.strokeStyle = '#7a4c00'; g.lineWidth = 5; g.strokeRect(740, 1260, 240, 260); txt(g, 'JÁ!', 860, 1390, '700 90px Oswald', '#2b1a00');
    BG.porta = c; }

  // KITNET
  { const c = off(1200, 2134), g = c.getContext('2d'), r = mulberry(71);
    g.fillStyle = '#0c1020'; g.fillRect(0, 0, 1200, 2134);
    // janela com a cidade e o anúncio
    g.save(); g.beginPath(); g.rect(560, 380, 560, 900); g.clip();
    const sk = g.createLinearGradient(0, 380, 0, 1280); sk.addColorStop(0, '#1a0f2a'); sk.addColorStop(1, '#2a3c66'); g.fillStyle = sk; g.fillRect(560, 380, 560, 900);
    towers(g, r, 18, 200, 700, 1280, 1200, '#100c1e', [C.ciano, C.mag, '#ffd27a'], .12);
    g.font = '700 170px Goth'; g.fillStyle = '#ffd6f0'; g.shadowColor = C.mag; g.shadowBlur = 50; g.textAlign = 'center'; g.fillText('Pietà', 850, 760); g.shadowBlur = 0;
    g.restore();
    g.strokeStyle = '#05060c'; g.lineWidth = 26; g.strokeRect(560, 380, 560, 900); g.lineWidth = 14; g.beginPath(); g.moveTo(840, 380); g.lineTo(840, 1280); g.moveTo(560, 830); g.lineTo(1120, 830); g.stroke();
    // feixe da janela no chão
    g.save(); g.globalCompositeOperation = 'lighter'; const sh = g.createLinearGradient(560, 1280, 200, 2000); sh.addColorStop(0, 'rgba(255,46,136,.18)'); sh.addColorStop(1, 'rgba(255,46,136,0)'); g.fillStyle = sh; g.beginPath(); g.moveTo(560, 1280); g.lineTo(1120, 1280); g.lineTo(700, 2134); g.lineTo(0, 2134); g.closePath(); g.fill(); g.restore();
    g.fillStyle = '#080a14'; g.fillRect(0, 1640, 1200, 500);
    // cama
    g.fillStyle = '#121626'; g.fillRect(40, 1500, 520, 170); g.fillStyle = '#1b2036'; g.fillRect(40, 1480, 520, 40);
    // Dito sentado (de lado, inclinado) e Caio
    const D = new Path2D();
    D.ellipse(250, 1080, 50, 56, .2, 0, Math.PI * 2);
    D.moveTo(180, 1150); D.quadraticCurveTo(150, 1300, 190, 1500); D.lineTo(400, 1500); D.quadraticCurveTo(400, 1300, 320, 1140); D.closePath();
    D.moveTo(330, 1490); D.lineTo(470, 1500); D.lineTo(480, 1700); D.lineTo(430, 1700); D.lineTo(420, 1550); D.lineTo(330, 1550); D.closePath();
    rimStroke(g, D, C.mag, 8, .75, [200, 900, 400, 900]); g.fillStyle = C.silh; g.fill(D);
    // braço mecânico estendido
    g.save(); g.lineCap = 'round'; g.strokeStyle = '#1c1d26'; g.lineWidth = 34; g.beginPath(); g.moveTo(320, 1180); g.lineTo(420, 1320); g.lineTo(560, 1330); g.stroke();
    g.strokeStyle = '#5a6072'; g.lineWidth = 5; g.beginPath(); g.moveTo(330, 1170); g.lineTo(428, 1306); g.lineTo(556, 1314); g.stroke(); g.restore();
    const K = person(g, 680, 1700, 470, { flip: true, armOut: true, rim: C.mag, rimA: .7, rim2: C.ciano, rim2Clip: [-400, -700, 120, 800] });
    // abajur
    g.save(); g.fillStyle = '#ffb35a'; g.shadowColor = '#ffb35a'; g.shadowBlur = 60; g.beginPath(); g.moveTo(70, 1400); g.lineTo(150, 1400); g.lineTo(130, 1350); g.lineTo(90, 1350); g.closePath(); g.fill(); g.restore();
    // bag no chão
    g.save(); g.shadowColor = C.ambar; g.shadowBlur = 40; g.fillStyle = '#c98a1a'; g.fillRect(900, 1560, 180, 160); g.restore();
    BG.kitnet = c; }

  // BECO DA LIBERDADE
  { const c = off(1200, 2134), g = c.getContext('2d'), r = mulberry(81);
    const vx = 600, vy = 950;
    const sk = g.createLinearGradient(0, 0, 0, 2134); sk.addColorStop(0, '#07050d'); sk.addColorStop(.45, '#2a1430'); sk.addColorStop(1, '#08060c'); g.fillStyle = sk; g.fillRect(0, 0, 1200, 2134);
    g.fillStyle = '#0b0912'; g.beginPath(); g.moveTo(0, 0); g.lineTo(vx - 120, vy - 350); g.lineTo(vx - 120, vy + 260); g.lineTo(0, 2134); g.fill();
    g.beginPath(); g.moveTo(1200, 0); g.lineTo(vx + 120, vy - 350); g.lineTo(vx + 120, vy + 260); g.lineTo(1200, 2134); g.fill();
    g.fillStyle = '#100d18'; g.beginPath(); g.moveTo(0, 2134); g.lineTo(vx - 120, vy + 260); g.lineTo(vx + 120, vy + 260); g.lineTo(1200, 2134); g.fill();
    // janelas nas paredes
    for (let i = 0; i < 60; i++) { const side = i % 2 ? 1 : -1, d = r(), yy = lerp(200, 1700, r()); const xx = vx + side * lerp(140, 560, d); g.globalAlpha = .15 + r() * .35; g.fillStyle = [C.mag, C.ambar, C.ciano][i % 3]; g.fillRect(xx, yy, 18 * (1 + d), 24 * (1 + d)); }
    g.globalAlpha = 1;
    neonSign(g, 'リベルダージ', 110, 300, C.mag, 64, true);
    neonSign(g, '薬局', 1000, 420, C.ciano, 70, true);
    neonSign(g, 'PENHORES', 800, 1180, C.ambar, 42);
    neonSign(g, 'BAR 二十四', 160, 1300, C.ciano, 40);
    // lanternas vermelhas em varal
    for (let k = 0; k < 5; k++) { const yy = 500 + k * 140; const span = lerp(950, 300, k / 5);
      g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(vx - span / 2, yy); g.quadraticCurveTo(vx, yy + 60, vx + span / 2, yy); g.stroke();
      for (let j = 0; j < 5; j++) { const lx = vx - span / 2 + span * (j + .5) / 5, ly = yy + 30 - Math.abs(j - 2) * 10; const lr = lerp(28, 12, k / 5);
        g.save(); g.fillStyle = '#ff4630'; g.shadowColor = '#ff3020'; g.shadowBlur = 30; g.beginPath(); g.ellipse(lx, ly + lr, lr * .8, lr, 0, 0, Math.PI * 2); g.fill(); g.restore(); } }
    // figura encapuzada
    person(g, 600, 1480, 760, { hood: true, fill: '#040309', rim: C.mag, rimA: .55, rim2: C.ciano, rim2Clip: [0, -800, 300, 900] });
    // poça
    const pg = g.createLinearGradient(0, 1500, 0, 2134); pg.addColorStop(0, 'rgba(255,46,136,.18)'); pg.addColorStop(1, 'rgba(255,46,136,0)'); g.fillStyle = pg; g.fillRect(300, 1500, 600, 600);
    BG.beco = c; }
}

// ---------- HUD ----------
const HUD_SCENES = { abertura: ['21:12', 'ESPIRAL MINHOCÃO'], braco: ['21:12', 'ESPIRAL MINHOCÃO'], pieta: ['21:13', 'SÉ'], parcelas: ['21:13', 'SÉ'], corrida: ['21:40', 'CONSOLAÇÃO'], taxa: ['21:41', 'CONSOLAÇÃO'], nota: ['22:05', 'JARDINS ALTO'], kitnet: ['23:10', 'KITNET'], pedido: ['23:47', '???'], beco: ['00:06', 'LIBERDADE BAIXA'], retrovisor: ['00:21', 'MARGINAL'] };
function hudState(t, sc) {
  const m = HUD_SCENES[sc.id]; if (!m) return null;
  let a = 1; if (sc.id === 'abertura') a = E.out(clamp((t - 1.8) / .35)); if (sc.id === 'kitnet') a = .55;
  if (a <= 0) return null;
  const st = { alpha: a, clock: m[0], loc: m[1], segs: 3, seg4: false, alert: false, glitch: 0, notaFlash: false };
  if (sc.id === 'parcelas' && t > 30.4) st.seg4 = true;
  if (sc.id === 'nota' && t > 49) st.notaFlash = true;
  if (sc.id === 'retrovisor' && t > 87.6) st.alert = true;
  if (sc.id === 'pedido') { for (const [a0, a1] of [[66, 66.6], [68.5, 68.85], [70.6, 71]]) if (t >= a0 && t < a1) st.glitch = 1; }
  return st;
}
function garble(s, t, on) { if (!on) return s; const ch = '#?█▓01@'; return [...s].map((c, i) => (c !== ' ' && hash(Math.floor(t * 30) * 31 + i) < .45) ? ch[Math.floor(hash(i + t) * ch.length)] : c).join(''); }
function drawHUD(t, st) {
  X.save(); X.globalAlpha = st.alpha; const y0 = 60 - (1 - st.alpha) * 30;
  box(X, 60, y0, 960, 250, 18, 'rgba(7,7,15,.8)', st.alert ? `rgba(255,59,48,${.55 + .45 * Math.sin(t * 14)})` : 'rgba(25,227,255,.55)', 3);
  const gl = st.glitch > 0;
  txt(X, 'JÁ!', 100, y0 + 46, '700 42px Oswald', C.ambar, { align: 'left' });
  txt(X, garble(`${st.clock} · ${st.loc}`, t, gl), 980, y0 + 46, '400 30px Mono', C.ciano, { align: 'right', ls: '3px' });
  const rows = [['SALDO', y0 + 108], ['NOTA', y0 + 160], ['BRAÇO', y0 + 210]];
  for (const [k, yy] of rows) txt(X, garble(k, t, gl), 100, yy, '400 32px Mono', '#7d9bb0', { align: 'left', ls: '4px' });
  txt(X, garble('-R$ 3.214,90', t, gl), 300, y0 + 108, '400 46px Mono', C.alerta, { align: 'left', glow: rgba(C.alerta, .6), glowB: 14 });
  const nf = st.notaFlash ? .55 + .45 * Math.sin(t * 10) : 1;
  X.globalAlpha = st.alpha * nf; txt(X, garble('★ 4,71', t, gl), 300, y0 + 160, '400 42px Mono', C.ambar, { align: 'left' }); X.globalAlpha = st.alpha;
  txt(X, '▼', 470, y0 + 160, '400 30px Mono', C.alerta, { align: 'left' });
  txt(X, garble('limite 4,70', t, gl), 520, y0 + 162, '400 28px Mono', '#7d9bb0', { align: 'left' });
  for (let i = 0; i < 4; i++) {
    const on = i < st.segs || (i === 3 && st.seg4 && Math.sin(t * 16) > 0);
    if (on) { X.save(); X.fillStyle = C.alerta; X.shadowColor = C.alerta; X.shadowBlur = 12; X.fillRect(300 + i * 62, y0 + 196, 50, 28); X.restore(); }
    else { X.strokeStyle = '#4b5566'; X.lineWidth = 2; X.strokeRect(300 + i * 62, y0 + 196, 50, 28); }
  }
  txt(X, garble(st.seg4 ? '4ª = BLOQUEIO' : '3 atrasadas', t, gl), 560, y0 + 212, '400 28px Mono', st.seg4 ? C.alerta : '#7d9bb0', { align: 'left' });
  X.restore();
}

// ---------- textos genéricos ----------
function renderText(it, t, sceneEnd) {
  const a = t - it.t, end = it.end ?? sceneEnd; if (a < 0 || t >= end) return;
  const alpha = clamp(a / .08) * clamp((end - t) / .12) * (it.alpha ?? 1);
  const x = it.x ?? 540, y = it.y, k = it.kind, lines = it.text.split('\n');
  X.save(); X.globalAlpha = alpha;
  const pop = lerp(.55, 1, E.back(clamp(a / .3)));
  const multi = (font, fill, size, o = {}) => { lines.forEach((l, i) => txt(X, l, 0, i * size * 1.08, font, fill, o)); };
  switch (k) {
    case 'title': { const s = it.size || 96; X.translate(x, y); X.scale(pop, pop); multi(`700 ${s}px Oswald`, it.color || '#fff', s, { stroke: 12 }); break; }
    case 'title2': { const s = it.size || 80; X.translate(x, y); X.scale(pop, pop); multi(`700 ${s}px Oswald`, it.color || C.ambar, s, { stroke: 12, glow: rgba(C.ambar, .45), glowB: 26 }); break; }
    case 'redtitle': { const s = it.size || 70; X.translate(x, y); X.scale(pop, pop); multi(`700 ${s}px Oswald`, C.alerta, s, { stroke: 10 }); break; }
    case 'label': { X.globalAlpha = alpha; txt(X, it.text, x, y - (1 - E.out(clamp(a / .3))) * 14, '400 36px Mono', it.color || C.ciano, { align: it.align || 'center', ls: '5px', stroke: 6 }); break; }
    case 'small': { txt(X, it.text, x, y, '400 40px Oswald', 'rgba(255,255,255,.88)', { stroke: 8 }); break; }
    case 'quote': { const s = it.size || 68; X.translate(x, y); X.scale(pop, pop); multi(`600 ${s}px Oswald`, '#fff', s, { stroke: 10 }); break; }
    case 'money': { const s = it.size || 170; X.translate(x, y); X.scale(pop, pop); txt(X, it.text, 0, 0, `700 ${s}px Oswald`, C.verde, { stroke: 12, glow: rgba(C.verde, .6), glowB: 30 }); break; }
    case 'gold': { const s = it.size || 130; X.translate(x, y); X.scale(pop, pop); txt(X, it.text, 0, 0, `700 ${s}px Oswald`, '#f3e3b8', { stroke: 10, glow: C.ouro, glowB: 30, ls: '6px' }); break; }
    case 'tag': case 'pill': {
      const font = '700 36px Oswald', w = measure(X, it.text, font, '2px') + 56, h = 62;
      X.translate(x, y); X.scale(pop, pop);
      if (k === 'tag') { box(X, -w / 2, -h / 2, w, h, 10, C.ambar); txt(X, it.text, 0, 2, font, '#140c00', { ls: '2px' }); }
      else { X.shadowColor = C.alerta; X.shadowBlur = 24; pill(X, -w / 2, -h / 2, w, h, '#B3261E'); X.shadowBlur = 0; txt(X, it.text, 0, 2, font, '#fff', { ls: '2px' }); }
      break; }
    case 'chip': {
      const font = '500 40px Oswald', pre = it.check === 'x' ? '✕  ' : it.check === 'v' ? '✓  ' : '';
      const tw = measure(X, it.text, font, '1px'), pw = pre ? measure(X, pre, font) : 0, w = tw + pw + 50, h = 66;
      const bx = it.align === 'left' ? x : x - w / 2; const sl = (1 - E.out(clamp(a / .25))) * 30;
      X.translate(it.align === 'left' ? -sl : 0, it.align === 'left' ? 0 : sl * .5);
      box(X, bx, y - h / 2, w, h, 12, 'rgba(6,6,12,.82)', 'rgba(255,255,255,.12)');
      if (pre) txt(X, pre, bx + 25, y + 2, font, it.check === 'x' ? C.alerta : C.verde, { align: 'left' });
      txt(X, it.text, bx + 25 + pw, y + 2, font, '#fff', { align: 'left', ls: '1px' });
      break; }
    case 'stamp': {
      const s = it.size || 110, sc = lerp(2.6, 1, E.out(clamp(a / .16)));
      X.translate(x, y); X.rotate(-0.12); X.scale(sc, sc); X.globalAlpha = alpha * clamp(a / .05);
      const font = `700 ${s}px Oswald`, w = measure(X, it.text, font, '3px') + 70, h = s * 1.25;
      X.strokeStyle = it.color || C.alerta; X.lineWidth = 9; X.beginPath(); X.roundRect(-w / 2, -h / 2, w, h, 14); X.stroke();
      txt(X, it.text, 0, 4, font, it.color || C.alerta, { ls: '3px' });
      break; }
  }
  X.restore();
}

// ---------- cenas ----------
const S = {};
function flash(t, t0, dur = .5, a0 = .8, col = '255,255,255') { const d = t - t0; if (d < 0 || d > dur) return; X.fillStyle = `rgba(${col},${a0 * (1 - d / dur)})`; X.fillRect(0, 0, W, H); }

S.abertura = (t, lt, d, o = {}) => {
  kb(BG.abertura, clamp((t - (o.t0 ?? 0)) / (o.dur ?? d)), 1.0, 1.07, 0, 30, 0, -10);
  drawRain(t, rainK(t) * (o.rainMul ?? 1));
  const bob = Math.sin(t * 3.1) * 2;
  const fl = .85 + .15 * Math.sin(t * 7) * (hash(Math.floor(t * 12)) > .9 ? -3 : 1);
  riderBack(X, 540, 1880 + bob, 1.18, t, { bagFlicker: clamp(fl), led: C.ambar });
  // reflexo da bag no chão molhado
  X.save(); X.globalCompositeOperation = 'lighter'; const rg = X.createLinearGradient(0, 1880, 0, 1920); rg.addColorStop(0, rgba(C.ambar, .25)); rg.addColorStop(1, rgba(C.ambar, 0)); X.fillStyle = rg; X.fillRect(420, 1880, 240, 40); X.restore();
  if (!o.noFlash) flash(t, 0.0, .7, .55, '210,200,255');
};
S.braco = (t, lt, d) => {
  kb(BG.bokeh, lt / d, 1.05, 1.12, 0, 0, -30, 20);
  drawRain(t, rainK(t) * .7, { slant: .1 });
  const p = lt / d;
  X.save(); X.translate(560 + p * 20, 1060 - p * 10); X.rotate(-0.42); X.scale(1.25 + p * .06, 1.25 + p * .06);
  // manga da capa de chuva
  X.fillStyle = 'rgba(20,24,40,.92)'; X.beginPath(); X.moveTo(-900, -170); X.lineTo(-560, -150); X.quadraticCurveTo(-520, 0, -560, 150); X.lineTo(-900, 190); X.fill();
  X.strokeStyle = 'rgba(200,220,255,.3)'; X.lineWidth = 3; X.stroke();
  // antebraço
  const fg = X.createLinearGradient(0, -110, 0, 110); fg.addColorStop(0, '#5a5f70'); fg.addColorStop(.25, '#2a2c36'); fg.addColorStop(.7, '#121319'); fg.addColorStop(1, '#08080b');
  X.fillStyle = fg; X.beginPath(); X.moveTo(-560, -112); X.lineTo(150, -82); X.lineTo(150, 82); X.lineTo(-560, 112); X.closePath(); X.fill();
  X.strokeStyle = rgba(C.ciano, .7); X.lineWidth = 3; X.beginPath(); X.moveTo(-560, -112); X.lineTo(150, -82); X.stroke();
  X.strokeStyle = rgba(C.mag, .55); X.beginPath(); X.moveTo(-560, 112); X.lineTo(150, 82); X.stroke();
  X.strokeStyle = 'rgba(0,0,0,.7)'; X.lineWidth = 4; for (const sx of [-400, -230, -60]) { X.beginPath(); X.moveTo(sx, -104 + (sx + 560) * .04); X.lineTo(sx, 104 - (sx + 560) * .04); X.stroke(); X.fillStyle = '#6a6f80'; for (const sy of [-70, 70]) { X.beginPath(); X.arc(sx + 14, sy * (1 - (sx + 560) * .0004), 5, 0, 7); X.fill(); } }
  // pistões
  const pg = X.createLinearGradient(0, -150, 0, -120); pg.addColorStop(0, '#c8ccd8'); pg.addColorStop(1, '#4a4e5a');
  X.fillStyle = pg; X.fillRect(-520, -150, 300, 24); X.fillStyle = '#9aa0b0'; X.fillRect(-220, -144, 260, 12);
  X.fillStyle = pg; X.fillRect(-470, 124, 260, 22); X.fillStyle = '#9aa0b0'; X.fillRect(-210, 130, 240, 10);
  // cabos
  X.strokeStyle = '#7a2a1a'; X.lineWidth = 9; X.beginPath(); X.moveTo(-560, 40); X.bezierCurveTo(-420, 90, -300, -20, -120, 50); X.stroke();
  X.strokeStyle = '#1a1a22'; X.lineWidth = 12; X.beginPath(); X.moveTo(-560, -30); X.bezierCurveTo(-400, -70, -250, 30, -100, -20); X.stroke();
  // logo e número de série
  txt(X, 'Pietà', -330, 10, '700 54px Goth', rgba(C.ouro, .85));
  txt(X, 'Nº 0049-7', -130, 60, '400 24px Mono', 'rgba(200,210,230,.5)', { ls: '3px' });
  // arranhões
  X.strokeStyle = 'rgba(220,230,255,.18)'; X.lineWidth = 2; for (let i = 0; i < 9; i++) { const sx = -500 + hash(i) * 600, sy = -80 + hash(i + 9) * 160; X.beginPath(); X.moveTo(sx, sy); X.lineTo(sx + 40 + hash(i + 3) * 60, sy + (hash(i + 4) - .5) * 20); X.stroke(); }
  // punho com LED
  const red = t >= 9.4; const blink = red ? (Math.sin(t * 14) > 0 ? 1 : .25) : (.75 + .25 * Math.sin(t * 3));
  X.fillStyle = '#16171d'; X.fillRect(150, -96, 60, 192);
  X.save(); X.shadowColor = red ? C.alerta : C.ambar; X.shadowBlur = 40 * blink; X.fillStyle = red ? rgba(C.alerta, blink) : rgba(C.ambar, blink); X.fillRect(166, -80, 24, 160); X.restore();
  // mão fechando no manete
  X.fillStyle = '#060608'; X.fillRect(290, -230, 70, 460);
  const hg = X.createLinearGradient(210, 0, 400, 0); hg.addColorStop(0, '#30323d'); hg.addColorStop(1, '#14151b');
  X.fillStyle = hg; X.beginPath(); X.roundRect(210, -100, 120, 200, 26); X.fill();
  for (let k = 0; k < 4; k++) { X.fillStyle = k % 2 ? '#262833' : '#2e303c'; X.beginPath(); X.roundRect(300, -96 + k * 48, 90, 44, 16); X.fill(); X.strokeStyle = rgba(C.ciano, .4); X.lineWidth = 2; X.stroke(); }
  X.fillStyle = '#2a2c36'; X.beginPath(); X.roundRect(230, -140, 90, 48, 18); X.fill();
  // gotas de chuva no metal
  for (let i = 0; i < 26; i++) { const dx = -520 + hash(i * 3) * 820, dy = -90 + hash(i * 7) * 180; X.fillStyle = 'rgba(230,240,255,.55)'; X.beginPath(); X.arc(dx, dy, 2 + hash(i) * 3, 0, 7); X.fill(); }
  X.restore();
  if (t >= 9.4) { X.fillStyle = `rgba(255,30,30,${.12 * (Math.sin(t * 14) > 0 ? 1 : 0)})`; X.fillRect(0, 0, W, H); }
};
S.tese = (t, lt) => {
  X.fillStyle = '#060509'; X.fillRect(0, 0, W, H);
  drawRain(t, rainK(t), { alpha: .6 });
  const n = Math.floor(clamp(lt / 1.2) * 22);
  for (let i = 0; i < n; i++) { const x = 290 + i * 24, y = 1160 + Math.sin(i * .6 - t * 5) * 18; X.fillStyle = C.ambar; X.globalAlpha = .9; X.beginPath(); X.arc(x, y, 6, 0, 7); X.fill(); }
  X.globalAlpha = 1;
};
S.fabrica = (t, lt, d) => {
  const [sx, sy] = shakeAt(t, 16.6, 40, 5);
  X.save(); X.translate(sx, sy);
  kb(BG.fabrica, lt / d, 1.04, 1.12, 0, 0, 0, -20);
  // aríete da prensa
  let ram = 0; if (t < 16.3) ram = .08 * Math.sin(t * 2); else if (t < 16.6) ram = E.inout(clamp((t - 16.3) / .3)); else ram = 1;
  const ry = lerp(640, 1180, ram);
  X.fillStyle = '#100707'; X.fillRect(300, 620, 480, ry - 620); X.fillStyle = '#1a0c0a'; X.fillRect(320, ry - 20, 440, 180);
  X.strokeStyle = 'rgba(255,170,80,.35)'; X.lineWidth = 3; X.strokeRect(320, ry - 20, 440, 180);
  // operário (Dito mais novo) com o braço na zona da prensa
  if (t < 16.6) { person(X, 170, 1500, 620, { armOut: true, fill: '#070303', rim: '#ff9a5a', rimA: .55 }); }
  else { person(X, 170, 1500, 620, { fill: '#070303', rim: '#ff9a5a', rimA: .55 }); }
  // giroflex
  const ang = t * 5; X.save(); X.globalCompositeOperation = 'lighter';
  const bx = 540, by = 410; const gr = X.createRadialGradient(bx, by, 10, bx, by, 900); gr.addColorStop(0, 'rgba(255,40,20,.45)'); gr.addColorStop(1, 'rgba(255,40,20,0)');
  X.fillStyle = gr; X.beginPath(); X.moveTo(bx, by); X.arc(bx, by, 1100, ang, ang + .5); X.closePath(); X.fill();
  X.beginPath(); X.moveTo(bx, by); X.arc(bx, by, 1100, ang + Math.PI, ang + Math.PI + .5); X.closePath(); X.fill();
  X.restore();
  X.fillStyle = '#ff3020'; X.beginPath(); X.arc(540, 410, 16, 0, 7); X.fill();
  // faíscas
  if (t >= 16.6) for (let i = 0; i < 90; i++) { const ts = 16.6 + (i % 30) * .01; const dt = t - ts; if (dt < 0 || dt > .9) continue;
    const vx = (hash(i) - .5) * 1400, vy = -200 - hash(i + 50) * 900; const px = 540 + vx * dt, py = 1170 + vy * dt + 1600 * dt * dt;
    X.strokeStyle = `rgba(255,${190 + hash(i) * 60},90,${1 - dt / .9})`; X.lineWidth = 3; X.beginPath(); X.moveTo(px, py); X.lineTo(px - vx * .02, py - (vy + 3200 * dt) * .02); X.stroke(); }
  X.restore();
  flash(t, 16.6, .35, 1);
  // look de flashback: sépia + riscos de película
  X.save(); X.globalCompositeOperation = 'color'; X.fillStyle = 'rgba(120,50,30,.55)'; X.fillRect(0, 0, W, H); X.restore();
  const fr = Math.floor(t * 30); for (let i = 0; i < 3; i++) if (hash(fr * 3 + i) > .5) { X.fillStyle = 'rgba(255,230,200,.12)'; X.fillRect(hash(fr + i * 7) * W, 0, 2, H); }
  X.fillStyle = `rgba(0,0,0,${.08 * hash(fr)})`; X.fillRect(0, 0, W, H);
};
S.pieta = (t, lt, d) => {
  const p = E.inout(lt / d);
  const img = BG.pieta, s = W / img.width * 1.02; const h = img.height * s; const y = lerp(H - h, -60, 1 - p);
  X.drawImage(img, -(img.width * s - W) / 2, y, img.width * s, h);
  // auréola pulsando
  const hy = y + 120 * s; X.save(); X.strokeStyle = C.ouro; X.lineWidth = 8; X.shadowColor = C.ouro; X.shadowBlur = 40 + 20 * Math.sin(t * 3); X.beginPath(); X.ellipse(540, hy, 130, 36, 0, 0, 7); X.stroke(); X.restore();
  drawRain(t, rainK(t), { slant: .08 });
  const dg = X.createLinearGradient(0, 1000, 0, H); dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(1, 'rgba(0,0,0,.75)'); X.fillStyle = dg; X.fillRect(0, 1000, W, 920);
};
S.parcelas = (t, lt) => {
  X.drawImage(BG.info, 0, 0); drawRain(t, rainK(t), { alpha: .5 });
  const cols = 8, cw = 86, gap = 12, x0 = (W - (cols * cw + (cols - 1) * gap)) / 2, y0 = 540;
  const paid = Math.floor(clamp((t - 26.8) / 1.1) * 31);
  const late = [28.6, 29.0, 29.4].filter(x => t >= x).length;
  for (let i = 0; i < 72; i++) { const cx = x0 + (i % cols) * (cw + gap), cy = y0 + Math.floor(i / cols) * (cw + gap);
    if (i < paid) { box(X, cx, cy, cw, cw, 10, rgba(C.verde, .85)); }
    else if (i < 31 + late && i >= 31) { const bl = Math.sin(t * 12 + i) > 0 ? 1 : .55; X.save(); X.shadowColor = C.alerta; X.shadowBlur = 20; box(X, cx, cy, cw, cw, 10, rgba(C.alerta, bl)); X.restore(); }
    else if (i === 34 && t >= 30.3) { const bl = Math.sin(t * 18) > 0; box(X, cx, cy, cw, cw, 10, bl ? 'rgba(255,59,48,.3)' : null, C.alerta, 4); txt(X, '4ª', cx + cw / 2, cy + cw / 2, '700 34px Oswald', C.alerta); }
    else box(X, cx, cy, cw, cw, 10, null, 'rgba(255,255,255,.14)', 2);
  }
  txt(X, `PAGAS ${paid}`, x0, y0 - 40, '400 30px Mono', C.verde, { align: 'left', ls: '3px' });
  txt(X, 'FALTAM 41', W - x0, y0 - 40, '400 30px Mono', '#9aa8c0', { align: 'right', ls: '3px' });
};
S.corrida = (t, lt) => {
  X.drawImage(BG.parSky, 0, 0);
  const far = BG.parFar, mid = BG.parMid;
  const fx = -((lt * 140) % 1200); X.drawImage(far, fx, 520); X.drawImage(far, fx + 2400, 520);
  const mx = -((lt * 520) % 1200); X.drawImage(mid, mx, 1000); X.drawImage(mid, mx + 2400, 1000);
  // via elevada e guard-rail
  X.fillStyle = '#07060d'; X.fillRect(0, 1640, W, 280);
  X.fillStyle = '#0e0d18'; X.fillRect(0, 1560, W, 26);
  for (let i = 0; i < 12; i++) { const px = ((i * 140 - lt * 1600) % 1680 + 1680) % 1680 - 300; X.fillStyle = '#0e0d18'; X.fillRect(px, 1560, 16, 80); X.fillStyle = rgba(C.ambar, .5); X.fillRect(px + 60, 1700, 70, 6); }
  // rastros de luz
  X.save(); X.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const yy = 1600 + i * 14; const col = i % 2 ? C.mag : C.ciano; const lg = X.createLinearGradient(0, 0, W, 0); lg.addColorStop(0, rgba(col, 0)); lg.addColorStop(.5, rgba(col, .6)); lg.addColorStop(1, rgba(col, 0)); X.fillStyle = lg; X.fillRect(((lt * 900 + i * 300) % 2000) - 1400, yy, 1400, 3); }
  X.restore();
  riderSide(X, 470, 1650 + Math.sin(t * 20) * 2, 1.15, t);
  drawRain(t, rainK(t), { slant: .9, speed: 1.2 });
  // linhas de velocidade
  X.strokeStyle = 'rgba(255,255,255,.12)'; X.lineWidth = 2; for (let i = 0; i < 16; i++) { const yy = 500 + hash(i) * 1300, xx = W - ((lt * 2600 + hash(i + 3) * 2000) % 2200); X.beginPath(); X.moveTo(xx, yy); X.lineTo(xx + 200, yy); X.stroke(); }
};
S.taxa = (t, lt) => {
  X.drawImage(BG.info, 0, 0); drawRain(t, rainK(t), { alpha: .6 });
  // cartão da corrida
  if (t >= 37.3) { const a = t - 37.3, sc = lerp(.6, 1, E.back(clamp(a / .3))); X.save(); X.globalAlpha = clamp(a / .1); X.translate(540, 560); X.scale(sc, sc);
    box(X, -330, -120, 660, 240, 22, 'rgba(10,10,20,.9)', rgba(C.ambar, .6), 3);
    txt(X, 'CORRIDA #88213 · 6,4 KM', 0, -62, '400 30px Mono', '#9aa8c0', { ls: '3px' }); txt(X, 'R$ 9,80', 0, 30, '700 120px Oswald', '#fff'); X.restore(); }
  // barra dividida
  if (t >= 39.0) { const p = E.out(clamp((t - 39.0) / .8)); const bx = 120, bw = 840, by = 780;
    txt(X, 'PRA QUEM VAI O DINHEIRO', 540, by - 50, '400 30px Mono', '#9aa8c0', { ls: '3px' });
    box(X, bx, by, bw, 90, 14, 'rgba(255,255,255,.06)');
    X.save(); X.beginPath(); X.roundRect(bx, by, bw, 90, 14); X.clip();
    X.fillStyle = C.verde; X.fillRect(bx, by, bw * .6 * p, 90); X.fillStyle = C.alerta; X.fillRect(bx + bw * .6, by, bw * .4 * p, 90); X.restore();
    X.globalAlpha = clamp((t - 39.6) / .3);
    txt(X, 'DITO · R$ 5,88', bx + 20, by + 140, '700 44px Oswald', C.verde, { align: 'left' });
    txt(X, 'APP · R$ 3,92', bx + bw - 20, by + 140, '700 44px Oswald', C.alerta, { align: 'right' });
    txt(X, '60%', bx + bw * .3, by + 47, '700 50px Oswald', '#062a14'); txt(X, '40%', bx + bw * .8, by + 47, '700 50px Oswald', '#3a0602');
    X.globalAlpha = 1; }
  flash(t, 44.6, .6, .6, '200,210,255');
};
S.nota = (t, lt, d) => {
  kb(BG.porta, lt / d, 1.0, 1.06, 0, 0, 0, -20);
  drawRain(t, rainK(t), { slant: .15 });
  const dk = clamp((t - 48.8) / .4) * .62; X.fillStyle = `rgba(4,3,8,${dk})`; X.fillRect(0, 0, W, H);
  if (t >= 49.0) { const a = t - 49.0, sc = lerp(.6, 1, E.back(clamp(a / .3)));
    X.save(); X.globalAlpha = clamp(a / .1); X.translate(540, 640); X.scale(sc, sc);
    box(X, -400, -170, 800, 340, 24, 'rgba(10,10,20,.92)', rgba(C.ambar, .5), 3);
    txt(X, 'SUA NOTA', 0, -118, '400 30px Mono', '#9aa8c0', { ls: '4px' });
    const v = t < 57.5 ? '4,71' : (t < 57.9 ? '4,7' + Math.floor(hash(Math.floor(t * 30)) * 9) : '4,69');
    txt(X, `★ ${v}`, 0, -30, '700 110px Oswald', t >= 57.9 ? C.alerta : C.ambar, { glow: rgba(C.ambar, .4) });
    // régua 4,60 a 4,80
    const rx = -330, rw = 660, ry = 80; X.fillStyle = 'rgba(255,255,255,.15)'; X.fillRect(rx, ry, rw, 8);
    const pos = vv => rx + (vv - 4.6) / .2 * rw;
    X.fillStyle = C.alerta; X.fillRect(pos(4.70) - 2, ry - 30, 5, 68); txt(X, 'LIMITE 4,70', pos(4.70), ry + 62, '400 26px Mono', C.alerta);
    const mv = t < 57.5 ? 4.71 : lerp(4.71, 4.69, clamp((t - 57.5) / .4));
    X.save(); X.fillStyle = C.ambar; X.shadowColor = C.ambar; X.shadowBlur = 16; X.beginPath(); X.arc(pos(mv), ry + 4, 14, 0, 7); X.fill(); X.restore();
    txt(X, '4,60', rx, ry + 62, '400 24px Mono', '#7d8aa0'); txt(X, '4,80', rx + rw, ry + 62, '400 24px Mono', '#7d8aa0');
    X.restore(); }
  // avaliação de 1 estrela
  if (t >= 57.0) { const a = t - 57.0, sl = (1 - E.out(clamp(a / .3))) * 120;
    X.save(); X.globalAlpha = clamp(a / .1); X.translate(0, sl);
    box(X, 140, 1330, 800, 130, 18, 'rgba(240,240,248,.96)');
    X.fillStyle = '#c9a45c'; X.beginPath(); X.arc(210, 1395, 34, 0, 7); X.fill();
    txt(X, 'cliente_vip88 avaliou', 270, 1370, '600 32px Oswald', '#222', { align: 'left' });
    txt(X, '★☆☆☆☆', 270, 1420, '700 40px Oswald', C.alerta, { align: 'left' });
    txt(X, '“demorou”', 900, 1420, '400 30px Oswald', '#555', { align: 'right' });
    X.restore(); }
};
S.kitnet = (t, lt, d) => {
  kb(BG.kitnet, lt / d, 1.0, 1.1, 30, 40, -10, 0);
  // luz do anúncio alternando
  const ph = Math.sin(t * 1.3) > 0; X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = ph ? 'rgba(255,46,136,.06)' : 'rgba(25,227,255,.06)'; X.fillRect(0, 0, W, H); X.restore();
  // brilho do LED entre as mãos
  const sc = Math.max(W / 1200, H / 2134) * lerp(1, 1.1, lt / d);
  const lx = W / 2 + (560 - 600) * sc - 10 * (lt / d), ly = H / 2 + (1330 - 1067) * sc;
  X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(lx, ly, 2, lx, ly, 120); g.addColorStop(0, rgba(C.ambar, .9)); g.addColorStop(1, rgba(C.ambar, 0)); X.fillStyle = g; X.beginPath(); X.arc(lx, ly, 120, 0, 7); X.fill(); X.restore();
  // chuva só do lado de fora da janela
  X.save(); X.beginPath(); const wx = W / 2 + (560 - 600) * sc, wy = H / 2 + (380 - 1067) * sc; X.rect(wx, wy, 560 * sc, 900 * sc); X.clip(); drawRain(t, .9, { alpha: .8 }); X.restore();
};
S.pedido = (t, lt) => {
  X.drawImage(BG.bokeh, 0, 0); X.fillStyle = 'rgba(0,0,0,.35)'; X.fillRect(0, 0, W, H);
  drawRain(t, rainK(t), { alpha: .6 });
  // celular
  box(X, 190, 420, 700, 1180, 60, '#07070d', '#2a2c38', 6);
  box(X, 215, 445, 650, 1130, 44, '#0d0e18');
  txt(X, garble('23:47', t, t >= 66 && t < 66.6), 540, 600, '400 150px Mono', '#e8f6ff', { glow: rgba(C.ciano, .4) });
  txt(X, 'QUARTA-FEIRA · GAROA', 540, 690, '400 28px Mono', '#7d8aa0', { ls: '4px' });
  if (t >= 67.0) { const a = t - 67.0, sl = (1 - E.out(clamp(a / .3))) * -80;
    X.save(); X.globalAlpha = clamp(a / .1); X.translate(0, sl);
    box(X, 245, 790, 590, 330, 26, 'rgba(25,25,40,.95)', rgba(C.ambar, .6), 3);
    box(X, 275, 820, 80, 80, 18, C.ambar); txt(X, 'JÁ!', 315, 862, '700 36px Oswald', '#2b1a00');
    txt(X, 'NOVO PEDIDO', 380, 845, '700 44px Oswald', '#fff', { align: 'left' });
    txt(X, garble('#??????', t, true), 380, 890, '400 32px Mono', C.ciano, { align: 'left' });
    txt(X, 'COLETA: —', 280, 960, '400 30px Mono', '#9aa8c0', { align: 'left' });
    txt(X, 'DESTINO: LIBERDADE BAIXA', 280, 1005, '400 30px Mono', '#9aa8c0', { align: 'left' });
    txt(X, 'VALOR: ' + garble('██████', t, true), 280, 1050, '400 30px Mono', C.verde, { align: 'left' });
    X.restore(); }
};
S.beco = (t, lt, d) => {
  kb(BG.beco, lt / d, 1.0, 1.12, 0, 20, 0, -40);
  // vapor
  X.save(); X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const pt = (lt * .25 + i / 8) % 1; const g = X.createRadialGradient(0, 0, 10, 0, 0, 220); g.addColorStop(0, `rgba(180,140,200,${.12 * (1 - pt)})`); g.addColorStop(1, 'rgba(180,140,200,0)'); X.save(); X.translate(820 + Math.sin(i * 3 + lt) * 40, 1650 - pt * 700); X.fillStyle = g; X.beginPath(); X.arc(0, 0, 220, 0, 7); X.fill(); X.restore(); } X.restore();
  // pacote na mão da figura (pulsando ciano)
  const sc = Math.max(W / 1200, H / 2134) * lerp(1, 1.12, lt / d); const ox = W / 2, oy = H / 2 + lerp(20, -40, lt / d);
  const px = ox + (600 - 600) * sc, py = oy + (1230 - 1067) * sc;
  X.save(); X.translate(px, py); const pu = .6 + .4 * Math.sin(t * 6);
  X.shadowColor = C.ciano; X.shadowBlur = 50 * pu; X.fillStyle = '#0e1a22'; X.fillRect(-90, -70, 180, 140); X.shadowBlur = 0;
  X.strokeStyle = rgba(C.ciano, pu); X.lineWidth = 4; X.strokeRect(-90, -70, 180, 140); X.beginPath(); X.moveTo(-90, 0); X.lineTo(90, 0); X.moveTo(0, -70); X.lineTo(0, 70); X.stroke();
  X.fillStyle = C.alerta; X.beginPath(); X.arc(0, 0, 14, 0, 7); X.fill();
  // maço de dinheiro de papel
  if (t >= 77.0) { X.fillStyle = '#7fae86'; X.fillRect(-150, 90, 120, 52); X.fillStyle = '#c9b98a'; X.fillRect(-100, 90, 20, 52); }
  X.restore();
  // olhos ciano no capuz
  const ey = oy + (850 - 1067) * sc; X.save(); X.fillStyle = C.ciano; X.shadowColor = C.ciano; X.shadowBlur = 20; X.globalAlpha = .6 + .4 * (hash(Math.floor(t * 3)) > .1 ? 1 : 0); X.fillRect(ox - 34, ey, 22, 6); X.fillRect(ox + 12, ey, 22, 6); X.restore();
  // Dito em primeiro plano (de costas, cortado)
  person(X, 150, 2250, 1250, { rim: C.mag, rimA: .6, rimClip: [0, -700, 300, 800] });
  X.save(); X.shadowColor = C.ambar; X.shadowBlur = 60; X.fillStyle = '#d99a1c'; X.fillRect(30, 1480, 250, 300); X.restore(); X.strokeStyle = '#7a4c00'; X.lineWidth = 5; X.strokeRect(30, 1480, 250, 300); txt(X, 'JÁ!', 155, 1620, '700 90px Oswald', '#2b1a00');
  drawRain(t, rainK(t), { slant: .12 });
};
S.retrovisor = (t, lt, d) => {
  const vib = Math.sin(t * 50) * 3 + Math.sin(t * 23) * 2; const [sx, sy] = shakeAt(t, 87.6, 26, 4);
  X.save(); X.translate(sx, sy + vib);
  // estrada à frente borrada
  X.fillStyle = '#05040a'; X.fillRect(-50, -50, W + 100, H + 100);
  X.save(); X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const col = [C.mag, C.ciano, C.ambar][i % 3]; const yy = hash(i) * H, len = 300 + hash(i + 1) * 600, xx = ((hash(i + 2) * 3000 - lt * 3000) % 2400 + 2400) % 2400 - 600; X.fillStyle = rgba(col, .25); X.fillRect(xx, yy, len, 3 + hash(i + 3) * 5); } X.restore();
  drawRain(t, rainK(t), { slant: 1.2, speed: 1.4, alpha: .8 });
  // haste e espelho
  X.fillStyle = '#0a0a10'; X.beginPath(); X.moveTo(1080, 1780); X.lineTo(760, 1340); X.lineTo(790, 1320); X.lineTo(1080, 1720); X.fill();
  const mx = 540, my = 1060, mr = 330;
  X.save(); X.beginPath(); X.ellipse(mx, my, mr, mr * .78, -.08, 0, 7); X.clip();
  X.fillStyle = '#0a0812'; X.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
  // estrada atrás no espelho
  X.fillStyle = '#120f1c'; X.beginPath(); X.moveTo(mx - 40, my - 60); X.lineTo(mx + 40, my - 60); X.lineTo(mx + 420, my + 300); X.lineTo(mx - 420, my + 300); X.fill();
  for (let i = 0; i < 6; i++) { const pp = ((lt * .9 + i / 6) % 1); const yy = my - 60 + pp * 360; X.fillStyle = rgba(C.ambar, .6); X.fillRect(mx - 4 - pp * 6, yy, 8 + pp * 12, 14 + pp * 30); }
  for (let i = 0; i < 4; i++) { const pp = ((lt * .6 + i / 4) % 1); X.fillStyle = rgba(C.mag, .5); X.beginPath(); X.arc(mx - 60 - pp * 400, my - 80 - pp * 160, 6 + pp * 18, 0, 7); X.fill(); X.beginPath(); X.fillStyle = rgba(C.ciano, .5); X.arc(mx + 60 + pp * 400, my - 80 - pp * 160, 6 + pp * 18, 0, 7); X.fill(); }
  // perseguidor
  const ap = clamp((t - 85.0) / 5.5); const ps = lerp(.15, .72, E.inout(ap));
  X.save(); X.translate(mx + 30, my + 150); X.scale(ps, ps);
  const hl = X.createRadialGradient(0, 120, 5, 0, 120, 260); hl.addColorStop(0, 'rgba(255,255,240,.95)'); hl.addColorStop(1, 'rgba(255,255,240,0)'); X.fillStyle = hl; X.beginPath(); X.arc(0, 120, 260, 0, 7); X.fill();
  if (t >= 87.2) { const ma = clamp((t - 87.2) / .4);
    X.fillStyle = '#05040a'; X.beginPath(); X.moveTo(-170, 60); X.quadraticCurveTo(-190, -160, -90, -230); X.lineTo(90, -230); X.quadraticCurveTo(190, -160, 170, 60); X.fill();
    X.globalAlpha = ma; X.fillStyle = '#f2efe8'; X.beginPath(); X.ellipse(0, -300, 80, 104, 0, 0, 7); X.fill();
    X.fillStyle = '#0a0a0a'; X.beginPath(); X.ellipse(-30, -315, 20, 8, -.2, 0, 7); X.fill(); X.beginPath(); X.ellipse(30, -315, 20, 8, .2, 0, 7); X.fill();
    X.save(); X.shadowColor = C.alerta; X.shadowBlur = 30; X.fillStyle = C.alerta; X.beginPath(); X.arc(-30, -315, 5, 0, 7); X.fill(); X.beginPath(); X.arc(30, -315, 5, 0, 7); X.fill(); X.restore();
    X.strokeStyle = 'rgba(0,0,0,.25)'; X.lineWidth = 2; X.beginPath(); X.moveTo(0, -260); X.lineTo(0, -220); X.stroke();
    X.fillStyle = '#05040a'; X.beginPath(); X.moveTo(-90, -400); X.quadraticCurveTo(0, -450, 90, -400); X.lineTo(80, -380); X.quadraticCurveTo(0, -410, -80, -380); X.fill(); }
  X.restore();
  X.restore();
  // moldura do espelho
  X.lineWidth = 26; X.strokeStyle = '#15151e'; X.beginPath(); X.ellipse(mx, my, mr, mr * .78, -.08, 0, 7); X.stroke();
  X.lineWidth = 4; X.strokeStyle = rgba(C.ciano, .5); X.beginPath(); X.ellipse(mx, my, mr - 14, mr * .78 - 14, -.08, Math.PI * 1.1, Math.PI * 1.7); X.stroke();
  X.restore();
  // termômetro do pacote
  if (t >= 84.3) { const temp = Math.round(lerp(38, 54, clamp((t - 84.3) / 3.6))); const hot = temp >= 48; const a = clamp((t - 84.3) / .2);
    X.save(); X.globalAlpha = a; box(X, 70, 420, 370, 120, 16, 'rgba(6,6,12,.85)', hot ? C.alerta : C.ambar, 3);
    txt(X, 'PACOTE', 100, 455, '400 28px Mono', '#9aa8c0', { align: 'left', ls: '4px' });
    txt(X, `${temp}°C ▲`, 100, 505, '700 54px Oswald', hot ? C.alerta : C.ambar, { align: 'left', glow: hot ? rgba(C.alerta, .6) : null });
    X.restore(); }
  if (t >= 87.6) { X.fillStyle = `rgba(255,20,20,${.10 + .08 * Math.sin(t * 9)})`; X.fillRect(0, 0, W, H); }
};
S.cta = (t, lt) => {
  S.abertura(t, lt, 10.5, { t0: 90.5, dur: 10.5, noFlash: true });
  X.fillStyle = 'rgba(3,2,8,.68)'; X.fillRect(0, 0, W, H);
  const btn = (t0, x, label, sub, fill, fg) => { if (t < t0) return; const a = t - t0, sc = lerp(.6, 1, E.back(clamp(a / .3))); X.save(); X.globalAlpha = clamp(a / .1); X.translate(x, 1100); X.scale(sc, sc);
    box(X, -200, -70, 400, 140, 22, fill); txt(X, label, 0, -14, '700 64px Oswald', fg); txt(X, sub, 0, 40, '400 26px Oswald', fg === '#fff' ? 'rgba(255,255,255,.7)' : 'rgba(20,12,0,.75)'); X.restore(); };
  btn(96.2, 310, 'ABRE', 'e descobre o que é', C.ambar, '#160d00');
  btn(96.6, 770, 'ENTREGA', 'e pega os R$ 5.000', '#f2efea', '#121212');
  if (t >= 98.0) { const a = t - 98.0, sc = lerp(.7, 1, E.back(clamp(a / .3))); X.save(); X.globalAlpha = clamp(a / .1); X.translate(540, 1330); X.scale(sc, sc);
    box(X, -330, -85, 660, 170, 18, 'rgba(8,8,14,.9)', rgba(C.ambar, .7), 3);
    txt(X, 'PARTE 2', 0, -24, '700 64px Oswald', C.ambar); txt(X, 'a maioria decide o próximo passo', 0, 40, '400 30px Oswald', 'rgba(255,255,255,.75)'); X.restore(); }
};
S.outro = (t, lt) => {
  X.fillStyle = '#050409'; X.fillRect(0, 0, W, H);
  drawRain(t, rainK(t), { alpha: .5 });
  const on = lt < .6 ? (hash(Math.floor(lt * 20)) > .45 ? 1 : .15) : (hash(Math.floor(t * 8)) > .97 ? .4 : 1);
  X.save(); X.globalAlpha = on; txt(X, 'Parcelado', 540, 900, '700 190px Goth', '#f3e6ff', { glow: C.mag, glowB: 50 }); X.restore();
  X.globalAlpha = clamp((lt - .5) / .3); txt(X, 'PARTE 1', 540, 1060, '400 40px Mono', C.ambar, { ls: '10px' });
  txt(X, 'série distopias · nº 1', 540, 1120, '400 30px Mono', '#7d8aa0', { ls: '4px' }); X.globalAlpha = 1;
  const fo = clamp((lt - 2.4) / .6); if (fo > 0) { X.fillStyle = `rgba(0,0,0,${fo})`; X.fillRect(0, 0, W, H); }
};

// ---------- frame ----------
window.renderAt = function (t) {
  const sc = sceneAt(t), lt = t - sc.start, d = sc.end - sc.start;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.shadowBlur = 0; X.filter = 'none';
  X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  S[sc.id](t, lt, d);
  for (const it of TL.texts) { const s2 = sceneAt(it.t); if (s2.id === sc.id) renderText(it, t, sc.end); }
  const hs = hudState(t, sc); if (hs) drawHUD(t, hs);
  post(t);
  // transição: flash curto ao entrar na cena
  if (lt < .1 && sc.start > 0) { X.fillStyle = `rgba(210,220,255,${.28 * (1 - lt / .1)})`; X.fillRect(0, 0, W, H); }
  if (sc.id === 'pedido') { const g = hs && hs.glitch ? 1 : 0; glitch(t, g, 3); }
  if (t < .25) { X.fillStyle = `rgba(0,0,0,${1 - t / .25})`; X.fillRect(0, 0, W, H); }
};
window.setup = async function (tl) {
  TL = tl;
  await Promise.all(['400 40px Oswald', '500 40px Oswald', '600 40px Oswald', '700 40px Oswald', '40px Mono', '700 40px Goth'].map(f => document.fonts.load(f)));
  initRain(); initPost(); buildBGs();
  return true;
};
