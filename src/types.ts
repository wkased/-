export type ParticleType = 'celadon' | 'yangmei' | 'appliance';

export interface ParticlePreset {
  type: ParticleType;
  name: string;
  shape: 'octagon' | 'circle' | 'hexagon';
  colorRange: string[]; // hex codes representing the range
  meaning: string;
  description: string;
}

export interface Particle {
  id: number;
  type: ParticleType;
  shape: 'octagon' | 'circle' | 'hexagon';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  angle: number;
  spinSpeed: number;
  // Dynamic color transition channels
  r?: number;
  g?: number;
  b?: number;
  tr?: number;
  tg?: number;
  tb?: number;
}

export interface Station {
  id: string; // 'start' | 'middle' | 'terminal'
  name: string;
  subName: string;
  role: string; // '起点站' | '中段站' | '园区站'
  ratio: {
    celadon: number; // in %
    yangmei: number;
    appliance: number;
  };
  sizeModifier: {
    celadon: number; // multiplier/base size
    yangmei: number;
    appliance: number;
  };
  dominantTheme: string; // e.g., '历史文化区' | '生态生活区' | '产业园区'
  themeDesc: string; // e.g. "温润青灰色调" | "柔和紫调" | "冷静金属灰调"
  regionalColors: string[]; // preview list
  narrative: string;
}

