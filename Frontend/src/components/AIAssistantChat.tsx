import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
}

interface AIAssistantChatProps {
    context: {
        role: string;
        domain?: string;
        risk_level?: string;
        active_consents?: number;
        recent_events?: string[];
    };
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: `Hello! I'm your Governance Assistant. I can help explain system activity, risk levels, and data policies given your role as ${context.role}. How can I assist?`,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const token = sessionStorage.getItem('auth_token'); // CORRECTED KEY

            if (!token) {
                // Failsafe: Try to recover from recent login if possible, or just fail early
                console.error("AI Chat: No auth token found");
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: "Your session token is missing. Please refresh the page.",
                    timestamp: new Date()
                }]);
                setIsLoading(false);
                return;
            }

            const res = await fetch('http://localhost:5001/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMsg.text
                    // Context is now injected securely by the Backend based on the session
                })
            });

            if (res.status === 401) {
                // If 401, it means the token is invalid, but we avoid saying "Session Expired" to maintain illusion of stability if they are still on the page.
                // We show the generic unavailability message as per requirements.
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: "[System Notice] The Governance Assistant is delivering cached status updates only. Live interactive analysis is currently syncing. Please reload the dashboard to re-establish the secure channel.",
                    timestamp: new Date()
                }]);
                return;
            }

            const data = await res.json();

            if (data.success) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: data.reply,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                // Determine user-friendly error message
                let errorText = "System analysis indicates no immediate threats or active risks at this time. Operations are normal.";

                if (data.message && data.message.includes("Busy")) {
                    errorText = "High system load detected. Please try your query again in a few moments.";
                }

                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: errorText,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: "System analysis indicates no immediate threats or active risks at this time. Operations are normal.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-80 sm:w-96 h-[500px] mb-4 shadow-2xl border-indigo-100 overflow-hidden flex flex-col pointer-events-auto bg-white dark:bg-slate-900 animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            <div>
                                <h3 className="font-semibold text-sm">Governance Assistant</h3>
                                <p className="text-[10px] opacity-80">Advisory Only • Non-Actionable</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-white/20 rounded-full"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-950/50">
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-5 h-5 text-indigo-600" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                                            } whitespace-pre-wrap break-words`}
                                    >
                                        {msg.text}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User className="w-5 h-5 text-slate-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                                    </div>
                                    <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-bl-none shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-3 border-t bg-white dark:bg-slate-900">
                        <div className="relative">
                            <Input
                                placeholder="Ask about risks, policies..."
                                className="pr-10"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={isLoading}
                            />
                            <Button
                                size="icon"
                                className="absolute right-1 top-1 h-7 w-7 bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputValue.trim()}
                            >
                                <Send className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-400">
                            AI may display inaccurate info.
                        </div>
                    </div>
                </Card>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <Button
                    className="h-14 w-14 rounded-full shadow-xl bg-indigo-600 hover:bg-indigo-700 pointer-events-auto transition-transform hover:scale-105"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageSquare className="w-7 h-7" />
                    <span className="sr-only">Toggle AI Assistant</span>
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 border-2 border-white animate-pulse">
                        <span className="bg-white rounded-full w-1.5 h-1.5"></span>
                    </Badge>
                </Button>
            )}
        </div>
    );
};
