import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, fillAtForm, clickSubmit } from '@common/utils/JestFormHelper'
import {
  useCreateConnector,
  useGetConnectorListV2,
  useGetTestConnectionResult,
  useUpdateConnector
} from 'services/cd-ng'
import { useAzureappclientid } from 'services/ce'
// CreateAzureConnector will eventually be a default export after we get rid of the old flow
import { CreateAzureConnector } from '../CreateCeAzureConnector'

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

jest.mock('services/cd-ng')
const useGetConnectorListV2Mock = useGetConnectorListV2 as jest.MockedFunction<any>
const useCreateConnectorMock = useCreateConnector as jest.MockedFunction<any>
const useUpdateConnectorMock = useUpdateConnector as jest.MockedFunction<any>
const useGetTestConnectionResultMock = useGetTestConnectionResult as jest.MockedFunction<any>

jest.mock('services/ce')
const useAzureStaticAPIMock = useAzureappclientid as jest.MockedFunction<any>

describe('Create Azure connector Wizard', () => {
  test('should render overview step', () => {
    useGetConnectorListV2Mock.mockImplementation(() => ({
      mutate: async () => {
        return {
          status: 'SUCCESS',
          data: {
            pageItemCount: 0,
            content: []
          }
        }
      }
    }))

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAzureConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    expect(getByText('connectors.ceAzure.overview.heading')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should throw an error when connectors already exist for a given tenantId and subscriptionId', async () => {
    useGetConnectorListV2Mock.mockImplementation(() => ({
      mutate: async () => {
        return {
          status: 'SUCCESS',
          data: {
            pageItemCount: 2,
            content: []
          }
        }
      }
    }))

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAzureConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'bdj'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'tenantId',
        value: 'b229b2bb-5f33-4d22-bce0-730f6474e906'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'subscriptionId',
        value: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    expect(getByText('connectors.ceAzure.overview.alreadyExist')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should render existing billing exports for a given tenantId', async () => {
    useGetConnectorListV2Mock.mockImplementation(() => ({
      mutate: jest
        .fn()
        .mockImplementationOnce(() => {
          return {
            status: 'SUCCESS',
            data: {
              pageItemCount: 0,
              content: []
            }
          }
        })
        .mockImplementationOnce(() => {
          return {
            status: 'SUCCESS',
            data: {
              pageItemCount: 2,
              content: [{ connector: { spec: {} } }, { connector: { spec: {} } }]
            }
          }
        })
    }))

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAzureConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'bdj'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'tenantId',
        value: 'b229b2bb-5f33-4d22-bce0-730f6474e906'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'subscriptionId',
        value: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    expect(getByText('connectors.ceAzure.existingExports.instruction')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should render create new billing exports form', async () => {
    useGetConnectorListV2Mock.mockImplementation(() => ({
      mutate: jest
        .fn()
        .mockImplementationOnce(() => {
          return {
            status: 'SUCCESS',
            data: {
              pageItemCount: 0,
              content: []
            }
          }
        })
        .mockImplementationOnce(() => {
          return {
            status: 'SUCCESS',
            data: {
              pageItemCount: 0,
              content: []
            }
          }
        })
    }))

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAzureConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'bdj'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'tenantId',
        value: 'b229b2bb-5f33-4d22-bce0-730f6474e906'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'subscriptionId',
        value: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    expect(getByText('connectors.ceAzure.billing.instruction')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should render feature cards, render service principal, create a connector, and test connection', async () => {
    useGetConnectorListV2Mock.mockImplementation(() => ({
      mutate: jest
        .fn()
        .mockImplementationOnce(() => {
          return {
            status: 'SUCCESS',
            data: {
              pageItemCount: 0,
              content: []
            }
          }
        })
        .mockImplementationOnce(() => {
          return {
            status: 'SUCCESS',
            data: {
              pageItemCount: 2,
              content: [{ connector: { spec: {} } }, { connector: { spec: {} } }]
            }
          }
        })
    }))

    const createConnector = jest.fn().mockImplementationOnce(() => ({ status: 'SUCCESS' }))
    useCreateConnectorMock.mockImplementation(() => ({ mutate: createConnector }))

    const updateConnector = jest.fn().mockImplementationOnce(() => ({ status: 'SUCCESS' }))
    useUpdateConnectorMock.mockImplementation(() => ({ mutate: updateConnector }))

    useAzureStaticAPIMock.mockImplementation(() => ({ data: { status: 'SUCCESS', data: '' }, loading: false }))

    const testConnection = jest.fn().mockImplementationOnce(() => ({ status: 'SUCCESS' }))
    useGetTestConnectionResultMock.mockImplementation(() => ({ mutate: testConnection }))

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAzureConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'bdj'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'tenantId',
        value: 'b229b2bb-5f33-4d22-bce0-730f6474e906'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'subscriptionId',
        value: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    // Existing billing export page is rendered
    expect(getByText('connectors.ceAzure.existingExports.instruction')).toBeDefined()

    await act(async () => {
      clickSubmit(container)
    })

    // Choose requirement page is rendered
    expect(getByText('connectors.ceAzure.chooseRequirements.visibilityCardDesc')).toBeDefined()
    expect(getByText('connectors.ceAzure.chooseRequirements.optimizationCardDesc')).toBeDefined()
    expect(container).toMatchSnapshot()

    const fc = container.querySelector('.bp3-card')
    expect(fc).toBeDefined()

    fireEvent.click(fc!)
    await waitFor(() => Promise.resolve())
    await act(async () => {
      clickSubmit(container)
    })

    // Create Service Principal page is rendered
    expect(getByText('connectors.ceAzure.servicePrincipal.heading')).toBeDefined()
    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    // Connector is created
    expect(createConnector).toBeCalled()

    // Test Connection page is loaded
    expect(getByText('connectors.ceAzure.testConnection.heading')).toBeDefined()
    // connection is verified
    expect(testConnection).toBeCalled()
    expect(container).toMatchSnapshot()
  })
})
