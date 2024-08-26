const fs = require('node:fs')
const { parse } = require('csv-parse')

const inputFile = 'input.csv'
const outputFile = 'output.json'

const records = []
const storeFullNames = []

// Function to generate storeId
function generateStoreId(fullName) {
  const words = fullName.split(' - ')[0].split(' ')
  return words[words.length - 1]
}

// Function to determine company
function determineCompany(companyName) {
  return 'esi'
}

fs.createReadStream(inputFile)
  .pipe(parse({ columns: true, skip_empty_lines: true }))
  .on('data', (row) => {
    const storeFullName = row['ESI EUROSURGELATI ITALIA S.R.L.'] || row['ESI F.R. S.R.L.'] || row['ESI FLEMING S.R.L.'] || row['ESI GO FROST S.R.L.'] || row['ESI HAPPY GELO S.R.L.'] || row['ESI ICE GIO\' SRL']
    if (storeFullName) {
      storeFullNames.push(storeFullName)
      records.push({
        company: determineCompany(Object.keys(row)[0]),
        storeId: generateStoreId(storeFullName),
        storeFullName,
        deviceType: row.SUPERVISORE,
        publicIp: row['IP PUBBLICO'],
        username: row.USER,
        password: row.PSWD,
        email: row.Email,
      })
    }
  })
  .on('end', () => {
    fs.writeFileSync(outputFile, JSON.stringify(records, null, 2))
    console.log(`Conversion complete. Output written to ${outputFile}`)
    console.log(`Store full names:`)
    console.log(storeFullNames)
  })
