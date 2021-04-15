import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CIBuildSettingsPage from '../CIBuildSettingsPage'

describe('CIBuildSettingsPage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CIBuildSettingsPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
