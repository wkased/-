import { Station } from '../types';
import { STATION_PRESETS } from '../data';
import { Train, ShieldAlert, ArrowRight, Palette } from 'lucide-react';

interface StationPanelProps {
  currentStationId: string;
  onSelectStation: (station: Station) => void;
  isAutoRiding: boolean;
  onToggleAutoRide: () => void;
  stations: Station[];
}

export default function StationPanel({
  currentStationId,
  onSelectStation,
  isAutoRiding,
  onToggleAutoRide,
  stations,
}: StationPanelProps) {
  return (
    <div
      className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-lg relative overflow-hidden"
      id="station-narrative-panel"
    >
      {/* Visual background ambient accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
            METRO LINE NARRATIVE // 地铁线路色彩坐标
          </span>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2 mt-1">
            <Train className="w-5 h-5 text-indigo-400" />
            色彩叙事：时空演变站点
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            整条地铁线是一场粒子比例动态变化的色彩叙事时间轴，点击站点即可穿越体验
          </p>
        </div>

        {/* Metro Ride Auto Pilot */}
        <button
          onClick={onToggleAutoRide}
          className={`relative inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-mono font-medium transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
            isAutoRiding
              ? 'bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-slate-100 shadow-md hover:shadow-indigo-500/20'
          }`}
          id="btn-auto-ride-toggle"
        >
          {isAutoRiding ? '■ 正在巡航试乘 (自动播站)...' : '▶ 自动巡航试乘 (模拟行车)'}
        </button>
      </div>

      {/* Modern Horizontal Railway Timeline Layout */}
      <div className="relative my-8 px-4" id="railway-timeline-path">
        {/* Continuous Train Track Line */}
        <div className="absolute top-[26px] left-[15%] right-[15%] h-[4px] bg-slate-800 rounded-full z-0 overflow-hidden">
          {/* Glowing track accent reflecting progress */}
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-rose-500 to-indigo-500 transition-all duration-1000 ease-in-out"
            style={{
              width:
                currentStationId === 'start'
                  ? '0%'
                  : currentStationId === 'middle'
                  ? '50%'
                  : '100%',
            }}
          />
        </div>

        {/* Station Stops Map */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {stations.map((station, index) => {
            const isSelected = station.id === currentStationId;
            let themeDotColor = 'border-teal-500 bg-teal-950 text-teal-300';
            if (station.id === 'middle') {
              themeDotColor = 'border-rose-500 bg-rose-950 text-rose-300';
            } else if (station.id === 'terminal') {
              themeDotColor = 'border-indigo-400 bg-indigo-950 text-indigo-300';
            }

            return (
              <button
                key={station.id}
                onClick={() => onSelectStation(station)}
                className={`flex flex-col items-center text-center focus:outline-none group cursor-pointer`}
                id={`station-stop-trigger-${station.id}`}
              >
                {/* Visual Ring Station Stop */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isSelected
                      ? `${themeDotColor} scale-115 ring-4 ring-slate-800/80 shadow-[0_0_20px_rgba(99,102,241,0.35)]`
                      : 'border-slate-700 bg-slate-900 text-slate-500 group-hover:border-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-mono font-bold">{index + 1}</span>
                </div>

                {/* Info Text Nodes */}
                <div className="mt-4">
                  <span
                    className={`inline-block px-2 py-0.5 text-[9px] font-bold font-mono rounded-full mb-1 border uppercase tracking-wider ${
                      isSelected
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : 'bg-slate-800 text-slate-500 border-slate-700 group-hover:text-slate-400'
                    }`}
                  >
                    {station.role}
                  </span>
                  <h3
                    className={`text-sm font-bold transition-colors ${
                      isSelected ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {station.name.split(' ')[0]}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 max-sm:hidden">
                    {station.themeDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Station Detail Info Display Card */}
      {(() => {
        const activeStation = stations.find((s) => s.id === currentStationId);
        if (!activeStation) return null;

        // Visual gradients/indicators
        const isStart = activeStation.id === 'start';
        const isMiddle = activeStation.id === 'middle';
        const themeColorText = isStart
          ? 'text-teal-400'
          : isMiddle
          ? 'text-pink-400'
          : 'text-indigo-400';
        const themeBg = isStart
          ? 'bg-teal-950/20 border-teal-800/40 text-teal-100'
          : isMiddle
          ? 'bg-rose-950/20 border-rose-800/40 text-rose-100'
          : 'bg-indigo-950/20 border-indigo-800/40 text-indigo-100';

        return (
          <div
            className={`mt-4 p-5 rounded-xl border transition-all duration-700 ease-in-out ${themeBg}`}
            id="station-detail-card"
          >
            {/* Header label with dynamic colored accents */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3 mb-3">
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase ${themeColorText}`}>
                  {activeStation.role} STATION / {activeStation.dominantTheme}
                </span>
                <h3 className="text-base font-bold text-slate-100 tracking-tight mt-0.5">
                  {activeStation.name} — <span className="text-xs font-normal text-slate-300">{activeStation.subName}</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-slate-950/40 px-3 py-1 rounded-full border border-white/5 text-slate-300">
                  核心调性: <strong className={themeColorText}>{activeStation.themeDesc}</strong>
                </span>
              </div>
            </div>

            {/* Narrative description writeup */}
            <p className="text-xs leading-relaxed text-slate-300">
              {activeStation.narrative}
            </p>

            {/* Ratio composition diagram indicators */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <span className="text-[10px] font-mono text-slate-400 block mb-2">
                SITE PARTICLE PROPORTIONS // 站点粒子占比构成:
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-950/30 border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-teal-400 flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 block border border-teal-300/30" />
                      八边形青瓷
                    </span>
                    <span className="font-mono font-bold text-teal-300 text-sm">{activeStation.ratio.celadon}%</span>
                  </div>
                  <div className="w-full bg-slate-800/50 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full transition-all duration-1000" style={{ width: `${activeStation.ratio.celadon}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-1.5">尺寸倍率: {activeStation.sizeModifier.celadon}px</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/30 border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block border border-rose-300/30" />
                      圆形杨梅
                    </span>
                    <span className="font-mono font-bold text-rose-300 text-sm">{activeStation.ratio.yangmei}%</span>
                  </div>
                  <div className="w-full bg-slate-800/50 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${activeStation.ratio.yangmei}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-1.5">尺寸倍率: {activeStation.sizeModifier.yangmei}px</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/30 border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-indigo-400 flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 clip-hex bg-indigo-500 block border border-indigo-300/30" />
                      六边形家电
                    </span>
                    <span className="font-mono font-bold text-indigo-300 text-sm">{activeStation.ratio.appliance}%</span>
                  </div>
                  <div className="w-full bg-slate-800/50 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${activeStation.ratio.appliance}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-1.5">尺寸倍率: {activeStation.sizeModifier.appliance}px</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
