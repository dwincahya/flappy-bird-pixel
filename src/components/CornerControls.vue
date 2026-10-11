<script setup lang="ts">
defineProps<{ canFullscreen: boolean; muted: boolean }>()
defineEmits<{ fullscreen: []; toggleMute: [] }>()
</script>

<template>
  <div class="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 flex gap-3">
    <button v-if="canFullscreen" type="button" class="cursor-pointer border-4 border-[#3b2412] bg-[#fbe3a8] px-3 py-2 text-[10px] text-[#3b2412] shadow-[0_4px_0_#3b2412] active:translate-y-1 active:shadow-none" aria-label="Layar penuh" @click="$emit('fullscreen')">FULL</button>
    <button type="button" class="cursor-pointer border-4 border-[#3b2412] bg-[#fbe3a8] px-3 py-2 text-[10px] text-[#3b2412] shadow-[0_4px_0_#3b2412] active:translate-y-1 active:shadow-none" :class="muted && 'line-through'" aria-label="Suara" @click="$emit('toggleMute')">SUARA</button>
  </div>
</template>
