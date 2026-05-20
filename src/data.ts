import { Station, ParticlePreset } from './types';

export const PARTICLE_PRESETS: ParticlePreset[] = [
  {
    type: 'celadon',
    name: '青瓷粒子',
    shape: 'octagon',
    colorRange: ['#4a7c73', '#5c938c', '#74aba2', '#8ec2b9'],
    meaning: '越窑遗址 历史底蕴',
    description: '温润质感、千年的历史文化遗存，传递着时间的沉淀。'
  },
  {
    type: 'yangmei',
    name: '杨梅粒子',
    shape: 'circle',
    colorRange: ['#5c2045', '#862149', '#b23363', '#d64a7c'],
    meaning: '城市生活 生态绿态',
    description: '自然馈赠、生活喜悦，代表蓬勃灵动的生命力。'
  },
  {
    type: 'appliance',
    name: '家电粒子',
    shape: 'hexagon',
    colorRange: ['#2a2b2e', '#4e4f52', '#7a7b80', '#3b729f'],
    meaning: '智能制造 科技未来',
    description: '工业的力量、高精度机件，勾勒科技时代的极简格调。'
  }
];

export const STATION_PRESETS: Station[] = [
  {
    id: 'start',
    name: '起点站 (秘色遗址)',
    subName: '越窑瓷文化底蕴站',
    role: '起点站',
    ratio: {
      celadon: 70,
      yangmei: 20,
      appliance: 10
    },
    sizeModifier: {
      celadon: 12, // Larger historically prominent celadon particles
      yangmei: 6,
      appliance: 6
    },
    dominantTheme: '历史文化区',
    themeDesc: '温润青灰色调',
    regionalColors: ['#709a95', '#55827c', '#8cbdae'],
    narrative: '作为这条具有色彩生命穿梭力的地铁起点，青瓷粒子在此占领 70% 的绝对优势！极富有历史厚重感的青八边形粒子，与淡淡的浅灰、湖蓝相互糅合。置身其中仿佛置身于烟雨越窑之中，温润的青灰代表着千百年来瓷韵时光的悠长沉淀。',
  },
  {
    id: 'middle',
    name: '中段站 (繁华都会)',
    subName: '城市生态生活活力站',
    role: '中段站',
    ratio: {
      celadon: 25,
      yangmei: 60,
      appliance: 15
    },
    sizeModifier: {
      celadon: 7,
      yangmei: 14, // Vibrant circular Yangmei particles prominent
      appliance: 7
    },
    dominantTheme: '生态生活区',
    themeDesc: '柔和舒缓紫调',
    regionalColors: ['#a92c60', '#582f4e', '#c24b80'],
    narrative: '列车行驶至中段。代表市民蓬勃生活轨迹的杨梅粒子配比陡增至 60%！高密度圆形纯正的红紫、水粉相互辉映，色彩极富有机生气与活跃热量。描绘的是人们穿梭于热闹市集、生态公园的暖意，空气中弥漫的是舒适生态的都市生命律动。',
  },
  {
    id: 'terminal',
    name: '园区站 (智造新城)',
    subName: '精密智造未来产业园',
    role: '园区站',
    ratio: {
      celadon: 10,
      yangmei: 10,
      appliance: 80
    },
    sizeModifier: {
      celadon: 6,
      yangmei: 6,
      appliance: 13 // Tech-heavy hexagonal appliance particles
    },
    dominantTheme: '产业园区',
    themeDesc: '深灰冷静金属调',
    regionalColors: ['#2c2c2e', '#4a4a4d', '#3b729f'],
    narrative: '终点到站！四周环境立刻褪去繁复的颜色，代表冷静未来的高科技家电粒子占比飙升至惊人的 80%。充满几何对称对称美感的六边形冷晶体，构成高精度金属矩阵组合，搭配极具未来指向的科技蓝极简点缀，勾勒出国家重工业和科技质造的力量。',
  }
];

export const REGIONAL_THEMES = {
  celadon_dominant: {
    title: "历史文化区 // 传承古韵",
    color: "from-teal-950 to-slate-900 border-teal-500/30",
    particleRep: "Celadon (Octagonal)",
    desc: "当青瓷粒子占比偏高时。深处的翠色与湖蓝颗粒漫布，象征传统越窑在时间淬炼中吐露的历史醇香。"
  },
  yangmei_dominant: {
    title: "生态生活区 // 烟火人间",
    color: "from-rose-950 to-slate-900 border-rose-500/30",
    particleRep: "Yangmei (Circular)",
    desc: "随着杨梅粒子攀上支配地位。生活、生态、人烟的色彩占领高地，构成极为丰富且温情满满的都市暖意。"
  },
  appliance_dominant: {
    title: "高新产业区 // 智造未来",
    color: "from-slate-950 to-neutral-900 border-indigo-500/30",
    particleRep: "Appliance (Hexagonal)",
    desc: "当智能家电的灰银六角冰晶密集分布。硬朗的工业机械感与精密的未来高科技感将整个空间笼罩在一层硬核灰色浪漫之中。"
  }
};
