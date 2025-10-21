import React, { useState, useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { AiOutlineArrowUp } from "react-icons/ai";
import Head from "next/head";
import { Analytics } from '@vercel/analytics/react';
import { nanoid } from 'nanoid';

// Define message interfaces
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}


// Define a function to handle chunking of messages
function chunkString(str: string): Array<{ type: 'text' | 'newline', content: string }> {
  const chunks: Array<{ type: 'text' | 'newline', content: string }> = [];
  const lines = str.split('\n');

  lines.forEach((line, lineIndex) => {
    if (line) {
      // Split line into words and preserve spaces
      const words = line.split(' ');
      words.forEach((word, wordIndex) => {
        if (word) {
          chunks.push({ type: 'text', content: word });
        }
        // Add space after word (except for last word in line)
        if (wordIndex < words.length - 1) {
          chunks.push({ type: 'text', content: ' ' });
        }
      });
    }
    // Add newline (except after last line)
    if (lineIndex < lines.length - 1) {
      chunks.push({ type: 'newline', content: '\n' });
    }
  });

  return chunks;
}

// Define the Home component of the application
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate if the last message should be rendered with chunks
  const shouldRenderLastMessageAsChunks = messages.length > 0 && messages[messages.length - 1].role === "assistant"
  const shouldAnimateChunks = isLoading && shouldRenderLastMessageAsChunks
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null; // Get the last message
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: input,
    };
    
    setMessages((messages) => [...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Create initial assistant message
    const assistantMessageId = nanoid();
    setMessages((messages) => [
      ...messages, 
      { id: assistantMessageId, role: 'assistant', content: '' }
    ]);
    
    try {
      // Call API and stream response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });
      
      if (!response.ok || !response.body) {
        throw new Error('Failed to fetch response');
      }
      
      // Set up streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let buffer = ''; // Buffer for incomplete lines

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode the current chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Split by newlines but keep the last incomplete line in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last (potentially incomplete) line

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            const data = line.slice(line.indexOf('data: ') + 6).trim();

            // Check for [DONE] message (handle both with and without quotes)
            if (data === '[DONE]' || data === '"[DONE]"') continue;

            // Parse JSON data
            try {
              const json = JSON.parse(data);
              // Extract content delta
              const contentDelta = json.choices[0]?.delta?.content || '';
              if (contentDelta) {
                content += contentDelta;

                // Update assistant message with new content
                setMessages((messages) =>
                  messages.map((message) =>
                    message.id === assistantMessageId
                      ? { ...message, content }
                      : message
                  )
                );
              }
            } catch (e) {
              console.error('Error parsing JSON:', e, data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during chat:', error);
      setMessages((messages) => [
        ...messages.slice(0, -1),
        { id: assistantMessageId, role: 'assistant', content: 'Sorry, an error occurred while generating a response.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>WILLIAM LETTIERI - Animated streaming</title>
        <meta name="description" content="A demonstration of how to achieve Perplexity style text streaming" />
        <meta name="twitter:site" content="@ReworkdAI" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Reworkd - Animated streaming" />
        <meta name="twitter:description" content="A demonstration of how to achieve Perplexity style text streaming" />
        <meta name="twitter:image" content="https://agentgpt.reworkd.ai/banner.png" />
        <meta name="twitter:image:width" content="1280" />
        <meta name="twitter:image:height" content="640" />
        <meta property="og:title" content={"Reworkd - Animated streaming"} />
        <meta property="og:description" content="A demonstration of how to achieve Perplexity style text streaming" />
        <meta property="og:url" content="https://agentgpt.reworkd.ai/" />
        <meta property="og:image" content="https://agentgpt.reworkd.ai/banner.png" />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="640" />
        <meta property="og:type" content="website" />
        <meta name="google-site-verification" content="sG4QDkC8g2oxKSopgJdIe2hQ_SaJDaEaBjwCXZNkNWA" />
      </Head>
      <Analytics />

    <div className="bg-zinc-900 w-screen min-h-screen flex items-start justify-center font-sans pb-25">
        <div className="max-w-screen-md flex-1 flex flex-col pb-5 sm:p-7">

          <div className="flex-1 w-full overflow-auto pb-10 mb-20">
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 2, delay: 0.5 }}>
              {
                messages.length <= 0 && (
                  <div className="w-full flex items-center justify-center font-thin text-lg text-neutral-400">

                  </div>
                )
              }
            </motion.div>

            {
              (shouldRenderLastMessageAsChunks ? messages.slice(0, messages.length - 1) : messages).map(m => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="font-bold text-xl pb-2">
                      {m.content.split("\n").map((line, lineIndex) => (
                        <div key={lineIndex}>{line}</div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div key={m.id} className="mb-10 text-neutral-400" style={{ whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </div>
                );
              })
            }

            {shouldRenderLastMessageAsChunks && (
              <div className="mb-10 text-neutral-400">
                {chunkString(messages[messages.length - 1].content).map((chunk, index) => (
                  chunk.type === 'newline' ? (
                    <br key={index} />
                  ) : (
                    <motion.span
                      key={index}
                      initial={shouldAnimateChunks ? { opacity: 0 } : { opacity: 1 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: shouldAnimateChunks ? 0.75 : 0 }}
                    >
                      {chunk.content}
                    </motion.span>
                  )
                ))}
              </div>
            )}

          </div>

        <motion.div
  initial={{ y: 100, opacity: 0 }} // starts 100 pixels below the final position
  animate={{ y: 0, opacity: 1 }} // ends at its actual position
  transition={{ duration: 1.5 }} // adjust duration as needed
  className="fixed bottom-0 left-0 right-0 flex flex-col items-center p-5 text-sm bg-zinc-900/100 opacity-100"
>
  <form onSubmit={handleSubmit} className="relative w-full max-w-screen-md">
              <input
                  style={{position: 'relative', zIndex: 2}}
                className="text-white w-full p-3 pl-5 pr-14 bg-transparent border-[2px] rounded-md border-white/5 hover:border-white/20 focus:border-blue-400 outline-0 transition-all duration-500"
                value={input}
                placeholder="How can I help you?"
                onChange={handleInputChange}
              />
    <div
        style={{zIndex: 3}}
  className={`absolute right-1.5 top-1.5 ${isLoading ? "bg-neutral-400" : "bg-blue-500 hover:bg-blue-400"} p-2 rounded-full transition-colors duration-500 cursor-pointer`}
  onClick={(e) => handleSubmit(e as any)}
>
  <AiOutlineArrowUp size={20} />
</div>
            </form>

            <div className="w-full flex items-center justify-center">

            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
