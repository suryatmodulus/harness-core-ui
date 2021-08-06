import React from 'react'
import { act, render, fireEvent, waitFor } from '@testing-library/react'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { NewEditServiceModal } from '../NewEditServiceModal'
import serviceData, { inputSetServiceData } from './serviceMock'

const onSave = jest.fn()
const onClose = jest.fn()

const props = {
  isEdit: false,
  data: { name: '', identifier: '', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' },
  isService: true,
  onCreateOrUpdate: onSave,
  closeModal: onClose
}

jest.mock('services/cd-ng', () => ({
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: serviceData, refetch: jest.fn() })),
  useGetServiceAccessList: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: inputSetServiceData, refetch: jest.fn() })),
  useCreateServicesV2: jest.fn().mockImplementation(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(obj => {
      serviceData.data.content.push({
        service: {
          accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
          identifier: obj[0].identifier,
          orgIdentifier: 'default',
          projectIdentifier: 'asdsaff',
          name: obj[0].name,
          description: null,
          deleted: false,
          tags: {},
          version: 9
        },
        createdAt: null,
        lastModifiedAt: null
      })
      return {
        status: 'SUCCESS'
      }
    })
  })),
  useUpsertServiceV2: jest.fn().mockImplementation(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS'
      }
    })
  }))
}))

describe('Test NewEditServiceModal', () => {
  test('should validate snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <NewEditServiceModal {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should validate save', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <NewEditServiceModal {...props} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'New Service'
      }
    ])

    await waitFor(() => expect(getByText('save')).toBeTruthy())

    await act(async () => {
      fireEvent.click(getByText('save'))
    })

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        identifier: 'New_Service',
        name: 'New Service',
        orgIdentifier: 'orgIdentifier',
        projectIdentifier: 'projectIdentifier'
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
