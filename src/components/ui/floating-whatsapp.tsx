'use client';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function FloatingWhatsAppButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5 }}
      className="fixed bottom-8 right-8 z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Link
        href="https://wa.me/yournumber" // Replace with your WhatsApp number
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition-colors flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </Link>
    </motion.div>
  );
}