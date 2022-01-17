/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import fs from 'fs'
import path from 'path'
import { MODULE_REGEX } from './utils/HarnessModulesUtils.cjs'

const modulesPath = path.resolve(process.cwd(), 'src/modules')

const dirs = await fs.promises.readdir(modulesPath, { withFileTypes: true })

for (let i = 0; i < dirs.length; i++) {
  const dir = dirs[i]

  if (dir.isDirectory() && !MODULE_REGEX.test(dir.name)) {
    console.log(
      `"src/modules/${dir.name}" does not follow modules standard. Please see https://github.com/wings-software/nextgenui/blob/master/src/modules/README.md`
    )
    process.exit(1)
  }
}

console.log('✅  Everything looks great!')
