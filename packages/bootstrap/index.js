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

async function uploadToFirestore(backendCollection, frontendCollection, data) {
  const batch = db.batch()

  data.forEach((item) => {
    const customId = generateCustomId(item)

    // Backend collection with sensitive data
    const backendDocRef = db.collection(backendCollection).doc(customId)
    batch.set(backendDocRef, {
      ...item,
      publicIp: item.publicIp,
      username: item.username,
      password: item.password,
      email: item.email,
    })

    // Frontend collection with less sensitive data
    const frontendDocRef = db.collection(frontendCollection).doc(customId)
    batch.set(frontendDocRef, {
      company: item.company,
      group: item.group,
      storeId: item.storeId,
      storeFullName: item.storeFullName,
      deviceType: item.deviceType,
    })
  })

  try {
    await batch.commit()
    console.log(`Successfully uploaded ${data.length} documents to ${backendCollection} and ${frontendCollection}`)
  }
  catch (error) {
    console.error('Error uploading to Firestore:', error)
  }
}

async function main() {
  const jsonFilePath = 'data.json'
  const backendCollectionName = 'salePointCredentials'
  const frontendCollectionName = 'salePoint'

  const jsonData = readJSONFile(jsonFilePath)
  if (jsonData) {
    await uploadToFirestore(backendCollectionName, frontendCollectionName, jsonData)
  }
}

main().then(() => exit())
