import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ChangesAndServiceDependency from '../ChangesAndServiceDependency'

jest.mock('services/cv', () => ({
  useChangeEventList: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
describe('ChangesAndServiceDependency', () => {
  test('should render', async () => {
    const { container, getAllByText } = render(
      <TestWrapper>
        <ChangesAndServiceDependency
          startTime={0}
          endTime={1}
          hasChangeSource
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getAllByText('cv.monitoredServices.noAvailableData')).toHaveLength(2))
    expect(container).toMatchSnapshot()
  })
})
