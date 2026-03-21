import { Person, CalculationResult } from '@/types/Person';

/**
 * 사주 명식 계산 모듈
 * 이 모듈은 분리되어 있어 추후 업데이트나 오류 수정이 용이합니다.
 */

// 절기 시간 배열 (분 단위)
const montharray = [0, 21355, 42843, 64498, 86335, 108366, 130578, 152958,
  175471, 198077, 220728, 243370, 265955, 288432, 310767, 332928,
  354903, 376685, 398290, 419736, 441060, 462295, 483493, 504693, 525949];

// 절기 이름
const monthst = ["입춘", "우수", "경칩", "춘분", "청명", "곡우",
  "입하", "소만", "망종", "하지", "소서", "대서",
  "입추", "처서", "백로", "추분", "한로", "상강",
  "입동", "소설", "대설", "동지", "소한", "대한", "입춘"];

// 천간
const gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// 지지
const ji = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 육십갑자
const ganji = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉', '甲戌', '乙亥',
  '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未', '甲申', '乙酉', '丙戌', '丁亥',
  '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳', '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥',
  '庚子', '辛丑', '壬寅', '癸卯', '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥',
  '壬子', '癸丑', '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'];

// 요일
const weekday = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 28수
const s28day = ['角', '亢', '저', '房', '心', '尾', '箕',
  '斗', '牛', '女', '虛', '危', '室', '壁',
  '奎', '누', '胃', '昴', '畢', '자', '參',
  '井', '鬼', '柳', '星', '張', '翼', '진'];

// 기준 시점 (2100년 2월 4일 03:04 - 입춘)
const unityear = 2100;
const unitmonth = 2;
const unitday = 4;
const unithour = 3;
const unitmin = 4;

// 기준 시점의 간지
const uygan = 6; // 경
const uyji = 8;  // 신
const uysu = 56; // 경신년

const umgan = 4; // 무
const umji = 2;  // 인
const umsu = 14; // 무인월

const udgan = 3; // 정
const udji = 1;  // 축
const udsu = 13; // 정축일

const uhgan = 7; // 신
const uhji = 1; // 축
const uhsu = 37; // 신축시

// 정월 초하루 합삭시간 (2100년 기준으로 임시 설정, 추후 정확한 값으로 업데이트 필요)
const unitmyear = 2100;
const unitmmonth = 2;
const unitmday = 12;
const unitmhour = 8;
const unitmmin = 30;
const moonlength = 42524;

/**
 * 정수 나눗셈
 */
function div(a: number, b: number): number {
  return Math.floor(a / b);
}

/**
 * 1월 1일부터 해당 날짜까지의 일수
 */
function disptimeday(year: number, month: number, day: number): number {
  let e = 0;
  for (let i = 1; i < month; i++) {
    e = e + 31;
    if (i === 2 || i === 4 || i === 6 || i === 9 || i === 11) {
      e--;
    }
    if (i === 2) {
      e = e - 2;
      if (year % 4 === 0) { e++; }
      if (year % 100 === 0) { e--; }
      if (year % 400 === 0) { e++; }
      if (year % 4000 === 0) { e--; }
    }
  }
  e = e + day;
  return e;
}

/**
 * y1,m1,d1부터 y2,m2,d2까지의 일수 계산
 */
function disp2days(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): number {
  let p2, p1, p1n, pp1, pp2, pr, dis: number;

  if (y2 > y1) {
    p2 = disptimeday(y2, m2, d2);
    p1 = disptimeday(y1, m1, d1);
    p1n = disptimeday(y1, 12, 31);
    pp1 = y1;
    pp2 = y2;
    pr = -1;
  } else {
    p1 = disptimeday(y2, m2, d2);
    p1n = disptimeday(y2, 12, 31);
    p2 = disptimeday(y1, m1, d1);
    pp1 = y2;
    pp2 = y1;
    pr = 1;
  }

  if (y2 === y1) {
    dis = p2 - p1;
  } else {
    dis = p1n - p1;
    const ppp1 = pp1 + 1;
    const ppp2 = pp2 - 1;
    for (let k = ppp1; k <= ppp2; k++) {
      if ((k === -2000) && (ppp2 > 1990)) {
        dis = dis + 1457682;
        k = 1990;
      }
      if ((k === -1750) && (ppp2 > 1990)) {
        dis = dis + 1366371;
        k = 1990;
      }
      if ((k === -1500) && (ppp2 > 1990)) {
        dis = dis + 1275060;
        k = 1990;
      }
      if ((k === -1250) && (ppp2 > 1990)) {
        dis = dis + 1183750;
        k = 1990;
      }
      if ((k === -1000) && (ppp2 > 1990)) {
        dis = dis + 1092439;
        k = 1990;
      }
      if ((k === -750) && (ppp2 > 1990)) {
        dis = dis + 1001128;
        k = 1990;
      }
      if ((k === -500) && (ppp2 > 1990)) {
        dis = dis + 909818;
        k = 1990;
      }
      if ((k === -250) && (ppp2 > 1990)) {
        dis = dis + 818507;
        k = 1990;
      }
      if ((k === 0) && (ppp2 > 1990)) {
        dis = dis + 727197;
        k = 1990;
      }
      if ((k === 250) && (ppp2 > 1990)) {
        dis = dis + 635887;
        k = 1990;
      }
      if ((k === 500) && (ppp2 > 1990)) {
        dis = dis + 544576;
        k = 1990;
      }
      if ((k === 750) && (ppp2 > 1990)) {
        dis = dis + 453266;
        k = 1990;
      }
      if ((k === 1000) && (ppp2 > 1990)) {
        dis = dis + 361955;
        k = 1990;
      }
      if ((k === 1250) && (ppp2 > 1990)) {
        dis = dis + 270644;
        k = 1990;
      }
      if ((k === 1500) && (ppp2 > 1990)) {
        dis = dis + 179334;
        k = 1990;
      }
      if ((k === 1750) && (ppp2 > 1990)) {
        dis = dis + 88023;
        k = 1990;
      }

      dis = dis + disptimeday(k, 12, 31);
    }
    dis = dis + p2;
    dis = dis * pr;
  }
  return dis;
}

/**
 * 특정 시점에서 특정 시점까지의 분
 */
function getminbytime(uy: number, umm: number, ud: number, uh: number, umin: number,
  y1: number, mo1: number, d1: number, h1: number, mm1: number): number {
  const dispday = disp2days(uy, umm, ud, y1, mo1, d1);
  const t = dispday * 24 * 60 + (uh - h1) * 60 + (umin - mm1);
  return t;
}

/**
 * 1996년 2월 4일 22시 8분부터 tmin분 떨어진 날짜와 시간을 구하는 함수
 */
function getdatebymin(tmin: number, uyear: number, umonth: number, uday: number,
  uhour: number, umin: number): [number, number, number, number, number] {
  let y1, mo1, d1, h1, mi1, t: number;

  y1 = uyear - div(tmin, 525949);
  if (tmin > 0) {
    y1 = y1 + 2;
    do {
      y1 = y1 - 1;
      t = getminbytime(uyear, umonth, uday, uhour, umin, y1, 1, 1, 0, 0);
    } while (t < tmin);

    mo1 = 13;
    do {
      mo1 = mo1 - 1;
      t = getminbytime(uyear, umonth, uday, uhour, umin, y1, mo1, 1, 0, 0);
    } while (t < tmin);

    d1 = 32;
    do {
      d1 = d1 - 1;
      t = getminbytime(uyear, umonth, uday, uhour, umin, y1, mo1, d1, 0, 0);
    } while (t < tmin);

    h1 = 24;
    do {
      h1 = h1 - 1;
      t = getminbytime(uyear, umonth, uday, uhour, umin, y1, mo1, d1, h1, 0);
    } while (t < tmin);

    t = getminbytime(uyear, umonth, uday, uhour, umin, y1, mo1, d1, h1, 0);
    mi1 = t - tmin;
  } else {
    y1 = y1 - 2;
    do {
      y1 = y1 + 1;
      t = getminbytime(uyear, umonth, uday, uhour, umin, y1, 1, 1, 0, 0);
    } while (t >= tmin);
    y1 = y1 - 1;

    mo1 = 0;
    do {
      mo1 = mo1 + 1;
      t = getminbytime(uyear, umonth, uday, uhour, umin, y1, mo1, 1, 0, 0);
    } while (t >= tmin);
    mo1 = mo1 - 1;

    d1 = 0;
    do {
      d1 = d1 + 1;
      t = getminbytime(uyear, umonth, uday, uhour, umin, y1, mo1, d1, 0, 0);
    } while (t >= tmin);
    d1 = d1 - 1;

    h1 = -1;
    do {
      h1 = h1 + 1;
      t = getminbytime(uyear, umonth, uday, uhour, umin, y1, mo1, d1, h1, 0);
    } while (t >= tmin);
    h1 = h1 - 1;

    t = getminbytime(uyear, umonth, uday, uhour, umin, y1, mo1, d1, h1, 0);
    mi1 = t - tmin;
  }

  return [y1, mo1, d1, h1, mi1];
}

/**
 * 각도를 0-360 범위로 정규화
 */
function degreelow(d: number): number {
  let di = d;
  const i = Math.floor(di / 360);
  di = di - (i * 360);

  while (di >= 360 || di < 0) {
    if (di > 0) {
      di = di - 360;
    } else {
      di = di + 360;
    }
  }
  return di;
}

/**
 * 달과 태양의 각도 차이 계산
 */
function moonsundegree(day: number): number {
  const sl = day * 0.98564736 + 278.956807;
  const smin = 282.869498 + 0.00004708 * day;
  const sminangle = Math.PI * (sl - smin) / 180;
  const sd = 1.919 * Math.sin(sminangle) + 0.02 * Math.sin(2 * sminangle);
  const sreal = degreelow(sl + sd);

  const ml = 27.836584 + 13.17639648 * day;
  const mmin = 280.425774 + 0.11140356 * day;
  const mminangle = Math.PI * (ml - mmin) / 180;
  const msangle = 202.489407 - 0.05295377 * day;
  const msdangle = Math.PI * (ml - msangle) / 180;
  const md = 5.06889 * Math.sin(mminangle) + 0.146111 * Math.sin(2 * mminangle) + 0.01 * Math.sin(3 * mminangle)
    - 0.238056 * Math.sin(sminangle) - 0.087778 * Math.sin(mminangle + sminangle)
    + 0.048889 * Math.sin(mminangle - sminangle) - 0.129722 * Math.sin(2 * msdangle)
    - 0.011111 * Math.sin(2 * msdangle - mminangle) - 0.012778 * Math.sin(2 * msdangle + mminangle);
  const mreal = degreelow(ml + md);
  const re = degreelow(mreal - sreal);
  return re;
}

/**
 * 음력 초하루 구하기
 */
function getlunarfirst(syear: number, smonth: number, sday: number): {
  year: number, month: number, day: number, hour: number, min: number,
  year1: number, month1: number, day1: number, hour1: number, min1: number,
  year2: number, month2: number, day2: number, hour2: number, min2: number
} {
  let d: number, de: number, pd: number;
  let year: number, month: number, day: number, hour: number, min: number;
  let year1: number, month1: number, day1: number, hour1: number, min1: number;
  let year2: number, month2: number, day2: number, hour2: number, min2: number;

  const dm = disp2days(syear, smonth, sday, 1995, 12, 31);
  const dem = moonsundegree(dm);

  d = dm;
  de = dem;

  while (de > 13.5) {
    d = d - 1;
    de = moonsundegree(d);
  }

  while (de > 1) {
    d = d - 0.04166666666;
    de = moonsundegree(d);
  }

  while (de < 359.99) {
    d = d - 0.000694444;
    de = moonsundegree(d);
  }

  d = d + 0.375;
  d = d * 1440;
  let i = -1 * Math.floor(d);
  [year, month, day, hour, min] = getdatebymin(i, 1995, 12, 31, 0, 0);

  d = dm;
  de = dem;

  while (de < 346.5) {
    d = d + 1;
    de = moonsundegree(d);
  }

  while (de < 359) {
    d = d + 0.04166666666;
    de = moonsundegree(d);
  }

  while (de > 0.01) {
    d = d + 0.000694444;
    de = moonsundegree(d);
  }

  pd = d;
  d = d + 0.375;
  d = d * 1440;
  i = -1 * Math.floor(d);
  [year2, month2, day2, hour2, min2] = getdatebymin(i, 1995, 12, 31, 0, 0);

  if ((smonth === month2) && (sday === day2)) {
    year = year2;
    month = month2;
    day = day2;
    hour = hour2;
    min = min2;

    d = pd + 26;
    de = moonsundegree(d);

    while (de < 346.5) {
      d = d + 1;
      de = moonsundegree(d);
    }

    while (de < 359) {
      d = d + 0.04166666666;
      de = moonsundegree(d);
    }

    while (de > 0.01) {
      d = d + 0.000694444;
      de = moonsundegree(d);
    }

    d = d + 0.375;
    d = d * 1440;
    i = -1 * Math.floor(d);
    [year2, month2, day2, hour2, min2] = getdatebymin(i, 1995, 12, 31, 0, 0);
  }

  d = disp2days(year, month, day, 1995, 12, 31);
  d = d + 12;

  de = moonsundegree(d);
  while (de < 166.5) {
    d = d + 1;
    de = moonsundegree(d);
  }
  while (de < 179) {
    d = d + 0.04166666666;
    de = moonsundegree(d);
  }
  while (de < 179.999) {
    d = d + 0.000694444;
    de = moonsundegree(d);
  }

  d = d + 0.375;
  d = d * 1440;
  i = -1 * Math.floor(d);
  [year1, month1, day1, hour1, min1] = getdatebymin(i, 1995, 12, 31, 0, 0);

  return {
    year, month, day, hour, min,
    year1, month1, day1, hour1, min1,
    year2, month2, day2, hour2, min2
  };
}

/**
 * 양력을 사주 간지로 변환
 */
function sydtoso24yd(soloryear: number, solormonth: number, solorday: number,
  solorhour: number, solormin: number): {
    so24: number, so24year: number, so24month: number, so24day: number, so24hour: number
  } {
  const displ2min = getminbytime(unityear, unitmonth, unitday, unithour, unitmin,
    soloryear, solormonth, solorday, solorhour, solormin);
  const displ2day = disp2days(unityear, unitmonth, unitday, soloryear, solormonth, solorday);

  let so24 = div(displ2min, 525949);

  if (displ2min >= 0) { so24 = so24 + 1; }
  
  let so24year = -1 * (so24 % 60);
  so24year = so24year + 56;  // uysu(경신년) = 56
  if (so24year < 0) { so24year = so24year + 60; }
  if (so24year > 59) { so24year = so24year - 60; }

  let monthmin100 = displ2min % 525949;
  monthmin100 = 525949 - monthmin100;

  if (monthmin100 < 0) { monthmin100 = monthmin100 + 525949; }
  if (monthmin100 >= 525949) { monthmin100 = monthmin100 - 525949; }

  let so24month = 0;
  for (let i = 0; i <= 11; i++) {
    const j = i * 2;
    if ((montharray[j] <= monthmin100) && (monthmin100 < montharray[j + 2])) {
      so24month = i;
    }
  }

  const i = so24month;
  let t = so24year % 10;
  t = t % 5;
  t = t * 12 + 2 + i;
  so24month = t;
  if (so24month > 59) { so24month = so24month - 60; }

  let so24day = displ2day % 60;

  so24day = -1 * so24day;
  so24day = so24day + 13;  // udsu(정축일) = 13
  if (so24day < 0) { so24day = so24day + 60; }
  if (so24day > 59) { so24day = so24day - 60; }

  let timeIndex = 0;
  if (((solorhour === 0) || (solorhour === 1)) && (solormin < 30)) {
    timeIndex = 0;
  } else if (((solorhour === 1) && (solormin >= 30)) || (solorhour === 2) ||
    ((solorhour === 3) && (solormin < 30))) {
    timeIndex = 1;
  } else if (((solorhour === 3) && (solormin >= 30)) || (solorhour === 4) ||
    ((solorhour === 5) && (solormin < 30))) {
    timeIndex = 2;
  } else if (((solorhour === 5) && (solormin >= 30)) || (solorhour === 6) ||
    ((solorhour === 7) && (solormin < 30))) {
    timeIndex = 3;
  } else if (((solorhour === 7) && (solormin >= 30)) || (solorhour === 8) ||
    ((solorhour === 9) && (solormin < 30))) {
    timeIndex = 4;
  } else if (((solorhour === 9) && (solormin >= 30)) || (solorhour === 10) ||
    ((solorhour === 11) && (solormin < 30))) {
    timeIndex = 5;
  } else if (((solorhour === 11) && (solormin >= 30)) || (solorhour === 12) ||
    ((solorhour === 13) && (solormin < 30))) {
    timeIndex = 6;
  } else if (((solorhour === 13) && (solormin >= 30)) || (solorhour === 14) ||
    ((solorhour === 15) && (solormin < 30))) {
    timeIndex = 7;
  } else if (((solorhour === 15) && (solormin >= 30)) || (solorhour === 16) ||
    ((solorhour === 17) && (solormin < 30))) {
    timeIndex = 8;
  } else if (((solorhour === 17) && (solormin >= 30)) || (solorhour === 18) ||
    ((solorhour === 19) && (solormin < 30))) {
    timeIndex = 9;
  } else if (((solorhour === 19) && (solormin >= 30)) || (solorhour === 20) ||
    ((solorhour === 21) && (solormin < 30))) {
    timeIndex = 10;
  } else if (((solorhour === 21) && (solormin >= 30)) || (solorhour === 22) ||
    ((solorhour === 23) && (solormin < 30))) {
    timeIndex = 11;
  }

  if ((solorhour === 23) && (solormin >= 30)) {
    so24day = so24day + 1;
    if (so24day === 60) { so24day = 0; }
    timeIndex = 0;
  }

  t = so24day % 10;
  t = t % 5;
  t = t * 12 + timeIndex;
  const so24hour = t;

  return { so24, so24year, so24month, so24day, so24hour };
}

/**
 * 절기 시간 구하기
 */
function solortoso24(soloryear: number, solormonth: number, solorday: number,
  solorhour: number, solormin: number): {
    inginame: number, ingiyear: number, ingimonth: number, ingiday: number, ingihour: number, ingimin: number,
    midname: number, midyear: number, midmonth: number, midday: number, midhour: number, midmin: number,
    outginame: number, outgiyear: number, outgimonth: number, outgiday: number, outgihour: number, outgimin: number
  } {
  const { so24, so24year, so24month, so24day, so24hour } =
    sydtoso24yd(soloryear, solormonth, solorday, solorhour, solormin);

  const displ2min = getminbytime(unityear, unitmonth, unitday, unithour, unitmin,
    soloryear, solormonth, solorday, solorhour, solormin);

  let monthmin100 = displ2min % 525949;
  monthmin100 = 525949 - monthmin100;
  if (monthmin100 < 0) { monthmin100 = monthmin100 + 525949; }
  if (monthmin100 >= 525949) { monthmin100 = monthmin100 - 525949; }

  let i = so24month % 12 - 2;
  if (i === -2) { i = 10; }
  if (i === -1) { i = 11; }

  const inginame = i * 2;
  const midname = i * 2 + 1;
  const outginame = i * 2 + 2;

  const j = i * 2;
  let tmin = displ2min + (monthmin100 - montharray[j]);

  let [y1, mo1, d1, h1, mi1] = getdatebymin(tmin, unityear, unitmonth, unitday, unithour, unitmin);

  const ingiyear = y1;
  const ingimonth = mo1;
  const ingiday = d1;
  const ingihour = h1;
  const ingimin = mi1;

  tmin = displ2min + (monthmin100 - montharray[j + 1]);
  [y1, mo1, d1, h1, mi1] = getdatebymin(tmin, unityear, unitmonth, unitday, unithour, unitmin);

  const midyear = y1;
  const midmonth = mo1;
  const midday = d1;
  const midhour = h1;
  const midmin = mi1;

  tmin = displ2min + (monthmin100 - montharray[j + 2]);
  [y1, mo1, d1, h1, mi1] = getdatebymin(tmin, unityear, unitmonth, unitday, unithour, unitmin);

  const outgiyear = y1;
  const outgimonth = mo1;
  const outgiday = d1;
  const outgihour = h1;
  const outgimin = mi1;

  return {
    inginame, ingiyear, ingimonth, ingiday, ingihour, ingimin,
    midname, midyear, midmonth, midday, midhour, midmin,
    outginame, outgiyear, outgimonth, outgiday, outgihour, outgimin
  };
}

/**
 * 양력을 음력으로 변환
 */
function solortolunar(solyear: number, solmon: number, solday: number): {
  lyear: number, lmonth: number, lday: number, lmoonyun: number, largemonth: number
} {
  const lunarFirst = getlunarfirst(solyear, solmon, solday);

  const smoyear = lunarFirst.year;
  const smomonth = lunarFirst.month;
  const smoday = lunarFirst.day;
  const smohour = lunarFirst.hour;
  const smomin = lunarFirst.min;

  const y0 = lunarFirst.year1;
  const mo0 = lunarFirst.month1;
  const d0 = lunarFirst.day1;

  const y1 = lunarFirst.year2;
  const mo1 = lunarFirst.month2;
  const d1 = lunarFirst.day2;

  const lday = disp2days(solyear, solmon, solday, smoyear, smomonth, smoday) + 1;

  const dayDiff = Math.abs(disp2days(smoyear, smomonth, smoday, y1, mo1, d1));
  let largemonth = 0;
  if (dayDiff === 30) { largemonth = 1; } // 대월
  if (dayDiff === 29) { largemonth = 0; } // 소월

  const solarTerm = solortoso24(smoyear, smomonth, smoday, smohour, smomin);

  const midname1 = solarTerm.midname;
  const midyear1 = solarTerm.midyear;
  const midmonth1 = solarTerm.midmonth;
  const midday1 = solarTerm.midday;
  const midhour1 = solarTerm.midhour;
  const midmin1 = solarTerm.midmin;

  let midname2 = midname1 + 2;
  if (midname2 > 24) { midname2 = 1; }

  let s0 = montharray[midname2] - montharray[midname1];
  if (s0 < 0) { s0 = s0 + 525949; }
  s0 = -1 * s0;

  const [midyear2, midmonth2, midday2] = getdatebymin(s0, midyear1, midmonth1, midday1, midhour1, midmin1);

  let lmonth: number;
  let lmoonyun = 0;

  if (((midmonth1 === smomonth) && (midday1 >= smoday)) || ((midmonth1 === mo1) && (midday1 < d1))) {
    lmonth = (midname1 - 1) / 2 + 1;
    lmoonyun = 0;
  } else {
    if (((midmonth2 === mo1) && (midday2 < d1)) || ((midmonth2 === smomonth) && (midday2 >= smoday))) {
      lmonth = (midname2 - 1) / 2 + 1;
      lmoonyun = 0;
    } else {
      if ((smomonth < midmonth2) && (midmonth2 < mo1)) {
        lmonth = (midname2 - 1) / 2 + 1;
        lmoonyun = 0;
      } else {
        lmonth = (midname1 - 1) / 2 + 1;
        lmoonyun = 1;
      }
    }
  }

  let lyear = smoyear;
  if ((lmonth === 12) && (smomonth === 1)) { lyear = lyear - 1; }

  if (((lmonth === 11) && (lmoonyun === 1)) || (lmonth === 12) || (lmonth < 6)) {
    const [midyear1_new, midmonth1_new, midday1_new] =
      getdatebymin(2880, smoyear, smomonth, smoday, smohour, smomin);

    const lunarCheck = solortolunar(midyear1_new, midmonth1_new, midday1_new);

    let outgiday = lmonth - 1;
    if (outgiday === 0) { outgiday = 12; }

    if (outgiday === lunarCheck.lmonth) {
      if (lmoonyun === 1) { lmoonyun = 0; }
    } else {
      if (lmoonyun === 1) {
        if (lmonth !== lunarCheck.lmonth) {
          lmonth = lmonth - 1;
          if (lmonth === 0) {
            lyear = lyear - 1;
            lmonth = 12;
          }
          lmoonyun = 0;
        }
      } else {
        if (lmonth === lunarCheck.lmonth) {
          lmoonyun = 1;
        } else {
          lmonth = lmonth - 1;
          if (lmonth === 0) {
            lyear = lyear - 1;
            lmonth = 12;
          }
        }
      }
    }
  }

  return { lyear, lmonth, lday, lmoonyun, largemonth };
}

/**
 * 음력을 양력으로 변환
 */
function lunartosolar(lyear: number, lmonth: number, lday: number, moonyun: number): {
  syear: number, smonth: number, sday: number
} {
  const solarTerm = solortoso24(lyear, 2, 15, 0, 0);

  const midname = lmonth * 2 - 1;
  const tmin = -1 * montharray[midname];
  const [midyear, midmonth, midday, midhour, midmin] =
    getdatebymin(tmin, solarTerm.ingiyear, solarTerm.ingimonth, solarTerm.ingiday,
      solarTerm.ingihour, solarTerm.ingimin);

  const lunarFirst = getlunarfirst(midyear, midmonth, midday);

  const outgiyear = lunarFirst.year;
  const outgimonth = lunarFirst.month;
  const outgiday = lunarFirst.day;

  const year1 = lunarFirst.year2;
  const month1 = lunarFirst.month2;
  const day1 = lunarFirst.day2;

  const lunar2 = solortolunar(outgiyear, outgimonth, outgiday);

  let syear = outgiyear;
  let smonth = outgimonth;
  let sday = outgiday;

  if ((lunar2.lyear === lyear) && (lmonth === lunar2.lmonth)) {
    const tmin2 = -1440 * lday + 10;
    [syear, smonth, sday] = getdatebymin(tmin2, outgiyear, outgimonth, outgiday, 0, 0);

    if (moonyun === 1) {
      const lunar3 = solortolunar(year1, month1, day1);
      if ((lunar3.lyear === lyear) && (lmonth === lunar3.lmonth)) {
        [syear, smonth, sday] = getdatebymin(tmin2, year1, month1, day1, 0, 0);
      }
    }
  } else {
    const lunar3 = solortolunar(year1, month1, day1);
    if ((lunar3.lyear === lyear) && (lmonth === lunar3.lmonth)) {
      const tmin2 = -1440 * lday + 10;
      [syear, smonth, sday] = getdatebymin(tmin2, year1, month1, day1, 0, 0);
    }
  }

  return { syear, smonth, sday };
}

/**
 * 요일 구하기
 */
function getweekday(syear: number, smonth: number, sday: number): number {
  let d = disp2days(syear, smonth, sday, unityear, unitmonth, unitday);

  const i = div(d, 7);
  d = d - (i * 7);

  while ((d > 6) || (d < 0)) {
    if (d > 6) { d = d - 7; } else { d = d + 7; }
  }
  if (d < 0) { d = d + 7; }
  return d;
}

/**
 * 28수 구하기
 */
function get28sday(syear: number, smonth: number, sday: number): number {
  let d = disp2days(syear, smonth, sday, unityear, unitmonth, unitday);

  const i = div(d, 28);
  d = d - (i * 28);

  while ((d > 27) || (d < 0)) {
    if (d > 27) { d = d - 28; } else { d = d + 28; }
  }
  if (d < 0) { d = d + 7; }
  d = d - 11;
  if (d < 0) { d = d + 28; }
  return d;
}

/**
 * 메인 계산 함수
 * 개인 정보를 받아서 사주 명식 계산 결과를 반환합니다.
 */
export function calculatePersonData(person: Person): CalculationResult {
  console.log('계산 시작:', person.name);

  try {
    // 생년월일 파싱
    const birthDate = new Date(person.birthDate);
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    // 태어난 시간 파싱 (시간이 없으면 12:00으로 기본 설정)
    let hour = 12;
    let minute = 0;
    if (person.birthTime) {
      const [h, m] = person.birthTime.split(':').map(Number);
      hour = h;
      minute = m;
    }

    // 양력을 음력으로 변환
    const lunarData = solortolunar(year, month, day);

    // 절기 정보
    const solarTermData = solortoso24(year, month, day, hour, minute);

    // 사주 간지 계산
    const sajuData = sydtoso24yd(year, month, day, hour, minute);

    // 요일
    const weekdayIndex = getweekday(year, month, day);

    // 28수
    const s28Index = get28sday(year, month, day);

    // 음력 문자열 생성
    const lunarStr = `${lunarData.lyear}년 ${lunarData.lmoonyun === 1 ? '윤' : ''}${lunarData.lmonth}월 ${lunarData.lday}일 (${lunarData.largemonth === 1 ? '대월' : '소월'})`;

    // 절기 문자열
    const solarTermStr = monthst[solarTermData.inginame] + ' ~ ' + monthst[solarTermData.outginame];

    const result: CalculationResult = {
      personId: person.id,
      solarCalendar: `${year}년 ${month}월 ${day}일 ${weekday[weekdayIndex]}`,
      lunarCalendar: lunarStr,
      solarTerm: solarTermStr,
      calculatedData: {
        year: ganji[sajuData.so24year],      // 년주
        month: ganji[sajuData.so24month],    // 월주
        day: ganji[sajuData.so24day],        // 일주
        time: person.birthTime ? ganji[sajuData.so24hour] : '시간 미입력',  // 시주
        yearGan: gan[sajuData.so24year % 10],     // 년 천간
        yearJi: ji[sajuData.so24year % 12],       // 년 지지
        monthGan: gan[sajuData.so24month % 10],   // 월 천간
        monthJi: ji[sajuData.so24month % 12],     // 월 지지
        dayGan: gan[sajuData.so24day % 10],       // 일 천간
        dayJi: ji[sajuData.so24day % 12],         // 일 지지
        timeGan: person.birthTime ? gan[sajuData.so24hour % 10] : '-',   // 시 천간
        timeJi: person.birthTime ? ji[sajuData.so24hour % 12] : '-',     // 시 지지
        weekday: weekday[weekdayIndex],
        s28day: s28day[s28Index],
        solarTermDetail: {
          ingi: monthst[solarTermData.inginame],
          ingiDate: `${solarTermData.ingiyear}.${solarTermData.ingimonth}.${solarTermData.ingiday} ${solarTermData.ingihour}:${String(solarTermData.ingimin).padStart(2, '0')}`,
          mid: monthst[solarTermData.midname],
          midDate: `${solarTermData.midyear}.${solarTermData.midmonth}.${solarTermData.midday} ${solarTermData.midhour}:${String(solarTermData.midmin).padStart(2, '0')}`,
          outgi: monthst[solarTermData.outginame],
          outgiDate: `${solarTermData.outgiyear}.${solarTermData.outgimonth}.${solarTermData.outgiday} ${solarTermData.outgihour}:${String(solarTermData.outgimin).padStart(2, '0')}`,
        }
      },
      calculatedAt: new Date().toISOString(),
    };

    console.log('계산 완료:', result);
    return result;
  } catch (error) {
    console.error('계산 오류:', error);
    // 오류 발생 시 기본 결과 반환
    return {
      personId: person.id,
      solarCalendar: person.birthDate,
      lunarCalendar: '계산 오류',
      solarTerm: '계산 오류',
      calculatedData: {
        year: '오류',
        month: '오류',
        day: '오류',
        time: '오류',
      },
      calculatedAt: new Date().toISOString(),
    };
  }
}

/**
 * 계산 모듈 버전 정보
 */
export const CALCULATION_MODULE_VERSION = '2.0.0';

// 함수들을 export하여 다른 모듈에서 사용 가능하게 함
export { solortolunar, lunartosolar, sydtoso24yd, solortoso24, ganji, gan, ji, monthst };