import { noop } from 'lodash-es'
import yaml from './mocks/sample.yaml'
import schema from './mocks/schema.json'
import pipeline from './mocks/pipeline.json'
import pipelineSchema from './mocks/pipeline-schema.json'

import { validateYAMLWithSchema, validateYAML, validateJSONWithSchema, findLeafToParentPath } from '../YamlUtils'
import { yamlStringify } from '../YamlHelperMethods'

jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

describe('Test YamlUtils', () => {
  test('Test validateYAMLWithSchema & validateYAML methods', () => {
    validateYAMLWithSchema(yamlStringify(yaml), schema)?.then(res => {
      expect(res).toHaveLength(0)
    })
    validateYAML(yamlStringify(yaml))?.then(res => {
      expect(res).toHaveLength(0)
    })
  })

  test('Test validateJSONWithSchema', () => {
    validateJSONWithSchema({ pipeline }, pipelineSchema?.data)
      ?.then(res => expect(res.size).toBe(0))
      .catch(_err => noop)
  })

  test('Test findLeafToParentPath method for a top-level attribute', async () => {
    const path = findLeafToParentPath(pipeline as Record<string, any>, 'name')
    expect(path).toEqual('pipeline.name')
  })

  test('Test findLeafToParentPath method for a deeply-nested attribute', async () => {
    const path = findLeafToParentPath(pipeline as Record<string, any>, 'delegateName')
    expect(path).toEqual('DEFAULT_YAML_PATH')
  })

  test('Test findLeafToParentPath method for custom delimiter', async () => {
    const path = findLeafToParentPath(pipeline as Record<string, any>, 'qualifier', '/')
    expect(path).toEqual('DEFAULT_YAML_PATH')
  })
})
