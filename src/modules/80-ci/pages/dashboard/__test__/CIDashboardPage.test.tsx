import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import CIDashboardPage from '../CIDashboardPage'

jest.mock('framework/exports', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(jest.requireActual('framework/exports') as object),
  useRouteParams: () => ({
    params: {
      projectIdentifier: 'test'
    }
  })
}))

describe('CIDashboardPage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <CIDashboardPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
