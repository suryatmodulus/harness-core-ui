import React from 'react'
import { noop } from 'lodash-es'
import { Container, FormInput } from '@wings-software/uicore'
import { render, fireEvent, queryByText, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import type { UseMutateReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import * as cdService from 'services/cd-ng'
import CreateAppDynamicsConnector from '../CreateAppDynamicsConnector'

const mockIdentifierValidate: cdService.ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesStatus: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn()),
  useGetDelegateSelectors: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.mock('@secrets/components/SecretInput/SecretInput', () => () => (
  <Container className="secret-mock">
    <FormInput.Text name="password" />
  </Container>
))

jest.mock('@connectors/pages/connectors/utils/ConnectorUtils', () => ({
  ...(jest.requireActual('@connectors/pages/connectors/utils/ConnectorUtils') as object),
  setSecretField: async () => ({
    identifier: 'secretIdentifier',
    name: 'secretName',
    referenceString: 'testReferenceString'
  })
}))

describe('Create AppD connector Wizard', () => {
  test('should render form', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAppDynamicsConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          onConnectorCreated={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
          mockIdentifierValidate={mockIdentifierValidate}
        />
      </TestWrapper>
    )

    // match step 1
    expect(container).toMatchSnapshot()

    // fill step 1
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    expect(container).toMatchSnapshot()

    // step 2
    expect(queryByText(container, 'Username')).toBeDefined()
    fireEvent.click(getByText('Connect and Save')) // trying to create coonector with step 2 data

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="url"]')!, {
        target: { value: 'dummy url' }
      })
    })
    expect(container).toMatchSnapshot()
    const backBtn = getByText('Back')
    fireEvent.click(backBtn)
    // Coonector name should be retained in step 1
    expect(queryByText(container, 'dummy name')).toBeDefined()
  })

  test('ensure onCreateConnector is called', async () => {
    jest.spyOn(cdService, 'useCreateConnector').mockReturnValue({
      mutate: jest.fn().mockReturnValue({ status: 'SUCCESS', data: {} }) as unknown
    } as UseMutateReturn<any, any, any, any, any>)
    const onSuccessMock = jest.fn()
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAppDynamicsConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          onConnectorCreated={onSuccessMock}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
          mockIdentifierValidate={mockIdentifierValidate}
        />
      </TestWrapper>
    )

    // fill step 1
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    await waitFor(() => expect(document.body.querySelector('input[name="password"]')).not.toBeNull())
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'url',
      value: 'https://sdfs.com'
    })
    await setFieldValue({ container: document.body, type: InputTypes.TEXTFIELD, fieldId: 'username', value: 'sdffsf' })
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'accountName',
      value: 'semi-auto'
    })
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'password',
      value: 'dsf-auto'
    })

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('submit button is not rendered.')
    }
    await act(async () => {
      fireEvent.click(submitButton)
    })
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    await waitFor(() => expect(onSuccessMock).toHaveBeenCalledWith({}))
  })

  test('update works as expected', async () => {
    jest.spyOn(cdService, 'useUpdateConnector').mockReturnValue({
      mutate: jest.fn().mockReturnValue({
        status: 'SUCCESS',
        data: {
          name: 'mockResponseName',
          identifier: 'mockResponseIdentifier'
        }
      }) as unknown
    } as UseMutateReturn<any, any, any, any, any>)
    const onSuccessMock = jest.fn()
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAppDynamicsConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          onConnectorCreated={onSuccessMock}
          isEditMode={true}
          setIsEditMode={noop}
          connectorInfo={{
            identifier: 'Connector1',
            name: 'Connector1',
            type: 'AppDynamics',
            spec: {
              controllerUrl: 'test.com',
              accountname: 'harness-test',
              username: 'uitest@harness.io',
              passwordRef: 'testRef'
            }
          }}
          mockIdentifierValidate={mockIdentifierValidate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelector('input[name="name"]')).not.toBeNull())

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'name',
      value: 'Connector1update'
    })

    await waitFor(() => expect(container.querySelector('button[type="submit"]')).not.toBeNull())

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'password',
      value: 'newPass'
    })

    await waitFor(() => expect(container.querySelector('button[type="submit"]')).not.toBeNull())

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(onSuccessMock).toHaveBeenCalledWith({
      name: 'mockResponseName',
      identifier: 'mockResponseIdentifier'
    })
  })
})
