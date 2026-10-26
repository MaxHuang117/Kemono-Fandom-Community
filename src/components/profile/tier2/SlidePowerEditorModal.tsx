"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomSlide, SlideStyleConfig, SlideFormat } from "@/types/slides";
import { VIP_FONTS } from "@/types/slides";
import { guardarSlideAction } from "@/actions/tier2.actions";

// Importamos nuestros componentes modulares
import PreviewCanvas from "./editor/PreviewCanvas";
import ControlPanel from "./editor/ControlPanel";

interface Props {
    isOpen: boolean;
    slotId: number;
    existingSlide?: CustomSlide;
    activeNetworks: { key: string; label: string }[];
    onClose: () => void;
    onSaved: () => void;
}

export default function SlidePowerEditorModal({ isOpen, slotId, existingSlide, activeNetworks, onClose, onSaved }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    
    // Estados de datos
    const [format, setFormat] = useState<SlideFormat>(existingSlide?.format || "A");
    const [title, setTitle] = useState(existingSlide?.title || "");
    const [description, setDescription] = useState(existingSlide?.description || "");
    const [networkKey, setNetworkKey] = useState(existingSlide?.network_key || activeNetworks[0]?.key || "");
    
    // Estados de imagen
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(existingSlide?.image_url || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado agrupado de estilos
    const [styleConfig, setStyleConfig] = useState<SlideStyleConfig>(
        existingSlide?.style_config || {
            textColor: "#ffffff",
            fontFamily: VIP_FONTS[0].id,
            positionX: 50,
            positionY: 80,
            gradientTopOpacity: 0.5,
            gradientBottomOpacity: 0.8,
            backgroundColor: "#050505"
        }
    );

    const handleStyleChange = (updates: Partial<SlideStyleConfig>) => {
        setStyleConfig(prev => ({ ...prev, ...updates }));
    };

    const triggerImageUpload = () => fileInputRef.current?.click();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return alert("La imagen debe pesar menos de 2MB");
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!title) return alert("El título es obligatorio.");
        if (!previewUrl) return alert("Debes subir una imagen de fondo.");
        if (!networkKey) return alert("Selecciona una red de destino.");

        setIsSaving(true);
        const formData = new FormData();
        formData.append("slideId", slotId.toString());
        formData.append("format", format);
        formData.append("networkKey", networkKey);
        formData.append("title", title);
        formData.append("description", description);
        if (imageFile) formData.append("image", imageFile);
        formData.append("styleConfig", JSON.stringify(styleConfig));

        const res = await guardarSlideAction(formData);
        setIsSaving(false);
        
        if (res.success) {
            onSaved();
        } else {
            alert(res.error);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-6 font-sans">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-6xl h-[90vh] bg-[#050505] border border-zinc-800 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row"
                >
                    {/* Input invisible para manejar archivos */}
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

                    <PreviewCanvas 
                        format={format}
                        previewUrl={previewUrl}
                        title={title}
                        description={description}
                        styleConfig={styleConfig}
                        onStyleChange={handleStyleChange}
                        onImageClick={triggerImageUpload}
                    />

                    <ControlPanel 
                        format={format}
                        setFormat={setFormat}
                        title={title}
                        setTitle={setTitle}
                        description={description}
                        setDescription={setDescription}
                        networkKey={networkKey}
                        setNetworkKey={setNetworkKey}
                        activeNetworks={activeNetworks}
                        styleConfig={styleConfig}
                        onStyleChange={handleStyleChange}
                        onSave={handleSave}
                        isSaving={isSaving}
                        onClose={onClose}
                        slotId={slotId}
                    />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
