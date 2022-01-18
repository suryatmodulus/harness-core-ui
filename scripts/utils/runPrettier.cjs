/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const fs = require('fs')
const path = require('path')

const prettier = require('prettier')

/**
 * Run prettier on given content using the specified parser
 * @param content {String}
 * @param parser {String}
 */
async function runPrettier(content, parser) {
  const prettierConfig = await prettier.resolveConfig(process.cwd())

  return prettier.format(content, { ...prettierConfig, parser })
}

module.exports = runPrettier
