import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

/**
 * Creates a new quiz document in Firestore under the `quizzes` collection.
 * Returns the created document reference (including `id`).
 */
export async function createQuiz({
  name,
  firstQuestionText = '',
  aiQuiz = null,
  aiRawText = '',
  ownerUid = null,
  ownerEmail = null,
}) {
  const trimmedName = String(name || '').trim()
  if (!trimmedName) throw new Error('Quiz name is required')

  const docRef = await addDoc(collection(db, 'quizzes'), {
    name: trimmedName,
    firstQuestionText,
    aiQuiz,
    aiRawText,
    ownerUid,
    ownerEmail,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef
}

/**
 * Loads a quiz document from Firestore (returns { id, ...data }).
 */
export async function getQuizById(id) {
  const trimmedId = String(id || '').trim()
  if (!trimmedId) throw new Error('Quiz id is required')

  const snap = await getDoc(doc(db, 'quizzes', trimmedId))
  if (!snap.exists()) throw new Error('Quiz not found')

  return { id: snap.id, ...(snap.data() ?? {}) }
}


