
"use client";

import { Hero } from "@/components/landing/hero";
import { Syllabus } from "@/components/landing/syllabus";
import { Pricing } from "@/components/landing/pricing";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { MessageSquare, ShieldCheck, Zap, Globe, Menu, X, Youtube, Instagram, Linkedin, Facebook, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(8);

  useEffect(() => {
    const fetchSpots = async () => {
      const { count } = await supabase.from("enrollments").select("id", { count: "exact", head: true }).not("status", "eq", "rejected");
      const totalCapacity = 60;
      setSpotsLeft(Math.max(2, totalCapacity - (count || 0)));
    };
    fetchSpots();
  }, []);

  return (
    <main className="min-h-screen bg-background selection:bg-primary/30">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 px-8 py-6 flex justify-between items-center backdrop-blur-md border-b border-white/5 bg-background/50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Markiety Logo" className="size-10 rounded-lg shadow-lg shadow-primary/20" />
          <h1 className="text-xl font-bold tracking-tighter text-white uppercase italic">
            Markiety <span className="text-primary">English</span>
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-white/50">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          <Link href="/login" className="px-5 py-2 rounded-full border border-white/10 hover:border-primary/50 hover:bg-white/5 text-white transition-all">Student Portal</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 md:hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold italic hover:text-primary transition-colors">Features</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold italic hover:text-primary transition-colors">Pricing</a>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold italic text-primary">Student Portal</Link>
              <Link href="/enroll" onClick={() => setIsMenuOpen(false)} className="px-8 py-4 bg-primary rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-primary/30">Enroll Now</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Hero />
      <Syllabus />

      {/* Trust / Limited Seats Alert */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto mt-8 mb-24">
          <GlassCard className="bg-primary/10 border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <Zap className="size-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Limited Seats Available</h4>
                <p className="text-sm text-white/60">Batch #04 Enrollment is closing soon.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{spotsLeft.toString().padStart(2, '0')}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Spots Left</div>
              </div>
              <div className="w-px h-10 bg-white/10 hidden md:block" />
              <div className="text-center">
                <div className="text-2xl font-black text-white">48h</div>
                <div className="text-[10px] text-muted-foreground uppercase">Remaining</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Practical Speaking",
                description: "Focus on real-world conversations, not just textbook grammar."
              },
              {
                icon: ShieldCheck,
                title: "Lifetime Access",
                description: "All class recordings and resources are yours forever."
              },
              {
                icon: MessageSquare,
                title: "24/7 Support",
                description: "Private WhatsApp group with Tuhin and peer learners."
              }
            ].map((feature, i) => (
              <GlassCard key={i} className="text-center p-10 flex flex-col items-center">
                <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="size-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <Pricing />

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Markiety Logo" className="size-10 rounded-lg" />
              <span className="text-xl font-extrabold tracking-tighter text-white">Markiety <span className="text-primary italic">English</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium English learning experience designed to help you speak with confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h5 className="font-bold mb-4">Quick Links</h5>
              <ul className="text-sm text-muted-foreground space-y-3">
                <li><a href="#" className="hover:text-primary transition-colors">Hero</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Contact</h5>
              <ul className="text-sm text-muted-foreground space-y-3">
                <li>WhatsApp: +880 1611 579179</li>
                <li>Email: hello@markiety.com</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Connect with Tuhin</h5>
              <ul className="text-sm text-muted-foreground space-y-3">
                <li>
                  <a href="https://tuhinkhandakar.netlify.app" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors group">
                    <Globe className="size-4 text-primary/60 group-hover:text-primary transition-colors" />
                    Portfolio
                    <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/AbirSixT9" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors group">
                    <Facebook className="size-4 text-primary/60 group-hover:text-primary transition-colors" />
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/tuhink-abir/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors group">
                    <Linkedin className="size-4 text-primary/60 group-hover:text-primary transition-colors" />
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@tuhin-khandakar" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors group">
                    <Youtube className="size-4 text-primary/60 group-hover:text-primary transition-colors" />
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/abir_6996/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors group">
                    <Instagram className="size-4 text-primary/60 group-hover:text-primary transition-colors" />
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social icon row */}
        <div className="max-w-6xl mx-auto mt-12 flex flex-wrap gap-3 justify-center md:justify-start">
          {[
            { href: "https://tuhinkhandakar.netlify.app", icon: Globe, label: "Portfolio" },
            { href: "https://www.facebook.com/AbirSixT9", icon: Facebook, label: "Facebook" },
            { href: "https://www.linkedin.com/in/tuhink-abir/", icon: Linkedin, label: "LinkedIn" },
            { href: "https://www.youtube.com/@tuhin-khandakar", icon: Youtube, label: "YouTube" },
            { href: "https://www.instagram.com/abir_6996/", icon: Instagram, label: "Instagram" },
          ].map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-all"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground italic">
          <p>© 2026 Markiety English. Built by <a href="https://tuhinkhandakar.netlify.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Tuhin Khandakar</a>.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}