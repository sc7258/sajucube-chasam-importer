import { solortolunar, lunartosolar } from './src/utils/calculationModule'
import { calculateAutoDates } from './src/utils/dateCalculation'

// 박현정아들 2009.10.30 양력
const r1 = solortolunar(2009, 10, 30)
console.log('박현정아들 양력→음력:', r1)

try {
  const p1 = lunartosolar(2009, 10, 30, 0)
  const v1 = solortolunar(p1.syear, p1.smonth, p1.sday)
  const ok = v1.lyear===2009 && v1.lmonth===10 && v1.lday===30
  console.log('박현정아들 본원+1 lunartosolar:', p1, '역검증ok?', ok)
} catch(e) { console.log('박현정아들 본원+1 예외:', e) }

const calc1 = calculateAutoDates(2009, 10, 30)
console.log('박현정아들 calculateAutoDates:', calc1.success, calc1.error, calc1.dates?.length)

// 강동우 1971.06.26 양력
const r2 = solortolunar(1971, 6, 26)
console.log('강동우 양력→음력:', r2)

const calc2 = calculateAutoDates(1971, 6, 26)
console.log('강동우 calculateAutoDates:', calc2.success, calc2.error, calc2.dates?.length)
