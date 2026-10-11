<script setup lang="ts">
withDefaults(defineProps<{ color?: 'orange' | 'purple' | 'green'; size?: 'md' | 'lg' }>(), { color: 'orange', size: 'md' })
const tone = { orange: 'bg-[#f5a623]', purple: 'bg-[#8a63d2]', green: 'bg-[#5fbf3f]' }
</script>

<template>
  <button
    type="button"
    class="cursor-pointer border-4 border-[#3b2412] text-white shadow-[inset_0_4px_0_rgba(255,255,255,.35),inset_0_-4px_0_rgba(0,0,0,.25),0_6px_0_#3b2412] [text-shadow:2px_2px_0_rgba(0,0,0,.4)] hover:brightness-110 focus-visible:outline-4 focus-visible:outline-white active:translate-y-1.5 active:shadow-[inset_0_4px_0_rgba(255,255,255,.35),inset_0_-4px_0_rgba(0,0,0,.25),0_0_0_#3b2412]"
    :class="[tone[color], size === 'lg' ? 'px-10 py-5 text-2xl' : 'px-6 py-3 text-sm']"
  >
    <slot />
  </button>
</template>
