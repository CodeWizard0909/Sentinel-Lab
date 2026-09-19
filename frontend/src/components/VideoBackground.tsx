import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteVideoConfig {
  src: string;
  poster?: string;
  label: string;
  ambientClass: string;
}

const ROUTE_VIDEOS: Record<string, RouteVideoConfig> = {
  overview: {
    src: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104303_0c6d60b2-9353-408e-9449-585108a22fb5.mp4',
    poster: 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg',
    label: 'NEURAL LATTICE',
    ambientClass: 'radial-ambient-gold'
  },
  upload: {
    src: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4',
    label: 'DATA INGESTION / BOUNDARY',
    ambientClass: 'radial-ambient-cyan'
  },
  dashboard: {
    src: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260326_073936_8dd07fdb-4f6b-4220-a3f0-9dedfaab0c88.mp4',
    label: 'MISSION CONTROL / SANDBOX',
    ambientClass: 'radial-ambient-blue'
  },
  results: {
    src: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4',
    label: 'CRYPTOGRAPHIC VERDICT',
    ambientClass: 'radial-ambient-green'
  },
  architecture: {
    src: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
    label: 'MULTI-AGENT CLOUD TOPOLOGY',
    ambientClass: 'radial-ambient-purple'
  }
};

const getVideoKeyForPath = (pathname: string): string => {
  if (pathname === '/' || pathname === '') return 'overview';
  if (pathname.startsWith('/upload')) return 'upload';
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/analysis')) return 'dashboard';
  if (pathname.startsWith('/results')) return 'results';
  if (pathname.startsWith('/architecture')) return 'architecture';
  return 'overview';
};

export const VideoBackground: React.FC = () => {
  const location = useLocation();
  const currentKey = getVideoKeyForPath(location.pathname);

  // Dual-slot video architecture for buttery-smooth crossfading between route changes
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [slotA, setSlotA] = useState<RouteVideoConfig>(ROUTE_VIDEOS[currentKey]);
  const [slotB, setSlotB] = useState<RouteVideoConfig>(ROUTE_VIDEOS[currentKey]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videoRefA = useRef<HTMLVideoElement | null>(null);
  const videoRefB = useRef<HTMLVideoElement | null>(null);

  // Handle route changes and crossfade smoothly
  useEffect(() => {
    const targetConfig = ROUTE_VIDEOS[currentKey];
    const currentConfig = activeSlot === 'A' ? slotA : slotB;

    if (targetConfig.src === currentConfig.src) return;

    setIsTransitioning(true);

    if (activeSlot === 'A') {
      setSlotB(targetConfig);
      // Wait for next tick so slotB updates in DOM, then start playback and flip activeSlot
      setTimeout(() => {
        if (videoRefB.current) {
          videoRefB.current.currentTime = 0;
          const p = videoRefB.current.play();
          if (p) p.catch(() => {});
        }
        setActiveSlot('B');
        setTimeout(() => setIsTransitioning(false), 800);
      }, 50);
    } else {
      setSlotA(targetConfig);
      setTimeout(() => {
        if (videoRefA.current) {
          videoRefA.current.currentTime = 0;
          const p = videoRefA.current.play();
          if (p) p.catch(() => {});
        }
        setActiveSlot('A');
        setTimeout(() => setIsTransitioning(false), 800);
      }, 50);
    }
  }, [currentKey, activeSlot, slotA, slotB]);

  // Reduced motion support
  useEffect(() => {
    const q = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)');
    const sync = () => {
      const vA = videoRefA.current;
      const vB = videoRefB.current;
      if (q && q.matches) {
        vA?.pause();
        vB?.pause();
      } else {
        if (activeSlot === 'A') vA?.play().catch(() => {});
        else vB?.play().catch(() => {});
      }
    };

    sync();
    if (q) {
      q.addEventListener ? q.addEventListener('change', sync) : q.addListener(sync);
    }
    return () => {
      if (q) {
        q.removeEventListener ? q.removeEventListener('change', sync) : q.removeListener(sync);
      }
    };
  }, [activeSlot]);

  const activeConfig = activeSlot === 'A' ? slotA : slotB;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#02060f]">
      {/* Video Slot A */}
      <video
        ref={videoRefA}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        poster={slotA.poster}
        src={slotA.src}
        className={`art ${activeSlot === 'A' ? 'art-active' : 'art-inactive'}`}
      />

      {/* Video Slot B */}
      <video
        ref={videoRefB}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        poster={slotB.poster}
        src={slotB.src}
        className={`art ${activeSlot === 'B' ? 'art-active' : 'art-inactive'}`}
      />

      {/* Dynamic Ambient Volumetric Lighting Tint per Route */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
          activeConfig.ambientClass === 'radial-ambient-gold' 
            ? 'bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(245,158,11,0.06),transparent_70%)]'
            : activeConfig.ambientClass === 'radial-ambient-cyan'
            ? 'bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(56,189,248,0.08),transparent_70%)]'
            : activeConfig.ambientClass === 'radial-ambient-blue'
            ? 'bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(14,165,233,0.08),transparent_70%)]'
            : activeConfig.ambientClass === 'radial-ambient-green'
            ? 'bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(16,185,129,0.08),transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(168,85,247,0.07),transparent_70%)]'
        }`}
      />

      {/* Symmetrical Volumetric Veil Layer */}
      <div className="neural-veil" />
    </div>
  );
};
