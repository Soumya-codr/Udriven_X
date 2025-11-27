'use client';
import { useRef, useState } from 'react';

export default function BentoCard({ children, className = '', title, icon }) {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setOpacity(1);
    };

    const handleBlur = () => {
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-xl transition-all duration-300 hover:border-white/20 ${className}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
                }}
            />
            <div className="relative h-full flex flex-col p-6">
                {(title || icon) && (
                    <div className="flex items-center gap-3 mb-4">
                        {icon && <span className="text-xl">{icon}</span>}
                        {title && <h3 className="text-lg font-semibold text-white/90">{title}</h3>}
                    </div>
                )}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
