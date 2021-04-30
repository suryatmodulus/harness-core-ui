export function encodeURIWithReservedChars(uri: string): string {
  return encodeURIComponent(uri).replace(/[;,/?:@&=+$#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16)
  })
}
