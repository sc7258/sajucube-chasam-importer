// 오행별 색상 시스템
export const ELEMENT_COLORS = {
  '목': '#4FB019',  // 녹색
  '화': '#DE2A12',  // 빨강
  '토': '#D9AD34',  // 노랑
  '금': '#99CCFF',  // 밝은 하늘색
  '수': '#000033',  // 진한 남색
};

// 천간행 매핑
const HEAVENLY_STEM_ELEMENTS: { [key: string]: keyof typeof ELEMENT_COLORS } = {
  '갑': '목', '甲': '목',
  '을': '목', '乙': '목',
  '병': '화', '丙': '화',
  '정': '화', '丁': '화',
  '무': '토', '戊': '토',
  '기': '토', '己': '토',
  '경': '금', '庚': '금',
  '신': '금', '辛': '금',
  '임': '수', '壬': '수',
  '계': '수', '癸': '수',
};

// 지지행 매핑
const EARTHLY_BRANCH_ELEMENTS: { [key: string]: keyof typeof ELEMENT_COLORS } = {
  '인': '목', '寅': '목',
  '묘': '목', '卯': '목',
  '사': '화', '巳': '화',
  '오': '화', '午': '화',
  '진': '토', '辰': '토',
  '술': '토', '戌': '토',
  '축': '토', '丑': '토',
  '미': '토', '未': '토',
  '신': '금', '申': '금',
  '유': '금', '酉': '금',
  '해': '수', '亥': '수',
  '자': '수', '子': '수',
};

// 천간 색상 가져오기
export const getHeavenlyStemColor = (stem: string): string => {
  const element = HEAVENLY_STEM_ELEMENTS[stem];
  return element ? ELEMENT_COLORS[element] : '#000000';
};

// 지지 색상 가져오기
export const getEarthlyBranchColor = (branch: string): string => {
  const element = EARTHLY_BRANCH_ELEMENTS[branch];
  return element ? ELEMENT_COLORS[element] : '#000000';
};

// 간지(천간+지지) 색상 배열 가져오기
export const getGanjiColors = (ganji: string): [string, string] => {
  if (!ganji || ganji.length < 2 || ganji === '-' || ganji === '--') {
    return ['#000000', '#000000'];
  }
  const heavenlyStem = ganji[0];
  const earthlyBranch = ganji[1];
  return [getHeavenlyStemColor(heavenlyStem), getEarthlyBranchColor(earthlyBranch)];
};