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
      if (telemetryHash) {
        const hashes = [
          '0x7f9a...3c21', // Act 1
          '0x12b4...88ef', // Act 2
          '0x9e88...a440', // Act 3 (Block Root)
          '0x4d31...99bc', // Act 4
          '0x0000...beef'  // Act 5
        ];
        telemetryHash.textContent = hashes[activeAct - 1] || '0x7f9a...3c21';
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

    // --- ACT IV: CONFIRMATION & CONSENSUS RIPPLE MATH ---
    const act4Card = document.getElementById('quorum-card');
    const quorumCountEl = document.getElementById('quorum-count');
    const quorumStatusEl = document.getElementById('quorum-status');
    const quorumFillEl = document.getElementById('quorum-fill');
    if (progress > 0.58 && progress <= 0.82) {
      const act4p = Math.min(1, Math.max(0, (progress - 0.60) / 0.20));
      if (act4Card) {
        act4Card.style.borderColor = `rgba(6, 182, 212, ${0.25 + act4p * 0.55})`;
        act4Card.style.transform = `translateY(${-8 * Math.sin(act4p * Math.PI)}px)`;
      }

      // Quorum count scales dynamically from 0 to 64
      const attested = Math.round(act4p * 64);
      if (quorumCountEl) {
        quorumCountEl.textContent = `${attested.toString().padStart(2, '0')} / 64`;
      }
      if (quorumFillEl) {
        quorumFillEl.style.width = `${(act4p * 100).toFixed(1)}%`;
      }
      if (quorumStatusEl) {
        if (attested >= 64) {
          quorumStatusEl.textContent = 'CONSENSUS REACHED (100%)';
          quorumStatusEl.style.color = 'var(--accent-act4)';
        } else if (attested >= 43) {
          quorumStatusEl.textContent = 'SUPERMAJORITY VALIDATED';
          quorumStatusEl.style.color = 'var(--accent-act4)';
        } else {
          quorumStatusEl.textContent = 'GATHERING ATTESTATIONS';
          quorumStatusEl.style.color = 'var(--text-dim)';
        }
      }

      // Ripple checkmarks through the 16 validator nodes
      const activeCount = Math.floor(act4p * validatorNodes.length);
      validatorNodes.forEach((node, idx) => {
        if (idx < activeCount) {
          node.classList.add('active');
        } else {
          node.classList.remove('active');
        }
      });
    } else if (progress <= 0.58) {
      if (act4Card) {
        act4Card.style.borderColor = `rgba(6, 182, 212, 0.25)`;
        act4Card.style.transform = `none`;
      }
      if (quorumCountEl) quorumCountEl.textContent = '00 / 64';
      if (quorumFillEl) quorumFillEl.style.width = '0%';
      if (quorumStatusEl) {
        quorumStatusEl.textContent = 'GATHERING ATTESTATIONS';
        quorumStatusEl.style.color = 'var(--text-dim)';
      }
      validatorNodes.forEach(node => node.classList.remove('active'));
    } else if (progress > 0.82) {
      if (quorumCountEl) quorumCountEl.textContent = '64 / 64';
      if (quorumFillEl) quorumFillEl.style.width = '100%';
      validatorNodes.forEach(node => node.classList.add('active'));
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
      // Act 2: Handoff into the Pipe
      const p = (t - 0.20) / 0.20;
      const pipeStartX = viewport.width * 0.62;
      const pipeStartY = viewport.height * 0.42;
      const pipeEndX = viewport.width * 0.70;
      const pipeEndY = viewport.height * 0.52;

      signal.targetX = pipeStartX + (pipeEndX - pipeStartX) * (p * 1.1 - 0.1 * Math.sin(p * Math.PI * 2));
      signal.targetY = pipeStartY + (pipeEndY - pipeStartY) * p + 14 * Math.sin(p * Math.PI * 3);
      signal.radius = CONFIG.particle.baseRadius * (1.2 + 0.4 * Math.sin(p * Math.PI));
    } else if (t <= 0.60) {
      // Act 3: The Chain
      const p = (t - 0.40) / 0.20;
      const towerX = viewport.width * 0.68;
      const towerSnapY = viewport.height * 0.46;

      const snapEased = Math.pow(p, 1.8);
      const orbitAngle = (1 - p) * Math.PI * 2.5;
      const orbitRadius = (1 - snapEased) * 85;

      signal.targetX = towerX + Math.cos(orbitAngle) * orbitRadius;
      signal.targetY = towerSnapY + Math.sin(orbitAngle) * (orbitRadius * 0.45) - (1 - snapEased) * 50;
      signal.radius = CONFIG.particle.baseRadius * (1.1 + 0.8 * p);
    } else if (t <= 0.80) {
      // Act 4: Confirmation (Pulsing at the geometric center of consensus while broadcasting ripple waves)
      const p = (t - 0.60) / 0.20;
      const centerX = viewport.width * 0.65;
      const centerY = viewport.height * 0.48;

      // Anti-gravity harmonic hovering oscillation
      signal.targetX = centerX + 18 * Math.sin(p * Math.PI * 4);
      signal.targetY = centerY - 15 * Math.sin(p * Math.PI * 2);
      // Breathing pulse as consensus accumulates
      signal.radius = CONFIG.particle.baseRadius * (1.3 + 0.7 * Math.sin(p * Math.PI * 3));
    // --- ACT V: SETTLED & FINAL EQUILIBRIUM MATH ---
    const act5Card = document.getElementById('settled-card');
    const act5Section = document.getElementById('act-5');
    const act5Title = act5Section ? act5Section.querySelector('.act-title') : null;
    if (progress > 0.78) {
      const act5p = Math.min(1, Math.max(0, (progress - 0.80) / 0.20));
      if (act5Card) {
        // Card settles into resting state with emerald border
        act5Card.style.borderColor = `rgba(16, 185, 129, ${0.3 + act5p * 0.5})`;
        act5Card.style.transform = `scale(${1 + 0.02 * act5p})`;
        act5Card.style.boxShadow = `0 30px 60px rgba(0, 0, 0, 0.5), 0 0 ${40 + 30 * act5p}px rgba(16, 185, 129, ${0.12 + 0.18 * act5p})`;
      }
      if (act5Title) {
        // Kinetic headline landing: drops down from anti-gravity into settled baseline
        const dropOffset = (1 - Math.pow(act5p, 2)) * 36;
        act5Title.style.transform = `translateY(${dropOffset}px)`;
        act5Title.style.opacity = `${0.4 + 0.6 * act5p}`;
      }
    } else {
      if (act5Card) {
        act5Card.style.borderColor = `rgba(16, 185, 129, 0.3)`;
        act5Card.style.transform = `none`;
        act5Card.style.boxShadow = `0 30px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.12)`;
      }
      if (act5Title) {
        act5Title.style.transform = `translateY(36px)`;
        act5Title.style.opacity = '0.4';
      }
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
      // Act 2: Handoff into the Pipe
      const p = (t - 0.20) / 0.20;
      const pipeStartX = viewport.width * 0.62;
      const pipeStartY = viewport.height * 0.42;
      const pipeEndX = viewport.width * 0.70;
      const pipeEndY = viewport.height * 0.52;

      signal.targetX = pipeStartX + (pipeEndX - pipeStartX) * (p * 1.1 - 0.1 * Math.sin(p * Math.PI * 2));
      signal.targetY = pipeStartY + (pipeEndY - pipeStartY) * p + 14 * Math.sin(p * Math.PI * 3);
      signal.radius = CONFIG.particle.baseRadius * (1.2 + 0.4 * Math.sin(p * Math.PI));
    } else if (t <= 0.60) {
      // Act 3: The Chain
      const p = (t - 0.40) / 0.20;
      const towerX = viewport.width * 0.68;
      const towerSnapY = viewport.height * 0.46;

      const snapEased = Math.pow(p, 1.8);
      const orbitAngle = (1 - p) * Math.PI * 2.5;
      const orbitRadius = (1 - snapEased) * 85;

      signal.targetX = towerX + Math.cos(orbitAngle) * orbitRadius;
      signal.targetY = towerSnapY + Math.sin(orbitAngle) * (orbitRadius * 0.45) - (1 - snapEased) * 50;
      signal.radius = CONFIG.particle.baseRadius * (1.1 + 0.8 * p);
    } else if (t <= 0.80) {
      // Act 4: Confirmation
      const p = (t - 0.60) / 0.20;
      const centerX = viewport.width * 0.65;
      const centerY = viewport.height * 0.48;

      signal.targetX = centerX + 18 * Math.sin(p * Math.PI * 4);
      signal.targetY = centerY - 15 * Math.sin(p * Math.PI * 2);
      signal.radius = CONFIG.particle.baseRadius * (1.3 + 0.7 * Math.sin(p * Math.PI * 3));
    } else {
      // Act 5: Settled (The point glides to rest at equilibrium inside the final settlement seal)
      const p = Math.min(1, Math.max(0, (t - 0.80) / 0.20));
      const targetRestX = viewport.width * 0.68;
      const targetRestY = viewport.height * 0.48;

      // Gentle floating descent to resting equilibrium
      signal.targetX = targetRestX + 8 * (1 - p) * Math.cos(p * Math.PI * 2);
      signal.targetY = targetRestY + 6 * (1 - p) * Math.sin(p * Math.PI * 2);
      // Soft single breath pulse at the end of the journey
      const breathe = Math.sin(p * Math.PI);
      signal.radius = CONFIG.particle.baseRadius * (1.2 + 0.6 * breathe);
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

    // Act 4 Special Visuals: Checkmarks Ripple & Waves of Consensus Finality
    if (scrollProgress >= 0.56 && scrollProgress <= 0.84) {
      const act4p = Math.min(1, Math.max(0, (scrollProgress - 0.60) / 0.20));
      const rippleFade = Math.min(1, Math.max(0, (scrollProgress - 0.56) / 0.04)) * (scrollProgress > 0.80 ? Math.max(0, 1 - (scrollProgress - 0.80) / 0.04) : 1);

      ctx.save();
      const originX = signal.x;
      const originY = signal.y;

      // 1. Concentric Expanding Consensus Shockwaves
      const waveCount = 5;
      for (let w = 0; w < waveCount; w++) {
        const waveT = (timestamp * 0.0009 + w / waveCount) % 1;
        const waveRadius = 30 + waveT * 220;
        const waveAlpha = Math.sin(waveT * Math.PI) * 0.45 * rippleFade;

        ctx.strokeStyle = `rgba(6, 182, 212, ${waveAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(originX, originY, waveRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 8 Hexagonal Attestation Nodes stationed on the primary wavefront
        if (w === 0 && !prefersReducedMotion) {
          for (let h = 0; h < 8; h++) {
            const hAngle = (h * Math.PI / 4) + timestamp * 0.0006;
            const hx = originX + Math.cos(hAngle) * waveRadius;
            const hy = originY + Math.sin(hAngle) * waveRadius;

            ctx.fillStyle = `rgba(6, 182, 212, ${waveAlpha * 1.5})`;
            ctx.beginPath();
            ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Connect nodal radar filaments to center
            ctx.strokeStyle = `rgba(6, 182, 212, ${waveAlpha * 0.2})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(hx, hy);
            ctx.stroke();
          }
        }
      }

      // 2. Holographic Checkmark radiating at the core of consensus
      const checkScale = 14 + 4 * Math.sin(timestamp * 0.005);
      const checkAlpha = (0.5 + 0.5 * act4p) * rippleFade;
      ctx.strokeStyle = `rgba(255, 255, 255, ${checkAlpha * 0.95})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      // Polyline checkmark centered at signal.x, signal.y
      ctx.moveTo(originX - checkScale * 0.6, originY - checkScale * 0.1);
      ctx.lineTo(originX - checkScale * 0.1, originY + checkScale * 0.45);
      ctx.restore();
    }

    // Act 5 Special Visuals: The Piece Breathes Once & Enters Final Resting Equilibrium
    if (scrollProgress >= 0.78) {
      const act5p = Math.min(1, Math.max(0, (scrollProgress - 0.80) / 0.20));
      const settleFade = Math.min(1, Math.max(0, (scrollProgress - 0.78) / 0.05));

      ctx.save();
      const originX = signal.x;
      const originY = signal.y;

      // 1. The Singular Breath Pulse Wave (Expands as the user reaches 100% and settles)
      const breatheWaveT = Math.sin(act5p * Math.PI * 0.5);
      const breatheRadius = 40 + breatheWaveT * 180;
      const breatheAlpha = (1 - breatheWaveT * 0.8) * 0.4 * settleFade;

      ctx.strokeStyle = `rgba(16, 185, 129, ${breatheAlpha})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(originX, originY, breatheRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Harmonic Equilibrium Orbit Rings (Resting seal around the settled point)
      const ringCount = 2;
      for (let k = 0; k < ringCount; k++) {
        const ringRad = 24 + k * 16 + 4 * Math.sin(timestamp * 0.003 + k * Math.PI);
        const ringA = (0.25 - k * 0.08) * settleFade;

        ctx.strokeStyle = `rgba(16, 185, 129, ${ringA})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(originX, originY, ringRad, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Resting Energy Petals (Subtle green equilibrium particles)
      if (!prefersReducedMotion) {
        const petalCount = 6;
        for (let p = 0; p < petalCount; p++) {
          const petalAngle = (p * Math.PI * 2 / petalCount) + timestamp * 0.001;
          const petalDist = 32 + 5 * Math.sin(timestamp * 0.004 + p);
          const px = originX + Math.cos(petalAngle) * petalDist;
          const py = originY + Math.sin(petalAngle) * petalDist;

          ctx.fillStyle = `rgba(16, 185, 129, ${0.7 * settleFade})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // --- Listeners ---
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
  });

  // --- Initialize Validator Nodes (Act 4) ---
  const validatorContainer = document.getElementById('validator-nodes');
  const validatorNodes = [];
  if (validatorContainer) {
    for (let i = 0; i < 16; i++) {
      const node = document.createElement('div');
      node.className = 'val-node';
      node.textContent = '✓';
      validatorContainer.appendChild(node);
      validatorNodes.push(node);
    }
  }

  // --- Initialize ---
  resizeCanvas();
  onScroll();
  requestAnimationFrame(render);

  // Dismiss loader upon font/window ready
  const loaderEl = document.getElementById('loader');
  if (loaderEl) {
    const dismissLoader = () => {
      setTimeout(() => {
        loaderEl.classList.add('loaded');
      }, 400);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(dismissLoader).catch(dismissLoader);
    } else {
      window.addEventListener('load', dismissLoader);
    }
  }

  console.log('[SIGNAL] All 5 Acts and loader initialized successfully.');
})();
