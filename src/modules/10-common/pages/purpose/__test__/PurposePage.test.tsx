import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PurposePage } from '../PurposePage'

jest.mock('@common/hooks/useFeatureFlag', () => ({
  useFeatureFlags: jest.fn().mockImplementation(() => {
    return { CDNG_ENABLED: true, CVNG_ENABLED: true, CING_ENABLED: true, CENG_ENABLED: true, CFNG_ENABLED: true }
  })
}))

describe('PurposePage', () => {
  test('should render module description and continue button when select module', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <PurposePage />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.purpose.cd.delivery'))
    await waitFor(() => expect(container).toMatchSnapshot())
  })
})
