/* eslint-disable no-console */
const fs = require('node:fs')
const { parse } = require('csv-parse')

const inputFile = 'input.csv'
const outputFile = 'data.json'

const records = []
const storeFullNames = []

// Function to generate storeId
function generateStoreId(fullName) {
  const words = fullName.split(' - ')[0].split(' ')
  return words[words.length - 1]
}

// Function to determine company
function determineCompany() {
  return 'esi'
}

const columns = [
  'storeFullName',
  'deviceType',
  'publicIp',
  'username',
  'password',
  'spokesperson',
  'spPhone',
  'salePointPhone',
  'email',
  'engineer',
  'engineerPhone',
]

fs.createReadStream(inputFile)
  .pipe(parse({ columns, skip_empty_lines: true }))
  .on('data', (record) => {
    if (record.username.trim() === 'USER')
      return
    if (record.storeFullName) {
      storeFullNames.push(record.storeFullName)
      records.push({
        company: determineCompany(),
        storeId: generateStoreId(record.storeFullName),
        storeFullName: record.storeFullName,
        deviceType: record.deviceType,
        publicIp: record.publicIp.replace('https://', '').replace('/boss/', ''),
        username: record.username,
        password: record.password,
        email: record.email,
      })
    }
  })
  .on('end', () => {
    fs.writeFileSync(outputFile, JSON.stringify(records, null, 2))
    console.log(`Conversion complete. Output written to ${outputFile}`)
    console.log(`Store full names:`)
    console.log(storeFullNames)
  })
