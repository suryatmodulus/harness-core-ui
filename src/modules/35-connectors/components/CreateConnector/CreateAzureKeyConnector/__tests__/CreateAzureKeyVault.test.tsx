import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, findByText, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { Connectors } from '@connectors/constants'
import CreateAzureKeyVaultConnector from '../CreateAzureKeyVaultConnector'
import secretsListMockData from './secretsListMockData.json'
import connectorsListMockData from './connectorsListMockData.json'
import connectorDetailsMockData from './connectorDetailsMockData.json'

const commonProps = {
  isEditMode: false,
  onClose: noop,
  onSuccess: noop,
  mock: { label: 'dummy vaultName', value: 'dummy vaultName' }
}

const azureKeyVaultInfo = {
  name: 'dummy connector name',
  identifier: 'dummy connector identifier',
  description: 'dummy connector desc',
  type: Connectors.AzureKeyVault,
  spec: {
    clientId: 'dummy clientId',
    secretKey: 'secretKey',
    tenantId: 'dummy tenantId',
    vaultName: 'dummy vaultName',
    subscription: 'dummy subscription'
  }
}

const successResponse = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(successResponse)),
  useGetMetadata: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(secretsListMockData)),
  useGetConnectorList: () => {
    return {
      data: connectorsListMockData,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: connectorDetailsMockData,
      refetch: jest.fn()
    }
  }
}))

describe('Create Secret Manager Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should be able to render first step form', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAzureKeyVaultConnector {...commonProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      fillAtForm([
        {
          container,
          type: InputTypes.TEXTFIELD,
          fieldId: 'name',
          value: 'dummy name'
        }
      ])
    })

    await act(async () => {
      clickSubmit(container)
    })

    // fill step 2

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'clientId',
        value: 'dummy clientId'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'tenantId',
        value: 'dummy tenantId'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'subscription',
        value: 'dummy subscription'
      }
    ])

    await act(async () => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    const modal = findDialogContainer()
    const secret = await findByText(modal!, 'mockSecret')
    await act(async () => {
      fireEvent.click(secret)
    })
    const applyBtn = await waitFor(() => findByText(modal!, 'entityReference.apply'))
    await act(async () => {
      fireEvent.click(applyBtn)
    })
    const closeButton = await modal?.querySelector("span[icon='cross']")?.closest('button')
    await act(async () => {
      fireEvent.click(closeButton!)
    })

    await act(async () => {
      fireEvent.click(getByText('connectors.azureKeyVault.labels.fetchVault'))
    })

    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot()
  })

  test('should render form in edit', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAzureKeyVaultConnector {...commonProps} isEditMode={true} connectorInfo={azureKeyVaultInfo} />
      </TestWrapper>
    )

    // match step 1
    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    // match step 2
    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot()
  })
})
