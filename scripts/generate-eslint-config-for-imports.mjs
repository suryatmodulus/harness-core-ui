import fs from 'fs'
import path from 'path'
import yaml from 'yaml'
import _ from 'lodash'

import { getLayers } from './utils/HarnessModulesUtils.cjs'
import runPrettier from './utils/runPrettier.cjs'

const layers = await getLayers()
const flattenedLayers = _.flatten(layers)
const modulesPath = path.resolve(process.cwd(), 'src/modules')

for (const { dirName, moduleName } of flattenedLayers) {
  const layerIndex = layers.findIndex(layer => layer.find(mod => dirName === mod.dirName))
  const restrictedLayers = layers.slice(layerIndex)
  const restrictedDirs = _.flatten(restrictedLayers).filter(mod => dirName !== mod.dirName)

  const config = {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'lodash.*',
            ...restrictedDirs.map(mod => `modules/${mod.dirName}/*`),
            ...restrictedDirs.map(mod => `@${mod.moduleName}/*`)
          ],
          paths: [
            'lodash',
            {
              name: 'yaml',
              importNames: ['stringify'],
              message: 'Please use yamlStringify from @common/utils/YamlHelperMethods instead of this'
            }
          ]
        }
      ]
    }
  }

  let content = yaml.stringify(config)
  content = await runPrettier(content, 'yaml')

  await fs.promises.writeFile(path.join(modulesPath, dirName, '.eslintrc.yml'), content, 'utf8')
  console.log(`✅  Generated '.eslintrc.yml' file for "${moduleName}"`)
}
