const files = {
  reading: 'reading.mp3', exploring: 'exploring.mp3', typing: 'typing.mp3',
  tap: 'tap.wav', page: 'page.wav', sparkle: 'sparkle.mp3',
  correct: 'correct.mp3', dreamEntry: 'dreamEntry.mp3'
};
const effectGains = {tap: 0.52, page: 0.82, sparkle: 0.7, correct: 0.85, dreamEntry: 0.65};
const defaults = {music: 0.60, effects: 0.83, muted: false};
const storageKey = 'shalu.audio.v1';
const crossfade = 1.4;
const prefs = {...defaults};

function applySettings(input) {
  if (!input || typeof input !== 'object') return;
  for (const key of ['music', 'effects']) {
    if (Number.isFinite(input[key])) prefs[key] = Math.max(0, Math.min(1, input[key]));
  }
  if (typeof input.muted === 'boolean') prefs.muted = input.muted;
}
try { applySettings(JSON.parse(localStorage.getItem(storageKey))); } catch {}

let context, musicDecoder, musicBus, effectsBus, waking, embedded, media;
let pageAway = false;
let wantedMusic = null, wantsTyping = false, musicVoice = null, typingVoice = null;
const decoded = new Map(), offsets = new Map(), retiring = new Map();
const effects = new Map(), latestEffect = new Map();

function sourceURL(name) {
  if (embedded === undefined) {
    embedded = JSON.parse(document.getElementById('classroom-audio')?.textContent || '{}');
  }
  return embedded[name] || new URL('./audio/' + name, document.baseURI).href;
}
async function bytes(name) {
  const url = sourceURL(name);
  if (url.startsWith('data:')) {
    const binary = atob(url.slice(url.indexOf(',') + 1));
    const result = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) result[i] = binary.charCodeAt(i);
    return result.buffer;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('Audio unavailable');
  return response.arrayBuffer();
}
function buffer(id) {
  if (!decoded.has(id)) {
    // Keep both long, quiet soundtracks at 24 kHz. The hardware context mixes
    // these with full-resolution effects without retaining two 48 kHz copies.
    const decoder = (id === 'reading' || id === 'exploring') ? musicDecoder : context;
    const loading = bytes(files[id]).then(data => decoder.decodeAudioData(data));
    decoded.set(id, loading);
    loading.catch(() => decoded.delete(id));
  }
  return decoded.get(id);
}

function ramp(node, value, seconds) {
  const param = node.gain, time = context.currentTime;
  if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(time);
  else {
    const current = param.value;
    param.cancelScheduledValues(time);
    param.setValueAtTime(current, time);
  }
  if (seconds) param.linearRampToValueAtTime(value, time + seconds);
  else param.setValueAtTime(value, time);
}
function levels(seconds = 0.06) {
  if (media) { media.levels(); return; }
  if (!context) return;
  const duck = wantsTyping && prefs.effects > 0 ? 0.58 : 1;
  ramp(musicBus, prefs.muted ? 0 : prefs.music * 1.75 * duck, seconds);
  ramp(effectsBus, prefs.muted ? 0 : prefs.effects, seconds);
}
function audible() {
  return context?.state === 'running' && !document.hidden && !pageAway && !prefs.muted;
}
function play(id, sample, bus, volume, loop, offset = 0) {
  const source = context.createBufferSource(), gain = context.createGain();
  source.buffer = sample;
  source.loop = loop;
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(bus);
  const started = context.currentTime;
  const voice = {id, source, gain, started, offset, duration: sample.duration};
  source.onended = () => {
    source.disconnect();
    gain.disconnect();
    if (effects.get(id) === voice) effects.delete(id);
    if (retiring.get(id) === voice) retiring.delete(id);
  };
  source.start(started, offset % sample.duration);
  return voice;
}
function stop(voice, seconds = 0.025) {
  if (!voice) return;
  ramp(voice.gain, 0, seconds);
  voice.source.stop(context.currentTime + seconds);
}
function retireMusic(seconds) {
  if (!musicVoice) return;
  const voice = musicVoice;
  offsets.set(voice.id, (voice.offset + context.currentTime - voice.started) % voice.duration);
  retiring.set(voice.id, voice);
  musicVoice = null;
  stop(voice, seconds);
}
async function syncMusic() {
  if (media) { media.music(); return; }
  if (!wantedMusic || prefs.muted || prefs.music === 0) {
    retireMusic(0.12);
    return;
  }
  const id = wantedMusic;
  if (!audible() || musicVoice?.id === id) return;
  try {
    const sample = await buffer(id);
    if (!audible() || !prefs.music || wantedMusic !== id || musicVoice?.id === id) return;
    stop(retiring.get(id), 0.025);
    retireMusic(crossfade);
    musicVoice = play(id, sample, musicBus, 0, true, offsets.get(id) || 0);
    ramp(musicVoice.gain, 1, crossfade);
  } catch { /* A blocked or unsupported track leaves the game playable. */ }
}
async function syncTyping() {
  if (media) { media.typing(); return; }
  if (!wantsTyping || !prefs.effects || !audible()) {
    stop(typingVoice);
    typingVoice = null;
    return;
  }
  if (typingVoice) return;
  try {
    const sample = await buffer('typing');
    if (wantsTyping && prefs.effects && audible() && !typingVoice) {
      typingVoice = play('typing', sample, effectsBus, 1, true, 0.16);
    }
  } catch {}
}
function clearEffects() {
  if (media) { media.clearEffects(); return; }
  latestEffect.clear();
  effects.forEach(voice => stop(voice, 0));
  effects.clear();
}
function resume() {
  if ((!context && !media) || document.hidden || pageAway) return;
  if (context && context.state !== 'running') waking = context.resume().catch(() => {});
  syncMusic();
  syncTyping();
}
function unlock() {
  if (!context && !media) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) { media = mediaPlayback(); resume(); return; }
    try {
      context = new Audio();
      musicBus = context.createGain();
      effectsBus = context.createGain();
      musicBus.connect(context.destination);
      effectsBus.connect(context.destination);
      musicDecoder = context;
      try {
        const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (Offline) musicDecoder = new Offline(2, 1, 24000);
      } catch {}
      levels(0);
      context.onstatechange = () => {
        if (context.state === 'running') {
          if (document.hidden || pageAway) context.suspend().catch(() => {});
          else { syncMusic(); syncTyping(); }
        }
      };
      // Start a silent frame inside the original tap for iPad's audio unlock.
      const first = context.createBufferSource();
      first.buffer = context.createBuffer(1, 1, context.sampleRate);
      first.connect(context.destination);
      first.onended = () => first.disconnect();
      first.start();
    } catch {
      if (context) context.close().catch(() => {});
      context = null;
      media = mediaPlayback();
    }
  }
  resume();
}
async function effect(id) {
  if (!Object.hasOwn(effectGains, id) || document.hidden || pageAway || prefs.muted || !prefs.effects) return;
  if (media) { media.effect(id); return; }
  if (!context) return;
  const request = {at: performance.now()};
  latestEffect.set(id, request);
  try {
    const [sample] = await Promise.all([buffer(id), waking]);
    if (!audible() || !prefs.effects || latestEffect.get(id) !== request || performance.now() - request.at > 900) return;
    stop(effects.get(id));
    const offset = id === 'sparkle' ? 0.18 : 0;
    effects.set(id, play(id, sample, effectsBus, effectGains[id], false, offset));
  } catch {}
}
function background() {
  if (media) { media.pause(); return; }
  if (!context) return;
  clearEffects();
  stop(typingVoice, 0);
  typingVoice = null;
  context.suspend().then(() => { if (!document.hidden && !pageAway) resume(); }).catch(() => {});
}
document.addEventListener('visibilitychange', () => { if (document.hidden) background(); else resume(); });
window.addEventListener('pagehide', () => { pageAway = true; background(); });
window.addEventListener('pageshow', () => { pageAway = false; resume(); });
// An interrupted iPad audio session may require a new real gesture.
for (const event of ['pointerdown', 'keydown']) {
  document.addEventListener(event, () => {
    if (context && context.state !== 'running') resume();
    else if (media) resume();
  }, {capture: true, passive: true});
}

// Some WebKit builds expose media elements without the Web Audio API.
function mediaPlayback() {
  const clips = new Map(), mix = new Map();
  let target = null, fadeTimer = 0, typePlaying = false;
  const active = () => !document.hidden && !pageAway && !prefs.muted;
  function clip(id) {
    if (!clips.has(id)) {
      const el = new Audio(sourceURL(files[id]));
      el.loop = id === 'reading' || id === 'exploring' || id === 'typing';
      clips.set(id, el);
    }
    return clips.get(id);
  }
  function start(el) { el.play()?.catch(() => {}); }
  function seek(el, time) {
    try { el.currentTime = time; } catch {
      el.addEventListener('loadedmetadata', () => { el.currentTime = time; }, {once: true});
    }
  }
  function levels() {
    const duck = wantsTyping && prefs.effects > 0 ? 0.58 : 1;
    for (const [id, el] of clips) {
      const value = mix.has(id)
        ? mix.get(id) * prefs.music * 1.75 * duck
        : (effectGains[id] ?? 1) * prefs.effects;
      el.volume = prefs.muted ? 0 : Math.min(1, value);
    }
  }
  function music() {
    const next = active() && prefs.music ? wantedMusic : null;
    if (target === next) {
      if (next && clip(next).paused) start(clip(next));
      return;
    }
    target = next;
    clearInterval(fadeTimer);
    if (next) {
      const el = clip(next);
      if (!mix.has(next)) mix.set(next, 0);
      levels();
      if (el.paused) start(el);
    }
    const from = new Map(mix), began = performance.now();
    fadeTimer = setInterval(() => {
      const t = Math.min(1, (performance.now() - began) / (crossfade * 1000));
      for (const [id, level] of from) mix.set(id, level * (1 - t) + (id === next ? t : 0));
      levels();
      if (t === 1) {
        clearInterval(fadeTimer);
        for (const id of mix.keys()) if (id !== next) clip(id).pause();
      }
    }, 40);
  }
  function typing() {
    const wanted = Boolean(wantsTyping && active() && prefs.effects);
    if (!wanted) {
      if (typePlaying) clips.get('typing').pause();
    } else {
      const el = clip('typing');
      if (!typePlaying) seek(el, 0.16);
      levels();
      if (el.paused) start(el);
    }
    typePlaying = wanted;
  }
  function effect(id) {
    const el = clip(id);
    levels();
    seek(el, id === 'sparkle' ? 0.18 : 0);
    start(el);
  }
  function clearEffects() {
    for (const id of Object.keys(effectGains)) clips.get(id)?.pause();
  }
  function pause() {
    clearInterval(fadeTimer);
    for (const el of clips.values()) el.pause();
    for (const id of mix.keys()) mix.set(id, 0);
    target = null;
    typePlaying = false;
  }
  return {levels, music, typing, effect, clearEffects, pause};
}

export const sound = {
  unlock, effect,
  get settings() { return {...prefs}; },
  configure(values) {
    applySettings(values);
    try { localStorage.setItem(storageKey, JSON.stringify(prefs)); } catch {}
    levels();
    if (!prefs.effects || prefs.muted) clearEffects();
    syncMusic();
    syncTyping();
  },
  music(id) {
    if (id !== null && id !== 'reading' && id !== 'exploring') return;
    wantedMusic = id;
    syncMusic();
  },
  typing(wanted) {
    wantsTyping = Boolean(wanted);
    levels();
    syncTyping();
  }
};
