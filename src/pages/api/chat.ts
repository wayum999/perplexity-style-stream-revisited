import { OpenAI } from 'openai'

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export default async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // Create an OpenAI API client (that's edge friendly!)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: false
  })

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    stream: true,
    messages
  })
  
  // Create a readable stream from the response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Callback for each token in the stream
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          // Send the content as a stream
          controller.enqueue(encoder.encode(content))
        }
      }
      controller.close()
    }
  })
  
  // Return the stream as a text response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}