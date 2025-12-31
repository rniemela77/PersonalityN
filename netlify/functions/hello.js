export const handler = async (event, context) => {
  const name =
    (event && event.queryStringParameters && event.queryStringParameters.name) || 'Netlify'
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `Hello, ${name}!!!`, ok: true }),
  }
}


