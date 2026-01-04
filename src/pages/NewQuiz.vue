<script setup>
import { ref } from 'vue'
import { generateQuiz } from '../api/openaiQuiz'
import { createQuiz } from '../api/quizzes'
import { auth } from '../firebase.js'
import { waitForAuthReady } from '../authReady'

const quizName = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const resultText = ref('')
const resultJson = ref(null)
const savedQuizId = ref('')

async function onStart() {
  isLoading.value = true
  errorMsg.value = ''
  resultText.value = ''
  resultJson.value = null
  savedQuizId.value = ''
  try {
    const user = await waitForAuthReady()
    if (!user) throw new Error('Please sign in before creating a quiz.')

    const aiRawText = await generateQuiz({ quizName: quizName.value })
    resultText.value = aiRawText

    let aiQuiz = null
    let firstQuestionText = ''
    try {
      aiQuiz = JSON.parse(aiRawText)
      firstQuestionText =
        aiQuiz?.quiz?.questions?.[0]?.text ||
        aiQuiz?.questions?.[0]?.text ||
        ''
      resultJson.value = aiQuiz
    } catch {
      // If the model returns non-JSON, we still save raw text for debugging.
    }

    const docRef = await createQuiz({
      name: quizName.value,
      firstQuestionText,
      aiQuiz,
      aiRawText,
      ownerUid: user.uid,
      ownerEmail: user.email || null,
    })
    savedQuizId.value = docRef.id
  } catch (err) {
    errorMsg.value = String(err?.message || err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="page">
    <h1>New Quiz</h1>

    <form class="form" @submit.prevent="onStart">
      <label class="field">
        <div class="label">Name of quiz</div>
        <input
          v-model="quizName"
          type="text"
          placeholder="e.g. Intro to Psychology"
          autocomplete="off"
        />
      </label>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Starting…' : 'Start' }}
      </button>
    </form>

    <p v-if="errorMsg" class="error">Error: {{ errorMsg }}</p>

    <div v-if="resultJson" class="result">
      <h2>Parsed quiz JSON (stored as Firestore object)</h2>
      <pre>{{ JSON.stringify(resultJson, null, 2) }}</pre>
    </div>

    <div v-else-if="resultText" class="result">
      <h2>OpenAI response</h2>
      <pre>{{ resultText }}</pre>
    </div>

    <p v-if="savedQuizId" class="saved">
      Saved quiz id: <code>{{ savedQuizId }}</code>
    </p>
  </section>
</template>

<style scoped>
.page {
  max-width: 720px;
  display: grid;
  gap: 1rem;
}
.form {
  display: grid;
  gap: 0.75rem;
  max-width: 420px;
}
.field {
  display: grid;
  gap: 0.35rem;
}
.label {
  font-weight: 600;
}
input {
  padding: 0.55rem 0.65rem;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
}
button {
  justify-self: start;
  padding: 0.55rem 0.85rem;
}
.error {
  color: #c00;
  white-space: pre-wrap;
}
.result pre {
  white-space: pre-wrap;
  padding: 0.75rem;
  background: #3F3F3F;
  border: 1px solid #646464;
  border-radius: 8px;
}
.saved {
  color: #0a0;
}
</style>


