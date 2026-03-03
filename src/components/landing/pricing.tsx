
"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Check, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export const Pricing = () => {
    const router = useRouter();
    return (
        <section id="pricing" className="py-24 px-4 relative">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Investment for Your Future</h2>
                    <p className="text-muted-foreground">Premium education at an accessible price.</p>
                </div>

                <div className="relative">
                    {/* Decorative Glow */}
                    <div className="absolute -top-10 -right-10 size-40 bg-primary/20 blur-3xl rounded-full" />

                    <GlassCard className="relative overflow-hidden border-primary/20">
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl flex items-center gap-1">
                            <Flame className="size-3" />
                            BEST SELLER
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 p-4">
                            <div>
                                <h3 className="text-2xl font-bold mb-6">Complete Spoken English</h3>
                                <ul className="space-y-4">
                                    {[
                                        "8 Weeks Comprehensive Training",
                                        "3 Live Classes Per Week",
                                        "Dedicated WhatsApp Support Group",
                                        "Life-time Access to Recorded Classes",
                                        "Practical Speaking Sessions",
                                        "Professional Certification"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                                            <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Check className="size-3 text-primary" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-8 flex flex-col justify-center items-center">
                                <span className="text-muted-foreground text-sm line-through">5000 BDT</span>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-5xl font-extrabold text-white">2500</span>
                                    <span className="text-xl font-bold text-primary">BDT</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-4 mb-8">One-time payment. No hidden fees.</p>

                                <Button className="w-full" size="lg" glow onClick={() => router.push("/enroll")}>
                                    Enroll Now
                                </Button>

                                <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center animate-pulse-soft">
                                    <p className="text-xs font-bold text-orange-400">🔥 ONLY 8 SEATS LEFT!</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </section>
    );
};
