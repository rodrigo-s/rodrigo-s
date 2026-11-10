"""Sintetiza os efeitos sonoros e a ambiência do episódio a partir do timeline.json.
Gera: sfx.wav (efeitos), ambiencia.wav (chuva + drone), mix.wav (os dois juntos). 48 kHz, estéreo.
Uso: python3 synth_audio.py <pasta_saida>
"""
import json, sys, os
import numpy as np
from scipy.signal import butter, sosfilt
import soundfile as sf

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
DUR = TL['duration']
N = int(DUR * SR)
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x)


def noise(d):
    return rng.standard_normal(int(d * SR))


def edec(d, k):
    return np.exp(-t_(d) * k)


def adsr(d, a, r):
    n = int(d * SR); e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e


def sweep(f0, f1, d, kind='exp'):
    tt = t_(d)
    f = f0 * (f1 / f0) ** (tt / d) if kind == 'exp' else np.linspace(f0, f1, len(tt))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def saw(f, d):
    ph = (np.cumsum(np.full(int(d * SR), f) if np.isscalar(f) else f) / SR) % 1.0
    return 2 * ph - 1


def sq(f, d):
    return np.sign(np.sin(2 * np.pi * f * t_(d)))


def norm(x, g=1.0):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * g


# ---------------- efeitos ----------------
def s_pop(pitch=1.0):
    d = .14; x = sweep(950 * pitch, 260 * pitch, d) * edec(d, 30)
    x += hp(noise(d), 3000) * edec(d, 120) * .25
    return norm(x, .5)


def s_blip():
    d = .09; x = np.concatenate([np.sin(2 * np.pi * 1500 * t_(.045)), np.sin(2 * np.pi * 2100 * t_(.045))]) * adsr(d, .003, .02)
    return norm(x, .28)


def s_hud_on():
    d = .32; s = sweep(380, 1700, d); x = (s + .3 * np.sign(s)) * adsr(d, .01, .08) * (0.7 + .3 * np.sin(2 * np.pi * 40 * t_(d)))
    x += bp(noise(d), 2000, 8000) * adsr(d, .01, .1) * .2
    return norm(x, .32)


def s_alarm_blip():
    a = sq(880, .09) * adsr(.09, .003, .02); b = sq(660, .11) * adsr(.11, .003, .03)
    return norm(lp(np.concatenate([a, np.zeros(int(.03 * SR)), b]), 4000), .3)


def s_whoosh(gain=1.0):
    d = .5; x = noise(d); k = np.linspace(0, 1, len(x))
    out = lp(x, 900) * (1 - k) + bp(x, 1500, 6000) * k
    env = np.sin(np.pi * t_(d) / d) ** 2
    return norm(out * env, .45 * gain)


def s_led_alarm():
    one = np.sin(2 * np.pi * 1250 * t_(.07)) * adsr(.07, .002, .02); gap = np.zeros(int(.06 * SR))
    return norm(np.concatenate([one, gap, one, gap, one]), .32)


def s_riser(dur=.5):
    x = hp(noise(dur), 1500) * np.linspace(0, 1, int(dur * SR)) ** 2 + .5 * sweep(200, 900, dur) * np.linspace(0, 1, int(dur * SR))
    return norm(x, .35)


def s_deep_hit(gain=1.0):
    d = 2.2; f = 58 * (38 / 58) ** (t_(d) / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * edec(d, 2.2)
    x += lp(noise(d), 400) * edec(d, 9) * .9 + hp(noise(d), 2000) * edec(d, 40) * .3
    return norm(x, .8 * gain)


def s_factory_alarm(dur=6.0):
    tt = t_(dur); f = np.where((tt % .8) < .4, 440, 554)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)); x = lp(x, 2500) * .5
    x += np.sin(2 * np.pi * 50 * tt) * .25 + lp(noise(dur), 200) * .2
    return norm(x * adsr(dur, .3, .4), .22)


def s_press_slam():
    d = 2.0; th = np.sin(2 * np.pi * np.cumsum(70 * (32 / 70) ** (t_(d) / d)) / SR) * edec(d, 3)
    cl = sum(np.sin(2 * np.pi * f * t_(d)) * edec(d, k) * a for f, k, a in [(523, 2.5, 1), (1187, 3.5, .7), (1879, 4.5, .5), (2711, 6, .4), (3907, 8, .3)])
    cr = hp(noise(d), 1500) * edec(d, 25)
    return norm(th * 1.2 + cl * .35 + cr * .6, .95)


def s_stamp():
    d = .35; th = np.sin(2 * np.pi * np.cumsum(140 * (60 / 140) ** (t_(d) / d)) / SR) * edec(d, 14)
    sl = bp(noise(d), 900, 5000) * edec(d, 45)
    return norm(th + sl * .8, .65)


def s_choir_pad(dur=5.5):
    tt = t_(dur); x = np.zeros_like(tt)
    for f in [110, 220, 261.63, 329.63, 440, 523.25]:
        for det in (-.004, .004):
            vib = 1 + .003 * np.sin(2 * np.pi * 5 * tt + f)
            x += lp(saw(f * (1 + det) * vib, dur), 1400) * .15
    x += bp(noise(dur), 600, 1400) * .05
    return norm(x * adsr(dur, 1.2, 1.5), .22)


def s_bell():
    d = 3.5; f0 = 196
    x = sum(np.sin(2 * np.pi * f0 * r * t_(d)) * edec(d, k) * a for r, k, a in [(.5, .8, .6), (1, 1.1, 1), (1.19, 1.6, .6), (1.5, 1.8, .5), (2, 2.2, .45), (2.5, 2.8, .3), (3, 3.5, .25)])
    return norm(x, .4)


def s_ticks(n=31, dur=1.1):
    x = np.zeros(int((dur + .1) * SR))
    for i in range(n):
        c = np.sin(2 * np.pi * (2200 + i * 25) * t_(.018)) * edec(.018, 200); p = int(i / n * dur * SR); x[p:p + len(c)] += c
    return norm(x, .25)


def s_beep(f=1000, d=.12, g=.3):
    return norm(np.sin(2 * np.pi * f * t_(d)) * adsr(d, .003, .03), g)


def s_bike_pass():
    d = 1.4; tt = t_(d); f = 170 * (100 / 170) ** (tt / d)
    m = lp(saw(f, d), 900) + .4 * np.sin(2 * np.pi * np.cumsum(f * 4) / SR)
    w = bp(noise(d), 400, 3000) * .5
    env = np.exp(-((tt - .55) ** 2) / .08)
    return norm((m + w) * env, .5)


def s_cash():
    d = 1.0; x = sum(np.sin(2 * np.pi * f * t_(d)) * edec(d, 4) * a for f, a in [(2093, 1), (2637, .6), (4186, .3)])
    cl = bp(noise(.06), 1000, 6000) * edec(.06, 60)
    x[:len(cl)] += cl * 1.5
    return norm(x, .35)


def s_slide():
    d = .35; return norm(bp(noise(d), 800, 4000) * np.sin(np.pi * t_(d) / d), .2)


def s_coin_drop():
    x = np.zeros(int(.6 * SR))
    for i, f in enumerate([3200, 2900, 3500]):
        c = np.sin(2 * np.pi * f * t_(.12)) * edec(.12, 35); p = int(i * .11 * SR); x[p:p + len(c)] += c * (1 - i * .25)
    return norm(x, .22)


def s_thunder(gain=1.0):
    d = 4.0; x = np.cumsum(noise(d)); x = hp(x, 20); x = lp(x, 260)
    env = np.zeros(int(d * SR))
    for st, k, a in [(0, 1.3, 1), (.25, 2.5, .7), (.9, 1.8, .6), (1.6, 1.2, .4)]:
        p = int(st * SR); env[p:] += a * np.exp(-np.arange(len(env) - p) / SR * k)
    crack = hp(noise(d), 1500) * edec(d, 18) * .25
    return norm(x * env + crack, .75 * gain)


def s_notify():
    a = np.sin(2 * np.pi * 880 * t_(.14)) * edec(.14, 18); b = np.sin(2 * np.pi * 1320 * t_(.3)) * edec(.3, 10)
    return norm(np.concatenate([a, b]), .3)


def s_star_drop():
    d = .6; return norm(sweep(900, 180, d) * edec(d, 4) + .3 * sweep(1800, 360, d) * edec(d, 6), .32)


def s_warm_pad(dur=6.0):
    tt = t_(dur); x = np.zeros_like(tt)
    for f in [87.31, 130.81, 174.61, 220, 261.63, 329.63]:
        x += np.sin(2 * np.pi * f * tt + np.sin(2 * np.pi * .3 * tt)) * .2
    return norm(lp(x, 1500) * adsr(dur, 1.5, 2.0), .2)


def s_glitch(dur=.5):
    n = int(dur * SR); x = np.zeros(n); i = 0
    while i < n:
        L = int(rng.uniform(.01, .06) * SR); kind = rng.integers(0, 3)
        seg = noise(L / SR) if kind == 0 else sq(rng.uniform(200, 3000), L / SR) if kind == 1 else np.zeros(L)
        seg = np.round(seg * 4) / 4
        m = min(len(seg), n - i); x[i:i + m] = seg[:m]; i += L
    return norm(x, .3)


def s_drone_tension(dur=13.0):
    tt = t_(dur); low = lp(saw(41.2, dur) + saw(41.6, dur), 300)
    hi = (np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 466.2 * tt)) * (.5 + .5 * np.sin(2 * np.pi * 6 * tt)) * .15
    x = low * .6 + hi * np.linspace(.2, 1, len(tt))
    return norm(x * adsr(dur, 2.0, 1.0), .28)


def s_paper():
    d = .4; return norm(bp(noise(d), 1500, 7000) * (np.abs(np.sin(2 * np.pi * 9 * t_(d)))) * adsr(d, .02, .1), .22)


def s_bike_ride(dur=6.5):
    tt = t_(dur); f = 240 + 15 * np.sin(2 * np.pi * .7 * tt)
    whine = np.sin(2 * np.pi * np.cumsum(f) / SR + 2 * np.sin(2 * np.pi * 60 * tt)) * .3
    wind = bp(noise(dur), 200, 2500) * .5; road = lp(noise(dur), 120) * .6
    return norm((whine + wind + road) * adsr(dur, .3, .6), .35)


def s_sizzle(dur=3.0):
    x = hp(noise(dur), 3000) * (rng.random(int(dur * SR)) > .97) * 3 + hp(noise(dur), 5000) * .2
    return norm(x * np.linspace(.1, 1, int(dur * SR)) * adsr(dur, .1, .3), .2)


def s_heartbeat(dur=4.5):
    x = np.zeros(int(dur * SR)); t = 0.0; period = .8
    def thump(g):
        d = .16; return np.sin(2 * np.pi * np.cumsum(70 * (40 / 70) ** (t_(d) / d)) / SR) * edec(d, 22) * g
    while t < dur - .4:
        for off, g in [(0, 1), (.22, .65)]:
            th = thump(g); p = int((t + off) * SR); x[p:p + len(th)] += th[:len(x) - p]
        t += period; period = max(.48, period * .93)
    return norm(lp(x, 300), .7)


def s_reverse_swell(dur=.4):
    x = (bp(noise(dur), 300, 9000) * np.linspace(0, 1, int(dur * SR)) ** 3)
    return norm(x, .4)


def s_stinger():
    d = 2.6; tt = t_(d); hit = s_deep_hit()
    cl = sum(lp(saw(f, d), 1800) for f in [98, 103.8, 146.8, 155.6, 196]) * edec(d, 1.6)
    x = np.zeros(int(d * SR)); x[:len(hit)] += hit[:len(x)]
    return norm(x + cl * .35, .95)


def s_neon_on():
    d = 2.4; tt = t_(d); buzz = lp(saw(120, d), 2500) * .4 + np.sin(2 * np.pi * 60 * tt) * .3
    gate = np.ones(len(tt))
    gt = (tt < .6) & (np.sin(2 * np.pi * 17 * tt) * np.sin(2 * np.pi * 7.3 * tt) < 0)
    gate[gt] = .05
    return norm(buzz * gate * adsr(d, .01, .8), .25)


FX = {
    'pop': lambda e: s_pop(e.get('pitch', 1.0)), 'blip': lambda e: s_blip(), 'hud_on': lambda e: s_hud_on(),
    'alarm_blip': lambda e: s_alarm_blip(), 'whoosh': lambda e: s_whoosh(), 'led_alarm': lambda e: s_led_alarm(),
    'riser': lambda e: s_riser(e.get('dur', .5)), 'deep_hit': lambda e: s_deep_hit(), 'factory_alarm': lambda e: s_factory_alarm(e.get('dur', 6)),
    'press_slam': lambda e: s_press_slam(), 'stamp': lambda e: s_stamp(), 'choir_pad': lambda e: s_choir_pad(e.get('dur', 5.5)),
    'bell': lambda e: s_bell(), 'ticks': lambda e: s_ticks(e.get('n', 31), e.get('dur', 1.1)), 'beep': lambda e: s_beep(),
    'beep_low': lambda e: s_beep(520, .1, .26), 'bike_pass': lambda e: s_bike_pass(), 'cash': lambda e: s_cash(),
    'slide': lambda e: s_slide(), 'coin_drop': lambda e: s_coin_drop(), 'thunder': lambda e: s_thunder(),
    'notify': lambda e: s_notify(), 'star_drop': lambda e: s_star_drop(), 'warm_pad': lambda e: s_warm_pad(e.get('dur', 6)),
    'glitch': lambda e: s_glitch(e.get('dur', .5)), 'drone_tension': lambda e: s_drone_tension(e.get('dur', 13)),
    'paper': lambda e: s_paper(), 'bike_ride': lambda e: s_bike_ride(e.get('dur', 6.5)), 'sizzle': lambda e: s_sizzle(e.get('dur', 3)),
    'heartbeat': lambda e: s_heartbeat(e.get('dur', 4.5)), 'reverse_swell': lambda e: s_reverse_swell(e.get('dur', .4)),
    'stinger': lambda e: s_stinger(), 'neon_on': lambda e: s_neon_on(),
}
PAN = {'whoosh': (-.6, .6), 'bike_pass': (-.9, .9)}


def place(buf, x, t, gain=1.0, pan=0.0, pan_to=None):
    p = int(t * SR); x = x[:max(0, N - p)] * gain
    if pan_to is not None:
        pp = np.linspace(pan, pan_to, len(x))
    else:
        pp = np.full(len(x), pan)
    l = np.cos((pp + 1) * np.pi / 4); r = np.sin((pp + 1) * np.pi / 4)
    buf[p:p + len(x), 0] += x * l * 1.414; buf[p:p + len(x), 1] += x * r * 1.414


def build():
    sfx = np.zeros((N, 2))
    for e in TL['sfx']:
        x = FX[e['type']](e); g = e.get('gain', 1.0)
        if e['type'] in PAN: a, b = PAN[e['type']]; place(sfx, x, e['t'], g, a, b)
        else: place(sfx, x, e['t'], g, (hash(e['type'] + str(e['t'])) % 7 - 3) * .05)

    # ambiência: chuva (com abafamento dentro da kitnet) + drone grave contínuo
    tt = np.arange(N) / SR
    kf = np.array(TL['rain']); level = np.interp(tt, kf[:, 0], kf[:, 1])
    white = np.stack([noise(DUR)[:N], noise(DUR)[:N]], 1)
    bright = np.stack([bp(white[:, c], 400, 9000) for c in (0, 1)], 1)
    dark = np.stack([lp(white[:, c], 900) for c in (0, 1)], 1)
    inside = ((tt >= 60) & (tt < 66)).astype(float)[:, None]
    rain = bright * (1 - inside) * .7 + dark * inside * 1.2
    drops = (rng.random((N, 2)) > .9993) * rng.standard_normal((N, 2)) * 3
    drops = np.stack([hp(drops[:, c], 2500) for c in (0, 1)], 1)
    rain = (rain + drops) * level[:, None]
    drone = lp(saw(55, DUR)[:N] + saw(55.3, DUR)[:N] + .6 * saw(82.4, DUR)[:N], 220) * (.7 + .3 * np.sin(2 * np.pi * .08 * tt))
    hum = lp(noise(DUR)[:N], 150) * .5
    bed = (drone + hum)[:, None] * np.array([[1, 1]])
    bedlvl = np.ones(N); bedlvl[(tt >= 14.5) & (tt < 21)] = .4; bedlvl[(tt >= 101)] = np.linspace(1, 0, int((tt >= 101).sum()))
    amb = norm(rain, .35) + norm(bed * bedlvl[:, None], .16)
    fade = np.ones(N); fl = int(.8 * SR); fade[-fl:] = np.linspace(1, 0, fl); fi = int(.3 * SR); fade[:fi] = np.linspace(0, 1, fi)
    amb *= fade[:, None]; sfx *= fade[:, None]
    return sfx, amb


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    sfx, amb = build()
    mix = sfx + amb
    peak = np.max(np.abs(mix)); g = 10 ** (-3 / 20) / peak
    sf.write(os.path.join(out, 'sfx.wav'), (sfx * g).astype(np.float32), SR, subtype='PCM_24')
    sf.write(os.path.join(out, 'ambiencia.wav'), (amb * g).astype(np.float32), SR, subtype='PCM_24')
    sf.write(os.path.join(out, 'mix.wav'), (mix * g).astype(np.float32), SR, subtype='PCM_24')
    print('ok', out, 'peak antes', round(float(peak), 3))
