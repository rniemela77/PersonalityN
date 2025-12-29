<script setup>
import { ref } from 'vue'
const fnLoading = ref(false)
const fnError = ref('')
const fnResult = ref('')

async function callHello() {
  fnLoading.value = true
  fnError.value = ''
  fnResult.value = ''
  try {
    const res = await fetch('/.netlify/functions/hello?name=Vue')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const data = await res.json()
    fnResult.value = JSON.stringify(data, null, 2)
  } catch (err) {
    fnError.value = String(err)
  } finally {
    fnLoading.value = false
  }
}
</script>

<template>
  <div class="card">
    <button type="button" @click="callHello" :disabled="fnLoading">
      {{ fnLoading ? 'Calling function…' : 'Call Netlify Function' }}
    </button>
    <p v-if="fnError" style="color:#c00">Error: {{ fnError }}</p>
    <pre v-if="fnResult">{{ fnResult }}</pre>
  </div>
</template>

<style scoped>
</style>
