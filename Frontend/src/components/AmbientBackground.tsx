import React from 'react';
import { BookOpen, FileText, Shield, Cross, Building2, Leaf, Key, Database, Scale, Landmark } from "lucide-react";

export const AmbientBackground = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">

            {/* --- Orbiting Elements Layer --- */}
            {/* Center is assumed roughly at 50% 50% of the container */}

            {/* 1. Governance / Law (Book) - Slow Orbit */}
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -ml-[300px] -mt-[300px] animate-orbit-slow opacity-40 dark:opacity-20">
                <div className="absolute top-0 left-1/2 -ml-6 text-indigo-400">
                    <BookOpen size={48} strokeWidth={1} />
                </div>
            </div>

            {/* 2. Public Systems (Building) - Reverse Orbit */}
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -ml-[400px] -mt-[400px] animate-orbit-reverse-slow opacity-40 dark:opacity-20" style={{ animationDelay: "-5s" }}>
                <div className="absolute bottom-[15%] right-[15%] text-blue-400">
                    <Building2 size={56} strokeWidth={1} />
                </div>
            </div>

            {/* 3. Agriculture (Leaf) - Slower Orbit */}
            <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] -ml-[350px] -mt-[350px] animate-orbit-slower opacity-40 dark:opacity-20" style={{ animationDelay: "-2s" }}>
                <div className="absolute bottom-1/2 left-0 text-emerald-400">
                    <Leaf size={40} strokeWidth={1} />
                </div>
            </div>

            {/* 4. Health (Cross) - Inner Orbit */}
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -ml-[200px] -mt-[200px] animate-orbit-slow opacity-50 dark:opacity-30" style={{ animationDirection: 'reverse', animationDuration: '30s' }}>
                <div className="absolute top-[20%] right-0 text-rose-400">
                    {/* Using standard SVG for cross since Lucide Cross might be religious cross */}
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 4v16m-8-8h16" />
                    </svg>
                </div>
            </div>

            {/* --- Floating Elements Layer (Drifting) --- */}

            <div className="absolute top-[15%] left-[10%] animate-float-slow opacity-40 dark:opacity-20 text-slate-500">
                <FileText size={40} strokeWidth={1} />
            </div>

            <div className="absolute bottom-[20%] right-[10%] animate-float-delayed-2 opacity-40 dark:opacity-20 text-amber-500">
                <Key size={36} strokeWidth={1} />
            </div>

            <div className="absolute top-[20%] right-[15%] animate-float-delayed-1 opacity-40 dark:opacity-20 text-cyan-500">
                <Database size={32} strokeWidth={1} />
            </div>

            <div className="absolute bottom-[15%] left-[20%] animate-float-delayed-3 opacity-40 dark:opacity-20 text-indigo-500">
                <Scale size={44} strokeWidth={1} />
            </div>

            <div className="absolute top-[40%] right-[5%] animate-pulse-slow opacity-20 dark:opacity-10 text-slate-400">
                <Shield size={120} strokeWidth={0.5} />
            </div>

            {/* --- ID Card Silhouettes (Abstract) --- */}
            <div className="absolute top-[25%] left-[5%] animate-drift-vertical opacity-30 dark:opacity-15">
                <div className="w-16 h-10 border border-slate-400 rounded flex flex-col p-1 gap-1">
                    <div className="w-4 h-4 rounded-full bg-slate-400/20" />
                    <div className="w-8 h-1 bg-slate-400/20 rounded" />
                    <div className="w-10 h-1 bg-slate-400/20 rounded" />
                </div>
            </div>
            <div className="absolute bottom-[30%] right-[5%] animate-drift-horizontal opacity-30 dark:opacity-15" style={{ animationDelay: '2s' }}>
                <div className="w-12 h-16 border border-slate-400 rounded flex flex-col items-center p-1 gap-1">
                    <div className="w-6 h-6 rounded-full bg-slate-400/20" />
                    <div className="w-8 h-1 bg-slate-400/20 rounded mt-2" />
                </div>
            </div>

            {/* --- Connection Lines & Nodes --- */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Curved Data Path Top Left */}
                <path d="M 100,200 Q 150,150 200,100" fill="none" stroke="currentColor" className="text-indigo-200 dark:text-indigo-900 opacity-60 animate-dash-flow" strokeWidth="1" strokeDasharray="5,15" />

                {/* Curved Data Path Bottom Right */}
                <path d="M 800,600 Q 750,650 700,700" fill="none" stroke="currentColor" className="text-blue-200 dark:text-blue-900 opacity-60 animate-dash-flow" strokeWidth="1" strokeDasharray="5,15" style={{ animationDirection: 'reverse' }} />

                {/* Biometric Arc (Fingerprint-ish) */}
                <path d="M 50,400 Q 100,400 100,450" fill="none" stroke="currentColor" className="text-emerald-200 dark:text-emerald-900 opacity-40 animate-fade-in-out" strokeWidth="2" />
                <path d="M 40,400 Q 90,400 90,460" fill="none" stroke="currentColor" className="text-emerald-200 dark:text-emerald-900 opacity-40 animate-fade-in-out" strokeWidth="2" style={{ animationDelay: '1s' }} />
            </svg>

            {/* --- Data Nodes (Drifting Dots) --- */}
            <div className="absolute top-[15%] left-[30%] w-1 h-1 bg-indigo-400 rounded-full animate-drift-horizontal opacity-80" />
            <div className="absolute bottom-[20%] right-[30%] w-1 h-1 bg-blue-400 rounded-full animate-drift-vertical opacity-80" />
            <div className="absolute top-[60%] right-[10%] w-2 h-2 border border-slate-400 rounded-full animate-pulse-slow opacity-40" />

            {/* --- 3D Wireframe Cube (Bottom Left White Space) --- */}
            <div className="absolute top-[75%] left-[5%] w-20 h-20 opacity-50 dark:opacity-30 animate-spin-3d perspective-1000">
                <div className="relative w-full h-full transform-style-3d">
                    {/* Faces */}
                    <div className="absolute inset-0 border border-slate-500 bg-slate-500/5 transform translate-z-10" style={{ transform: 'translateZ(40px)' }} />
                    <div className="absolute inset-0 border border-slate-500 bg-slate-500/5 transform -translate-z-10" style={{ transform: 'translateZ(-40px)' }} />
                    <div className="absolute inset-0 border border-slate-500 bg-slate-500/5 transform rotate-y-90 translate-z-10" style={{ transform: 'rotateY(90deg) translateZ(40px)' }} />
                    <div className="absolute inset-0 border border-slate-500 bg-slate-500/5 transform rotate-y-90 -translate-z-10" style={{ transform: 'rotateY(90deg) translateZ(-40px)' }} />
                    <div className="absolute inset-0 border border-slate-500 bg-slate-500/5 transform rotate-x-90 translate-z-10" style={{ transform: 'rotateX(90deg) translateZ(40px)' }} />
                    <div className="absolute inset-0 border border-slate-500 bg-slate-500/5 transform rotate-x-90 -translate-z-10" style={{ transform: 'rotateX(90deg) translateZ(-40px)' }} />
                </div>
            </div>

            {/* --- 3D Gyroscope (Top Right White Space) --- */}
            <div className="absolute top-[12%] right-[5%] w-16 h-16 opacity-50 dark:opacity-30 animate-gyro perspective-1000">
                <div className="relative w-full h-full transform-style-3d flex items-center justify-center">
                    <div className="absolute inset-0 border border-indigo-400 rounded-full" style={{ transform: 'rotateX(0deg)' }} />
                    <div className="absolute inset-0 border border-indigo-400 rounded-full" style={{ transform: 'rotateX(60deg)' }} />
                    <div className="absolute inset-0 border border-indigo-400 rounded-full" style={{ transform: 'rotateX(-60deg)' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-lg" />
                </div>
            </div>

        </div>
    );
};
