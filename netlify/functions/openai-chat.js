exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        // Same-origin in practice, but harmless to include for local/dev tooling.
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed. Use POST.' }),
    }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: 'Missing OPENAI_API_KEY in server environment.',
      }),
    }
  }

  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Invalid JSON body.' }),
    }
  }

  const quizName = typeof body.quizName === 'string' ? body.quizName.trim() : ''

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: 'You are an AI that generates the first question of a quiz.' },
          {
            role: 'user',
            content: `Generate the first question of a quiz.${
              quizName ? ` The quiz name is: "${quizName}".` : ''
            }`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'OpenAI request failed.',
          details: errText || `HTTP ${response.status}`,
        }),
      }
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content ?? ''

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, text }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Server error.', details: String(err) }),
    }
  }
}


