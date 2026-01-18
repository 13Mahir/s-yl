import React, { useState, useEffect } from 'react';
import { Bot, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { AIExplanationEngine, ConsentRequest } from '@/utils/AIExplanationEngine';

interface AIConsentAssistantProps {
    request: ConsentRequest;
    compact?: boolean;
}

export const AIConsentAssistant: React.FC<AIConsentAssistantProps> = ({ request, compact = false }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Heuristic Analysis (Always runs locally for Risk Assessment)
    const heuristicAnalysis = AIExplanationEngine.explainConsentRequest(request);

    // Fetch AI Explanation when opened
    useEffect(() => {
        if (!isOpen || explanation) return; // Don't fetch if closed or already fetched

        const fetchAIExplanation = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                if (!token) throw new Error("No session");

                const res = await fetch('http://localhost:5001/api/ai/explain', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        requester_role: request.requesterName, // Mapped from requesterName
                        requester_name: request.requesterName,
                        domain: "Healthcare", // Should be dynamic based on user context
                        requested_attributes: request.attributes,
                        purpose: request.purpose,
                        duration_days: 90 // Default if not in request object
                    })
                });

                const data = await res.json();
                if (data.success) {
                    setExplanation(data.explanation);
                } else {
                    // Fallback to Heuristics if API fails (Key missing, etc.)
                    setExplanation(heuristicAnalysis.explanation);
                    if (data.error === "AI_SERVICE_UNAVAILABLE") {
                        setError("AI Service Offline - Using Heuristics");
                    }
                }
            } catch (err) {
                console.error("AI Fetch Failed:", err);
                setExplanation(heuristicAnalysis.explanation); // Fallback
            } finally {
                setLoading(false);
            }
        };

        fetchAIExplanation();
    }, [isOpen, request]);

    return (
        <div className={`border border-indigo-100 dark:border-indigo-900 rounded-lg overflow-hidden bg-white dark:bg-slate-900/50 ${compact ? 'text-xs' : 'text-sm'} transition-all`}>
            {/* Header / Toggle */}
            <div
                className="bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-indigo-950 dark:text-indigo-100">AI Explanation</span>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider hidden sm:block">
                        Trusted Advisor
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </div>

            {/* Content */}
            {isOpen && (
                <div className="p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center gap-2 text-slate-500 py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analyzing request privacy impact...</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {error && (
                                <div className="text-[10px] flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                                    <AlertTriangle className="w-3 h-3" /> {error}
                                </div>
                            )}
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                                {heuristicAnalysis.summary}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {explanation || heuristicAnalysis.explanation}
                            </p>
                        </div>
                    )}

                    {/* Risk Badge (Always Heuristic for Reliability) */}
                    <div className={`flex items-start gap-3 p-3 rounded-md mt-2 ${heuristicAnalysis.riskLevel === 'high'
                        ? 'bg-rose-50 text-rose-900 border border-rose-100'
                        : heuristicAnalysis.riskLevel === 'medium'
                            ? 'bg-amber-50 text-amber-900 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                        }`}>
                        {heuristicAnalysis.riskLevel === 'low' ? (
                            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <ShieldAlert className={`w-5 h-5 flex-shrink-0 mt-0.5 ${heuristicAnalysis.riskLevel === 'high' ? 'text-rose-600' : 'text-amber-600'
                                }`} />
                        )}
                        <div>
                            <p className="font-semibold text-xs uppercase tracking-wide mb-1">
                                Risk Assessment: {heuristicAnalysis.riskLevel}
                            </p>
                            {heuristicAnalysis.riskFactors.length > 0 ? (
                                <ul className="list-disc list-inside space-y-0.5 text-xs opacity-90">
                                    {heuristicAnalysis.riskFactors.map((factor, idx) => (
                                        <li key={idx}>{factor}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs opacity-90">Standard request structure. No anomalies detected.</p>
                            )}
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-400 text-center pt-1">
                        AI-generated explanation. Does not replace reviewing terms.
                    </div>
                </div>
            )}
        </div>
    );
};
