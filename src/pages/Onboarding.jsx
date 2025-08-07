
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Champion } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { enrichChampion } from "@/api/functions";

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [processingStep, setProcessingStep] = useState(''); // New state for processing step

    useEffect(() => {
        const initialize = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);

                if (user.onboarding_completed) {
                    navigate(createPageUrl('Dashboard'));
                    return;
                }

                const pendingUrl = localStorage.getItem('pendingChampionUrl');
                if (pendingUrl) {
                    setInputValue(pendingUrl);
                }
            } catch (e) {
                navigate(createPageUrl('Landing'));
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, [navigate]);

    const handleConfirmAndTrack = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!inputValue.trim()) {
            setError('A LinkedIn Profile URL is required to start.');
            return;
        }

        setIsProcessing(true);
        let createdChampion = null; // Declare createdChampion here for wider scope

        try {
            setProcessingStep('Creating champion...');
            const championData = {
                name: `New Champion...`,
                linkedin_url: inputValue,
                status: "enriching",
            };
            createdChampion = await Champion.create(championData);

            setProcessingStep('Initiating enrichment...');
            try {
                // This call might time out with a 502/504, which is caught below.
                await enrichChampion({ 
                    championId: createdChampion.id, 
                    linkedinUrl: createdChampion.linkedin_url,
                    name: createdChampion.name
                });
            } catch (enrichError) {
                const status = enrichError.response?.status;
                // A gateway timeout error (502, 504) is expected. We can ignore it and proceed to polling.
                if (status !== 502 && status !== 504) {
                    // If it's not a timeout, it's a real error we should not ignore.
                    throw enrichError;
                }
                console.warn(`Caught expected gateway timeout (status: ${status}), proceeding with polling.`);
            }
            
            setProcessingStep('Waiting for enrichment to complete...');
            const POLL_INTERVAL = 3000; // 3 seconds
            const MAX_POLLS = 30; // 30 * 3s = 90 seconds timeout for polling

            for (let i = 0; i < MAX_POLLS; i++) {
                // Ensure createdChampion exists before attempting to get its status
                if (!createdChampion || !createdChampion.id) {
                    throw new Error("Failed to create champion, cannot poll for status.");
                }
                const champion = await Champion.get(createdChampion.id);
                // Poll until the first name is populated, which indicates enrichment is complete.
                // This is more reliable than just checking the 'status' field.
                if (champion && champion.first_name) {
                    setProcessingStep('Finalizing...');
                    await User.updateMyUserData({ onboarding_completed: true });
                    localStorage.removeItem('pendingChampionUrl');
                    navigate(createPageUrl('Dashboard'));
                    return; // Success!
                }
                
                if (i > 10) { // after ~30 seconds of polling
                    setProcessingStep('Just a moment longer...');
                }
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
            }

            // Polling timed out
            throw new Error("Enrichment is taking longer than usual. We'll finish it in the background and redirect you to the dashboard.");

        } catch (err) {
            console.error("Onboarding tracking error:", err);
            const status = err.response?.status;
            let finalMessage = err.message || 'An unexpected error occurred.';
            if (status) {
                finalMessage = `Request failed with status code ${status}`;
            }

            setError(finalMessage);
            setIsProcessing(false);
            setProcessingStep('');

            // If polling timed out, we should still navigate the user away from the onboarding page.
            if (err.message.includes("longer than usual")) {
                 setTimeout(() => {
                    // Only update onboarding_completed if it wasn't already updated by a fast background process
                    if (currentUser && !currentUser.onboarding_completed) {
                         User.updateMyUserData({ onboarding_completed: true }).finally(() => {
                             navigate(createPageUrl('Dashboard'));
                         });
                    } else {
                        navigate(createPageUrl('Dashboard'));
                    }
                 }, 4000); // Give user 4 seconds to read the message
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-950">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="bg-gray-950 text-gray-200 h-screen w-screen flex flex-col items-center justify-center p-4">
             <div className="aurora-background"></div>
             <div className="grainy-overlay"></div>
             <style>{`
                 .aurora-background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -10; background-color: #030712; overflow: hidden; }
                 .aurora-background::before { content: ''; position: absolute; width: 150%; height: 150%; top: 50%; left: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(ellipse at 70% 80%, #9333ea 0%, transparent 40%), radial-gradient(ellipse at 30% 20%, #2563eb 0%, transparent 45%), radial-gradient(ellipse at 50% 60%, #f97316 0%, transparent 50%); filter: blur(120px); opacity: 0.25; animation: rotateAurora 20s infinite linear; }
                 @keyframes rotateAurora { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
                 .grainy-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -5; pointer-events: none; background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E'); opacity: 0.05; }
             `}</style>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-2xl mx-auto text-center"
            >
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
                    One last step...
                </h1>
                <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
                    Confirm your first champion to start tracking.
                </p>

                <form onSubmit={handleConfirmAndTrack}>
                    <div className="relative group">
                         <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"></div>
                         <div className="relative bg-[#18181B] border border-gray-700/80 rounded-2xl p-2.5 shadow-2xl">
                             <textarea
                                placeholder="Paste a LinkedIn profile URL..."
                                className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none h-20 p-4 text-base"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isProcessing}
                                rows={2}
                            />
                            <div className="absolute right-4 bottom-4 flex items-center gap-3"> {/* Added flex and gap for alignment */}
                                {isProcessing && <p className="text-sm text-gray-400 animate-pulse">{processingStep}</p>}
                                <Button 
                                    type="submit"
                                    size="icon" 
                                    className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all transform hover:scale-110" 
                                    disabled={isProcessing || !inputValue}
                                    aria-label="Confirm and Track Champion"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center text-red-400 text-sm mt-4 text-center justify-center"
                    >
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {error}
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
}
