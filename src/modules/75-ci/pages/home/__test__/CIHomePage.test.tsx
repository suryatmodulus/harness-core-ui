import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CIHomePage from '../CIHomePage'

jest.mock('services/portal', () => ({
  useGetModuleLicenseInfo: jest.fn().mockImplementation(() => {
    return {
      data: null
    }
  })
}))

describe('CIHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CIHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
