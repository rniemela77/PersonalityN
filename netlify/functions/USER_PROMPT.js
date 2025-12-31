export default function buildUserPrompt(quizName) {
  const safeQuizName = String(quizName || '').trim()

  return `
Generate a personality quiz using the following parameters:

Quiz name: ${safeQuizName || '(not provided)'}

Target audience: general adult audience
Tone: thoughtful, modern, insightful
Question style: situational and preference-based
Personality model: 4 distinct personality types

Use the following JSON schema exactly:

{
  "quiz": {
    "title": string,
    "description": string,
    "personalityTypes": [
      {
        "id": string,
        "name": string,
        "description": string
      }
    ],
    "questions": [
      {
        "id": string,
        "text": string,
        "choices": [
          {
            "id": string,
            "text": string,
            "scores": {
              "<personalityTypeId>": number
            }
          }
        ]
      }
    ]
  }
}

Rules:
- Use short, stable IDs (e.g., "q1", "a1", "analyst")
- Each choice's scores object must contain exactly one personalityTypeId
- Scores must be integers between 0 and 4
- All personalityTypeIds must be defined in personalityTypes
- Question and choice text must be original
- Do not include any text outside the JSON object
`.trim()
}
