"use client";

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from "framer-motion";
import dynamic from 'next/dynamic';
import { Bot, ShoppingCart, Smartphone, Store, ChevronRight, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from './ErrorBoundary';

// Dynamic imports with error boundaries
const Globe = dynamic(() => import('@/components/ui/globe').then(mod => mod.Globe), { 
  ssr: false,
  loading: () => (
    <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center">
      <div className="animate-pulse">Loading globe...</div>
    </div>
  )
});

const AnimatedGradientText = ({ children }: { children: React.ReactNode }) => (
  <motion.span
    initial={{ backgroundPosition: '0% 50%' }}
    animate={{ backgroundPosition: '100% 50%' }}
    transition={{
      duration: 5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'linear'
    }}
    className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto]"
  >
    {children}
  </motion.span>
);

const FeatureCard = ({ icon, title, description, delay }: {
  icon: React.ReactNode,
  title: string,
  description: string,
  delay?: number
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay: delay || 0 }
        }
      }}
    >
      <div className="shadow-2xl hover:shadow-primary/20 transition-all duration-500 border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-background to-gray-50 dark:to-gray-900/50 h-full rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-primary to-purple-500 p-3 rounded-lg shadow-lg">
            {icon}
          </div>
          <h3 className="font-headline text-2xl bg-gradient-to-r from-foreground to-gray-600 dark:to-gray-400 bg-clip-text text-transparent">
            {title}
          </h3>
        </div>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export function InteractiveElements() {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 md:p-12">
        <ErrorBoundary fallback={
          <div className="absolute top-20 right-20 w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center">
            <p>Globe unavailable</p>
          </div>
        }>
          <div className="absolute top-20 right-20 w-64 h-64 opacity-20">
            <Globe />
          </div>
        </ErrorBoundary>
        
        <div className="text-center z-10">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 5, 0],
              scale: [1, 1.05, 1.03, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
            className="inline-block bg-gradient-to-br from-primary to-purple-500 p-5 rounded-2xl mb-8 shadow-xl"
          >
            <ShoppingCart className="text-primary-foreground h-14 w-14" />
          </motion.div>
          
          <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter mb-6">
            <AnimatedGradientText>MarketChat GH</AnimatedGradientText>
          </h1>
          
          <p className="mt-4 text-xl md:text-2xl max-w-2xl mx-auto text-muted-foreground">
            Revolutionizing e-commerce in Ghana through WhatsApp-powered AI.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-br from-primary to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-primary/30 transition-all"
            >
              Get Started
              <ArrowRight className="inline ml-2 h-5 w-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-xl font-medium shadow-lg hover:bg-primary/10 transition-all"
            >
              See How It Works
            </motion.button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={ref} className="relative w-full py-20 md:py-32 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold font-headline mb-4">
            <AnimatedGradientText>How It Works</AnimatedGradientText>
          </h2>
          <p className="text-xl text-muted-foreground">
            A seamless bridge between sellers and buyers, powered by AI.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <FeatureCard
            icon={<Store className="h-8 w-8 text-primary-foreground" />}
            title="For Sellers"
            description="Transform your WhatsApp into a powerful e-commerce platform with just a few messages."
            delay={0.2}
          />
          
          <FeatureCard
            icon={<ShoppingCart className="h-8 w-8 text-primary-foreground" />}
            title="For Buyers"
            description="Discover and shop from local businesses with the convenience of WhatsApp."
            delay={0.4}
          />
        </div>
      </section>
    </>
  );
}

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
        href="https://wa.me/YOUR_NUMBER" // Replace with your WhatsApp number
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition-colors flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </Link>
    </motion.div>
  );
}