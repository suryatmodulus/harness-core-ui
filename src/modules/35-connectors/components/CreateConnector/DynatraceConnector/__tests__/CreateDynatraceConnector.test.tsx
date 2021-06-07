import React from 'react'
import { noop } from 'lodash-es'
import { fireEvent, waitFor } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { FormInput, Container } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

jest.mock('../../CommonCVConnector/CVConnectorHOC')
import CreateDynatraceConnector from '../CreateDynatraceConnector'

const DynatraceURL = 'https://dyna.com'
const ApiToken = 'apiToken'

jest.mock('@secrets/components/SecretInput/SecretInput', () => () => (
  <Container className="secret-mock">
    <FormInput.Text name="apiToken" />
  </Container>
))

describe('Unit tests for CreateDynatraceConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDynatraceConnector
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

    // click submit and verify validation string is visible
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('connectors.dynatrace.urlValidation')).not.toBeNull())
    expect(getByText('connectors.dynatrace.apiTokenValidation')).not.toBeNull()
    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDynatraceConnector
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
    await setFieldValue({ container, fieldId: 'url', value: DynatraceURL, type: InputTypes.TEXTFIELD })
    await setFieldValue({ container, fieldId: 'apiToken', value: ApiToken, type: InputTypes.TEXTFIELD })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        url: DynatraceURL,
        apiToken: ApiToken
      })
    )
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDynatraceConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={({ url: DynatraceURL + '/', apiToken: ApiToken } as unknown) as ConnectorInfoDTO}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${DynatraceURL + '/'}"]`)).not.toBeNull()
    expect(container.querySelector(`input[value=${ApiToken}]`)).not.toBeNull()

    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://sfsfsf.com', type: InputTypes.TEXTFIELD })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        url: 'http://sfsfsf.com',
        apiToken: ApiToken
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDynatraceConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={({ spec: { url: DynatraceURL, apiToken: ApiToken } } as unknown) as ConnectorInfoDTO}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${DynatraceURL}"]`)).not.toBeNull()
    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://dgdgtrty.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({ container, fieldId: 'apiToken', value: 'newToken', type: InputTypes.TEXTFIELD })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        spec: {
          url: DynatraceURL,
          apiToken: ApiToken
        },
        url: 'http://dgdgtrty.com',
        apiToken: 'newToken'
      })
    )
  })
})
