import { useEffect, useRef, useState } from 'react';
import { Particle, ParticleType } from '../types';
import { Video, Camera } from 'lucide-react';

interface ParticleCanvasProps {
  celadonRatio: number; // 0 to 100
  yangmeiRatio: number;   // 0 to 100
  applianceRatio: number; // 0 to 100
  celadonSize: number;    // base size
  yangmeiSize: number;
  applianceSize: number;
  mode: 'idle' | 'diffusion' | 'gather' | 'circle' | 'solid_circle' | 'chaos' | 'icon_subway' | 'icon_celadon' | 'icon_yangmei' | 'icon_appliance' | 'icon_custom';
  speedFactor: number;
  celadonColors: string[];
  yangmeiColors: string[];
  applianceColors: string[];
  customPixels?: { r: number; c: number }[];
  onStatsUpdate?: (stats: {
    total: number;
    celadonCount: number;
    yangmeiCount: number;
    applianceCount: number;
    averageSize: number;
    blendedColor: string;
  }) => void;
}

export default function ParticleCanvas({
  celadonRatio,
  yangmeiRatio,
  applianceRatio,
  celadonSize,
  yangmeiSize,
  applianceSize,
  mode,
  speedFactor,
  celadonColors,
  yangmeiColors,
  applianceColors,
  customPixels = [],
  onStatsUpdate,
}: ParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  // Recording feature internal states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Resize using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 250),
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Sync Canvas width/height with state - high definition retina scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = typeof window !== 'undefined' ? Math.max(2, window.devicePixelRatio || 2) : 2;
      canvas.width = dimensions.width * dpr;
      canvas.height = dimensions.height * dpr;
    }
  }, [dimensions]);

  // Generate / adjust particle population based on user ratios, sizes, and colors
  const regenerateParticles = (targetCount = 450) => {
    const currentParticles = particlesRef.current;
    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = height / 2;

    // Normalize ratios represented as custom percentages
    const totalRatio = celadonRatio + yangmeiRatio + applianceRatio;
    const cLim = celadonRatio / (totalRatio || 1);
    const yLim = cLim + yangmeiRatio / (totalRatio || 1);

    const nextParticles: Particle[] = [];

    // Ensure we have some safe fallbacks for colors if empty arrays are passed
    const safeCeladon = celadonColors.length > 0 ? celadonColors : ['#4a7c73', '#74aba2'];
    const safeYangmei = yangmeiColors.length > 0 ? yangmeiColors : ['#862149', '#b23363'];
    const safeAppliance = applianceColors.length > 0 ? applianceColors : ['#4e4f52', '#3b729f'];

    for (let i = 0; i < targetCount; i++) {
      const rand = Math.random();
      let type: ParticleType = 'celadon';
      let shape: 'octagon' | 'circle' | 'hexagon' = 'octagon';
      let baseSize = celadonSize;
      let colors = safeCeladon;

      if (rand < cLim) {
        type = 'celadon';
        shape = 'octagon';
        baseSize = celadonSize;
        colors = safeCeladon;
      } else if (rand < yLim) {
        type = 'yangmei';
        shape = 'circle';
        baseSize = yangmeiSize;
        colors = safeYangmei;
      } else {
        type = 'appliance';
        shape = 'hexagon';
        baseSize = applianceSize;
        colors = safeAppliance;
      }

      // Pick a random color from the current dynamic array
      const color = colors[Math.floor(Math.random() * colors.length)] || '#cccccc';

      // Position: Spread out if the current population was empty, else reuse or morph
      const existing = currentParticles[i];
      let x = cx;
      let y = cy;
      let vx = (Math.random() - 0.5) * 2;
      let vy = (Math.random() - 0.5) * 2;
      let angle = Math.random() * Math.PI * 2;

      if (existing) {
        // Keep position but morph type / color / size
        x = existing.x;
        y = existing.y;
        vx = existing.vx;
        vy = existing.vy;
        angle = existing.angle;
      } else {
        // Spawn randomly scattered
        const rSpawn = Math.random() * Math.min(width, height) * 0.45;
        const angleSpawn = Math.random() * Math.PI * 2;
        x = cx + Math.cos(angleSpawn) * rSpawn;
        y = cy + Math.sin(angleSpawn) * rSpawn;
      }

      // Slightly vary particle individual sizes
      const size = Math.max(1.8, baseSize * (0.65 + Math.random() * 0.7));

      nextParticles.push({
        id: i,
        type,
        shape,
        x,
        y,
        targetX: x,
        targetY: y,
        vx,
        vy,
        size,
        color,
        alpha: 0.1, // fade in
        angle,
        spinSpeed: (Math.random() - 0.5) * 0.04,
      });
    }

    particlesRef.current = nextParticles;
  };

  // Trigger regeneration on ratio/size/color adjustments
  useEffect(() => {
    regenerateParticles(450);
  }, [celadonRatio, yangmeiRatio, applianceRatio, celadonSize, yangmeiSize, applianceSize, dimensions.width, dimensions.height, celadonColors, yangmeiColors, applianceColors]);

  // Adjust particle targets based on Active Modes
  useEffect(() => {
    const list = particlesRef.current;
    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = height / 2;
    const R = Math.min(width, height) * 0.28; // Outer circle radius

    if (mode === 'diffusion') {
      // Disperse outward from center or current hub with velocity bursts
      list.forEach((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Radial outward target
        const force = 3 + Math.random() * 8;
        p.vx = (dx / dist) * force;
        p.vy = (dy / dist) * force;
        // set random outer targets
        p.targetX = cx + (dx / dist) * (R * (1.2 + Math.random() * 1.5));
        p.targetY = cy + (dy / dist) * (R * (1.2 + Math.random() * 1.5));
      });
    } else if (mode === 'gather') {
      // Aggregate into center or concentric small clusters
      list.forEach((p, idx) => {
        // Multi-hub aggregation based on category for nice aesthetics
        let ox = 0;
        let oy = 0;
        if (p.type === 'celadon') {
          ox = -40; // Celadon clustered left
        } else if (p.type === 'yangmei') {
          oy = -40; // Yangmei clustered up
        } else {
          ox = 40; // Appliance clustered right
        }
        p.targetX = cx + ox + (Math.random() - 0.5) * 80;
        p.targetY = cy + oy + (Math.random() - 0.5) * 80;
      });
    } else if (mode === 'circle') {
      // Align neatly over a big outer hollow circle boundary
      list.forEach((p, idx) => {
        const theta = (idx / list.length) * Math.PI * 2;
        p.targetX = cx + Math.cos(theta) * R + (Math.random() - 0.5) * 12;
        p.targetY = cy + Math.sin(theta) * R + (Math.random() - 0.5) * 12;
      });
    } else if (mode === 'solid_circle') {
      // Align beautifully inside a solid circle (实心圆) using the Golden Spiral (Vogel's spiral) for an absolute gorgeous packed effect
      list.forEach((p, idx) => {
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden Angle of rotation
        const theta = idx * goldenAngle;
        const rFactor = Math.sqrt(idx / list.length); // Area-even density
        const targetRadius = R * rFactor * 1.05; // solid radius size

        p.targetX = cx + Math.cos(theta) * targetRadius;
        p.targetY = cy + Math.sin(theta) * targetRadius;
      });
    } else if (mode === 'chaos') {
      // Spread wildly across borders
      list.forEach((p) => {
        p.targetX = Math.random() * width;
        p.targetY = Math.random() * height;
        p.vx = (Math.random() - 0.5) * 4;
        p.vy = (Math.random() - 0.5) * 4;
      });
    } else {
      // Idle floating
      list.forEach((p) => {
        // drift slightly
        p.targetX = p.x + (Math.random() - 0.5) * 100;
        p.targetY = p.y + (Math.random() - 0.5) * 100;
      });
    }
  }, [mode, dimensions]);

  // Clean recording timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // MP4/WebM Live Video Capturer using standard MediaRecorder with generous cruising limit
  const startRecordingVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    recordedChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      // Capture at ~30 frames per second
      const stream = canvas.captureStream(30);
      
      // Determine the best compatible container format, defaulting to video/mp4 where available
      let options = { mimeType: 'video/mp4;codecs=h264' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/mp4;codecs=avc1' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/mp4' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=h264' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp9' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }

      console.log('Using MediaRecorder mimeType:', options.mimeType);

      const recorderOptions: MediaRecorderOptions = {
        mimeType: options.mimeType,
        videoBitsPerSecond: 15000000, // Boost bitrate to 15 Mbps for ultra-clear high-definition crispness
      };

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Build the blob stream explicitly preserving the designated mimeType
        const actualType = mediaRecorder.mimeType || 'video/mp4';
        const blob = new Blob(recordedChunksRef.current, { type: actualType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Always name with .mp4 suffix for standard video players compatibility
        a.download = `metro-particle-cruise-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      let secondsElapsed = 0;
      const MAX_CRUISE_RECORDING_SECONDS = 45; // 45 seconds gives ample time for the complete 28.5s auto cruise cycle

      recordingTimerRef.current = setInterval(() => {
        secondsElapsed += 1;
        setRecordingSeconds(secondsElapsed);
        if (secondsElapsed >= MAX_CRUISE_RECORDING_SECONDS) {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to capture canvas dynamic stream:', error);
      alert('您的浏览器可能限制了 canvas.captureStream API。已为您降级为静态截图下载模块，或可以使用 Chrome/Safari 等现代浏览器。');
    }
  };

  const stopRecordingVideo = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const downloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `particle-system-snapshot-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to construct capture download data:', err);
    }
  };

  // Render & Physics Tick Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Regular Polygons rendering functions
    const drawPolygon = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      sides: number,
      angle: number,
      color: string,
      alpha: number
    ) => {
      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = angle + (i * 2 * Math.PI) / sides;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) {
          c.moveTo(x, y);
        } else {
          c.lineTo(x, y);
        }
      }
      c.closePath();
      c.shadowBlur = 4;
      c.shadowColor = color;
      c.fill();
      c.restore();
    };

    const drawCircleShape = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      color: string,
      alpha: number
    ) => {
      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      c.arc(cx, cy, r, 0, 2 * Math.PI);
      c.shadowBlur = 4;
      c.shadowColor = color;
      c.fill();
      c.restore();
    };

    let lastTime = 0;
    let blendTimer = 0;

    // Calculate aggregated stats & blended color
    const calculateLiveStats = () => {
      const list = particlesRef.current;
      let sumR = 0, sumG = 0, sumB = 0;
      let validColorCount = 0;
      let celadonCount = 0;
      let yangmeiCount = 0;
      let applianceCount = 0;
      let sizeSum = 0;

      list.forEach((p) => {
        sizeSum += p.size;
        if (p.type === 'celadon') celadonCount++;
        else if (p.type === 'yangmei') yangmeiCount++;
        else if (p.type === 'appliance') applianceCount++;

        // Convert hex to rgb
        const hex = p.color;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
          sumR += parseInt(result[1], 16);
          sumG += parseInt(result[2], 16);
          sumB += parseInt(result[3], 16);
          validColorCount++;
        }
      });

      // Calculate the gorgeous weighted blend color of the whole active space
      let blendedColor = '#709a95'; // default
      if (validColorCount > 0) {
        const avgR = Math.round(sumR / validColorCount);
        const avgG = Math.round(sumG / validColorCount);
        const avgB = Math.round(sumB / validColorCount);
        blendedColor = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)}`;
      }

      onStatsUpdate?.({
        total: list.length,
        celadonCount,
        yangmeiCount,
        applianceCount,
        averageSize: Number((sizeSum / (list.length || 1)).toFixed(1)),
        blendedColor,
      });
    };

    const tick = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min(50, timestamp - lastTime); // cap dt
      lastTime = timestamp;

      const dpr = typeof window !== 'undefined' ? Math.max(2, window.devicePixelRatio || 2) : 2;

      // Wrap drawing inside a high-definition scaled context
      ctx.save();
      ctx.scale(dpr, dpr);

      // Dark futuristic decay overlay for neon particle trails
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      const list = particlesRef.current;
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;

      // Update and draw particles
      const baseRadius = Math.min(dimensions.width, dimensions.height) * 0.38;
      const N = list.length;

      list.forEach((p) => {
        // Handle fading in
        if (p.alpha < 0.95) {
          p.alpha += 0.03;
        }

        // Dynamic icon coordinate morphing targets on the fly!
        if (mode === 'icon_subway') {
          // Classic Metro/Subway symbol: Outer orbit double circles with a beautiful parallel 'H' tracks in center
          if (p.id < 220) {
            // Dynamic circle ring
            const theta = (p.id / 220) * Math.PI * 2;
            const r = baseRadius * 0.45 + 5.0 * Math.sin(p.id * 0.2 + timestamp * 0.002);
            p.targetX = cx + Math.cos(theta) * r;
            p.targetY = cy + Math.sin(theta) * r + 15;
          } else if (p.id < 320) {
            // Left track column
            const relY = ((p.id - 220) / 100 - 0.5) * baseRadius * 0.52;
            p.targetX = cx - baseRadius * 0.16;
            p.targetY = cy + relY + 15;
          } else if (p.id < 420) {
            // Right track column
            const relY = ((p.id - 320) / 100 - 0.5) * baseRadius * 0.52;
            p.targetX = cx + baseRadius * 0.16;
            p.targetY = cy + relY + 15;
          } else {
            // Inner track center horizontal connector
            const relX = ((p.id - 420) / (N - 420 || 1) - 0.5) * baseRadius * 0.32;
            p.targetX = cx + relX;
            p.targetY = cy + 15;
          }
        } else if (mode === 'icon_celadon') {
          // Famous Famen Temple Octagonal Celadon Vase ("八棱瓶") - Slender neck + faceted bulbous body
          if (p.id < 160) {
            // Narrow vertical fluted neck (8 facets columns)
            const col = p.id % 8;
            const layer = Math.floor(p.id / 8);
            const t = -0.76 + 0.48 * (layer / 20.0);
            const angle = col * (Math.PI / 4.0);
            // Slight wave to simulate porcelain luster
            const r = 18.0 + 3.2 * Math.cos(angle) + 1.2 * Math.sin(timestamp * 0.001 * speedFactor + layer * 0.35);
            p.targetX = cx + Math.cos(angle) * r;
            p.targetY = cy + t * baseRadius + 22;
          } else if (p.id < 390) {
            // Expanding faceted bulbous bottom (belly with 8 distinct ridges)
            const col = (p.id - 160) % 8;
            const layer = Math.floor((p.id - 160) / 8);
            const pct = layer / 29.0; // 0 to 1
            const t = -0.28 + 1.05 * pct;
            
            // Bulbous sinuous profile
            const rBase = baseRadius * 0.48 * Math.sin(pct * Math.PI * 0.86 + 0.15);
            const angle = col * (Math.PI / 4.0);
            // Height-dependent octagonal faceting
            p.targetX = cx + Math.cos(angle) * rBase;
            p.targetY = cy + t * baseRadius + 22;
          } else {
            // Stable flared base ring at the bottom
            const idx = p.id - 390;
            const theta = (idx / (N - 390 || 1)) * Math.PI * 2;
            const r = baseRadius * 0.22 + 4.0 * Math.cos(theta * 8.0);
            p.targetX = cx + Math.cos(theta) * r;
            p.targetY = cy + 0.78 * baseRadius + 22;
          }
        } else if (mode === 'icon_yangmei') {
          // A natural premium cluster of multiple Yangmei berries ("一串杨梅") with leafy stems
          if (p.id < 100) {
            // Elegant stem and leaf veins at the cluster top
            const idx = p.id;
            if (idx < 35) {
              // Main holding stem
              const pct = idx / 35;
              p.targetX = cx + pct * 12.0;
              p.targetY = cy - baseRadius * 0.7 + pct * baseRadius * 0.38 - 10;
            } else {
              // Broad healthy leaves
              const leafIdx = idx - 35;
              const side = leafIdx % 2 === 0 ? -1 : 1;
              const pct = Math.floor(leafIdx / 2) / 32;
              const leafAngle = -Math.PI / 3.2 + side * (0.35 + 0.85 * pct);
              const leafDist = baseRadius * 0.32 * Math.sin(pct * Math.PI);
              const totalRadius = baseRadius * 0.48 * pct;
              p.targetX = cx + Math.cos(leafAngle) * totalRadius + side * leafDist * 0.3 - 5;
              p.targetY = cy - baseRadius * 0.52 + Math.sin(leafAngle) * totalRadius - 10;
            }
          } else if (p.id < 220) {
            // Berry Globe A (Top Left Berry) with delicate granular nodules
            const bodyIdx = p.id - 100;
            const totalBody = 120;
            const bx = cx - baseRadius * 0.28;
            const by = cy + baseRadius * 0.18;
            const theta = bodyIdx * 2.39996 + timestamp * 0.0003 * speedFactor;
            const rFactor = Math.sqrt(bodyIdx / totalBody);
            const rBase = baseRadius * 0.28 * rFactor;
            // High-frequency sinuous perimeter bumps for authentic grape/bayberry skin
            const bump = rBase > 5 ? 0.08 * rBase * Math.sin(16 * theta) : 0;
            p.targetX = bx + Math.cos(theta) * (rBase + bump);
            p.targetY = by + Math.sin(theta) * (rBase + bump);
          } else if (p.id < 330) {
            // Berry Globe B (Bottom Right Berry) with granular surface
            const bodyIdx = p.id - 220;
            const totalBody = 110;
            const bx = cx + baseRadius * 0.28;
            const by = cy + baseRadius * 0.25;
            const theta = bodyIdx * 2.39996 + timestamp * 0.00025 * speedFactor;
            const rFactor = Math.sqrt(bodyIdx / totalBody);
            const rBase = baseRadius * 0.26 * rFactor;
            const bump = rBase > 5 ? 0.08 * rBase * Math.sin(16 * theta) : 0;
            p.targetX = bx + Math.cos(theta) * (rBase + bump);
            p.targetY = by + Math.sin(theta) * (rBase + bump);
          } else {
            // Berry Globe C (Upper Center Berry)
            const bodyIdx = p.id - 330;
            const totalBody = N - 330 || 1;
            const bx = cx + baseRadius * 0.02;
            const by = cy - baseRadius * 0.16;
            const theta = bodyIdx * 2.39996 + timestamp * 0.00035 * speedFactor;
            const rFactor = Math.sqrt(bodyIdx / totalBody);
            const rBase = baseRadius * 0.32 * rFactor;
            const bump = rBase > 5 ? 0.08 * rBase * Math.sin(16 * theta) : 0;
            p.targetX = bx + Math.cos(theta) * (rBase + bump);
            p.targetY = by + Math.sin(theta) * (rBase + bump);
          }
        } else if (mode === 'icon_appliance') {
          // Multi-appliance tech composition ("一些小家电"): Washing machine, screen, water kettle
          if (p.id < 150) {
            // Appliance 1: Washing Machine (circular inner door + outer cabinet rectangle)
            const washIdx = p.id;
            const wx = cx - baseRadius * 0.62;
            const wy = cy + baseRadius * 0.12;
            if (washIdx < 80) {
              // Outer square cabinet boundary
              const borderDist = (washIdx / 80) * 240; // perimeter
              let px = 0, py = 0;
              if (borderDist < 60) {
                px = -30 + borderDist;
                py = -40;
              } else if (borderDist < 120) {
                px = 30;
                py = -40 + (borderDist - 60);
              } else if (borderDist < 180) {
                px = 30 - (borderDist - 120);
                py = 40;
              } else {
                px = -30;
                py = 40 - (borderDist - 180);
              }
              p.targetX = wx + px;
              p.targetY = wy + py;
            } else {
              // Circular shiny washing drum door inside
              const drumIdx = washIdx - 80;
              const angle = drumIdx * 0.12 + timestamp * 0.003 * speedFactor;
              const r = 18.0;
              p.targetX = wx + Math.cos(angle) * r;
              p.targetY = wy + Math.sin(angle) * r + 8;
            }
          } else if (p.id < 290) {
            // Appliance 2: Widescreen TV / Smart Display
            const tvIdx = p.id - 150;
            const tx = cx + baseRadius * 0.02;
            const ty = cy - baseRadius * 0.12;
            if (tvIdx < 110) {
              // Neat 16:9 thick border monitor frame
              const borderDist = (tvIdx / 110) * 320;
              let px = 0, py = 0;
              if (borderDist < 100) {
                px = -50 + borderDist;
                py = -30;
              } else if (borderDist < 160) {
                px = 50;
                py = -30 + (borderDist - 100);
              } else if (borderDist < 260) {
                px = 50 - (borderDist - 160);
                py = 30;
              } else {
                px = -50;
                py = 30 - (borderDist - 260);
              }
              p.targetX = tx + px;
              p.targetY = ty + py;
            } else {
              // Widescreen table stand/support legs at the bottom
              const standIdx = tvIdx - 110;
              const px = -25 + (standIdx / 30) * 50;
              const py = 30 + Math.abs(px) * 0.28;
              p.targetX = tx + px;
              p.targetY = ty + py;
            }
          } else {
            // Appliance 3: Stylish aesthetic smart kettle with handle and spout
            const ketIdx = p.id - 290;
            const totalKet = N - 290 || 1;
            const kx = cx + baseRadius * 0.65;
            const ky = cy + baseRadius * 0.16;
            
            if (ketIdx < totalKet * 0.5) {
              // Curved kettle metal wall
              const pct = ketIdx / (totalKet * 0.5);
              const angle = -Math.PI/2.2 + pct * Math.PI * 1.05;
              const r = 24.0 + 3.0 * Math.sin(pct * Math.PI);
              p.targetX = kx + Math.cos(angle) * r;
              p.targetY = ky + pct * 65.0 - 32.5;
            } else if (ketIdx < totalKet * 0.78) {
              // Kettle grip handle
              const pct = (ketIdx - totalKet * 0.5) / (totalKet * 0.28);
              p.targetX = kx + 28.0 + Math.sin(pct * Math.PI) * 10.0;
              p.targetY = ky - 20.0 + pct * 42.0;
            } else {
              // Spout and bottom platform
              const pct = (ketIdx - totalKet * 0.78) / (totalKet * 0.22);
              if (pct < 0.5) {
                // Kettle spout on left
                p.targetX = kx - 24.5 - pct * 11.0;
                p.targetY = ky - 18.0 + pct * 12.0;
              } else {
                // Flat bottom plate
                p.targetX = kx - 30.0 + (pct - 0.5) * 2.0 * 60.0;
                p.targetY = ky + 34.0;
              }
            }
          }
        } else if (mode === 'icon_custom') {
          // Fully user-defined pixel grid constellation morphing!
          if (customPixels.length > 0) {
            const cell = customPixels[p.id % customPixels.length];
            // Normalize row and column from 0..13 to -1.0..+1.0 grid
            const pxPct = (cell.c - 6.5) / 7.0;
            const pyPct = (cell.r - 6.5) / 7.0;
            
            // Map out to canvas coordinates centered around (cx, cy)
            const mapX = cx + pxPct * baseRadius * 1.15;
            const mapY = cy + pyPct * baseRadius * 1.15 + 15;
            
            // Add light high-fidelity organic ripple wave so grid shines like living fiber strands
            const swayX = 3.8 * Math.sin(timestamp * 0.0035 + p.id * 0.16) * (p.size / 6.0);
            const swayY = 3.8 * Math.cos(timestamp * 0.003 + p.id * 0.12) * (p.size / 6.0);
            
            p.targetX = mapX + swayX;
            p.targetY = mapY + swayY;
          } else {
            // Default "M" monogram for Metro path if canvas is entirely empty
            const totalPart = N;
            const t = p.id / totalPart;
            let px = 0;
            let py = 0;
            if (t < 0.25) {
              px = -60 + t * 4 * 30;
              py = 40 - t * 4 * 80;
            } else if (t < 0.5) {
              px = -30 + (t - 0.25) * 4 * 30;
              py = -40 + (t - 0.25) * 4 * 60;
            } else if (t < 0.75) {
              px = 0 + (t - 0.5) * 4 * 30;
              py = 20 - (t - 0.5) * 4 * 60;
            } else {
              px = 30 + (t - 0.75) * 4 * 30;
              py = -40 + (t - 0.75) * 4 * 80;
            }
            p.targetX = cx + px * (baseRadius / 80.0);
            p.targetY = cy + py * (baseRadius / 80.0) + 12;
          }
        }

        // Apply physical movements based on modes
        const sp = speedFactor * 0.08;

        if (mode === 'diffusion') {
          // Friction slowing down after radial blast
          p.x += p.vx * (dt / 16);
          p.y += p.vy * (dt / 16);
          p.vx *= 0.94;
          p.vy *= 0.94;

          // Gentle attraction to target post-burst
          p.x += (p.targetX - p.x) * (0.015 * sp);
          p.y += (p.targetY - p.y) * (0.015 * sp);
        } else if (
          mode === 'gather' || 
          mode === 'circle' || 
          mode === 'solid_circle' ||
          mode === 'icon_subway' ||
          mode === 'icon_celadon' ||
          mode === 'icon_yangmei' ||
          mode === 'icon_appliance' ||
          mode === 'icon_custom'
        ) {
          // Swift tight interpolation to targeted positions
          p.x += (p.targetX - p.x) * (0.055 * sp);
          p.y += (p.targetY - p.y) * (0.055 * sp);
          p.vx = 0;
          p.vy = 0;
        } else if (mode === 'chaos') {
          // Keep floating fast with boundaries bouncing
          p.x += p.vx * (dt / 8) * speedFactor;
          p.y += p.vy * (dt / 8) * speedFactor;

          if (p.x < 0 || p.x > dimensions.width) p.vx *= -1;
          if (p.y < 0 || p.y > dimensions.height) p.vy *= -1;
        } else {
          // 'idle' floating - particles rotate slightly and drift
          p.angle += p.spinSpeed;

          // Keep them orbiting the center lightly for dynamic aesthetics
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const orbitForce = 0.4 * speedFactor;
          const tx = -dy / dist;
          const ty = dx / dist;

          // Add slight noise
          p.vx += (tx * orbitForce + (Math.random() - 0.5) * 0.2 - dx * 0.0001) * 0.05;
          p.vy += (ty * orbitForce + (Math.random() - 0.5) * 0.2 - dy * 0.0001) * 0.05;

          // Speed limit
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const limit = 1.8 * speedFactor;
          if (speed > limit) {
            p.vx = (p.vx / speed) * limit;
            p.vy = (p.vy / speed) * limit;
          }

          p.x += p.vx * (dt / 16);
          p.y += p.vy * (dt / 16);

          // Bound constraint
          if (p.x < 10) { p.x = 10; p.vx *= -1; }
          if (p.x > dimensions.width - 10) { p.x = dimensions.width - 10; p.vx *= -1; }
          if (p.y < 10) { p.y = 10; p.vy *= -1; }
          if (p.y > dimensions.height - 10) { p.y = dimensions.height - 10; p.vy *= -1; }
        }

        // Spin regular shapes
        p.angle += p.spinSpeed;

        // Dynamic sizing factor per-particle based on active mode and particle type
        let sizeScale = 1.0;
        if (mode === 'diffusion') {
          if (p.type === 'celadon') sizeScale = 1.7;
          else if (p.type === 'yangmei') sizeScale = 0.55;
          else if (p.type === 'appliance') sizeScale = 1.35;
        } else if (mode === 'gather') {
          if (p.type === 'celadon') sizeScale = 0.5;
          else if (p.type === 'yangmei') sizeScale = 1.8;
          else if (p.type === 'appliance') sizeScale = 0.8;
        } else if (mode === 'solid_circle') {
          const freq = p.type === 'celadon' ? 0.003 : p.type === 'yangmei' ? 0.004 : 0.002;
          sizeScale = 0.95 + 0.15 * Math.sin(timestamp * freq + p.id);
        } else if (mode === 'circle') {
          sizeScale = 1.05;
        } else if (mode === 'chaos') {
          const rate = p.type === 'celadon' ? 0.006 : p.type === 'yangmei' ? 0.008 : 0.005;
          sizeScale = 0.7 + 0.65 * Math.sin(timestamp * rate + p.id * 0.5);
        } else if (mode === 'icon_subway') {
          sizeScale = 0.82 + 0.15 * Math.sin(timestamp * 0.003 + p.id * 0.08);
        } else if (mode === 'icon_celadon') {
          if (p.id < 160) {
            sizeScale = 0.68; // slender delicate neck
          } else {
            sizeScale = 0.92 + 0.12 * Math.sin(timestamp * 0.0025 + p.id * 0.12); // faceted body
          }
        } else if (mode === 'icon_yangmei') {
          if (p.id < 100) {
            sizeScale = 0.58; // stem and leaf vein lining
          } else {
            sizeScale = 1.12 + 0.25 * Math.sin(timestamp * 0.005 + p.id * 0.25); // bumpy coarse berry skin
          }
        } else if (mode === 'icon_appliance') {
          if (p.id < 150) {
            // Washing Machine: door is bulkier, cabinet border is slender
            sizeScale = p.id >= 80 ? 0.92 : 0.65;
          } else if (p.id < 290) {
            // Smart Wide TV Screen
            sizeScale = p.id >= 260 ? 0.62 : 0.9;
          } else {
            // Kettle spire and spout
            sizeScale = 0.82;
          }
        } else if (mode === 'icon_custom') {
          sizeScale = 0.95 + 0.24 * Math.sin(timestamp * 0.004 + p.id * 0.18);
        } else {
          const rate = p.type === 'celadon' ? 0.002 : p.type === 'yangmei' ? 0.0025 : 0.0015;
          sizeScale = 0.95 + 0.15 * Math.sin(timestamp * rate + p.id * 0.2);
        }

        const renderSize = Math.max(1.8, p.size * sizeScale);

        // Draw individual shape with dynamic scaled size
        if (p.shape === 'octagon') {
          drawPolygon(ctx, p.x, p.y, renderSize, 8, p.angle, p.color, p.alpha);
        } else if (p.shape === 'hexagon') {
          drawPolygon(ctx, p.x, p.y, renderSize, 6, p.angle, p.color, p.alpha);
        } else {
          drawCircleShape(ctx, p.x, p.y, renderSize, p.color, p.alpha);
        }
      });

      // Draw active mode subtitle in canvas corner gracefully
      ctx.save();
      ctx.font = '11px ui-monospace, SFMono-Regular, "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      let modeText = '模式: 自由流体漂移 (IDLE)';
      if (mode === 'diffusion') modeText = '模式: 爆发性漫射粒子 (DIFFUSION)';
      else if (mode === 'gather') modeText = '模式: 轴心多集群聚集 (GATHER)';
      else if (mode === 'circle') modeText = '模式: 圆环排列几何叙事 (HOLLOW CIRCLE)';
      else if (mode === 'solid_circle') modeText = '模式: 实心黄金螺线晶圆 (SOLID DISC CIRCLE)';
      else if (mode === 'chaos') modeText = '模式: 高能无序碰撞 (CHAOS)';
      else if (mode === 'icon_subway') modeText = '意象图标: 轨道交通地铁标 (METRO LOGO)';
      else if (mode === 'icon_celadon') modeText = '意象图标: 秘色八棱青瓷瓶 (FAMEN OCTAGONAL VASE)';
      else if (mode === 'icon_yangmei') modeText = '意象图标: 瑞丰仙居杨梅串 (YANGMEI CLUSTER BUNCH)';
      else if (mode === 'icon_appliance') modeText = '意象图标: 智造小家电组合 (SMART HOME APPLIANCES)';
      else if (mode === 'icon_custom') modeText = '手绘图标: 自由画板手绘图腾 (CUSTOM DESIGN PIXELS)';
      ctx.fillText(modeText, 16, dimensions.height - 16);
      ctx.restore();

      // Restore outer context transform scale
      ctx.restore();

      // Trigger stats update once in a while to save performance
      blendTimer += dt;
      if (blendTimer > 300) {
        calculateLiveStats();
        blendTimer = 0;
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [dimensions, mode, speedFactor, onStatsUpdate, celadonColors, yangmeiColors, applianceColors, customPixels]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] md:h-[500px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center group"
      id="particle-canvas-container"
    >
      {/* Absolute canvas inside */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
        id="particle-active-canvas"
      />

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-teal-400 select-none pointer-events-none opacity-80 backdrop-blur-md bg-slate-900/60 px-2 py-1 rounded border border-slate-800/80">
        SYS.ENGINE_V1 // 粒子实时渲染
      </div>
      <div className="absolute top-4 right-4 font-mono text-[10px] text-pink-400 select-none pointer-events-none opacity-80 backdrop-blur-md bg-slate-900/60 px-2 py-1 rounded border border-slate-800/80">
        FP60_ACCEL : ACTIVE
      </div>

      {/* Live Recording Panel Overlay is nested beautifully here */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-850 shadow-2xl pointer-events-auto transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
          <span className="text-[11px] font-mono font-medium text-slate-300">
            {isRecording 
              ? `🔴 录制整个巡航中 (${recordingSeconds}s / 45s)...` 
              : '数字时空叙事与多站点自动巡航捕捉就绪'
            }
          </span>
        </div>
        <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-end">
          {isRecording ? (
            <button
              onClick={stopRecordingVideo}
              className="px-3 py-1.5 rounded-lg bg-red-650 hover:bg-red-600 text-white font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(239,68,68,0.25)] cursor-pointer"
              id="btn-rec-stop"
            >
              <span className="w-2 h-2 bg-white rounded-sm" />
              <span>停止并下载 MP4 视频</span>
            </button>
          ) : (
            <button
              onClick={startRecordingVideo}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.2)] hover:scale-[1.02]"
              title="开始录制轨道自动巡航动画（至多 45 秒，导出超清 High-Definition MP4 格式视频）"
              id="btn-rec-start"
            >
              <Video className="w-3.5 h-3.5 text-indigo-300" />
              <span>超清录制整个巡航 (HD MP4)</span>
            </button>
          )}

          <button
            onClick={downloadSnapshot}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
            title="捕获当前画布帧导出高清 PNG 贴图"
            id="btn-canvas-snapshot"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>瞬态截图 (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
