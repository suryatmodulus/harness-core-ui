import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { useCreateService } from 'services/cd-ng'
import NewServiceForm from '../NewServiceForm'
import { responseData } from './NewServiceForm.mock'

jest.mock('services/cd-ng')
const useCreateServiceMock = useCreateService as jest.MockedFunction<any>

const onSubmit = jest.fn()
const onClose = jest.fn()

describe('NewServieForm', () => {
  test('Match snapshot', async () => {
    useCreateServiceMock.mockImplementation(() => {
      return {
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            data: responseData
          }
        })
      }
    })

    const { container, getByText } = render(
      <TestWrapper>
        <NewServiceForm onClose={onClose} onSubmit={onSubmit} />
      </TestWrapper>
    )

    expect(getByText('submit')).toBeDefined()
    expect(getByText('cancel')).toBeDefined()

    fireEvent.click(getByText('cancel'))
    expect(onClose).toHaveBeenCalled()

    fireEvent.click(getByText('submit'))
    await waitFor(() => expect(getByText('common.validation.nameIsRequired')).toBeDefined())

    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'name',
      value: 'Service 101'
    })

    await waitFor(() => expect(container.querySelector('input[value="Service 101"]')).toBeDefined())
    act(() => {
      fireEvent.click(getByText('submit'))
    })

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(responseData))
    expect(container).toMatchSnapshot()
  })
})
