import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, Zap, TrendingUp, Calendar, User } from 'lucide-react';

interface TourStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    targetSelector?: string; // CSS selector for spotlight
    position: 'top' | 'bottom' | 'center';
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Your Dashboard',
        description: 'This is your command center. Track stats, start workouts, and monitor progress—all in one place.',
        icon: <Sparkles size={24} />,
        position: 'center'
    },
    {
        id: 'quick-start',
        title: 'Quick Start Workout',
        description: 'Tap here to jump straight into a workout. Choose from your saved plans or start a freestyle session.',
        icon: <Zap size={24} />,
        targetSelector: '[data-tour="quick-start"]',
        position: 'top'
    },
    {
        id: 'stats',
        title: 'Your Stats at a Glance',
        description: 'See your streak, total workouts, and weekly progress. Stay motivated with real-time insights.',
        icon: <TrendingUp size={24} />,
        targetSelector: '[data-tour="stats"]',
        position: 'bottom'
    },
    {
        id: 'history',
        title: 'Workout History',
        description: 'Review past sessions, track PRs, and see your evolution over time. Every rep counts.',
        icon: <Calendar size={24} />,
        targetSelector: '[data-tour="history"]',
        position: 'top'
    },
    {
        id: 'profile',
        title: 'Your Profile & Settings',
        description: 'Manage your account, update goals, and customize your experience in the More tab.',
        icon: <User size={24} />,
        targetSelector: '[data-tour="profile"]',
        position: 'top'
    }
];

export const InteractiveTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

    const step = TOUR_STEPS[currentStep];
    const isLastStep = currentStep === TOUR_STEPS.length - 1;
    const isSpotlightMode = !!step.targetSelector;

    useEffect(() => {
        if (step.targetSelector) {
            const element = document.querySelector(step.targetSelector);
            if (element) {
                const rect = element.getBoundingClientRect();
                setSpotlightRect(rect);
                // Scroll element into view smoothly
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setSpotlightRect(null);
            }
        } else {
            setSpotlightRect(null);
        }
    }, [currentStep, step.targetSelector]);

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] pointer-events-none">

            {/* OVERLAY LAYER */}
            {!isSpotlightMode ? (
                // CASE 1: Welcome Screen (No Target)
                // Use blur here for a nice modal effect since we aren't trying to show anything behind it
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto transition-opacity duration-500" />
            ) : (
                // CASE 2: Spotlight Mode (Target Active)
                // NO BLUR here. We use a high-opacity dark fill with a clear SVG cutout.
                // This ensures the user can clearly see the button/stat we are pointing at.
                <div className="absolute inset-0 pointer-events-auto">
                    {spotlightRect ? (
                        <svg className="absolute inset-0 w-full h-full transition-all duration-300">
                            <defs>
                                <mask id="spotlight-mask">
                                    {/* White reveals everything (the dark overlay) */}
                                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                    {/* Black hides the overlay (creating the hole) */}
                                    <rect
                                        x={spotlightRect.x - 8}
                                        y={spotlightRect.y - 8}
                                        width={spotlightRect.width + 16}
                                        height={spotlightRect.height + 16}
                                        rx="16"
                                        fill="black"
                                    />
                                </mask>
                            </defs>
                            {/* The Overlay Itself: 85% Black opacity for strong contrast */}
                            <rect width="100%" height="100%" fill="rgba(0,0,0,0.85)" mask="url(#spotlight-mask)" />
                        </svg>
                    ) : (
                        // Fallback while calculating rect: just dark, no hole yet
                        <div className="absolute inset-0 bg-black/85" />
                    )}
                </div>
            )}

            {/* ANIMATED BORDER FOR SPOTLIGHT */}
            {isSpotlightMode && spotlightRect && (
                <div
                    className="absolute border-2 border-accent rounded-2xl animate-pulse pointer-events-none transition-all duration-300"
                    style={{
                        left: spotlightRect.x - 8,
                        top: spotlightRect.y - 8,
                        width: spotlightRect.width + 16,
                        height: spotlightRect.height + 16,
                        boxShadow: '0 0 0 4px rgba(255,255,255,0.1), 0 0 30px rgba(255,255,255,0.2)'
                    }}
                />
            )}

            {/* TOUR CARD */}
            <div
                className={`absolute left-4 right-4 glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl pointer-events-auto z-[310] transition-all duration-500 ${
                    step.position === 'top' ? 'top-24' :
                    step.position === 'bottom' ? 'bottom-28' :
                    'top-1/2 -translate-y-1/2'
                }`}
            >
                {/* Close Button */}
                <button
                    onClick={onComplete}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <X size={18} className="text-white" />
                </button>

                {/* Icon */}
                <div className="inline-flex p-3 bg-accent/20 rounded-2xl text-accent mb-4">
                    {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed mb-6">{step.description}</p>

                {/* Progress Dots */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {TOUR_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-accent' :
                                    idx < currentStep ? 'w-2 bg-accent/50' :
                                        'w-2 bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 active:scale-95 transition-all shadow-lg"
                    >
                        {isLastStep ? 'Got It!' : 'Next'}
                        {!isLastStep && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>

        </div>
    );
};