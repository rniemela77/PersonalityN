<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  modelValue: {
    type: Object,
    default: () => ({ mostIdx: null, leastIdx: null }),
  },
})

const emit = defineEmits(['update:modelValue'])

const mostIdx = computed(() => props.modelValue?.mostIdx ?? null)
const leastIdx = computed(() => props.modelValue?.leastIdx ?? null)

const isPickingUp = ref(false)
const isDragging = ref(false)

const options = computed(() => Array.isArray(props.question?.options) ? props.question.options : [])

const poolOptionIdxs = computed(() => {
  const all = options.value.map((_, idx) => idx)
  return all.filter((idx) => idx !== mostIdx.value && idx !== leastIdx.value)
})

function startPickup() {
  isPickingUp.value = true
}

function endPickup() {
  // If an HTML drag is active, some browsers emit pointercancel/pointerup;
  // we keep the highlight on until dragend/drop.
  if (isDragging.value) return
  isPickingUp.value = false
}

function onDragEnd() {
  isDragging.value = false
  isPickingUp.value = false
}

function setMost(idx) {
  const nextLeast = leastIdx.value === idx ? null : leastIdx.value
  emit('update:modelValue', { mostIdx: idx, leastIdx: nextLeast })
}

function setLeast(idx) {
  const nextMost = mostIdx.value === idx ? null : mostIdx.value
  emit('update:modelValue', { mostIdx: nextMost, leastIdx: idx })
}

function clearMost() {
  emit('update:modelValue', { mostIdx: null, leastIdx: leastIdx.value })
}

function clearLeast() {
  emit('update:modelValue', { mostIdx: mostIdx.value, leastIdx: null })
}

function onDragStart(e, idx) {
  startPickup()
  isDragging.value = true
  try {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  } catch {
    // ignore
  }
}

function getDraggedIdx(e) {
  const raw = e?.dataTransfer?.getData?.('text/plain')
  const idx = Number(raw)
  return Number.isFinite(idx) ? idx : null
}

function onDropToMost(e) {
  const idx = getDraggedIdx(e)
  if (idx === null) return
  if (idx < 0 || idx >= options.value.length) return
  setMost(idx)
  onDragEnd()
}

function onDropToLeast(e) {
  const idx = getDraggedIdx(e)
  if (idx === null) return
  if (idx < 0 || idx >= options.value.length) return
  setLeast(idx)
  onDragEnd()
}

function onDropToPool(e) {
  const idx = getDraggedIdx(e)
  if (idx === null) return
  if (idx === mostIdx.value) clearMost()
  if (idx === leastIdx.value) clearLeast()
  onDragEnd()
}

onMounted(() => {
  // Ensure drop zones un-highlight if the user releases the pointer outside the component.
  window.addEventListener('pointerup', endPickup)
  window.addEventListener('pointercancel', endPickup)
  window.addEventListener('blur', endPickup)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerup', endPickup)
  window.removeEventListener('pointercancel', endPickup)
  window.removeEventListener('blur', endPickup)
})
</script>

<template>
  <div class="ml">
    <div class="prompt">
      <div class="scenario">{{ question?.scenario || question?.text || 'Question' }}</div>
      <div class="hint">Drag 1 card to <b>Most like me</b> and 1 card to <b>Least like me</b>.</div>
    </div>

    <div
      class="zone most"
      :class="{ filled: mostIdx !== null, activeDrop: isPickingUp }"
      @dragover.prevent
      @drop.prevent="onDropToMost"
    >
      <div class="zoneTitle">Most like me</div>
      <div v-if="mostIdx === null" class="zoneEmpty">Drop a card here</div>
      <div v-else class="picked">
        <div
          class="card pickedCard"
          draggable="true"
          @pointerdown="startPickup"
          @dragstart="(e) => onDragStart(e, mostIdx)"
          @dragend="onDragEnd"
        >
          {{ options[mostIdx]?.text }}
        </div>
        <button type="button" class="small" @click="clearMost">Remove</button>
      </div>
    </div>

    <div
      class="pool"
      @dragover.prevent
      @drop.prevent="onDropToPool"
    >
      <div class="poolTitle">Choices</div>
      <div class="poolGrid">
        <div
          v-for="idx in poolOptionIdxs"
          :key="idx"
          class="card"
          draggable="true"
          @pointerdown="startPickup"
          @dragstart="(e) => onDragStart(e, idx)"
          @dragend="onDragEnd"
          @dblclick="() => setMost(idx)"
          title="Drag to a zone (double-click assigns to Most)"
        >
          {{ options[idx]?.text }}
        </div>
      </div>
    </div>

    <div
      class="zone least"
      :class="{ filled: leastIdx !== null, activeDrop: isPickingUp }"
      @dragover.prevent
      @drop.prevent="onDropToLeast"
    >
      <div class="zoneTitle">Least like me</div>
      <div v-if="leastIdx === null" class="zoneEmpty">Drop a card here</div>
      <div v-else class="picked">
        <div
          class="card pickedCard"
          draggable="true"
          @pointerdown="startPickup"
          @dragstart="(e) => onDragStart(e, leastIdx)"
          @dragend="onDragEnd"
        >
          {{ options[leastIdx]?.text }}
        </div>
        <button type="button" class="small" @click="clearLeast">Remove</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ml {
  display: grid;
  gap: 1rem;
}
.prompt {
  display: grid;
  gap: 0.35rem;
  text-align: left;
}
.scenario {
  font-size: 1.15rem;
  font-weight: 650;
}
.hint {
  opacity: 0.85;
}
.zone {
  border: 1px dashed rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  padding: 0.9rem;
  text-align: left;
  min-height: 120px;
  background: rgba(255, 255, 255, 0.04);
  transition: border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease;
}
.zone.filled {
  border-style: solid;
}
.zone.activeDrop {
  border-color: rgba(100, 108, 255, 0.55);
  background: rgba(100, 108, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.14);
}
.zoneTitle {
  font-weight: 650;
  margin-bottom: 0.5rem;
}
.zoneEmpty {
  opacity: 0.7;
}
.picked {
  display: grid;
  gap: 0.5rem;
}
.card {
  padding: 0.8rem 0.9rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: grab;
  user-select: none;
  text-align: left;
  transition: background-color 120ms ease, border-color 120ms ease, transform 120ms ease;
}
.card:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}
.card:active {
  transform: translateY(0px);
}
.pickedCard {
  cursor: grab;
}
.pool {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.9rem;
  text-align: left;
}
.poolTitle {
  font-weight: 650;
  margin-bottom: 0.5rem;
}
.poolGrid {
  display: grid;
  gap: 0.6rem;
}
.small {
  justify-self: start;
  padding: 0.35rem 0.6rem;
  font-size: 0.9rem;
}
</style>


