import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import WelcomePage from '../WelcomePage'

jest.mock('services/cd-ng', () => ({
  useUpdateAccountDefaultExperienceNG: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn() }
  })
}))

const featureFlags = {
  CDNG_ENABLED: true,
  CVNG_ENABLED: true,
  CING_ENABLED: true,
  CENG_ENABLED: true,
  CFNG_ENABLED: true
}

describe('Welcome Page', () => {
  test('Select Module Page Rendering', () => {
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    expect(() => getByText('common.purpose.selectAModule'))
    expect(container).toMatchSnapshot()
  })

  test('Should render ModuleInfo page when select any module and continue', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('cd'))
    fireEvent.click(getByText('continue'))
    await waitFor(() => getByText('common.purpose.cd.description'))
    expect(container).toMatchSnapshot()
  })
})
