/* eslint-disable jest/no-disabled-tests */
import React from 'react'
import { render, waitFor } from '@testing-library/react'
import {
  PipelineContextInterface,
  PipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import { TestWrapper } from '@common/utils/testUtils'

import overridePipelineContext from './overrideSetPipeline.json'
import DeployServiceSpecifications from '../DeployServiceSpecifications'
import connectorListJSON from './connectorList.json'
import mockListSecrets from './mockListSecret.json'
import services from './servicesMock.json'
const getOverrideContextValue = (): PipelineContextInterface => {
  return {
    ...overridePipelineContext,
    getStageFromPipeline: jest.fn().mockReturnValue({ stage: {} }),
    updateStage: jest.fn(),
    updatePipeline: jest.fn()
  } as any
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: () => Promise.resolve(connectorListJSON),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({
    loading: false,
    data: connectorListJSON,
    mutate: jest.fn().mockImplementation(() => ({ loading: false, data: connectorListJSON })),
    refetch: jest.fn()
  })),
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockListSecrets)),
  useGetServiceListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  usePostSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretViaYaml: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetConnectorList: jest.fn(() => ({ data: null }))
}))

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

describe('Deploy service stage specifications', () => {
  test(`Variables section is present`, async () => {
    const { queryByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <DeployServiceSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('variablesText')).toBeTruthy())
  })
})
