
"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
                                <FileText className="size-6 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold italic">Terms of Service</h1>
                        </div>

                        <div className="space-y-8 text-white/70 leading-relaxed text-sm">
                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">1. Agreement to Terms</h2>
                                <p>
                                    By accessing or using Markiety English services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">2. Enrollment & Payments</h2>
                                <p>
                                    Enrollment in Markiety English courses requires a one-time payment of 2500 BDT (or as specified during promotion).
                                </p>
                                <ul className="list-disc pl-5 mt-4 space-y-2">
                                    <li>Payments are manually verified via Transaction ID.</li>
                                    <li>Admission is confirmed only after manual verification (approx. 1-6 hours).</li>
                                    <li>All fees are non-refundable once the course batch has officially started.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">3. LMS Access & Content</h2>
                                <p>
                                    Students are granted a personal, non-exclusive license to access course resources, recordings, and the student portal.
                                </p>
                                <ul className="list-disc pl-5 mt-4 space-y-2">
                                    <li>Sharing login credentials with others is strictly prohibited and may result in permanent account suspension.</li>
                                    <li>Redistributing course materials (Videos, PDFs, Notes) outside the Markiety platform is illegal and subject to legal action.</li>
                                    <li>Lifetime access refers to the life of the platform or the course availability.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">4. Student Conduct</h2>
                                <p>
                                    Students must maintain professional conduct in the private WhatsApp groups and live sessions. Harassment, spamming, or inappropriate behavior towards the teacher or other students will result in immediate removal without refund.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-white font-bold text-lg mb-4">5. Modifications to Service</h2>
                                <p>
                                    We reserve the right to modify or withdraw the service, or any part of it, with or without notice. We shall not be liable to you or any third party for any modification, price change, or suspension of the service.
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
