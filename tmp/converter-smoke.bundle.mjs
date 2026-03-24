// src/utils/calculationModule.ts
var montharray = [
  0,
  21355,
  42843,
  64498,
  86335,
  108366,
  130578,
  152958,
  175471,
  198077,
  220728,
  243370,
  265955,
  288432,
  310767,
  332928,
  354903,
  376685,
  398290,
  419736,
  441060,
  462295,
  483493,
  504693,
  525949
];
var ganji = [
  "\u7532\u5B50",
  "\u4E59\u4E11",
  "\u4E19\u5BC5",
  "\u4E01\u536F",
  "\u620A\u8FB0",
  "\u5DF1\u5DF3",
  "\u5E9A\u5348",
  "\u8F9B\u672A",
  "\u58EC\u7533",
  "\u7678\u9149",
  "\u7532\u620C",
  "\u4E59\u4EA5",
  "\u4E19\u5B50",
  "\u4E01\u4E11",
  "\u620A\u5BC5",
  "\u5DF1\u536F",
  "\u5E9A\u8FB0",
  "\u8F9B\u5DF3",
  "\u58EC\u5348",
  "\u7678\u672A",
  "\u7532\u7533",
  "\u4E59\u9149",
  "\u4E19\u620C",
  "\u4E01\u4EA5",
  "\u620A\u5B50",
  "\u5DF1\u4E11",
  "\u5E9A\u5BC5",
  "\u8F9B\u536F",
  "\u58EC\u8FB0",
  "\u7678\u5DF3",
  "\u7532\u5348",
  "\u4E59\u672A",
  "\u4E19\u7533",
  "\u4E01\u9149",
  "\u620A\u620C",
  "\u5DF1\u4EA5",
  "\u5E9A\u5B50",
  "\u8F9B\u4E11",
  "\u58EC\u5BC5",
  "\u7678\u536F",
  "\u7532\u8FB0",
  "\u4E59\u5DF3",
  "\u4E19\u5348",
  "\u4E01\u672A",
  "\u620A\u7533",
  "\u5DF1\u9149",
  "\u5E9A\u620C",
  "\u8F9B\u4EA5",
  "\u58EC\u5B50",
  "\u7678\u4E11",
  "\u7532\u5BC5",
  "\u4E59\u536F",
  "\u4E19\u8FB0",
  "\u4E01\u5DF3",
  "\u620A\u5348",
  "\u5DF1\u672A",
  "\u5E9A\u7533",
  "\u8F9B\u9149",
  "\u58EC\u620C",
  "\u7678\u4EA5"
];
var unityear = 2100;
var unitmonth = 2;
var unitday = 4;
var unithour = 3;
var unitmin = 4;
function div(a, b) {
  return Math.floor(a / b);
}
function disptimeday(year, month, day) {
  let e = 0;
  for (let i = 1; i < month; i++) {
    e = e + 31;
    if (i === 2 || i === 4 || i === 6 || i === 9 || i === 11) {
      e--;
    }
    if (i === 2) {
      e = e - 2;
      if (year % 4 === 0) {
        e++;
      }
      if (year % 100 === 0) {
        e--;
      }
      if (year % 400 === 0) {
        e++;
      }
      if (year % 4e3 === 0) {
        e--;
      }
    }
  }
  e = e + day;
  return e;
}
function disp2days(y1, m1, d1, y2, m2, d2) {
  let p2, p1, p1n, pp1, pp2, pr, dis;
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
      if (k === -2e3 && ppp2 > 1990) {
        dis = dis + 1457682;
        k = 1990;
      }
      if (k === -1750 && ppp2 > 1990) {
        dis = dis + 1366371;
        k = 1990;
      }
      if (k === -1500 && ppp2 > 1990) {
        dis = dis + 1275060;
        k = 1990;
      }
      if (k === -1250 && ppp2 > 1990) {
        dis = dis + 1183750;
        k = 1990;
      }
      if (k === -1e3 && ppp2 > 1990) {
        dis = dis + 1092439;
        k = 1990;
      }
      if (k === -750 && ppp2 > 1990) {
        dis = dis + 1001128;
        k = 1990;
      }
      if (k === -500 && ppp2 > 1990) {
        dis = dis + 909818;
        k = 1990;
      }
      if (k === -250 && ppp2 > 1990) {
        dis = dis + 818507;
        k = 1990;
      }
      if (k === 0 && ppp2 > 1990) {
        dis = dis + 727197;
        k = 1990;
      }
      if (k === 250 && ppp2 > 1990) {
        dis = dis + 635887;
        k = 1990;
      }
      if (k === 500 && ppp2 > 1990) {
        dis = dis + 544576;
        k = 1990;
      }
      if (k === 750 && ppp2 > 1990) {
        dis = dis + 453266;
        k = 1990;
      }
      if (k === 1e3 && ppp2 > 1990) {
        dis = dis + 361955;
        k = 1990;
      }
      if (k === 1250 && ppp2 > 1990) {
        dis = dis + 270644;
        k = 1990;
      }
      if (k === 1500 && ppp2 > 1990) {
        dis = dis + 179334;
        k = 1990;
      }
      if (k === 1750 && ppp2 > 1990) {
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
function getminbytime(uy, umm, ud, uh, umin, y1, mo1, d1, h1, mm1) {
  const dispday = disp2days(uy, umm, ud, y1, mo1, d1);
  const t = dispday * 24 * 60 + (uh - h1) * 60 + (umin - mm1);
  return t;
}
function getdatebymin(tmin, uyear, umonth, uday, uhour, umin) {
  let y1, mo1, d1, h1, mi1, t;
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
function degreelow(d) {
  let di = d;
  const i = Math.floor(di / 360);
  di = di - i * 360;
  while (di >= 360 || di < 0) {
    if (di > 0) {
      di = di - 360;
    } else {
      di = di + 360;
    }
  }
  return di;
}
function moonsundegree(day) {
  const sl = day * 0.98564736 + 278.956807;
  const smin = 282.869498 + 4708e-8 * day;
  const sminangle = Math.PI * (sl - smin) / 180;
  const sd = 1.919 * Math.sin(sminangle) + 0.02 * Math.sin(2 * sminangle);
  const sreal = degreelow(sl + sd);
  const ml = 27.836584 + 13.17639648 * day;
  const mmin = 280.425774 + 0.11140356 * day;
  const mminangle = Math.PI * (ml - mmin) / 180;
  const msangle = 202.489407 - 0.05295377 * day;
  const msdangle = Math.PI * (ml - msangle) / 180;
  const md = 5.06889 * Math.sin(mminangle) + 0.146111 * Math.sin(2 * mminangle) + 0.01 * Math.sin(3 * mminangle) - 0.238056 * Math.sin(sminangle) - 0.087778 * Math.sin(mminangle + sminangle) + 0.048889 * Math.sin(mminangle - sminangle) - 0.129722 * Math.sin(2 * msdangle) - 0.011111 * Math.sin(2 * msdangle - mminangle) - 0.012778 * Math.sin(2 * msdangle + mminangle);
  const mreal = degreelow(ml + md);
  const re = degreelow(mreal - sreal);
  return re;
}
function getlunarfirst(syear, smonth, sday) {
  let d, de, pd;
  let year, month, day, hour, min;
  let year1, month1, day1, hour1, min1;
  let year2, month2, day2, hour2, min2;
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
    d = d - 694444e-9;
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
    d = d + 694444e-9;
    de = moonsundegree(d);
  }
  pd = d;
  d = d + 0.375;
  d = d * 1440;
  i = -1 * Math.floor(d);
  [year2, month2, day2, hour2, min2] = getdatebymin(i, 1995, 12, 31, 0, 0);
  if (smonth === month2 && sday === day2) {
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
      d = d + 694444e-9;
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
    d = d + 694444e-9;
    de = moonsundegree(d);
  }
  d = d + 0.375;
  d = d * 1440;
  i = -1 * Math.floor(d);
  [year1, month1, day1, hour1, min1] = getdatebymin(i, 1995, 12, 31, 0, 0);
  return {
    year,
    month,
    day,
    hour,
    min,
    year1,
    month1,
    day1,
    hour1,
    min1,
    year2,
    month2,
    day2,
    hour2,
    min2
  };
}
function sydtoso24yd(soloryear, solormonth, solorday, solorhour, solormin) {
  const displ2min = getminbytime(
    unityear,
    unitmonth,
    unitday,
    unithour,
    unitmin,
    soloryear,
    solormonth,
    solorday,
    solorhour,
    solormin
  );
  const displ2day = disp2days(unityear, unitmonth, unitday, soloryear, solormonth, solorday);
  let so24 = div(displ2min, 525949);
  if (displ2min >= 0) {
    so24 = so24 + 1;
  }
  let so24year = -1 * (so24 % 60);
  so24year = so24year + 56;
  if (so24year < 0) {
    so24year = so24year + 60;
  }
  if (so24year > 59) {
    so24year = so24year - 60;
  }
  let monthmin100 = displ2min % 525949;
  monthmin100 = 525949 - monthmin100;
  if (monthmin100 < 0) {
    monthmin100 = monthmin100 + 525949;
  }
  if (monthmin100 >= 525949) {
    monthmin100 = monthmin100 - 525949;
  }
  let so24month = 0;
  for (let i2 = 0; i2 <= 11; i2++) {
    const j = i2 * 2;
    if (montharray[j] <= monthmin100 && monthmin100 < montharray[j + 2]) {
      so24month = i2;
    }
  }
  const i = so24month;
  let t = so24year % 10;
  t = t % 5;
  t = t * 12 + 2 + i;
  so24month = t;
  if (so24month > 59) {
    so24month = so24month - 60;
  }
  let so24day = displ2day % 60;
  so24day = -1 * so24day;
  so24day = so24day + 13;
  if (so24day < 0) {
    so24day = so24day + 60;
  }
  if (so24day > 59) {
    so24day = so24day - 60;
  }
  let timeIndex = 0;
  if ((solorhour === 0 || solorhour === 1) && solormin < 30) {
    timeIndex = 0;
  } else if (solorhour === 1 && solormin >= 30 || solorhour === 2 || solorhour === 3 && solormin < 30) {
    timeIndex = 1;
  } else if (solorhour === 3 && solormin >= 30 || solorhour === 4 || solorhour === 5 && solormin < 30) {
    timeIndex = 2;
  } else if (solorhour === 5 && solormin >= 30 || solorhour === 6 || solorhour === 7 && solormin < 30) {
    timeIndex = 3;
  } else if (solorhour === 7 && solormin >= 30 || solorhour === 8 || solorhour === 9 && solormin < 30) {
    timeIndex = 4;
  } else if (solorhour === 9 && solormin >= 30 || solorhour === 10 || solorhour === 11 && solormin < 30) {
    timeIndex = 5;
  } else if (solorhour === 11 && solormin >= 30 || solorhour === 12 || solorhour === 13 && solormin < 30) {
    timeIndex = 6;
  } else if (solorhour === 13 && solormin >= 30 || solorhour === 14 || solorhour === 15 && solormin < 30) {
    timeIndex = 7;
  } else if (solorhour === 15 && solormin >= 30 || solorhour === 16 || solorhour === 17 && solormin < 30) {
    timeIndex = 8;
  } else if (solorhour === 17 && solormin >= 30 || solorhour === 18 || solorhour === 19 && solormin < 30) {
    timeIndex = 9;
  } else if (solorhour === 19 && solormin >= 30 || solorhour === 20 || solorhour === 21 && solormin < 30) {
    timeIndex = 10;
  } else if (solorhour === 21 && solormin >= 30 || solorhour === 22 || solorhour === 23 && solormin < 30) {
    timeIndex = 11;
  }
  if (solorhour === 23 && solormin >= 30) {
    so24day = so24day + 1;
    if (so24day === 60) {
      so24day = 0;
    }
    timeIndex = 0;
  }
  t = so24day % 10;
  t = t % 5;
  t = t * 12 + timeIndex;
  const so24hour = t;
  return { so24, so24year, so24month, so24day, so24hour };
}
function solortoso24(soloryear, solormonth, solorday, solorhour, solormin) {
  const { so24, so24year, so24month, so24day, so24hour } = sydtoso24yd(soloryear, solormonth, solorday, solorhour, solormin);
  const displ2min = getminbytime(
    unityear,
    unitmonth,
    unitday,
    unithour,
    unitmin,
    soloryear,
    solormonth,
    solorday,
    solorhour,
    solormin
  );
  let monthmin100 = displ2min % 525949;
  monthmin100 = 525949 - monthmin100;
  if (monthmin100 < 0) {
    monthmin100 = monthmin100 + 525949;
  }
  if (monthmin100 >= 525949) {
    monthmin100 = monthmin100 - 525949;
  }
  let i = so24month % 12 - 2;
  if (i === -2) {
    i = 10;
  }
  if (i === -1) {
    i = 11;
  }
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
    inginame,
    ingiyear,
    ingimonth,
    ingiday,
    ingihour,
    ingimin,
    midname,
    midyear,
    midmonth,
    midday,
    midhour,
    midmin,
    outginame,
    outgiyear,
    outgimonth,
    outgiday,
    outgihour,
    outgimin
  };
}
function solortolunar(solyear, solmon, solday) {
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
  if (dayDiff === 30) {
    largemonth = 1;
  }
  if (dayDiff === 29) {
    largemonth = 0;
  }
  const solarTerm = solortoso24(smoyear, smomonth, smoday, smohour, smomin);
  const midname1 = solarTerm.midname;
  const midyear1 = solarTerm.midyear;
  const midmonth1 = solarTerm.midmonth;
  const midday1 = solarTerm.midday;
  const midhour1 = solarTerm.midhour;
  const midmin1 = solarTerm.midmin;
  let midname2 = midname1 + 2;
  if (midname2 > 24) {
    midname2 = 1;
  }
  let s0 = montharray[midname2] - montharray[midname1];
  if (s0 < 0) {
    s0 = s0 + 525949;
  }
  s0 = -1 * s0;
  const [midyear2, midmonth2, midday2] = getdatebymin(s0, midyear1, midmonth1, midday1, midhour1, midmin1);
  let lmonth;
  let lmoonyun = 0;
  if (midmonth1 === smomonth && midday1 >= smoday || midmonth1 === mo1 && midday1 < d1) {
    lmonth = (midname1 - 1) / 2 + 1;
    lmoonyun = 0;
  } else {
    if (midmonth2 === mo1 && midday2 < d1 || midmonth2 === smomonth && midday2 >= smoday) {
      lmonth = (midname2 - 1) / 2 + 1;
      lmoonyun = 0;
    } else {
      if (smomonth < midmonth2 && midmonth2 < mo1) {
        lmonth = (midname2 - 1) / 2 + 1;
        lmoonyun = 0;
      } else {
        lmonth = (midname1 - 1) / 2 + 1;
        lmoonyun = 1;
      }
    }
  }
  let lyear = smoyear;
  if (lmonth === 12 && smomonth === 1) {
    lyear = lyear - 1;
  }
  if (lmonth === 11 && lmoonyun === 1 || lmonth === 12 || lmonth < 6) {
    const [midyear1_new, midmonth1_new, midday1_new] = getdatebymin(2880, smoyear, smomonth, smoday, smohour, smomin);
    const lunarCheck = solortolunar(midyear1_new, midmonth1_new, midday1_new);
    let outgiday = lmonth - 1;
    if (outgiday === 0) {
      outgiday = 12;
    }
    if (outgiday === lunarCheck.lmonth) {
      if (lmoonyun === 1) {
        lmoonyun = 0;
      }
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
function lunartosolar(lyear, lmonth, lday, moonyun) {
  const solarTerm = solortoso24(lyear, 2, 15, 0, 0);
  const midname = lmonth * 2 - 1;
  const tmin = -1 * montharray[midname];
  const [midyear, midmonth, midday, midhour, midmin] = getdatebymin(
    tmin,
    solarTerm.ingiyear,
    solarTerm.ingimonth,
    solarTerm.ingiday,
    solarTerm.ingihour,
    solarTerm.ingimin
  );
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
  if (lunar2.lyear === lyear && lmonth === lunar2.lmonth) {
    const tmin2 = -1440 * lday + 10;
    [syear, smonth, sday] = getdatebymin(tmin2, outgiyear, outgimonth, outgiday, 0, 0);
    if (moonyun === 1) {
      const lunar3 = solortolunar(year1, month1, day1);
      if (lunar3.lyear === lyear && lmonth === lunar3.lmonth) {
        [syear, smonth, sday] = getdatebymin(tmin2, year1, month1, day1, 0, 0);
      }
    }
  } else {
    const lunar3 = solortolunar(year1, month1, day1);
    if (lunar3.lyear === lyear && lmonth === lunar3.lmonth) {
      const tmin2 = -1440 * lday + 10;
      [syear, smonth, sday] = getdatebymin(tmin2, year1, month1, day1, 0, 0);
    }
  }
  return { syear, smonth, sday };
}

// src/utils/dateCalculation.ts
function isValidDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
function tryLunarToSolar(year, month, day) {
  for (let d = day; d >= 1; d--) {
    try {
      const result = lunartosolar(year, month, d, 0);
      const verify = solortolunar(result.syear, result.smonth, result.sday);
      if (verify.lyear === year && verify.lmonth === month && verify.lday === d) {
        return { syear: result.syear, smonth: result.smonth, sday: result.sday };
      }
    } catch {
    }
  }
  return null;
}
function calculateAutoDates(baseYear, baseMonth, baseDay) {
  try {
    const dates = [];
    const errors = [];
    const base = { year: baseYear, month: baseMonth, day: baseDay };
    dates.push({ ...base, label: "\uBCF8\uC6D0" });
    const baseLunar = solortolunar(base.year, base.month, base.day);
    let minus1Success = false;
    let minus2Success = false;
    {
      const minus1 = {
        year: baseLunar.lyear,
        month: baseLunar.lmonth,
        day: baseLunar.lday,
        label: "\uBCF8\uC6D0-1"
      };
      if (!isValidDate(minus1.year, minus1.month, minus1.day)) {
        errors.push(`${minus1.year}\uB144 ${minus1.month}\uC6D4 ${minus1.day}\uC77C\uC740 \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uB0A0\uC9DC\uC785\uB2C8\uB2E4.`);
      } else if (minus1.year === base.year && minus1.month === base.month && minus1.day === base.day) {
        errors.push("\uBCF8\uC6D0\uACFC \uB3D9\uC77C\uD55C \uB0A0\uC9DC\uC785\uB2C8\uB2E4.");
      } else {
        dates.push(minus1);
        minus1Success = true;
        try {
          const minus1Lunar = solortolunar(minus1.year, minus1.month, minus1.day);
          const minus2 = {
            year: minus1Lunar.lyear,
            month: minus1Lunar.lmonth,
            day: minus1Lunar.lday,
            label: "\uBCF8\uC6D0-2"
          };
          if (!isValidDate(minus2.year, minus2.month, minus2.day)) {
            errors.push(`${minus2.year}\uB144 ${minus2.month}\uC6D4 ${minus2.day}\uC77C\uC740 \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uB0A0\uC9DC\uC785\uB2C8\uB2E4.`);
          } else if (dates.some((d) => d.year === minus2.year && d.month === minus2.month && d.day === minus2.day)) {
            errors.push("\uAE30\uC874 \uB0A0\uC9DC\uC640 \uC911\uBCF5\uB429\uB2C8\uB2E4.");
          } else {
            dates.push(minus2);
            minus2Success = true;
          }
        } catch (e) {
          errors.push("\uB0A0\uC9DC\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
        }
      }
    }
    let plus1Success = false;
    let plus2Success = false;
    let plus3Success = false;
    const plus1Solar = tryLunarToSolar(base.year, base.month, base.day);
    if (!plus1Solar) {
      errors.push(`\uC74C\uB825 ${base.year}\uB144 ${base.month}\uC6D4 \uC720\uD6A8\uD55C \uB0A0\uC9DC\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
    } else {
      const plus1 = { year: plus1Solar.syear, month: plus1Solar.smonth, day: plus1Solar.sday, label: "\uBCF8\uC6D0+1" };
      const isDuplicate = dates.some((d) => d.year === plus1.year && d.month === plus1.month && d.day === plus1.day);
      if (!isDuplicate) {
        dates.push(plus1);
        plus1Success = true;
        const plus2Solar = tryLunarToSolar(plus1Solar.syear, plus1Solar.smonth, plus1Solar.sday);
        if (!plus2Solar) {
          errors.push(`\uC74C\uB825 ${plus1Solar.syear}\uB144 ${plus1Solar.smonth}\uC6D4 \uC720\uD6A8\uD55C \uB0A0\uC9DC\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
        } else {
          const plus2 = { year: plus2Solar.syear, month: plus2Solar.smonth, day: plus2Solar.sday, label: "\uBCF8\uC6D0+2" };
          const isDuplicate2 = dates.some((d) => d.year === plus2.year && d.month === plus2.month && d.day === plus2.day);
          if (!isDuplicate2) {
            dates.push(plus2);
            plus2Success = true;
            const plus3Solar = tryLunarToSolar(plus2Solar.syear, plus2Solar.smonth, plus2Solar.sday);
            if (!plus3Solar) {
              errors.push(`\uC74C\uB825 ${plus2Solar.syear}\uB144 ${plus2Solar.smonth}\uC6D4 \uC720\uD6A8\uD55C \uB0A0\uC9DC\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
            } else {
              const plus3 = { year: plus3Solar.syear, month: plus3Solar.smonth, day: plus3Solar.sday, label: "\uBCF8\uC6D0+3" };
              const isDuplicate3 = dates.some((d) => d.year === plus3.year && d.month === plus3.month && d.day === plus3.day);
              if (!isDuplicate3) {
                dates.push(plus3);
                plus3Success = true;
              } else {
                errors.push("\uAE30\uC874 \uB0A0\uC9DC\uC640 \uC911\uBCF5\uB429\uB2C8\uB2E4.");
              }
            }
          } else {
            errors.push("\uAE30\uC874 \uB0A0\uC9DC\uC640 \uC911\uBCF5\uB429\uB2C8\uB2E4.");
          }
        }
      } else {
        errors.push("\uAE30\uC874 \uB0A0\uC9DC\uC640 \uC911\uBCF5\uB429\uB2C8\uB2E4.");
      }
    }
    if (dates.length === 6) {
      return { success: true, dates };
    } else {
      const errorMessage = errors.length > 0 ? errors.join(" / ") : "\uC77C\uBD80 \uB0A0\uC9DC \uACC4\uC0B0 \uC2E4\uD328";
      return {
        success: false,
        dates,
        error: errorMessage
      };
    }
  } catch (e) {
    return {
      success: false,
      error: "\uC790\uB3D9 \uACC4\uC0B0 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
    };
  }
}

// src/utils/chasamConverter.ts
var GANJI_HANJA_TO_HANGUL = {
  "\u7532\u5B50": "\uAC11\uC790",
  "\u4E59\u4E11": "\uC744\uCD95",
  "\u4E19\u5BC5": "\uBCD1\uC778",
  "\u4E01\u536F": "\uC815\uBB18",
  "\u620A\u8FB0": "\uBB34\uC9C4",
  "\u5DF1\u5DF3": "\uAE30\uC0AC",
  "\u5E9A\u5348": "\uACBD\uC624",
  "\u8F9B\u672A": "\uC2E0\uBBF8",
  "\u58EC\u7533": "\uC784\uC2E0",
  "\u7678\u9149": "\uACC4\uC720",
  "\u7532\u620C": "\uAC11\uC220",
  "\u4E59\u4EA5": "\uC744\uD574",
  "\u4E19\u5B50": "\uBCD1\uC790",
  "\u4E01\u4E11": "\uC815\uCD95",
  "\u620A\u5BC5": "\uBB34\uC778",
  "\u5DF1\u536F": "\uAE30\uBB18",
  "\u5E9A\u8FB0": "\uACBD\uC9C4",
  "\u8F9B\u5DF3": "\uC2E0\uC0AC",
  "\u58EC\u5348": "\uC784\uC624",
  "\u7678\u672A": "\uACC4\uBBF8",
  "\u7532\u7533": "\uAC11\uC2E0",
  "\u4E59\u9149": "\uC744\uC720",
  "\u4E19\u620C": "\uBCD1\uC220",
  "\u4E01\u4EA5": "\uC815\uD574",
  "\u620A\u5B50": "\uBB34\uC790",
  "\u5DF1\u4E11": "\uAE30\uCD95",
  "\u5E9A\u5BC5": "\uACBD\uC778",
  "\u8F9B\u536F": "\uC2E0\uBB18",
  "\u58EC\u8FB0": "\uC784\uC9C4",
  "\u7678\u5DF3": "\uACC4\uC0AC",
  "\u7532\u5348": "\uAC11\uC624",
  "\u4E59\u672A": "\uC744\uBBF8",
  "\u4E19\u7533": "\uBCD1\uC2E0",
  "\u4E01\u9149": "\uC815\uC720",
  "\u620A\u620C": "\uBB34\uC220",
  "\u5DF1\u4EA5": "\uAE30\uD574",
  "\u5E9A\u5B50": "\uACBD\uC790",
  "\u8F9B\u4E11": "\uC2E0\uCD95",
  "\u58EC\u5BC5": "\uC784\uC778",
  "\u7678\u536F": "\uACC4\uBB18",
  "\u7532\u8FB0": "\uAC11\uC9C4",
  "\u4E59\u5DF3": "\uC744\uC0AC",
  "\u4E19\u5348": "\uBCD1\uC624",
  "\u4E01\u672A": "\uC815\uBBF8",
  "\u620A\u7533": "\uBB34\uC2E0",
  "\u5DF1\u9149": "\uAE30\uC720",
  "\u5E9A\u620C": "\uACBD\uC220",
  "\u8F9B\u4EA5": "\uC2E0\uD574",
  "\u58EC\u5B50": "\uC784\uC790",
  "\u7678\u4E11": "\uACC4\uCD95",
  "\u7532\u5BC5": "\uAC11\uC778",
  "\u4E59\u536F": "\uC744\uBB18",
  "\u4E19\u8FB0": "\uBCD1\uC9C4",
  "\u4E01\u5DF3": "\uC815\uC0AC",
  "\u620A\u5348": "\uBB34\uC624",
  "\u5DF1\u672A": "\uAE30\uBBF8",
  "\u5E9A\u7533": "\uACBD\uC2E0",
  "\u8F9B\u9149": "\uC2E0\uC720",
  "\u58EC\u620C": "\uC784\uC220",
  "\u7678\u4EA5": "\uACC4\uD574"
};
function validateIlju(year, month, day, hour, minute, expectedIlju) {
  try {
    const result = sydtoso24yd(year, month, day, hour, minute);
    const hanjaIlju = ganji[result.so24day];
    const calculatedIlju = GANJI_HANJA_TO_HANGUL[hanjaIlju] ?? hanjaIlju;
    return { valid: calculatedIlju === expectedIlju, calculatedIlju };
  } catch {
    return { valid: false, calculatedIlju: "\uACC4\uC0B0 \uC624\uB958" };
  }
}
function buildData(record, year, month, day, isLunar, createdBy2, additionalDates, notes, isLeapMonth = false) {
  return {
    id: record.id,
    createdAt: /* @__PURE__ */ new Date(),
    createdBy: createdBy2,
    name: record.name,
    gender: record.sex === "M" ? "male" : "female",
    birthDate: { year, month, day, hour: record.birthHour, minute: record.birthMinute, isLunar, isLeapMonth },
    notes,
    additionalDates
  };
}
function inferLunarSolarCandidate(record) {
  const candidates = [];
  for (const isLeapMonth of [false, true]) {
    try {
      const solar = lunartosolar(record.birthYear, record.birthMonth, record.birthDay, isLeapMonth ? 1 : 0);
      const { valid, calculatedIlju } = validateIlju(
        solar.syear,
        solar.smonth,
        solar.sday,
        record.birthHour,
        record.birthMinute,
        record.ilju
      );
      candidates.push({
        year: solar.syear,
        month: solar.smonth,
        day: solar.sday,
        isLeapMonth,
        iljuValid: valid,
        calculatedIlju
      });
    } catch {
      continue;
    }
  }
  if (candidates.length === 0) {
    return {
      warning: `[${record.name}] \uC74C\uB825\u2192\uC591\uB825 \uBCC0\uD658 \uC2E4\uD328: ${record.birthYear}.${record.birthMonth}.${record.birthDay}`
    };
  }
  const uniqueCandidates = candidates.filter(
    (candidate, index, all) => index === all.findIndex(
      (other) => other.year === candidate.year && other.month === candidate.month && other.day === candidate.day && other.isLeapMonth === candidate.isLeapMonth
    )
  );
  const validMatches = uniqueCandidates.filter((candidate) => candidate.iljuValid);
  if (validMatches.length === 1) {
    const picked = validMatches[0];
    return {
      candidate: picked,
      warning: picked.isLeapMonth ? `[${record.name}] \uC724\uB2EC \uD6C4\uBCF4\uB97C \uC77C\uC8FC \uAC80\uC99D\uC73C\uB85C \uCD94\uB860\uD574 \uCC98\uB9AC\uB428` : void 0
    };
  }
  if (uniqueCandidates.length === 1) {
    return {
      candidate: uniqueCandidates[0],
      warning: uniqueCandidates[0].isLeapMonth ? `[${record.name}] \uC724\uB2EC \uD6C4\uBCF4 1\uAC74\uC73C\uB85C \uCD94\uB860\uD574 \uCC98\uB9AC\uB428` : void 0
    };
  }
  const nonLeapCandidate = uniqueCandidates.find((candidate) => !candidate.isLeapMonth) ?? uniqueCandidates[0];
  return {
    candidate: nonLeapCandidate,
    warning: `[${record.name}] \uC724\uB2EC \uC5EC\uBD80\uB97C \uD655\uC815\uD560 \uC218 \uC5C6\uC5B4 ${nonLeapCandidate.isLeapMonth ? "\uC724\uB2EC" : "\uD3C9\uB2EC"} \uAE30\uC900\uC73C\uB85C \uCC98\uB9AC\uB428, \uC218\uB3D9 \uD655\uC778 \uD544\uC694`
  };
}
function convertRecord(record, createdBy2) {
  const warnings = [];
  let birthYear = record.birthYear;
  let birthMonth = record.birthMonth;
  let birthDay = record.birthDay;
  let isLunar = false;
  let isLeapMonth = false;
  let iljuValid = false;
  let calculatedIlju = "\uACC4\uC0B0 \uC2E4\uD328";
  if (record.birthdayType === "L") {
    isLunar = true;
    const inferred = inferLunarSolarCandidate(record);
    if (!inferred.candidate) {
      if (inferred.warning) warnings.push(inferred.warning);
      return {
        data: buildData(record, record.birthYear, record.birthMonth, record.birthDay, isLunar, createdBy2, [], record.memo.trim() || void 0, false),
        warnings,
        iljuValid: false,
        originalIlju: record.ilju,
        calculatedIlju: "\uBCC0\uD658 \uC2E4\uD328",
        status: "error"
      };
    }
    birthYear = inferred.candidate.year;
    birthMonth = inferred.candidate.month;
    birthDay = inferred.candidate.day;
    isLeapMonth = inferred.candidate.isLeapMonth;
    iljuValid = inferred.candidate.iljuValid;
    calculatedIlju = inferred.candidate.calculatedIlju;
    if (inferred.warning) warnings.push(inferred.warning);
  } else if (record.birthdayType === "N") {
    warnings.push(`[${record.name}] birthdayType 'N' \uAC10\uC9C0 \u2014 \uC591\uB825\uC73C\uB85C \uCC98\uB9AC\uB428, \uC218\uB3D9 \uD655\uC778 \uD544\uC694`);
  }
  const dateCalcResult = calculateAutoDates(birthYear, birthMonth, birthDay);
  if (!dateCalcResult.success || !dateCalcResult.dates) {
    warnings.push(`[${record.name}] 6\uAC1C \uBA85\uC2DD \uB0A0\uC9DC \uACC4\uC0B0 \uC2E4\uD328: ${dateCalcResult.error ?? ""}`);
    return {
      data: buildData(record, birthYear, birthMonth, birthDay, isLunar, createdBy2, [], record.memo.trim() || void 0, isLeapMonth),
      warnings,
      iljuValid: false,
      originalIlju: record.ilju,
      calculatedIlju: "\uACC4\uC0B0 \uC2E4\uD328",
      status: "error"
    };
  }
  const additionalDates = dateCalcResult.dates.map((d) => ({ label: d.label, year: d.year, month: d.month, day: d.day }));
  const notes = record.memo.trim() !== "" ? record.memo.trim() : void 0;
  const data = buildData(record, birthYear, birthMonth, birthDay, isLunar, createdBy2, additionalDates, notes, isLeapMonth);
  if (record.birthdayType !== "L") {
    const iljuCheck = validateIlju(
      birthYear,
      birthMonth,
      birthDay,
      record.birthHour,
      record.birthMinute,
      record.ilju
    );
    iljuValid = iljuCheck.valid;
    calculatedIlju = iljuCheck.calculatedIlju;
  }
  if (!iljuValid) {
    warnings.push(`[${record.name}] \uC77C\uC8FC \uBD88\uC77C\uCE58 \u2014 \uC6D0\uBCF8: "${record.ilju}", \uACC4\uC0B0\uAC12: "${calculatedIlju}"${record.birthdayType === "L" ? " (\uC724\uB2EC \uC5EC\uBD80 \uD655\uC778)" : ""}`);
  }
  return { data, warnings, iljuValid, originalIlju: record.ilju, calculatedIlju, status: warnings.length > 0 ? "warning" : "ok" };
}
function normalizeMergedNote(note) {
  return note.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join("\n");
}
function mergeVariantNotes(records) {
  const noteSources = /* @__PURE__ */ new Map();
  for (const record of records) {
    const normalized = record.notes ? normalizeMergedNote(record.notes) : "";
    if (!normalized) continue;
    const existingSources = noteSources.get(normalized) ?? [];
    if (!existingSources.includes(record.name)) existingSources.push(record.name);
    noteSources.set(normalized, existingSources);
  }
  if (noteSources.size === 0) return void 0;
  return Array.from(noteSources.entries()).map(([note, sources]) => `[${sources.join(", ")}] ${note}`).join("\n");
}
function mergeVariants(results, variantMap) {
  const allVariantIds = /* @__PURE__ */ new Set();
  for (const vids of variantMap.values()) vids.forEach((id) => allVariantIds.add(id));
  const byId = /* @__PURE__ */ new Map();
  results.forEach((r) => {
    if (r.status !== "error") byId.set(r.data.id, r.data);
  });
  const persons = [];
  const groups = [];
  for (const r of results) {
    if (r.status === "error") continue;
    const p = r.data;
    if (allVariantIds.has(p.id)) continue;
    if (variantMap.has(p.id)) {
      const variantIds = variantMap.get(p.id);
      const absorbed = variantIds.map((id) => byId.get(id)).filter(Boolean);
      const mergedNotes = mergeVariantNotes([p, ...absorbed]);
      const merged = { ...p, notes: mergedNotes };
      persons.push(merged);
      groups.push({ representative: merged, absorbed });
    } else {
      persons.push(p);
    }
  }
  return { persons, groups };
}

// scripts/converter-smoke.ts
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
function logSection(title) {
  console.log(`
[${title}]`);
}
var createdBy = "01012345678";
var normalRecord = {
  id: "normal-1",
  sex: "M",
  name: "\uD64D\uAE38\uB3D9",
  birthYear: 1972,
  birthMonth: 1,
  birthDay: 26,
  birthdayType: "S",
  birthHour: 11,
  birthMinute: 30,
  birthDateTime: "197201261130",
  memo: "",
  ilju: "\uBCD1\uC9C4",
  iljuHanja: "\u4E19\u8FB0"
};
var unknownBirthdayTypeRecord = {
  ...normalRecord,
  id: "unknown-1",
  name: "\uC720\uD615\uAC80\uC0AC",
  birthdayType: "N"
};
var mergeBase = {
  data: {
    id: "merge-1",
    createdAt: /* @__PURE__ */ new Date(),
    createdBy,
    name: "\uAE40\uCCA0\uC218",
    gender: "male",
    birthDate: { year: 1980, month: 3, day: 10, hour: 10, minute: 0, isLunar: false, isLeapMonth: false },
    notes: "\uBCF8\uC6D0",
    additionalDates: [
      { label: "\uBCF8\uC6D0", year: 1980, month: 3, day: 10 },
      { label: "\uBCF8\uC6D0+1", year: 1981, month: 3, day: 10 },
      { label: "\uBCF8\uC6D0+2", year: 1982, month: 3, day: 10 },
      { label: "\uBCF8\uC6D0+3", year: 1983, month: 3, day: 10 }
    ]
  },
  warnings: [],
  iljuValid: true,
  originalIlju: "\uAC11\uC790",
  calculatedIlju: "\uAC11\uC790",
  status: "ok"
};
var mergeVariant = {
  data: {
    ...mergeBase.data,
    id: "merge-2",
    name: "\uAE40\uCCA0\uC218++",
    notes: "\uBCF8\uC6D0"
  },
  warnings: [],
  iljuValid: true,
  originalIlju: "\uAC11\uC790",
  calculatedIlju: "\uAC11\uC790",
  status: "ok"
};
var mergeVariantWithDifferentNote = {
  data: {
    ...mergeBase.data,
    id: "merge-3",
    name: "\uAE40\uCCA0\uC218\uD5C8",
    notes: "\uD5C8\uC790 \uAC00\uB2A5\uC131"
  },
  warnings: [],
  iljuValid: true,
  originalIlju: "\uAC11\uC790",
  calculatedIlju: "\uAC11\uC790",
  status: "ok"
};
function main() {
  logSection("convertRecord - normal");
  const normal = convertRecord(normalRecord, createdBy);
  console.log(normal.status, normal.calculatedIlju, normal.data.birthDate);
  assert(normal.status === "ok", "\uC815\uC0C1 \uC591\uB825 \uB808\uCF54\uB4DC\uB294 ok \uC5EC\uC57C \uD569\uB2C8\uB2E4");
  logSection("convertRecord - birthdayType N");
  const unknownType = convertRecord(unknownBirthdayTypeRecord, createdBy);
  console.log(unknownType.status, unknownType.warnings);
  assert(unknownType.status === "warning", "birthdayType N \uC740 warning \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4");
  assert(unknownType.warnings.some((w) => w.includes("birthdayType 'N'")), "N \uD0C0\uC785 \uACBD\uACE0\uAC00 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4");
  logSection("mergeVariants - note merge");
  const variantMap = /* @__PURE__ */ new Map([["merge-1", ["merge-2", "merge-3"]]]);
  const merged = mergeVariants([mergeBase, mergeVariant, mergeVariantWithDifferentNote], variantMap);
  console.log(merged.groups[0].representative.notes);
  assert(merged.persons.length === 1, "\uBCD1\uD569 \uD6C4 \uB300\uD45C 1\uAC74\uB9CC \uB0A8\uC544\uC57C \uD569\uB2C8\uB2E4");
  assert(merged.groups.length === 1, "\uBCD1\uD569 \uADF8\uB8F9 1\uAC1C\uAC00 \uC0DD\uC131\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4");
  assert(merged.groups[0].representative.notes?.includes("[\uAE40\uCCA0\uC218, \uAE40\uCCA0\uC218++] \uBCF8\uC6D0") ?? false, "\uC911\uBCF5 \uBA54\uBAA8\uB294 \uCD9C\uCC98 \uC774\uB984\uB9CC \uD569\uCCD0\uC838\uC57C \uD569\uB2C8\uB2E4");
  assert(merged.groups[0].representative.notes?.includes("[\uAE40\uCCA0\uC218\uD5C8] \uD5C8\uC790 \uAC00\uB2A5\uC131") ?? false, "\uC11C\uB85C \uB2E4\uB978 \uBA54\uBAA8\uB294 \uBCC4\uB3C4 \uC904\uB85C \uB0A8\uC544\uC57C \uD569\uB2C8\uB2E4");
  console.log("\nconverter smoke test passed");
}
main();
