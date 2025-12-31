<script setup>
import { ref } from 'vue'
import { generateFirstQuizQuestion } from '../api/openaiQuiz'

const quizName = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const resultText = ref('')

async function onStart() {
  isLoading.value = true
  errorMsg.value = ''
  resultText.value = ''
  try {
    resultText.value = await generateFirstQuizQuestion({ quizName: quizName.value })
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

    <div v-if="resultText" class="result">
      <h2>OpenAI response</h2>
      <pre>{{ resultText }}</pre>
    </div>
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
</style>


