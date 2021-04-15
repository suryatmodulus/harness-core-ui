import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import EnvironmentResourceModal from '../EnvironmentResourceModal'
import mockData from './environmentMockData.json'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentList: jest.fn().mockImplementation(() => {
    return { data: mockData, loading: false }
  })
}))
describe('Service Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper>
        <EnvironmentResourceModal {...props}></EnvironmentResourceModal>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
