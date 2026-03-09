"use client"

import { Header } from "@/components/header"
import { motion } from "framer-motion"
import { Mail, MessageCircle, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900/50">
            <Header />
            <main className="flex-1 w-full flex flex-col items-center pt-24 sm:pt-32 pb-16">
                <section className="relative w-full py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline mb-4 text-gray-900 dark:text-white">
                            Get in Touch
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                            Have questions or need support? Our team is here to help you succeed on MarketChat.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-8 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                                    <Mail className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email Us</h4>
                                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">shaibusalim0000@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                                    <MessageCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">WhatsApp Support</h4>
                                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">+233 20 983 2978</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                                    <Info className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Location</h4>
                                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Tamale, Ghana</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-10 shadow-lg border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send us a message</h3>
                            <form className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Full Name</label>
                                    <Input id="name" placeholder="John Doe" className="w-full h-12" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Email Address</label>
                                    <Input id="email" type="email" placeholder="john@example.com" className="w-full h-12" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Message</label>
                                    <textarea
                                        id="message"
                                        placeholder="How can we help you?"
                                        rows={4}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                                <Button type="submit" className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-xl">
                                    Send Message
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </section>
            </main>
        </div>
    )
}
