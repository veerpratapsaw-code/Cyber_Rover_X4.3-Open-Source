import React from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useSensorTelemetry } from './hooks/useSensorTelemetry';
import { useSmoothScroll } from './hooks/useSmoothScroll';

import NavigationHUD from './components/layout/NavigationHUD';
import FooterFinale from './components/layout/FooterFinale';
import CyberGridCanvas from './components/ui/CyberGridCanvas';

import HeroSection from './components/sections/HeroSection';
import MissionSection from './components/sections/MissionSection';
import ChassisSection from './components/sections/ChassisSection';
import MoveSection from './components/sections/MoveSection';
import SenseSection from './components/sections/SenseSection';
import SeeSection from './components/sections/SeeSection';
import ConnectSection from './components/sections/ConnectSection';
import OperationsSection from './components/sections/OperationsSection';
import LimitationsSection from './components/sections/LimitationsSection';
import CyberRoverX5Section from './components/sections/CyberRoverX5Section';
import SpecsSection from './components/sections/SpecsSection';

import './styles/tokens.css';
import './styles/globals.css';

export default function App() {
  useSmoothScroll();
  const { scrollPercent, activeSection } = useScrollProgress();
  const telemetry = useSensorTelemetry();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--bg-base)', overflowX: 'hidden' }}>
      {/* 3D Real-Time Depth Particle & Horizon Grid Canvas */}
      <CyberGridCanvas />

      {/* Sleek Aerospace Navigation HUD */}
      <NavigationHUD
        activeSection={activeSection}
        scrollPercent={scrollPercent}
        batteryVoltage={telemetry.batteryVoltage}
      />

      {/* Main Continuous Narrative Chapters */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* 01 // HERO STAGING */}
        <HeroSection telemetry={telemetry} />

        {/* 02 // MISSION IMPERATIVE */}
        <MissionSection />

        {/* 03 // CHASSIS ARCHITECTURE */}
        <ChassisSection />

        {/* 04 // MOBILITY & ACOUSTIC SONAR */}
        <MoveSection telemetry={telemetry} />

        {/* 05 // MULTI-GAS ENVIRONMENTAL SUITE */}
        <SenseSection telemetry={telemetry} />

        {/* 06 // OPTICAL SYSTEM & ARTICULATED HEAD */}
        <SeeSection />

        {/* 07 // DISTRIBUTED SYSTEM TOPOLOGY & CYBER OS */}
        <ConnectSection />

        {/* 08 // TARGET OPERATIONAL THEATERS */}
        <OperationsSection />

        {/* 09 // CURRENT PROTOTYPE LIMITATIONS */}
        <LimitationsSection />

        {/* 10 // FUTURE ROADMAP: CYBERROVER X5 */}
        <CyberRoverX5Section />

        {/* 11 // ENGINEERING DATASHEET */}
        <SpecsSection />
      </main>

      {/* Merged Climax Finale & Technical Aerospace Footer */}
      <FooterFinale />
    </div>
  );
}
