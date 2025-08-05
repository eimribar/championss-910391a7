
import React from "react";
import { Button } from "@/components/ui/button";
import { LogoWithText } from "@/components/ui/logo";
import InteractiveCta from "../components/landing/InteractiveCta";

export default function Landing() {
  const handleAuthAction = (action = 'login') => {
    // Placeholder for auth actions
    console.log(`${action} clicked`);
  };

  const pageStyles = `
    body, html {
      height: 100%;
      overflow: hidden;
    }
    .aurora-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -10;
      background-color: #030712;
      overflow: hidden;
    }
    .aurora-background::before {
      content: '';
      position: absolute;
      width: 150%;
      height: 150%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-image: 
        radial-gradient(ellipse at 70% 80%, #FF7F50 0%, transparent 40%),
        radial-gradient(ellipse at 30% 20%, #4FD1C7 0%, transparent 45%),
        radial-gradient(ellipse at 50% 60%, #9333ea 0%, transparent 50%);
      filter: blur(120px);
      opacity: 0.25;
      animation: rotateAurora 20s infinite linear;
    }
    @keyframes rotateAurora {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
    .grainy-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -5;
      pointer-events: none;
      background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
      opacity: 0.05;
    }
  `;

  return (
    <div className="bg-gray-950 text-gray-200 h-screen w-screen flex flex-col font-sans">
      <style>{pageStyles}</style>
      <div className="aurora-background"></div>
      <div className="grainy-overlay"></div>

      <nav className="px-2 container sm:px-8 z-10 -mt-8 sm:-mt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <LogoWithText className="h-32 sm:h-40" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => handleAuthAction('login')}>

              Log in
            </Button>
            <Button
              className="text-sm coral-teal-gradient text-white font-medium rounded-md px-4 py-2 hover:opacity-90 transition-all hidden sm:block"
              onClick={() => handleAuthAction('signup')}>

              Get started
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex flex-col items-center justify-center px-4 -mt-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-5 text-base font-bold md:text-5xl lg:text-6xl tracking-tight">Automated Champions Tracking

          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Get instant alerts when your key contacts and customers change jobs.
          </p>
        </div>
        <InteractiveCta />
      </div>
    </div>);

}
