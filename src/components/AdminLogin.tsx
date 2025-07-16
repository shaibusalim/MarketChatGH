"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'marketgh123' // You can change this
};

export function AdminLogin({ onClose }: { onClose: () => void }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      credentials.username === DEFAULT_CREDENTIALS.username &&
      credentials.password === DEFAULT_CREDENTIALS.password
    ) {
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✖
        </button>
        <h3 className="text-2xl font-bold mb-4">Admin Login</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
          >
            Login
          </button>
        </form>
      </motion.div>
    </div>
  );
}
