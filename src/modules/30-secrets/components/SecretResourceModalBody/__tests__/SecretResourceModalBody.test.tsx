import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SecretResourceModalBody from '../SecretResourceModalBody'
import mockData from './secretMockData.json'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: []
}

jest.mock('services/cd-ng', () => ({
  useListSecretsV2: jest.fn().mockImplementation(() => {
    return { data: mockData, loading: false }
  })
}))
describe('Secret Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretResourceModalBody {...props}></SecretResourceModalBody>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
