import React, { useState, useRef } from 'react';
import { Station, ParticleType } from '../types';
import { 
  Palette, 
  Upload, 
  Trash2, 
  Plus, 
  Sliders, 
  Settings, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ColorFactoryPanelProps {
  celadonColors: string[];
  setCeladonColors: React.Dispatch<React.SetStateAction<string[]>>;
  yangmeiColors: React.Dispatch<React.SetStateAction<string[]>>;
  setYangmeiColors: React.Dispatch<React.SetStateAction<string[]>>;
  applianceColors: React.Dispatch<React.SetStateAction<string[]>>;
  setApplianceColors: React.Dispatch<React.SetStateAction<string[]>>;
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  onApplyPreset: (station: Station) => void;
  currentStationId: string;
}

export default function ColorFactoryPanel({
  celadonColors,
  setCeladonColors,
  yangmeiColors,
  setYangmeiColors,
  applianceColors,
  setApplianceColors,
  stations,
  setStations,
  onApplyPreset,
  currentStationId,
}: ColorFactoryPanelProps) {
  const [activeTab, setActiveTab] = useState<'palette' | 'stations'>('palette');
  const [selectedStationId, setSelectedStationId] = useState<string>(currentStationId);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [imageName, setImageName] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Color Palette Editing Operations
  const handleColorChange = (type: ParticleType, index: number, hex: string) => {
    // Validate hex format slightly
    const safeHex = hex.startsWith('#') ? hex : `#${hex}`;
    if (type === 'celadon') {
      setCeladonColors((prev) => prev.map((c, i) => (i === index ? safeHex : c)));
    } else if (type === 'yangmei') {
      setYangmeiColors((prev) => prev.map((c, i) => (i === index ? safeHex : c)));
    } else if (type === 'appliance') {
      setApplianceColors((prev) => prev.map((c, i) => (i === index ? safeHex : c)));
    }
  };

  const handleAddColor = (type: ParticleType) => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    if (type === 'celadon') {
      setCeladonColors((prev) => [...prev, randomHex]);
    } else if (type === 'yangmei') {
      setYangmeiColors((prev) => [...prev, randomHex]);
    } else if (type === 'appliance') {
      setApplianceColors((prev) => [...prev, randomHex]);
    }
  };

  const handleDeleteColor = (type: ParticleType, index: number) => {
    const minSafeLen = 1;
    if (type === 'celadon') {
      if (celadonColors.length <= minSafeLen) return;
      setCeladonColors((prev) => prev.filter((_, i) => i !== index));
    } else if (type === 'yangmei') {
      if (yangmeiColors.length <= minSafeLen) return;
      setYangmeiColors((prev) => prev.filter((_, i) => i !== index));
    } else if (type === 'appliance') {
      if (applianceColors.length <= minSafeLen) return;
      setApplianceColors((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleResetColors = (type: ParticleType) => {
    if (type === 'celadon') {
      setCeladonColors(['#4a7c73', '#5c938c', '#74aba2', '#8ec2b9']);
    } else if (type === 'yangmei') {
      setYangmeiColors(['#5c2045', '#862149', '#b23363', '#d64a7c']);
    } else if (type === 'appliance') {
      setApplianceColors(['#2a2b2e', '#4e4f52', '#7a7b80', '#3b729f']);
    }
  };

  // 2. Client-side Realtime Color Extraction from Uploaded Image
  const handleImageFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Sample image elements on tiny Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 40;
        canvas.height = 40;
        ctx.drawImage(img, 0, 0, 40, 40);

        const imgData = ctx.getImageData(0, 0, 40, 40).data;
        const colorClusters: { r: number; g: number; b: number; count: number }[] = [];

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];
          if (a < 120) continue; // skip transparent pixels

          let clustered = false;
          for (let sample of colorClusters) {
            const distance = Math.sqrt(
              Math.pow(sample.r - r, 2) + Math.pow(sample.g - g, 2) + Math.pow(sample.b - b, 2)
            );
            if (distance < 45) {
              // merge slightly
              sample.r = Math.round((sample.r * sample.count + r) / (sample.count + 1));
              sample.g = Math.round((sample.g * sample.count + g) / (sample.count + 1));
              sample.b = Math.round((sample.b * sample.count + b) / (sample.count + 1));
              sample.count++;
              clustered = true;
              break;
            }
          }
          if (!clustered) {
            colorClusters.push({ r, g, b, count: 1 });
          }
        }

        // Sort by pixel representation weight
        colorClusters.sort((a, b) => b.count - a.count);
        const topHexColors = colorClusters.slice(0, 5).map((color) => {
          const toHexPart = (val: number) => val.toString(16).padStart(2, '0');
          return `#${toHexPart(color.r)}${toHexPart(color.g)}${toHexPart(color.b)}`;
        });

        setExtractedColors(topHexColors);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddExtractedToType = (color: string, type: ParticleType) => {
    if (type === 'celadon') {
      setCeladonColors((prev) => [...prev, color]);
    } else if (type === 'yangmei') {
      setYangmeiColors((prev) => [...prev, color]);
    } else if (type === 'appliance') {
      setApplianceColors((prev) => [...prev, color]);
    }
    
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1000);
  };

  // 3. Station Ratio Override Customizer
  const activeSelectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  const handleStationRatioChange = (type: 'celadon' | 'yangmei' | 'appliance', val: number) => {
    const rawVal = Math.min(100, Math.max(0, val));
    const currentRatio = activeSelectedStation.ratio;
    
    const delta = rawVal - currentRatio[type];
    const others = (['celadon', 'yangmei', 'appliance'] as const).filter((t) => t !== type);
    const otherSum = currentRatio[others[0]] + currentRatio[others[1]];

    let nextRatios = { ...currentRatio };
    nextRatios[type] = rawVal;

    if (otherSum === 0) {
      nextRatios[others[0]] = Math.round((100 - rawVal) / 2);
      nextRatios[others[1]] = 100 - rawVal - nextRatios[others[0]];
    } else {
      const firstTarget = Math.max(0, Math.min(100, Math.round(currentRatio[others[0]] - (delta * currentRatio[others[0]]) / otherSum)));
      nextRatios[others[0]] = firstTarget;
      nextRatios[others[1]] = Math.max(0, 100 - rawVal - firstTarget);
    }

    setStations((prev) =>
      prev.map((s) =>
        s.id === selectedStationId
          ? {
              ...s,
              ratio: nextRatios,
            }
          : s
      )
    );
  };

  const handleStationSizeChange = (type: 'celadon' | 'yangmei' | 'appliance', size: number) => {
    const clampedSize = Math.max(3, Math.min(25, size));
    setStations((prev) =>
      prev.map((s) =>
        s.id === selectedStationId
          ? {
              ...s,
              sizeModifier: {
                ...s.sizeModifier,
                [type]: clampedSize,
              },
            }
          : s
      )
    );
  };

  const handleTriggerSimFromCustomStations = () => {
    // Dynamically apply current selected customized station presets right now to show burst anim
    onApplyPreset(activeSelectedStation);
  };

  return (
    <div
      className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col gap-5 mt-6"
      id="customization-hub-panel"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40 uppercase">
            COLOR LAB & STATION MATRIX // 深度设计工坊
          </span>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-1.5 font-sans">
            <Palette className="w-5 h-5 text-teal-400" />
            色彩工坊与车辆段配比定制
          </h2>
        </div>
        
        {/* Tab triggers */}
        <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('palette')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-all ${
              activeTab === 'palette'
                ? 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎨 粒子调色与图片取色
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-all ${
              activeTab === 'stations'
                ? 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🚉 各站点占比及尺寸
          </button>
        </div>
      </div>

      {/* Tab Content 1: Particle Palette Editor & Extractor */}
      {activeTab === 'palette' && (
        <div className="flex flex-col gap-6" id="panel-tab-palette">
          <p className="text-xs text-slate-400 leading-relaxed">
            您可以随时<strong>自定义每种粒子的颜色数量</strong>。点击圆圈编辑单个色彩（支持吸管取色），添加随机色彩，或<strong>通过上传精美图卷提取主颜色</strong>并将其注入系统中。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Celadon Swatch group */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-800/60 pb-1.5 font-mono">
                <span className="text-teal-400 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-teal-500 rounded-sm" />
                  青瓷粒子色容 ({celadonColors.length})
                </span>
                <button 
                  onClick={() => handleResetColors('celadon')}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase cursor-pointer"
                  title="恢复系统出厂青瓷秘色配置"
                >
                  重置
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                {celadonColors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded border border-slate-850">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange('celadon', idx, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={color.toUpperCase()}
                      onChange={(e) => handleColorChange('celadon', idx, e.target.value)}
                      className="text-[11px] font-mono text-slate-300 bg-transparent border-0 w-16 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-1"
                    />
                    <button
                      onClick={() => handleDeleteColor('celadon', idx)}
                      disabled={celadonColors.length <= 1}
                      className="ml-auto p-1 text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 rounded disabled:opacity-40 disabled:hover:text-slate-650 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddColor('celadon')}
                className="w-full mt-1.5 py-1.5 rounded border border-dashed border-teal-800/40 hover:border-teal-500 text-teal-400 hover:text-teal-300 text-[11px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加青瓷色</span>
              </button>
            </div>

            {/* Yangmei Swatch group */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-800/60 pb-1.5 font-mono">
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  杨梅粒子色容 ({yangmeiColors.length})
                </span>
                <button 
                  onClick={() => handleResetColors('yangmei')}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase cursor-pointer"
                  title="恢复城市活力生态红紫配置"
                >
                  重置
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                {yangmeiColors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded border border-slate-850">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange('yangmei', idx, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={color.toUpperCase()}
                      onChange={(e) => handleColorChange('yangmei', idx, e.target.value)}
                      className="text-[11px] font-mono text-slate-300 bg-transparent border-0 w-16 focus:outline-none focus:ring-1 focus:ring-rose-500 rounded px-1"
                    />
                    <button
                      onClick={() => handleDeleteColor('yangmei', idx)}
                      disabled={yangmeiColors.length <= 1}
                      className="ml-auto p-1 text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 rounded disabled:opacity-40 disabled:hover:text-slate-650 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddColor('yangmei')}
                className="w-full mt-1.5 py-1.5 rounded border border-dashed border-rose-800/40 hover:border-rose-500 text-rose-400 hover:text-rose-300 text-[11px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加杨梅色</span>
              </button>
            </div>

            {/* Appliance Swatch group */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-800/60 pb-1.5 font-mono">
                <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-500 clip-hex" />
                  家电粒子色容 ({applianceColors.length})
                </span>
                <button 
                  onClick={() => handleResetColors('appliance')}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase cursor-pointer"
                  title="恢复产业园区智造科技金属配比"
                >
                  重置
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                {applianceColors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded border border-slate-850">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange('appliance', idx, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={color.toUpperCase()}
                      onChange={(e) => handleColorChange('appliance', idx, e.target.value)}
                      className="text-[11px] font-mono text-slate-300 bg-transparent border-0 w-16 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                    />
                    <button
                      onClick={() => handleDeleteColor('appliance', idx)}
                      disabled={applianceColors.length <= 1}
                      className="ml-auto p-1 text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 rounded disabled:opacity-40 disabled:hover:text-slate-650 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddColor('appliance')}
                className="w-full mt-1.5 py-1.5 rounded border border-dashed border-indigo-800/40 hover:border-indigo-500 text-indigo-400 hover:text-indigo-300 text-[11px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加家电色</span>
              </button>
            </div>
          </div>

          {/* Core Feature: Image upload palette extractor */}
          <div className="border-t border-slate-800/80 pt-5">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 block mb-1">IMAGE PALETTE CONVERTOR // 图片上传色调提取库</span>
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              通过照片/色彩图稿一键取色
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-3">
              {/* Box Drop Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="md:col-span-5 border border-dashed border-slate-800 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-emerald-950/5 p-5 rounded-xl transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[100px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileLoad}
                  accept="image/*"
                  className="hidden"
                />
                <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse mb-1.5" />
                <span className="text-xs font-medium text-slate-300">
                  {imageName ? `已载入: ${imageName.slice(0, 18)}...` : '拖拽或点击上传本地图萃或调色盘'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">支持 PNG, JPG, WEBP. 系统自动运行色彩空间分层提取。</span>
              </div>

              {/* Extraction swatch result list */}
              <div className="md:col-span-7 bg-slate-950/20 rounded-xl border border-slate-850 p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block pb-1.5 border-b border-slate-850/60">
                    EXTRACTED DOMINANT SWATCHES // 图像空间高价值色彩主张 (最多5类):
                  </span>
                  
                  {extractedColors.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5 mt-3">
                      {extractedColors.map((color, index) => (
                        <div key={index} className="flex flex-col items-center gap-1 bg-slate-950 p-1.5 rounded border border-slate-800 group relative">
                          {/* Color Badge swatch */}
                          <div 
                            className="w-10 h-7 rounded border border-white/10 shadow shadow-black"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-[9px] font-mono text-slate-400">{color.toUpperCase()}</span>
                          
                          {/* Direct push sub buttons */}
                          <div className="flex gap-1 mt-1 border-t border-slate-800 pt-1">
                            <button
                              onClick={() => handleAddExtractedToType(color, 'celadon')}
                              className="px-1 py-0.5 rounded bg-teal-950/50 hover:bg-teal-900 text-teal-400 text-[8px] font-mono transition-colors cursor-pointer"
                              title="加入青瓷色卡"
                            >
                              +青
                            </button>
                            <button
                              onClick={() => handleAddExtractedToType(color, 'yangmei')}
                              className="px-1 py-0.5 rounded bg-rose-950/50 hover:bg-rose-900 text-rose-400 text-[8px] font-mono transition-colors cursor-pointer"
                              title="加入杨梅色卡"
                            >
                              +梅
                            </button>
                            <button
                              onClick={() => handleAddExtractedToType(color, 'appliance')}
                              className="px-1 py-0.5 rounded bg-indigo-950/50 hover:bg-indigo-900 text-indigo-400 text-[8px] font-mono transition-colors cursor-pointer"
                              title="加入家电色卡"
                            >
                              +家
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs font-mono text-slate-600">
                      ← 暂无提取数据。请先在左侧上传任何具有灵感底蕴的地标风景、瓷器古画或UI配色等图片！
                    </div>
                  )}
                </div>

                {copiedColor && (
                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-1 rounded inline-flex items-center gap-1.5 self-start mt-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    已成功写入并融入系统粒子： {copiedColor.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Station Particle Ratio customization */}
      {activeTab === 'stations' && (
        <div className="flex flex-col gap-4 animate-fadeIn" id="panel-tab-stations">
          <p className="text-xs text-slate-400 leading-relaxed">
            极少数物理引擎能做到时空连续修改！您可以<strong>自定义每个站点的粒子占比（相互制衡补齐100%）</strong>和基础物理尺寸。这些配置会永久修改地铁叙事时空线。
          </p>

          {/* Sector select stations tab */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-850 mt-1">
            {stations.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStationId(s.id)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold font-mono flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedStationId === s.id
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <span>{s.role}</span>
                <span className="text-[9px] opacity-80 font-normal">{s.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Customize ratios and sizes panel */}
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-4 mt-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <span className="text-xs font-mono text-slate-300">
                正在编辑: <strong className="text-indigo-400">{activeSelectedStation.name}</strong> 
              </span>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-805/40">
                比例总和: {activeSelectedStation.ratio.celadon + activeSelectedStation.ratio.yangmei + activeSelectedStation.ratio.appliance}% (完美拟合)
              </span>
            </div>

            {/* Slider Ratios editing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Celadon Station Slider */}
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850">
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-teal-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-teal-500" />
                    青瓷占比
                  </span>
                  <span className="font-bold text-teal-300">{activeSelectedStation.ratio.celadon}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeSelectedStation.ratio.celadon}
                  onChange={(e) => handleStationRatioChange('celadon', parseInt(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
                
                <div className="flex justify-between items-center text-xs mt-3 mb-1 font-mono">
                  <span className="text-slate-500 text-[10px]">粒子基础尺寸</span>
                  <span className="font-bold text-teal-300 text-[11px]">{activeSelectedStation.sizeModifier.celadon}px</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="25"
                  value={activeSelectedStation.sizeModifier.celadon}
                  onChange={(e) => handleStationSizeChange('celadon', parseInt(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer h-1 bg-slate-800 rounded"
                />
              </div>

              {/* Yangmei Station Slider */}
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850">
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    杨梅占比
                  </span>
                  <span className="font-bold text-rose-300">{activeSelectedStation.ratio.yangmei}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeSelectedStation.ratio.yangmei}
                  onChange={(e) => handleStationRatioChange('yangmei', parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />

                <div className="flex justify-between items-center text-xs mt-3 mb-1 font-mono">
                  <span className="text-slate-500 text-[10px]">粒子基础尺寸</span>
                  <span className="font-bold text-rose-300 text-[11px]">{activeSelectedStation.sizeModifier.yangmei}px</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="25"
                  value={activeSelectedStation.sizeModifier.yangmei}
                  onChange={(e) => handleStationSizeChange('yangmei', parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1 bg-slate-800 rounded"
                />
              </div>

              {/* Appliance Station Slider */}
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850">
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-indigo-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded clip-hex bg-indigo-500" />
                    家电占比
                  </span>
                  <span className="font-bold text-indigo-300">{activeSelectedStation.ratio.appliance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeSelectedStation.ratio.appliance}
                  onChange={(e) => handleStationRatioChange('appliance', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                />

                <div className="flex justify-between items-center text-xs mt-3 mb-1 font-mono">
                  <span className="text-slate-500 text-[10px]">粒子基础尺寸</span>
                  <span className="font-bold text-indigo-300 text-[11px]">{activeSelectedStation.sizeModifier.appliance}px</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="25"
                  value={activeSelectedStation.sizeModifier.appliance}
                  onChange={(e) => handleStationSizeChange('appliance', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded"
                />
              </div>
            </div>

            {/* Prompt manual compile click */}
            <div className="flex justify-between items-center gap-4 bg-indigo-950/25 p-3 rounded-lg border border-indigo-900/35 mt-2">
              <span className="text-[11px] text-indigo-300 leading-snug">
                💡 <strong>提示:</strong> 修改后会直接保存在该站。点击右侧“触发本站漫射爆破”可立刻观察自定义的站点色彩爆发和周期对齐！
              </span>
              <button
                onClick={handleTriggerSimFromCustomStations}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold font-mono text-slate-100 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all hover:scale-[1.01]"
              >
                <span>触发本站漫射爆破</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
