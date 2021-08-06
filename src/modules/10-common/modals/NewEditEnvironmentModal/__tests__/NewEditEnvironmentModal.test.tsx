import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { NewEditEnvironmentModal } from '../NewEditEnvironmentModal'
import environments from './mock.json'
import inputSetEnvironments from './envMock'

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentList: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() })),
  useGetEnvironmentAccessList: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: inputSetEnvironments, refetch: jest.fn() })),
  useCreateEnvironmentV2: jest.fn().mockImplementation(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(obj => {
      environments.data.content.push({
        environment: {
          accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
          orgIdentifier: 'default',
          projectIdentifier: 'asdasd',
          identifier: obj.identifier,
          name: obj.name,
          description: null,
          color: '#0063F7',
          type: obj.type,
          deleted: false,
          tags: {},
          version: 1
        },
        createdAt: null,
        lastModifiedAt: null
      })
      return {
        status: 'SUCCESS'
      }
    })
  })),
  useUpsertEnvironmentV2: jest.fn().mockImplementation(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS'
      }
    })
  }))
}))

const onSave = jest.fn()
const onClose = jest.fn()

const props = {
  isEdit: false,
  data: { name: '', identifier: '', description: '', tags: {} },
  isEnvironment: true,
  onCreateOrUpdate: onSave,
  closeModal: onClose
}

describe('test', () => {
  test('', () => {
    const { container } = render(
      <TestWrapper>
        <NewEditEnvironmentModal {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should validate save', async () => {
    const { container, getByText, getByLabelText } = render(
      <TestWrapper>
        <NewEditEnvironmentModal {...props} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'New Environment'
      }
    ])

    await waitFor(() => expect(getByText('save')).toBeTruthy())

    await act(async () => {
      fireEvent.click(getByLabelText('production'))
    })

    await waitFor(() => expect(getByLabelText('production')).toBeTruthy())

    await act(async () => {
      fireEvent.click(getByText('save'))
    })

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        identifier: 'New_Environment',
        name: 'New Environment',
        description: '',
        tags: {},
        type: 'Production'
      })
    )

    await waitFor(() => expect(getByText('cancel')).toBeTruthy())

    await act(async () => {
      fireEvent.click(getByText('cancel'))
    })

    await waitFor(() => expect(onClose).toHaveBeenCalled())

    expect(container).toMatchSnapshot()
  })
})
