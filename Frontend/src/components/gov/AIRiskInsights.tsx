import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIExplanationEngine } from "@/utils/AIExplanationEngine";

interface AIRiskInsightsProps {
    stats: {
        activeCases: number;
        activeConsents: number;
        pendingRequests: number;
        changesInLast24h?: number;
    };
    activityLog: any[];
}

// Helper to determine badge style
const getBadgeStyle = (level: string) => {
    switch (level) {
        case 'ELEVATED': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
};

export const AIRiskInsights: React.FC<AIRiskInsightsProps> = ({ stats }) => {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'ELEVATED'>('LOW');

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                if (!token) return;

                // 1. Deterministic Pre-Scoring
                const riskProfile = AIExplanationEngine.evaluateRisk({
                    activeCases: stats.activeCases,
                    activeConsents: stats.activeConsents,
                    pendingRequests: stats.pendingRequests
                });

                // Update UI immediately with deterministic score
                setRiskLevel(riskProfile.riskLevel);

                // 2. AI Explanation of the Risk
                const res = await fetch('http://localhost:5001/api/ai/explain-risk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        domain: "Healthcare",
                        time_window: "Last 7 Days",
                        risk_level: riskProfile.riskLevel,
                        signals: riskProfile.signals
                    })
                });

                const data = await res.json();
                if (data.success) {
                    setExplanation(data.explanation);
                }
            } catch (err) {
                console.error("AI Analysis Failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [stats]);

    return (
        <Card className="border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-900/10">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <CardTitle className="text-base text-indigo-950 dark:text-indigo-100">AI Risk & Anomaly Insights</CardTitle>
                    </div>
                    <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 whitespace-nowrap justify-center">
                        Live Analysis
                    </Badge>
                </div>
                <CardDescription>
                    Automated pattern detection across jurisdiction.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Risk Score Indicator */}
                    <div className="flex items-center gap-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-indigo-50 dark:border-indigo-900">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <Activity className={`w-6 h-6 ${riskLevel === 'ELEVATED' ? 'text-amber-500' :
                                    riskLevel === 'MEDIUM' ? 'text-yellow-500' :
                                        'text-emerald-500'
                                }`} />
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-100 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className={`${riskLevel === 'ELEVATED' ? 'text-amber-500' :
                                        riskLevel === 'MEDIUM' ? 'text-yellow-500' :
                                            'text-emerald-500'
                                    }`} strokeDasharray={`${riskLevel === 'ELEVATED' ? 70 : riskLevel === 'MEDIUM' ? 85 : 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">System Risk Level</p>
                            <Badge variant="outline" className={`mt-1 font-bold ${getBadgeStyle(riskLevel)}`}>
                                {riskLevel === 'ELEVATED' ? 'Attention Required' :
                                    riskLevel === 'MEDIUM' ? 'Moderate Activity' :
                                        'Normal Operation'}
                            </Badge>
                        </div>
                    </div>

                    {/* Insights List */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-4 text-slate-400 gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Analysis running...
                            </div>
                        ) : explanation ? (
                            <div className="p-3 rounded bg-white/40 dark:bg-black/20 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-center">
                                {explanation}
                            </div>
                        ) : (
                            <div className="flex gap-3 text-sm p-2 rounded bg-white/40 dark:bg-black/20">
                                <TrendingUp className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300">No significant risk factors detected by AI.</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-indigo-100 dark:border-indigo-800/50">
                        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-medium">
                            AI Generated • Advisory Only
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
