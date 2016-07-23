'use strict'

/**
 * This utility script gradually uploads a JSON file containing an array to Firebase.
 * Uploading a very large JSON to Firebase causes it to choke and the operation will fail.
 */

const Firebase = require('firebase')
const config = require('../config.json')
const process = require('process')
const data = require(process.argv[2])
const parentPath = process.argv[3]
const categoryKey = process.argv[4]
const categoryValueKey = process.argv[5]
const identifierKey = process.argv[6]
const identifierValueKey = process.argv[7]
const root = new Firebase(config.firebase.url)

root.authWithCustomToken(config.firebase.secret, (error, authData) => {

  if (error) {
    console.log('Authentication failed!');
    process.exit();
  } else {
    console.log('Authentication succeeded!');
  }

  console.log('Uploading', data.length.toLocaleString(), 'data points...')

  const length = data.length
  const BATCH_SIZE = 500
  let i = 0

  function set() {
    const next = i + BATCH_SIZE;
    const last = next - 1;
    for (; i < next; ++i) {
      if (i === (length - 1)) {
        console.log('finished succesfully!')
        process.exit()
      }

      const category = data[i][categoryKey].replace(/\./g, '_')
      const categoryValue = data[i][categoryValueKey]
      const categoryPath = ['categories', category].join('/')

      const identifier = data[i][identifierKey].replace(/\./g, '_')
      const identifierValue = data[i][identifierValueKey]
      const identifierPath = ['identifiers', identifier].join('/')

      const dataPath = [parentPath, category, identifier].join('/')

      const filteredData = Object.assign.apply(Object,
        Object.keys(data[i])
          .filter(k => k !== '' && k == Number(k))
          .map(k => ({[k]: Number(data[i][k])}))
      )

      console.log('pushing data point', i, '...', dataPath)

      root.child(categoryPath).set(categoryValue)
      root.child(identifierPath).set(identifierValue)

      if (i === last)
        root.child(dataPath).set(filteredData).then(set)
      else
        root.child(dataPath).set(filteredData)
    }
  }

  root.remove().then(set);
})
