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

const isPickingUp = ref(false) // highlights drop zones while the user is dragging a card
const isDragging = ref(false)
const draggingIdx = ref(null) // option index being dragged (pointer-based)
const hoverTarget = ref(null) // 'most' | 'least' | 'pool' | null
const dragPos = ref({ x: 0, y: 0 })
const dragOffset = ref({ x: 0, y: 0 })

const options = computed(() => Array.isArray(props.question?.options) ? props.question.options : [])

const poolOptionIdxs = computed(() => {
  const all = options.value.map((_, idx) => idx)
  return all.filter((idx) => idx !== mostIdx.value && idx !== leastIdx.value)
})

function startPickup() {
  isPickingUp.value = true
}

function endPickup() {
  isPickingUp.value = false
}

function onDragEnd() {
  isDragging.value = false
  isPickingUp.value = false
  draggingIdx.value = null
  hoverTarget.value = null
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

function getTargetFromPoint(x, y) {
  const el = document.elementFromPoint(x, y)
  if (!el) return null
  if (el.closest?.('.zone.most')) return 'most'
  if (el.closest?.('.zone.least')) return 'least'
  if (el.closest?.('.pool')) return 'pool'
  return null
}

function onPointerDownCard(e, idx) {
  // Only left click for mouse.
  if (e?.pointerType === 'mouse' && e?.button !== 0) return
  if (idx == null) return

  // Prevent the browser from treating the gesture as a scroll (mobile) or text-selection.
  // This is the key change to avoid “hold then drag” behavior on touch devices.
  e.preventDefault?.()

  startPickup()
  isDragging.value = true
  draggingIdx.value = idx

  const rect = e.currentTarget?.getBoundingClientRect?.()
  if (rect) {
    dragOffset.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  } else {
    dragOffset.value = { x: 24, y: 24 }
  }
  dragPos.value = { x: e.clientX, y: e.clientY }
  hoverTarget.value = getTargetFromPoint(e.clientX, e.clientY)

  try {
    e.currentTarget?.setPointerCapture?.(e.pointerId)
  } catch {
    // ignore
  }
}

function onGlobalPointerMove(e) {
  if (!isDragging.value || draggingIdx.value == null) return
  e.preventDefault?.()
  dragPos.value = { x: e.clientX, y: e.clientY }
  hoverTarget.value = getTargetFromPoint(e.clientX, e.clientY)
}

function onGlobalPointerUp(e) {
  if (!isDragging.value || draggingIdx.value == null) return
  e.preventDefault?.()

  const idx = draggingIdx.value
  const target = getTargetFromPoint(e.clientX, e.clientY) || hoverTarget.value

  if (target === 'most') setMost(idx)
  else if (target === 'least') setLeast(idx)
  else if (target === 'pool') {
    if (idx === mostIdx.value) clearMost()
    if (idx === leastIdx.value) clearLeast()
  }

  onDragEnd()
}

onMounted(() => {
  // Ensure drop zones un-highlight if the user releases the pointer outside the component.
  window.addEventListener('pointermove', onGlobalPointerMove, { passive: false })
  window.addEventListener('pointerup', onGlobalPointerUp, { passive: false })
  window.addEventListener('pointercancel', onGlobalPointerUp, { passive: false })
  window.addEventListener('blur', endPickup)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onGlobalPointerMove)
  window.removeEventListener('pointerup', onGlobalPointerUp)
  window.removeEventListener('pointercancel', onGlobalPointerUp)
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
      :class="{ filled: mostIdx !== null, activeDrop: isPickingUp, hovered: hoverTarget === 'most' }"
    >
      <div class="zoneTitle">Most like me</div>
      <div v-if="mostIdx === null" class="zoneEmpty">Drop a card here</div>
      <div v-else class="picked">
        <div
          class="card pickedCard"
          :class="{ dragging: draggingIdx === mostIdx }"
          @pointerdown="(e) => onPointerDownCard(e, mostIdx)"
        >
          {{ options[mostIdx]?.text }}
        </div>
        <button type="button" class="small" @click="clearMost">Remove</button>
      </div>
    </div>

    <div
      class="pool"
      :class="{ hovered: hoverTarget === 'pool' }"
    >
      <div class="poolTitle">Choices</div>
      <div class="poolGrid">
        <div
          v-for="idx in poolOptionIdxs"
          :key="idx"
          class="card"
          :class="{ dragging: draggingIdx === idx }"
          @pointerdown="(e) => onPointerDownCard(e, idx)"
          @dblclick="() => setMost(idx)"
          title="Drag to a zone (double-click assigns to Most)"
        >
          {{ options[idx]?.text }}
        </div>
      </div>
    </div>

    <div
      class="zone least"
      :class="{ filled: leastIdx !== null, activeDrop: isPickingUp, hovered: hoverTarget === 'least' }"
    >
      <div class="zoneTitle">Least like me</div>
      <div v-if="leastIdx === null" class="zoneEmpty">Drop a card here</div>
      <div v-else class="picked">
        <div
          class="card pickedCard"
          :class="{ dragging: draggingIdx === leastIdx }"
          @pointerdown="(e) => onPointerDownCard(e, leastIdx)"
        >
          {{ options[leastIdx]?.text }}
        </div>
        <button type="button" class="small" @click="clearLeast">Remove</button>
      </div>
    </div>

    <!-- pointer-based drag ghost (helps on mobile where there is no native drag preview) -->
    <div
      v-if="isDragging && draggingIdx !== null"
      class="dragGhost"
      :style="{
        left: `${dragPos.x - dragOffset.x}px`,
        top: `${dragPos.y - dragOffset.y}px`,
      }"
    >
      {{ options[draggingIdx]?.text }}
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
.zone.hovered,
.pool.hovered {
  border-color: rgba(100, 108, 255, 0.75);
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.18);
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
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: none; /* critical: prevent scroll/pull-to-refresh during drag on mobile */
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
.card.dragging {
  opacity: 0.55;
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

.dragGhost {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  max-width: min(520px, calc(100vw - 2rem));
  padding: 0.8rem 0.9rem;
  border-radius: 10px;
  background: rgba(36, 36, 36, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
</style>


