import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyB9jmkd1c67nrfuRGdYj26dc_7gEgk_cC4',
  authDomain: 'personalityn-4f231.firebaseapp.com',
  projectId: 'personalityn-4f231',
  storageBucket: 'personalityn-4f231.firebasestorage.app',
  messagingSenderId: '89670697022',
  appId: '1:89670697022:web:a39e53c2605e06dea8916f',
  measurementId: 'G-9NJ5BW5VRW'
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null


