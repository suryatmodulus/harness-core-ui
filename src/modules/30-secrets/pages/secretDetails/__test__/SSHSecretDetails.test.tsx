import React from 'react'
import { render, fireEvent, getByText, waitFor, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ResponseSecretValidationResultDTO } from 'services/cd-ng'
import SecretDetails from '../SecretDetails'

import mockData from './secretDetailsMocks.json'

const delegateResponse = {
  metaData: {},
  resource: true,
  responseMessages: 'true'
}

const responseSecretValidation: ResponseSecretValidationResultDTO = {
  status: 'SUCCESS',
  data: { success: true },
  metaData: {}
}
jest.useFakeTimers()
jest.mock('@common/components/YAMLBuilder/YamlBuilder', jest.fn())
jest.mock('services/portal', () => ({
  useGetDelegatesStatus: jest.fn().mockImplementation(() => {
    return { data: delegateResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('services/cd-ng', () => ({
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return { ...mockData.sshKey, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetConnectorList: jest.fn().mockImplementation(() => {
    return { ...mockData.secretManagers, refetch: jest.fn(), error: null, loading: false }
  }),
  useValidateSecret: jest
    .fn()
    .mockImplementation(() => ({ mutate: () => Promise.resolve({ responseSecretValidation }) })),
  getSecretV2Promise: jest.fn().mockImplementation(() => mockData.sshKey.data),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretViaYaml: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetYamlSchema: jest.fn().mockImplementation(() => {
    return { ...mockData.yamlSchema, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetYamlSnippetMetadata: jest.fn().mockImplementation(() => {
    return { ...mockData.yamlSnippetMetaData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetYamlSnippet: jest.fn().mockImplementation(() => {
    return { ...mockData.yamlSnippetMetaData, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Secret Details', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <SecretDetails
          mockSecretDetails={mockData.sshKey as any}
          mockPassword={mockData.text.data as any}
          mockPassphrase={mockData.text.data as any}
          mockKey={mockData.file.data as any}
        />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
  })
  test('SSH Secret with Key Render', () => {
    expect(container).toMatchSnapshot()
  })
  test('Test Connection', async () => {
    const testConnection = getAllByText('TEST CONNECTION')[0]
    await act(async () => {
      fireEvent.click(testConnection)
    })
    expect(container).toMatchSnapshot()
    setFieldValue({
      container: container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'host',
      value: 'http://localhost:8080'
    })
    await act(async () => {
      fireEvent.click(testConnection)
    })
    expect(container).toMatchSnapshot()
    const retestConnection = getAllByText('RETEST CONNECTION')[0]

    await act(async () => {
      fireEvent.click(retestConnection)
    })
    expect(container).toMatchSnapshot()
  }),
    test('Edit SSH', async () => {
      const edit = getAllByText('Edit Details')[0]
      expect(container).toMatchSnapshot()
      await act(async () => {
        fireEvent.click(edit)
      })
      await act(async () => {
        await waitFor(() => getByText(document.body, 'SSH'))
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    })
})
