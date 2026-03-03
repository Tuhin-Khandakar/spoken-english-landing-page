"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Video, BookOpen, MessageCircle, LogOut,
    Bell, Menu, X, Send, Clock, ExternalLink, Check,
    AlertCircle, CheckCircle2, Upload, ChevronRight, Megaphone,
    FileText, Download, PlayCircle, Award, GraduationCap, Settings, Sparkles, Key
} from "lucide-react";
import { CertificateTemplate } from "@/components/dashboard/certificate-template";

interface StudentSession {
    id: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    batch: string;
    avatar_url?: string;
    badges?: string[];
}

const AVAILABLE_BADGES = [
    { id: "early_bird", name: "Early Bird", icon: "🕊️", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { id: "consistency_king", name: "Consistency King", icon: "👑", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    { id: "top_debater", name: "Top Debater", icon: "🎙️", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    { id: "grammar_ninja", name: "Grammar Ninja", icon: "🥷", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    { id: "storyteller", name: "Storyteller", icon: "📖", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
];

const NAV_TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "homework", label: "Homework", icon: BookOpen },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "chat", label: "Ask Teacher", icon: MessageCircle },
    { id: "broadcasts", label: "Broadcasts", icon: Megaphone },
    { id: "library", label: "Library", icon: PlayCircle },
    { id: "settings", label: "Settings", icon: Settings },
];

function formatTime(ts: string) {
    return new Date(ts).toLocaleString("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

export default function StudentDashboard() {
    const router = useRouter();
    const [student, setStudent] = useState<StudentSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data
    const [meetingLink, setMeetingLink] = useState("");
    const [nextClassTime, setNextClassTime] = useState("Tonight, 08:00 PM");
    const [nextClassTopic, setNextClassTopic] = useState("Introduction to Advanced Sentence Structures");
    const [homeworks, setHomeworks] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [unreadChat, setUnreadChat] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const [streak, setStreak] = useState(0);
    const [courseResources, setCourseResources] = useState<any[]>([]);
    const [certificate, setCertificate] = useState<any>(null);
    const [showCert, setShowCert] = useState(false);
    const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [syllabus, setSyllabus] = useState<any[]>([]);
    const [newPass, setNewPass] = useState("");
    const [isUpdatingPass, setIsUpdatingPass] = useState(false);
    const [passMsg, setPassMsg] = useState({ text: "", type: "success" });
    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number, s: number }>({ h: 0, m: 0, s: 0 });
    const [libSearch, setLibSearch] = useState("");
    const [libFilter, setLibFilter] = useState("All");
    const [profileForm, setProfileForm] = useState({ bio: "", email: "", phone: "" });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toasts, setToasts] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    // UI
    const [chatInput, setChatInput] = useState("");
    const [isSendingMsg, setIsSendingMsg] = useState(false);
    const [submittingHw, setSubmittingHw] = useState<any>(null);
    const [submissionLink, setSubmissionLink] = useState("");
    const [isSubmittingHw, setIsSubmittingHw] = useState(false);
    const [selectedLBStudent, setSelectedLBStudent] = useState<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sessionStr = sessionStorage.getItem("student_session");
        if (!sessionStr) { router.push("/login"); return; }

        const session = JSON.parse(sessionStr) as StudentSession;
        setStudent(session);
        fetchAll(session.id);

        // Real-time listeners
        const chatChannel = supabase
            .channel(`student-chat-${session.id}`)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "chat_messages",
                filter: `student_id=eq.${session.id}`
            }, (payload) => {
                setChatMessages(prev => [...prev, payload.new]);
                if ((payload.new as any).sender === "admin") {
                    setUnreadChat(c => c + 1);
                    showToast("New message from teacher!", "success");
                }
            })
            .subscribe();

        const broadcastChannel = supabase
            .channel('global-broadcasts')
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "notifications",
            }, (payload) => {
                setBroadcasts(prev => [payload.new, ...prev]);
                showToast("New Announcement! 📢");
                // Notify via email if student has email set
                if (session.email) {
                    try {
                        fetch(window.location.origin + "/api/send-email", {
                            method: "POST",
                            body: JSON.stringify({
                                to: session.email,
                                subject: "New Announcement - Markiety English",
                                type: "enrollment_received", // Reusing this template type for simplicity
                                data: { name: session.name }
                            })
                        }).catch(console.error);
                    } catch (e) { console.error("Broadcast email error", e); }
                }
            })
            .subscribe();

        // Heartbeat for online status
        const heartbeat = setInterval(() => {
            supabase.from("students").update({ last_online: new Date().toISOString() }).eq("id", session.id).then();
        }, 120000); // Every 2 mins

        return () => {
            supabase.removeChannel(chatChannel);
            supabase.removeChannel(broadcastChannel);
            clearInterval(heartbeat);
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const target = new Date();
            target.setHours(20, 0, 0, 0);
            if (now > target) target.setDate(target.getDate() + 1);

            const diff = target.getTime() - now.getTime();
            setTimeLeft({
                h: Math.floor(diff / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages, activeTab]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !student) return;
        if (file.size > 2 * 1024 * 1024) return showToast("File too large (Max 2MB)", "error");
        if (!file.type.startsWith("image/")) return showToast("Only images allowed", "error");

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${student.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            await supabase.from("students").update({ avatar_url: publicUrl }).eq("id", student.id);

            setStudent(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
            const newSession = { ...student, avatar_url: publicUrl };
            sessionStorage.setItem("student_session", JSON.stringify(newSession));
            showToast("Profile photo updated!", "success");
        } catch (err: any) {
            showToast("Upload failed: " + err.message, "error");
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "chat" && student) markChatRead(student.id);
    }, [activeTab]);

    const fetchAll = async (studentId: string) => {
        const [settings, hw, subs, msgs, notes, resources, certs, progress, weeks, attLog] = await Promise.all([
            supabase.from("app_settings").select("key, value"),
            supabase.from("homework").select("*").order("created_at", { ascending: false }),
            supabase.from("submissions").select("*").eq("student_id", studentId),
            supabase.from("chat_messages").select("*").eq("student_id", studentId).order("created_at", { ascending: true }),
            supabase.from("notifications").select("*").order("created_at", { ascending: false }),
            supabase.from("course_resources").select("*").order("created_at", { ascending: false }),
            supabase.from("certificates").select("*").eq("student_id", studentId).maybeSingle(),
            supabase.from("student_progress").select("week_number").eq("student_id", studentId),
            supabase.from("syllabus_weeks").select("*").order("week_number", { ascending: true }),
            supabase.from("attendance").select("*").eq("student_id", studentId).order("joined_at", { ascending: false }),
        ]);

        if (settings.data) {
            const kv = Object.fromEntries(settings.data.map((r: any) => [r.key, r.value]));
            if (kv.meeting_link) setMeetingLink(kv.meeting_link);
            if (kv.next_class_time) setNextClassTime(kv.next_class_time);
            if (kv.next_class_topic) setNextClassTopic(kv.next_class_topic);
        }
        if (hw.data) setHomeworks(hw.data);
        if (subs.data) setSubmissions(subs.data);
        if (msgs.data) {
            setChatMessages(msgs.data);
            setUnreadChat(msgs.data.filter((m: any) => m.sender === "admin" && !m.is_read).length);
        }
        if (notes.data) setBroadcasts(notes.data);
        if (resources.data) setCourseResources(resources.data);
        if (weeks.data) setSyllabus(weeks.data);
        if (certs.data) setCertificate(certs.data);
        if (progress.data) setCompletedWeeks(progress.data.map(p => p.week_number));
        if (attLog.data) {
            setAttendance(attLog.data);
            setStreak(attLog.data.length > 0 ? attLog.data.length : 0);
        }

        const { data: lb } = await supabase.from("students")
            .select("name, avatar_url, teacher_notes, points, bio, badges")
            .eq("status", "active")
            .order("points", { ascending: false })
            .limit(5);
        if (lb) setLeaderboard(lb.map((s, i) => ({ ...s, rank: i + 1, score: s.points || 0 })));

        const { data: profile } = await supabase.from("students").select("bio, email, phone").eq("id", studentId).single();
        if (profile) setProfileForm(profile);

        setIsLoading(false);
    };

    const updateProfile = async () => {
        if (!student) return;
        setIsUpdatingProfile(true);
        const { error } = await supabase.from("students").update(profileForm).eq("id", student.id);
        if (error) showToast("Update failed: " + error.message, "error");
        else {
            showToast("Profile updated successfully!", "success");
            setStudent(prev => prev ? { ...prev, ...profileForm } : null);
        }
        setIsUpdatingProfile(false);
    };

    const toggleWeekProgress = async (weekNum: number) => {
        if (!student) return;
        const isCurrentlyCompleted = completedWeeks.includes(weekNum);
        if (isCurrentlyCompleted) {
            await supabase.from("student_progress").delete().eq("student_id", student.id).eq("week_number", weekNum);
            setCompletedWeeks(prev => prev.filter(w => w !== weekNum));
        } else {
            await supabase.from("student_progress").insert({ student_id: student.id, week_number: weekNum });
            await supabase.rpc('increment_points', { student_id: student.id, amount: 30 });
            setCompletedWeeks(prev => [...prev, weekNum]);
            showToast(`Week ${weekNum} marked as complete! +30 Pts 🎯`);
        }
    };

    const logAttendance = async () => {
        if (!student) return;
        const { data } = await supabase.from("attendance").insert({
            student_id: student.id,
            class_topic: nextClassTopic
        }).select().single();
        if (data) {
            setAttendance(prev => [data, ...prev]);
            await supabase.rpc('increment_points', { student_id: student.id, amount: 10 });
            showToast("Attendance logged! +10 Pts 🔥");
        }
    };

    const markChatRead = async (studentId: string) => {
        await supabase.from("chat_messages").update({ is_read: true }).eq("student_id", studentId).eq("sender", "admin").eq("is_read", false);
        setUnreadChat(0);
    };

    const sendMessage = async () => {
        if (!chatInput.trim() || !student || isSendingMsg) return;
        setIsSendingMsg(true);
        const msg = chatInput.trim();
        setChatInput("");
        const { data } = await supabase.from("chat_messages").insert({
            student_id: student.id, sender: "student", message: msg, msg_type: "text",
        }).select().single();
        if (data) setChatMessages(prev => [...prev, data]);
        setIsSendingMsg(false);
    };

    const handleSubmitHomework = async () => {
        if (!submissionLink || !student || !submittingHw || isSubmittingHw) return;
        setIsSubmittingHw(true);
        const { data, error } = await supabase.from("submissions").insert({
            student_id: student.id,
            homework_id: submittingHw.id,
            link: submissionLink,
            status: "pending",
        }).select().single();
        if (data) {
            setSubmissions(prev => [...prev, data]);
            await supabase.rpc('increment_points', { student_id: student.id, amount: 20 });
            setSubmittingHw(null);
            setSubmissionLink("");
            showToast("Homework submitted! +20 Pts 🚀");
        } else {
            showToast("Failed to submit. Link might already exist.", "error");
        }
        setIsSubmittingHw(false);
    };

    const updatePassword = async () => {
        if (!student || !newPass.trim()) return;
        setIsUpdatingPass(true);
        const { error } = await supabase.from("students").update({ password: newPass }).eq("id", student.id);
        if (!error) {
            showToast("Password updated successfully!");
            setNewPass("");
        } else {
            showToast("Failed to update password.", "error");
        }
        setIsUpdatingPass(false);
    };

    const signOut = () => { sessionStorage.removeItem("student_session"); router.push("/login"); };
    const isSubmitted = (hwId: string) => submissions.some(s => s.homework_id === hwId);
    const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    if (isLoading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="size-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto animate-pulse">
                    <BookOpen className="size-7 text-primary" />
                </div>
                <p className="text-white/40 italic text-sm">Loading your portal...</p>
            </div>
        </div>
    );

    const Sidebar = () => (
        <nav className="flex-1 space-y-1.5">
            {NAV_TABS.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium relative",
                        activeTab === tab.id
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                >
                    <tab.icon className="size-4" />
                    {tab.label}
                    {tab.id === "chat" && unreadChat > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[9px] font-bold size-5 rounded-full flex items-center justify-center">
                            {unreadChat}
                        </span>
                    )}
                </button>
            ))}
        </nav>
    );

    return (
        <div className="min-h-screen bg-background flex">
            <aside className="w-64 border-r border-white/5 bg-secondary/20 hidden md:flex flex-col p-5 gap-6">
                <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-lg shadow-lg shadow-primary/20" />
                    <span className="text-lg font-extrabold tracking-tighter text-white italic">Markiety</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    {student?.avatar_url ? (
                        <div className="size-10 rounded-xl overflow-hidden border border-white/10">
                            <img src={student.avatar_url} alt={student.name} className="size-full object-cover" />
                        </div>
                    ) : (
                        <div className="size-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                            {student ? getInitials(student.name) : "?"}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{student?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{student?.batch}</p>
                    </div>
                </div>
                <Sidebar />
                <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm font-medium">
                    <LogOut className="size-4" /> Sign Out
                </button>
            </aside>

            <AnimatePresence>
                {isSidebarOpen && (
                    <div className="fixed inset-0 z-[100] md:hidden">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="absolute inset-y-0 left-0 w-72 bg-background border-r border-white/10 p-5 flex flex-col gap-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-lg" />
                                    <span className="text-lg font-extrabold tracking-tighter text-white italic">Markiety</span>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="size-8 flex items-center justify-center text-white/40 hover:text-white"><X className="size-5" /></button>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                {student?.avatar_url ? (
                                    <div className="size-10 rounded-xl overflow-hidden border border-white/10"><img src={student.avatar_url} alt={student.name} className="size-full object-cover" /></div>
                                ) : (
                                    <div className="size-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">{student ? getInitials(student.name) : "?"}</div>
                                )}
                                <div><p className="text-sm font-bold text-white">{student?.name}</p><p className="text-[10px] text-muted-foreground">{student?.batch}</p></div>
                            </div>
                            <Sidebar />
                            <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/30 hover:text-red-400 text-sm font-medium"><LogOut className="size-4" />Sign Out</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toasts */}
            <div className="fixed top-20 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div key={t.id} initial={{ opacity: 0, x: 20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={cn("px-4 py-3 rounded-xl border shadow-lg flex items-center gap-3 min-w-[200px] backdrop-blur-md pointer-events-auto", t.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400")}>
                            {t.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                            <span className="text-xs font-bold">{t.msg}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-background/60 backdrop-blur-md flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden size-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white"><Menu className="size-4" /></button>
                        <div><h1 className="font-bold text-white text-sm">Hey, {student?.name?.split(" ")[0]} 👋</h1><p className="text-[10px] text-muted-foreground">{student?.batch}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        {unreadChat > 0 && (
                            <button onClick={() => setActiveTab("chat")} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                                <MessageCircle className="size-3" /> {unreadChat}
                            </button>
                        )}
                        <button onClick={() => setIsNotiOpen(!isNotiOpen)} className="size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all relative">
                            <Bell className="size-4" />
                            {notifications.filter(n => !n.is_read).length > 0 && <span className="absolute top-2.5 right-2.5 size-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,115,255,0.8)]" />}
                        </button>
                    </div>

                    <AnimatePresence>
                        {isNotiOpen && (
                            <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsNotiOpen(false)} />
                                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-16 right-6 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-[120] overflow-hidden">
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between"><h3 className="font-bold text-xs uppercase tracking-widest text-white/40">Notifications</h3></div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {notifications.length === 0 ? <div className="p-8 text-center text-white/20 italic text-xs">No notifications yet</div> : notifications.map((n, i) => (<div key={i} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"><p className="text-xs font-medium text-white/80">{n.message}</p><p className="text-[9px] text-white/30 mt-1">{formatTime(n.created_at)}</p></div>))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === "dashboard" && (
                        <div className="p-6 max-w-4xl mx-auto space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <GlassCard className="p-4 bg-primary/5 border-primary/20"><div className="flex items-center gap-3 mb-2"><div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary"><Clock className="size-4" /></div><span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Streak</span></div><p className="text-xl font-black italic">{streak} Days</p><p className="text-[9px] text-muted-foreground mt-1">Consistency is key! 🔥</p></GlassCard>
                                <GlassCard className="p-4 bg-orange-500/5 border-orange-500/20"><div className="flex items-center gap-3 mb-2"><div className="size-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400"><Award className="size-4" /></div><span className="text-[10px] font-bold uppercase tracking-widest text-orange-400/60">Badges</span></div><p className="text-xl font-black italic">{student?.badges?.length || 0} Earned</p><p className="text-[9px] text-muted-foreground mt-1">Unlock more skills! 🏆</p></GlassCard>
                                <GlassCard className="p-4 bg-green-500/5 border-green-500/20"><div className="flex items-center gap-3 mb-2"><div className="size-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400"><Video className="size-4" /></div><span className="text-[10px] font-bold uppercase tracking-widest text-green-400/60">Attendance</span></div><p className="text-xl font-black italic">{Math.round((attendance.length / 8) * 100)}%</p><p className="text-[9px] text-muted-foreground mt-1">Live class participation ✅</p></GlassCard>
                                <GlassCard className="p-4 bg-purple-500/5 border-purple-500/20"><div className="flex items-center gap-3 mb-2"><div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400"><BookOpen className="size-4" /></div><span className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60">Assignments</span></div><p className="text-xl font-black italic">{submissions.length}</p><p className="text-[9px] text-muted-foreground mt-1">Homeworks submitted 📝</p></GlassCard>
                            </div>

                            {certificate && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                    <GlassCard className="bg-primary/10 border-primary/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(0,115,255,0.15)]">
                                        <div className="flex items-center gap-5 text-center md:text-left"><div className="size-16 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-bounce"><Award className="size-8 text-primary" /></div><div><h3 className="text-xl font-bold italic">Congratulations, Graduate!</h3><p className="text-sm text-white/60">Your official completion certificate is ready.</p></div></div>
                                        <Button onClick={() => setShowCert(true)} icon={GraduationCap} glow className="w-full md:w-auto">View Certificate</Button>
                                    </GlassCard>
                                </motion.div>
                            )}

                            <GlassCard className="bg-primary/5 border-primary/20 overflow-hidden">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3"><div className="size-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" /><span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Live Class Ready</span></div>
                                        <h2 className="text-2xl font-bold mb-1 italic">Next Live Session</h2><p className="text-sm text-white/60 mb-4">{nextClassTopic}</p>
                                        <div className="flex items-center gap-6 mb-4">{[{ label: "HOURS", value: timeLeft.h }, { label: "MINS", value: timeLeft.m }, { label: "SECS", value: timeLeft.s }].map((time, i) => (<div key={i} className="text-center"><div className="text-2xl font-black text-white tabular-nums">{String(time.value).padStart(2, '0')}</div><div className="text-[8px] font-bold text-primary/60 tracking-widest">{time.label}</div></div>))}</div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-white/50"><Clock className="size-3 text-primary" /> Tonight, 08:00 PM</div>
                                    </div>
                                    <a href={meetingLink || "#"} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto" onClick={logAttendance}><Button size="lg" glow icon={Video} className="w-full">Join Virtual Classroom</Button></a>
                                </div>
                            </GlassCard>

                            <div className="grid grid-cols-3 gap-4">
                                {[{ label: "Homework Due", value: homeworks.filter(h => !isSubmitted(h.id)).length, color: "text-orange-400" }, { label: "Submitted", value: submissions.length, color: "text-green-400" }, { label: "Broadcasts", value: broadcasts.length, color: "text-primary" }].map((stat, i) => (<GlassCard key={i} className="p-4 text-center"><div className={cn("text-3xl font-black mb-1", stat.color)}>{stat.value}</div><div className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</div></GlassCard>))}
                            </div>

                            {/* Achievement Gallery */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold flex items-center gap-2"><Award className="size-4 text-primary" /> Achievement Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {AVAILABLE_BADGES.map((b) => {
                                        const isEarned = (student?.badges || []).includes(b.id);
                                        return (
                                            <GlassCard key={b.id} className={cn("p-3 flex flex-col items-center text-center transition-all", isEarned ? b.color : "grayscale opacity-30")}>
                                                <span className="text-2xl mb-2">{b.icon}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest">{b.name}</span>
                                            </GlassCard>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-4 px-1"><h3 className="font-bold text-sm flex items-center gap-2"><GraduationCap className="size-4 text-primary" /> Course Curriculum</h3><span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{Math.round((completedWeeks.length / (syllabus.length || 1)) * 100)}% Complete</span></div>
                                        <div className="space-y-3"><GlassCard className="p-1.5 overflow-hidden"><div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(completedWeeks.length / (syllabus.length || 1)) * 100}%` }} className="h-full bg-primary shadow-[0_0_10px_rgba(0,115,255,0.5)]" /></div></GlassCard><div className="grid md:grid-cols-2 gap-3">{syllabus.map((week, i) => (<GlassCard key={i} className={cn("p-4 transition-all group", completedWeeks.includes(week.week_number) ? "border-primary/20 bg-primary/[0.02]" : "hover:border-white/20")}><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><div className={cn("size-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors", completedWeeks.includes(week.week_number) ? "bg-primary text-white" : "bg-white/5 text-white/40")}>{week.week_number}</div><div><p className="text-sm font-bold leading-tight mb-1">{week.title}</p><p className="text-[10px] text-muted-foreground line-clamp-1">{week.description}</p></div></div><button onClick={() => toggleWeekProgress(week.week_number)} className={cn("size-6 rounded-lg flex items-center justify-center transition-all", completedWeeks.includes(week.week_number) ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/10 hover:text-white")}>{completedWeeks.includes(week.week_number) ? <CheckCircle2 className="size-3.5" /> : <ChevronRight className="size-3.5" />}</button></div></GlassCard>))}</div></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm">Recent Assignments</h3><button onClick={() => setActiveTab("homework")} className="text-primary text-xs flex items-center gap-1 hover:underline">View All <ChevronRight className="size-3" /></button></div>
                                        <div className="space-y-3">{homeworks.slice(0, 3).map((hw, i) => (<GlassCard key={i} className="flex items-center justify-between p-4"><div className="flex items-center gap-3"><div className={cn("size-8 rounded-lg flex items-center justify-center", isSubmitted(hw.id) ? "bg-green-500/10" : "bg-orange-500/10")}>{isSubmitted(hw.id) ? <Check className="size-4 text-green-400" /> : <BookOpen className="size-4 text-orange-400" />}</div><div><p className="text-sm font-bold">{hw.title}</p><p className="text-[10px] text-muted-foreground">{formatTime(hw.created_at)}</p></div></div>{!isSubmitted(hw.id) && (<Button size="sm" variant="secondary" className="text-[10px] h-7 px-3" onClick={() => setSubmittingHw(hw)}>Submit</Button>)}</GlassCard>))}</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between"><h3 className="text-sm font-bold flex items-center gap-2"><Award className="size-4 text-primary" /> Top Performers</h3><span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">This Week</span></div>
                                    <div className="grid gap-3">
                                        {leaderboard.map((user, i) => (
                                            <GlassCard
                                                key={i}
                                                className={cn("p-4 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all",
                                                    i === 0 && "bg-primary/5 border-primary/20",
                                                    i === 1 && "bg-orange-500/5 border-orange-500/20",
                                                    i === 2 && "bg-white/5 border-blue-500/20"
                                                )}
                                                onClick={() => setSelectedLBStudent(user)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("size-8 rounded-lg flex items-center justify-center font-black italic text-xs", i === 0 ? "bg-primary text-white" : i === 1 ? "bg-orange-500 text-white" : "bg-white/5 text-white/40")}>#{i + 1}</div>
                                                    <div className="flex items-center gap-3">
                                                        {user.avatar_url ? (<img src={user.avatar_url} className="size-8 rounded-full border border-white/10" alt="" />) : (<div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">{user.name ? user.name[0] : "?"}</div>)}
                                                        <div><p className="text-xs font-bold">{user.name}</p><p className="text-[9px] text-muted-foreground">{user.score} Activity Pts</p></div>
                                                    </div>
                                                </div>
                                                {i === 0 && <Sparkles className="size-4 text-primary animate-pulse" />}
                                            </GlassCard>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "homework" && (
                        <div className="p-6 max-w-3xl mx-auto space-y-6">
                            <div><h2 className="text-2xl font-bold italic mb-1">Assignments</h2><p className="text-sm text-muted-foreground">{homeworks.filter(h => !isSubmitted(h.id)).length} pending · {submissions.length} submitted</p></div>
                            {homeworks.length === 0 ? (<GlassCard className="p-12 text-center"><BookOpen className="size-10 text-white/20 mx-auto mb-3" /><p className="text-white/30 italic text-sm">No homework assigned yet. Check back soon!</p></GlassCard>) : (
                                homeworks.map((hw, i) => {
                                    const submitted = isSubmitted(hw.id);
                                    const sub = submissions.find(s => s.homework_id === hw.id);
                                    return (
                                        <GlassCard key={i} className={cn("p-6 border", submitted ? "border-green-500/20 bg-green-500/5" : "border-white/10")}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1"><div className="flex items-center gap-2 mb-2">{submitted ? <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Submitted</span> : <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Pending</span>}</div><h3 className="font-bold text-lg mb-2">{hw.title}</h3>{hw.description && <p className="text-sm text-white/60 leading-relaxed mb-3">{hw.description}</p>}<p className="text-[10px] text-muted-foreground">Assigned: {formatTime(hw.created_at)}</p>{sub && (<a href={sub.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"><ExternalLink className="size-3" /> View your submission</a>)}</div>
                                                {!submitted && (<Button size="sm" icon={Upload} onClick={() => setSubmittingHw(hw)}>Submit</Button>)}
                                            </div>
                                            {sub?.admin_feedback && (<div className="mt-4 pt-4 border-t border-white/10 p-3 rounded-xl bg-primary/5 border border-primary/20"><p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Teacher Feedback</p><p className="text-sm text-white/80">{sub.admin_feedback}</p>{sub.admin_feedback_url && (<a href={sub.admin_feedback_url} target="_blank" rel="noopener noreferrer" className="mt-3 block"><Button variant="secondary" size="sm" icon={Download} className="text-[9px] h-7 w-full">Download Annotated File</Button></a>)}</div>)}
                                        </GlassCard>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === "attendance" && (
                        <div className="p-6 max-w-3xl mx-auto space-y-6">
                            <div><h2 className="text-2xl font-bold italic mb-1">Attendance History</h2><p className="text-sm text-muted-foreground">Log of your live class participations</p></div>
                            <GlassCard className="overflow-hidden"><div className="grid grid-cols-2 p-4 border-b border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-white/40"><div>Class Topic</div><div className="text-right">Time Joined</div></div><div className="divide-y divide-white/5">{attendance.map((att, i) => (<div key={i} className="grid grid-cols-2 p-4 items-center hover:bg-white/[0.01] transition-colors"><div className="font-bold text-sm flex items-center gap-3"><div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,115,255,0.5)]" />{att.class_topic}</div><div className="text-right text-[10px] text-muted-foreground">{formatTime(att.joined_at)}</div></div>))}{attendance.length === 0 && <div className="p-12 text-center text-white/20 italic text-sm">No attendance recorded yet. Join a live class to see it here!</div>}</div></GlassCard>
                            <GlassCard className="p-6 border-primary/20 bg-primary/5"><h4 className="font-bold text-primary mb-2 flex items-center gap-2 text-sm"><CheckCircle2 className="size-4" /> Participation Counts</h4><p className="text-xs text-white/60 leading-relaxed">Your certificates are partially based on your live class attendance. Make sure to join every session to maintain your eligibility.</p></GlassCard>
                        </div>
                    )}

                    {activeTab === "chat" && (
                        <div className="flex flex-col h-full" style={{ height: "calc(100vh - 64px)" }}>
                            <div className="px-6 py-4 border-b border-white/5 bg-background/40 flex items-center gap-3 flex-shrink-0"><div className="size-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs">TK</div><div><p className="font-bold text-sm">Tuhin Khandakar</p><p className="text-[10px] text-muted-foreground">Your Teacher · Usually replies within an hour</p></div></div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {chatMessages.length === 0 && (<div className="text-center py-12"><MessageCircle className="size-10 text-white/20 mx-auto mb-3" /><p className="text-white/30 text-sm italic">No messages yet. Ask your teacher anything!</p></div>)}
                                {chatMessages.map((msg, i) => {
                                    const isAdmin = msg.sender === "admin";
                                    return (<div key={i} className={cn("flex gap-3", isAdmin ? "justify-start" : "justify-end")}>{isAdmin && (<div className="size-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-[10px] flex-shrink-0 mt-1">TK</div>)}<div className={cn("max-w-[70%] space-y-1", isAdmin ? "" : "items-end flex flex-col")}><div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed", isAdmin ? msg.msg_type === "homework" ? "bg-orange-500/10 border border-orange-500/20 rounded-tl-none text-white/90" : "bg-white/5 border border-white/10 rounded-tl-none text-white/90" : "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20")}>{msg.msg_type === "homework" && (<p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1">📚 Homework Assignment</p>)}{msg.message}</div><p className="text-[9px] text-muted-foreground px-1">{formatTime(msg.created_at)}</p></div></div>);
                                })}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="p-4 border-t border-white/5 bg-background/60 flex-shrink-0"><div className="flex gap-3 max-w-3xl mx-auto"><input type="text" placeholder="Ask your teacher a question..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/50 transition-all" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()} /><button onClick={sendMessage} disabled={!chatInput.trim() || isSendingMsg} className="size-12 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"><Send className="size-4" /></button></div></div>
                        </div>
                    )}

                    {activeTab === "broadcasts" && (
                        <div className="p-6 max-w-3xl mx-auto space-y-6">
                            <div><h2 className="text-2xl font-bold italic mb-1">Announcements</h2><p className="text-sm text-muted-foreground">Important updates from your teacher</p></div>
                            {broadcasts.length === 0 ? (<GlassCard className="p-12 text-center"><Bell className="size-10 text-white/20 mx-auto mb-3" /><p className="text-white/30 italic text-sm">No announcements yet.</p></GlassCard>) : broadcasts.map((note, i) => (<GlassCard key={i} className="p-6 border-white/5"><div className="flex items-start gap-4"><div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1"><Megaphone className="size-4 text-primary" /></div><div><p className="text-sm text-white/80 leading-relaxed">{note.message}</p><p className="text-[10px] text-muted-foreground mt-2">{formatTime(note.created_at)}</p></div></div></GlassCard>))}
                        </div>
                    )}

                    {activeTab === "library" && (
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5"><div className="relative w-full md:w-72"><PlayCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/20" /><input type="text" placeholder="Search materials..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/50 transition-all font-medium" value={libSearch} onChange={(e) => setLibSearch(e.target.value)} /></div><div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">{["All", "Class Recording", "PDF Notes", "Resource Link"].map(f => (<button key={f} onClick={() => setLibFilter(f)} className={cn("px-4 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-widest border", libFilter === f ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10")}>{f}</button>))}</div></div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{courseResources.filter(r => (libFilter === "All" || r.category === libFilter) && r.title.toLowerCase().includes(libSearch.toLowerCase())).map((res: any, i) => (<GlassCard key={i} className="p-5 group hover:border-primary/20 transition-all"><div className="flex items-start gap-4"><div className={cn("size-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110", res.category === "Class Recording" ? "bg-red-500/10 border-red-500/20 text-red-400" : res.category === "PDF Notes" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-primary/10 border-primary/20 text-primary")}>{res.category === "Class Recording" ? <PlayCircle className="size-6" /> : res.category === "PDF Notes" ? <FileText className="size-6" /> : <ExternalLink className="size-6" />}</div><div className="flex-1 min-w-0"><h4 className="font-bold text-sm leading-tight text-white mb-1 truncate">{res.title}</h4><p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4">{res.category}</p><a href={res.link} target="_blank" rel="noopener noreferrer"><Button variant="secondary" className="w-full h-9 text-[10px] font-bold" icon={ExternalLink}>Open Resource</Button></a></div></div></GlassCard>))}{courseResources.length === 0 && <div className="sm:col-span-2 lg:col-span-3 text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/5 text-white/20"><PlayCircle className="size-12 mx-auto mb-4 opacity-5" /><p className="font-bold italic">No resources added yet.</p></div>}</div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="p-6 max-w-xl mx-auto space-y-6">
                            <GlassCard className="p-6">
                                <h2 className="text-2xl font-bold mb-6 italic">Account Settings</h2>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                            {student?.avatar_url ? (
                                                <img src={student.avatar_url} className="size-16 rounded-2xl object-cover" alt="" />
                                            ) : (
                                                <div className="size-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xl">{getInitials(student?.name || "?")}</div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{student?.name}</p>
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">@{student?.username}</p>
                                                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                                                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-[10px] text-primary hover:underline mt-2 font-bold block">{isUploading ? "Uploading..." : "Change Photo"}</button>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Email Address</label>
                                                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50"
                                                    value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Phone Number</label>
                                                <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50"
                                                    value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Bio / About Me</label>
                                            <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 resize-none"
                                                placeholder="Tell us about your learning journey..."
                                                value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
                                        </div>

                                        <Button className="w-full" icon={Check} onClick={updateProfile} disabled={isUpdatingProfile}>{isUpdatingProfile ? "Saving..." : "Save Profile Details"}</Button>
                                    </div>

                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Change Password</label>
                                            <input type="text" placeholder="Enter new password" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/50 transition-all font-mono" value={newPass} onChange={e => setNewPass(e.target.value)} />
                                        </div>
                                        <Button variant="secondary" className="w-full" icon={Key} onClick={updatePassword} disabled={isUpdatingPass || !newPass.trim()}>{isUpdatingPass ? "Updating..." : "Update Password"}</Button>
                                    </div>
                                </div>
                            </GlassCard>
                            <GlassCard className="p-6 border-red-500/20 bg-red-500/5"><h4 className="text-red-400 font-bold mb-2 flex items-center gap-2"><AlertCircle className="size-4" /> Safety Note</h4><p className="text-xs text-white/50 leading-relaxed">Your username and Batch cannot be changed manually. Please contact your teacher if there's a mistake in your enrollment data.</p></GlassCard>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {submittingHw && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-md w-full">
                            <GlassCard className="p-8 border-primary/20">
                                <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold">Submit Homework</h3><button onClick={() => setSubmittingHw(null)} className="size-8 flex items-center justify-center text-white/40 hover:text-white"><X className="size-4" /></button></div>
                                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm font-bold text-primary mb-6">📚 {submittingHw.title}</div>
                                <div className="space-y-4">
                                    <div><label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Google Drive / Document Link</label><input type="url" placeholder="https://docs.google.com/..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/20" value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} /></div>
                                    <div className="flex items-start gap-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl"><AlertCircle className="size-4 text-orange-400 flex-shrink-0 mt-0.5" /><p className="text-xs text-white/50 leading-relaxed">Make sure the link is set to <strong className="text-white/80">"Anyone with the link can view"</strong> before submitting.</p></div>
                                    <div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setSubmittingHw(null)}>Cancel</Button><Button className="flex-1" icon={CheckCircle2} disabled={!submissionLink || isSubmittingHw} onClick={handleSubmitHomework}>{isSubmittingHw ? "Submitting..." : "Submit"}</Button></div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {showCert && certificate && (
                <CertificateTemplate studentName={student?.name || "Student"} courseName="Spoken English Mastery" date={certificate.issue_date} certId={certificate.id} onClose={() => setShowCert(false)} />
            )}

            {/* Peer Profile Modal */}
            <AnimatePresence>
                {selectedLBStudent && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-md w-full">
                            <GlassCard className="p-8 border-primary/20 relative">
                                <button onClick={() => setSelectedLBStudent(null)} className="absolute top-4 right-4 size-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"><X className="size-4" /></button>
                                <div className="flex flex-col items-center text-center">
                                    <div className="size-24 rounded-3xl bg-primary/20 border-4 border-white/5 flex items-center justify-center mb-4 overflow-hidden">
                                        {selectedLBStudent.avatar_url ? (
                                            <img src={selectedLBStudent.avatar_url} className="size-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-3xl font-black text-primary">{getInitials(selectedLBStudent.name)}</span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black italic">{selectedLBStudent.name}</h3>
                                    <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1 mb-6">#{selectedLBStudent.rank} On Leaderboard</p>

                                    {selectedLBStudent.bio ? (
                                        <p className="text-sm text-white/60 leading-relaxed mb-6 italic">"{selectedLBStudent.bio}"</p>
                                    ) : (
                                        <p className="text-sm text-white/20 leading-relaxed mb-6 italic italic opacity-40">No bio set by student yet.</p>
                                    )}

                                    <div className="w-full space-y-4 pt-6 border-t border-white/10">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {(selectedLBStudent.badges || []).length === 0 ? (
                                                <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">No badges earned yet</p>
                                            ) : selectedLBStudent.badges.map((bid: string) => {
                                                const b = AVAILABLE_BADGES.find(ab => ab.id === bid);
                                                return b && (
                                                    <span key={bid} className={cn("px-2 py-1 rounded-lg border text-[9px] font-bold flex items-center gap-1.5", b.color)}>
                                                        {b.icon} {b.name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{selectedLBStudent.score} Total Activity Points</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

