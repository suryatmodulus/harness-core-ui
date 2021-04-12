import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import ConnectorResourceModalBody from '../ConnectorResourceModalBody'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('@common/hooks', () => ({
  useMutateAsGet: jest.fn().mockImplementation(() => ({ data: connectorsData, loading: false }))
}))
describe('Connector Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorResourceModalBody {...props}></ConnectorResourceModalBody>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
