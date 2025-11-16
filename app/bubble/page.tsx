'use client';

import { DraggableFloatingBubble } from '@/components/ui/DraggableFloatingBubble';

export default function BubblePage() {
  return (
    <main className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-8 right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Content area */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Draggable Floating Bubble
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl">
          Try dragging the bubble around the screen. It features physics-based movement,
          water droplet squish animations, and smooth 60fps performance.
        </p>

        {/* Feature list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-12">
          <FeatureCard
            icon="🎯"
            title="Physics Engine"
            description="Realistic movement with gravity, friction, and bounce effects"
          />
          <FeatureCard
            icon="💧"
            title="Squish Animation"
            description="Water droplet effect that stretches and squishes with movement"
          />
          <FeatureCard
            icon="📱"
            title="Multi-touch"
            description="Works on desktop, tablet, and mobile devices"
          />
        </div>

        <div className="text-slate-400 text-sm">
          <p>✨ Drag with mouse or touch | 🌊 Bounce off edges | 💨 Smooth physics</p>
        </div>
      </div>

      {/* Floating bubble component */}
      <DraggableFloatingBubble />
    </main>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="liquid-glass rounded-xl p-6 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-colors">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-300 text-sm">{description}</p>
    </div>
  );
}
