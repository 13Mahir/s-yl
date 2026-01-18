import { formatDistanceToNow } from 'date-fns';

export interface ConsentRequest {
    id: string;
    requesterName: string;
    purpose: string;
    attributes: string[];
    expiryDate?: string;
    status: 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';
    requestDate: string;
}

export interface ExplanationResult {
    summary: string;
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    explanation: string;
}

/**
 * AI Explanation Engine
 * A deterministic heuristic engine to explain system events and consents.
 * NOT a generative LLM - purely logic-based for safety and governance.
 */
export const AIExplanationEngine = {

    /**
     * Explains a Consent Request to a Citizen
     */
    /**
     * Explains a Consent Request to a Citizen
     */
    explainConsentRequest: (request: ConsentRequest): ExplanationResult => {
        const sensitiveAttributes = ['health_records', 'financial_data', 'biometric_hash', 'criminal_record', 'medical_conditions'];
        const mediumAttributes = ['location_data', 'employment_history', 'civic_profile'];
        const commonExcluded = ['home_address', 'identity_documents', 'personal_vault_keys', 'financial_history', 'voting_record'];

        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        const riskFactors: string[] = [];

        // Analyze Attributes
        const hasSensitive = request.attributes.some(attr => sensitiveAttributes.includes(attr));
        const hasMedium = request.attributes.some(attr => mediumAttributes.includes(attr));

        if (hasSensitive) {
            riskLevel = 'high';
            riskFactors.push('Request includes highly sensitive personal data.');
        } else if (hasMedium) {
            riskLevel = 'medium';
            riskFactors.push('Request includes moderately sensitive data.');
        }

        // Analyze Duration
        let durationText = "";
        if (request.expiryDate) {
            const daysUntilExpiry = Math.ceil((new Date(request.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            durationText = `Access is valid for ${daysUntilExpiry} days.`;

            if (daysUntilExpiry > 365) {
                if (riskLevel !== 'high') riskLevel = 'medium';
                riskFactors.push('Consent duration is unusually long (> 1 year).');
            }
        } else {
            riskLevel = 'high';
            riskFactors.push('No expiration date specified (Indefinite Access).');
            durationText = "Access has no specified expiration date.";
        }

        // Generate Summary
        const attrList = request.attributes.map(a => a.replace(/_/g, ' ')).join(', ');

        // Calculate what is NOT shared (Mock logic: distinct set difference from a common superset)
        const notShared = commonExcluded.filter(ex => !request.attributes.includes(ex));
        const notSharedText = notShared.length > 0
            ? `They will NOT see your ${notShared.slice(0, 3).join(', ')}${notShared.length > 3 ? ', or other private data' : ''}.`
            : "They will verify only the requested attributes.";

        const summary = `${request.requesterName} is asking to view your ${attrList}.`;

        let explanation = `They need (or claim to need) this data for "${request.purpose}". ${notSharedText} ${durationText} Access is read-only.`;

        // Safety Advisory
        if (riskLevel === 'high') explanation += ` Exercise caution: this request involves sensitive categories.`;

        return { summary, riskLevel, riskFactors, explanation };
    },

    /**
     * Explains an Access Decision (Why was I denied/approved?)
     */
    explainAccessDecision: (decision: 'allowed' | 'denied', reason?: string): string => {
        if (decision === 'allowed') {
            return "Access was granted because a valid, active consent agreement exists for this specific purpose and requester.";
        } else {
            if (reason?.includes('expired')) return "Access was denied because the consent agreement has expired.";
            if (reason?.includes('revoked')) return "Access was denied because the consent was previously revoked by the user.";
            if (reason?.includes('scope')) return "Access was denied because the requested data is outside the scope of the agreed consent.";
            return "Access was denied due to missing or invalid consent credentials.";
        }
    },

    /**
     * Risk Insights for Government Dashboard (Anomaly Detection)
     */
    analyzeRiskPatterns: (logs: any[]): string[] => {
        // Heuristic Checks
        const insights: string[] = [];

        // Mock Check 1: High Frequency
        if (logs.length > 50) {
            insights.push("High frequency of access requests detected in the last 24 hours.");
        }

        // Mock Check 2: Sensitive Data Access
        const sensitiveAccess = logs.filter(log => log.resource?.includes('health') || log.resource?.includes('finance'));
        if (sensitiveAccess.length > 10) {
            insights.push(`Unusual volume of sensitive data access (${sensitiveAccess.length} events).`);
        }

        return insights.length > 0 ? insights : ["No significant anomalies detected in recent activity."];
    },

    /**
     * Governance Pre-Scoring (Deterministic)
     */
    evaluateRisk: (stats: any): { riskLevel: 'LOW' | 'MEDIUM' | 'ELEVATED', signals: string[] } => {
        let score = 0;
        const signals: string[] = [];

        // 1. Pending Request Load
        if (stats.pendingRequests > 15) {
            score += 30;
            signals.push("High volume of pending consent requests.");
        }

        // 2. Sensitive Data Access (from Active Cases roughly)
        // In a real system, we'd query the nature of active consents.
        // Heuristic: If active cases > 30, assume some sensitivity scale.
        if (stats.activeCases > 20) {
            score += 20;
            signals.push("Significant number of active governance workflows.");
        }

        // 3. Consent Velocity (Active Consents)
        if (stats.activeConsents > 50) {
            score += 15;
            signals.push("Consent accumulation is higher than average.");
        }

        let riskLevel: 'LOW' | 'MEDIUM' | 'ELEVATED' = 'LOW';
        if (score >= 40) riskLevel = 'ELEVATED';
        else if (score >= 20) riskLevel = 'MEDIUM';

        return { riskLevel, signals };
    }

};
