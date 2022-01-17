/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { useCreateService } from 'services/cd-ng'
import { ServiceSelectOrCreate } from '../ServiceSelectOrCreate'

jest.mock('services/cd-ng')
const useCreateServiceMock = useCreateService as jest.MockedFunction<any>

const onSelect = jest.fn()
const onNewCreated = jest.fn()

describe('ServiceSelectOrCreate', () => {
  test('Match Snapshot', async () => {
    useCreateServiceMock.mockImplementation(() => {
      return {
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            data: {}
          }
        })
      }
    })
    const { container, getByText } = render(
      <TestWrapper>
        <ServiceSelectOrCreate
          options={[{ value: 'serice101', label: 'serice101' }]}
          onSelect={onSelect}
          onNewCreated={onNewCreated}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-popover-target')).toBeTruthy())

    await fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'service',
        value: 'serice101'
      }
    ])

    await waitFor(() => expect(getByText('serice101')).toBeTruthy())

    await fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'service',
        value: '@@add_new'
      }
    ])

    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
  })
})
