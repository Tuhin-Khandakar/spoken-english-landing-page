"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Maximize2, Users, MessageSquare, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MeetingPage() {
    const router = useRouter();
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [roomName, setRoomName] = useState("Markiety-Live-Session");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Fetch the custom room name set by admin
        const fetchRoom = async () => {
            const { data } = await supabase.from('app_settings').select('value').eq('key', 'live_room_name').single();
            if (data?.value) setRoomName(data.value);
        };
        fetchRoom();

        // Load Jitsi External API Script
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => {
            // @ts-ignore
            if (window.JitsiMeetExternalAPI) {
                // @ts-ignore
                const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
                    roomName: roomName,
                    width: "100%",
                    height: "100%",
                    parentNode: jitsiContainerRef.current,
                    interfaceConfigOverwrite: {
                        TOOLBAR_BUTTONS: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                            'security'
                        ],
                    },
                    configOverwrite: {
                        startWithAudioMuted: true,
                        disableDeepLinking: true,
                    }
                });
                setIsLoaded(true);
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [roomName]);

    return (
        <div className="h-screen bg-[#050505] flex flex-col overflow-hidden text-white">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <div>
                        <h1 className="text-sm font-bold flex items-center gap-2">
                            <div className="size-2 rounded-full bg-red-500 animate-pulse" />
                            Live Classroom
                        </h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Markiety English Batch #04</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                        <ShieldCheck className="size-4 text-primary" />
                        <span className="text-[10px] font-bold text-primary">Encrypted Session</span>
                    </div>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative bg-black">
                {!isLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050505]">
                        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm italic text-white/20">Initializing Virtual Classroom...</p>
                    </div>
                )}
                <div ref={jitsiContainerRef} className="w-full h-full" />
            </div>
        </div>
    );
}
