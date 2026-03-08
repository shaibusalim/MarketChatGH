"use client"

import { Header } from "@/components/header"
import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
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
                            About MarketChat
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Our mission is to revolutionize commerce in Ghana by making buying and selling accessible and efficient for everyone.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <Image
                                src="/img7.png"
                                width={600}
                                height={400}
                                alt="About MarketChat"
                                className="rounded-2xl shadow-2xl object-cover w-full h-auto"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                We envision a future where every Ghanaian business, no matter how small, can thrive in the digital marketplace. By leveraging the power of AI and the ubiquity of WhatsApp, we bridge the gap between traditional commerce and modern technology.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                MarketChat is built on the principles of accessibility, innovation, and community support. We are committed to providing tools that empower local entrepreneurs and simplify shopping for consumers.
                            </p>
                            <div className="pt-4">
                                <Link href="/for-sellers">
                                    <Button className="h-12 px-6 bg-green-500 hover:bg-green-600 font-semibold text-white">
                                        Join Our Platform <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </div>
    )
}
