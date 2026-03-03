
"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { CheckCircle2, ChevronRight, BookOpen, Star, Zap, Users, Megaphone, Award } from "lucide-react";

const courseStructure = [
    {
        week: "01",
        title: "Foundation & Tongue Training",
        desc: "Break the barrier. We start by fixing pronunciation and building the core sentence structure you need to stop translating in your head.",
        topics: ["Phonetic Precision", "The 'Silent English' Formula", "Visualizing Tenses"],
        icon: Zap,
        color: "from-blue-500/20 to-cyan-500/20"
    },
    {
        week: "02",
        title: "The Conversational Flow",
        desc: "Master the art of 'Small Talk' and daily life situations. Learn to handle any scenario from ordering coffee to explaining your dreams.",
        topics: ["Natural Fillers", "Emotional Expressiveness", "Scenario-based Drills"],
        icon: Users,
        color: "from-purple-500/20 to-pink-500/20"
    },
    {
        week: "03",
        title: "Thinking in English",
        desc: "Advanced logic training. We move from simple sentences to complex debating and storytelling techniques.",
        topics: ["Critical Thinking Drills", "Building Narratives", "Persuasive Language"],
        icon: BookOpen,
        color: "from-orange-500/20 to-red-500/20"
    },
    {
        week: "04",
        title: "Professional Excellence",
        desc: "Final polish for the real world. Interviews, presentations, and professional etiquette that makes you stand out.",
        topics: ["Presentation Secrets", "Interview Mastery", "Business Etiquette"],
        icon: Star,
        color: "from-green-500/20 to-emerald-500/20"
    },
    {
        week: "05",
        title: "The Art of Storytelling",
        desc: "Learn to captivate an audience. We focus on narrative structures, voice modulation, and painting pictures with words.",
        topics: ["Climax building", "Vocal Variety", "Expressive Vocabulary"],
        icon: Megaphone,
        color: "from-yellow-500/20 to-orange-500/20"
    },
    {
        week: "06",
        title: "Public Speaking Mastery",
        desc: "Conquer stage fright. Practice delivering speeches, managing Q&A sessions, and maintaining powerful body language.",
        topics: ["Stage Presence", "Handling Rejection", "Audience Engagement"],
        icon: Users,
        color: "from-blue-600/20 to-blue-400/20"
    },
    {
        week: "07",
        title: "Global Accent Neutralization",
        desc: "Communicate clearly with anyone, anywhere. Understanding global variations and refining your own accent for maximum clarity.",
        topics: ["Intonation Patterns", "Connected Speech", "Pacing & Clarity"],
        icon: Zap,
        color: "from-indigo-500/20 to-violet-500/20"
    },
    {
        week: "08",
        title: "Capstone & Graduation",
        desc: "The final showdown. Live presentations, survival scenarios, and issuing your official Spoken English Mastery certificate.",
        topics: ["Real-world Simulation", "Final Feedback", "Graduation Ceremony"],
        icon: Award,
        color: "from-rose-500/20 to-red-600/20"
    }
];

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Syllabus = () => {
    const [syllabus, setSyllabus] = useState<any[]>([]);

    useEffect(() => {
        const fetchSyllabus = async () => {
            const { data } = await supabase.from("syllabus_weeks").select("*").order("week_number", { ascending: true });
            if (data) setSyllabus(data);
        };
        fetchSyllabus();
    }, []);

    // Helper to get icon for week (we can't store functions in DB easily)
    const getWeekIcon = (num: number) => {
        const icons = [Zap, Users, BookOpen, Star, Megaphone, Users, Zap, Award];
        return icons[(num - 1) % icons.length] || BookOpen;
    };

    const getWeekColor = (num: number) => {
        const colors = [
            "from-blue-500/20 to-cyan-500/20",
            "from-purple-500/20 to-pink-500/20",
            "from-orange-500/20 to-red-500/20",
            "from-green-500/20 to-emerald-500/20",
            "from-yellow-500/20 to-orange-500/20",
            "from-blue-600/20 to-blue-400/20",
            "from-indigo-500/20 to-violet-500/20",
            "from-rose-500/20 to-red-600/20"
        ];
        return colors[(num - 1) % colors.length] || "from-primary/20 to-primary/10";
    };

    return (
        <section id="syllabus" className="py-24 px-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4"
                    >
                        <BookOpen className="size-3" /> 8-Week Roadmap
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter italic">
                        What You'll <span className="text-primary">Master</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
                        Our curriculum is designed to take you from a shy speaker to a confident communicator in just 60 days. No boring grammar charts—only practical, real-world English.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {syllabus.length > 0 ? syllabus.map((item, idx) => {
                        const Icon = getWeekIcon(item.week_number);
                        const colorClass = getWeekColor(item.week_number);
                        const weekStr = item.week_number < 10 ? `0${item.week_number}` : `${item.week_number}`;

                        return (
                            <motion.div
                                key={item.week_number}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <GlassCard className={`p-8 border-white/5 h-full hover:border-primary/30 transition-all group relative overflow-hidden`}>
                                    <div className="absolute -right-4 -top-4 text-9xl font-black text-white/[0.03] italic group-hover:text-primary/[0.05] transition-colors select-none">
                                        {weekStr}
                                    </div>

                                    <div className="relative z-10">
                                        <div className={`size-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform`}>
                                            <Icon className="size-6 text-white" />
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-primary font-mono text-xs font-bold tracking-widest">WEEK {weekStr}</span>
                                            <div className="h-[1px] flex-1 bg-white/10" />
                                        </div>

                                        <h3 className="text-xl font-bold mb-3 italic">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                                            {item.description}
                                        </p>

                                        <div className="space-y-3">
                                            {item.topics.map((topic: string, tIdx: number) => (
                                                <div key={tIdx} className="flex items-center gap-3">
                                                    <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <CheckCircle2 className="size-3 text-primary" />
                                                    </div>
                                                    <span className="text-xs font-medium text-white/80">{topic}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    }) : (
                        // Skeleton/Loading State
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl border border-white/5" />
                        ))
                    )}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-xs text-white/30 italic mb-6">+ Individual mock interviews and personality development sessions included.</p>
                    <a href="#pricing">
                        <button className="px-8 py-4 bg-primary rounded-2xl font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm italic flex items-center justify-center gap-2 mx-auto">
                            View Course Fees <ChevronRight className="size-4" />
                        </button>
                    </a>
                </div>
            </div>
        </section>
    );
};
