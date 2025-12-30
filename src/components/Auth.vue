<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

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

async function doSignIn() {
  loading.value = true
  errorMsg.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
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
  <div class="auth-card">
    <h2>Auth</h2>

    <div v-if="currentUser" class="user-info">
      <p>Signed in as: <strong>{{ currentUser.email }}</strong></p>
      <button type="button" @click="doSignOut" :disabled="loading">
        {{ loading ? 'Signing out…' : 'Sign out' }}
      </button>
    </div>

    <div v-else class="auth-forms">
      <input
        type="email"
        placeholder="Email"
        v-model="email"
        autocomplete="email"
      />
      <input
        type="password"
        placeholder="Password"
        v-model="password"
        autocomplete="current-password"
      />
      <div class="actions">
        <button type="button" @click="doSignIn" :disabled="loading || !email || !password">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
        <button type="button" @click="doSignUp" :disabled="loading || !email || !password">
          {{ loading ? 'Creating account…' : 'Sign up' }}
        </button>
      </div>
    </div>

    <p v-if="errorMsg" class="error">Error: {{ errorMsg }}</p>
  </div>
</template>

<style scoped>
.auth-card {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e2e2e2;
  border-radius: 8px;
}
.auth-forms {
  display: grid;
  gap: 0.5rem;
  max-width: 360px;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.error {
  color: #c00;
  margin-top: 0.5rem;
  white-space: pre-wrap;
}
input {
  padding: 0.5rem 0.6rem;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
}
button {
  padding: 0.5rem 0.8rem;
}
</style>


