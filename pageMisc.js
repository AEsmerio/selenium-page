
function createObjBaseOn(candidateObj, baseOnObj) {
  let newObj = {}
  Object.keys(baseOnObj).forEach(key => {
    newObj[key] = typeof candidateObj[key] !== "undefined" ? candidateObj[key] : baseOnObj[key]
  })
  return newObj
}

module.exports = { createObjBaseOn }