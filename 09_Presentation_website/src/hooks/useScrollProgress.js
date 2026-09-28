import { useState, useEffect } from 'react';

export function useScrollProgress() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const updateProgress = () => {
      const winScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 1;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const height = scrollHeight - clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollPercent(Math.min(100, Math.max(0, scrolled)));

      // Detect active section
      const sections = [
        'hero',
        'mission',
        'chassis',
        'mobility',
        'sensing',
        'vision',
        'system',
        'operations',
        'specs',
        'finale'
      ];

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.2) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });

    // Sync with Lenis smooth scroll ticker if available
    let lenisListener = null;
    let timer = null;

    const attachLenis = () => {
      if (window.__lenis) {
        lenisListener = () => updateProgress();
        window.__lenis.on('scroll', lenisListener);
      } else {
        timer = setTimeout(attachLenis, 150);
      }
    };
    attachLenis();
    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
      if (timer) clearTimeout(timer);
      if (window.__lenis && lenisListener) {
        window.__lenis.off('scroll', lenisListener);
      }
    };
  }, []);

  return { scrollPercent, activeSection };
}
