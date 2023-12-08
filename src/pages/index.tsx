import React from 'react';
import { motion } from "framer-motion";
import { useChat } from 'ai/react'
import { AiOutlineArrowUp } from "react-icons/ai";
import Head from "next/head";
import { Analytics } from '@vercel/analytics/react';



function chunkString(str: string): string[] {
  const chunks: string[] = [];
  const words = str.split(" ");

  for (let i = 0; i < words.length; i++) {
    let chunk = words[i];
    let nextChunk = (i + 1 < words.length) ? words[i + 1] : "";

    if (chunk.includes("\n")) {
      // Handle newline characters
      const subChunks = chunk.split("\n");
      subChunks.forEach((subChunk, index) => {
        chunks.push(subChunk);
        if (index < subChunks.length - 1) {
          chunks.push("\n");
        } else if (!nextChunk.includes("\n")) {
          chunks.push(" ");  // Add space if the next chunk doesn't start with a newline
        }
      });
    } else {
      chunks.push(chunk + (nextChunk.includes("\n") ? "" : " "));
    }
  }

  return chunks;
}


export default function Home() {
  const { messages, input, handleInputChange, isLoading, handleSubmit } = useChat()

  const shouldAnimateLastMessage = isLoading && messages.length > 0 && messages[messages.length - 1].role !== "user"
  const lastMessage = messages[messages.length - 1]; // Get the last message

  return (
    <>
      <Head>
        <title>Reworkd - Animated streaming</title>
        <meta name="description" content="A demonstration of how to achieve Perplexity style text streaming" />
        <meta name="twitter:site" content="@ReworkdAI" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={"Reworkd - Animated streaming" ?? "AgentGPT 🤖"} />
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

    <div className="bg-zinc-900 w-screen min-h-screen flex items-start justify-center font-sans">
        <div className="max-w-screen-md flex-1 flex flex-col p-5 sm:p-7">

          <div className="flex-1 w-full overflow-auto">
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
              (shouldAnimateLastMessage ? messages.slice(0, messages.length - 1) : messages).map(m => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="font-bold text-xl">
                      {m.content.split("\n").map((line, lineIndex) => (
                        <div key={lineIndex}>{line}</div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div key={m.id} className="mb-2 text-neutral-400" style={{ whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </div>
                );
              })
            }

            {isLoading && shouldAnimateLastMessage && (
              <div>
                {chunkString(messages[messages.length - 1].content).map((chunk, index) => (
                  chunk === "\n" ? (
                    <br key={index} />
                  ) : (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.75 }}
                      className="mb-2 text-neutral-400"
                    >
                      {chunk}
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
  className="fixed bottom-0 left-0 right-0 flex flex-col items-center p-1.5 bg-white/5 text-sm"
>
  <form onSubmit={handleSubmit} className="relative w-full max-w-screen-md">
              <input
                  style={{position: 'relative', zIndex: 2}}
                className="text-white w-full p-3 pl-5 pr-14 bg-transparent border-[2px] border-white/5 hover:border-white/20 focus:border-blue-400 outline-0 transition-all duration-500"
                value={input}
                placeholder="Ask a question..."
                onChange={handleInputChange}
              />
    <div
        style={{zIndex: 3}}
  className={`absolute right-1.5 top-1.5 ${isLoading ? "bg-neutral-400" : "bg-blue-500 hover:bg-blue-400"} p-2 rounded-full transition-colors duration-500 cursor-pointer`}
  onClick={(e) => handleSubmit(e as any)}
>
  <AiOutlineArrowUp size={18} />
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
