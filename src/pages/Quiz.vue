<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MostLeastDrag from '../components/MostLeastDrag.vue'
import { getQuizById } from '../api/quizzes'

// Local quiz support (for quick iteration)
import localQuiz1 from '../../quizzes/quiz1.json'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const loadError = ref('')
const quizDoc = ref(null) // firestore doc (optional)
const quiz = ref(null) // normalized quiz definition

const qIndex = ref(0)
const answers = ref([]) // per question: { mostIdx, leastIdx }
const isFinished = ref(false)

function normalizeQuiz(raw) {
  const candidate = raw?.quiz ?? raw
  if (!candidate || typeof candidate !== 'object') return null
  const questions = Array.isArray(candidate.questions) ? candidate.questions : []
  return { ...candidate, questions }
}

async function load() {
  isLoading.value = true
  loadError.value = ''
  quizDoc.value = null
  quiz.value = null
  qIndex.value = 0
  answers.value = []
  isFinished.value = false

  try {
    if (route.params.slug) {
      const slug = String(route.params.slug || '')
      if (slug !== 'quiz1') throw new Error(`Unknown local quiz: ${slug}`)
      quiz.value = normalizeQuiz(localQuiz1)
      return
    }

    const id = String(route.params.id || '')
    const docData = await getQuizById(id)
    quizDoc.value = docData

    // Common shapes saved by NewQuiz.vue:
    // - doc.aiQuiz (JSON) might be either { quiz: {...} } or {...}
    // - fallback: try to parse aiRawText if needed
    const normalized =
      normalizeQuiz(docData?.aiQuiz) ||
      (() => {
        try {
          return normalizeQuiz(JSON.parse(docData?.aiRawText || ''))
        } catch {
          return null
        }
      })()

    if (!normalized) throw new Error('Quiz JSON is missing or invalid on this document.')
    quiz.value = normalized
  } catch (err) {
    loadError.value = String(err?.message || err)
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
watch(() => route.fullPath, load)

const title = computed(() => quiz.value?.quiz_metadata?.title || quizDoc.value?.name || 'Quiz')
const description = computed(() => quiz.value?.quiz_metadata?.description || '')

const questions = computed(() => Array.isArray(quiz.value?.questions) ? quiz.value.questions : [])
const currentQuestion = computed(() => questions.value[qIndex.value] || null)

const currentAnswer = computed({
  get() {
    return answers.value[qIndex.value] || { mostIdx: null, leastIdx: null }
  },
  set(val) {
    const next = answers.value.slice()
    next[qIndex.value] = { mostIdx: val?.mostIdx ?? null, leastIdx: val?.leastIdx ?? null }
    answers.value = next
  },
})

const canGoNext = computed(() => {
  const a = currentAnswer.value
  return a?.mostIdx !== null && a?.leastIdx !== null && a?.mostIdx !== a?.leastIdx
})

function getWeights() {
  const most = Number(quiz.value?.results_logic?.weights?.most ?? 2)
  const least = Number(quiz.value?.results_logic?.weights?.least ?? -2)
  return {
    most: Number.isFinite(most) ? most : 2,
    least: Number.isFinite(least) ? least : -2,
  }
}

const scoresByTrait = computed(() => {
  const qList = questions.value
  const out = {}
  const weights = getWeights()

  for (let i = 0; i < qList.length; i++) {
    const q = qList[i]
    const a = answers.value[i]
    if (!a || a.mostIdx == null || a.leastIdx == null || a.mostIdx === a.leastIdx) continue

    const opts = Array.isArray(q?.options) ? q.options : []
    const mostTrait = opts[a.mostIdx]?.trait
    const leastTrait = opts[a.leastIdx]?.trait

    if (mostTrait) out[mostTrait] = (out[mostTrait] || 0) + weights.most
    if (leastTrait) out[leastTrait] = (out[leastTrait] || 0) + weights.least
  }

  return out
})

const traitMetaById = computed(() => {
  const list = quiz.value?.quiz_metadata?.traits
  const out = {}
  if (Array.isArray(list)) {
    for (const t of list) {
      if (t?.id) out[t.id] = t
    }
  }
  return out
})

const profileByTrait = computed(() => {
  const list = quiz.value?.results_logic?.profiles
  const out = {}
  if (Array.isArray(list)) {
    for (const p of list) {
      if (p?.trait) out[p.trait] = p
    }
  }
  return out
})

const rankedTraits = computed(() => {
  const scores = scoresByTrait.value
  const ids = Object.keys(scores)
  return ids
    .map((id) => ({ id, score: scores[id] }))
    .sort((a, b) => b.score - a.score)
})

function onNext() {
  if (!canGoNext.value) return
  if (qIndex.value >= questions.value.length - 1) {
    isFinished.value = true
    return
  }
  qIndex.value++
}

function onBack() {
  if (isFinished.value) {
    isFinished.value = false
    return
  }
  if (qIndex.value > 0) qIndex.value--
}

function onRestart() {
  qIndex.value = 0
  answers.value = []
  isFinished.value = false
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <section class="page">
    <div class="top">
      <div>
        <h1 class="h1">{{ title }}</h1>
        <p v-if="description" class="desc">{{ description }}</p>
      </div>
      <div class="topActions">
        <button type="button" class="secondary" @click="goHome">Back to list</button>
      </div>
    </div>

    <p v-if="isLoading">Loading quiz…</p>
    <p v-else-if="loadError" class="error">Failed to load: {{ loadError }}</p>

    <div v-else-if="quiz && !isFinished" class="runner">
      <div class="progress">
        Question {{ qIndex + 1 }} / {{ questions.length }}
      </div>

      <MostLeastDrag
        v-if="currentQuestion"
        v-model="currentAnswer"
        :question="currentQuestion"
      />

      <div class="nav">
        <button type="button" class="secondary" :disabled="qIndex === 0" @click="onBack">
          Back
        </button>
        <button type="button" :disabled="!canGoNext" @click="onNext">
          {{ qIndex === questions.length - 1 ? 'Finish' : 'Next' }}
        </button>
      </div>

      <p v-if="!canGoNext" class="validation">
        Place <b>one</b> card in <b>Most like me</b> and <b>one</b> card in <b>Least like me</b>.
      </p>
    </div>

    <div v-else-if="quiz && isFinished" class="results">
      <h2 class="h2">Results</h2>
      <p class="desc">Ranked by points (Most adds points, Least subtracts points).</p>

      <ol class="ranked">
        <li v-for="row in rankedTraits" :key="row.id" class="rankRow">
          <div class="rankHead">
            <div class="rankName">
              {{ traitMetaById[row.id]?.label || row.id }}
            </div>
            <div class="rankScore">{{ row.score }}</div>
          </div>
          <div v-if="traitMetaById[row.id]?.focus" class="rankSub">
            {{ traitMetaById[row.id]?.focus }}
          </div>
          <div v-if="profileByTrait[row.id]?.description" class="rankBody">
            {{ profileByTrait[row.id]?.description }}
          </div>
        </li>
      </ol>

      <div class="nav">
        <button type="button" class="secondary" @click="onBack">Review answers</button>
        <button type="button" class="secondary" @click="onRestart">Restart</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  max-width: 980px;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
  text-align: left;
}
.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.topActions {
  display: flex;
  gap: 0.5rem;
}
.topActions button {
  white-space: nowrap;
}
.h1 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.15;
}
.h2 {
  margin: 0;
}
.desc {
  margin: 0.4rem 0 0 0;
  opacity: 0.85;
}
.error {
  color: #c00;
  white-space: pre-wrap;
}
.runner {
  display: grid;
  gap: 1rem;
}
.progress {
  opacity: 0.85;
}
.nav {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
button.secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.validation {
  margin: 0;
  opacity: 0.85;
}
.results {
  display: grid;
  gap: 0.75rem;
}
.ranked {
  margin: 0.5rem 0 0 0;
  padding-left: 1.25rem;
  display: grid;
  gap: 0.75rem;
}
.rankRow {
  padding: 0.75rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}
.rankHead {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
}
.rankName {
  font-weight: 700;
}
.rankScore {
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}
.rankSub {
  opacity: 0.85;
  margin-top: 0.25rem;
}
.rankBody {
  margin-top: 0.5rem;
  opacity: 0.95;
}
</style>


