'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

interface SquishState {
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export const DraggableFloatingBubble: React.FC = () => {
  // Position state
  const [position, setPosition] = useState<Position>({ x: 20, y: 100 });
  const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });

  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // Squish/stretch state
  const [squish, setSquish] = useState<SquishState>({
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastPositionRef = useRef<Position>({ x: 20, y: 100 });
  const lastTimeRef = useRef<number>(Date.now());

  // Screen boundaries
  const BUBBLE_SIZE = 60; // px
  const PADDING = 10; // px
  const FRICTION = 0.98;
  const GRAVITY = 0.15; // slight downward pull
  const BOUNCE_DAMPING = 0.7; // energy loss on bounce
  const MAX_VELOCITY = 20; // max speed

  // Calculate screen boundaries
  const getMaxX = useCallback(() => window.innerWidth - BUBBLE_SIZE - PADDING, []);
  const getMaxY = useCallback(() => window.innerHeight - BUBBLE_SIZE - PADDING, []);

  // Constrain position within boundaries
  const constrainPosition = useCallback(
    (pos: Position): Position => ({
      x: Math.max(PADDING, Math.min(pos.x, getMaxX())),
      y: Math.max(PADDING, Math.min(pos.y, getMaxY())),
    }),
    [getMaxX, getMaxY]
  );

  // Calculate squish based on movement direction
  const calculateSquish = useCallback((vx: number, vy: number) => {
    const magnitude = Math.sqrt(vx * vx + vy * vy);
    const normalizedVx = magnitude > 0 ? vx / magnitude : 0;
    const normalizedVy = magnitude > 0 ? vy / magnitude : 0;

    // Determine primary direction
    const absVx = Math.abs(normalizedVx);
    const absVy = Math.abs(normalizedVy);

    let scaleX = 1;
    let scaleY = 1;
    let rotation = 0;

    if (magnitude > 0.5) {
      const squishAmount = Math.min(magnitude / 30, 0.3);

      if (absVx > absVy) {
        // Horizontal movement - stretch horizontally, squish vertically
        scaleX = 1 + squishAmount;
        scaleY = Math.max(0.7, 1 - squishAmount * 1.5);
        rotation = normalizedVx > 0 ? 5 : -5;
      } else {
        // Vertical movement - stretch vertically, squish horizontally
        scaleY = 1 + squishAmount;
        scaleX = Math.max(0.7, 1 - squishAmount * 1.5);
        rotation = normalizedVy > 0 ? -3 : 3;
      }
    }

    return { scaleX, scaleY, rotation };
  }, []);

  // Physics update loop
  useEffect(() => {
    const animate = () => {
      setPosition((prevPos) => {
        let newX = prevPos.x + velocity.x;
        let newY = prevPos.y + velocity.y;

        let newVx = velocity.x;
        let newVy = velocity.y;

        // Apply gravity (slight downward pull)
        newVy += GRAVITY;

        // Apply friction/air resistance
        newVx *= FRICTION;
        newVy *= FRICTION;

        // Limit max velocity
        const vMagnitude = Math.sqrt(newVx * newVx + newVy * newVy);
        if (vMagnitude > MAX_VELOCITY) {
          const scale = MAX_VELOCITY / vMagnitude;
          newVx *= scale;
          newVy *= scale;
        }

        // Boundary collision with bounce
        const maxX = getMaxX();
        const maxY = getMaxY();

        if (newX < PADDING) {
          newX = PADDING;
          newVx *= -BOUNCE_DAMPING;
        } else if (newX > maxX) {
          newX = maxX;
          newVx *= -BOUNCE_DAMPING;
        }

        if (newY < PADDING) {
          newY = PADDING;
          newVy *= -BOUNCE_DAMPING;
        } else if (newY > maxY) {
          newY = maxY;
          newVy *= -BOUNCE_DAMPING;
        }

        // Update velocity state
        setVelocity({ x: newVx, y: newVy });

        // Update squish animation based on velocity
        const squishState = calculateSquish(newVx, newVy);
        setSquish(squishState);

        // Stop animation if velocity is negligible
        if (Math.abs(newVx) < 0.1 && Math.abs(newVy) < 0.1 && !dragState.isDragging) {
          setIsAnimating(false);
          // Reset squish with bounce animation
          setSquish({ scaleX: 1, scaleY: 1, rotation: 0 });
          return prevPos;
        }

        return { x: newX, y: newY };
      });

      if (dragState.isDragging || isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (dragState.isDragging || isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [dragState.isDragging, isAnimating, calculateSquish, dragState, getMaxX, getMaxY]);

  // Mouse/Touch handlers
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      const bubbleRect = bubbleRef.current?.getBoundingClientRect();
      if (!bubbleRect) return;

      setDragState({
        isDragging: true,
        startX: clientX,
        startY: clientY,
        offsetX: clientX - bubbleRect.left,
        offsetY: clientY - bubbleRect.top,
      });

      setIsAnimating(true);
      setVelocity({ x: 0, y: 0 });
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragState.isDragging) return;

      e.preventDefault();

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const newX = clientX - dragState.offsetX;
      const newY = clientY - dragState.offsetY;

      const constrainedPos = constrainPosition({ x: newX, y: newY });

      // Calculate velocity from movement
      const currentTime = Date.now();
      const timeDelta = Math.max(currentTime - lastTimeRef.current, 1);
      const newVx = (constrainedPos.x - lastPositionRef.current.x) / (timeDelta / 16); // normalize to 16ms frame
      const newVy = (constrainedPos.y - lastPositionRef.current.y) / (timeDelta / 16);

      setPosition(constrainedPos);
      setVelocity({ x: newVx, y: newVy });
      lastPositionRef.current = constrainedPos;
      lastTimeRef.current = currentTime;

      // Update squish based on drag direction
      const squishState = calculateSquish(newVx, newVy);
      setSquish(squishState);
    },
    [dragState.isDragging, dragState.offsetX, dragState.offsetY, constrainPosition, calculateSquish]
  );

  const handlePointerUp = useCallback(() => {
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
    });
    // Keep animation running for physics/bounce effect
    setIsAnimating(true);
  }, []);

  // Attach event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchend', handlePointerUp);

      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [dragState.isDragging, handlePointerMove, handlePointerUp]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => constrainPosition(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [constrainPosition]);

  return (
    <>
      <style>{`
        @keyframes bubbleBounce {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes bubbleGlow {
          0%, 100% {
            box-shadow: 
              0 0 20px rgba(99, 102, 241, 0.3),
              0 0 40px rgba(139, 92, 246, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 
              0 0 30px rgba(99, 102, 241, 0.5),
              0 0 50px rgba(139, 92, 246, 0.3),
              inset 0 0 30px rgba(255, 255, 255, 0.15);
          }
        }

        .draggable-bubble {
          position: fixed;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          cursor: grab;
          user-select: none;
          touch-action: none;
          
          /* Glassmorphism styling */
          background: linear-gradient(135deg, 
            rgba(99, 102, 241, 0.25) 0%,
            rgba(139, 92, 246, 0.15) 100%);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          
          /* Smooth animations */
          transition: none;
          will-change: transform;
          transform-origin: center;
          
          /* Glow effect */
          animation: bubbleGlow 3s ease-in-out infinite;
          
          /* Smooth hardware acceleration */
          transform: translate3d(0, 0, 0);
        }

        .draggable-bubble:active {
          cursor: grabbing;
        }

        .draggable-bubble--dragging {
          animation: none;
          box-shadow: 
            0 0 40px rgba(99, 102, 241, 0.6),
            0 0 80px rgba(139, 92, 246, 0.4),
            inset 0 0 30px rgba(255, 255, 255, 0.2);
        }

        /* Light theme adjustments */
        .light .draggable-bubble {
          background: linear-gradient(135deg, 
            rgba(79, 70, 229, 0.2) 0%,
            rgba(99, 102, 241, 0.1) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.4);
        }

        .light .draggable-bubble--dragging {
          box-shadow: 
            0 0 40px rgba(79, 70, 229, 0.5),
            0 0 80px rgba(99, 102, 241, 0.3),
            inset 0 0 30px rgba(255, 255, 255, 0.3);
        }

        /* Accessibility - reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .draggable-bubble {
            animation: none;
          }

          .draggable-bubble__inner {
            animation: none;
          }
        }

        /* Mobile optimization */
        @media (max-width: 768px) {
          .draggable-bubble {
            width: 50px;
            height: 50px;
            backdrop-filter: blur(15px);
          }
        }

        .draggable-bubble__inner {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%);
          pointer-events: none;
        }
      `}</style>

      <div
        ref={bubbleRef}
        className={`draggable-bubble ${dragState.isDragging ? 'draggable-bubble--dragging' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate3d(0, 0, 0) scaleX(${squish.scaleX}) scaleY(${squish.scaleY}) rotate(${squish.rotation}deg)`,
          transition: dragState.isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div className="draggable-bubble__inner" />
      </div>
    </>
  );
};

export default DraggableFloatingBubble;
