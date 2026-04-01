import { Header } from "@/components/header";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-24 mt-16">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-gray-900 dark:text-white mb-6">
            The Modern Way to Shop.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Traditional marketplaces are broken. See why top sellers and buyers in Ghana are switching to MarketChat.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                 <th className="p-6 font-bold text-gray-400 text-lg sm:w-1/3">Feature</th>
                 <th className="p-6 font-bold text-gray-900 dark:text-white text-2xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl border border-b-0 border-gray-200 dark:border-white/10 text-center shadow-lg relative z-10 w-1/3 origin-bottom scale-105">MarketChat</th>
                 <th className="p-6 font-bold text-gray-400 text-xl text-center w-1/3">Traditional Apps</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Platform Independence", us: "Direct WhatsApp connection", them: "Must download their clunky app" },
                { feature: "AI Matching", us: "Understands complex local context instantly", them: "Basic keyword search only" },
                { feature: "Seller Communication", us: "Chat instantly & directly, voice notes welcome", them: "Slow, monitored internal messaging" },
                { feature: "Trust System", us: "Rigorous Escrow & ID Verification", them: "Plagued by unverified scam listings" },
                { feature: "Speed to Purchase", us: "Under 2 minutes on average", them: "Long checkout forms & account creation" },
              ].map((row, idx) => (
                 <tr key={idx} className="border-b border-gray-100 dark:border-white/5">
                    <td className="p-6 text-gray-600 dark:text-gray-300 font-medium">{row.feature}</td>
                    <td className="p-6 bg-gray-50 dark:bg-gray-900 border-x border-gray-200 dark:border-white/10 text-center font-semibold text-green-600 dark:text-green-400">
                       <span className="flex items-center gap-3 justify-center text-left">
                         <CheckCircle2 className="w-5 h-5 shrink-0" />
                         {row.us}
                       </span>
                    </td>
                    <td className="p-6 text-center text-gray-500 dark:text-gray-500">
                       <span className="flex items-center gap-3 justify-center text-left opacity-80">
                         <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                         {row.them}
                       </span>
                    </td>
                 </tr>
              ))}
              <tr>
                 <td className="p-6"></td>
                 <td className="p-6 bg-gray-50 dark:bg-gray-900 border-x border-b border-gray-200 dark:border-white/10 rounded-b-3xl text-center shadow-lg relative z-10 scale-105">
                   <Link href="/for-buyers" className="inline-block mt-4 px-8 py-4 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30">
                     Experience It Now
                   </Link>
                 </td>
                 <td className="p-6"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
