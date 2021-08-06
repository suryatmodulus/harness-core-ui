import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { useCreateService } from 'services/cd-ng'
import { EnvironmentSelectOrCreate } from '../EnvironmentSelectOrCreate'

jest.mock('services/cd-ng')
const useCreateServiceMock = useCreateService as jest.MockedFunction<any>

const onSelect = jest.fn()
const onNewCreated = jest.fn()

describe('EnvironmentSelectOrCreate', () => {
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
        <EnvironmentSelectOrCreate
          options={[{ value: 'env101', label: 'env101' }]}
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
        fieldId: 'environment',
        value: 'env101'
      }
    ])

    await waitFor(() => expect(getByText('env101')).toBeTruthy())

    await fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'environment',
        value: '@@add_new'
      }
    ])

    await waitFor(() => expect(getByText('+ Add New')).toBeTruthy())
  })
})
