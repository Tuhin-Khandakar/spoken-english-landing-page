
"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-background p-6 pt-24 pb-12">
            <div className="max-w-3xl mx-auto">
                <Link href="/">
                    <Button variant="secondary" size="sm" icon={ChevronLeft} className="mb-8">
                        Back to Home
                    </Button>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Shield className="size-6 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold italic">Privacy Policy</h1>
                        </div>

                        <div className="space-y-8 text-white/70 leading-relaxed text-sm">
                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">1. Introduction</h2>
                                <p>
                                    Welcome to Markiety English. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at hello@markiety.com.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">2. Information We Collect</h2>
                                <p>
                                    We collect personal information that you voluntarily provide to us when registering at the Markiety English LMS, expressing an interest in obtaining information about us or our products and services, or otherwise contacting us.
                                </p>
                                <ul className="list-disc pl-5 mt-4 space-y-2">
                                    <li>Personal Information: Name, email address, WhatsApp number, and payment transaction details.</li>
                                    <li>Login Data: Password (stored securely and encrypted) and identity batch details.</li>
                                    <li>Usage Data: Information on how you interact with our LMS, lessons, and chat system.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">3. How We Use Your Information</h2>
                                <p>
                                    We use the information we collect or receive:
                                </p>
                                <ul className="list-disc pl-5 mt-4 space-y-2">
                                    <li>To facilitate account creation and logon process.</li>
                                    <li>To fulfill and manage your enrollment.</li>
                                    <li>To deliver educational services, including feedback on homework and attendance tracking.</li>
                                    <li>To communicate with you via WhatsApp or Email regarding course updates.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">4. Data Security</h2>
                                <p>
                                    We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information. We utilize encrypted storage and secure cloud databases (Supabase) to ensure your learning data is protected.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">5. Contact Us</h2>
                                <p>
                                    If you have questions or comments about this policy, you may email us at hello@markiety.com or message us on WhatsApp at +880 1611 579179.
                                </p>
                            </section>

                            <div className="pt-8 border-t border-white/5 text-[10px] uppercase tracking-widest font-bold text-white/30">
                                Last updated: February 26, 2026
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </main>
    );
}
