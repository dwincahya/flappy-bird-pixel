<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import ToyButton from './components/ToyButton.vue'
import { Engine, HEROES, THEMES, heroUrl, loadCustom, settings, sfx, type Snap } from './game'

const box = 'border-4 border-[#3b2412] bg-[#fbe3a8] text-[#3b2412]'
const frame = 'shadow-[0_0_0_4px_#c98a4b,0_0_0_8px_#3b2412,8px_12px_0_rgba(0,0,0,.3)]'
const chip = 'cursor-pointer border-4 border-[#3b2412] bg-[#fbe3a8] px-3 py-2 text-[10px] text-[#3b2412] shadow-[0_4px_0_#3b2412] active:translate-y-1 active:shadow-none'

const root = ref<HTMLElement>(), cv = ref<HTMLCanvasElement>()
const screen = ref<'menu' | 'game'>('menu')
const snap = reactive<Snap>({ mode: 'menu', score: 0, level: 1 })
const over = ref<{ isNew: boolean } | null>(null)   // kartu "game over", muncul setelah jeda singkat
const banner = ref<{ l: number; name: string } | null>(null), note = ref('')

const theme = computed(() => THEMES[(snap.level - 1) % THEMES.length])
const heroes = computed(() => [...HEROES, ...(settings.customUrl ? [{ id: 'custom' as const, label: 'Gambarmu' }] : [])])
const stars = computed(() => (snap.score >= 15 ? 3 : snap.score >= 5 ? 2 : snap.score >= 1 ? 1 : 0))
const msg = computed(() => ['Yah, nabrak!', 'Hampir! Ayo lagi', 'Keren!', 'Hebat banget!'][stars.value])

let engine: Engine, ro: ResizeObserver, bannerT = 0
const fit = () => engine.resize(root.value!.clientWidth, root.value!.clientHeight)

onMounted(() => {
  engine = new Engine(cv.value!, {
    state: (s) => Object.assign(snap, s),
    levelUp: (l, t) => {
      banner.value = { l, name: t.name }
      clearTimeout(bannerT); bannerT = window.setTimeout(() => (banner.value = null), 1800)
    },
    die: (_s, isNew) => { setTimeout(() => { if (snap.mode === 'dead') over.value = { isNew } }, 900) },
  })
  ro = new ResizeObserver(fit); ro.observe(root.value!); fit(); engine.start()
  addEventListener('keydown', onKey); document.addEventListener('visibilitychange', onHide)
})
onBeforeUnmount(() => {
  engine.stop(); ro.disconnect()
  removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', onHide)
})

function play() { sfx.tap(); over.value = null; screen.value = 'game'; engine.reset() }
function menu() { sfx.tap(); over.value = null; screen.value = 'menu'; engine.toMenu() }
function togglePause() { if (snap.mode === 'play') engine.pause(); else if (snap.mode === 'paused') engine.resume() }
const onHide = () => { if (document.hidden) engine.pause() }

function onKey(e: KeyboardEvent) {
  if (e.repeat) return
  ;(document.activeElement as HTMLElement | null)?.blur()
  if (screen.value === 'menu') { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); play() } return }
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); engine.flap() }
  else if (e.code === 'Enter' && over.value) play()
  else if (e.code === 'KeyP' || e.code === 'Escape') togglePause()
}

async function onFile(e: Event) {
  const el = e.target as HTMLInputElement, f = el.files?.[0]
  el.value = ''
  if (!f) return
  try { await loadCustom(f); sfx.tap() } catch {
    note.value = 'Gambar tidak bisa dibuka'; setTimeout(() => (note.value = ''), 2500)
  }
}

const d = document as any
const canFs = !!(d.fullscreenEnabled || d.webkitFullscreenEnabled)
function fullscreen() {
  const el = document.documentElement as any
  try {
    const on = d.fullscreenElement || d.webkitFullscreenElement
    const r = on ? (d.exitFullscreen || d.webkitExitFullscreen).call(d) : (el.requestFullscreen || el.webkitRequestFullscreen).call(el)
    r?.catch?.(() => {})
  } catch { /* tidak diizinkan */ }
}
</script>

<template>
  <div ref="root" class="fixed inset-0 select-none overflow-hidden bg-[#6ec6ff] font-display text-white">
    <!-- DUNIA PIXEL (langit, desa, warga, tiang, burung) digambar di sini -->
    <canvas ref="cv" class="pixelated absolute bottom-0 left-0 touch-none" @pointerdown.prevent="engine.flap()" />

    <!-- SAAT MAIN -->
    <template v-if="screen === 'game'">
      <div class="pointer-events-none absolute inset-x-0 top-[max(1rem,env(safe-area-inset-top))] flex flex-col items-center gap-3">
        <div :key="snap.score" class="animate-pop text-6xl leading-none outline-text">{{ snap.score }}</div>
        <div :class="box" class="flex flex-col items-center gap-2 px-3 py-2 text-[10px]">
          <span>Level {{ snap.level }}</span>
          <span class="flex gap-1">
            <i v-for="n in 5" :key="n" class="block size-3 border-2 border-[#3b2412]" :class="n <= snap.score % 5 ? 'bg-[#ffd93d]' : 'bg-[#8f5a30]'" />
          </span>
          <span class="text-[8px]">{{ theme.name }}</span>
        </div>
      </div>
      <button v-if="snap.mode === 'play'" type="button" :class="chip" class="absolute left-4 top-[max(1rem,env(safe-area-inset-top))]" aria-label="Jeda" @click="togglePause">II</button>
      <p v-if="snap.mode === 'ready'" class="pointer-events-none absolute inset-x-0 top-[62%] animate-float px-4 text-center text-sm leading-relaxed outline-text">Ketuk untuk terbang!</p>

      <Transition enter-active-class="animate-pop" leave-active-class="transition-opacity duration-500" leave-to-class="opacity-0">
        <p v-if="banner" class="pointer-events-none absolute inset-x-0 top-[28%] px-4 text-center leading-loose outline-text [--ol:#c4561a]">
          <span class="block text-3xl">Level {{ banner.l }}</span><span class="block text-base">{{ banner.name }}</span>
        </p>
      </Transition>

      <div v-if="snap.mode === 'paused'" class="absolute inset-0 grid place-items-center bg-black/40">
        <div class="flex animate-pop flex-col items-center gap-6">
          <h2 class="text-3xl outline-text">Istirahat</h2>
          <ToyButton color="green" @click="togglePause">> Lanjut</ToyButton>
          <ToyButton color="purple" @click="menu">Menu</ToyButton>
        </div>
      </div>

      <div v-if="over" class="absolute inset-0 grid place-items-center bg-black/45 p-6">
        <div :class="[box, frame]" class="flex w-full max-w-xs animate-pop flex-col items-center gap-4 p-5 text-center">
          <h2 class="text-xl leading-snug text-[#d9483b]">{{ msg }}</h2>
          <div class="flex gap-2 text-4xl"><span v-for="n in 3" :key="n" :class="n <= stars ? 'text-[#f5a623]' : 'text-black/20'">★</span></div>
          <p class="text-xs leading-loose">Skor <b class="text-2xl text-[#d9483b]">{{ snap.score }}</b><br />Level {{ snap.level }}</p>
          <p class="bg-[#ffe066] px-3 py-2 text-[10px]">{{ over.isNew ? 'Rekor baru!' : 'Rekor: ' + settings.best }}</p>
          <ToyButton @click="play">> Main Lagi</ToyButton>
          <ToyButton color="purple" @click="menu">Menu</ToyButton>
        </div>
      </div>
    </template>

    <!-- MENU -->
    <Transition leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
      <div v-if="screen === 'menu'" class="absolute inset-0 overflow-y-auto">
        <div class="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-6 px-4 py-8 text-center">
          <h1 class="text-4xl leading-[1.4] text-[#ffd93d] outline-text [--ol:#7a3b00]">
            <span v-for="(w, r) in ['Flappy', 'Bird!']" :key="w" class="block">
              <span v-for="(ch, i) in w" :key="i" class="inline-block animate-hop" :style="{ animationDelay: (r * 5 + i) * 0.1 + 's' }">{{ ch }}</span>
            </span>
          </h1>
          <div :class="[box, frame]" class="animate-float bg-[#a8e4ff] p-4">
            <img :src="heroUrl(settings.hero)" class="pixelated size-32" alt="Karakter pilihanmu" />
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <button
              v-for="h in heroes" :key="h.id" type="button" :title="h.label"
              class="grid size-16 cursor-pointer place-items-center border-4 border-[#3b2412] transition-transform"
              :class="settings.hero === h.id ? '-translate-y-1 bg-[#ffe066] shadow-[0_6px_0_#3b2412]' : 'bg-[#fbe3a8] shadow-[0_3px_0_#3b2412]'"
              @click="settings.hero = h.id; sfx.tap()"
            >
              <img :src="heroUrl(h.id)" class="pixelated size-10" alt="" />
            </button>
            <label title="Pakai gambar sendiri" class="grid size-16 cursor-pointer place-items-center border-4 border-dashed border-[#3b2412] bg-[#fbe3a8] text-2xl text-[#3b2412] shadow-[0_3px_0_#3b2412]">
              +<input type="file" accept="image/*" hidden @change="onFile" />
            </label>
          </div>
          <p v-if="note" :class="chip" class="text-[#d9483b]">{{ note }}</p>
          <ToyButton size="lg" @click="play">> MAIN</ToyButton>
          <p class="text-[10px] leading-loose outline-text [--s:2px]">Ketuk / klik / SPACE untuk terbang.<br />Makin lama makin sulit!</p>
          <p :class="box" class="px-4 py-2 text-xs">Rekor: {{ settings.best }}</p>
        </div>
      </div>
    </Transition>

    <!-- TOMBOL POJOK -->
    <div class="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 flex gap-3">
      <button v-if="canFs" type="button" :class="chip" aria-label="Layar penuh" @click="fullscreen">FULL</button>
      <button type="button" :class="[chip, settings.muted && 'line-through']" aria-label="Suara" @click="settings.muted = !settings.muted">SUARA</button>
    </div>
  </div>
</template>
