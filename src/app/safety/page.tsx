import { Header } from "@/components/header";
import { Shield, Lock, CheckCircle, AlertTriangle } from "lucide-react";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-950 font-sans">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-20 w-full mt-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-green-500/10 text-green-500 rounded-full mb-6 relative">
             <div className="absolute inset-0 border border-green-500/30 rounded-full animate-ping" />
             <Shield className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Buyer Protection & Safety
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your trust is our priority. Learn how MarketChat ensures every transaction is safe, secure, and scam-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <Lock className="w-10 h-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Escrow Payment Protection</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              When you use MarketChat secure checkout, the seller does not get paid until you confirm that you have received your item exactly as described.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <CheckCircle className="w-10 h-10 text-green-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">100% Verified Sellers</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Every seller on MarketChat undergoes a rigorous verification protocol involving ID checks, business registration verification, and active monitoring.
            </p>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-8 flex gap-6 items-start">
           <AlertTriangle className="w-10 h-10 text-red-500 shrink-0 mt-1" />
           <div>
              <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2">Anti-Fraud Guarantee</h3>
              <p className="text-red-800 dark:text-red-300">
                If an item is significantly not as described or never arrives, you are fully covered under the MarketChat Anti-Fraud guarantee. We mediate all disputes forcefully and fairly.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}
