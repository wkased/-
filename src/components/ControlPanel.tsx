import React, { useState } from 'react';
import { Sliders, LayoutGrid, Award, Volume2, Move, HelpCircle, AlertCircle, Sparkles, Tv, Palette, Train } from 'lucide-react';

interface ControlPanelProps {
  ratios: {
    celadon: number;
    yangmei: number;
    appliance: number;
  };
  sizes: {
    celadon: number;
    yangmei: number;
    appliance: number;
  };
  onChangeRatios: (ratios: { celadon: number; yangmei: number; appliance: number }) => void;
  onChangeSizes: (sizes: { celadon: number; yangmei: number; appliance: number }) => void;
  speedFactor: number;
  onChangeSpeed: (speed: number) => void;
  activeMode: 'idle' | 'diffusion' | 'gather' | 'circle' | 'solid_circle' | 'chaos' | 'icon_subway' | 'icon_celadon' | 'icon_yangmei' | 'icon_appliance' | 'icon_custom';
  onSetMode: (mode: 'idle' | 'diffusion' | 'gather' | 'circle' | 'solid_circle' | 'chaos' | 'icon_subway' | 'icon_celadon' | 'icon_yangmei' | 'icon_appliance' | 'icon_custom') => void;
  customPixels: { r: number; c: number }[];
  onChangeCustomPixels: (pixels: { r: number; c: number }[]) => void;
}

export default function ControlPanel({
  ratios,
  sizes,
  onChangeRatios,
  onChangeSizes,
  speedFactor,
  onChangeSpeed,
  activeMode,
  onSetMode,
  customPixels,
  onChangeCustomPixels,
}: ControlPanelProps) {
  const handleRatioChange = (type: 'celadon' | 'yangmei' | 'appliance', val: number) => {
    const rawVal = Math.min(100, Math.max(0, val));
    const delta = rawVal - ratios[type];
    
    const others = (['celadon', 'yangmei', 'appliance'] as const).filter((t) => t !== type);
    const otherSum = ratios[others[0]] + ratios[others[1]];
    
    let nextRatios = { ...ratios };
    nextRatios[type] = rawVal;
    
    if (otherSum === 0) {
      nextRatios[others[0]] = Math.round((100 - rawVal) / 2);
      nextRatios[others[1]] = 100 - rawVal - nextRatios[others[0]];
    } else {
      const firstTarget = Math.max(0, Math.min(100, Math.round(ratios[others[0]] - (delta * ratios[others[0]]) / otherSum)));
      nextRatios[others[0]] = firstTarget;
      nextRatios[others[1]] = Math.max(0, 100 - rawVal - firstTarget);
    }
    
    onChangeRatios(nextRatios);
  };

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawValue, setDrawValue] = useState(true); // true = draw, false = erase

  const handleMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const exists = customPixels.some((p) => p.r === r && p.c === c);
    const nextVal = !exists;
    setDrawValue(nextVal);
    
    let updated = [...customPixels];
    if (nextVal) {
      updated.push({ r, c });
    } else {
      updated = updated.filter((p) => !(p.r === r && p.c === c));
    }
    onChangeCustomPixels(updated);
    onSetMode('icon_custom');
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (!isDrawing) return;
    const exists = customPixels.some((p) => p.r === r && p.c === c);
    let updated = [...customPixels];
    if (drawValue && !exists) {
      updated.push({ r, c });
      onChangeCustomPixels(updated);
      onSetMode('icon_custom');
    } else if (!drawValue && exists) {
      updated = updated.filter((p) => !(p.r === r && p.c === c));
      onChangeCustomPixels(updated);
      onSetMode('icon_custom');
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClearGrid = () => {
    onChangeCustomPixels([]);
    onSetMode('icon_custom');
  };

  const handleApplyPreset = (presetType: 'metro' | 'heart' | 'smile' | 'star') => {
    let preset: { r: number; c: number }[] = [];
    if (presetType === 'metro') {
      preset = [
        { r: 1, c: 6 }, { r: 1, c: 7 },
        { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 8 }, { r: 2, c: 9 },
        { r: 3, c: 3 }, { r: 3, c: 10 },
        { r: 4, c: 2 }, { r: 4, c: 11 },
        { r: 5, c: 2 }, { r: 5, c: 11 },
        { r: 6, c: 1 }, { r: 6, c: 12 },
        { r: 7, c: 1 }, { r: 7, c: 12 },
        { r: 8, c: 2 }, { r: 8, c: 11 },
        { r: 9, c: 2 }, { r: 9, c: 11 },
        { r: 10, c: 3 }, { r: 10, c: 10 },
        { r: 11, c: 4 }, { r: 11, c: 5 }, { r: 11, c: 8 }, { r: 11, c: 9 },
        { r: 12, c: 6 }, { r: 12, c: 7 },
        { r: 4, c: 4 }, { r: 5, c: 4 }, { r: 6, c: 4 }, { r: 7, c: 4 }, { r: 8, c: 4 }, { r: 9, c: 4 },
        { r: 4, c: 9 }, { r: 5, c: 9 }, { r: 6, c: 9 }, { r: 7, c: 9 }, { r: 8, c: 9 }, { r: 9, c: 9 },
        { r: 6, c: 5 }, { r: 6, c: 6 }, { r: 6, c: 7 }, { r: 6, c: 8 }
      ];
    } else if (presetType === 'heart') {
      preset = [
        { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 9 }, { r: 2, c: 10 },
        { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 8 }, { r: 3, c: 9 }, { r: 3, c: 10 }, { r: 3, c: 11 },
        { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 4, c: 6 }, { r: 4, c: 7 }, { r: 4, c: 8 }, { r: 4, c: 9 }, { r: 4, c: 10 }, { r: 4, c: 11 }, { r: 4, c: 12 },
        { r: 5, c: 1 }, { r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 5, c: 5 }, { r: 5, c: 6 }, { r: 5, c: 7 }, { r: 5, c: 8 }, { r: 5, c: 9 }, { r: 5, c: 10 }, { r: 5, c: 11 }, { r: 5, c: 12 },
        { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 }, { r: 6, c: 6 }, { r: 6, c: 7 }, { r: 6, c: 8 }, { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 },
        { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }, { r: 7, c: 7 }, { r: 7, c: 8 }, { r: 7, c: 9 },
        { r: 8, c: 4 }, { r: 8, c: 5 }, { r: 8, c: 6 }, { r: 8, c: 7 }, { r: 8, c: 8 },
        { r: 9, c: 5 }, { r: 9, c: 6 }, { r: 9, c: 7 }, { r: 9, c: 8 },
        { r: 10, c: 6 }, { r: 10, c: 7 }
      ];
    } else if (presetType === 'smile') {
      preset = [
        { r: 4, c: 4 }, { r: 4, c: 9 },
        { r: 5, c: 4 }, { r: 5, c: 9 },
        { r: 8, c: 3 }, { r: 8, c: 10 },
        { r: 9, c: 4 }, { r: 9, c: 9 },
        { r: 10, c: 5 }, { r: 10, c: 6 }, { r: 10, c: 7 }, { r: 10, c: 8 }
      ];
    } else if (presetType === 'star') {
      preset = [
        { r: 1, c: 6 }, { r: 1, c: 7 },
        { r: 2, c: 6 }, { r: 2, c: 7 },
        { r: 3, c: 6 }, { r: 3, c: 7 },
        { r: 4, c: 5 }, { r: 4, c: 6 }, { r: 4, c: 7 }, { r: 4, c: 8 },
        { r: 5, c: 0 }, { r: 5, c: 1 }, { r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 5, c: 5 }, { r: 5, c: 6 }, { r: 5, c: 7 }, { r: 5, c: 8 }, { r: 5, c: 9 }, { r: 5, c: 10 }, { r: 5, c: 11 }, { r: 5, c: 12 }, { r: 5, c: 13 },
        { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 }, { r: 6, c: 6 }, { r: 6, c: 7 }, { r: 6, c: 8 }, { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 },
        { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }, { r: 7, c: 7 }, { r: 7, c: 8 }, { r: 7, c: 9 }, { r: 7, c: 10 },
        { r: 8, c: 4 }, { r: 8, c: 5 }, { r: 8, c: 9 }, { r: 8, c: 8 },
        { r: 9, c: 3 }, { r: 9, c: 4 }, { r: 9, c: 9 }, { r: 9, c: 10 },
        { r: 10, c: 2 }, { r: 10, c: 3 }, { r: 10, c: 10 }, { r: 10, c: 11 },
        { r: 11, c: 1 }, { r: 11, c: 12 }
      ];
    }
    onChangeCustomPixels(preset);
    onSetMode('icon_custom');
  };

  const handleSizeChange = (type: 'celadon' | 'yangmei' | 'appliance', val: number) => {
    onChangeSizes({
      ...sizes,
      [type]: Math.max(2, Math.min(25, val))
    });
  };

  return (
    <div
      className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-lg flex flex-col gap-6"
      id="simulation-control-dashboard"
    >
      {/* Simulation Controls (Modes) Area */}
      <div>
        <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
          KINETIC ACTIONS ENGINE // 粒子动力学控制
        </span>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
          <Move className="w-5 h-5 text-indigo-400" />
          控制与物理模式调度
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          点击触发不同运动状态。每种粒子在<strong className="text-slate-200">“扩散、聚集、实心圆、环形”</strong>过程中，各会触发独有的非线性物理尺寸放缩。
        </p>

        {/* Action Preset Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => onSetMode('diffusion')}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'diffusion'
                ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
            id="action-btn-diffusion"
          >
            <span className="text-sm font-bold">✴</span>
            <span>爆发扩散 (Disperse)</span>
          </button>

          <button
            onClick={() => onSetMode('gather')}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'gather'
                ? 'bg-sky-500/10 border-sky-500 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.2)] scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
            id="action-btn-gather"
          >
            <span className="text-sm font-bold">▼</span>
            <span>聚集挤压 (Gather)</span>
          </button>

          <button
            onClick={() => onSetMode('solid_circle')}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'solid_circle'
                ? 'bg-pink-500/10 border-pink-500 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.25)] scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
            id="action-btn-solid-circle"
          >
            <span className="text-sm font-bold">⬤</span>
            <span>形成实心圆 (Disc)</span>
          </button>

          <button
            onClick={() => onSetMode('circle')}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'circle'
                ? 'bg-rose-500/10 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)] scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
            id="action-btn-circle"
          >
            <span className="text-sm font-bold">◯</span>
            <span>空心圆环 (Ring)</span>
          </button>

          <button
            onClick={() => onSetMode('idle')}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'idle'
                ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.2)] scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
            id="action-btn-idle"
          >
            <span className="text-sm font-bold">≋</span>
            <span>流体漂移 (Swirl)</span>
          </button>

          <button
            onClick={() => onSetMode('chaos')}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'chaos'
                ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
            id="action-btn-chaos"
          >
            <span className="text-sm font-bold">⚡</span>
            <span>无序碰撞 (Chaos)</span>
          </button>
        </div>

        {/* Dynamic Icon Semantic Morph Controls */}
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <span className="text-[10px] font-mono tracking-widest text-[#94a3b8]/40 block uppercase">
            SEMANTIC ICON TOTEMS // 特色地标意象
          </span>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mt-1">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            沿线地标意象图腾变迁
          </h3>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
            打破常秩序，粒子随流体算法在轴向引力下自组装形成杭州地铁常用标、八棱秘色瓷瓶、累累杨梅串、工业智造新家电：
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
            {/* Subway Emblem Button */}
            <button
              onClick={() => onSetMode('icon_subway')}
              className={`px-2 py-2.5 rounded-xl border text-[11px] font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'icon_subway'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-[1.02]'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
              id="action-btn-icon-subway"
              title="粒子汇聚成地铁交通标志"
            >
              <Train className="w-4 h-4 text-blue-400" />
              <span>地铁常用标</span>
            </button>

            {/* Celadon Vase Button */}
            <button
              onClick={() => onSetMode('icon_celadon')}
              className={`px-2 py-2.5 rounded-xl border text-[11px] font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'icon_celadon'
                  ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.3)] scale-[1.02]'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
              id="action-btn-icon-celadon"
              title="粒子汇聚成秘色八棱青瓷经典花瓶"
            >
              <Palette className="w-4 h-4 text-teal-400" />
              <span>八棱青瓷瓶</span>
            </button>

            {/* Yangmei Berry Button */}
            <button
              onClick={() => onSetMode('icon_yangmei')}
              className={`px-2 py-2.5 rounded-xl border text-[11px] font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'icon_yangmei'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-[1.02]'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
              id="action-btn-icon-yangmei"
              title="粒子汇聚成丰收一串杨梅"
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>一串杨梅</span>
            </button>

            {/* Appliance TV Button */}
            <button
              onClick={() => onSetMode('icon_appliance')}
              className={`px-2 py-2.5 rounded-xl border text-[11px] font-semibold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'icon_appliance'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.02]'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
              id="action-btn-icon-appliance"
              title="粒子汇聚成智造小家电群集"
            >
              <Tv className="w-4 h-4 text-indigo-400" />
              <span>一些小家电</span>
            </button>
          </div>
        </div>

        {/* Interactive Custom Pixel Sketch Board */}
        <div className="mt-5 border-t border-slate-800/80 pt-4" id="custom-pixel-sketch-container">
          <span className="text-[10px] font-mono tracking-widest text-indigo-400 block uppercase">
            PIXEL TEMPLATE DESIGNER // 粒子手绘交互
          </span>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mt-1">
            <Move className="w-4 h-4 text-emerald-400 animate-bounce" />
            自由粒子手绘图腾画板
          </h3>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
            点击或按住鼠标在下方 14×14 分子网格内拖拽，粒子即刻通过动力学算法逆流汇集、智能组装出你的手绘宇宙！
          </p>

          {/* Presets block */}
          <div className="flex flex-wrap gap-1.5 mt-2.5 mb-3">
            <button
              onClick={() => handleApplyPreset('metro')}
              className="px-2 py-1 text-[10.5px] font-semibold rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 active:scale-95 transition-all cursor-pointer"
            >
              地铁常用标
            </button>
            <button
              onClick={() => handleApplyPreset('heart')}
              className="px-2 py-1 text-[10.5px] font-semibold rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 active:scale-95 transition-all cursor-pointer"
            >
              爱心图腾
            </button>
            <button
              onClick={() => handleApplyPreset('smile')}
              className="px-2 py-1 text-[10.5px] font-semibold rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 active:scale-95 transition-all cursor-pointer"
            >
              笑脸迎客
            </button>
            <button
              onClick={() => handleApplyPreset('star')}
              className="px-2 py-1 text-[10.5px] font-semibold rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 active:scale-95 transition-all cursor-pointer"
            >
              璀璨繁星
            </button>
            <button
              onClick={handleClearGrid}
              className="px-2 py-1 text-[10.5px] font-semibold rounded-lg bg-rose-950/45 border border-rose-800/50 text-rose-300 hover:bg-rose-900/40 hover:text-rose-100 active:scale-95 transition-all cursor-pointer ml-auto"
            >
              清空画板
            </button>
          </div>

          {/* Grid visual */}
          <div className="flex justify-center p-3.5 rounded-xl bg-slate-950 border border-slate-900 shadow-inner">
            <div 
              className="grid grid-cols-14 gap-[3px] select-none"
              onMouseLeave={handleMouseUp}
              id="pixel-designer-grid-parent"
            >
              {Array.from({ length: 14 }).map((_, r) =>
                Array.from({ length: 14 }).map((_, c) => {
                  const isActive = customPixels.some((p) => p.r === r && p.c === c);
                  return (
                    <div
                      key={`${r}-${c}`}
                      onMouseDown={(e) => handleMouseDown(r, c, e)}
                      onMouseEnter={() => handleMouseEnter(r, c)}
                      onMouseUp={handleMouseUp}
                      className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 cursor-crosshair border ${
                        isActive 
                          ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.55)] scale-110 z-10' 
                          : 'bg-slate-900/60 border-slate-800/70 hover:bg-slate-800'
                      }`}
                      title={`像素点 (${r}, ${c})`}
                    />
                  );
                })
              )}
            </div>
          </div>
          <div className="mt-2 text-center text-[10px] font-mono text-slate-500">
            {customPixels.length > 0 
              ? `已激活 ${customPixels.length} 个像素磁轨 / 画板设计模式已生效` 
              : '画板为空，在上方方格内涂鸦，或点击预设一键体验粒子重排'}
          </div>
        </div>
      </div>

      {/* Ratios & Proportions Sliders */}
      <div className="border-t border-slate-800 pt-5">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
              DYNAMIC PROPORTION MATRIX // 粒子占比调试
            </span>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Sliders className="w-5 h-5 text-indigo-400" />
              色彩混合占比矩阵
            </h2>
          </div>
          <span className="text-xs text-indigo-300 font-mono bg-indigo-950/40 border border-indigo-800/30 px-2 py-0.5 rounded">
            SUM: {ratios.celadon + ratios.yangmei + ratios.appliance}% (已自动配平)
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          任意拖动单个数值，其他配比成分会自动反向配平填足，极力还原出自然的色彩权重。
        </p>

        {/* Sliders Container */}
        <div className="flex flex-col gap-4 mt-5">
          {/* Celadon Celadon Slider */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/65">
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-teal-400 font-medium flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-teal-500 rounded-sm" />
                八边形青瓷占比 (瓷文化底蕴)
              </span>
              <span className="font-bold text-teal-300">{ratios.celadon}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={ratios.celadon}
              onChange={(e) => handleRatioChange('celadon', parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-teal-500"
            />
          </div>

          {/* Yangmei Slider */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/65">
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-rose-400 font-medium flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-rose-500 rounded-full" />
                圆形杨梅占比 (生态活力生活)
              </span>
              <span className="font-bold text-rose-300">{ratios.yangmei}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={ratios.yangmei}
              onChange={(e) => handleRatioChange('yangmei', parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-rose-550"
            />
          </div>

          {/* Appliance Slider */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/65">
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-indigo-500 clip-hex" />
                六边形家电占比 (智能质造未来)
              </span>
              <span className="font-bold text-indigo-300">{ratios.appliance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={ratios.appliance}
              onChange={(e) => handleRatioChange('appliance', parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Particle Individual Sizes Control Area */}
      <div className="border-t border-slate-800 pt-5">
        <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
          SCALE METRICS MATRIX // 粒子单体尺寸
        </span>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
          <Sliders className="w-5 h-5 text-indigo-400" />
          粒子三态各自尺寸 (Size)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          修改不同类型粒子的微观像素半径大小，展示空间主次感与对比关系。
        </p>

        {/* Sizes Inputs */}
        <div className="grid grid-cols-3 gap-3.5 mt-4">
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/65">
            <label className="block text-[10px] font-mono text-teal-400 mb-1">青瓷八型尺寸</label>
            <div className="flex items-center gap-2.5">
              <input
                type="range"
                min="3"
                max="24"
                value={sizes.celadon}
                onChange={(e) => handleSizeChange('celadon', parseInt(e.target.value))}
                className="w-full accent-teal-500"
              />
              <span className="text-xs font-mono font-bold text-teal-300 min-w-[28px] text-right">{sizes.celadon}px</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/65">
            <label className="block text-[10px] font-mono text-rose-400 mb-1">杨梅圆形尺寸</label>
            <div className="flex items-center gap-2.5">
              <input
                type="range"
                min="3"
                max="24"
                value={sizes.yangmei}
                onChange={(e) => handleSizeChange('yangmei', parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
              <span className="text-xs font-mono font-bold text-rose-300 min-w-[28px] text-right">{sizes.yangmei}px</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/65">
            <label className="block text-[10px] font-mono text-indigo-400 mb-1">家电六边尺寸</label>
            <div className="flex items-center gap-2.5">
              <input
                type="range"
                min="3"
                max="24"
                value={sizes.appliance}
                onChange={(e) => handleSizeChange('appliance', parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <span className="text-xs font-mono font-bold text-indigo-300 min-w-[28px] text-right">{sizes.appliance}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Physics Engine Speed / Constants Controls */}
      <div className="border-t border-slate-800 pt-5">
        <label className="block text-xs font-mono text-slate-400 mb-1">
          PHYS SPEED MULTIPLIER // 流体运行速率: {speedFactor}x
        </label>
        <input
          type="range"
          min="0.2"
          max="3.0"
          step="0.1"
          value={speedFactor}
          onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-450"
        />
        <div className="flex justify-between font-mono text-[9px] text-slate-500 mt-1">
          <span>0.2x 极慢速观察 (Moist)</span>
          <span>1.0x 标准时钟</span>
          <span>3.0x 高频能量漫步</span>
        </div>
      </div>
    </div>
  );
}
