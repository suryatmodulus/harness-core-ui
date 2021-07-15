import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import PerspectiveDetailsPage from '../PerspectiveReportsAndBudgets'
import PerspectiveScheduledReportsResponse from './PerspectiveScheduledReportsResponse.json'

jest.mock('services/ce', () => ({
  ...(jest.requireActual('services/ce') as any),
  useGetReportSetting: jest.fn().mockImplementation(() => {
    return { data: PerspectiveScheduledReportsResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test cases for Perspective Reports and Budget page', () => {
  test('should be able to render the reports and budget component', async () => {
    const handlePrevButtonClick = jest.fn().mockImplementationOnce(() => ({}))
    const { container } = render(
      <TestWrapper pathParams={params}>
        <PerspectiveDetailsPage onPrevButtonClick={handlePrevButtonClick} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
