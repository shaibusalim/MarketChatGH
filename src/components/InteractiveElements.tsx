"use client";

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from "framer-motion";
import dynamic from 'next/dynamic';
import { Bot, ShoppingCart, Smartphone, Store, ArrowRight, MessageCircle, Users, Star } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from './ErrorBoundary';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
// Removed import for non-existent 'next/video'

const Globe = dynamic(() => import('@/components/ui/globe').then(mod => mod.Globe), { 
  ssr: false,
  loading: () => (
    <div className="w-40 h-40 sm:w-64 sm:h-64 bg-gray-100 rounded-full flex items-center justify-center">
      <div className="animate-pulse text-gray-500 text-sm">Loading globe...</div>
    </div>
  )
});

const AnimatedGradientText = ({ children }: { children: React.ReactNode }) => (
  <motion.span
    initial={{ backgroundPosition: '0% 50%' }}
    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
    transition={{
      duration: 4,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'linear'
    }}
    whileHover={{ scale: 1.05, backgroundPosition: '50% 50%' }}
    className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 bg-clip-text text-transparent bg-[length:300%_auto]"
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
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.6, delay: delay || 0, ease: "easeOut" }
        }
      }}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
    >
      <div className="h-full shadow-lg hover:shadow-red-500/20 dark:hover:shadow-green-500/20 transition-all duration-500 border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/50 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-gradient-to-br from-red-500 to-green-500 p-2 rounded-lg shadow-md">
            {icon}
          </div>
          <h3 className="font-headline text-lg sm:text-xl bg-gradient-to-r from-gray-900 to-red-600 dark:from-white dark:to-green-400 bg-clip-text text-transparent">
            {title}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const TestimonialCard = ({ quote, author, role }: { quote: string; author: string; role: string }) => {
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
        hidden: { opacity: 0, x: -30 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: "easeOut" }
        }
      }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-yellow-500/20 transition-all duration-500"
    >
      <Star className="h-5 w-5 text-yellow-400 mb-3" />
      <p className="text-muted-foreground text-sm mb-3">"{quote}"</p>
      <div>
        <p className="font-semibold text-sm">{author}</p>
        <p className="text-xs text-gray-500">{role}</p>
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
      <section className="relative w-full min-h-[60vh] sm:min-h-screen xl:h-[800px] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Background Carousel */}
        <Carousel
          className="absolute inset-0 w-full h-full"
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            <CarouselItem>
              <img
                src="/hero1.jpg"
                alt="Background 1"
                className="w-full h-full object-cover opacity-68"
              />
            </CarouselItem>
            <CarouselItem>
              <img
                src="/hero2.jpg"
                alt="Background 2"
                className="w-full h-full object-cover opacity-68"
              />
            </CarouselItem>
            <CarouselItem>
              <img
                src="/hero3.jpg"
                alt="Background 3"
                className="w-full h-full object-cover opacity-68"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-black/60 z-0" />

        <ErrorBoundary fallback={
          <div className="hidden sm:block absolute top-4 right-4 w-40 h-40 sm:w-64 sm:h-64 bg-gray-100 rounded-full items-center justify-center opacity-50">
            <p className="text-gray-500 text-sm">Globe unavailable</p>
          </div>
        }>
          <motion.div
            className="hidden sm:block absolute top-4 right-4 w-40 h-40 sm:w-64 sm:h-64 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            
          </motion.div>
        </ErrorBoundary>

        <div className="text-center z-10 relative max-w-4xl mx-auto">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1.05, 1.1, 1],
              y: [0, -10, 0, 10, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut'
            }}
            className="inline-block bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 p-4 sm:p-6 rounded-2xl mb-4 sm:mb-6 shadow-xl"
          >
            <ShoppingCart className="text-white h-12 w-12 sm:h-16 sm:w-16" />
          </motion.div>

          <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4">
            <AnimatedGradientText>MarketChat</AnimatedGradientText>
          </h1>

          <p className="mt-2 text-base sm:text-lg md:text-xl max-w-xl mx-auto text-gray-100 dark:text-gray-200 bg-black/30 dark:bg-black/50 backdrop-blur-sm py-2 px-4 rounded-lg">
            Empowering Ghanaian commerce with AI-driven WhatsApp shopping.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sellers">
              <motion.button
                whileHover={{ scale: 1.1, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-green-500 text-white rounded-xl font-medium shadow-lg hover:bg-green-600 transition-all duration-300"
              >
                Start Shopping
                <ArrowRight className="inline ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-transparent border-2 border-white text-white rounded-xl font-medium shadow-lg hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </section>

      {/* Why MarketChat Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto bg-gradient-to-b from-transparent to-gray-100/50 dark:to-gray-800/50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline mb-3">
            <AnimatedGradientText>Why MarketChat?</AnimatedGradientText>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Discover the power of seamless, AI-driven commerce tailored for Ghana.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <Bot className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">AI-Powered</h3>
            <p className="text-muted-foreground text-sm">Smart recommendations and automated support.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <Smartphone className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">WhatsApp Integration</h3>
            <p className="text-muted-foreground text-sm">Shop directly through your favorite messaging app.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <Store className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Local Focus</h3>
            <p className="text-muted-foreground text-sm">Support Ghanaian businesses with ease.</p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={ref} className="relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline mb-3">
            <AnimatedGradientText>How It Works</AnimatedGradientText>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            A seamless bridge between sellers and buyers, powered by AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <FeatureCard
              icon={<Store className="h-6 w-6 sm:h-8 sm:w-8 text-white" />}
              title="For Sellers"
              description="Transform your WhatsApp into a powerful e-commerce platform with just a few messages."
              delay={0.2}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Carousel
                className="rounded-xl overflow-hidden mt-6"
                opts={{
                  loop: true,
                }}
              >
              <CarouselContent>
                <CarouselItem>
                  <img src="/img1.jpg" alt="Feature 1" className="w-full h-auto object-cover" />
                </CarouselItem>
                <CarouselItem>
                  <img src="/img2.jpg" alt="Feature 2" className="w-full h-auto object-cover" />
                </CarouselItem>
                <CarouselItem>
                  <img src="/img3.jpg" alt="Feature 3" className="w-full h-auto object-cover" />
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            </motion.div>
          </div>
          <div>
            <FeatureCard
              icon={<ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />}
              title="For Buyers"
              description="Discover and shop from local businesses with the convenience of WhatsApp."
              delay={0.4}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
            <Carousel
              className="rounded-xl overflow-hidden mt-6"
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                <CarouselItem>
                  <img src="/img4.jpg" alt="Feature 4" className="w-full h-auto object-cover" />
                </CarouselItem>
                <CarouselItem>
                  <img src="/img5.jpg" alt="Feature 5" className="w-full h-auto object-cover" />
                </CarouselItem>
                <CarouselItem>
                  <img src="/img6.jpg" alt="Feature 6" className="w-full h-auto object-cover" />
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto bg-gradient-to-b from-gray-100/50 to-transparent dark:from-gray-800/50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline mb-3">
            <AnimatedGradientText>What Our Users Say</AnimatedGradientText>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Hear from our community of buyers and sellers in Ghana.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <TestimonialCard
            quote="MarketChat has transformed how I sell my products. It's so easy to manage everything through WhatsApp!"
            author="Kofi Mensah"
            role="Local Artisan"
          />
          <TestimonialCard
            quote="Shopping on MarketChat is a breeze. I found exactly what I needed in minutes."
            author="Akosua Owusu"
            role="Customer"
          />
          <TestimonialCard
            quote="The AI recommendations helped me discover new local businesses. Highly recommend!"
            author="Yaw Amponsah"
            role="Entrepreneur"
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
      transition={{ delay: 1.5, duration: 0.6 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-16 sm:bottom-8 right-4 sm:right-8 z-50 animate-pulse"
    >
      <Link
        href="https://wa.me/+233501234567"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-3 sm:p-4 rounded-full shadow-xl hover:bg-green-600 transition-colors flex items-center justify-center"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>
    </motion.div>
  );
}
