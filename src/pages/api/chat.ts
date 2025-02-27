import { OpenAI } from 'openai'
import { StreamingTextResponse, OpenAIStream as AIStream } from 'ai'

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export default async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // Create an OpenAI API client (that's edge friendly!)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: false
  })

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    stream: true,
    messages
  })
  
  // Convert the response into a friendly text-stream
  const stream = AIStream(response)
  
  // Respond with the stream
  return new StreamingTextResponse(stream)
}