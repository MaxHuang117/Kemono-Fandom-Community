"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { CustomSlide, SlideFormat } from "@/types/slides";
import { guardarSlideAction, eliminarSlideAction } from "@/actions/tier2.actions"; 

interface Props {
    slideId: number;
    existingSlide?: CustomSlide;
    activeNetworks: { key: string; label: string }[];
    onSaved: () => void;
}

export default function SlideEditorSlot({ slideId, existingSlide, activeNetworks, onSaved }: Props) {
    const [isEditing, setIsEditing] = useState(!existingSlide);
    const [isSaving, setIsSaving] = useState(false);
    
    // Estados del formulario
    const [format, setFormat] = useState<SlideFormat>(existingSlide?.format || "A");
    const [title, setTitle] = useState(existingSlide?.title || "");
    const [description, setDescription] = useState(existingSlide?.description || "");
    const [networkKey, setNetworkKey] = useState(existingSlide?.network_key || activeNetworks[0]?.key || "");
    
    // Estado para la imagen
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(existingSlide?.image_url || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return alert("La imagen debe pesar menos de 2MB");
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!networkKey) return alert("Debes seleccionar una red social de destino.");
        if (!previewUrl) return alert("Debes subir una imagen para el slide.");

        setIsSaving(true);
        const formData = new FormData();
        formData.append("slideId", slideId.toString());
        formData.append("format", format);
        formData.append("networkKey", networkKey);
        formData.append("title", title);
        formData.append("description", description);
        if (imageFile) formData.append("image", imageFile);

        const res = await guardarSlideAction(formData);
        
        if (res.success) {
            setIsEditing(false);
            onSaved(); 
        } else {
            alert(res.error);
        }
        setIsSaving(false);
    };

    // FUNCIÓN DE BORRADO
    const handleDelete = async () => {
        const confirmed = confirm(`¿Estás seguro de que quieres borrar el SLOT_${slideId}?`);
        if (!confirmed) return;

        setIsSaving(true);
        const res = await eliminarSlideAction(slideId);
        
        if (res.success) {
            setIsEditing(true); 
            setPreviewUrl(""); 
            onSaved(); // Avisamos al componente padre que recargue TODOS los slides para ver el nuevo orden
        } else {
            alert(res.error);
        }
        setIsSaving(false);
    };

    // Vista de "Solo Lectura" (Cuando ya hay un slide guardado y no lo estamos editando)
    if (!isEditing && existingSlide) {
        return (
            <div className="bg-[#050505] border border-emerald-500/30 p-4 relative group overflow-hidden h-48 flex items-center justify-center">
                <Image src={existingSlide.image_url} alt={existingSlide.title || "Slide"} fill sizes="300px" className="object-cover opacity-50" />
                <div className="relative z-10 text-center">
                    <h5 className="text-white font-black uppercase tracking-wider text-lg shadow-black drop-shadow-md">{existingSlide.title}</h5>
                    <p className="text-emerald-400 font-mono text-[10px] mt-1 uppercase">DESTINO: {existingSlide.network_key}</p>
                </div>
                
                {/* BOTONES HOVER: EDITAR Y BORRAR */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <button onClick={() => setIsEditing(true)} disabled={isSaving} className="w-24 py-2 bg-zinc-800 hover:bg-emerald-500 text-white font-mono text-xs transition-colors border border-emerald-500/30">
                        [ EDITAR ]
                    </button>
                    <button onClick={handleDelete} disabled={isSaving} className="w-24 py-2 bg-zinc-900 hover:bg-red-600 text-red-500 hover:text-white font-mono text-xs transition-colors border border-red-900/50">
                        {isSaving ? "..." : "[ BORRAR ]"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="bg-[#0a0a0a] border border-zinc-800 p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-mono text-zinc-400">SLOT_{slideId}</span>
                {existingSlide && (
                    <button type="button" onClick={() => setIsEditing(false)} className="text-[10px] text-zinc-500 hover:text-white">[ CANCELAR ]</button>
                )}
            </div>

            <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-zinc-700 hover:border-emerald-500 bg-black flex items-center justify-center cursor-pointer relative overflow-hidden transition-colors group"
            >
                {previewUrl ? (
                    <>
                        <Image src={previewUrl} alt="Preview" fill sizes="300px" className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 bg-black/50 transition-all">CAMBIAR IMAGEN</span>
                    </>
                ) : (
                    <span className="text-[10px] font-mono text-zinc-500 text-center px-4">+ CLICK PARA SUBIR IMAGEN<br/>(Máx 2MB | JPG/PNG)</span>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg, image/png, image/webp" className="hidden" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500">FORMATO</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value as SlideFormat)} className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-2 outline-none focus:border-emerald-500">
                        <option value="A">FORMATO A (Cinematográfico)</option>
                        <option value="B">FORMATO B (Informativo)</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500">REDIRECCIÓN (Tus Redes)</label>
                    <select value={networkKey} onChange={(e) => setNetworkKey(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-2 outline-none uppercase focus:border-emerald-500" required>
                        <option value="">-- SELECCIONAR --</option>
                        {activeNetworks.map(net => (
                            <option key={net.key} value={net.key}>{net.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 👇 INPUT TÍTULO CON CONTADOR 👇 */}
            <div className="space-y-1 relative">
                <label className="text-[10px] font-mono text-zinc-500 flex justify-between items-end">
                    <span>TÍTULO</span>
                    <span className={`${title.length >= 20 ? "text-red-400" : "text-zinc-600"} transition-colors`}>{title.length}/20</span>
                </label>
                <input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    maxLength={20} 
                    required 
                    placeholder="EJ: ¡NUEVO VIDEO!" 
                    className="w-full bg-zinc-900 border-b border-zinc-800 focus:border-emerald-500 p-2 text-xs text-white outline-none transition-colors" 
                />
            </div>

            {/* 👇 INPUT DESCRIPCIÓN CON CONTADOR (SOLO FORMATO B) 👇 */}
            {format === "B" && (
                <div className="space-y-1 relative">
                    <label className="text-[10px] font-mono text-zinc-500 flex justify-between items-end">
                        <span>DESCRIPCIÓN</span>
                        <span className={`${description.length >= 30 ? "text-red-400" : "text-zinc-600"} transition-colors`}>{description.length}/30</span>
                    </label>
                    <input 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        maxLength={30} 
                        placeholder="Descripción de max 30 letras..." 
                        className="w-full bg-zinc-900 border-b border-zinc-800 focus:border-emerald-500 p-2 text-xs text-white outline-none transition-colors" 
                    />
                </div>
            )}

            <button disabled={isSaving} type="submit" className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black font-black text-[10px] uppercase tracking-widest transition-colors border border-emerald-500/50 mt-4">
                {isSaving ? "PROCESANDO..." : "GUARDAR SLIDE"}
            </button>
        </form>
    );
}
