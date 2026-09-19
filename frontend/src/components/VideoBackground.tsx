import React, { useRef, useState, useEffect } from 'react';

export const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Reduced motion check
    const q = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)');
    const v = videoRef.current;
    if (!v) return;

    const sync = () => {
      if (q && q.matches) {
        v.pause();
      } else {
        const p = v.play();
        if (p) p.catch(() => {});
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
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#02060f]">
      {/* Video Background with Poster Frame Fallback */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104303_0c6d60b2-9353-408e-9449-585108a22fb5.mp4"
        className="art"
      />

      {/* Symmetrical Volumetric Veil Layer */}
      <div className="neural-veil" />
    </div>
  );
};
