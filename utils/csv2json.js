'use strict'

/**
 * This utility script converts a CSV file to JSON.
 */

const csv2json = require('./lib/csv2json')
const fs = require('fs')
const process = require('process')
const csvFile = process.argv[2]

fs.readFile(csvFile, (err, csv) => {
  if (err) return console.error(err);

  console.log('Converting', csvFile, 'to JSON format...')
  const json = csv2json(csv.toString());
  const jsonFile = csvFile.replace('.csv', '.json')

  console.log('Writing JSON file', jsonFile, '...')
  fs.writeFile(
    jsonFile,
    json,
    () => process.exit()
  )
})
