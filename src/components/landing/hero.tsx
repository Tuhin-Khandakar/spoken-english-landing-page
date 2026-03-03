
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { useRouter } from "next/navigation";

// Returns the name of the next calendar month (e.g. "March" when today is February)
function getNextMonthName(): string {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return next.toLocaleString("en-US", { month: "long" });
}

export const Hero = () => {
    const router = useRouter();
    const nextMonth = getNextMonthName();
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-32">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-8"
            >
                <span>🚀 Registration open for {nextMonth} Batch</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 max-w-4xl"
            >
                Master Spoken English with <br />
                <span className="text-primary electric-glow">Markiety English</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
            >
                Transform your communication skills with Tuhin Khandakar. Live classes,
                practical learning, and a community that grows with you.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 items-center"
            >
                <Button size="lg" glow icon={ArrowRight} onClick={() => router.push("/enroll")}>
                    Reserve My Seat
                </Button>
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="size-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                            ST
                        </div>
                    ))}
                    <div className="ml-4 flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-1 text-xs font-bold text-white">
                            <Users className="size-3 text-primary" />
                            <span>500+ Students</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground italic">Joining every month</div>
                    </div>
                </div>
            </motion.div>

            {/* Trust Section / Stats Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-white/5 pt-12 w-full max-w-4xl"
            >
                {[
                    { label: "Live Classes", value: "24+" },
                    { label: "Course Duration", value: "8 Weeks" },
                    { label: "Confidence", value: "100%" },
                    { label: "Success Rate", value: "98%" },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-white">{stat.value}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</span>
                    </div>
                ))}
            </motion.div>
        </section>
    );
};
