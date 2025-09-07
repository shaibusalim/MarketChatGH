"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/shopping-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { reply } = await response.json();
      setMessages([...newMessages, { text: reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
      setMessages([...newMessages, { text: 'Sorry, I\'m having trouble connecting. Please try again later.', sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <div className="fixed bottom-32 sm:bottom-20 right-4 sm:right-8 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700">
          <Bot className="w-8 h-8 text-white" />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-52 sm:bottom-40 right-8 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col z-[100]"
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold">Shopping Assistant</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                      ...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t dark:border-gray-700 flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-grow"
              />
              <Button onClick={handleSend} className="ml-2">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
