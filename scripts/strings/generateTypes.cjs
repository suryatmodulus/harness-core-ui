const path = require('path')
const fs = require('fs')

const yaml = require('yaml')
const _ = require('lodash')
const glob = require('glob')

const runPrettier = require('../utils/runPrettier.cjs')
const { getLayers } = require('../utils/HarnessModulesUtils.cjs')

function flattenKeys(data, parentPath = []) {
  const keys = []

  _.keys(data).forEach(key => {
    const value = data[key]
    const newPath = [...parentPath, key]

    if (Array.isArray(value)) {
      throw new TypeError(`Array is not supported in strings.yaml\nPath: "${newPath.join('.')}"`)
    }

    if (_.isPlainObject(data[key])) {
      keys.push(...flattenKeys(data[key], [...parentPath, key]))
    } else {
      keys.push([...parentPath, key].join('.'))
    }
  })

  keys.sort()

  return keys
}

async function generateTypes() {
  const files = glob.sync('src/modules/**/strings.en.yaml')
  const layers = getLayers(true)

  files.push('src/strings/strings.en.yaml') // TODO: remove this after migration

  const promises = layers.map(async ({ dirName, moduleRef }) => {
    const content = await fs.promises.readFile(
      path.resolve(process.cwd(), `src/modules/${dirName}/strings/strings.en.yaml`),
      'utf8'
    )

    return {
      moduleRef,
      keys: flattenKeys(yaml.parse(content), [moduleRef])
    }
  })

  const allData = await Promise.all(promises)

  // TODO: remove this after migration
  const oldStrings = await fs.promises.readFile(path.resolve(process.cwd(), `src/strings/strings.en.yaml`), 'utf8')
  allData.push({
    moduleRef: null,
    keys: flattenKeys(yaml.parse(oldStrings))
  })

  let content = `
/**
  * This file is auto-generated. Please do not modify this file manually.
  * Use the command \`yarn strings\` to regenerate this file.
  */
export interface StringsMap {`

  allData
    .slice(0, allData.length - 1) // TODO: remove this line when strings are migrated
    .flatMap(({ keys }) => keys)
    .forEach(key => (content += `\n  '${key}': string`))

  // TODO: remove this line when strings are migrated
  allData[allData.length - 1].keys.forEach(
    key =>
      (content += `
  /**
    * @deprecated migrate this string to module level file
    */
  '${key}': string`)
  )

  content += `\n}`

  content = await runPrettier(content, 'typescript')

  await fs.promises.writeFile(path.resolve(process.cwd(), 'src/stringTypes.ts'), content, 'utf8')
}

module.exports = generateTypes
