
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { ShieldCheck, Award, User, Calendar, BookOpen, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyPage() {
    const { id } = useParams();
    const [cert, setCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCert = async () => {
            setLoading(true);
            try {
                // 1. Try exact match (full UUID)
                const { data: exactMatch } = await supabase
                    .from("certificates")
                    .select("*, students(name)")
                    .eq("id", id)
                    .maybeSingle();

                if (exactMatch) {
                    setCert(exactMatch);
                }
                // 2. Fallback to prefix search (for short 8-char IDs)
                else if (id && typeof id === 'string' && id.length >= 8) {
                    const { data: allCerts } = await supabase
                        .from("certificates")
                        .select("*, students(name)");

                    const match = allCerts?.find(c => c.id.startsWith(id));
                    if (match) setCert(match);
                }
            } catch (err) {
                console.error("Verification error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCert();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
            <div className="animate-pulse">
                <Award className="size-12 text-primary mx-auto mb-4" />
                <p className="text-white/40 italic">Verifying credentials...</p>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-2xl mx-auto">
                <Link href="/">
                    <Button variant="secondary" size="sm" icon={ChevronLeft} className="mb-8">
                        Back to Home
                    </Button>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="p-8 md:p-12 border-primary/20 relative overflow-hidden">
                        {/* Decorative Background Icon */}
                        <ShieldCheck className="absolute -right-10 -bottom-10 size-64 text-primary/[0.03] -rotate-12" />

                        {cert ? (
                            <div className="relative z-10 text-center">
                                <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
                                    <ShieldCheck className="size-8 text-primary" />
                                </div>

                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block">
                                    Authentic Certificate
                                </span>

                                <h1 className="text-3xl font-bold italic mb-2">Credential Verified</h1>
                                <p className="text-white/40 text-sm mb-12 italic">This digital certificate is officially issued by Markiety English Academy.</p>

                                <div className="grid gap-4 text-left">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <User className="size-5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Graduate Name</p>
                                            <p className="font-bold text-lg">{cert.students?.name}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <BookOpen className="size-5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Course Name</p>
                                            <p className="font-bold">Spoken English Mastery</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                <Calendar className="size-5 text-white/40" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Issue Date</p>
                                                <p className="font-bold text-sm">{new Date(cert.issue_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                <Award className="size-5 text-white/40" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Certificate ID</p>
                                                <p className="font-bold text-sm font-mono truncate max-w-[120px]">{cert.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 px-6">
                                <div className="size-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
                                    <ShieldCheck className="size-8 text-red-400" />
                                </div>
                                <h2 className="text-2xl font-bold italic mb-4">Invalid Credential</h2>
                                <p className="text-sm text-white/40 leading-relaxed mb-8">
                                    The Certificate ID you provided does not match any official records in our system. It may be fraudulent or expired.
                                </p>
                                <Link href="/">
                                    <Button variant="secondary">Contact Support</Button>
                                </Link>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>

                <p className="mt-12 text-center text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">
                    Markiety Digital Verification System v1.0
                </p>
            </div>
        </main>
    );
}
