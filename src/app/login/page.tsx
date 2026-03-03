
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { User, Lock, Eye, EyeOff, GraduationCap, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentLoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Look up student by username, email, or phone
            const { data, error: dbError } = await supabase
                .from("students")
                .select("*")
                .or(`username.eq.${identifier},email.eq.${identifier},phone.eq.${identifier}`)
                .eq("status", "active")
                .single();

            if (dbError || !data) {
                setError("No account found. Contact your teacher if you haven't received credentials.");
                return;
            }

            if (data.password !== password) {
                setError("Incorrect password. Please try again.");
                return;
            }

            // Store session
            sessionStorage.setItem("student_session", JSON.stringify({
                id: data.id,
                name: data.name,
                username: data.username,
                email: data.email || "",
                phone: data.phone || "",
                batch: data.batch,
            }));

            router.push("/dashboard");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Brand */}
                <Link href="/" className="flex items-center justify-center gap-3 mb-10">
                    <img src="/logo.png" alt="Logo" className="size-10 rounded-xl shadow-lg shadow-primary/30" />
                    <span className="text-2xl font-extrabold tracking-tighter text-white">
                        Markiety <span className="text-primary italic">English</span>
                    </span>
                </Link>
                <GlassCard className="p-8 border-white/10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="size-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold mb-1">Student Portal</h1>
                        <p className="text-sm text-muted-foreground">Sign in with credentials sent by your teacher</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                Username / Email / Phone
                            </label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter username, email, or phone"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:border-primary/50 outline-none transition-all placeholder:text-white/20 text-sm"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white focus:border-primary/50 outline-none transition-all placeholder:text-white/20 text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center leading-relaxed"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full mt-2"
                            size="lg"
                            icon={ArrowRight}
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In to Portal"}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-white/30">
                            Not enrolled?{" "}
                            <Link href="/enroll" className="text-primary hover:underline">
                                Apply for the {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleString("en-US", { month: "long" })} Batch
                            </Link>
                        </p>
                    </div>
                </GlassCard>

                <Link href="/" className="block text-center mt-6 text-xs text-white/30 hover:text-white/60 transition-colors">
                    ← Back to Home
                </Link>
            </motion.div>
        </main>
    );
}
