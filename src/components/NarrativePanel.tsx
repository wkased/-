import { PARTICLE_PRESETS } from '../data';
import { Palette, Layers, Sparkles, HelpCircle, History, Leaf, Cpu } from 'lucide-react';

interface NarrativePanelProps {
  ratios: {
    celadon: number;
    yangmei: number;
    appliance: number;
  };
  blendedColor: string;
}

export default function NarrativePanel({ ratios, blendedColor }: NarrativePanelProps) {
  // Determine dominant theme based on ratios
  const c = ratios.celadon;
  const y = ratios.yangmei;
  const a = ratios.appliance;

  let themeTitle = "混合调和状态 // 时空过渡域";
  let themeBadge = "过渡区";
  let themeExplain = "当前粒子未达到任何特定的极端占比，空间呈现多重色彩元素交融的渐变过渡状态。在地铁运行过程中，这象征着站点与站点之间的生命、历史与智造的对话轨迹。";
  let themeColorClass = "border-slate-750 bg-slate-900/40 text-slate-300";
  let themeIcon = <Layers className="w-5 h-5 text-indigo-400" />;

  if (c >= y && c >= a && c >= 55) {
    themeTitle = "历史文化区 // 秘色青瓷古韵";
    themeBadge = "历史文化区";
    themeExplain = "青瓷粒子占据主要绝对席位（比率超过 55%）。墨绿到青绿八边形微粒在空间慢漂，还原出一种温润青雅、古香古色的历史时间感，致敬绍兴当地古越青瓷遗迹。";
    themeColorClass = "border-teal-800 bg-teal-950/20 text-teal-200";
    themeIcon = <History className="w-5 h-5 text-teal-400" />;
  } else if (y >= c && y >= a && y >= 50) {
    themeTitle = "生态生活区 // 柔和生命烟火";
    themeBadge = "生态生活区";
    themeExplain = "杨梅粒子突入绝对多数（比率超过 50%）。高饱和的圆形红紫、水粉闪烁漫射，彰显欣欣向荣的城市百姓生态与鲜活朝气，折射富饶安逸的暖意都市韵调。";
    themeColorClass = "border-rose-800 bg-rose-950/20 text-rose-200";
    themeIcon = <Leaf className="w-5 h-5 text-rose-400" />;
  } else if (a >= c && a >= y && a >= 65) {
    themeTitle = "智能制造园区 // 未来金属科技";
    themeBadge = "产业园区";
    themeExplain = "家电粒子占据绝对极高额度。冰冷的银灰、黑钛六角晶体，配合科技脉冲蓝色的极简穿插点缀，演绎着一曲冰冷、精准、雄厚却又无限向外的国家工业科技交响乐。";
    themeColorClass = "border-indigo-800 bg-indigo-950/20 text-indigo-100";
    themeIcon = <Cpu className="w-5 h-5 text-indigo-400" />;
  }

  return (
    <div
      className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-lg flex flex-col gap-6"
      id="narrative-rules-guidelines"
    >
      {/* Intelligently Decided Live Blend Aura Header */}
      <div>
        <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
          INTELLIGENT DENSITY ALGORITHM // 智能比率感知
        </span>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
          <Palette className="w-5 h-5 text-indigo-400" />
          色彩融合核心法则
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          粒子世界“没有绝对的颜色，只有绝对的比例”。系统根据您当前的拖动，实时计算色彩和文化区域归属：
        </p>
      </div>

      {/* Live Color Sensor Indicator Node */}
      <div className={`p-4 rounded-xl border transition-all duration-500 ${themeColorClass}`} id="live-blend-indicator">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-950/50 rounded-lg">
              {themeIcon}
            </div>
            <div>
              <span className="text-[9px] font-mono tracking-wider opacity-60 uppercase block">LIVE SENSOR STATUS // 当前感知区域</span>
              <h4 className="text-sm font-bold text-slate-100">{themeTitle}</h4>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-950/60 px-2.5 py-1 rounded border border-white/5">
            {themeBadge}
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-3 leading-relaxed">
          {themeExplain}
        </p>

        {/* Dynamic color visualizer patch illustrating blendedColor */}
        <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg shadow-inner ring-2 ring-slate-800 transition-all duration-500 animate-pulse"
              style={{
                backgroundColor: blendedColor,
                boxShadow: `0 0 15px ${blendedColor}60`
              }}
            />
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">REALTIME WEIGHTED MIX COLOR // 全场粒子混溶均色</span>
              <span className="text-xs font-mono text-slate-200 font-bold tracking-wider">{blendedColor.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex gap-1.5 font-mono text-[10px] text-slate-400 self-end sm:self-center">
            <span>C:{c}%</span>
            <span>·</span>
            <span>Y:{y}%</span>
            <span>·</span>
            <span>A:{a}%</span>
          </div>
        </div>
      </div>

      {/* Static specs illustrating the three original micro-particle types */}
      <div className="border-t border-slate-800 pt-5">
        <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
          PARTICLE SPECIFICATIONS // 三种基础粒子定义
        </span>
        <h3 className="text-sm font-bold text-slate-300 mt-1 mb-4 flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          微观形态与意涵
        </h3>

        <div className="flex flex-col gap-3.5">
          {PARTICLE_PRESETS.map((p) => {
            // Pick appropriate polygon visualizer using CSS clip paths or simple emoji indicators
            let shapeName = "八边形";
            let shapeIcon = "⬡";
            let iconColor = "text-teal-400";

            if (p.shape === 'hexagon') {
              shapeName = "六边形";
              shapeIcon = "⬢";
              iconColor = "text-indigo-400";
            } else if (p.shape === 'circle') {
              shapeName = "圆形";
              shapeIcon = "●";
              iconColor = "text-rose-400";
            }

            return (
              <div
                key={p.type}
                className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:bg-slate-900/40 transition-all duration-300 flex gap-3.5 items-start"
              >
                {/* Micro preview of the shape */}
                <div className={`text-2xl ${iconColor} select-none font-mono pt-0.5`}>
                  {shapeIcon}
                </div>

                {/* Spec text */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="text-xs font-bold text-slate-200">
                      {p.name} <span className="text-[10px] font-normal text-slate-400">({shapeName})</span>
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {p.meaning.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    {p.description}
                  </p>

                  {/* Gradient paint swatches */}
                  <div className="flex gap-1.5 mt-2">
                    {p.colorRange.map((color, cIdx) => (
                      <div
                        key={cIdx}
                        className="w-4 h-4 rounded-sm border border-slate-900/80"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
