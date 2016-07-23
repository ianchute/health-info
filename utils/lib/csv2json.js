/**
  * Converts a CSV string to a JSON string.
  */
module.exports = function csv2json(csv) {
  'use strict'

  const lines = csv.split('\n')
  const result = []
  const headers = lines[0].split(/(,)(?=(?:[^"]|"[^"]*")*$)/)
    .map(header => header
      .replace(/['"]+/g, '') // Unquote
      .trim(String.fromCharCode(65279)) // Solution for UTF issue where String.fromCharCode(65279) !== ''
    )

  let i = 1;
  for (; i < lines.length; ++i) {
    const obj = {}
    const currentline = lines[i].split(/(,)(?=(?:[^"]|"[^"]*")*$)/)

    for (var j = 0; j < headers.length; j++)
      if (headers[j].indexOf('\r') === -1 && currentline[j] && headers[j] !== ',')
        obj[headers[j]] = currentline[j].replace(/['"]+/g, '')

    result.push(obj)
  }

  return JSON.stringify(result)

};
