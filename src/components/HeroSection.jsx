import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroSection() {
  return (
    <section className="relative h-[420px] md:h-[520px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/UGnf9D1Hp3OG8vSG/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-neutral-950/50 to-neutral-950 pointer-events-none" />
      <div className="relative container mx-auto px-4 md:px-6 h-full flex items-end pb-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">Design your strategy. Upgrade your army.</h2>
          <p className="mt-3 text-neutral-300">A minimalist chess experience with a twist: earn points and enhance your pieces pre-game or mid-game.</p>
        </div>
      </div>
    </section>
  );
}
