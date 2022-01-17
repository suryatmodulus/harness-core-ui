/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import VerifyStepHealthSourceTable from '../VerifyStepHealthSourceTable'
import { tableData } from './HealthSourceTable.mock'

describe('Verify VerifyStepHealthSourceTable', () => {
  test('should render with isRunTimeInput false', async () => {
    const onSuccess = jest.fn()
    const props = {
      serviceIdentifier: 'service101',
      envIdentifier: 'env101',
      healthSourcesList: tableData as any,
      monitoredServiceRef: { identifier: 'ms101', name: 'ms 101' },
      onSuccess: onSuccess,
      isRunTimeInput: false,
      changeSourcesList: []
    }
    const { container, getByText } = render(
      <TestWrapper>
        <VerifyStepHealthSourceTable {...props} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('plusAdd')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })

  test('should render with isRunTimeInput true', async () => {
    const onSuccess = jest.fn()
    const props = {
      serviceIdentifier: 'service101',
      envIdentifier: 'env101',
      healthSourcesList: tableData as any,
      monitoredServiceRef: { identifier: 'ms101', name: 'ms 101' },
      onSuccess: onSuccess,
      isRunTimeInput: true,
      changeSourcesList: []
    }
    const { container } = render(
      <TestWrapper>
        <VerifyStepHealthSourceTable {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
