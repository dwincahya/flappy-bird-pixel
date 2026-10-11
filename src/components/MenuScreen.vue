<script setup lang="ts">
import ToyButton from './ToyButton.vue'
import { heroUrl, type HeroId } from '../game'

defineProps<{
  hero: HeroId
  heroes: { id: HeroId; label: string }[]
  best: number
  customUrl: string
  note: string
}>()

const emit = defineEmits<{
  selectHero: [id: HeroId]
  upload: [event: Event]
  play: []
}>()
</script>

<template>
  <Transition leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
    <div class="absolute inset-0 overflow-y-auto">
      <div class="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-6 px-4 py-8 text-center">
        <h1 class="text-4xl leading-[1.4] text-[#ffd93d] outline-text [--ol:#7a3b00]">
          <span v-for="(word, row) in ['Flappy', 'Bird!']" :key="word" class="block">
            <span v-for="(character, index) in word" :key="index" class="inline-block animate-hop" :style="{ animationDelay: (row * 5 + index) * 0.1 + 's' }">{{ character }}</span>
          </span>
        </h1>

        <div class="border-4 border-[#3b2412] bg-[#a8e4ff] p-4 shadow-[0_0_0_4px_#c98a4b,0_0_0_8px_#3b2412,8px_12px_0_rgba(0,0,0,.3)] animate-float">
          <img :src="heroUrl(hero)" class="pixelated size-32" alt="Karakter pilihanmu" />
        </div>

        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="item in heroes" :key="item.id" type="button" :title="item.label"
            class="grid size-16 cursor-pointer place-items-center border-4 border-[#3b2412] transition-transform"
            :class="hero === item.id ? '-translate-y-1 bg-[#ffe066] shadow-[0_6px_0_#3b2412]' : 'bg-[#fbe3a8] shadow-[0_3px_0_#3b2412]'"
            @click="emit('selectHero', item.id)"
          >
            <img :src="heroUrl(item.id)" class="pixelated size-10" alt="" />
          </button>
          <label title="Pakai gambar sendiri" class="grid size-16 cursor-pointer place-items-center border-4 border-dashed border-[#3b2412] bg-[#fbe3a8] text-2xl text-[#3b2412] shadow-[0_3px_0_#3b2412]">
            +<input type="file" accept="image/*" hidden @change="emit('upload', $event)" />
          </label>
        </div>

        <p v-if="note" class="cursor-pointer border-4 border-[#3b2412] bg-[#fbe3a8] px-3 py-2 text-[10px] text-[#d9483b] shadow-[0_4px_0_#3b2412]">{{ note }}</p>
        <ToyButton size="lg" @click="emit('play')">> MAIN</ToyButton>
        <p class="text-[10px] leading-loose outline-text [--s:2px]">Ketuk / klik / SPACE untuk terbang.<br />Makin lama makin sulit!</p>
        <p class="border-4 border-[#3b2412] bg-[#fbe3a8] px-4 py-2 text-xs text-[#3b2412]">Rekor: {{ best }}</p>
      </div>
    </div>
  </Transition>
</template>
