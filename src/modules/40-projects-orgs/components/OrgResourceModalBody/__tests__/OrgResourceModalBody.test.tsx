import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockData from './orgMockData.json'
import OrgResourceModalBody from '../OrgResourceModalBody'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: []
}

jest.mock('services/cd-ng', () => ({
  useGetOrganizationList: jest.fn().mockImplementation(() => {
    return { data: mockData, loading: false }
  })
}))

describe('Org Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper>
        <OrgResourceModalBody {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
