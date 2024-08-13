const { readFileSync } = require('node:fs')
const { createHash } = require('node:crypto')
const { exit } = require('node:process')
const admin = require('firebase-admin')
const serviceAccount = require('./service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

function generateHash(input) {
  return createHash('md5').update(input).digest('hex').slice(0, 4)
}

function generateCustomId(item) {
  const hash = generateHash(item.storeFullName)
  return `${item.group}-${item.storeId}-${hash}`.toLowerCase()
}

function readJSONFile(filePath) {
  try {
    const jsonData = readFileSync(filePath, 'utf8')
    return JSON.parse(jsonData)
  }
  catch (error) {
    console.error('Error reading JSON file:', error)
    return null
  }
}

async function uploadToFirestore(collectionName, data) {
  const batch = db.batch()

  data.forEach((item) => {
    const customId = generateCustomId(item)
    const docRef = db.collection(collectionName).doc(customId)
    batch.set(docRef, item)
  })

  try {
    await batch.commit()
    console.log(`Successfully uploaded ${data.length} documents to ${collectionName}`)
  }
  catch (error) {
    console.error('Error uploading to Firestore:', error)
  }
}

async function main() {
  const jsonFilePath = 'data.json'
  const collectionName = 'salePoint'

  const jsonData = readJSONFile(jsonFilePath)
  if (jsonData) {
    await uploadToFirestore(collectionName, jsonData)
  }
}

main().then(() => exit())
