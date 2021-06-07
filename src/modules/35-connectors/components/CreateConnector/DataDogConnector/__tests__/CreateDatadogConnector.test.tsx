import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { Container, FormInput } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

const callBuildDatadogPayload = jest.fn()
// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock
import CreateDataDogConnector from '../CreateDataDogConnector'

const DatadogURL = 'https://app.datadoghq.com/api/v1/'

jest.mock('@connectors/pages/connectors/utils/ConnectorUtils', () => ({
  buildDatadogPayload: callBuildDatadogPayload
}))

jest.mock('@secrets/components/SecretInput/SecretInput', () => (b: { name: string }) => (
  <Container className="secret-mock">
    <FormInput.Text name={b.name} />
  </Container>
))

jest.mock('@connectors/pages/connectors/utils/ConnectorUtils', () => ({
  ...(jest.requireActual('@connectors/pages/connectors/utils/ConnectorUtils') as Record<string, any>),
  setSecretField: async () => ({
    identifier: 'secretIdentifier',
    name: 'secretName',
    referenceString: 'testReferenceString'
  })
}))

describe('Create datadog connector Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDataDogConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())
    // click submit and verify validation string is visible
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('connectors.datadog.urlValidation')).not.toBeNull())
    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDataDogConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )

    // fill out url field
    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())
    await setFieldValue({ container, fieldId: 'url', value: DatadogURL, type: InputTypes.TEXTFIELD })
    // fill out API Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'dsf-auto'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'applicationKeyRef',
      value: 'dsf-new'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        apiKeyRef: 'dsf-auto',
        applicationKeyRef: 'dsf-new',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        url: 'https://app.datadoghq.com/api/v1/'
      })
    )

    expect(container).toMatchSnapshot()
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDataDogConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            ({
              name: 'dasdadasdasda',
              identifier: 'dasdadasdasda',
              description: '',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'Datadog',
              spec: {
                url: DatadogURL,
                applicationKeyRef: 'datadog_app_secret',
                apiKeyRef: 'datadog_api_secret',
                delegateSelectors: []
              }
            } as unknown) as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${DatadogURL}"]`)).not.toBeNull()

    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://sfsfsf.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'datadog_api_secret'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'applicationKeyRef',
      value: 'datadog_app_secret'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        apiKeyRef: 'datadog_api_secret',
        applicationKeyRef: 'datadog_app_secret',
        delegateSelectors: [],
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'default',
        projectIdentifier: 'Test_101',
        spec: {
          apiKeyRef: 'datadog_api_secret',
          applicationKeyRef: 'datadog_app_secret',
          delegateSelectors: [],
          url: 'https://app.datadoghq.com/api/v1/'
        },
        tags: {},
        type: 'Datadog',
        url: 'http://sfsfsf.com'
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDataDogConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            ({
              name: 'dasdadasdasda',
              identifier: 'dasdadasdasda',
              description: '',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'Datadog',
              spec: {
                url: DatadogURL,
                applicationKeyRef: 'datadog_app_secret',
                apiKeyRef: 'datadog_api_secret',
                delegateSelectors: []
              }
            } as unknown) as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${DatadogURL}"]`)).not.toBeNull()
    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://dgdgtrty.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'datadog_api_secret'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'applicationKeyRef',
      value: 'datadog_app_secret'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        apiKeyRef: 'datadog_api_secret',
        applicationKeyRef: 'datadog_app_secret',
        delegateSelectors: [],
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'default',
        projectIdentifier: 'Test_101',
        spec: {
          apiKeyRef: 'datadog_api_secret',
          applicationKeyRef: 'datadog_app_secret',
          delegateSelectors: [],
          url: 'https://app.datadoghq.com/api/v1/'
        },
        tags: {},
        type: 'Datadog',
        url: 'http://dgdgtrty.com'
      })
    )
  })
})
