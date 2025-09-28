"use client";

import Image from "next/image";
import Hero from "@/components/ui/neural-network-hero";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Facebook, Instagram, Linkedin, Youtube, Link as LinkIcon, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  
  return (
    <main className="flex flex-col min-h-screen bg-black text-white">
      {/* Hero Section */}
      <Hero 
        title="Speak English with Confidence – Enroll Today 🚀"
        description="Live interactive online classes · Practical learning · Limited seats."
        ctaButtons={[
          { text: "Reserve My Seat", href: "#enroll", primary: true },
          { text: "Learn More", href: "#details" },
        ]}
      />

      {/* Main Content Container */}
      <div id="details" className="w-full max-w-5xl mx-auto p-8 sm:p-12 md:p-24 space-y-24">
        
        {/* Instructor Intro Section */}
        <AnimatedSection className="grid md:grid-cols-2 gap-12 items-center bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <Image
              src="/tuhin.jpg"
              alt="Instructor Tuhin Khandakar"
              width={500}
              height={500}
              className="rounded-full object-cover aspect-square border-4 border-white/20 shadow-lg"
            />
          </motion.div>
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl font-bold tracking-tight">Meet Your Instructor</h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Hi, I’m <strong>Tuhin Khandakar</strong>. With years of experience in the digital space training students, I bring a structured and practical approach to teaching Spoken English. This isn't about memorizing grammar rules—it’s about building the real-world confidence to speak naturally and fluently.
            </p>
          </div>
        </AnimatedSection>
        
        {/* Batch Details Section */}
        <AnimatedSection className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-4xl font-bold tracking-tight">Batch Details</h2>
          <ul className="text-lg text-white/80 space-y-3 pt-4">
            <li className="flex items-center gap-4">🗓️ <strong>Start Date:</strong> October 15, 2025</li>
            <li className="flex items-center gap-4">💻 <strong>Mode:</strong> 100% Online (via Zoom/Google Meet)</li>
            <li className="flex items-center gap-4">⏰ <strong>Schedule:</strong> 3 classes/week (Mon, Wed, Fri - 8 PM)</li>
            <li className="flex items-center gap-4">⏳ <strong>Duration:</strong> 8 Weeks</li>
            <li className="flex items-center gap-4">💸 <strong>Fee:</strong> 2500 BDT</li>
            <li className="flex items-center gap-4">💳 <strong>Payment Methods:</strong> bKash / Nagad / Upay / Rocket</li>
          </ul>
        </AnimatedSection>

        {/* How It Works Section */}
        <AnimatedSection className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold tracking-tight text-center">Enrollment in 3 Easy Steps</h2>
          <motion.div 
            className="grid md:grid-cols-3 gap-8 pt-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.2 }}
          >
            <motion.div 
              className="flex flex-col items-center text-center gap-3 p-6 bg-white/5 rounded-xl"
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
            >
              <div className="text-5xl">1️⃣</div>
              <h3 className="font-semibold text-2xl mt-2">Make Payment</h3>
              <p className="text-white/70">"Send Money" to any of these personal numbers:</p>
              <div className="bg-black/40 p-4 rounded-lg mt-2 w-full text-left">
                <ul className="space-y-2 text-base text-white/80">
                  <li><strong>bKash:</strong> 01624547667</li>
                  <li><strong>Nagad:</strong> 01713679302</li>
                  <li><strong>Upay:</strong> 01717940960</li>
                  <li><strong>Rocket:</strong> 01713679302</li>
                </ul>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center text-center gap-3 p-6 bg-white/5 rounded-xl"
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
            >
              <div className="text-5xl">2️⃣</div>
              <h3 className="font-semibold text-2xl mt-2">Fill Enrollment Form</h3>
              <p className="text-white/70">Enter your details and the payment Transaction ID in the form below.</p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center text-center gap-3 p-6 bg-white/5 rounded-xl"
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
            >
              <div className="text-5xl">3️⃣</div>
              <h3 className="font-semibold text-2xl mt-2">Get Confirmation</h3>
              <p className="text-white/70">Receive a confirmation on WhatsApp/Email with the class link.</p>
            </motion.div>
          </motion.div>
        </AnimatedSection>

        {/* Enrollment Form Section */}
        <AnimatedSection id="enroll" className="flex flex-col gap-6 items-center">
          <h2 className="text-4xl font-bold tracking-tight text-center">Your Journey Starts Here</h2>
          <p className="text-lg text-white/80 my-2 text-center">
            Limited seats available. Please fill out the form to enroll.
          </p>
          
          {/* =========== Your Google Form is Now Embedded Here =========== */}
          <div className="w-full max-w-3xl mx-auto mt-4 rounded-xl overflow-hidden border border-white/10">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdMcWr2IqU4A43_Q3TdNVIZfrUWVa2mhCD17oVFTSiPJVA_jQ/viewform?embedded=true"
              width="100%"
              height="1000" // Adjusted height for your specific form
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
            >
              Loading…
            </iframe>
          </div>
          
          {/* Final WhatsApp Instruction After The Form */}
          <div className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4 w-full max-w-3xl mt-8">
            <MessageSquare className="text-green-400 size-8 flex-shrink-0" />
            <div>
              <p className="font-bold">Important Final Step!</p>
              <p className="text-white/80 text-sm">
                After submitting the form above, send a screenshot of your payment to WhatsApp: <a href="https://wa.me/8801611579179" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-green-300">01611579179</a> for fast verification.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-black border-t border-white/10 p-8 text-center mt-12">
        <p className="mb-6 font-semibold">Connect with me</p>
        <div className="flex justify-center items-center gap-6 mb-8">
          <a href="https://tuhinkhandakar.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-white/80 transition-all hover:text-white hover:scale-110"><LinkIcon size={24} /></a>
          <a href="https://www.facebook.com/AbirSixT9" target="_blank" rel="noopener noreferrer" className="text-white/80 transition-all hover:text-white hover:scale-110"><Facebook size={24} /></a>
          <a href="https://www.linkedin.com/in/tuhink-abir/" target="_blank" rel="noopener noreferrer" className="text-white/80 transition-all hover:text-white hover:scale-110"><Linkedin size={24} /></a>
          <a href="https://www.youtube.com/@tuhin-khandakar" target="_blank" rel="noopener noreferrer" className="text-white/80 transition-all hover:text-white hover:scale-110"><Youtube size={24} /></a>
          <a href="https://www.instagram.com/abir_6996/" target="_blank" rel="noopener noreferrer" className="text-white/80 transition-all hover:text-white hover:scale-110"><Instagram size={24} /></a>
        </div>
        <p className="text-white/60">© 2025 Tuhin Khandakar · All Rights Reserved</p>
      </footer>
    </main>
  );
}