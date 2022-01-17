/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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

  test('Should render ModuleInfo page when select cd module and continue', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('cd'))
    fireEvent.click(getByText('continue'))
    await waitFor(() => getByText('common.purpose.cd.newGen.description'))
    fireEvent.click(getByText('common.purpose.cd.newGen.description'))
    expect(container).toMatchSnapshot()
    fireEvent.click(getByText('common.purpose.cd.1stGen.description'))
    fireEvent.click(getByTestId('continueCg'))
  })

  test('Should go to module home page when select non cd module and continue', async () => {
    const { container, getByText, getByTestId, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('ci'))
    fireEvent.click(getByText('continue'))
    await waitFor(() => expect(queryByText('common.purpose.ci.description')).not.toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })
})
