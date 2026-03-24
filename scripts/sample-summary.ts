import { readFileSync } from 'node:fs'
import { parseChasamJson, convertBatch } from '../src/utils/chasamConverter'

const filePath = 'c:/_work_github/sajucube-chasam-importer/sample-data/Chasam_DB_20210113063107.txt'
const createdBy = '01012345678'

const text = readFileSync(filePath, 'utf8')
const records = parseChasamJson(text)
const batch = convertBatch(records, createdBy)

const lunarCount = records.filter(record => record.birthdayType === 'L').length
const unknownCount = records.filter(record => record.birthdayType === 'N').length
const warningSamples = batch.results
  .filter(result => result.warnings.length > 0)
  .slice(0, 10)
  .map(result => ({
    name: result.data.name,
    status: result.status,
    warnings: result.warnings,
    isLunar: result.data.birthDate.isLunar === true,
    isLeapMonth: result.data.birthDate.isLeapMonth === true,
  }))

console.log(JSON.stringify({
  totalRecords: records.length,
  lunarCount,
  unknownCount,
  okCount: batch.okCount,
  warningCount: batch.warningCount,
  errorCount: batch.errorCount,
  leapMonthInferredCount: batch.results.filter(result => result.data.birthDate.isLeapMonth === true).length,
  warningSamples,
}, null, 2))
