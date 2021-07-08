import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock
import CreatePrometheusConnector from '../CreatePrometheusConnector'

const PrometheusURL = 'http://1234.45.565.67:8080'

describe('Create prometheus connector Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreatePrometheusConnector
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
    await waitFor(() => expect(getByText('connectors.prometheus.urlValidation')).not.toBeNull())
    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreatePrometheusConnector
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
    await setFieldValue({ container, fieldId: 'url', value: PrometheusURL, type: InputTypes.TEXTFIELD })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        url: PrometheusURL
      })
    )
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreatePrometheusConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={{ url: PrometheusURL + '/' } as unknown as ConnectorInfoDTO}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${PrometheusURL + '/'}"]`)).not.toBeNull()

    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://sfsfsf.com', type: InputTypes.TEXTFIELD })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        url: 'http://sfsfsf.com'
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreatePrometheusConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={{ spec: { url: PrometheusURL } } as unknown as ConnectorInfoDTO}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${PrometheusURL}"]`)).not.toBeNull()
    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://dgdgtrty.com', type: InputTypes.TEXTFIELD })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        spec: {
          url: 'http://1234.45.565.67:8080'
        },
        url: 'http://dgdgtrty.com'
      })
    )
  })
})
