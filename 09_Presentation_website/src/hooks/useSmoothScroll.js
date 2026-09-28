import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function smoothScrollTo(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;

  if (window.__lenis) {
    window.__lenis.scrollTo(el, {
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      offset: -50
    });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export function useSmoothScroll() {
  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      infinite: false
    });

    window.__lenis = lenis;

    // Sync with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateRaf = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    // Setup global ScrollTrigger 3D reveals
    const revealElements = document.querySelectorAll('.reveal-3d');
    revealElements.forEach((elem) => {
      gsap.fromTo(
        elem,
        {
          opacity: 0,
          y: 60,
          rotateX: 12,
          scale: 0.96,
          transformPerspective: 1000
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Parallax floating images
    const parallaxImages = document.querySelectorAll('.parallax-img');
    parallaxImages.forEach((img) => {
      gsap.to(img, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      });
    });

    return () => {
      gsap.ticker.remove(updateRaf);
      lenis.destroy();
      window.__lenis = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
}
