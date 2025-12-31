export async function generateFirstQuizQuestion({ quizName }) {
  const resp = await fetch('/.netlify/functions/openai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizName }),
  })

  const data = await resp.json().catch(() => null)

  if (!resp.ok || !data?.ok) {
    const message = data?.error || `Request failed (HTTP ${resp.status})`
    const details = data?.details ? `\n${data.details}` : ''
    throw new Error(`${message}${details}`)
  }

  return data.text || ''
}


