"use client"

import { Header } from "@/components/header"
import { motion } from "framer-motion"
import { Shield, Eye, Lock, Database, Smartphone, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PrivacyPage() {
  const sections = [
    {
      icon: <Eye className="h-6 w-6 text-blue-500" />,
      title: "Information We Collect",
      content: "We collect information to provide better services to all our users. This includes your phone number (via WhatsApp), business name, location, and any product images or descriptions you upload. For buyers, we collect search queries to help our AI assistant find the best matches."
    },
    {
      icon: <Database className="h-6 w-6 text-green-500" />,
      title: "How We Use Information",
      content: "We use the information we collect to provide, maintain, and improve our services. Our AI processes your product data to make it searchable and accessible to buyers. We also use your contact information to facilitate direct communication between buyers and sellers on WhatsApp."
    },
    {
      icon: <Lock className="h-6 w-6 text-purple-500" />,
      title: "Data Security",
      content: "We work hard to protect MarketChat and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. We use encryption (SSL/TLS) and strict access controls to safeguard your data."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-orange-500" />,
      title: "WhatsApp Integration",
      content: "MarketChat operates primarily through WhatsApp. By using our service, you acknowledge that your interactions are also subject to WhatsApp's own Privacy Policy. We only store the data necessary to facilitate the marketplace experience."
    }
  ]

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/10 dark:to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold mb-6"
          >
            <Shield className="h-4 w-4" />
            <span>Your Privacy Matters</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            At MarketChat GH, we are committed to protecting your personal data and being transparent about how we collect and use it.
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Data Collection in Detail</h2>
              <p>
                When you register as a seller, we collect your business name, email, WhatsApp phone number, and location. We also store images and descriptions of the products you upload via our WhatsApp bot. 
              </p>
              <p>
                For buyers, we collect your phone number when you interact with our AI assistant to help track your queries and provide a personalized experience.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. AI Processing</h2>
              <p>
                MarketChat uses advanced AI to extract product details from your WhatsApp messages. This processing is automated and used solely to categorize and display your items correctly in our marketplace.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. Third-Party Services</h2>
              <p>
                We use trusted third-party services to power MarketChat:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Twilio:</strong> To process incoming and outgoing WhatsApp messages.</li>
                <li><strong>Firebase (Google Cloud):</strong> To securely store our database and product images.</li>
                <li><strong>NextAuth:</strong> To manage secure seller and admin logins.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any time. Sellers can manage their products via their dashboard. If you wish to delete your entire account, please contact us.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-green-600 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Have questions?</h3>
                <p className="text-green-50 opacity-90">Reach out to our privacy team for any concerns.</p>
              </div>
              <div className="flex gap-4">
                <Link href="/contact">
                  <button className="px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors flex items-center gap-2">
                    Contact Us <Mail className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="py-12 border-t border-gray-100 dark:border-gray-800 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 p-1 rounded-lg">
            <Image src="/logo.png" alt="Logo" width={20} height={20} />
          </div>
          <span className="font-headline font-bold text-gray-900 dark:text-white">MarketChat GH</span>
        </Link>
        <p className="text-gray-400 text-xs">© 2026 MarketChat GH. All rights reserved.</p>
      </footer>
    </main>
  )
}
