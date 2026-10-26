"use client";

import { useState, useEffect } from "react";
import { updateUserTierAction } from "../actions/subsAction";

// Exportamos la interfaz para que SubsAdminClient pueda usarla sin duplicar código
export interface UserProfile {
    id: string;
    nombre_publico: string | null;
    discord_username: string | null;
    email: string;
    tier_level: number;
    sub_expires_at: string | null;
    avatar_url: string | null;
}

interface SubsModalProps {
    user: UserProfile;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SubsModal({ user, onClose, onSuccess }: SubsModalProps) {
    const [selectedTier, setSelectedTier] = useState<number>(user.tier_level || 0);
    const [expiresAt, setExpiresAt] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Sincronizar la fecha cuando se abre el modal
    useEffect(() => {
        if (user.sub_expires_at) {
            const date = new Date(user.sub_expires_at);
            // Formatear para datetime-local (YYYY-MM-DDThh:mm)
            setExpiresAt(date.toISOString().slice(0, 16));
        } else {
            setExpiresAt("");
        }
    }, [user]);

    const add30Days = () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        setExpiresAt(date.toISOString().slice(0, 16));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const expDate = expiresAt ? new Date(expiresAt).toISOString() : null;
            const res = await updateUserTierAction(user.id, selectedTier, expDate);
            if (res.success) {
                onSuccess(); // Recarga la lista en el componente padre
                onClose();   // Cierra el modal
            }
        } catch (error: any) {
            alert(error.message || "Error al actualizar usuario");
        }
        setIsProcessing(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#050505] border border-emerald-500/30 p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                {/* Decoraciones Cyberpunk */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500" />

                <div className="border-b border-white/10 pb-4 mb-6 relative z-10">
                    <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Override_User_Tier</h2>
                    <p className="text-xs font-mono text-emerald-500 mt-1">Target: {user.email}</p>
                </div>
                
                <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-[10px] uppercase font-mono text-emerald-500 mb-2 tracking-widest">Select_Tier_Level</label>
                        <select 
                            value={selectedTier} 
                            onChange={(e) => setSelectedTier(Number(e.target.value))}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-emerald-500 p-3 text-sm text-white font-mono outline-none transition-colors"
                        >
                            <option value={0}>Tier 0 (Free / Default)</option>
                            <option value={1}>Tier 1 (Community Fan)</option>
                            <option value={2}>Tier 2 (Creator / VIP)</option>
                            <option value={3}>Tier 3 (Top Sponsor)</option>
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[10px] uppercase font-mono text-emerald-500 tracking-widest">Expiration_Date</label>
                            <button type="button" onClick={add30Days} className="text-[9px] font-mono text-black bg-emerald-500 px-2 py-0.5 uppercase tracking-widest hover:bg-emerald-400 transition-colors">
                                +30 Days
                            </button>
                        </div>
                        <input 
                            type="datetime-local" 
                            value={expiresAt} 
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 focus:border-emerald-500 p-3 text-sm text-zinc-300 font-mono outline-none transition-colors [color-scheme:dark]"
                        />
                        <p className="text-[9px] font-mono text-zinc-500 mt-2">Leave blank for infinite lifetime access.</p>
                    </div>
                    
                    <div className="flex justify-end gap-6 pt-6 mt-4">
                        <button type="button" onClick={onClose} className="text-xs font-mono font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Abort</button>
                        <button disabled={isProcessing} type="submit" className="group relative px-8 py-2 bg-emerald-500 text-black font-black text-xs uppercase tracking-[0.2em] transform -skew-x-12 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                            <span className="inline-block transform skew-x-12">{isProcessing ? "Processing..." : "Execute"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}