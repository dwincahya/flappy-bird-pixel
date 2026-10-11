import { reactive } from 'vue'

// ============ Tipe & pengaturan ============
export type HeroId = 'bird' | 'chick' | 'cat' | 'unicorn' | 'rocket' | 'custom'
export type Mode = 'menu' | 'ready' | 'play' | 'paused' | 'dead'

const store = (k: string, v?: string): string | null => {
  try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) } catch { /* abaikan */ }
  return null
}
export const HEROES: { id: HeroId; label: string; ch?: string }[] = [
  { id: 'bird', label: 'Burung' }, { id: 'chick', label: 'Anak ayam', ch: '🐥' }, { id: 'cat', label: 'Kucing', ch: '🐱' },
  { id: 'unicorn', label: 'Unicorn', ch: '🦄' }, { id: 'rocket', label: 'Roket', ch: '🚀' },
]
export const settings = reactive({ hero: 'bird' as HeroId, best: Number(store('fb_best')) || 0, muted: false, customUrl: '' })

// ============ Empat musim: berganti tiap naik level ============
export interface Theme {
  name: string; snow?: boolean; skyTop: string; skyBot: string; sun: string; cloud: string; hillFar: string; hillNear: string
  leaf: string; leafDk: string; grass: string; grassLt: string; dirt: string; dirtDk: string
}
export const THEMES: Theme[] = [
  { name: 'Musim Semi', skyTop: '#6ec6ff', skyBot: '#d9f3ff', sun: '#fff27a', cloud: '#ffffff', hillFar: '#9fd8b4', hillNear: '#7cc96a', leaf: '#ffb3d1', leafDk: '#e883b0', grass: '#6fc84a', grassLt: '#9be86a', dirt: '#b57b45', dirtDk: '#8f5a30' },
  { name: 'Musim Panas', skyTop: '#35a9f5', skyBot: '#bfe9ff', sun: '#ffe34d', cloud: '#ffffff', hillFar: '#7fcfb0', hillNear: '#4fb85a', leaf: '#43b83a', leafDk: '#2a8a2e', grass: '#4cc23a', grassLt: '#7bea55', dirt: '#b57b45', dirtDk: '#8f5a30' },
  { name: 'Musim Gugur', skyTop: '#ffae5e', skyBot: '#ffe8b8', sun: '#ffd166', cloud: '#fff4e0', hillFar: '#e0b070', hillNear: '#cc8a45', leaf: '#f0821e', leafDk: '#c4561a', grass: '#b8c94a', grassLt: '#d8e46a', dirt: '#a86f3c', dirtDk: '#84502a' },
  { name: 'Musim Dingin', snow: true, skyTop: '#9fc9ec', skyBot: '#eef7ff', sun: '#fffbe0', cloud: '#ffffff', hillFar: '#d5e6f4', hillNear: '#b4d0e6', leaf: '#cfe7ee', leafDk: '#9fc2d2', grass: '#f4fbff', grassLt: '#ffffff', dirt: '#9a7a5a', dirtDk: '#7a5c40' },
]
const KEYS = ['sun', 'cloud', 'hillFar', 'hillNear', 'leaf', 'leafDk', 'grass', 'grassLt', 'dirt', 'dirtDk'] as const
type Pal = Record<(typeof KEYS)[number], string> & { sky: string[] }
const SKY = 12   // jumlah pita warna langit
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const lerp = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t)
const css = (c: number[]) => `rgb(${c.map(Math.round).join(',')})`
function blend(a: Theme, b: Theme, t: number): Pal {
  const p: any = {}
  for (const k of KEYS) p[k] = css(lerp(rgb(a[k]), rgb(b[k]), t))
  p.sky = Array.from({ length: SKY }, (_, i) => css(lerp(lerp(rgb(a.skyTop), rgb(a.skyBot), i / (SKY - 1)), lerp(rgb(b.skyTop), rgb(b.skyBot), i / (SKY - 1)), t)))
  return p
}

// ============ Suara 8-bit ============
let ac: AudioContext | null = null
function tone(f: number, d = 0.12, type: OscillatorType = 'square', at = 0, v = 0.06) {
  if (settings.muted) return
  try {
    ac = ac || new (window.AudioContext || (window as any).webkitAudioContext)()
    if (ac.state === 'suspended') ac.resume()
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain()
    o.type = type; o.frequency.value = f
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d)
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d)
  } catch { /* suara opsional */ }
}
export const sfx = {
  flap: () => tone(520, 0.07), score: () => tone(990, 0.1), tap: () => tone(440, 0.08), die: () => tone(160, 0.4, 'sawtooth', 0, 0.1),
  level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'square', i * 0.09)),
}

// ============ Karakter pixel 16x16 ============
const sprites = new Map<string, HTMLCanvasElement>()
const urls = new Map<string, string>()
const mk = (w: number, h = w) => Object.assign(document.createElement('canvas'), { width: w, height: h })
const INK: Record<string, string> = { o: '#4a2c12', y: '#ffd93d', Y: '#f29d00', c: '#fff3b0', w: '#ffffff', k: '#222222', r: '#ff6a1a' }
function paint(c: CanvasRenderingContext2D, rows: string[], y0: number) {
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') { c.fillStyle = INK[ch]; c.fillRect(x, y0 + y, 1, 1) } }))
}
const BODY = [
  '.....oooooo.....', '...ooyyyyyyoo...', '..oyyyyyyyyyyo..', '.oyyyyyyyywkyo..', '.oyyyyyyyywkyyo.', '.oyyyyyyyyyyyorr',
  '.oyyyyyyyyyyyorr', '..oyyccccccyyyo.', '..oyyyccccyyyo..', '...ooyyyyyyoo...', '.....oooooo.....',
]
const W_DOWN = ['...oYYYo........', '...oYYYYo.......', '....oYYo........']
const W_UP = ['....oYYo........', '...oYYYYo.......', '...oYYYo........']

// emoji / gambar -> pixel art 16x16 (warna dikurangi + garis tepi gelap)
function pixelate(src: HTMLCanvasElement): HTMLCanvasElement {
  const N = 14, S = 16, t = mk(N), tc = t.getContext('2d', { willReadFrequently: true })!
  tc.imageSmoothingQuality = 'high'; tc.drawImage(src, 0, 0, N, N)
  const d = tc.getImageData(0, 0, N, N).data, px = new Uint8ClampedArray(S * S * 4)
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < S && y < S && px[(y * S + x) * 4 + 3] > 0
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = (y * N + x) * 4, j = ((y + 1) * S + x + 1) * 4
    if (d[i + 3] > 100) { for (let k = 0; k < 3; k++) px[j + k] = Math.round(d[i + k] / 51) * 51; px[j + 3] = 255 }
  }
  const edge: number[] = []
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++)
    if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) edge.push((y * S + x) * 4)
  for (const j of edge) { px[j] = 59; px[j + 1] = 36; px[j + 2] = 18; px[j + 3] = 255 }
  const out = mk(S); out.getContext('2d')!.putImageData(new ImageData(px, S, S), 0, 0)
  return out
}
function emojiCanvas(ch: string, rocket: boolean) {
  const cv = mk(64), c = cv.getContext('2d')!
  c.font = `${rocket ? 42 : 54}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.translate(32, 34)
  if (rocket) c.rotate(Math.PI / 4)   // hidung roket menghadap kanan
  c.fillText(ch, 0, 2)
  return cv
}
function build(id: string): HTMLCanvasElement {
  if (id === 'bird' || id === 'bird1') {
    const cv = mk(16), c = cv.getContext('2d')!
    paint(c, BODY, 2); paint(c, id === 'bird' ? W_DOWN : W_UP, id === 'bird' ? 8 : 4)
    return cv
  }
  return pixelate(emojiCanvas(HEROES.find((x) => x.id === id)!.ch!, id === 'rocket'))
}
export function sprite(id: string) {
  let s = sprites.get(id)
  if (!s) { s = build(id); sprites.set(id, s) }
  return s
}
export function heroUrl(id: HeroId) {
  if (id === 'custom') return settings.customUrl
  let u = urls.get(id)
  if (!u) { u = sprite(id).toDataURL(); urls.set(id, u) }
  return u
}
export function loadCustom(file: File): Promise<void> {
  return new Promise((ok, fail) => {
    const url = URL.createObjectURL(file), img = new Image()
    img.onload = () => {
      const cv = mk(64), c = cv.getContext('2d')!, k = Math.min(64 / img.width, 64 / img.height)
      c.drawImage(img, (64 - img.width * k) / 2, (64 - img.height * k) / 2, img.width * k, img.height * k)
      const px = pixelate(cv)
      URL.revokeObjectURL(url); sprites.set('custom', px); settings.customUrl = px.toDataURL(); settings.hero = 'custom'; ok()
    }
    img.onerror = () => { URL.revokeObjectURL(url); fail(new Error('gambar')) }
    img.src = url
  })
}

// ============ Mesin game: 1 satuan dunia = 1 piksel seni ============
const GRAV = 375, FLAP = 110, FALL = 190, GROUND = 24, BIRD = 16, PW = 22, SPACING = 78, PER_LEVEL = 5
const WOOD = '#b8793c', WOOD_LT = '#dc9c54', WOOD_DK = '#7a4a22', OUT = '#3b2412'
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const mod = (n: number, d: number) => ((n % d) + d) % d
const hit = (cx: number, cy: number, r: number, x1: number, y1: number, x2: number, y2: number) => {
  const dx = cx - clamp(cx, x1, x2), dy = cy - clamp(cy, y1, y2)
  return dx * dx + dy * dy < r * r
}
// warga desa (original, bukan karakter game mana pun): [rambut, baju, celana, topi]
const NPCS = [
  ['#8a4b1f', '#3f7fd9', '#3a4a8a', '#e8c15a'], ['#ff7fb5', '#7ed957', '#8a5a3a', ''], ['#d0d0d8', '#9a6ad9', '#5a4a7a', ''],
  ['#f2c94c', '#ff9a3c', '#3a6a3a', ''], ['#3b2a22', '#d9483b', '#2f2f3f', '#8a8f99'],
]
const HOUSES = [
  { wall: '#f3dcae', roof: '#d9483b', dk: '#a8322c' }, { wall: '#e0b070', roof: '#4a79c4', dk: '#35599a' },
  { wall: '#c8423a', roof: '#8a6a52', dk: '#6a4e3b' }, { wall: '#d6ecb0', roof: '#a8683c', dk: '#85502c' },
]
const CLOUDS = [[0, 14, 1], [0.3, 40, 0.6], [0.55, 62, 1.2], [0.8, 26, 0.8]]

interface Pipe { x: number; base: number; amp: number; ph: number; gap: number; done: boolean }
interface Bit { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; col: string; star: boolean }
export interface Snap { mode: Mode; score: number; level: number }
export interface Hooks { state(s: Snap): void; levelUp(level: number, t: Theme): void; die(score: number, isNew: boolean): void }

export class Engine {
  private cv: HTMLCanvasElement; private ctx: CanvasRenderingContext2D; private hooks: Hooks
  private W = 135; private H = 200
  private mode: Mode = 'menu'
  private pipes: Pipe[] = []; private bits: Bit[] = []
  private bx = 40; private by = 0; private vy = 0
  private score = 0; private off = 0; private nextX = 0; private lastBase = 90
  private t = 0; private shake = 0; private armed = 0; private grace = 0
  private th0 = 0; private th1 = 0; private tt = 1; private pal: Pal = blend(THEMES[0], THEMES[0], 0)
  private raf = 0; private last = 0; private live = false

  constructor(cv: HTMLCanvasElement, hooks: Hooks) { this.cv = cv; this.hooks = hooks; this.ctx = cv.getContext('2d')! }

  start() {
    this.live = true; this.last = performance.now()
    const loop = (now: number) => {
      if (!this.live) return
      const dt = Math.min((now - this.last) / 1000, 0.05); this.last = now
      this.step(dt); this.draw(); this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }
  stop() { this.live = false; cancelAnimationFrame(this.raf) }

  // 1 piksel seni = S piksel layar (bilangan bulat, jadi selalu tajam); dunia minimal 135 x 200 piksel seni
  resize(cw: number, ch: number) {
    if (!cw || !ch) return
    const dpr = devicePixelRatio || 1, dw = cw * dpr, dh = ch * dpr
    const S = Math.max(2, Math.floor(Math.min(dw / 135, dh / 200)))
    const W = Math.ceil(dw / S), H = Math.ceil(dh / S)
    this.cv.width = W; this.cv.height = H
    this.cv.style.width = (W * S) / dpr + 'px'; this.cv.style.height = (H * S) / dpr + 'px'
    const changed = Math.abs(W - this.W) > 1 || Math.abs(H - this.H) > 1
    this.W = W; this.H = H
    if (changed && (this.mode === 'ready' || this.mode === 'play' || this.mode === 'paused')) this.reset()
    if (this.mode === 'dead') this.by = Math.min(this.by, H - GROUND - BIRD * 0.4)
  }
  reset() {
    this.mode = 'ready'; this.pipes = []; this.vy = 0; this.score = 0
    this.bx = clamp(this.W * 0.28, 32, 75); this.by = this.H / 2 - 10; this.lastBase = (this.H - GROUND) / 2
    this.nextX = this.bx + 130
    while (this.nextX <= this.W + 15) { this.spawn(this.nextX); this.nextX += SPACING }
    this.armed = performance.now() + 350   // abaikan ketukan sisa dari menu
    this.theme(0); this.emit()
  }
  toMenu() { this.mode = 'menu'; this.pipes = []; this.score = 0; this.theme(0); this.emit() }
  pause() { if (this.mode === 'play') { this.mode = 'paused'; this.emit() } }
  resume() { if (this.mode === 'paused') { this.mode = 'play'; this.grace = 0.6; this.emit() } }
  flap() {
    if (performance.now() < this.armed || this.mode === 'dead' || this.mode === 'paused' || this.mode === 'menu') return
    if (this.mode === 'ready') { this.mode = 'play'; this.emit() }
    this.vy = -FLAP; sfx.flap()
    for (let i = 0; i < 3; i++) this.bit(this.bx - 7, this.by + 3, '#fff', -15 - Math.random() * 15, 5 + Math.random() * 10, 0.4, 1.5 + Math.random())
  }

  // ---- logika ----
  private get level() { return Math.floor(this.score / PER_LEVEL) + 1 }
  private diff() { return Math.min(this.score, 40) / 40 }   // 0 = mudah ... 1 = paling sulit (skor 40)
  private emit() { this.hooks.state({ mode: this.mode, score: this.score, level: this.level }) }
  private theme(i: number) { this.th0 = this.th1; this.th1 = i; this.tt = 0 }
  private bit(x: number, y: number, col: string, vx: number, vy: number, life: number, r: number, star = false) {
    this.bits.push({ x, y, vx, vy, life, max: life, r, col, star })
  }
  private burst(x: number, y: number, col: string, n: number, star = true) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 30 + Math.random() * 50; this.bit(x, y, col, Math.cos(a) * v, Math.sin(a) * v - 15, 0.8, 1.5 + Math.random() * 1.5, star) }
  }
  private confetti() {
    const cols = ['#ff6fae', '#ffd93d', '#5fbf3f', '#4fc3f7', '#a78bfa', '#ff9a1f']
    for (let i = 0; i < 46; i++) this.bit(Math.random() * this.W, -5 - Math.random() * 25, cols[i % 6], (Math.random() - 0.5) * 30, 20 + Math.random() * 40, 1.8, 1.5 + Math.random() * 1.5, i % 3 === 0)
  }
  private spawn(x: number) {
    const d = this.diff(), gap = 60 - 22 * d   // celah makin sempit
    const lo = 22 + gap / 2, hi = this.H - GROUND - 22 - gap / 2
    const base = clamp(this.lastBase + (Math.random() * 2 - 1) * 42, lo, hi); this.lastBase = base
    const moving = this.score >= 12 && Math.random() < Math.min(0.6, (this.score - 10) / 30)   // tiang naik-turun (ada lampu kuning)
    const amp = moving ? Math.max(0, Math.min(7.5 + d * 10, base - lo, hi - base)) : 0
    this.pipes.push({ x, base, amp, ph: Math.random() * 6.28, gap, done: false })
  }
  private point() {
    this.score++; sfx.score(); this.burst(this.bx, this.by, '#ffd93d', 8)
    if (this.score % PER_LEVEL === 0) {
      const l = this.level, i = (l - 1) % THEMES.length
      this.theme(i); this.confetti(); sfx.level(); this.hooks.levelUp(l, THEMES[i])
    }
    this.emit()
  }
  private die() {
    this.mode = 'dead'; this.vy = -50; this.shake = 3; sfx.die(); this.burst(this.bx, this.by, '#fff', 14, false)
    const isNew = this.score > settings.best
    if (isNew) { settings.best = this.score; store('fb_best', String(this.score)) }
    this.emit(); this.hooks.die(this.score, isNew)
  }

  private step(dt: number) {
    this.t += dt
    if (this.tt < 1) { this.tt = Math.min(1, this.tt + dt / 1.2); this.pal = blend(THEMES[this.th0], THEMES[this.th1], this.tt) }
    if (this.mode === 'paused') return
    this.shake = Math.max(0, this.shake - 15 * dt)
    this.bits = this.bits.filter((p) => { p.life -= dt; p.vy += 150 * dt; p.x += p.vx * dt; p.y += p.vy * dt; return p.life > 0 })
    const gy = this.H - GROUND, floor = gy - BIRD * 0.4
    if (this.mode === 'menu') { this.off += 10 * dt; return }
    if (this.mode === 'ready') { this.by = this.H / 2 - 10 + Math.sin(this.t * 4) * 3; return }
    if (this.mode === 'dead') {   // burung jatuh, dunia berhenti
      if (this.by < floor) { this.vy += GRAV * dt; this.by = Math.min(floor, this.by + this.vy * dt) }
      return
    }
    if (this.grace > 0) { this.grace -= dt; return }
    const sp = 42 + 38 * this.diff(), r = 5   // makin cepat; area tabrak lebih kecil dari gambar = lebih adil
    this.vy = Math.min(this.vy + GRAV * dt, FALL); this.by += this.vy * dt
    if (this.by < BIRD / 2) { this.by = BIRD / 2; if (this.vy < 0) this.vy = 0 }
    this.off += sp * dt; this.nextX -= sp * dt
    if (this.nextX <= this.W + 15) { this.spawn(this.nextX); this.nextX += SPACING }
    let dead = this.by + r >= gy
    for (const p of this.pipes) {
      p.x -= sp * dt; p.ph += 1.6 * dt
      const cy = p.base + p.amp * Math.sin(p.ph), x1 = p.x - PW / 2 - 2, x2 = p.x + PW / 2 + 2
      if (hit(this.bx, this.by, r, x1, -1000, x2, cy - p.gap / 2) || hit(this.bx, this.by, r, x1, cy + p.gap / 2, x2, gy)) dead = true
      if (!p.done && p.x + PW / 2 < this.bx) { p.done = true; this.point() }
    }
    this.pipes = this.pipes.filter((p) => p.x > -PW)
    if (dead) this.die()
  }

  // ---- gambar (semua koordinat dibulatkan = piksel tajam) ----
  private r(x: number, y: number, w: number, h: number, col: string) {
    this.ctx.fillStyle = col; this.ctx.fillRect(Math.round(x), Math.round(y), w, h)
  }
  private each(gap: number, sp: number, fn: (x: number, k: number) => void) {   // ulang objek tiap `gap` piksel dengan paralaks `sp`
    const o = Math.floor(this.off * sp)
    for (let k = Math.floor(o / gap) - 1; k * gap - o < this.W + gap; k++) fn(k * gap - o, k)
  }
  private hill(col: string, h: number, a: number, w: number, sp: number, gy: number) {
    const o = Math.floor(this.off * sp)
    for (let x = -8; x < this.W + 8; x++) {
      const u = x + o, y = Math.round(gy - h - a * Math.sin(u / w) - a * 0.4 * Math.sin(u / (w * 0.43) + 1))
      this.r(x, y, 1, gy - y, col)
    }
  }
  private tree(x: number, gy: number, big: boolean) {
    const R = big ? 9 : 7, cy = gy - 8 - R + 2
    this.r(x - 1, gy - 9, 3, 9, '#7a4a22'); this.r(x + 1, gy - 9, 1, 9, '#5e3a1a')
    for (let dy = -R; dy <= R; dy++) {
      const w = Math.floor(Math.sqrt(R * R - dy * dy))
      this.r(x - w, cy + dy, 2 * w + 1, 1, this.pal.leaf)
      if (dy > 0) this.r(x + 1, cy + dy, w, 1, this.pal.leafDk)
    }
  }
  private house(x: number, gy: number, v: number, snow?: boolean) {
    const h = HOUSES[v], W = v === 2 ? 44 : 36, BH = v === 2 ? 24 : 20, rows = Math.floor((W + 6) / 4)
    this.r(x + W - 10, gy - BH - 12, 4, 10, '#8a7a72'); this.r(x + W - 11, gy - BH - 13, 6, 2, '#a89a92')   // cerobong
    this.r(x, gy - BH, W, BH, h.wall); this.r(x, gy - 2, W, 2, 'rgba(0,0,0,.18)')
    for (let i = 0; i < rows; i++) this.r(x - 3 + i * 2, gy - BH - 1 - i, W + 6 - i * 4, 1, snow && i >= rows / 2 ? '#fff' : i % 2 ? h.roof : h.dk)
    if (v === 2) { this.r(x + W / 2 - 6, gy - 14, 12, 14, '#f5ecd8'); this.r(x + W / 2 - 4, gy - 12, 8, 12, '#9c2f29') }
    else { this.r(x + W / 2 - 3, gy - 12, 6, 12, '#7a4a22'); this.r(x + W / 2 + 1, gy - 6, 1, 1, '#ffd93d') }
    for (const wx of [x + 4, x + W - 11]) {
      this.r(wx, gy - BH + 5, 7, 7, '#6b4a2a'); this.r(wx + 1, gy - BH + 6, 5, 5, '#a8e4ff'); this.r(wx + 3, gy - BH + 6, 1, 5, '#6b4a2a')
    }
  }
  private npc(x: number, gy: number, i: number) {
    const [hair, shirt, pants, hat] = NPCS[mod(i, 5)], f = Math.floor(this.t * 3 + i) % 2
    this.r(x - 2, gy - 4, 2, 4 - f, pants); this.r(x + 1, gy - 4, 2, 3 + f, pants)   // kaki bergantian
    this.r(x - 3, gy - 9, 7, 5, shirt); this.r(x - 4, gy - 9, 1, 4, shirt); this.r(x + 4, gy - 9, 1, 4, shirt)
    this.r(x - 2, gy - 14, 5, 5, '#f5c7a0'); this.r(x - 3, gy - 15, 7, 3, hair); this.r(x - 3, gy - 13, 1, 3, hair); this.r(x + 3, gy - 13, 1, 3, hair)
    this.r(x - 1, gy - 12, 1, 1, '#2b1d14'); this.r(x + 1, gy - 12, 1, 1, '#2b1d14')
    if (hat) { this.r(x - 4, gy - 16, 9, 1, hat); this.r(x - 2, gy - 18, 5, 2, hat) }
  }
  private fence(x: number, gy: number, n: number) {
    for (let i = 0; i < n; i++) this.r(x + i * 6, gy - 7, 2, 7, '#a8743c')
    this.r(x, gy - 6, n * 6 - 4, 1, '#c28a4c'); this.r(x, gy - 3, n * 6 - 4, 1, '#c28a4c')
  }
  private post(x: number, y: number, w: number, h: number, cap: boolean, lamp: boolean, snow: boolean) {   // tiang kayu
    this.r(x - 1, y - 1, w + 2, h + 2, OUT); this.r(x, y, w, h, WOOD); this.r(x + 2, y, 2, h, WOOD_LT); this.r(x + w - 4, y, 3, h, WOOD_DK)
    if (cap) { this.r(x + 2, y + 3, 1, 1, OUT); this.r(x + w - 3, y + 3, 1, 1, OUT) } else { this.r(x + 8, y, 1, h, WOOD_DK); this.r(x + 14, y, 1, h, WOOD_DK) }
    if (lamp) { this.r(x + w / 2 - 3, y + 1, 6, 6, OUT); this.r(x + w / 2 - 2, y + 2, 4, 4, '#fff176') }
    if (snow) this.r(x - 1, y - 3, w + 2, 3, '#fff')
  }

  private draw() {
    const c = this.ctx, W = this.W, gy = this.H - GROUND, p = this.pal, th = THEMES[this.tt > 0.5 ? this.th1 : this.th0]
    c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false; c.clearRect(0, 0, W, this.H)
    if (this.shake > 0.3) c.translate(Math.round((Math.random() - 0.5) * this.shake * 2), Math.round((Math.random() - 0.5) * this.shake * 2))

    const bh = Math.ceil((gy + 8) / SKY)   // langit berpita
    p.sky.forEach((col, i) => this.r(-8, -8 + i * bh, W + 16, bh, col))
    const sx = W - 28, sy = 30   // matahari pixel
    for (let dy = -8; dy <= 8; dy++) { const w = Math.floor(Math.sqrt(64 - dy * dy)); this.r(sx - w, sy + dy, 2 * w + 1, 1, p.sun) }
    for (const [dx, dy] of [[0, -13], [0, 12], [-13, 0], [12, 0], [-10, -10], [9, -10], [-10, 9], [9, 9]]) this.r(sx + dx - 1, sy + dy - 1, 2, 2, p.sun)
    for (const [ph, y, s] of CLOUDS) {
      const span = W + 70, x = Math.floor(mod(ph * span - this.t * 4 * s, span)) - 35
      ;[[8, 14], [3, 26], [0, 32], [2, 28]].forEach(([dx, w], i) => this.r(x + dx, y + i * 2, w, 2, p.cloud))
    }
    this.hill(p.hillFar, 62, 14, 40, 0.1, gy); this.hill(p.hillNear, 30, 8, 28, 0.25, gy)

    // desa: rumah, pohon, pagar, dan warga
    this.each(190, 0.5, (x, k) => {
      this.tree(x + 8, gy, true); this.house(x + 20, gy, mod(k * 2, 4), th.snow); this.npc(x + 72, gy, k * 2); this.fence(x + 82, gy, 4)
      this.tree(x + 112, gy, false); this.house(x + 124, gy, mod(k * 2 + 1, 4), th.snow); this.npc(x + 176, gy, k * 2 + 1)
    })

    for (const q of this.pipes) {
      const cy = q.base + q.amp * Math.sin(q.ph), x = Math.round(q.x - PW / 2), t = Math.round(cy - q.gap / 2), b = Math.round(cy + q.gap / 2), mv = q.amp > 0
      this.post(x, -10, PW, t + 2, false, false, false); this.post(x - 2, t - 8, PW + 4, 8, true, mv, false)
      this.post(x, b + 8, PW, gy - b - 8, false, false, false); this.post(x - 2, b, PW + 4, 8, true, mv, !!th.snow)
    }

    this.r(-8, gy, W + 16, GROUND + 8, p.dirt)   // tanah
    this.each(16, 1, (x, k) => this.r(x + mod(k * 5, 9), gy + 8 + mod(k * 7, 13), 3, 1, p.dirtDk))
    this.r(-8, gy, W + 16, 5, p.grass); this.r(-8, gy + 5, W + 16, 1, p.dirtDk)
    this.each(7, 1, (x, k) => { if (k % 3) this.r(x, gy - 2 + (k % 2), 1, 2, p.grassLt) })
    if (!th.snow) this.each(40, 1, (x, k) => {   // bunga kecil
      const col = ['#ff6fae', '#ffffff', '#ffd93d'][mod(k, 3)]
      this.r(x + 1, gy - 4, 1, 3, col); this.r(x, gy - 3, 3, 1, col); this.r(x + 1, gy - 3, 1, 1, '#ff9a1f')
    })

    if (this.mode !== 'menu') {   // burung (terbalik kalau nabrak)
      const up = this.mode === 'play' ? this.vy < -20 : this.mode === 'ready' ? Math.floor(this.t * 8) % 2 === 1 : false
      const s = sprite(settings.hero === 'bird' ? (up ? 'bird1' : 'bird') : settings.hero), x = Math.round(this.bx - 8), y = Math.round(this.by - 8)
      if (this.mode === 'dead') { c.save(); c.translate(0, 2 * y + 16); c.scale(1, -1); c.drawImage(s, x, y); c.restore() } else c.drawImage(s, x, y)
    }
    for (const b of this.bits) {
      const s = Math.max(1, Math.round(b.r * (0.4 + (0.6 * b.life) / b.max))), x = Math.round(b.x), y = Math.round(b.y)
      if (b.star) { this.r(x - s, y, 2 * s + 1, 1, b.col); this.r(x, y - s, 1, 2 * s + 1, b.col) } else this.r(x, y, s, s, b.col)
    }
  }
}
