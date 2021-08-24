import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ProvidersGridView from '../ProvidersGridView'

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ]
}

const gitOpsProviders = [
  {
    name: 'Darwin Argo Dev Env',
    id: 'DarwinArgoDevEnv',
    baseURL: 'https://34.136.244.5',
    status: 'Active',
    type: 'nativeArgo'
  },
  {
    name: 'EMT Argo QA Env',
    id: 'EMTArgoQAEnv',
    baseURL: 'https://34.136.244.6',
    status: 'Active',
    type: 'harnessManagedArgo'
  },
  {
    name: 'EMT Argo Stage Env',
    id: 'EMTArgoStageEnv',
    baseURL: 'https://34.136.244.7',
    status: 'Failure',
    type: 'nativeArgo'
  },
  {
    name: 'Darwin Argo Prod Env',
    id: 'DarwinArgoProdEnv',
    baseURL: 'https://34.136.244.8',
    status: 'Active',
    type: 'harnessManagedArgo'
  },
  {
    name: 'Merchant Processing Argo',
    id: 'MerchantProcessingArgo',
    baseURL: 'https://34.136.244.9',
    status: 'Active',
    type: 'nativeArgo'
  },
  {
    name: 'DNA Dev Argo',
    id: 'DNADevArgo',
    baseURL: 'https://34.136.244.10',
    status: 'Active',
    type: 'harnessManagedArgo'
  },
  {
    name: 'POS Prod Argo Env',
    id: 'POSProdArgoEnv',
    baseURL: 'https://34.136.244.11',
    status: 'Active',
    type: 'harnessManagedArgo'
  },
  {
    name: 'POS Dev Argo Env',
    id: 'POSDevArgoEnv',
    baseURL: 'https://34.136.244.12',
    status: 'Active',
    type: 'nativeArgo'
  }
]

describe('ProvidersGridView snapshot test', () => {
  test('should render ProvidersGridView', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <ProvidersGridView providers={gitOpsProviders} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
