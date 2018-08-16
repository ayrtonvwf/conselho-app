export function serialize (obj) {
  const str = []
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
    }
  }
  return str.join('&')
}

export function parseObject (object) {
  const properties = Object.keys(object)
  properties.forEach(property => {
    if (object[property] === null || object[property] === undefined) {
      return
    }

    if (object[property].toString() === parseInt(object[property]).toString()) {
      object[property] = parseInt(object[property]) // "int" to int
    } else if (object[property].toString() === parseFloat(object[property]).toString()) {
      object[property] = parseFloat(object[property]) // "float" to float
    } else if (object[property] === !!object[property]) {
      object[property] = object[property] ? 1 : 0 // bool to int
    }
  })
  return object
}

export function parseObjects (objectArray) {
  return objectArray.map(object =>
    parseObject(object)
  )
}
