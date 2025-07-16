"use client";

import { useState } from "react";
import { InteractiveElements, FloatingWhatsAppButton } from "@/components/InteractiveElements";
import { AdminLogin } from "@/components/AdminLogin";

export default function Home() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  return (
    <main className="flex flex-col items-center min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[100px] opacity-20" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full filter blur-[100px] opacity-20" />
      </div>

      <InteractiveElements />
      <FloatingWhatsAppButton />

      {/* Subtle Admin Login link */}
      <button
        onClick={() => setShowAdminLogin(true)}
        className="fixed bottom-3 right-3 text-xs text-gray-300 hover:text-primary underline"
      >
        Admin Login
      </button>

      {/* Admin login modal */}
      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} />
      )}

      {/* Footer */}
      <footer className="w-full py-12 px-4 sm:px-8 md:px-12 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-6 md:mb-0">
            <div className="bg-primary p-2 rounded-lg"></div>
            <span className="font-headline text-xl font-bold">MarketChat GH</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} MarketChat GH. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

