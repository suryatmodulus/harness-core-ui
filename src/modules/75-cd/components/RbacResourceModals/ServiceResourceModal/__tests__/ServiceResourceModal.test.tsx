import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ServiceResourceModal from '../ServiceResourceModal'
import mockData from './serviceMockData.json'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('services/cd-ng', () => ({
  useGetServiceList: jest.fn().mockImplementation(() => {
    return { data: mockData, loading: false }
  })
}))
describe('Service Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper>
        <ServiceResourceModal {...props}></ServiceResourceModal>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
