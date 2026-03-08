import { Check } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

const PricingCard = ({
    title,
    price,
    description,
    features,
    highlighted = false,
    ctaText = "Get Started",
    ctaHref = "/for-sellers"
}: {
    title: string;
    price: string;
    description: string;
    features: string[];
    highlighted?: boolean;
    ctaText?: string;
    ctaHref?: string;
}) => (
    <div className={`relative flex flex-col p-8 rounded-3xl ${highlighted ? 'bg-green-500 text-white shadow-2xl shadow-green-500/30 scale-105 z-10' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 shadow-lg'}`}>
        {highlighted && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
            </div>
        )}
        <h3 className={`text-2xl font-bold mb-2 ${highlighted ? 'text-white' : ''}`}>{title}</h3>
        <p className={`text-sm mb-6 h-10 ${highlighted ? 'text-green-50' : 'text-gray-500 dark:text-gray-400'}`}>{description}</p>
        <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold">{price}</span>
            {price !== "Free" && <span className={`text-sm ${highlighted ? 'text-green-100' : 'text-gray-500'}`}>/month</span>}
        </div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 shrink-0 ${highlighted ? 'text-yellow-400' : 'text-green-500'}`} />
                    <span className={`text-sm leading-tight ${highlighted ? 'text-green-50' : 'text-gray-600 dark:text-gray-300'}`}>{feature}</span>
                </li>
            ))}
        </ul>
        <Link href={ctaHref} className="mt-auto w-full">
            <Button
                className={`w-full h-12 rounded-xl font-bold ${highlighted ? 'bg-white text-green-600 hover:bg-gray-50' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
                {ctaText}
            </Button>
        </Link>
    </div>
);

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900/50 selection:bg-green-200 dark:selection:bg-green-900/40">
            <Header />
            <main className="flex-1 w-full flex flex-col items-center justify-center py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
                        Start selling for free. Upgrade only when you need powerful tools to scale your business across Ghana. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto items-center">

                    {/* Basic Plan */}
                    <PricingCard
                        title="Basic Seller"
                        price="Free"
                        description="Perfect for individuals testing the waters."
                        features={[
                            "Up to 20 active products",
                            "Basic WhatsApp integration",
                            "Standard AI search visibility",
                            "Standard support"
                        ]}
                    />

                    {/* Pro Plan */}
                    <PricingCard
                        title="Pro Merchant"
                        price="250 GHS"
                        description="Everything you need to grow your retail business."
                        highlighted={true}
                        features={[
                            "Unlimited active products",
                            "Priority AI search ranking",
                            "Custom automated responses",
                            "Analytics dashboard",
                            "Verified Seller Badge",
                            "Priority 24/7 support"
                        ]}
                    />

                    {/* Enterprise Plan */}
                    <PricingCard
                        title="Enterprise"
                        price="Custom"
                        description="For large retailers with complex catalog needs."
                        features={[
                            "Everything in Pro",
                            "API access for inventory sync",
                            "Direct POS integration",
                            "Dedicated account manager",
                            "Custom AI training on your products"
                        ]}
                        ctaText="Contact Sales"
                        ctaHref="#contact"
                    />

                </div>

                <div className="mt-20 text-center text-gray-500 text-sm max-w-2xl mx-auto">
                    Prices shown in Ghanaian Cedi (GHS). For questions regarding payment methods (Mobile Money, Cards), please review our FAQ or contact support.
                </div>
            </main>
        </div>
    );
}
