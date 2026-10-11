<script setup lang="ts">
import ToyButton from './ToyButton.vue'
import type { Snap, Theme } from '../game'

defineProps<{
  snap: Snap
  theme: Theme
  over: { isNew: boolean } | null
  banner: { l: number; name: string } | null
  stars: number
  message: string
  best: number
}>()

defineEmits<{ flap: []; pause: []; menu: []; play: [] }>()
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 top-[max(1rem,env(safe-area-inset-top))] flex flex-col items-center gap-3">
    <div :key="snap.score" class="animate-pop text-6xl leading-none outline-text">{{ snap.score }}</div>
    <div class="flex flex-col items-center gap-2 border-4 border-[#3b2412] bg-[#fbe3a8] px-3 py-2 text-[10px] text-[#3b2412]">
      <span>Level {{ snap.level }}</span>
      <span class="flex gap-1">
        <i v-for="n in 5" :key="n" class="block size-3 border-2 border-[#3b2412]" :class="n <= snap.score % 5 ? 'bg-[#ffd93d]' : 'bg-[#8f5a30]'" />
      </span>
      <span class="text-[8px]">{{ theme.name }}</span>
    </div>
  </div>

  <button v-if="snap.mode === 'play'" type="button" class="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] cursor-pointer border-4 border-[#3b2412] bg-[#fbe3a8] px-3 py-2 text-[10px] text-[#3b2412] shadow-[0_4px_0_#3b2412] active:translate-y-1 active:shadow-none" aria-label="Jeda" @click="$emit('pause')">II</button>
  <p v-if="snap.mode === 'ready'" class="pointer-events-none absolute inset-x-0 top-[62%] animate-float px-4 text-center text-sm leading-relaxed outline-text">Ketuk untuk terbang!</p>

  <Transition enter-active-class="animate-pop" leave-active-class="transition-opacity duration-500" leave-to-class="opacity-0">
    <p v-if="banner" class="pointer-events-none absolute inset-x-0 top-[28%] px-4 text-center leading-loose outline-text [--ol:#c4561a]">
      <span class="block text-3xl">Level {{ banner.l }}</span><span class="block text-base">{{ banner.name }}</span>
    </p>
  </Transition>

  <div v-if="snap.mode === 'paused'" class="absolute inset-0 grid place-items-center bg-black/40">
    <div class="flex animate-pop flex-col items-center gap-6">
      <h2 class="text-3xl outline-text">Istirahat</h2>
      <ToyButton color="green" @click="$emit('pause')">> Lanjut</ToyButton>
      <ToyButton color="purple" @click="$emit('menu')">Menu</ToyButton>
    </div>
  </div>

  <div v-if="over" class="absolute inset-0 grid place-items-center bg-black/45 p-6">
    <div class="flex w-full max-w-xs animate-pop flex-col items-center gap-4 border-4 border-[#3b2412] bg-[#fbe3a8] p-5 text-center text-[#3b2412] shadow-[0_0_0_4px_#c98a4b,0_0_0_8px_#3b2412,8px_12px_0_rgba(0,0,0,.3)]">
      <h2 class="text-xl leading-snug text-[#d9483b]">{{ message }}</h2>
      <div class="flex gap-2 text-4xl"><span v-for="n in 3" :key="n" :class="n <= stars ? 'text-[#f5a623]' : 'text-black/20'">★</span></div>
      <p class="text-xs leading-loose">Skor <b class="text-2xl text-[#d9483b]">{{ snap.score }}</b><br />Level {{ snap.level }}</p>
      <p class="bg-[#ffe066] px-3 py-2 text-[10px]">{{ over.isNew ? 'Rekor baru!' : 'Rekor: ' + best }}</p>
      <ToyButton @click="$emit('play')">> Main Lagi</ToyButton>
      <ToyButton color="purple" @click="$emit('menu')">Menu</ToyButton>
    </div>
  </div>
</template>
