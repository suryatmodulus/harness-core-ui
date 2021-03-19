import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockData from './projectMockData.json'
import ProjectResourceModalBody from '../ProjectResourceModalBody'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: []
}

jest.mock('services/cd-ng', () => ({
  useGetProjectList: jest.fn().mockImplementation(() => {
    return { data: { data: { content: mockData } }, refetch: jest.fn(), error: null }
  })
}))
describe('Project Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper>
        <ProjectResourceModalBody {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
