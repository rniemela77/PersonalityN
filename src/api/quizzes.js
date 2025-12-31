import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

/**
 * Creates a new quiz document in Firestore under the `quizzes` collection.
 * Returns the created document reference (including `id`).
 */
export async function createQuiz({
  name,
  firstQuestionText = '',
  ownerUid = null,
  ownerEmail = null,
}) {
  const trimmedName = String(name || '').trim()
  if (!trimmedName) throw new Error('Quiz name is required')

  const docRef = await addDoc(collection(db, 'quizzes'), {
    name: trimmedName,
    firstQuestionText,
    ownerUid,
    ownerEmail,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef
}


