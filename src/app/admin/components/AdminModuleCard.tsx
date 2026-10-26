import Link from "next/link";

interface AdminModuleCardProps {
    moduleNumber: string;
    title: string;
    description: string;
    href: string;
    buttonText: string;
    isDisabled?: boolean;
}

export default function AdminModuleCard({
    moduleNumber,
    title,
    description,
    href,
    buttonText,
    isDisabled = false,
}: AdminModuleCardProps) {
    if (isDisabled) {
        return (
            <article className="opacity-50 relative rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-6 backdrop-blur-xl cursor-not-allowed flex flex-col justify-between font-sans">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 uppercase tracking-widest">
                            {moduleNumber}
                        </span>
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-zinc-500">
                        {title}
                    </h2>
                    <p className="mt-2 text-xs font-mono text-zinc-600 leading-relaxed">
                        {description}
                    </p>
                </div>
            </article>
        );
    }

    return (
        <article className="group relative bg-[#0a0a0a] border-l-4 border-l-zinc-700 hover:border-l-emerald-500 border-t border-t-white/5 border-r border-r-white/5 border-b border-b-white/5 p-6 transition-all duration-300 flex flex-col justify-between shadow-[0_0_15px_rgba(0,0,0,0.5)] font-sans">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                        {moduleNumber}
                    </span>
                </div>
                <h2 className="text-xl font-black uppercase tracking-wider text-white group-hover:text-emerald-400 transition-colors">
                    {title}
                </h2>
                <p className="mt-2 text-xs font-mono text-zinc-400 leading-relaxed">
                    {description}
                </p>
            </div>
            <Link 
                href={href} 
                className="mt-6 w-full text-center py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-[0.2em] transform -skew-x-12 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all block"
            >
                <span className="inline-block transform skew-x-12">{buttonText}</span>
            </Link>
        </article>
    );
}