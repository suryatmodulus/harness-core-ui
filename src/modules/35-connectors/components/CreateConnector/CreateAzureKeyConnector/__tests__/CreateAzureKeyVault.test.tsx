import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { Connectors } from '@connectors/constants'
import CreateAzureKeyVaultConnector from '../CreateAzureKeyVaultConnector'

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
    // secretKey: 'dummy secretKey',
    tenantId: 'dummy tenantId',
    vaultName: 'dummy vaultName',
    subscription: 'dummy subscription'
  }
}

const successMutateResponse = {
  mutate: async () => {
    return {
      status: 'SUCCESS',
      data: [{ label: 'dummy vaultName', value: 'dummy vaultName' }]
    }
  },
  loading: false
}

const successResponse = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(successResponse)),
  useUpdateConnector: jest.fn().mockImplementation(() => successMutateResponse),
  useCreateConnector: jest.fn().mockImplementation(() => successMutateResponse),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn()),
  useGetMetadata: jest.fn().mockImplementation(() => successMutateResponse)
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

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot()

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
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'secretKey',
        value: 'dummy secretKey'
      }
    ])

    await act(async () => {
      fireEvent.click(getByText('connectors.azureKeyVault.labels.fetchVault'))
    })

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
