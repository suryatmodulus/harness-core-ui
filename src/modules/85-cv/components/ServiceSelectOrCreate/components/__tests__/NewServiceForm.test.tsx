import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { useCreateService } from 'services/cd-ng'
import NewServiceForm from '../NewServiceForm'

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}
jest.mock('services/cd-ng')
const useCreateServiceMock = useCreateService as jest.MockedFunction<any>
describe('NewServieForm', () => {
  beforeAll(() => {
    useCreateServiceMock.mockImplementation(() => {
      return {
        cancel: jest.fn(),
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS'
          }
        })
      }
    })
  })

  test('Match snapshot', async () => {
    const onSubmit = jest.fn()
    const onClose = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <NewServiceForm onClose={onClose} onSubmit={onSubmit} />
      </TestWrapper>
    )

    expect(getByText('Submit')).toBeDefined()
    expect(getByText('Cancel')).toBeDefined()

    fireEvent.click(getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()

    fireEvent.click(getByText('Submit'))
    await waitFor(() => expect(getByText('common.validation.nameIsRequired')).toBeDefined())

    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'name',
      value: 'Service 101'
    })

    await waitFor(() => expect(container.querySelector('input[value="Service 101"]')).toBeDefined())

    expect(container).toMatchSnapshot()
  })
})
