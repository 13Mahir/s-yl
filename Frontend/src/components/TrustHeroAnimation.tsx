import React from 'react';

export const TrustHeroAnimation = ({ className }: { className?: string }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg viewBox="0 0 400 300" className="w-full h-auto drop-shadow-2xl overflow-visible">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Central Core - Forms when pieces converge */}
                <circle cx="200" cy="150" r="40" fill="white" className="dark:fill-slate-900 animate-glow-pulse opacity-0" filter="url(#glow)" stroke="#6366f1" strokeWidth="2" />

                {/* Left Element (Citizen) */}
                <g className="animate-converge-left origin-center">
                    <path
                        d="M160,150 L120,150 Q100,150 100,130 L100,110"
                        fill="none"
                        stroke="url(#grad2)"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <circle cx="100" cy="110" r="12" fill="white" stroke="#3b82f6" strokeWidth="4" />
                </g>

                {/* Right Element (Organization) */}
                <g className="animate-converge-right origin-center">
                    <path
                        d="M240,150 L280,150 Q300,150 300,130 L300,110"
                        fill="none"
                        stroke="url(#grad1)"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <rect x="288" y="98" width="24" height="24" rx="4" fill="white" stroke="#8b5cf6" strokeWidth="4" />
                </g>

                {/* Bottom Element (Government) */}
                <g className="animate-converge-bottom origin-center">
                    <path
                        d="M200,190 L200,230 Q200,250 220,250 L240,250"
                        fill="none"
                        stroke="url(#grad3)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="opacity-50"
                    />
                    <path
                        d="M200,190 L200,230 Q200,250 180,250 L160,250"
                        fill="none"
                        stroke="url(#grad3)"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <path d="M200 230 L200 260" stroke="url(#grad3)" strokeWidth="4" strokeDasharray="4 4" />
                </g>

                {/* Connecting Lines (Appear when close) */}
                <path d="M112,110 L190,140" stroke="#cbd5e1" strokeWidth="1" className="dark:stroke-slate-700 animate-pulse-fade" />
                <path d="M288,110 L210,140" stroke="#cbd5e1" strokeWidth="1" className="dark:stroke-slate-700 animate-pulse-fade" />
                <path d="M200,230 L200,160" stroke="#cbd5e1" strokeWidth="1" className="dark:stroke-slate-700 animate-pulse-fade" />

            </svg>
        </div>
    );
};
