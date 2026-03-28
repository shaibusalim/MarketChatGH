"use client"

import { Header } from "@/components/header"
import { motion } from "framer-motion"
import { FileText, UserCheck, AlertTriangle, CreditCard, Scale, HelpCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function TermsPage() {
  const sections = [
    {
      icon: <UserCheck className="h-6 w-6 text-blue-500" />,
      title: "User Responsibilities",
      content: "Sellers are responsible for the accuracy of their listings and ensuring they have the right to sell the items. Buyers are responsible for their own purchasing decisions and interactions with sellers."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-green-500" />,
      title: "Payments & Transactions",
      content: "MarketChat GH is a discovery platform, not a payment processor. All transactions (MoMo, Cash, etc.) happen directly between the buyer and seller. We are not liable for any payment disputes."
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
      title: "Prohibited Items",
      content: "The sale of illegal goods, weapons, regulated substances, or counterfeit items is strictly prohibited. MarketChat reserves the right to remove any listing or seller that violates these rules."
    },
    {
      icon: <Scale className="h-6 w-6 text-purple-500" />,
      title: "Limitation of Liability",
      content: "We provide our service 'as is'. While we use AI to help categorize listings, we do not guarantee the quality, safety, or legality of the items advertised on our platform."
    }
  ]

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/10 dark:to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-bold mb-6"
          >
            <FileText className="h-4 w-4" />
            <span>Standard Terms</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 text-gray-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using MarketChat GH. By using our platform, you agree to these conditions.
          </p>
          <p className="text-sm text-gray-400 mt-4 italic">Last Updated: March 10, 2026</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
              >
                <div className="mb-4 p-3 rounded-2xl bg-white dark:bg-gray-800 inline-block shadow-sm">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{section.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing MarketChat GH via our website or WhatsApp bot, you agree to be bound by these Terms of Service and all applicable laws and regulations in Ghana. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Seller Verification</h2>
              <p>
                To maintain a safe marketplace, all sellers must undergo a verification process. MarketChat reserves the right to request additional documentation or information to verify the identity and legitimacy of any business on the platform.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. Use License</h2>
              <p>
                Permission is granted to temporarily view the materials (information or software) on MarketChat GH's website for personal, non-commercial transitory viewing only. You may not modify, copy, or use the materials for any commercial purpose without explicit consent.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Prohibited Conduct</h2>
              <p>
                Users agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Post false, inaccurate, misleading, or defamatory content.</li>
                <li>Transfer your MarketChat account to another party without our consent.</li>
                <li>Distribute viruses or any other technologies that may harm MarketChat or the interests of its users.</li>
                <li>Use any robot, spider, scraper, or other automated means to access MarketChat for any purpose.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of Ghana and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-blue-600 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Need clarification?</h3>
                <p className="text-blue-50 opacity-90">Our team is here to help you understand our terms.</p>
              </div>
              <div className="flex gap-4">
                <Link href="/contact">
                  <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
                    Get Help <HelpCircle className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="py-12 border-t border-gray-100 dark:border-gray-800 text-center">
        <Link href="/" className="flex items-center group">
          <Image 
            src="/marketchat_logo.svg" 
            alt="MarketChat Logo" 
            width={200} 
            height={64} 
            className="h-16 w-auto object-contain scale-[1.5] mx-auto" 
          />
        </Link>
        <p className="text-gray-400 text-xs">© 2026 MarketChat GH. All rights reserved.</p>
      </footer>
    </main>
  )
}
