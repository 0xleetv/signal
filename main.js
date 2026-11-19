/**
 * SIGNAL — The Anti-Gravity Transaction Story
 * Vanilla HTML5, CSS3, ES6+
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const CONFIG = {
    totalActs: 5,
    colors: {
      act1: { r: 34, g: 211, b: 238, hex: '#22d3ee' }, // Electric Cyan
      act2: { r: 245, g: 158, b: 11, hex: '#f59e0b' }, // Amber Gold
      act3: { r: 168, g: 85, b: 247, hex: '#a855f7' }, // Royal Violet
      act4: { r: 6, g: 182, b: 212, hex: '#06b6d4' },  // Vivid Teal
      act5: { r: 16, g: 185, b: 129, hex: '#10b981' }, // Emerald Green
    },
    particle: {
      baseRadius: 4.5,
      glowRadius: 28,
    }
  };

  // --- DOM Elements ---
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const telemetryAct = document.getElementById('telemetry-act');
  const telemetryHash = document.getElementById('telemetry-hash');
  const scrollPct = document.getElementById('scroll-pct');
  const actElements = Array.from(document.querySelectorAll('.act'));

  // --- State ---
  let viewport = { width: window.innerWidth, height: window.innerHeight, dpr: Math.min(window.devicePixelRatio || 1, 2) };
  let scrollProgress = 0; // 0.0 to 1.0
  let targetScrollProgress = 0;
  let activeAct = 1;
  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The Signal particle (Point of Light)
  const signal = {
    x: viewport.width * 0.5,
    y: viewport.height * 0.5,
    targetX: viewport.width * 0.5,
    targetY: viewport.height * 0.5,
    radius: CONFIG.particle.baseRadius,
    alpha: 1.0,
    trail: [],
    maxTrail: 24,
    color: CONFIG.colors.act1,
    bursts: [],
  };

  // --- Setup Canvas Size ---
  function resizeCanvas() {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    viewport.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = viewport.width * viewport.dpr;
    canvas.height = viewport.height * viewport.dpr;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    ctx.scale(viewport.dpr, viewport.dpr);
  }

  // --- Scroll Progress Calculation ---
  function onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScrollProgress = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
  }

  // --- Color Interpolation ---
  function interpolateColor(c1, c2, factor) {
    const f = Math.max(0, Math.min(1, factor));
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * f),
      g: Math.round(c1.g + (c2.g - c1.g) * f),
      b: Math.round(c1.b + (c2.b - c1.b) * f),
    };
  }

  // --- Act Progression & Trajectory ---
  function updateActProgression(progress) {
    const actProgress = progress * (CONFIG.totalActs - 1);
    const actIndex = Math.min(Math.floor(actProgress), CONFIG.totalActs - 2);
    const actSubProgress = actProgress - actIndex;

    const colorKeys = ['act1', 'act2', 'act3', 'act4', 'act5'];
    const fromColor = CONFIG.colors[colorKeys[actIndex]];
    const toColor = CONFIG.colors[colorKeys[actIndex + 1]];
    signal.color = interpolateColor(fromColor, toColor, actSubProgress);

    const calculatedAct = Math.min(CONFIG.totalActs, Math.floor(progress * CONFIG.totalActs) + 1);
    if (calculatedAct !== activeAct) {
      activeAct = calculatedAct;
      if (telemetryAct) {
        telemetryAct.textContent = `ACT 0${activeAct}`;
      }
      document.documentElement.style.setProperty('--current-accent', `var(--accent-act${activeAct})`);
    }

    if (scrollPct) {
      const pct = Math.round(progress * 100);
      scrollPct.textContent = `${pct.toString().padStart(3, '0')}% SCROLLED`;
    }

    // --- ACT I: WALLET PHYSICS & BALANCE TILT ---
    const act1Progress = Math.min(1, Math.max(0, progress / 0.20));
    const walletCard = document.getElementById('wallet-card');
    const walletBalance = document.getElementById('wallet-balance');
    const meterFill = document.getElementById('meter-fill');
    const meterVal = document.getElementById('meter-val');

    if (walletCard) {
      if (act1Progress > 0 && act1Progress < 1) {
        const tiltX = -6 * Math.sin(act1Progress * Math.PI);
        const tiltY = 12 * Math.sin(act1Progress * Math.PI);
        const liftY = -28 * act1Progress;
        walletCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${liftY}px) scale(${1 + act1Progress * 0.03})`;
        walletCard.style.borderColor = `rgba(34, 211, 238, ${0.2 + act1Progress * 0.4})`;
      } else if (act1Progress >= 1) {
        walletCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(-28px) scale(1.03)`;
        walletCard.style.borderColor = `rgba(34, 211, 238, 0.2)`;
      } else {
        walletCard.style.transform = `none`;
        walletCard.style.borderColor = `rgba(34, 211, 238, 0.2)`;
      }
    }

    if (walletBalance && meterFill) {
      // Balance tilts from 25,000.00 down to 24,500.00 as 500 USDC point is born
      const balanceInt = Math.round(25000 - 500 * act1Progress);
      walletBalance.textContent = balanceInt.toLocaleString('en-US');
      meterFill.style.width = `${((balanceInt / 25000) * 100).toFixed(1)}%`;
      if (meterVal) {
        meterVal.textContent = `${balanceInt.toLocaleString('en-US')}.00 USDC`;
      }
    }

    // --- ACT II: PROPAGATION PIPE MATH ---
    const act2Card = document.getElementById('handoff-card');
    const propSpeedEl = document.getElementById('prop-speed');
    const nodeCountEl = document.getElementById('node-count');
    if (progress > 0.18 && progress <= 0.42) {
      const act2p = Math.min(1, Math.max(0, (progress - 0.20) / 0.20));
      if (act2Card) {
        act2Card.style.borderColor = `rgba(245, 158, 11, ${0.2 + act2p * 0.5})`;
        act2Card.style.transform = `translateY(${-12 * Math.sin(act2p * Math.PI)}px)`;
      }
      if (propSpeedEl) {
        // Latency drops dynamically as relays accelerate
        const speed = (28.4 - 16.0 * act2p).toFixed(1);
        propSpeedEl.textContent = `${speed} ms`;
      }
      if (nodeCountEl) {
        // Relay peers count increases as propagation spreads
        const peers = Math.round(32 + 96 * act2p);
        nodeCountEl.textContent = `${peers} PEERS`;
      }
    } else if (act2Card && progress <= 0.18) {
      act2Card.style.borderColor = `rgba(245, 158, 11, 0.2)`;
      act2Card.style.transform = `none`;
    }

    // --- ACT III: BLOCK TOWER CRYSTALLIZATION MATH ---
    const act3Card = document.getElementById('chain-card');
    if (progress > 0.38 && progress <= 0.62) {
      const act3p = Math.min(1, Math.max(0, (progress - 0.40) / 0.20));
      if (act3Card) {
        act3Card.style.borderColor = `rgba(168, 85, 247, ${0.25 + act3p * 0.55})`;
        act3Card.style.transform = `scale(${1 + 0.02 * Math.sin(act3p * Math.PI)})`;
      }
    } else if (act3Card && progress <= 0.38) {
      act3Card.style.borderColor = `rgba(168, 85, 247, 0.25)`;
      act3Card.style.transform = `none`;
    }

    // Trajectory calculation across viewport
    const t = progress;
    if (t <= 0.20) {
      // Act 1: Birth in wallet cradle, then buoyant float upward
      const cardRect = walletCard ? walletCard.getBoundingClientRect() : null;
      let startX = viewport.width * 0.55;
      let startY = viewport.height * 0.65;
      if (cardRect) {
        startX = cardRect.right - 70;
        startY = cardRect.top + 70;
      }
      const exitX = viewport.width * 0.62;
      const exitY = viewport.height * 0.42;

      signal.targetX = startX + (exitX - startX) * Math.pow(act1Progress, 1.2);
      signal.targetY = startY + (exitY - startY) * Math.sin(act1Progress * Math.PI * 0.5) - 30 * Math.sin(act1Progress * Math.PI);
      signal.radius = CONFIG.particle.baseRadius * (0.8 + 0.6 * act1Progress);
    } else if (t <= 0.40) {
      // Act 2: Handoff into the Pipe (Propagating horizontally across the screen into the mempool)
      const p = (t - 0.20) / 0.20;
      const pipeStartX = viewport.width * 0.62;
      const pipeStartY = viewport.height * 0.42;
      const pipeEndX = viewport.width * 0.70;
      const pipeEndY = viewport.height * 0.52;

      // Accelerated horizontal burst through the pipeline corridor
      signal.targetX = pipeStartX + (pipeEndX - pipeStartX) * (p * 1.1 - 0.1 * Math.sin(p * Math.PI * 2));
      signal.targetY = pipeStartY + (pipeEndY - pipeStartY) * p + 14 * Math.sin(p * Math.PI * 3);
      signal.radius = CONFIG.particle.baseRadius * (1.2 + 0.4 * Math.sin(p * Math.PI));
    } else if (t <= 0.60) {
      // Act 3: The Chain (Entering the block tower, condensing and locking into place)
      const p = (t - 0.40) / 0.20;
      const towerX = viewport.width * 0.68;
      const towerSnapY = viewport.height * 0.46;

      // Spiral lock-in curve as it materializes into the top block of the chain
      const snapEased = Math.pow(p, 1.8);
      const orbitAngle = (1 - p) * Math.PI * 2.5;
      const orbitRadius = (1 - snapEased) * 85;

      signal.targetX = towerX + Math.cos(orbitAngle) * orbitRadius;
      signal.targetY = towerSnapY + Math.sin(orbitAngle) * (orbitRadius * 0.45) - (1 - snapEased) * 50;
      // Expands into a block mass during crystallization
      signal.radius = CONFIG.particle.baseRadius * (1.1 + 0.8 * p);
    } else {
      // Acts 4 & 5 base trajectory
      signal.targetX = viewport.width * (0.65 - 0.25 * Math.sin(t * Math.PI));
      signal.targetY = viewport.height * (0.55 - 0.3 * Math.cos(t * Math.PI * 0.7));
      signal.radius = CONFIG.particle.baseRadius;
    }
  }

  // --- Particle Trail & Physics ---
  function updateSignal() {
    if (prefersReducedMotion) {
      signal.x = signal.targetX;
      signal.y = signal.targetY;
      return;
    }

    // Smooth lerp
    signal.x += (signal.targetX - signal.x) * 0.12;
    signal.y += (signal.targetY - signal.y) * 0.12;

    // Trail
    signal.trail.unshift({ x: signal.x, y: signal.y, color: { ...signal.color } });
    if (signal.trail.length > signal.maxTrail) {
      signal.trail.pop();
    }
  }

  // --- Render Stage Canvas ---
  function render(timestamp) {
    // Interpolate scroll progress
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;
    updateActProgression(scrollProgress);
    updateSignal();

    ctx.clearRect(0, 0, viewport.width, viewport.height);

    // Subtle background grid / field
    renderAmbientField();

    // Render Particle Trail
    if (!prefersReducedMotion && signal.trail.length > 1) {
      for (let i = 0; i < signal.trail.length - 1; i++) {
        const pt = signal.trail[i];
        const prev = signal.trail[i + 1];
        const ratio = 1 - (i / signal.trail.length);

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.strokeStyle = `rgba(${pt.color.r}, ${pt.color.g}, ${pt.color.b}, ${ratio * 0.35})`;
        ctx.lineWidth = CONFIG.particle.baseRadius * 2 * ratio;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Render Point of Light (Signal Particle)
    renderPointOfLight(timestamp);

    requestAnimationFrame(render);
  }

  function renderAmbientField() {
    // Faint atmospheric gradient centered near the particle
    const gradient = ctx.createRadialGradient(
      signal.x, signal.y, 10,
      signal.x, signal.y, Math.max(viewport.width, viewport.height) * 0.45
    );
    gradient.addColorStop(0, `rgba(${signal.color.r}, ${signal.color.g}, ${signal.color.b}, 0.06)`);
    gradient.addColorStop(1, 'rgba(6, 7, 9, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, viewport.width, viewport.height);
  }

  function renderPointOfLight(timestamp) {
    const pulse = 1 + 0.15 * Math.sin(timestamp * 0.004);
    const radius = signal.radius * pulse;

    // Outer glow
    const glowGrad = ctx.createRadialGradient(
      signal.x, signal.y, 0,
      signal.x, signal.y, CONFIG.particle.glowRadius * pulse
    );
    glowGrad.addColorStop(0, `rgba(${signal.color.r}, ${signal.color.g}, ${signal.color.b}, 0.8)`);
    glowGrad.addColorStop(0.35, `rgba(${signal.color.r}, ${signal.color.g}, ${signal.color.b}, 0.25)`);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(signal.x, signal.y, CONFIG.particle.glowRadius * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Hot Core (White-hot energy core)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(signal.x, signal.y, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Inner chromatic halo
    ctx.strokeStyle = `rgba(${signal.color.r}, ${signal.color.g}, ${signal.color.b}, 0.9)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(signal.x, signal.y, radius * 1.3, 0, Math.PI * 2);
    ctx.stroke();

    // Act 1 Special Visuals: Embryonic Birth Cradle & Orbital Filaments
    if (scrollProgress <= 0.22 && !prefersReducedMotion) {
      const act1p = Math.min(1, Math.max(0, scrollProgress / 0.20));
      const cradleFade = 1 - act1p * 0.7;

      // Concentric gravitational wavelets
      for (let r = 1; r <= 3; r++) {
        const ringRadius = (radius * 3 + r * 16 + (timestamp * 0.035 * r) % 36);
        const ringAlpha = (1 - (ringRadius / 90)) * 0.35 * cradleFade;
        if (ringAlpha > 0) {
          ctx.strokeStyle = `rgba(${signal.color.r}, ${signal.color.g}, ${signal.color.b}, ${ringAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(signal.x, signal.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Orbital sparks
      const sparkCount = 3;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (timestamp * 0.003 * (i + 1) * 0.8) + (i * (Math.PI * 2 / sparkCount));
        const dist = radius * 2.5 + 8 * Math.sin(timestamp * 0.005 + i);
        const sx = signal.x + Math.cos(angle) * dist;
        const sy = signal.y + Math.sin(angle) * dist;

        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * cradleFade})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Act 2 Special Visuals: Propagation Conduit Pipe & Streamer Filaments
    if (scrollProgress >= 0.16 && scrollProgress <= 0.44 && !prefersReducedMotion) {
      const act2p = Math.min(1, Math.max(0, (scrollProgress - 0.20) / 0.20));
      const pipeFade = Math.sin(act2p * Math.PI);

      // Draw mempool corridor guide lines
      const pipeStartX = viewport.width * 0.58;
      const pipeStartY = viewport.height * 0.40;
      const pipeEndX = viewport.width * 0.74;
      const pipeEndY = viewport.height * 0.54;

      ctx.save();
      ctx.strokeStyle = `rgba(245, 158, 11, ${0.15 * pipeFade})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 12]);
      
      // Top and bottom rail of the pipe
      ctx.beginPath();
      ctx.moveTo(pipeStartX, pipeStartY - 24);
      ctx.lineTo(pipeEndX, pipeEndY - 24);
      ctx.moveTo(pipeStartX, pipeStartY + 24);
      ctx.lineTo(pipeEndX, pipeEndY + 24);
      ctx.stroke();

      // Traveling stream particles within the conduit
      const streamerCount = 8;
      for (let s = 0; s < streamerCount; s++) {
        const streamT = ((timestamp * 0.0008 + s / streamerCount) % 1);
        const stX = pipeStartX + (pipeEndX - pipeStartX) * streamT;
        const stY = (pipeStartY + (pipeEndY - pipeStartY) * streamT) + 12 * Math.sin(streamT * Math.PI * 4);
        
        ctx.fillStyle = `rgba(245, 158, 11, ${(1 - streamT) * 0.4 * pipeFade})`;
        ctx.beginPath();
        ctx.arc(stX, stY, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Act 3 Special Visuals: Growing Tower of Blocks & Crystallizing Isometric Block
    if (scrollProgress >= 0.36 && scrollProgress <= 0.65) {
      const act3p = Math.min(1, Math.max(0, (scrollProgress - 0.40) / 0.20));
      const towerFade = Math.min(1, Math.max(0, (scrollProgress - 0.36) / 0.06)) * (scrollProgress > 0.62 ? Math.max(0, 1 - (scrollProgress - 0.62) / 0.03) : 1);

      // Base coordinates for the block tower
      const towerBaseX = viewport.width * 0.68;
      const towerBaseY = viewport.height * 0.52;
      const blockWidth = 52;
      const blockHeight = 28;
      const layerSpacing = 32;

      // Draw helper: Isometric 3D Block
      function drawIsoBlock(cx, cy, w, h, alpha, isHero, glow) {
        ctx.save();
        ctx.globalAlpha = alpha * towerFade;

        // Top face
        ctx.beginPath();
        ctx.moveTo(cx, cy - h * 0.5);
        ctx.lineTo(cx + w * 0.5, cy);
        ctx.lineTo(cx, cy + h * 0.5);
        ctx.lineTo(cx - w * 0.5, cy);
        ctx.closePath();
        ctx.fillStyle = isHero ? 'rgba(192, 132, 252, 0.45)' : 'rgba(50, 40, 70, 0.4)';
        ctx.fill();
        ctx.strokeStyle = isHero ? 'rgba(216, 180, 254, 0.9)' : 'rgba(168, 85, 247, 0.35)';
        ctx.lineWidth = isHero ? 1.5 : 1;
        ctx.stroke();

        // Left face
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.5, cy);
        ctx.lineTo(cx, cy + h * 0.5);
        ctx.lineTo(cx, cy + h * 0.5 + 16);
        ctx.lineTo(cx - w * 0.5, cy + 16);
        ctx.closePath();
        ctx.fillStyle = isHero ? 'rgba(147, 51, 234, 0.6)' : 'rgba(30, 25, 45, 0.5)';
        ctx.fill();
        ctx.stroke();

        // Right face
        ctx.beginPath();
        ctx.moveTo(cx, cy + h * 0.5);
        ctx.lineTo(cx + w * 0.5, cy);
        ctx.lineTo(cx + w * 0.5, cy + 16);
        ctx.lineTo(cx, cy + h * 0.5 + 16);
        ctx.closePath();
        ctx.fillStyle = isHero ? 'rgba(126, 34, 206, 0.7)' : 'rgba(20, 15, 30, 0.6)';
        ctx.fill();
        ctx.stroke();

        if (glow) {
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 20;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Draw the previous 3 historical blocks of the chain
      drawIsoBlock(towerBaseX, towerBaseY + layerSpacing * 2, blockWidth, blockHeight, 0.4, false, false);
      drawIsoBlock(towerBaseX, towerBaseY + layerSpacing * 1, blockWidth, blockHeight, 0.65, false, false);
      drawIsoBlock(towerBaseX, towerBaseY, blockWidth, blockHeight, 0.85, false, false);

      // The 4th Block: Crystallized from the Signal point of light
      if (act3p > 0.15) {
        const snapT = Math.min(1, (act3p - 0.15) / 0.85);
        const heroY = (towerBaseY - layerSpacing) - (1 - Math.pow(snapT, 2)) * 60;
        const heroAlpha = Math.min(1, snapT * 1.3);
        drawIsoBlock(towerBaseX, heroY, blockWidth, blockHeight, heroAlpha, true, snapT > 0.9);

        // Flash ripple upon block lock-in
        if (snapT > 0.85 && !prefersReducedMotion) {
          const rippleRatio = (snapT - 0.85) / 0.15;
          ctx.save();
          ctx.strokeStyle = `rgba(168, 85, 247, ${(1 - rippleRatio) * 0.8 * towerFade})`;
          ctx.lineWidth = 2 * (1 - rippleRatio);
          ctx.beginPath();
          ctx.ellipse(towerBaseX, heroY + 8, blockWidth * (0.6 + rippleRatio * 0.8), blockHeight * (0.6 + rippleRatio * 0.8), 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // --- Listeners ---
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
  });

  // --- Initialize ---
  resizeCanvas();
  onScroll();
  requestAnimationFrame(render);

  console.log('[SIGNAL] Scaffolding initialized successfully.');
})();
