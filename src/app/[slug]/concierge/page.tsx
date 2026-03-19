"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Send, Bot, User } from "lucide-react";

function formatVenueName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
}

export default function ConciergePage() {
  const { slug } = useParams<{ slug: string }>();
  const venueName = formatVenueName(slug);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome to ${venueName}! I'm your digital concierge. Ask me about nearby restaurants, events, hotel services, or anything else to make your stay wonderful.`,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: text },
    ]);
    setInput("");

    // TODO: Replace with actual AI API call
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm not connected to an AI service yet, but soon I'll be able to help you find the best restaurants, events, and services near the hotel. Stay tuned!",
        },
      ]);
    }, 800);
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-1 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === "assistant"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 border-t px-1 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about restaurants, events..."
          className="flex-1 rounded-full border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
