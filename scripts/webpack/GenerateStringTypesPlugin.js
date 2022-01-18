/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const generateStringTypes = require('../strings/generateTypes.cjs')

class GenerateStringTypesPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('GenerateStringTypesPlugin', (compilation, callback) => {
      try {
        generateStringTypes().then(
          () => callback(),
          e => callback(e)
        )
      } catch (e) {
        callback(e)
      }
    })
  }
}

module.exports.GenerateStringTypesPlugin = GenerateStringTypesPlugin
