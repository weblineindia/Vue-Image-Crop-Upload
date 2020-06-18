/**
 * This function is used for convert base 64 url to blob url
 * @param {*} b64Data 
 * @param {*} contentType 
 * @param {*} sliceSize 
 */
function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || ''
    sliceSize = sliceSize || 512
    const byteCharacters = atob(b64Data)
    const byteArrays = []
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize)
  
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
  
      byteArrays.push(byteArray)
    }
    const blob = new Blob(byteArrays, {
      type: contentType,
    })
    return blob
  }

  export {
    b64toBlob
  }