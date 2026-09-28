import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useVideoScrollSync
 * 
 * Synchronizes video playback directly to scroll position within a pinned container:
 * video.currentTime = video.duration * scrollFraction
 * 
 * Employs a requestAnimationFrame / GSAP ticker LERP loop for buttery-smooth 60fps scrubbing
 * even with standard MP4 keyframe intervals.
 */
export function useVideoScrollSync({
  lerpFactor = 0.12,
  triggerOffset = 'top top',
  endOffset = '+=2600'
} = {}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Target time computed from scroll position
  const targetTimeRef = useRef(0);
  const currentLerpTimeRef = useRef(0);
  const isSeekingRef = useRef(false);

  // Initialize video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
        setIsLoaded(true);
      }
    };

    const handleCanPlay = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
        setIsLoaded(true);
      }
    };

    if (video.readyState >= 1 && video.duration) {
      setDuration(video.duration);
      setIsLoaded(true);
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlay);
    };
  }, []);

  // Setup GSAP ScrollTrigger for the container (Desktop only to prevent mobile lag)
  useEffect(() => {
    // Disable on phones and tablets
    if (typeof window !== 'undefined' && window.innerWidth < 960) {
      return;
    }

    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: triggerOffset,
      end: endOffset,
      pin: true,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        setProgress(p);

        if (video.duration && !isNaN(video.duration)) {
          // video.duration = total length of video * scrolled %
          targetTimeRef.current = Math.max(0, Math.min(video.duration - 0.01, p * video.duration));
        }
      }
    });

    scrollTriggerRef.current = st;

    return () => {
      if (st) st.kill();
    };
  }, [triggerOffset, endOffset, isLoaded]);

  // Smooth Render Loop (LERP) - Desktop Only
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 960) {
      return;
    }

    let animFrameId;

    const updateVideoFrame = () => {
      const video = videoRef.current;
      if (video && video.duration && !isNaN(video.duration) && video.readyState >= 2) {
        // Linear interpolation towards target time
        const target = targetTimeRef.current;
        const current = currentLerpTimeRef.current;
        const diff = target - current;

        // If difference exists, smooth step
        if (Math.abs(diff) > 0.001) {
          currentLerpTimeRef.current = current + diff * lerpFactor;
          
          if (!video.seeking && !isSeekingRef.current) {
            try {
              if (typeof video.fastSeek === 'function') {
                video.fastSeek(currentLerpTimeRef.current);
              } else {
                video.currentTime = currentLerpTimeRef.current;
              }
            } catch {
              // Ignore seek aborts during rapid scrolling
            }
          }
          
          setCurrentTime(currentLerpTimeRef.current);
        }
      }

      animFrameId = requestAnimationFrame(updateVideoFrame);
    };

    animFrameId = requestAnimationFrame(updateVideoFrame);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [lerpFactor]);

  // Manual Seek to fraction (0 to 1) or specific second
  const seekToFraction = useCallback((frac) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const clamped = Math.max(0, Math.min(1, frac));
    const targetSec = clamped * video.duration;
    targetTimeRef.current = targetSec;
    currentLerpTimeRef.current = targetSec;
    video.currentTime = targetSec;
    setCurrentTime(targetSec);
    setProgress(clamped);

    // If ScrollTrigger exists, scroll page to match
    if (scrollTriggerRef.current) {
      const start = scrollTriggerRef.current.start;
      const end = scrollTriggerRef.current.end;
      const targetScroll = start + clamped * (end - start);
      if (window.__lenis) {
        window.__lenis.scrollTo(targetScroll, { immediate: false, duration: 0.8 });
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, []);

  // Toggle Auto-Play vs Scroll-Lock
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  return {
    containerRef,
    videoRef,
    duration,
    currentTime,
    progress,
    isLoaded,
    isPlaying,
    seekToFraction,
    togglePlay
  };
}
