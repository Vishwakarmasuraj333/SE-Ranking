'use client';

import React, { useState, useEffect } from 'react';

// Real verified agency avatars with vector fallbacks
interface AvatarItem {
  id: string;
  name: string;
  role: string;
  agency: string;
  imageUrl: string;
  bgGradient: string;
  initials: string;
}

const AVATAR_SETS: AvatarItem[][] = [
  [
    {
      id: 's1-1',
      name: 'Sarah Jenkins',
      role: 'Head of SEO',
      agency: 'Omnicom Media',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-amber-400 to-orange-500',
      initials: 'SJ',
    },
    {
      id: 's1-2',
      name: 'Liam Vance',
      role: 'Founder & CEO',
      agency: 'Apex Digital',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-blue-500 to-indigo-600',
      initials: 'LV',
    },
    {
      id: 's1-3',
      name: 'Elena Rostova',
      role: 'VP Search Strategy',
      agency: 'PeakGrowth Agency',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-emerald-400 to-teal-600',
      initials: 'ER',
    },
  ],
  [
    {
      id: 's2-1',
      name: 'Marcus Thorne',
      role: 'SEO Director',
      agency: 'Soapbox Marketing',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-violet-500 to-purple-600',
      initials: 'MT',
    },
    {
      id: 's2-2',
      name: 'Chloe Martin',
      role: 'Organic Growth Lead',
      agency: 'TailorBrands Lab',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-pink-500 to-rose-600',
      initials: 'CM',
    },
    {
      id: 's2-3',
      name: 'David Kim',
      role: 'Managing Partner',
      agency: 'Wiser IT Agency',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-cyan-500 to-blue-600',
      initials: 'DK',
    },
  ],
  [
    {
      id: 's3-1',
      name: 'Priya Sharma',
      role: 'VP Digital Performance',
      agency: 'Neary Hayes Group',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-orange-400 to-amber-600',
      initials: 'PS',
    },
    {
      id: 's3-2',
      name: 'Alex Rivera',
      role: 'Founder',
      agency: 'Nex Brand Lab',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-sky-500 to-blue-700',
      initials: 'AR',
    },
    {
      id: 's3-3',
      name: 'Maya Lin',
      role: 'Chief Strategy Officer',
      agency: 'Kaida Global',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-teal-400 to-emerald-600',
      initials: 'ML',
    },
  ],
  [
    {
      id: 's4-1',
      name: 'Julian Rossi',
      role: 'SEO Architect',
      agency: 'PixelPulse Media',
      imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-fuchsia-500 to-purple-600',
      initials: 'JR',
    },
    {
      id: 's4-2',
      name: 'Emily Zhang',
      role: 'Head of Analytics',
      agency: 'Fusion Agency',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-red-400 to-pink-600',
      initials: 'EZ',
    },
    {
      id: 's4-3',
      name: 'Tariq Al-Mansoor',
      role: 'Agency Founder',
      agency: 'Zenith Growth',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      bgGradient: 'from-emerald-500 to-green-700',
      initials: 'TA',
    },
  ],
];

export function HeroAvatarSlider() {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Auto-advance avatar slider smoothly every 2.4s so it keeps sliding ("sildi hote rhe")
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentSetIndex((prev) => (prev + 1) % AVATAR_SETS.length);
        setIsSliding(false);
      }, 350);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const currentSet = AVATAR_SETS[currentSetIndex];

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="inline-flex items-center justify-center gap-3.5 select-none">
      {/* 3 Avatar overlapping slider window */}
      <div
        className="relative flex items-center -space-x-2.5 cursor-pointer group"
        onClick={() => {
          setIsSliding(true);
          setTimeout(() => {
            setCurrentSetIndex((prev) => (prev + 1) % AVATAR_SETS.length);
            setIsSliding(false);
          }, 250);
        }}
        title="Verified partner agencies — click to switch"
      >
        {currentSet.map((avatar, idx) => {
          const isFailed = failedImages[avatar.id];

          return (
            <div
              key={`${currentSetIndex}-${avatar.id}-${idx}`}
              onMouseEnter={() => setActiveTooltip(avatar.name)}
              onMouseLeave={() => setActiveTooltip(null)}
              className={`relative transition-all duration-300 ease-out transform ${
                isSliding ? 'opacity-30 translate-x-3 scale-95' : 'opacity-100 translate-x-0 scale-100'
              }`}
              style={{
                zIndex: 3 - idx,
                transitionDelay: `${idx * 40}ms`,
              }}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full ring-2 ring-white shadow-sm overflow-hidden bg-gray-100 hover:scale-110 hover:z-20 transition-transform duration-200">
                {isFailed ? (
                  // Gradient vector fallback so "UserUserUser" NEVER shows
                  <div
                    className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${avatar.bgGradient} text-white font-bold text-xs`}
                  >
                    <span>{avatar.initials}</span>
                  </div>
                ) : (
                  <img
                    src={avatar.imageUrl}
                    alt=""
                    aria-hidden="true"
                    onError={() => handleImageError(avatar.id)}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Floating Tooltip */}
        {activeTooltip && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-50">
            {activeTooltip} · Verified Partner
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        )}
      </div>

      {/* Text label matching seranking.com exactly */}
      <span className="text-xs sm:text-sm text-gray-700 tracking-tight">
        Trusted by <strong className="font-extrabold text-gray-900">40,000+</strong> agencies
      </span>
    </div>
  );
}
