/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Document, Options } from 'yaml'

// https://github.com/eemeli/yaml/issues/211
export const yamlStringify = (obj: any, options: Options = {}): string => {
  const doc = new Document({ version: '1.1', simpleKeys: true, ...options })
  doc.setSchema()
  doc.contents = doc.schema?.createNode(obj)
  return String(doc)
}
