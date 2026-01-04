import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

let _authReadyPromise = null

/**
 * Resolves once Firebase Auth has finished restoring the current session.
 * Returns the current user (or null if signed out).
 *
 * Important: one-shot Firestore reads (getDoc/getDocs) will NOT retry if called
 * before Auth finishes initializing, and may fail with permission-denied when
 * rules require request.auth != null.
 */
export function waitForAuthReady() {
  if (_authReadyPromise) return _authReadyPromise

  _authReadyPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (typeof unsubscribe === 'function') unsubscribe()
      resolve(user || null)
    })
  })

  return _authReadyPromise
}


