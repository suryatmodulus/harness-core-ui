import fs from 'fs'
import path from 'path'

import _ from 'lodash'

import { getModules } from '../utils/HarnessModulesUtils.cjs'
import runPrettier from '../utils/runPrettier.cjs'

const packageJsonData = await fs.promises.readFile(path.resolve(process.cwd(), 'package.json'), 'utf8')
const packageJson = JSON.parse(packageJsonData)
const { commonChunkLimit, extensionToLanguageMap } = packageJson.i18nSettings

async function makeLangLoaderFile(modules, extensionEntries) {
  let content = `/* eslint-disable */
/**
 * This file is auto-generated. Please do not modify this file manually.
 * Use the command \`yarn strings\` to regenerate this file.
 */
`

  modules.forEach(({ moduleName, moduleRef }) => {
    content += `import ${moduleRef} from '@${moduleName}/strings/strings.en.yaml'\n`
  })

  // `export type HarnessModules = '${modules.map(({ moduleRef }) => moduleRef).join("' | '")}'
  // export type LangMapPromise = Promise<Record<string, any>>\n`

  //   content = extensionEntries.reduce((str, [ext, langs]) => {
  //     str += `
  // function get_${ext}_chunk_by_module(chunk: HarnessModules): LangMapPromise {
  //   switch (chunk) {`
  //     modules.forEach(({ moduleRef, moduleName }) => {
  //       str += `
  //     case '${moduleRef}':
  //       return import(
  //         /* webpackChunkName: "${moduleRef}.${ext}" */
  //         /* webpackMode: "lazy" */
  //         '@${moduleName}/strings/strings.${ext}.yaml'
  //       )`
  //     })

  //     str += `
  //     default:
  //       return Promise.resolve({})
  //   }
  // }
  // `

  //     return str
  //   }, content)

  content += `
export default function languageLoader() {
  return { ${modules.map(({ moduleRef }) => moduleRef).join(', ')} }
}`
  // `
  // export default function languageLoader(langId: string, chunk: HarnessModules): LangMapPromise {
  //   switch (langId) {`

  //   content = extensionEntries.reduce((str, [ext, langs]) => {
  //     langs.forEach(lang => {
  //       str += `
  //     case '${lang}':`
  //     })

  //     str += `
  //       return get_${ext}_chunk_by_module(chunk)`

  //     return str
  //   }, content)

  //   content += `
  //     default:
  //       return get_en_chunk_by_module(chunk)
  //   }
  // }`

  content = await runPrettier(content, 'typescript')

  await fs.promises.writeFile(path.resolve(process.cwd(), `src/framework/strings/languageLoader.ts`), content, 'utf8')
}

// create common modules
const modules = await getModules()

// const commonChunkIndex = modules.indexOf(commonChunkLimit)
// const commons = modules.slice(0, commonChunkIndex + 1)
const commonChunkIndex = 0
const restModules = modules.slice(commonChunkIndex)
const extensionEntries = Object.entries(extensionToLanguageMap)

await makeLangLoaderFile(restModules, extensionEntries)
console.log('✅  Generated Language Loader file successfully!')
