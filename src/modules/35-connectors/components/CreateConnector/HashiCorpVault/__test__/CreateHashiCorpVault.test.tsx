import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { TestWrapper } from '@common/utils/testUtils'
import { Connectors } from '@connectors/constants'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import CreateHashiCorpVault from '../CreateHashiCorpVault'

const secretManagerInfo = {
  name: 'sm14',
  identifier: 'sm14',
  description: 'asd',
  type: Connectors.Vault,
  spec: {
    vaultUrl: 'http://localhost:8200',
    renewalIntervalMinutes: 10,
    secretEngineName: 'secret',
    secretEngineVersion: 2,
    default: false,
    readOnly: false
  }
}

const delegateNameresponse = {
  metaData: {},
  resource: true,
  responseMessages: 'true'
}

jest.mock('services/portal', () => ({
  useGetDelegateFromId: jest.fn().mockImplementation(() => {
    return { ...delegateNameresponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  validateTheIdentifierIsUniquePromise: jest.fn(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: true,
      metaData: null
    })
  ),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn()),
  useGetMetadata: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  }))
}))

describe('Create Secret Manager Wizard', () => {
  test('should render form', async () => {
    const { container, getAllByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateHashiCorpVault onClose={noop} onSuccess={noop} mock={true} isEditMode={false} />
      </TestWrapper>
    )

    // match step 1
    expect(container).toMatchSnapshot()

    // fill step 1
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummyname'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    // match step 2
    expect(getAllByText('connectors.hashiCorpVault.stepTwoName')[1]).toBeDefined()
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'vaultUrl',
        value: 'http://localhost:8200'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'basePath',
        value: '/test'
      },
      {
        container,
        type: InputTypes.RADIOS,
        fieldId: 'accessType',
        value: 'TOKEN'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'authToken',
        value: 'password'
      },
      {
        container,
        type: InputTypes.RADIOS,
        fieldId: 'engineType',
        value: 'manual'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'secretEngineName',
        value: 'secret'
      }
    ])
    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot()
  }),
    test('should render form in edit', async () => {
      const { container } = render(
        <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
          <CreateHashiCorpVault
            connectorInfo={secretManagerInfo}
            onClose={noop}
            onSuccess={noop}
            mock={true}
            isEditMode={true}
          />
        </TestWrapper>
      )

      // match step 1
      expect(container).toMatchSnapshot()

      // edit at step 1
      fillAtForm([
        {
          container,
          type: InputTypes.TEXTFIELD,
          fieldId: 'name',
          value: 'dummyname'
        }
      ])

      await act(async () => {
        clickSubmit(container)
      })

      // match step 2
      expect(container).toMatchSnapshot()

      fillAtForm([
        {
          container,
          type: InputTypes.RADIOS,
          fieldId: 'accessType',
          value: 'TOKEN'
        },
        {
          container,
          type: InputTypes.RADIOS,
          fieldId: 'engineType',
          value: 'manual'
        },
        {
          container,
          type: InputTypes.TEXTFIELD,
          fieldId: 'authToken',
          value: 'password'
        }
      ])
      await act(async () => {
        fireEvent.click(container.querySelector('button[type="submit"]')!)
      })
      expect(container).toMatchSnapshot()
    })
})
