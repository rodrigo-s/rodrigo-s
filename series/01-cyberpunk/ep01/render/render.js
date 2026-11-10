// Uso:
//   node render.js stills <saida_dir> 1.0 7.5 ...   -> PNGs nos tempos dados
//   node render.js video <saida.mp4> [inicio] [fim] -> vídeo mudo (H.264, 30 fps)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8'));
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e));
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(tl => window.setup(tl), tl);
  const grab = async t => {
    const b64 = await page.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93).slice(23); }, t);
    return Buffer.from(b64, 'base64');
  };
  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const s of rest) fs.writeFileSync(path.join(out, `t${(+s).toFixed(2).padStart(7, '0')}.jpg`), await grab(+s));
  } else {
    const t0 = +(rest[0] ?? 0), t1 = +(rest[1] ?? tl.duration), fps = tl.fps;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round((t1 - t0) * fps); const st = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await grab(t0 + i / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - st) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
