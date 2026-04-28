"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="not-found-root">
      {/* Animated background grid */}
      <div className="grid-bg" />

      {/* Floating particles */}
      <div className="particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      {/* Main card */}
      <div className={`card ${mounted ? "card-visible" : ""}`}>



        {/* Car scene */}
        <div className="car-scene">
          {/* Road */}
          <div className="road">
            <div className="road-line" />
            <div className="road-line road-line-2" />
          </div>

          {/* Smoke puffs */}
          <div className="smoke-container">
            <div className="smoke smoke-1" />
            <div className="smoke smoke-2" />
            <div className="smoke smoke-3" />
            <div className="smoke smoke-4" />
            <div className="smoke smoke-5" />
          </div>

          {/* SVG Broken Car */}
          <svg
            className="broken-car"
            viewBox="0 0 320 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shadow */}
            <ellipse cx="160" cy="168" rx="95" ry="8" fill="rgba(0,0,0,0.35)" />

            {/* Car body */}
            <g className="car-body-group">
              {/* Main body */}
              <rect x="45" y="95" width="230" height="55" rx="10" fill="#F97316" />

              {/* Cabin */}
              <path
                d="M95 95 L115 48 L215 48 L235 95 Z"
                fill="#EA580C"
              />

              {/* Windshield */}
              <path
                d="M108 90 L122 55 L205 55 L218 90 Z"
                fill="#1a1a2e"
                opacity="0.85"
              />

              {/* Windshield glare */}
              <path
                d="M118 62 L124 58 L140 85 L133 88 Z"
                fill="white"
                opacity="0.12"
              />

              {/* Cracked windshield lines */}
              <line x1="145" y1="55" x2="155" y2="90" stroke="#888" strokeWidth="1.2" opacity="0.6" />
              <line x1="155" y1="90" x2="175" y2="62" stroke="#888" strokeWidth="1" opacity="0.6" />
              <line x1="175" y1="62" x2="190" y2="80" stroke="#888" strokeWidth="0.8" opacity="0.5" />

              {/* Side windows */}
              <rect x="108" y="65" width="28" height="22" rx="3" fill="#1a1a2e" opacity="0.8" />
              <rect x="200" y="65" width="28" height="22" rx="3" fill="#1a1a2e" opacity="0.8" />

              {/* Door lines */}
              <line x1="157" y1="95" x2="157" y2="150" stroke="#C2500A" strokeWidth="2" />

              {/* Door handle */}
              <rect x="130" y="122" width="20" height="5" rx="2.5" fill="#C2500A" />
              <rect x="170" y="122" width="20" height="5" rx="2.5" fill="#C2500A" />

              {/* Bumper front */}
              <rect x="255" y="118" width="22" height="22" rx="4" fill="#C2500A" />

              {/* Bumper back - bent */}
              <path d="M45 118 Q30 128 35 140 L45 140 Z" fill="#C2500A" />

              {/* Headlights */}
              <rect x="259" y="108" width="14" height="8" rx="3" fill="#FEF08A" />
              <rect x="259" y="108" width="14" height="8" rx="3" fill="url(#headlightGlow)" opacity="0.8" />

              {/* Taillights */}
              <rect x="47" y="108" width="10" height="8" rx="2" fill="#EF4444" />

              {/* Dents on hood */}
              <path d="M215 98 Q225 90 235 98" stroke="#C2500A" strokeWidth="2.5" fill="none" />
              <path d="M220 105 Q228 100 236 105" stroke="#B94500" strokeWidth="1.5" fill="none" />

              {/* Sparks near engine */}
              <g className="sparks">
                <circle cx="248" cy="112" r="2" fill="#FCD34D" />
                <circle cx="255" cy="106" r="1.5" fill="#FB923C" />
                <circle cx="244" cy="104" r="1" fill="#FCD34D" />
              </g>

              {/* Gradient defs */}
              <defs>
                <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF9C3" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
                </radialGradient>
              </defs>
            </g>

            {/* Wheel back - flat */}
            <g className="wheel-back">
              <circle cx="100" cy="155" r="24" fill="#1c1c1c" />
              <circle cx="100" cy="155" r="17" fill="#2d2d2d" />
              <circle cx="100" cy="155" r="8" fill="#111" />
              {/* Flat tire effect */}
              <ellipse cx="100" cy="167" rx="24" ry="8" fill="#111" opacity="0.6" />
              {/* Bolts */}
              <circle cx="100" cy="142" r="2.5" fill="#555" />
              <circle cx="112" cy="152" r="2.5" fill="#555" />
              <circle cx="108" cy="166" r="2.5" fill="#555" />
              <circle cx="92" cy="166" r="2.5" fill="#555" />
              <circle cx="88" cy="152" r="2.5" fill="#555" />
            </g>

            {/* Wheel front */}
            <g className="wheel-front">
              <circle cx="220" cy="155" r="24" fill="#1c1c1c" />
              <circle cx="220" cy="155" r="17" fill="#2d2d2d" />
              <circle cx="220" cy="155" r="8" fill="#111" />
              {/* Bolts */}
              <circle cx="220" cy="142" r="2.5" fill="#555" />
              <circle cx="232" cy="152" r="2.5" fill="#555" />
              <circle cx="228" cy="166" r="2.5" fill="#555" />
              <circle cx="212" cy="166" r="2.5" fill="#555" />
              <circle cx="208" cy="152" r="2.5" fill="#555" />
            </g>
          </svg>

          {/* Ground sparks */}
          <div className="ground-sparks">
            <div className="spark spark-1" />
            <div className="spark spark-2" />
            <div className="spark spark-3" />
          </div>
        </div>

        {/* 404 Text */}
        <div className="four-o-four">
          <span className="num-4 left-4">4</span>
          <div className="zero-wrapper">
            <div className="zero-ring">
              <div className="zero-inner">
                <svg viewBox="0 0 60 60" className="tire-svg">
                  <circle cx="30" cy="30" r="25" fill="#1a1a1a" stroke="#333" strokeWidth="3" />
                  <circle cx="30" cy="30" r="16" fill="#0f0f0f" />
                  <circle cx="30" cy="30" r="7" fill="#1a1a1a" stroke="#444" strokeWidth="2" />
                  <line x1="30" y1="14" x2="30" y2="8" stroke="#555" strokeWidth="2" />
                  <line x1="30" y1="52" x2="30" y2="46" stroke="#555" strokeWidth="2" />
                  <line x1="8" y1="30" x2="14" y2="30" stroke="#555" strokeWidth="2" />
                  <line x1="46" y1="30" x2="52" y2="30" stroke="#555" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
          <span className="num-4 right-4">4</span>
        </div>

        {/* Message */}
        <div className="message-block">
          <h1 className="message-title">Oops! Looks like you got lost</h1>
          <p className="message-sub">
            The page you&apos;re looking for broke down on the road.
            <br />
            Let us tow you back to safety.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="cta-row">
          <Link href="/" className="btn-home" id="go-home-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Take me home
          </Link>
          <button
            id="go-back-btn"
            onClick={() => window.history.back()}
            className="btn-back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Go back
          </button>
        </div>

        {/* Error code badge */}
        <div className="error-badge">
          <span className="error-badge-dot" />
          ERROR CODE: 404 — PAGE NOT FOUND
        </div>
      </div>

      <style jsx>{`
        /* ===== ROOT ===== */
        .not-found-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          padding: 24px;
        }

        /* ===== GRID BACKGROUND ===== */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        /* Radial glow center */
        .not-found-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(249,115,22,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ===== PARTICLES ===== */
        .particles { position: absolute; inset: 0; pointer-events: none; }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(249,115,22,0.5);
          animation: float linear infinite;
        }
        .particle-1  { width:4px;  height:4px;  left:10%;  top:80%; animation-duration:8s;  animation-delay:0s;   }
        .particle-2  { width:3px;  height:3px;  left:20%;  top:70%; animation-duration:10s; animation-delay:1s;   }
        .particle-3  { width:5px;  height:5px;  left:30%;  top:90%; animation-duration:7s;  animation-delay:2s;   }
        .particle-4  { width:2px;  height:2px;  left:40%;  top:85%; animation-duration:12s; animation-delay:0.5s; }
        .particle-5  { width:4px;  height:4px;  left:55%;  top:75%; animation-duration:9s;  animation-delay:3s;   }
        .particle-6  { width:3px;  height:3px;  left:65%;  top:90%; animation-duration:11s; animation-delay:1.5s; }
        .particle-7  { width:5px;  height:5px;  left:75%;  top:80%; animation-duration:6s;  animation-delay:4s;   }
        .particle-8  { width:2px;  height:2px;  left:85%;  top:70%; animation-duration:13s; animation-delay:2.5s; }
        .particle-9  { width:4px;  height:4px;  left:15%;  top:60%; animation-duration:9s;  animation-delay:0.8s; }
        .particle-10 { width:3px;  height:3px;  left:50%;  top:95%; animation-duration:8s;  animation-delay:3.5s; }
        .particle-11 { width:5px;  height:5px;  left:90%;  top:85%; animation-duration:10s; animation-delay:1.2s; }
        .particle-12 { width:2px;  height:2px;  left:5%;   top:75%; animation-duration:14s; animation-delay:2s;   }

        @keyframes float {
          0%   { transform: translateY(0) scale(1); opacity: 0.6; }
          50%  { opacity: 1; }
          100% { transform: translateY(-120vh) scale(0.3); opacity: 0; }
        }

        /* ===== CARD ===== */
        .card {
          position: relative;
          background: linear-gradient(145deg, #141414 0%, #111 50%, #0f0f0f 100%);
          border: 1px solid #222;
          border-radius: 24px;
          padding: 0 0 40px 0;
          max-width: 680px;
          width: 100%;
          box-shadow:
            0 0 0 1px rgba(249,115,22,0.08),
            0 40px 80px rgba(0,0,0,0.8),
            0 0 60px rgba(249,115,22,0.06);
          opacity: 0;
          transform: translateY(32px) scale(0.97);
          transition: opacity 0.7s ease, transform 0.7s ease;
          overflow: hidden;
        }
        .card-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* ===== TOP BAR ===== */
        .top-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid #1e1e1e;
          background: #0f0f0f;
        }
        .top-bar-dots { display: flex; gap: 7px; align-items: center; }
        .dot {
          width: 12px; height: 12px; border-radius: 50%;
        }
        
        .top-bar-label {
          margin-left: 4px;
          font-size: 12px;
          color: #555;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.5px;
        }

        /* ===== CAR SCENE ===== */
        .car-scene {
          position: relative;
          height: 220px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: visible;
          margin-top: 8px;
        }

        /* Road */
        .road {
          position: absolute;
          bottom: 0;
          left: 0; right: 0;
          height: 6px;
          background: #1e1e1e;
          border-radius: 3px;
          overflow: hidden;
        }
        .road-line {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          height: 2px;
          width: 60px;
          background: #F97316;
          border-radius: 1px;
          animation: roadScroll 0.8s linear infinite;
          opacity: 0.5;
        }
        .road-line-2 { animation-delay: -0.4s; }
        @keyframes roadScroll {
          from { left: 110%; }
          to   { left: -20%; }
        }

        /* SVG Car */
        .broken-car {
          width: 320px;
          max-width: 90vw;
          animation: carShake 0.3s ease-in-out infinite alternate;
          position: relative;
          z-index: 2;
          margin-bottom: 6px;
          filter: drop-shadow(0 8px 24px rgba(249,115,22,0.2));
        }
        @keyframes carShake {
          0%   { transform: rotate(-0.8deg) translateY(0px); }
          100% { transform: rotate(0.8deg) translateY(-2px); }
        }

        /* Wheel spin */
        .wheel-front {
          transform-origin: 220px 155px;
          animation: wheelSpin 1s linear infinite;
        }
        .wheel-back {
          transform-origin: 100px 155px;
          animation: wheelSpin 1s linear infinite;
        }
        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Sparks flicker */
        .sparks {
          animation: sparkFlicker 0.2s ease-in-out infinite alternate;
        }
        @keyframes sparkFlicker {
          0%   { opacity: 0.2; transform: scale(0.8) translateY(2px); }
          100% { opacity: 1;   transform: scale(1.2) translateY(-2px); }
        }

        /* ===== SMOKE ===== */
        .smoke-container {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50px);
          z-index: 3;
          pointer-events: none;
        }
        .smoke {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(150,150,150,0.7) 0%, rgba(100,100,100,0.1) 70%, transparent 100%);
          animation: smokeRise linear infinite;
        }
        .smoke-1 { width:28px; height:28px; left:0;    bottom:0; animation-duration:2.2s; animation-delay:0s;    }
        .smoke-2 { width:36px; height:36px; left:-8px; bottom:0; animation-duration:2.8s; animation-delay:0.5s;  }
        .smoke-3 { width:22px; height:22px; left:10px; bottom:0; animation-duration:2.0s; animation-delay:1s;    }
        .smoke-4 { width:44px; height:44px; left:-16px;bottom:0; animation-duration:3.2s; animation-delay:1.5s;  }
        .smoke-5 { width:18px; height:18px; left:5px;  bottom:0; animation-duration:1.8s; animation-delay:0.8s;  }

        @keyframes smokeRise {
          0%   { transform: translateY(0) scale(0.3);    opacity: 0.8; }
          40%  { opacity: 0.5; }
          100% { transform: translateY(-120px) scale(2); opacity: 0;   }
        }

        /* ===== GROUND SPARKS ===== */
        .ground-sparks {
          position: absolute;
          bottom: 8px;
          left: calc(50% + 80px);
        }
        .spark {
          position: absolute;
          border-radius: 50%;
          background: #F97316;
          animation: sparkBounce ease-in-out infinite alternate;
        }
        .spark-1 { width:4px;  height:4px;  left:0;   bottom:0; animation-duration:0.3s; animation-delay:0s; }
        .spark-2 { width:3px;  height:3px;  left:8px; bottom:0; animation-duration:0.4s; animation-delay:0.1s; }
        .spark-3 { width:5px;  height:5px;  left:-5px;bottom:0; animation-duration:0.25s;animation-delay:0.2s; }
        @keyframes sparkBounce {
          0%   { transform: translateY(0)   scale(1);   opacity: 1; }
          100% { transform: translateY(-12px) scale(0.5); opacity: 0.2; }
        }

        /* ===== 404 TEXT ===== */
        .four-o-four {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 24px;
          margin-top: -8px;
        }
        .num-4 {
          font-size: clamp(80px, 18vw, 140px);
          font-weight: 900;
          color: #F97316;
          font-family: 'Outfit', sans-serif;
          line-height: 1;
          text-shadow: 0 0 40px rgba(249,115,22,0.4), 0 0 80px rgba(249,115,22,0.15);
          animation: numGlow 2s ease-in-out infinite alternate;
        }
        @keyframes numGlow {
          from { text-shadow: 0 0 30px rgba(249,115,22,0.4), 0 0 60px rgba(249,115,22,0.1); }
          to   { text-shadow: 0 0 50px rgba(249,115,22,0.6), 0 0 100px rgba(249,115,22,0.25); }
        }

        .zero-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .zero-ring {
          width: clamp(80px, 15vw, 120px);
          height: clamp(80px, 15vw, 120px);
          border-radius: 50%;
          background: #1a1a1a;
          border: 6px solid #2d2d2d;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: tireSpin 4s linear infinite;
          box-shadow: 0 0 0 2px #111, 0 0 20px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.8);
        }
        @keyframes tireSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .zero-inner {
          width: 70%;
          height: 70%;
        }
        .tire-svg { width: 100%; height: 100%; }

        /* ===== MESSAGE ===== */
        .message-block {
          text-align: center;
          padding: 20px 32px 0;
        }
        .message-title {
          font-size: clamp(18px, 4vw, 24px);
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 10px;
          letter-spacing: -0.3px;
        }
        .message-sub {
          font-size: 14px;
          color: #6B7280;
          line-height: 1.7;
          margin: 0;
        }

        /* ===== CTA BUTTONS ===== */
        .cta-row {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          padding: 28px 32px 0;
        }
        .btn-home {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: #F97316;
          color: white;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 0 0 rgba(249,115,22,0.4);
          animation: btnPulse 3s ease-in-out infinite;
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0); }
        }
        .btn-home:hover {
          background: #EA580C;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(249,115,22,0.4);
        }
        .btn-back {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: transparent;
          color: #9CA3AF;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .btn-back:hover {
          border-color: #F97316;
          color: #F97316;
          transform: translateY(-2px);
          background: rgba(249,115,22,0.05);
        }

        /* ===== ERROR BADGE ===== */
        .error-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 28px;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: #333;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
        }
        .error-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #F97316;
          animation: badgeBlink 1.2s ease-in-out infinite;
        }
        @keyframes badgeBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
