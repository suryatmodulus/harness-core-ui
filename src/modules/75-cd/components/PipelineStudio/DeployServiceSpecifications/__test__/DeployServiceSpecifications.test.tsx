/* eslint-disable jest/no-disabled-tests */
import React from 'react'
import { render, findByText, fireEvent, waitFor } from '@testing-library/react'
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
  return { ...overridePipelineContext, updatePipeline: jest.fn() } as any
}
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: () => Promise.resolve(connectorListJSON),

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

describe.skip('variable tab testing', () => {
  test(`create variable without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getOverrideContextValue()}>
          <DeployServiceSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const variablesTab = await findByText(container, 'Variables')

    // const addManifestButton = await findByText(container, '+ Add Manifest')
    // const variablesTab = await waitFor(() => findByText(container, 'Variables'))
    expect(variablesTab).toBeDefined()
    fireEvent.click(variablesTab)
    const addVariableButton = await findByText(container, 'Add Variable')
    fireEvent.click(addVariableButton)
    const variableInput = document.body.querySelector('input[placeholder="Variable Name"]')
    fireEvent.change(variableInput as Element, { target: { value: 'var1' } })
    const saveButton = await findByText(document.body.querySelector('.bp3-dialog-footer') as HTMLElement, 'Save')
    fireEvent.click(saveButton)
    const var1 = await waitFor(() => findByText(container, 'var1'))
    expect(var1).toBeDefined()
    const varInput = var1?.closest('.variableListTable')?.querySelector('input')
    fireEvent.change(varInput as Element, { target: { value: 'varval' } })

    //create scret type variable
    // fireEvent.click(addVariableButton)
    // variableInput = document.body.querySelector('input[placeholder="Variable Name"]')
    // fireEvent.change(variableInput as Element, { target: { value: 'var2' } })
    // const selectStageDropDown = document.body
    //   .querySelector(`input[value="String"]`)
    //   ?.parentNode?.querySelector('[data-icon="caret-down"]')
    // await act(async () => {
    //   fireEvent.click(selectStageDropDown as Element)
    // })
    // await waitFor(() => document.body.querySelector('.bp3-menu'))
    // const secretOption = await findByText(document.body, 'Secret')
    // fireEvent.click(secretOption as Element)
    // saveButton = await findByText(document.body.querySelector('.bp3-dialog-footer') as HTMLElement, 'Save')
    // fireEvent.click(saveButton)
    // const var2 = await waitFor(() => findByText(container, 'var2'))
    // const secretListButton = var2.parentElement?.querySelector('[stroke="#1C1C28"]')
    // fireEvent.click(secretListButton as Element)
    // const projectbutton = await waitFor(() => findByText(document.body, 'Project'))
    // expect(projectbutton).toBeDefined()
    // fireEvent.click(projectbutton)
    // const selectedSecret = await findByText(document.body, 'New Secret')
    // fireEvent.click(selectedSecret)
  })
})
