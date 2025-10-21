import { Configuration, OpenAIApi } from 'openai-edge'

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export default async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // Create an OpenAI API client (that's edge friendly!)
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY || ''
  })
  const openai = new OpenAIApi(config)

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.createChatCompletion({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-nano',
    stream: true,
    messages
  })
  
  // Return the stream response directly
  return response
}