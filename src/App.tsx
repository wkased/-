import { useState, useEffect, useRef } from 'react';
import { Station, Particle } from './types';
import { STATION_PRESETS } from './data';
import ParticleCanvas from './components/ParticleCanvas';
import StationPanel from './components/StationPanel';
import ControlPanel from './components/ControlPanel';
import NarrativePanel from './components/NarrativePanel';
import ColorFactoryPanel from './components/ColorFactoryPanel';
import { Train, Sparkles, RefreshCw, BarChart2, Github, HelpCircle, Layers } from 'lucide-react';

export default function App() {
  const [celadonColors, setCeladonColors] = useState<string[]>(['#4a7c73', '#5c938c', '#74aba2', '#8ec2b9']);
  const [yangmeiColors, setYangmeiColors] = useState<string[]>(['#5c2045', '#862149', '#b23363', '#d64a7c']);
  const [applianceColors, setApplianceColors] = useState<string[]>(['#2a2b2e', '#4e4f52', '#7a7b80', '#3b729f']);
  const [stations, setStations] = useState<Station[]>(STATION_PRESETS);

  const [ratios, setRatios] = useState({
    celadon: 70,
    yangmei: 20,
    appliance: 10,
  });

  const [sizes, setSizes] = useState({
    celadon: 12,
    yangmei: 6,
    appliance: 6,
  });

  const [speedFactor, setSpeedFactor] = useState(1.0);
  const [activeMode, setActiveMode] = useState<'idle' | 'diffusion' | 'gather' | 'circle' | 'solid_circle' | 'chaos'>('idle');
  const [currentStationId, setCurrentStationId] = useState<string>('start');
  const [isAutoRiding, setIsAutoRiding] = useState(false);

  // Statistics updated live from the Canvas loop
  const [stats, setStats] = useState({
    total: 0,
    celadonCount: 0,
    yangmeiCount: 0,
    applianceCount: 0,
    averageSize: 0,
    blendedColor: '#709a95',
  });

  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef2 = useRef<NodeJS.Timeout | null>(null);
  const autoRideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Orchestrated motion sequence
  const animateStationTransition = (station: Station) => {
    setRatios(station.ratio);
    setSizes({
      celadon: station.sizeModifier.celadon,
      yangmei: station.sizeModifier.yangmei,
      appliance: station.sizeModifier.appliance,
    });
    setCurrentStationId(station.id);

    // Phase 1: Explode outward (diffusion) with the new ratios & sizes!
    setActiveMode('diffusion');

    // Clean up previous transition sequences
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (transitionTimeoutRef2.current) clearTimeout(transitionTimeoutRef2.current);

    // Phase 2: Settle into a gorgeous filled solid circle layout using golden ratio spiral after 1400ms
    transitionTimeoutRef.current = setTimeout(() => {
      setActiveMode('solid_circle');

      // Phase 3: Release into a continuous gentle swirling drift after 4000ms
      transitionTimeoutRef2.current = setTimeout(() => {
        setActiveMode('idle');
      }, 4000);
    }, 1400);
  };

  // Switch to station manually
  const handleSelectStation = (station: Station) => {
    setIsAutoRiding(false); // break auto autopilot
    animateStationTransition(station);
  };

  // Periodic automatic railway progress logic
  useEffect(() => {
    if (isAutoRiding) {
      let currentIndex = stations.findIndex((s) => s.id === currentStationId);

      const runNextLeg = () => {
        currentIndex = (currentIndex + 1) % stations.length;
        const nextStation = stations[currentIndex];
        animateStationTransition(nextStation);
      };

      // Auto cycle every 9 seconds to leave ample time for 1.4s blast + 4s circle + drift
      autoRideIntervalRef.current = setInterval(runNextLeg, 9500);
    } else {
      if (autoRideIntervalRef.current) {
        clearInterval(autoRideIntervalRef.current);
      }
    }

    return () => {
      if (autoRideIntervalRef.current) clearInterval(autoRideIntervalRef.current);
    };
  }, [isAutoRiding, currentStationId, stations]);

  // Clean timeouts on component unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (transitionTimeoutRef2.current) clearTimeout(transitionTimeoutRef2.current);
    };
  }, []);

  // Trigger default initial animation burst on mount
  useEffect(() => {
    if (stations.length > 0) {
      animateStationTransition(stations[0]);
    }
  }, []);

  // Trigger absolute random manual kinetic diffusion burst
  const handleManualScatterBurst = () => {
    // Modify slightly on every manual burst! Introduce custom dynamic size scaling randomizations
    const randRatios = {
      celadon: Math.floor(Math.random() * 80),
      yangmei: Math.floor(Math.random() * 80),
      appliance: 0,
    };
    randRatios.appliance = 100 - randRatios.celadon - randRatios.yangmei;
    if (randRatios.appliance < 0) {
      randRatios.appliance = 0;
      const sum = randRatios.celadon + randRatios.yangmei;
      randRatios.celadon = Math.round((randRatios.celadon / sum) * 100);
      randRatios.yangmei = 100 - randRatios.celadon;
    }

    setRatios(randRatios);
    setSizes({
      celadon: Math.floor(4 + Math.random() * 16),
      yangmei: Math.floor(4 + Math.random() * 16),
      appliance: Math.floor(4 + Math.random() * 16),
    });

    setActiveMode('diffusion');
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (transitionTimeoutRef2.current) clearTimeout(transitionTimeoutRef2.current);

    transitionTimeoutRef.current = setTimeout(() => {
      setActiveMode('solid_circle');
      transitionTimeoutRef2.current = setTimeout(() => {
        setActiveMode('idle');
      }, 3500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-150 flex flex-col antialiased">
      {/* Visual background space static grid decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-rose-500 to-indigo-500 flex items-center justify-center p-[2px] shadow-[0_0_15px_rgba(20,184,166,0.25)]">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <span className="text-xl">≋</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  METROPOLITAN TRANSIT // 轨道色彩规划
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight mt-0.5">
                地铁色彩叙事粒子系统 <span className="text-xs font-normal text-slate-500">Particle Color Narrative</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualScatterBurst}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-705 bg-slate-900/60 hover:bg-slate-900 text-xs font-mono font-bold text-slate-200 transition-all flex items-center gap-2 cursor-pointer"
              title="一键随机配比，自动执行：漫射爆破 ➔ 秩序内聚 ➔ 环形整列 ➔ 流体悬浮 完整生命周期"
              id="btn-randomize-scatter"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400 rotate-12" />
              <span>动态漫射爆破 (Scatter)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Workspace Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-8 flex flex-col gap-6">
        
        {/* Top Info Cards Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-dashboard-row">
          {/* Diagnostic Widget 1: Count of Octagons Celadon */}
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">CELADON OCTAGONS // 青瓷八边形</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-teal-400 font-mono">{stats.celadonCount}</span>
              <span className="text-xs text-slate-500">粒</span>
            </div>
            <p className="text-[10px] text-slate-500">
              设计占比: {ratios.celadon}% | 基础: {sizes.celadon}px
            </p>
          </div>

          {/* Diagnostic Widget 2: Count of Circles Yangmei */}
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">YANGMEI CIRCLES // 杨梅圆形</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-rose-400 font-mono">{stats.yangmeiCount}</span>
              <span className="text-xs text-slate-500">粒</span>
            </div>
            <p className="text-[10px] text-slate-500">
              设计占比: {ratios.yangmei}% | 基础: {sizes.yangmei}px
            </p>
          </div>

          {/* Diagnostic Widget 3: Count of Hexagons Appliance */}
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">APPLIANCE HEXAGONS // 家电六边形</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-indigo-400 font-mono">{stats.applianceCount}</span>
              <span className="text-xs text-slate-500">粒</span>
            </div>
            <p className="text-[10px] text-slate-500">
              设计占比: {ratios.appliance}% | 基础: {sizes.appliance}px
            </p>
          </div>

          {/* Diagnostic Widget 4: Blended Hue */}
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col gap-1 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">MIXED SENSOR COLOR // 空间混溶色</span>
              {/* Dynamic round micro swatch */}
              <div
                className="w-3.5 h-3.5 rounded-full border border-slate-300"
                style={{ backgroundColor: stats.blendedColor }}
              />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-200 font-mono tracking-wide">{stats.blendedColor.toUpperCase()}</span>
            </div>
            <p className="text-[10px] text-zinc-500">
              粒子均径: {stats.averageSize}px | 模拟: {stats.total} 粒子
            </p>
          </div>
        </section>

        {/* Central Visualizer Columns Grid Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Canvas Display Area: takes 7 grid cols */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-ping" />
                <span className="text-xs font-mono font-medium text-slate-300">GPU RENDER // 粒子画布监控</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                <span>速度系数: {speedFactor}x</span>
                <span>总量: {stats.total} Pts</span>
              </div>
            </div>

            {/* Canvas component */}
            <ParticleCanvas
              celadonRatio={ratios.celadon}
              yangmeiRatio={ratios.yangmei}
              applianceRatio={ratios.appliance}
              celadonSize={sizes.celadon}
              yangmeiSize={sizes.yangmei}
              applianceSize={sizes.appliance}
              mode={activeMode}
              speedFactor={speedFactor}
              celadonColors={celadonColors}
              yangmeiColors={yangmeiColors}
              applianceColors={applianceColors}
              onStatsUpdate={setStats}
            />

            {/* Quick interactive user tips list */}
            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <span className="text-indigo-400">❖</span>
                交互操作指引：如何感受“扩散、聚集、形成圆形”？
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-slate-400 pl-1">
                <li>
                  您可以点击上方的 <strong className="text-slate-200">“动态漫射爆破”</strong> 按钮，或者在下方改变站点。系统会自动驱动全场粒子爆发散开（<span className="text-amber-400">扩散</span>），随后按比率重新自动聚集对齐成耀眼的完美圆形阵列（<span className="text-rose-400">形成圆形</span>），而后轻柔漂移。
                </li>
                <li>
                  点击横轴铁路上的 <strong className="text-slate-200">起点站 (秘色遗址)</strong>、<strong className="text-slate-200">中段站 (繁华都会)</strong> 或 <strong className="text-slate-200">园区站 (智造新城)</strong>，即可在感受行车叙事的同时，使粒子的占比、形状主导权重和单体尺寸瞬间完成自适应的时空变迁。
                </li>
                <li>
                  在右侧的手动面板中，您可以手动随意拉拽三种粒子的配比滑块，系统使用了数学配平算法（其他成分自动补足100%），您可以获得无穷无尽的微观粒子云形态！
                </li>
              </ul>
            </div>
          </div>

          {/* Controls and Narrative Sidebar columns list: takes 5 grid cols */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Interactive sliders control panel */}
            <ControlPanel
              ratios={ratios}
              sizes={sizes}
              onChangeRatios={setRatios}
              onChangeSizes={setSizes}
              speedFactor={speedFactor}
              onChangeSpeed={setSpeedFactor}
              activeMode={activeMode}
              onSetMode={setActiveMode}
            />

            {/* Dynamic visual algorithm narrative helper */}
            <NarrativePanel ratios={ratios} blendedColor={stats.blendedColor} />
          </div>
        </section>

        {/* Stations Line Horizontal Timeline display */}
        <section>
          <StationPanel
            currentStationId={currentStationId}
            onSelectStation={handleSelectStation}
            isAutoRiding={isAutoRiding}
            onToggleAutoRide={() => setIsAutoRiding(!isAutoRiding)}
            stations={stations}
          />
        </section>

        {/* Dynamic Color Factory Customization Panel display */}
        <section>
          <ColorFactoryPanel
            celadonColors={celadonColors}
            setCeladonColors={setCeladonColors}
            yangmeiColors={yangmeiColors}
            setYangmeiColors={setYangmeiColors}
            applianceColors={applianceColors}
            setApplianceColors={setApplianceColors}
            stations={stations}
            setStations={setStations}
            onApplyPreset={animateStationTransition}
            currentStationId={currentStationId}
          />
        </section>
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 轨道色彩叙事粒子实验室. 基于比例拟合与几何变迁数学物理引擎开发.</p>
          <p className="font-mono text-[10px] text-indigo-400">
            DENSITY = PROPORTION_METRO_AXIS_V1.2
          </p>
        </div>
      </footer>
    </div>
  );
}
