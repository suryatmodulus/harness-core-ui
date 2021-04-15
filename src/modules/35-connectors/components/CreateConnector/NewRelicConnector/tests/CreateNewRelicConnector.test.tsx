import React from 'react'
import { noop } from 'lodash-es'
import { Container, FormInput } from '@wings-software/uicore'
import { render, fireEvent, queryByText, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import * as toaster from '@common/components/Toaster/useToaster'
import * as portalService from 'services/portal'
import * as cdService from 'services/cd-ng'
import * as cvService from 'services/cv'
import CreateNewRelicConnector from '../CreateNewRelicConnector'

const mockIdentifierValidate: cdService.ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

jest.mock('@secrets/components/SecretInput/SecretInput', () => () => (
  <Container className="secret-mock">
    <FormInput.Text name="apiKeyRef" />
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

describe('Create newrelic connector Wizard', () => {
  beforeEach(() => {
    jest.spyOn(portalService, 'useGetDelegateSelectors')
  })

  test('should render form', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ data: { data: ['endpoint1', 'endpoint2'] }, loading: false } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
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
    expect(queryByText(container, 'newRelicAccountId')).toBeDefined()
    fireEvent.click(getByText('next')) // trying to create coonector with step 2 data

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="url"]')!, {
        target: { value: 'dummy url' }
      })
    })
    expect(container).toMatchSnapshot()
    const backBtn = getByText('back')
    fireEvent.click(backBtn)
    // Coonector name should be retained in step 1
    expect(queryByText(container, 'dummy name')).toBeDefined()
  })

  test('ensure onCreateConnector is called', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ data: { data: ['endpoint1', 'endpoint2'] }, loading: false } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
    jest.spyOn(cdService, 'useCreateConnector').mockReturnValue({
      mutate: jest.fn().mockReturnValue({ status: 'SUCCESS', data: {} }) as unknown
    } as UseMutateReturn<any, any, any, any, any>)

    const onSuccessMock = jest.fn()
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={onSuccessMock}
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

    await waitFor(() => expect(document.body.querySelector('input[name="apiKeyRef"]')).not.toBeNull())

    //select drop down option
    const selectCaret = document.body
      .querySelector(`[name="url"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    if (!selectCaret) {
      throw Error('Drop down carrot was not rendered')
    }

    fireEvent.click(selectCaret)
    await waitFor(() => expect(document.body.querySelector('[class*="bp3-menu"]')).not.toBeNull())
    const menu = document.body.querySelectorAll('[class*="bp3-menu"] li[class*="menuItem"]')
    fireEvent.click(menu[1])
    await waitFor(() => expect(document.body.querySelector('[name="url"][value="endpoint2"]')).not.toBeNull())

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'newRelicAccountId',
      value: 'semi-auto'
    })
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'dsf-auto'
    })

    jest
      .spyOn(portalService, 'useGetDelegateSelectors')
      .mockReturnValue({ data: [] } as UseGetReturn<any, any, any, any>)
    const submitButton = document.body.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('submit button is not rendered.')
    }
    fireEvent.click(submitButton)
    await waitFor(() => expect(portalService.useGetDelegateSelectors).toHaveBeenCalled())
  })

  test('update works as expected', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ data: { data: ['endpoint1', 'endpoint2'] }, loading: false } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
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
        <CreateNewRelicConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={onSuccessMock}
          isEditMode={true}
          setIsEditMode={noop}
          connectorInfo={{
            identifier: 'Connector1',
            name: 'Connector1',
            type: 'AppDynamics',
            spec: {
              url: 'endpoint2',
              newRelicAccountId: 'harness-test',
              apiKeyRef: 'testRef'
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
      fieldId: 'apiKeyRef',
      value: 'newPass'
    })

    await waitFor(() => expect(container.querySelector('button[type="submit"]')).not.toBeNull())

    jest
      .spyOn(portalService, 'useGetDelegateSelectors')
      .mockReturnValue({ data: [] } as UseGetReturn<any, any, any, any>)
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    await waitFor(() => expect(portalService.useGetDelegateSelectors).toHaveBeenCalled())
  })

  test('Ensure that when endpoint api is loading select says loading', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ loading: true } as UseGetReturn<any, any, any, any>)
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
    render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={onSuccessMock}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
          mockIdentifierValidate={mockIdentifierValidate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelector('input[name="name"]')).not.toBeNull())

    // fill step 1
    await act(async () => {
      fireEvent.change(document.body.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })

    await act(async () => {
      fireEvent.click(document.body.querySelector('button[type="submit"]')!)
    })

    // second step
    await waitFor(() => expect(document.body.querySelector('input[name="apiKeyRef"]')).not.toBeNull())
    expect(document.body.querySelector('input[placeholder="loading"]')).not.toBeNull()
  })

  test('Ensure that when endpoint api is ini error state toaster is displayed', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ error: { message: 'mockError' }, loading: false } as UseGetReturn<any, any, any, any>)
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

    const mockErrorFn = jest.fn()
    jest.spyOn(toaster, 'useToaster').mockReturnValue({
      showError: mockErrorFn,
      clear: jest.fn()
    } as any)

    render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={onSuccessMock}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
          mockIdentifierValidate={mockIdentifierValidate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelector('input[name="name"]')).not.toBeNull())

    // fill step 1
    await act(async () => {
      fireEvent.change(document.body.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })

    await act(async () => {
      fireEvent.click(document.body.querySelector('button[type="submit"]')!)
    })

    // second step
    await waitFor(() => expect(document.body.querySelector('input[name="apiKeyRef"]')).not.toBeNull())
    expect(mockErrorFn).toHaveBeenCalledWith('mockError')
  })
})
