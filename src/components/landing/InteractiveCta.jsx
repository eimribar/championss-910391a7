import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InteractiveCta() {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const validateUrl = (url) => {
        try {
          const parsedUrl = new URL(url);
          return parsedUrl.hostname.includes('linkedin.com') && parsedUrl.pathname.startsWith('/in/');
        } catch (e) {
          return false;
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!inputValue.trim() || !validateUrl(inputValue)) {
            setError('Please enter a valid LinkedIn Profile URL to begin.');
            return;
        }
        
        setIsProcessing(true);
        localStorage.setItem('pendingChampionUrl', inputValue);
        
        // For now, just simulate login and redirect to dashboard
        localStorage.setItem('mock_logged_in', 'true');
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl mx-auto px-4"
        >
            <form onSubmit={handleTrack}>
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-teal-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[#18181B] border border-gray-700/80 rounded-2xl p-2.5 shadow-2xl">
                        <textarea
                            placeholder="Paste a LinkedIn profile URL to start tracking..."
                            className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none h-16 sm:h-20 p-4 text-base"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    handleTrack(e);
                                }
                            }}
                            disabled={isProcessing}
                            rows={2}
                        />
                        <div className="absolute right-4 bottom-4">
                            <Button 
                                type="submit"
                                size="icon" 
                                className="h-10 w-10 coral-teal-gradient hover:opacity-90 text-white rounded-full transition-all transform hover:scale-110" 
                                disabled={isProcessing || !inputValue}
                                aria-label="Track Champion"
                            >
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
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
    );
}