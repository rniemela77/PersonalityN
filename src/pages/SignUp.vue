<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const currentUser = ref(null)

let unsubscribe = null

onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
})

onBeforeUnmount(() => {
  if (typeof unsubscribe === 'function') unsubscribe()
})

async function doSignUp() {
  loading.value = true
  errorMsg.value = ''
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    email.value = ''
    password.value = ''
  } catch (err) {
    errorMsg.value = String(err?.message || err)
  } finally {
    loading.value = false
  }
}

async function doSignOut() {
  loading.value = true
  errorMsg.value = ''
  try {
    await signOut(auth)
  } catch (err) {
    errorMsg.value = String(err?.message || err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <h2>Sign Up</h2>

    <div v-if="currentUser" class="user-info">
      <p>Signed in as: <strong>{{ currentUser.email }}</strong></p>
      <button type="button" @click="doSignOut" :disabled="loading">
        {{ loading ? 'Signing out…' : 'Sign out' }}
      </button>
    </div>

    <div v-else class="form">
      <input type="email" v-model="email" placeholder="Email" autocomplete="email" />
      <input type="password" v-model="password" placeholder="Password" autocomplete="new-password" />
      <button type="button" @click="doSignUp" :disabled="loading || !email || !password">
        {{ loading ? 'Creating account…' : 'Sign up' }}
      </button>
    </div>

    <p v-if="errorMsg" class="error">Error: {{ errorMsg }}</p>
  </div>
</template>

<style scoped>
.page { display: grid; gap: 0.75rem; max-width: 380px; }
.form { display: grid; gap: 0.5rem; }
.user-info { display: flex; align-items: center; gap: 0.75rem; }
.error { color: #c00; white-space: pre-wrap; }
input { padding: 0.5rem 0.6rem; border: 1px solid #d0d0d0; border-radius: 6px; }
button { padding: 0.5rem 0.8rem; }
</style>


