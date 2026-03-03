
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Phone,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const STEPS = ["Personal Info", "Payment Method", "Verification"];

// Always shows the upcoming batch month for marketing purposes
function getNextMonthName(): string {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return next.toLocaleString("en-US", { month: "long" });
}

export default function EnrollPage() {
    const nextMonth = getNextMonthName();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        whatsapp: "",
        paymentMethod: "",
        transactionId: ""
    });

    const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            // ENROLLMENT: Submit with guest details to be verified by admin
            const { error: guestError } = await supabase.from('enrollments').insert({
                guest_name: formData.name,
                guest_email: formData.email,
                guest_whatsapp: formData.whatsapp,
                method: formData.paymentMethod,
                transaction_id: formData.transactionId,
                status: 'pending'
            });

            if (guestError) throw guestError;

            setIsSuccess(true);
        } catch (error: any) {
            console.error("Enrollment error detail:", error);
            // Friendly error messages based on the database error code
            const code = error?.code || "";
            const msg = error?.message || "";
            if (code === "23505" || msg.includes("transaction_id") || msg.includes("unique")) {
                alert("⚠️ This Transaction ID has already been submitted.\n\nIf you already applied, please wait for verification. If this is a mistake, contact us on WhatsApp: +880 1611 579179");
            } else {
                alert(`⚠️ Submission failed: ${msg || "Please try again or contact us on WhatsApp."}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = () => {
        if (step === 0) return formData.name && formData.email && formData.whatsapp;
        if (step === 1) return formData.paymentMethod;
        if (step === 2) return formData.transactionId;
        return false;
    };

    if (isSuccess) {
        return (
            <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full"
                >
                    <GlassCard className="p-12 border-primary/20 flex flex-col items-center">
                        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
                            <CheckCircle2 className="size-10 text-primary animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4 italic">Enrollment Submitted!</h1>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                            Your payment verification is in progress. We've sent a confirmation email to <strong className="text-white">{formData.email}</strong>.
                        </p>

                        <div className="w-full space-y-3">
                            <a
                                href={`https://wa.me/8801611579179?text=Hi, I just enrolled for the ${nextMonth} Batch. My TrxID is: ${formData.transactionId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button className="w-full" icon={Phone}>Contact on WhatsApp</Button>
                            </a>
                            <a href="/" className="block">
                                <Button variant="secondary" className="w-full">Back to Home</Button>
                            </a>
                        </div>

                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-12 font-bold italic">
                            Verification usually takes 1-6 hours
                        </p>
                    </GlassCard>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pt-24 pb-12">
            <div className="w-full max-w-xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-2">Complete Your Enrollment</h1>
                    <p className="text-muted-foreground italic">Follow the steps below to secure your seat.</p>
                </div>

                {/* Progress Tracker */}
                <div className="flex justify-between mb-12 relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500"
                        style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                    />
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "size-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all",
                                i <= step ? "bg-primary border-primary text-white" : "bg-black border-white/10 text-white/40"
                            )}>
                                {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
                            </div>
                            <span className={cn(
                                "text-[10px] uppercase tracking-widest font-bold",
                                i <= step ? "text-white" : "text-white/40"
                            )}>{s}</span>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <GlassCard className="p-8">
                            {step === 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold mb-6 italic">Personal Details</h2>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/70">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Ex: John Doe"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:border-primary/50 outline-none transition-all placeholder:text-white/20"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/70">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:border-primary/50 outline-none transition-all placeholder:text-white/20"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/70">WhatsApp Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="tel"
                                                    placeholder="+880 1XXX-XXXXXX"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:border-primary/50 outline-none transition-all placeholder:text-white/20"
                                                    value={formData.whatsapp}
                                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold mb-2 italic">Payment Method</h2>
                                    <p className="text-sm text-muted-foreground mb-6">Choose how you sent the 2500 BDT.</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {["bKash", "Nagad", "Rocket"].map((method) => (
                                            <button
                                                key={method}
                                                onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                                className={cn(
                                                    "w-full p-5 rounded-xl border border-white/10 flex items-center justify-between transition-all",
                                                    formData.paymentMethod === method ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/10" : "bg-white/5 hover:bg-white/10 text-white/70"
                                                )}
                                            >
                                                <span className="font-bold tracking-tight">{method}</span>
                                                <div className={cn(
                                                    "size-5 rounded-full border-2 flex items-center justify-center",
                                                    formData.paymentMethod === method ? "border-primary bg-primary" : "border-white/20"
                                                )}>
                                                    {formData.paymentMethod === method && <div className="size-2 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mt-6">
                                        <p className="text-xs text-white/80 leading-relaxed font-medium">
                                            Send 2500 BDT to: <strong className="text-primary tracking-widest underline decoration-dotted">01624547667</strong> (Personal) <br />
                                            Reference: <span className="italic">{formData.name || "Your Name"}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold mb-2 italic">Payment Verification</h2>
                                    <p className="text-sm text-muted-foreground mb-6">Enter the Transaction ID (TrxID) from your payment SMS.</p>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/70">Transaction ID</label>
                                            <div className="relative group">
                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Ex: AF83K21L"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:border-primary/50 outline-none transition-all placeholder:text-white/20 font-mono tracking-widest"
                                                    value={formData.transactionId}
                                                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl mt-8">
                                        <AlertCircle className="size-6 text-orange-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-white/60 leading-relaxed">
                                            Our team will manually verify the payment. This usually takes <strong className="text-white">1-6 hours</strong>. You'll receive a WhatsApp message once verified.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-12">
                                {step > 0 && (
                                    <Button variant="secondary" className="flex-1" icon={ChevronLeft} onClick={prevStep} disabled={isSubmitting}>
                                        Back
                                    </Button>
                                )}
                                <Button
                                    className="flex-1"
                                    disabled={!isFormValid() || isSubmitting}
                                    icon={isSubmitting ? undefined : (step === STEPS.length - 1 ? CheckCircle2 : ChevronRight)}
                                    onClick={step === STEPS.length - 1 ? handleSubmit : nextStep}
                                >
                                    {isSubmitting ? "Processing..." : (step === STEPS.length - 1 ? "Complete Enrollment" : "Continue")}
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}

