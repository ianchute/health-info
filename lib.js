/**
 * Modified from: http://stackoverflow.com/questions/14446511
 */
function groupBy(list, predicate) {
  const map = new Map()
  list.forEach(item => {
    const key = predicate(item)
    if (!map.has(key)) map.set(key, [item])
    else map.get(key).push(item)
  })
  return map
}

/**
 * Modified from: http://stackoverflow.com/questions/1916218
 */
function sharedStart(array) {
  const A = array.concat().sort()
  const a1 = A[0]
  const a2 = A[A.length - 1]
  const L = a1.length
  let i = 0

  while (i < L && a1.charAt(i) === a2.charAt(i)) i++
    return a1.substring(0, i)
}
