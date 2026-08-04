"use client";

interface Props {

    biografia: string;

    guardando: boolean;

    onChange: (value: string) => void;

    onGuardar: () => void;

}

export default function BiografiaEditor({

    biografia,

    guardando,

    onChange,

    onGuardar,

}: Props) {

    return (

        <div
            className="
                rounded-2xl
                border
                border-white/5
                bg-[#0d0d0d]
                p-8
                space-y-4
                max-w-xl
                shadow-xl
                shadow-black/50
            "
        >

            <div className="flex justify-between items-center font-mono">

                <label
                    className="
                        text-xs
                        uppercase
                        tracking-widest
                        text-gray-400
                    "
                >

                    Biografía del Nodo

                </label>

                <span className="text-[11px] text-white/30">

                    {biografia.length} / 200

                </span>

            </div>

            <textarea

                value={biografia}

                onChange={(e) => onChange(e.target.value)}

                maxLength={200}

                placeholder="Escriba los datos de su biografía pública aquí..."

                className="
                    w-full
                    min-h-[110px]
                    max-h-[180px]
                    resize-y
                    rounded-xl
                    bg-[#080808]
                    border
                    border-white/5
                    p-4
                    text-gray-300
                    placeholder-gray-700
                    focus:outline-none
                    focus:border-green-500/50
                    transition
                "

            />

            <div className="flex justify-end">

                <button

                    onClick={onGuardar}

                    disabled={guardando}

                    className="
                        w-full
                        sm:w-auto
                        rounded-xl
                        bg-green-500
                        hover:bg-green-400
                        disabled:opacity-50
                        text-black
                        font-black
                        uppercase
                        tracking-widest
                        text-xs
                        px-6
                        py-3
                        transition
                    "

                >

                    {

                        guardando

                            ? "Sincronizando..."

                            : "Aplicar Cambios"

                    }

                </button>

            </div>

        </div>

    );

}