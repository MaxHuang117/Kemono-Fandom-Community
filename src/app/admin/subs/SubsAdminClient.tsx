"use client";

import { useState, useEffect } from "react";
import { getUsersListAction } from "./actions/subsAction";
import SubsModal, { UserProfile } from "./components/SubsModal";

export default function SubsAdminClient() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [search, setSearch] = useState("");
    
    const [activeModalUser, setActiveModalUser] = useState<UserProfile | null>(null);

    const loadUsers = async () => {
        try {
            const data = await getUsersListAction();
            setUsers(data as UserProfile[]);
            setFilteredUsers(data as UserProfile[]);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        setFilteredUsers(
            users.filter(u => 
                (u.nombre_publico?.toLowerCase().includes(lowerSearch)) || 
                (u.email.toLowerCase().includes(lowerSearch))
            )
        );
    }, [search, users]);

    const getTierColor = (tier: number) => {
        switch(tier) {
            case 3: return "bg-purple-500/20 text-purple-400 border-purple-500/50";
            case 2: return "bg-blue-500/20 text-blue-400 border-blue-500/50";
            case 1: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
            default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
        }
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-emerald-500/20 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase text-white tracking-widest">User<span className="text-emerald-500">_Tiers</span></h1>
                    <p className="text-xs font-mono text-zinc-500 mt-1">&gt; SUBSCRIPTION MANAGEMENT PROTOCOL</p>
                </div>
                <input 
                    type="text" 
                    placeholder="Search user..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-64 bg-[#0a0a0a] border border-white/10 focus:border-emerald-500 px-4 py-2 text-sm text-white font-mono outline-none transition-colors"
                />
            </div>

            {/* Grid de Usuarios */}
            <div className="grid gap-3">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-4 bg-[#0a0a0a] border-l-2 border-l-zinc-800 hover:border-l-emerald-500 border-t border-t-white/5 border-r border-r-white/5 border-b border-b-white/5 hover:bg-[#111] transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <img src={user.avatar_url || "/default-avatar.png"} alt="avatar" className="w-10 h-10 rounded-full opacity-70 border border-white/10" />
                            <div>
                                <h3 className="font-bold text-white text-sm">{user.nombre_publico || "No Name"}</h3>
                                <span className="text-[10px] font-mono text-zinc-500">{user.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                                <span className={`text-[9px] font-mono px-2 py-0.5 border uppercase tracking-widest ${getTierColor(user.tier_level)}`}>
                                    TIER {user.tier_level}
                                </span>
                                <div className="text-[10px] text-zinc-500 font-mono mt-1">
                                    {user.sub_expires_at ? `EXP: ${new Date(user.sub_expires_at).toLocaleDateString()}` : "NO_EXPIRATION"}
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveModalUser(user)} 
                                className="text-xs font-mono text-emerald-500 hover:text-emerald-300 uppercase tracking-widest transition-colors"
                            >
                                [ Manage ]
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Invocación del Modal Limpio */}
            {activeModalUser && (
                <SubsModal 
                    user={activeModalUser} 
                    onClose={() => setActiveModalUser(null)} 
                    onSuccess={loadUsers} 
                />
            )}
        </div>
    );
}