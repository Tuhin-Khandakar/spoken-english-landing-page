
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
    Users, Settings, Bell, Search, Check, X, Plus,
    BookPlus, ClipboardCheck, MessageCircle, Send, Video,
    Eye, EyeOff, UserPlus, LogOut, Trash2, Clock,
    Megaphone, Key, Link as LinkIcon, RefreshCw, ExternalLink,
    FileText, Download, GraduationCap, Map as MapIcon, ChevronRight,
    LayoutDashboard, BookOpen, Award, FileDown, Quote, CheckCircle2, AlertCircle
} from "lucide-react";
import { BusinessIntelligence } from "@/components/admin/business-intelligence";

type Tab = "enrollments" | "students" | "chat" | "content" | "settings" | "lms" | "attendance" | "curriculum";

const AVAILABLE_BADGES = [
    { id: "early_bird", name: "Early Bird", icon: "🕊️", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { id: "consistency_king", name: "Consistency King", icon: "👑", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    { id: "top_debater", name: "Top Debater", icon: "🎙️", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    { id: "grammar_ninja", name: "Grammar Ninja", icon: "🥷", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    { id: "storyteller", name: "Storyteller", icon: "📖", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
];

function formatTime(ts: string) {
    return new Date(ts).toLocaleString("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

export default function AdminPortal() {
    const [isAuth, setIsAuth] = useState(false);
    const [passInput, setPassInput] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [tab, setTab] = useState<Tab>("enrollments");
    const [isLoading, setIsLoading] = useState(true);

    // Data
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [allChatMsgs, setAllChatMsgs] = useState<Record<string, any[]>>({});
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [homeworks, setHomeworks] = useState<any[]>([]);
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, students: 0, revenue: 0, submissions: 0, certificates: 0, online: 0 });
    const [biData, setBIData] = useState<any[]>([]);
    const [unreadPerStudent, setUnreadPerStudent] = useState<Record<string, number>>({});
    const [courseResources, setCourseResources] = useState<any[]>([]);
    const [issuedCerts, setIssuedCerts] = useState<any[]>([]);
    const [studentProgress, setStudentProgress] = useState<Record<string, number>>({});
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [attSearch, setAttSearch] = useState("");

    // Settings
    const [meetingLink, setMeetingLink] = useState("");
    const [nextClassTime, setNextClassTime] = useState("");
    const [nextClassTopic, setNextClassTopic] = useState("");

    // Forms
    const [newStudent, setNewStudent] = useState({ name: "", email: "", phone: "", username: "", password: "", batch: "Batch #04" });
    const [showNewStudentPass, setShowNewStudentPass] = useState(false);
    const [hwForm, setHwForm] = useState({ title: "", description: "" });
    const [broadcast, setBroadcast] = useState("");
    const [chatInput, setChatInput] = useState("");
    const [searchQ, setSearchQ] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [resForm, setResForm] = useState({ title: "", link: "", category: "Class Recording" });
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [fbInput, setFbInput] = useState("");
    const [syllabusData, setSyllabusData] = useState<any[]>([]);
    const [editingWeek, setEditingWeek] = useState<any>(null);
    const [isUploadingFeedback, setIsUploadingFeedback] = useState(false);
    const [isViewingDetails, setIsViewingDetails] = useState(false);
    const [approvingEnrollment, setApprovingEnrollment] = useState<any>(null);
    const [fbFileUrl, setFbFileUrl] = useState<string | null>(null);
    const fbTemplates = [
        "Excellent work! Your pronunciation is getting much clearer.",
        "Good effort. Please focus more on the sentence structure we discussed.",
        "Brilliant thinking. I love how you structured your narrative.",
        "Need more practice on tenses. Watch the recording of Week 2 again.",
    ];
    const fbFileRef = useRef<HTMLInputElement>(null);
    const [toasts, setToasts] = useState<any[]>([]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const auth = sessionStorage.getItem("admin_auth");
        if (auth === "true") { setIsAuth(true); loadAll(); }
        else setIsLoading(false);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedStudent, allChatMsgs]);

    useEffect(() => {
        if (!isAuth) return;
        // Realtime chat subscription
        const channel = supabase.channel("admin-chat-all")
            .on("postgres_changes", {
                event: "INSERT", schema: "public", table: "chat_messages"
            }, (payload) => {
                const msg = payload.new as any;
                setAllChatMsgs(prev => ({
                    ...prev,
                    [msg.student_id]: [...(prev[msg.student_id] || []), msg]
                }));
                if (msg.sender === "student") {
                    setUnreadPerStudent(prev => ({
                        ...prev,
                        [msg.student_id]: (prev[msg.student_id] || 0) + 1
                    }));
                    showToast(`New message from student!`, "success");
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [isAuth]);

    const login = (e: React.FormEvent) => {
        e.preventDefault();
        const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "markiety2026";
        if (passInput === correct) {
            sessionStorage.setItem("admin_auth", "true");
            setIsAuth(true);
            loadAll();
        } else {
            alert("Incorrect password.");
        }
    };

    const loadAll = async () => {
        setIsLoading(true);
        await Promise.all([fetchEnrollments(), fetchStudents(), fetchStats(), fetchSettings(), fetchContent(), fetchResources(), fetchCertificates(), fetchAttendance(), fetchSyllabus()]);
        setIsLoading(false);
    };

    const fetchEnrollments = async () => {
        const { data, error } = await supabase.from("enrollments")
            .select("*")
            .not("status", "eq", "approved")
            .not("status", "eq", "rejected")
            .order("id", { ascending: false });
        console.log("Enrollments fetched:", data, error);
        if (data) setEnrollments(data);
    };

    const fetchStudents = async () => {
        const { data } = await supabase.from("students").select("*").order("created_at", { ascending: false });
        if (data) {
            setStudents(data);

            // Load chat & progress
            const [msgs, progress] = await Promise.all([
                supabase.from("chat_messages").select("*").order("created_at", { ascending: true }),
                supabase.from("student_progress").select("student_id"),
            ]);

            if (msgs.data) {
                const grouped: Record<string, any[]> = {};
                const unread: Record<string, number> = {};
                msgs.data.forEach((m: any) => {
                    if (!grouped[m.student_id]) grouped[m.student_id] = [];
                    grouped[m.student_id].push(m);
                    if (m.sender === "student" && !m.is_read) {
                        unread[m.student_id] = (unread[m.student_id] || 0) + 1;
                    }
                });
                setAllChatMsgs(grouped);
                setUnreadPerStudent(unread);
            }

            if (progress.data) {
                const progMap: Record<string, number> = {};
                progress.data.forEach((p: any) => {
                    progMap[p.student_id] = (progMap[p.student_id] || 0) + 1;
                });
                setStudentProgress(progMap);
            }
        }
    };

    const fetchAttendance = async () => {
        const { data } = await supabase.from("attendance").select("*, students(name)").order("joined_at", { ascending: false });
        if (data) setAttendanceList(data);
    };

    const fetchSyllabus = async () => {
        const { data } = await supabase.from("syllabus_weeks").select("*").order("week_number", { ascending: true });
        if (data) setSyllabusData(data);
    };

    const updateSyllabusWeek = async (week: any) => {
        const { error } = await supabase.from("syllabus_weeks").update({
            title: week.title,
            description: week.description,
            topics: week.topics
        }).eq("week_number", week.week_number);
        if (!error) {
            setSyllabusData(prev => prev.map(w => w.week_number === week.week_number ? week : w));
            setEditingWeek(null);
        }
    };

    const fetchStats = async () => {
        const [total, pending, studentCount, approvedRows, subs, certs, online, studentsData] = await Promise.all([
            supabase.from("enrollments").select("id", { count: "exact", head: true }),
            supabase.from("enrollments").select("id", { count: "exact", head: true }).not("status", "eq", "approved").not("status", "eq", "rejected"),
            supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
            supabase.from("enrollments").select("created_at").eq("status", "approved"),
            supabase.from("submissions").select("id", { count: "exact", head: true }),
            supabase.from("certificates").select("id", { count: "exact", head: true }),
            supabase.from("students").select("id", { count: "exact", head: true }).gt("last_online", new Date(Date.now() - 86400000).toISOString()),
            supabase.from("students").select("created_at")
        ]);

        // BI Calculation
        const weeks: Record<string, { revenue: number, students: number }> = {};
        for (let i = 0; i < 7; i++) {
            weeks[`Week ${i + 1}`] = { revenue: 0, students: 0 };
        }

        const processItems = (list: any[], key: 'revenue' | 'students', multiplier = 1) => {
            list.forEach(item => {
                const date = new Date(item.created_at);
                const diff = Math.floor((Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
                const weekNum = 7 - diff;
                if (weekNum >= 1 && weekNum <= 7) {
                    weeks[`Week ${weekNum}`][key] += multiplier;
                }
            });
        };

        if (approvedRows.data) processItems(approvedRows.data, 'revenue', 2500);
        if (studentsData.data) processItems(studentsData.data, 'students', 1);

        setBIData(Object.entries(weeks).map(([name, val]) => ({ name, ...val })));

        setStats({
            total: total.count || 0,
            pending: pending.count || 0,
            students: studentCount.count || 0,
            revenue: (approvedRows.data?.length || 0) * 2500,
            submissions: subs.count || 0,
            certificates: certs.count || 0,
            online: online.count || 0,
        });
    };

    const fetchResources = async () => {
        const { data } = await supabase.from("course_resources").select("*").order("created_at", { ascending: false });
        if (data) setCourseResources(data);
    };

    const addResource = async () => {
        if (!resForm.title || !resForm.link) return alert("Title and Link are required.");
        setIsSending(true);
        const { error } = await supabase.from("course_resources").insert({
            title: resForm.title,
            link: resForm.link,
            category: resForm.category,
            batch: "Batch #04"
        });
        setIsSending(false);
        if (error) alert(error.message);
        else {
            setResForm({ title: "", link: "", category: "Class Recording" });
            fetchResources();
        }
    };

    const deleteResource = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const { error } = await supabase.from("course_resources").delete().eq("id", id);
        if (error) alert(error.message);
        else fetchResources();
    };

    const fetchCertificates = async () => {
        const { data } = await supabase.from("certificates").select("*");
        if (data) setIssuedCerts(data);
    };

    const issueCertificate = async (studentId: string) => {
        if (!confirm("Issue certificate to this student?")) return;
        const { error } = await supabase.from("certificates").insert({
            student_id: studentId,
            issue_date: new Date().toISOString()
        });
        if (error) alert("Certificate already issued or system error.");
        else {
            alert("✅ Certificate Issued!");
            fetchCertificates();
        }
    };

    const saveTeacherNotes = async (studentId: string, notes: string) => {
        const { error } = await supabase.from("students").update({ teacher_notes: notes }).eq("id", studentId);
        if (!error) {
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, teacher_notes: notes } : s));
        }
    };

    const exportStudentsCSV = () => {
        const headers = ["Name", "Email", "Phone", "Username", "Batch", "Status"];
        const rows = students.map(s => [s.name, s.email, s.phone, s.username, s.batch, s.status].join(","));
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Markiety_Students_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showToast("Student list exported successfully!");
    };

    const grantBadge = async (studentId: string, badgeId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        const currentBadges = Array.isArray(student.badges) ? student.badges : [];
        if (currentBadges.includes(badgeId)) {
            // Revoke
            const nextBadges = currentBadges.filter((b: string) => b !== badgeId);
            const { error } = await supabase.from("students").update({ badges: nextBadges }).eq("id", studentId);
            if (!error) {
                setStudents(prev => prev.map(s => s.id === studentId ? { ...s, badges: nextBadges } : s));
                showToast("Badge revoked", "error");
            }
        } else {
            // Grant
            const nextBadges = [...currentBadges, badgeId];
            const { error } = await supabase.from("students").update({ badges: nextBadges }).eq("id", studentId);
            if (!error) {
                setStudents(prev => prev.map(s => s.id === studentId ? { ...s, badges: nextBadges } : s));
                showToast("Badge granted!", "success");
            }
        }
    };

    const fetchSettings = async () => {
        const { data } = await supabase.from("app_settings").select("key, value");
        if (data) {
            const kv = Object.fromEntries(data.map((r: any) => [r.key, r.value]));
            setMeetingLink(kv.meeting_link || "");
            setNextClassTime(kv.next_class_time || "Tonight, 08:00 PM");
            setNextClassTopic(kv.next_class_topic || "Advanced Sentence Structures");
        }
    };

    const fetchContent = async () => {
        const [hw, subs, notes] = await Promise.all([
            supabase.from("homework").select("*").order("created_at", { ascending: false }),
            supabase.from("submissions").select("*, students(name)").order("created_at", { ascending: false }),
            supabase.from("notifications").select("*").order("created_at", { ascending: false }),
        ]);
        if (hw.data) setHomeworks(hw.data);
        if (subs.data) setSubmissions(subs.data);
        if (notes.data) setBroadcasts(notes.data);
    };

    const approve = async (enroll: any) => {
        // Just set the state to open the modal, don't perform DB action yet
        setApprovingEnrollment(enroll);
        setNewStudent({
            name: enroll.guest_name || "",
            email: enroll.guest_email || "",
            phone: enroll.guest_whatsapp || "",
            username: (enroll.guest_name || "").toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 100),
            password: Math.random().toString(36).slice(-8).toUpperCase(),
            batch: "Batch #04"
        });
        setTab("students");
        showToast("Prepare student account to approve", "success");
    };

    const confirmApproval = async () => {
        if (!approvingEnrollment) return;
        setIsLoading(true);

        try {
            // 1. Create student account
            const { data: studentData, error: studentError } = await supabase.from("students").insert(newStudent).select().single();
            if (studentError) throw studentError;

            // 2. Update enrollment status
            const { error: enrollError } = await supabase.from("enrollments").update({ status: "approved" }).eq("id", approvingEnrollment.id);
            if (enrollError) throw enrollError;

            // 3. Send welcome email
            try {
                await fetch(window.location.origin + "/api/send-email", {
                    method: "POST",
                    body: JSON.stringify({
                        to: studentData.email,
                        subject: "Welcome to Markiety English!",
                        type: "enrollment_approved",
                        data: { name: studentData.name, username: studentData.username, password: studentData.password }
                    })
                });
            } catch (e) { console.error("Email error:", e); }

            // 4. Update UI
            setStudents(prev => [studentData, ...prev]);
            setEnrollments(prev => prev.filter(e => e.id !== approvingEnrollment.id));
            setApprovingEnrollment(null);
            setNewStudent({ name: "", email: "", phone: "", username: "", password: "", batch: "Batch #04" });
            fetchStats();
            showToast("Enrollment approved & Student account created!", "success");
        } catch (error: any) {
            alert("Approval failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const reject = async (id: string) => {
        await supabase.from("enrollments").update({ status: "rejected" }).eq("id", id);
        setEnrollments(prev => prev.filter(e => e.id !== id));
    };

    const createStudent = async () => {
        if (!newStudent.name || !newStudent.username || !newStudent.password) {
            alert("Name, username, and password are required."); return;
        }
        const { data, error } = await supabase.from("students").insert(newStudent).select().single();
        if (error) { alert("Error: " + error.message); return; }
        if (data) {
            setStudents(prev => [data, ...prev]);
            // Send Welcome Email
            try {
                await fetch(window.location.origin + "/api/send-email", {
                    method: "POST",
                    body: JSON.stringify({
                        to: data.email,
                        subject: "Welcome to Markiety English!",
                        type: "enrollment_approved",
                        data: { name: data.name, username: data.username, password: data.password }
                    })
                });
            } catch (e) { console.error("Email error:", e); }
        }
        setNewStudent({ name: "", email: "", phone: "", username: "", password: "", batch: "Batch #04" });
        fetchStats();
        alert(`✅ Account created & Welcome Email Sent!\nUsername: ${newStudent.username}\nPassword: ${newStudent.password}`);
    };

    const suspendStudent = async (id: string, current: string) => {
        const next = current === "active" ? "suspended" : "active";
        await supabase.from("students").update({ status: next }).eq("id", id);
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: next } : s));
    };

    const sendMessage = async () => {
        if (!chatInput.trim() || !selectedStudent || isSending) return;
        setIsSending(true);
        const msg = chatInput.trim();
        setChatInput("");
        const { data } = await supabase.from("chat_messages").insert({
            student_id: selectedStudent.id,
            sender: "admin",
            message: msg,
            msg_type: "text",
        }).select().single();
        if (data) {
            setAllChatMsgs(prev => ({
                ...prev,
                [selectedStudent.id]: [...(prev[selectedStudent.id] || []), data]
            }));
        }
        setIsSending(false);
    };

    const sendHomeworkMsg = async (hwTitle: string) => {
        if (!selectedStudent) return;
        const { data } = await supabase.from("chat_messages").insert({
            student_id: selectedStudent.id,
            sender: "admin",
            message: `📚 New Homework: ${hwTitle}`,
            msg_type: "homework",
        }).select().single();
        if (data) {
            setAllChatMsgs(prev => ({
                ...prev,
                [selectedStudent.id]: [...(prev[selectedStudent.id] || []), data]
            }));
        }
    };

    const selectStudent = async (student: any) => {
        setSelectedStudent(student);
        // Mark student messages as read
        await supabase.from("chat_messages")
            .update({ is_read: true })
            .eq("student_id", student.id)
            .eq("sender", "student")
            .eq("is_read", false);
        setUnreadPerStudent(prev => ({ ...prev, [student.id]: 0 }));
    };

    const saveSettings = async () => {
        const updates = [
            { key: "meeting_link", value: meetingLink },
            { key: "next_class_time", value: nextClassTime },
            { key: "next_class_topic", value: nextClassTopic },
        ];
        for (const u of updates) {
            await supabase.from("app_settings").upsert(u, { onConflict: "key" });
        }
        alert("✅ Settings saved! Students will see updates immediately.");
    };

    const postHomework = async () => {
        if (!hwForm.title) return;
        const { data } = await supabase.from("homework").insert(hwForm).select().single();
        if (data) { setHomeworks(prev => [data, ...prev]); setHwForm({ title: "", description: "" }); }
    };

    const deleteHomework = async (id: string) => {
        await supabase.from("homework").delete().eq("id", id);
        setHomeworks(prev => prev.filter(h => h.id !== id));
    };

    const handleFeedbackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingFeedback(true);
        try {
            const fileName = `feedback-${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from("feedback").upload(fileName, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from("feedback").getPublicUrl(fileName);
            setFbFileUrl(publicUrl);
            alert("✅ Resource attached!");
        } catch (e: any) { alert("Upload fail: " + e.message); }
        finally { setIsUploadingFeedback(false); }
    };

    const sendBroadcast = async () => {
        if (!broadcast) return;
        const { data } = await supabase.from("notifications").insert({ message: broadcast, type: "broadcast" }).select().single();
        if (data) { setBroadcasts(prev => [data, ...prev]); setBroadcast(""); }
    };

    const reviewSubmission = async (subId: string, feedback: string) => {
        const submission = submissions.find(s => s.id === subId);
        const { error } = await supabase.from("submissions").update({
            status: "reviewed",
            admin_feedback: feedback,
            admin_feedback_url: fbFileUrl
        }).eq("id", subId);

        if (!error) {
            setSubmissions(prev => prev.map(s => s.id === subId ? {
                ...s, status: "reviewed", admin_feedback: feedback, admin_feedback_url: fbFileUrl
            } : s));

            // Send Email Notification
            if (submission?.students?.email) {
                try {
                    await fetch(window.location.origin + "/api/send-email", {
                        method: "POST",
                        body: JSON.stringify({
                            to: submission.students.email,
                            subject: "Homework Reviewed - Markiety English",
                            type: "homework_feedback",
                            data: {
                                name: submission.students.name,
                                homeworkTitle: "Your Assignment",
                                feedback
                            }
                        })
                    });
                } catch (e) { console.error("Email error:", e); }
            }
            setFbFileUrl(null); // Reset
        }
    };

    const totalUnread = Object.values(unreadPerStudent).reduce((a, b) => a + b, 0);

    if (!isAuth) return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-3 mb-10">
                    <img src="/logo.png" alt="Logo" className="size-12 rounded-xl" />
                    <span className="text-xl font-extrabold tracking-tighter text-white italic">Markiety Admin</span>
                </div>
                <GlassCard className="p-8">
                    <Settings className="size-10 text-primary mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-center mb-1">Admin Access</h1>
                    <p className="text-sm text-muted-foreground text-center mb-6">Enter password to manage Markiety LMS</p>
                    <form onSubmit={login} className="space-y-4">
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="Admin password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center outline-none focus:border-primary/50 transition-all pr-10"
                                value={passInput}
                                onChange={e => setPassInput(e.target.value)}
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <Button type="submit" className="w-full">Enter Portal</Button>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );

    const TABS: { id: Tab; label: string; icon: any; badge?: number }[] = [
        { id: "enrollments", label: "Enrollments", icon: ClipboardCheck, badge: enrollments.length },
        { id: "students", label: "Students", icon: Users, badge: stats.students },
        { id: "chat", label: "Chat", icon: MessageCircle, badge: totalUnread },
        { id: "content", label: "Content", icon: BookPlus },
        { id: "curriculum", label: "Curriculum", icon: MapIcon },
        { id: "lms", label: "LMS", icon: GraduationCap },
        { id: "attendance", label: "Attendance", icon: Clock },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#020202] text-white">
            {/* Top Nav */}
            <nav className="h-14 border-b border-white/5 px-6 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-md z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="size-8 rounded-lg" />
                        <span className="font-extrabold tracking-tighter italic text-sm">Markiety Admin</span>
                    </div>
                    <div className="hidden md:flex gap-1">
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all relative",
                                    tab === t.id ? "text-primary bg-primary/10" : "text-white/40 hover:text-white hover:bg-white/5"
                                )}>
                                <t.icon className="size-3.5" />
                                {t.label}
                                {t.badge && t.badge > 0 ? (
                                    <span className="ml-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t.badge}</span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadAll} className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                        <RefreshCw className="size-3.5" />
                    </button>
                    <button onClick={() => { sessionStorage.removeItem("admin_auth"); window.location.reload(); }}
                        className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors">
                        <LogOut className="size-3.5" />
                    </button>
                </div>
            </nav>

            {/* Toast Container */}
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

            {/* Mobile tab bar */}
            <div className="md:hidden flex overflow-x-auto border-b border-white/5 bg-black/80">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={cn("flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
                            tab === t.id ? "text-primary border-b-2 border-primary" : "text-white/40")}>
                        <t.icon className="size-3.5" />
                        {t.label}
                        {t.badge && t.badge > 0 ? <span className="bg-primary text-white text-[8px] px-1 rounded-full">{t.badge}</span> : null}
                    </button>
                ))}
            </div>

            <main className="max-w-7xl mx-auto p-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: "Active Students", value: stats.students, sub: `${(stats as any).online || 0} online last 24h` },
                        { label: "Certificates", value: (stats as any).certificates || 0, sub: "Issued to date" },
                        { label: "Homeworks", value: (stats as any).submissions || 0, sub: "Total submissions" },
                        { label: "Revenue (BDT)", value: `৳${(stats.revenue).toLocaleString()}`, sub: "Approved × 2500" },
                        { label: "Pending Review", value: stats.pending, sub: "Enrollment queue" },
                    ].map((s, i) => (
                        <GlassCard key={i} className="p-4">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{s.label}</p>
                            <h3 className="text-2xl font-black text-white">{s.value}</h3>
                            <p className="text-[10px] text-primary mt-1">{s.sub}</p>
                        </GlassCard>
                    ))}
                </div>

                {tab === "enrollments" && <BusinessIntelligence data={biData} />}

                {/* ─── ENROLLMENTS TAB ─── */}
                {tab === "enrollments" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ClipboardCheck className="size-5 text-primary" />
                                {enrollments.length > 0 && <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs px-2 py-0.5 rounded-full font-bold">{enrollments.length} pending</span>}
                            </h2>
                            <Button variant="secondary" size="sm" icon={FileDown} onClick={exportStudentsCSV} className="text-[10px] h-8">Export Students</Button>
                        </div>

                        {enrollments.length === 0 ? (
                            <GlassCard className="p-12 text-center">
                                <CheckCircle className="size-10 text-green-400 mx-auto mb-3" />
                                <p className="text-white/40 text-sm italic">All caught up! No pending enrollments.</p>
                            </GlassCard>
                        ) : enrollments
                            .filter(e => e.transaction_id?.toLowerCase().includes(searchQ.toLowerCase()) || (e.guest_name || "").toLowerCase().includes(searchQ.toLowerCase()))
                            .map(e => (
                                <GlassCard key={e.id} className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
                                                {(e.guest_name || e.transaction_id || "A")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-bold">{e.guest_name || "Student"}</p>
                                                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border",
                                                        (e.status === "pending" || !e.status) ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                    )}>{e.status || "pending"}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                                                    {e.guest_email && <span>📧 {e.guest_email}</span>}
                                                    {e.guest_whatsapp && <span>📱 {e.guest_whatsapp}</span>}
                                                    <span>💳 TrxID: <span className="font-mono font-bold text-white/70">{e.transaction_id || "—"}</span></span>
                                                    {e.method && <span className={cn("font-bold px-2 py-0.5 rounded-full",
                                                        e.method === "bKash" ? "bg-pink-500/10 text-pink-400" :
                                                            e.method === "Nagad" ? "bg-orange-500/10 text-orange-400" :
                                                                "bg-blue-500/10 text-blue-400"
                                                    )}>{e.method}</span>}
                                                </div>
                                                {e.created_at && <p className="text-[10px] text-muted-foreground mt-1">{formatTime(e.created_at)}</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => reject(e.id)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold">
                                                <X className="size-3.5" /> Reject
                                            </button>
                                            <button onClick={() => approve(e)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all text-xs font-bold">
                                                <Check className="size-3.5" /> Approve
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                    </div>
                )
                }

                {/* ─── STUDENTS TAB ─── */}
                {
                    tab === "students" && (
                        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
                            {/* Create Account Form */}
                            <GlassCard className="p-6 h-fit">
                                <h3 className="font-bold flex items-center gap-2 mb-5">
                                    <UserPlus className="size-4 text-primary" />
                                    {approvingEnrollment ? "Approve Enrollment & Create Account" : "Create Student Account"}
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { key: "name", label: "Full Name *", placeholder: "John Doe" },
                                        { key: "email", label: "Email", placeholder: "student@email.com" },
                                        { key: "phone", label: "Phone / WhatsApp", placeholder: "+880 1XXX XXXXXX" },
                                        { key: "batch", label: "Batch", placeholder: "Batch #04" },
                                        { key: "username", label: "Username *", placeholder: "john_doe" },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">{f.label}</label>
                                            <input
                                                type="text"
                                                placeholder={f.placeholder}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/20"
                                                value={(newStudent as any)[f.key]}
                                                onChange={e => setNewStudent(prev => ({ ...prev, [f.key]: e.target.value }))}
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">Password *</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
                                            <input
                                                type={showNewStudentPass ? "text" : "password"}
                                                placeholder="Set their password"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-9 pr-10 text-sm outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/20"
                                                value={newStudent.password}
                                                onChange={e => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                                            />
                                            <button type="button" onClick={() => setShowNewStudentPass(!showNewStudentPass)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                                {showNewStudentPass ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    {approvingEnrollment ? (
                                        <div className="flex gap-2">
                                            <Button className="flex-1" icon={Check} onClick={confirmApproval} disabled={isLoading}>
                                                {isLoading ? "Approving..." : "Confirm Approval"}
                                            </Button>
                                            <Button variant="secondary" className="px-4" onClick={() => {
                                                setApprovingEnrollment(null);
                                                setNewStudent({ name: "", email: "", phone: "", username: "", password: "", batch: "Batch #04" });
                                            }}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <Button className="w-full" icon={UserPlus} onClick={createStudent}>Create Account</Button>
                                    )}
                                </div>
                                {approvingEnrollment && (
                                    <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-[10px] text-primary leading-relaxed">
                                        <p className="font-bold mb-1">💡 Approval Workflow:</p>
                                        Confirming will create the student account, update the enrollment status to "Approved", and send the welcome email automatically.
                                    </div>
                                )}
                            </GlassCard>

                            {/* Students List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Users className="size-4 text-primary" />
                                        All Students ({students.length})
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-primary/50 w-48"
                                                value={searchQ}
                                                onChange={e => setSearchQ(e.target.value)}
                                            />
                                        </div>
                                        <Button variant="secondary" size="sm" icon={FileDown} onClick={exportStudentsCSV} className="text-[10px] h-8 px-3">Export CSV</Button>
                                    </div>
                                </div>
                                {students.filter(s =>
                                    s.name.toLowerCase().includes(searchQ.toLowerCase()) ||
                                    s.username.toLowerCase().includes(searchQ.toLowerCase())
                                ).map(s => (
                                    <GlassCard key={s.id} className={cn("p-4", s.status === "suspended" && "opacity-60")}>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs">
                                                    {s.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{s.name}</p>
                                                    <div className="flex flex-wrap gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                                        <span className="font-mono text-white/60">@{s.username}</span>
                                                        {s.email && <span>{s.email}</span>}
                                                        {s.phone && <span>{s.phone}</span>}
                                                        <span className="text-primary/60">{s.batch}</span>
                                                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/40 border border-white/5">
                                                            Progress: {studentProgress[s.id] || 0}/8
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full",
                                                        s.status === "active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                                                        {s.status}
                                                    </span>
                                                    {s.last_online && (
                                                        <span className="text-[8px] font-bold uppercase tracking-tighter opacity-40">
                                                            {new Date().getTime() - new Date(s.last_online).getTime() < 300000 ? (
                                                                <span className="flex items-center gap-1 text-green-500">
                                                                    <span className="size-1 bg-green-500 rounded-full animate-pulse" />
                                                                    Online
                                                                </span>
                                                            ) : (
                                                                `Last Seen: ${formatTime(s.last_online)}`
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                <button onClick={() => { setSelectedStudent(s); setIsViewingDetails(true); }}
                                                    className="size-7 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center"
                                                    title="View Profile">
                                                    <LayoutDashboard className="size-3.5" />
                                                </button>
                                                <button onClick={() => { setSelectedStudent(s); setTab("chat"); }}
                                                    className="size-7 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                                                    title="Chat">
                                                    <MessageCircle className="size-3.5" />
                                                </button>
                                                <button onClick={() => suspendStudent(s.id, s.status)}
                                                    className="size-7 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center"
                                                    title={s.status === "active" ? "Suspend" : "Reactivate"}>
                                                    {s.status === "active" ? <X className="size-3.5" /> : <Check className="size-3.5" />}
                                                </button>
                                                <button onClick={() => issueCertificate(s.id)}
                                                    className={cn("size-7 rounded-lg transition-all flex items-center justify-center",
                                                        issuedCerts.some((c: any) => c.student_id === s.id) ? "bg-green-500/10 text-green-400 cursor-default" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                                                    )}
                                                    title="Issue Certificate">
                                                    <GraduationCap className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* ─── STUDENT 360 MODAL ─── */}
                <AnimatePresence>
                    {isViewingDetails && selectedStudent && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsViewingDetails(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden relative shadow-2xl">

                                <div className="h-32 bg-primary/10 relative">
                                    <button onClick={() => setIsViewingDetails(false)} className="absolute top-4 right-4 size-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black transition-colors">
                                        <X className="size-5" />
                                    </button>
                                    <div className="absolute -bottom-10 left-8">
                                        <div className="size-24 rounded-3xl bg-primary border-4 border-[#0a0a0a] flex items-center justify-center text-3xl font-black shadow-xl">
                                            {selectedStudent.name[0].toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 pt-12 overflow-y-auto max-h-[calc(90vh-128px)]">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                                        <div>
                                            <h2 className="text-3xl font-black italic tracking-tighter">{selectedStudent.name}</h2>
                                            <p className="text-muted-foreground font-mono text-sm">@{selectedStudent.username} · {selectedStudent.batch}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => { setIsViewingDetails(false); setTab("chat"); }}>
                                                <MessageCircle className="size-4 mr-2" /> Message Student
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 space-y-6">
                                            {/* Stats Cards */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                                    <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Attendance</p>
                                                    <p className="text-xl font-bold">{attendanceList.filter(a => a.student_id === selectedStudent.id).length} Sessions</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                                    <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Submissions</p>
                                                    <p className="text-xl font-bold">{submissions.filter(s => s.student_id === selectedStudent.id).length} Files</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                                    <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Progress</p>
                                                    <p className="text-xl font-bold">{studentProgress[selectedStudent.id] || 0}/8 Weeks</p>
                                                </div>
                                            </div>

                                            {/* Homework History */}
                                            <div className="space-y-3">
                                                <h3 className="font-bold flex items-center gap-2">
                                                    <BookOpen className="size-4 text-primary" /> Submission History
                                                </h3>
                                                <div className="space-y-2">
                                                    {submissions.filter(s => s.student_id === selectedStudent.id).map(sub => (
                                                        <div key={sub.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-bold">{homeworks.find(h => h.id === sub.homework_id)?.title || "Unknown Assignment"}</p>
                                                                <p className="text-[10px] text-white/40">{formatTime(sub.created_at)}</p>
                                                            </div>
                                                            <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                                                                sub.status === "reviewed" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
                                                            )}>{sub.status}</span>
                                                        </div>
                                                    ))}
                                                    {submissions.filter(s => s.student_id === selectedStudent.id).length === 0 && (
                                                        <p className="text-center py-8 text-xs text-white/20 italic">No submissions yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Teacher Notes */}
                                            <div className="space-y-3">
                                                <h3 className="font-bold flex items-center gap-2">
                                                    <FileText className="size-4 text-primary" /> Private Teacher Notes
                                                </h3>
                                                <textarea
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-primary/50 min-h-[200px] resize-none"
                                                    placeholder="Add private observations, weak points, or growth notes..."
                                                    defaultValue={selectedStudent.teacher_notes || ""}
                                                    onBlur={(e) => saveTeacherNotes(selectedStudent.id, e.target.value)}
                                                />
                                                <p className="text-[9px] text-white/20 italic">Changes are saved automatically when you click away.</p>
                                            </div>

                                            {/* Badges Section */}
                                            <div className="space-y-3">
                                                <h3 className="font-bold flex items-center justify-between">
                                                    <div className="flex items-center gap-2"><Award className="size-4 text-orange-400" /> Student Badges</div>
                                                    <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Click to toggle</span>
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {AVAILABLE_BADGES.map((b) => {
                                                        const isEarned = (selectedStudent.badges || []).includes(b.id);
                                                        return (
                                                            <button
                                                                key={b.id}
                                                                onClick={() => grantBadge(selectedStudent.id, b.id)}
                                                                className={cn(
                                                                    "px-2.5 py-1.5 rounded-xl border transition-all text-[10px] font-bold flex items-center gap-2",
                                                                    isEarned
                                                                        ? b.color
                                                                        : "bg-white/5 border-white/5 text-white/20 grayscale scale-95 opacity-50 hover:opacity-100 hover:grayscale-0 hover:scale-100"
                                                                )}
                                                            >
                                                                <span>{b.icon}</span>
                                                                {b.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ─── CHAT TAB ─── */}
                {
                    tab === "chat" && (
                        <div className="grid md:grid-cols-[280px_1fr] gap-6" style={{ height: "calc(100vh - 220px)" }}>
                            {/* Student List */}
                            <GlassCard className="p-0 overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-white/5">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <MessageCircle className="size-4 text-primary" /> Students
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                                    {students.length === 0 && (
                                        <p className="p-4 text-xs text-white/30 italic text-center">No students yet</p>
                                    )}
                                    {students.map(s => {
                                        const msgs = allChatMsgs[s.id] || [];
                                        const lastMsg = msgs[msgs.length - 1];
                                        const unread = unreadPerStudent[s.id] || 0;
                                        return (
                                            <button key={s.id} onClick={() => selectStudent(s)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-all text-left",
                                                    selectedStudent?.id === s.id && "bg-primary/10 border-l-2 border-primary"
                                                )}>
                                                <div className="size-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs flex-shrink-0">
                                                    {s.name[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-bold truncate">{s.name}</p>
                                                        {unread > 0 && (
                                                            <span className="bg-red-500 text-white text-[9px] size-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                                                {unread}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {lastMsg && (
                                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                            {lastMsg.sender === "admin" ? "You: " : ""}{lastMsg.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </GlassCard>

                            {/* Chat Window */}
                            {selectedStudent ? (
                                <GlassCard className="p-0 overflow-hidden flex flex-col">
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-white/5 flex items-center gap-3">
                                        <div className="size-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs">
                                            {selectedStudent.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{selectedStudent.name}</p>
                                            <p className="text-[10px] text-muted-foreground">@{selectedStudent.username} · {selectedStudent.batch}</p>
                                        </div>
                                        {/* Send Homework Dropdown */}
                                        <div className="ml-auto flex gap-2">
                                            {homeworks.slice(0, 3).map(hw => (
                                                <button key={hw.id} onClick={() => sendHomeworkMsg(hw.title)}
                                                    className="text-[10px] px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all font-bold border border-orange-500/20">
                                                    📚 {hw.title.slice(0, 20)}...
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                        {(allChatMsgs[selectedStudent.id] || []).length === 0 && (
                                            <div className="text-center py-8">
                                                <MessageCircle className="size-8 text-white/20 mx-auto mb-2" />
                                                <p className="text-white/30 text-xs italic">No messages yet. Start the conversation!</p>
                                            </div>
                                        )}
                                        {(allChatMsgs[selectedStudent.id] || []).map((msg, i) => {
                                            const isAdmin = msg.sender === "admin";
                                            return (
                                                <div key={i} className={cn("flex gap-2", isAdmin ? "justify-end" : "justify-start")}>
                                                    {!isAdmin && (
                                                        <div className="size-7 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white/60 text-[10px] flex-shrink-0 mt-1">
                                                            {selectedStudent.name[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className={cn("max-w-[65%] space-y-1", isAdmin && "items-end flex flex-col")}>
                                                        <div className={cn(
                                                            "px-4 py-2.5 rounded-2xl text-xs leading-relaxed",
                                                            isAdmin
                                                                ? "bg-primary text-white rounded-tr-none"
                                                                : msg.msg_type === "homework"
                                                                    ? "bg-orange-500/10 border border-orange-500/20 rounded-tl-none text-white/90"
                                                                    : "bg-white/5 border border-white/10 rounded-tl-none text-white/90"
                                                        )}>
                                                            {msg.message}
                                                        </div>
                                                        <p className="text-[9px] text-muted-foreground px-1">{formatTime(msg.created_at)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="p-4 border-t border-white/5 flex gap-3">
                                        <input
                                            type="text"
                                            placeholder={`Message ${selectedStudent.name}...`}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/50 transition-all"
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                                        />
                                        <button onClick={sendMessage} disabled={!chatInput.trim() || isSending}
                                            className="size-11 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-all disabled:opacity-40">
                                            <Send className="size-4" />
                                        </button>
                                    </div>
                                </GlassCard>
                            ) : (
                                <GlassCard className="flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageCircle className="size-10 text-white/20 mx-auto mb-3" />
                                        <p className="text-white/30 text-sm italic">Select a student to start chatting</p>
                                    </div>
                                </GlassCard>
                            )}
                        </div>
                    )
                }

                {/* ─── CONTENT TAB ─── */}
                {
                    tab === "content" && (
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Post Homework */}
                            <div className="space-y-4">
                                <GlassCard className="p-6">
                                    <h3 className="font-bold flex items-center gap-2 mb-5">
                                        <BookPlus className="size-4 text-primary" /> Post Homework
                                    </h3>
                                    <div className="space-y-3">
                                        <input type="text" placeholder="Title"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 text-white placeholder:text-white/20"
                                            value={hwForm.title} onChange={e => setHwForm(p => ({ ...p, title: e.target.value }))} />
                                        <textarea placeholder="Description (optional)" rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 text-white placeholder:text-white/20 resize-none"
                                            value={hwForm.description} onChange={e => setHwForm(p => ({ ...p, description: e.target.value }))} />
                                        <Button className="w-full" icon={Plus} onClick={postHomework}>Post Assignment</Button>
                                    </div>
                                </GlassCard>

                                {/* Homework List */}
                                <div className="space-y-2">
                                    {homeworks.map(hw => (
                                        <GlassCard key={hw.id} className="p-4 flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-sm">{hw.title}</p>
                                                <p className="text-[10px] text-muted-foreground">{formatTime(hw.created_at)}</p>
                                            </div>
                                            <button onClick={() => deleteHomework(hw.id)}
                                                className="size-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                                                <Trash2 className="size-3" />
                                            </button>
                                        </GlassCard>
                                    ))}
                                </div>
                            </div>

                            {/* Broadcasts + Submissions */}
                            <div className="space-y-4">
                                <GlassCard className="p-6">
                                    <h3 className="font-bold flex items-center gap-2 mb-5">
                                        <Megaphone className="size-4 text-primary" /> Send Broadcast
                                    </h3>
                                    <div className="space-y-3">
                                        <textarea placeholder="Announcement for all students..." rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 text-white placeholder:text-white/20 resize-none"
                                            value={broadcast} onChange={e => setBroadcast(e.target.value)} />
                                        <Button className="w-full" variant="secondary" icon={Bell} onClick={sendBroadcast}>Broadcast to All</Button>
                                    </div>
                                </GlassCard>

                                {/* Submissions Review */}
                                <GlassCard className="p-6">
                                    <h3 className="font-bold flex items-center gap-2 mb-4">
                                        <ClipboardCheck className="size-4 text-primary" /> Homework Submissions ({submissions.filter(s => s.status === "pending").length} pending)
                                    </h3>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {submissions.length === 0 && <p className="text-white/30 text-xs italic text-center py-4">No submissions yet</p>}
                                        {submissions.map(sub => (
                                            <div key={sub.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                                <div>
                                                    <p className="text-sm font-bold">{sub.students?.name || "Student"}</p>
                                                    <a href={sub.link} target="_blank" rel="noopener noreferrer"
                                                        className="text-[10px] text-primary hover:underline flex items-center gap-1">
                                                        <ExternalLink className="size-2.5" /> View Submission
                                                    </a>
                                                    <p className="text-[10px] text-muted-foreground">{formatTime(sub.created_at)}</p>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full text-center",
                                                        sub.status === "reviewed" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400")}>
                                                        {sub.status}
                                                    </span>
                                                    {sub.status === "pending" && (
                                                        reviewingId === sub.id ? (
                                                            <div className="flex flex-col gap-2 mt-2">
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Feedback..."
                                                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] outline-none focus:border-primary/50"
                                                                        value={fbInput}
                                                                        onChange={e => setFbInput(e.target.value)}
                                                                    />
                                                                    <input type="file" ref={fbFileRef} className="hidden" onChange={handleFeedbackUpload} />
                                                                    <button
                                                                        onClick={() => fbFileRef.current?.click()}
                                                                        className={cn("size-8 rounded-lg flex items-center justify-center transition-all",
                                                                            fbFileUrl ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/40 hover:bg-white/10")}
                                                                    >
                                                                        {isUploadingFeedback ? <RefreshCw className="size-3 animate-spin" /> : <LinkIcon className="size-3" />}
                                                                    </button>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {fbTemplates.map((t, idx) => (
                                                                        <button key={idx} onClick={() => setFbInput(t)}
                                                                            className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[7px] text-white/40 hover:bg-primary/20 hover:text-primary transition-all">
                                                                            Template {idx + 1}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => { reviewSubmission(sub.id, fbInput); setReviewingId(null); setFbInput(""); }}
                                                                        className="flex-1 text-[8px] py-1 bg-primary rounded-lg font-bold">Done</button>
                                                                    <button onClick={() => { setReviewingId(null); setFbFileUrl(null); }}
                                                                        className="flex-1 text-[8px] py-1 bg-white/5 rounded-lg">✕</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => { setReviewingId(sub.id); setFbInput("Good work!"); }}
                                                                className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold">
                                                                Review
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    )
                }

                {/* ─── SETTINGS TAB ─── */}
                {
                    tab === "settings" && (
                        <div className="max-w-2xl space-y-6">
                            <GlassCard className="p-6">
                                <h3 className="font-bold flex items-center gap-2 mb-5">
                                    <Video className="size-4 text-primary" /> Virtual Classroom
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Meeting Link</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                                                <input type="url" placeholder="https://meet.google.com/..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-sm outline-none focus:border-primary/50 text-white placeholder:text-white/20"
                                                    value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
                                            </div>
                                            {meetingLink && (
                                                <a href={meetingLink} target="_blank" rel="noopener noreferrer"
                                                    className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary transition-colors">
                                                    <ExternalLink className="size-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Next Class Time</label>
                                        <input type="text" placeholder="Tonight, 08:00 PM"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 text-white placeholder:text-white/20"
                                            value={nextClassTime} onChange={e => setNextClassTime(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Next Class Topic</label>
                                        <input type="text" placeholder="Topic for the next session..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 text-white placeholder:text-white/20"
                                            value={nextClassTopic} onChange={e => setNextClassTopic(e.target.value)} />
                                    </div>
                                    <Button className="w-full" onClick={saveSettings}>Save & Publish to Students</Button>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6 border-orange-500/20 bg-orange-500/5">
                                <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                                    <Bell className="size-4" /> How Meeting Links Work
                                </h4>
                                <ul className="text-sm text-white/60 space-y-2 list-disc list-inside leading-relaxed">
                                    <li>Paste your Google Meet, Zoom, or Discord link above</li>
                                    <li>Students see a "Join Virtual Classroom" button in their dashboard</li>
                                    <li>Update the link before each class session</li>
                                    <li>The next class time and topic also appear on student dashboards</li>
                                </ul>
                            </GlassCard>
                        </div>
                    )
                }

                {/* ─── LMS TAB ─── */}
                {
                    tab === "lms" && (
                        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
                            {/* Add Resource Form */}
                            <GlassCard className="p-6 h-fit">
                                <h3 className="font-bold flex items-center gap-2 mb-5">
                                    <Plus className="size-4 text-primary" /> Add Course Resource
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Title</label>
                                        <input type="text" placeholder="e.g. Class #08 Recording"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 text-white placeholder:text-white/20"
                                            value={resForm.title} onChange={e => setResForm({ ...resForm, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Category</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 text-white appearance-none"
                                            value={resForm.category} onChange={e => setResForm({ ...resForm, category: e.target.value })}>
                                            <option value="Class Recording">🎥 Class Recording</option>
                                            <option value="PDF Notes">📄 PDF Notes</option>
                                            <option value="Resource Link">🔗 Resource Link</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Resource Link (URL)</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                                            <input type="url" placeholder="https://youtube.com/... or https://drive.google.com/..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-sm outline-none focus:border-primary/50 text-white"
                                                value={resForm.link} onChange={e => setResForm({ ...resForm, link: e.target.value })} />
                                        </div>
                                    </div>
                                    <Button className="w-full" disabled={isSending} onClick={addResource}>
                                        {isSending ? "Adding..." : "Add to Library"}
                                    </Button>
                                </div>
                            </GlassCard>

                            {/* Resource List */}
                            <div className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {courseResources.map((res: any) => (
                                        <GlassCard key={res.id} className="p-5 group hover:border-primary/20 transition-all">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn("size-10 rounded-xl flex items-center justify-center border",
                                                        res.category === "Class Recording" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                                            res.category === "PDF Notes" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                                                "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                                    )}>
                                                        {res.category === "Class Recording" ? <Video className="size-5" /> :
                                                            res.category === "PDF Notes" ? <FileText className="size-5" /> :
                                                                <LinkIcon className="size-5" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm leading-tight mb-1">{res.title}</h4>
                                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{res.category}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href={res.link} target="_blank" rel="noopener noreferrer"
                                                        className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:bg-white/10 transition-all">
                                                        <ExternalLink className="size-3.5" />
                                                    </a>
                                                    <button onClick={() => deleteResource(res.id)}
                                                        className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/10 transition-all">
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                                {courseResources.length === 0 && (
                                    <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/5 text-white/20">
                                        <BookPlus className="size-12 mx-auto mb-4 opacity-5" />
                                        <p className="font-bold italic">No resources added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
                {
                    tab === "attendance" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight italic">Attendance Log</h2>
                                    <p className="text-sm text-muted-foreground">Students joined in virtual classroom</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                                    <input
                                        type="text"
                                        placeholder="Search student..."
                                        className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-primary/50 w-64"
                                        value={attSearch}
                                        onChange={e => setAttSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <GlassCard className="overflow-hidden">
                                <div className="grid grid-cols-3 p-4 border-b border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    <div>Student</div>
                                    <div>Class Topic</div>
                                    <div className="text-right">Time Joined</div>
                                </div>
                                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                                    {attendanceList.filter(a => a.students?.name.toLowerCase().includes(attSearch.toLowerCase())).map((att, i) => (
                                        <div key={i} className="grid grid-cols-3 p-4 items-center hover:bg-white/[0.01] transition-colors">
                                            <div className="font-bold text-sm">{att.students?.name}</div>
                                            <div className="text-xs text-white/60 truncate pr-4">{att.class_topic}</div>
                                            <div className="text-right text-[10px] text-muted-foreground">{formatTime(att.joined_at)}</div>
                                        </div>
                                    ))}
                                    {attendanceList.length === 0 && (
                                        <div className="p-12 text-center text-white/20 italic text-sm">No attendance records yet</div>
                                    )}
                                </div>
                            </GlassCard>
                        </div>
                    )
                }

                {/* ─── CURRICULUM TAB ─── */}
                {
                    tab === "curriculum" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight italic">Curriculum Manager</h2>
                                <p className="text-sm text-muted-foreground">Manage the 8-week learning roadmap</p>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                                    {syllabusData.map((week) => (
                                        <GlassCard key={week.week_number} className={cn("p-5 cursor-pointer transition-all", editingWeek?.week_number === week.week_number ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10" : "hover:border-white/20")}
                                            onClick={() => setEditingWeek({ ...week, topicsStr: week.topics.join(", ") })}>
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-primary">
                                                    {week.week_number}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm">{week.title}</h4>
                                                    <p className="text-[10px] text-white/40 truncate mt-1">{week.description}</p>
                                                </div>
                                                <ChevronRight className="size-4 text-white/20" />
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>

                                <div className="sticky top-0">
                                    {editingWeek ? (
                                        <GlassCard className="p-8 border-primary/20">
                                            <h3 className="text-xl font-bold mb-6 italic">Edit Week {editingWeek.week_number}</h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Title</label>
                                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50"
                                                        value={editingWeek.title} onChange={e => setEditingWeek({ ...editingWeek, title: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Description</label>
                                                    <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 resize-none"
                                                        value={editingWeek.description} onChange={e => setEditingWeek({ ...editingWeek, description: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Topics (Comma separated)</label>
                                                    <textarea rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 resize-none font-medium"
                                                        value={editingWeek.topicsStr} onChange={e => setEditingWeek({ ...editingWeek, topicsStr: e.target.value })} />
                                                </div>
                                                <div className="flex gap-3 pt-4">
                                                    <Button variant="secondary" className="flex-1" onClick={() => setEditingWeek(null)}>Cancel</Button>
                                                    <Button className="flex-1" icon={Check}
                                                        onClick={() => updateSyllabusWeek({ ...editingWeek, topics: editingWeek.topicsStr.split(",").map((s: string) => s.trim()).filter(Boolean) })}>
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ) : (
                                        <GlassCard className="p-12 text-center border-dashed border-white/10 flex flex-col items-center justify-center h-full min-h-[400px]">
                                            <MapIcon className="size-12 text-white/5 mb-4" />
                                            <p className="text-white/20 italic text-sm">Select a week from the list to edit its content</p>
                                        </GlassCard>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}


            </main >
        </div >
    );
}

// for the status icon
function CheckCircle({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
