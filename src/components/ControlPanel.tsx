import { Sliders, LayoutGrid, Award, Volume2, Move, HelpCircle, AlertCircle } from 'lucide-react';

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
  activeMode: 'idle' | 'diffusion' | 'gather' | 'circle' | 'solid_circle' | 'chaos';
  onSetMode: (mode: 'idle' | 'diffusion' | 'gather' | 'circle' | 'solid_circle' | 'chaos') => void;
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
