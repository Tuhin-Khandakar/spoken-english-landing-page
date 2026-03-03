
"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award, ShieldCheck, Download, X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";


interface CertificateProps {
    studentName: string;
    courseName: string;
    date: string;
    certId?: string;
    onClose: () => void;
}

export const CertificateTemplate = ({ studentName, courseName, date, certId, onClose }: CertificateProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handlePrint = async () => {
        setIsGenerating(true);
        const element = document.getElementById("print-section");
        if (element) {
            try {
                const html2canvas = (await import("html2canvas")).default;
                const { jsPDF } = await import("jspdf");
                const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
                const imgData = canvas.toDataURL("image/jpeg", 1.0);
                const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
                pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
                pdf.save(`Markiety_Certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
            } catch (err) {
                console.error("PDF gen fail", err);
                window.print(); // Fallback to browser print if rendering fails
            }
        } else {
            window.print();
        }
        setIsGenerating(false);
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col items-center overflow-y-auto p-4 md:p-8">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: landscape; margin: 0; }
                    body * { visibility: hidden; }
                    #print-section, #print-section * { visibility: visible; }
                    #print-section { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; background: white !important; }
                }
            `}} />

            {/* Floating Close Button - Always Visible */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 z-[310] size-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-red-500 transition-all no-print"
            >
                <X className="size-6" />
            </button>

            <div className="max-w-4xl w-full my-auto">
                <div className="flex justify-between items-center mb-6 no-print px-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Award className="text-primary" /> Your Certificate
                    </h2>
                    <div className="flex gap-3">
                        <button onClick={handlePrint} disabled={isGenerating} className="px-6 py-2 bg-primary rounded-xl font-bold text-white flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
                            {isGenerating ? <RefreshCw className="size-4 animate-spin" /> : <Download className="size-4" />}
                            {isGenerating ? "Generating PDF..." : "Download PDF"}
                        </button>
                    </div>
                </div>

                <motion.div
                    id="print-section"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-[1.414] w-full bg-white relative overflow-hidden border-[16px] border-[#1a1a1a] p-10 text-[#1a1a1a]"
                >
                    {/* Decorative Border */}
                    <div className="absolute inset-4 border-2 border-primary/30 pointer-events-none" />

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0073ff 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                    <div className="relative h-full border-4 border-[#1a1a1a] flex flex-col items-center justify-center text-center p-12">
                        <GraduationCap className="size-16 text-primary mb-6" />

                        <h1 className="text-5xl font-black italic tracking-tighter mb-2 uppercase">Certificate</h1>
                        <p className="text-sm font-bold tracking-[0.3em] uppercase opacity-60 mb-8">Of Completion</p>

                        <p className="text-lg italic mb-2">This is to certify that</p>
                        <h2 className="text-4xl font-extrabold mb-8 border-b-2 border-[#1a1a1a] px-8 py-2 min-w-[300px]">{studentName}</h2>

                        <p className="max-w-xl text-lg leading-relaxed italic mb-12">
                            has successfully completed the 8-week intensive program <br />
                            <strong className="text-2xl not-italic font-black text-primary uppercase">{courseName}</strong> <br />
                            demonstrating exceptional dedication to mastering the English language.
                        </p>

                        <div className="w-full flex justify-between items-end mt-4 mb-4">
                            {/* Date Section */}
                            <div className="flex flex-col items-start w-1/4">
                                <div className="w-full border-t border-[#1a1a1a] mb-2" />
                                <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1">DATE ISSUED</p>
                                <p className="font-bold text-xs">{new Date(date).toLocaleDateString()}</p>
                            </div>

                            {/* Watermark Section */}
                            <div className="relative flex flex-col items-center">
                                <div className="size-16 flex items-center justify-center opacity-10">
                                    <ShieldCheck className="size-full" />
                                </div>
                                {certId && (
                                    <div className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[7px] font-mono opacity-20 uppercase tracking-[0.3em] font-bold">
                                        VERIFIED ID: {certId.split('-')[0].toUpperCase()}-{new Date(date).getFullYear()}
                                    </div>
                                )}
                            </div>

                            {/* Logo/Signature Section */}
                            <div className="flex flex-col items-end w-1/4">
                                <div className="w-full border-t border-[#1a1a1a] mb-2" />
                                <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1">FOUNDER & INSTRUCTOR</p>
                                <div className="text-right">
                                    <p className="text-base font-black text-primary tracking-tighter italic leading-none mb-1">Tuhin Khandakar</p>
                                    <p className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">Markiety English LMS</p>
                                </div>
                            </div>
                        </div>

                        {/* Verification Badge */}
                        <div className="absolute bottom-16 right-16 opacity-30 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-col items-end gap-1">
                                <a href={`https://markietyenglish.netlify.app/verify/${certId?.slice(0, 8)}`} target="_blank" rel="noopener noreferrer"
                                    className="p-1.5 border border-[#1a1a1a] rounded flex items-center gap-2 hover:bg-black/5 transition-colors">
                                    <ShieldCheck className="size-3 text-primary" />
                                    <span className="text-[7px] font-bold uppercase tracking-widest font-mono">Verify at: markietyenglish.netlify.app/verify/{certId?.slice(0, 8)}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <p className="text-center mt-6 text-white/40 text-[10px] no-print italic uppercase tracking-widest font-bold">
                    Pro Tip: Layout "Landscape" + "Background Graphics" ON
                </p>
            </div>
        </div>
    );
};
