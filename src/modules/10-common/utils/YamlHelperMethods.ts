import { Document, Options } from 'yaml'

// https://github.com/eemeli/yaml/issues/211
export const yamlStringify = (obj: any, options: Options = {}): string => {
  const doc = new Document({ version: '1.1', simpleKeys: true, ...options })
  doc.setSchema()
  doc.contents = doc.schema?.createNode(obj)
  return String(doc)
}
