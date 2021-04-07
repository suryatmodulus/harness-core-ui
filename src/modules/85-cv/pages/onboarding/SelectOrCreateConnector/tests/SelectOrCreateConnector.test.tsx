import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import type { UseGetReturn } from 'restful-react'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdService from 'services/cd-ng'
import {
  getQueryParamsBasedOnScope,
  SelectOrCreateConnector,
  SelectOrCreateConnectorFieldNames,
  SelectOrCreateConnectorProps
} from '../SelectOrCreateConnector'

function WrapperComponent(props: SelectOrCreateConnectorProps): JSX.Element {
  return (
    <TestWrapper
      path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
      pathParams={{
        accountId: '1234_accountId',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG'
      }}
    >
      <Formik initialValues={{}} onSubmit={() => undefined}>
        {formikProps => (
          <FormikForm className="wrapperForm">
            <SelectOrCreateConnector
              {...props}
              onSuccess={data =>
                formikProps.setFieldValue(SelectOrCreateConnectorFieldNames.CONNECTOR_REF, {
                  label: data?.connector?.name,
                  value: data?.connector?.identifier
                })
              }
            />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for SelectorCreateConnector', () => {
  test('Ensure that when a value is provided, fetch connector api is only called once', async () => {
    const refetchMock = jest.fn()
    const useGetConnectorSpy = jest.spyOn(cdService, 'useGetConnector')
    useGetConnectorSpy.mockReturnValue({
      loading: false,
      refetch: refetchMock as any,
      data: { data: { connector: { name: 'solo', identifier: 'solo' } } }
    } as UseGetReturn<any, any, any, any>)
    const onSuccessMockFn = jest.fn()
    const { container, getByText } = render(
      <WrapperComponent
        connectorType="K8sCluster"
        value={{ label: 'solo', value: 'solo' }}
        iconName="service-kubernetes"
        iconLabel="sdosds"
        createConnectorText="something"
        connectToMonitoringSourceText="solo-dolo"
        firstTimeSetupText="+ something"
        onSuccess={onSuccessMockFn}
      />
    )

    await waitFor(() => expect(container.querySelector('[class*="wrapperForm"]')).not.toBeNull())
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
    expect(getByText('solo')).not.toBeNull()
  })

  test('Ensure that when api is loading, loading state is rendered', async () => {
    const refetchMock = jest.fn()
    const useGetConnectorSpy = jest.spyOn(cdService, 'useGetConnector')
    useGetConnectorSpy.mockReturnValue({
      loading: true,
      refetch: refetchMock as any
    } as UseGetReturn<any, any, any, any>)
    const onSuccessMockFn = jest.fn()
    const { container } = render(
      <WrapperComponent
        connectorType="K8sCluster"
        value={{ label: 'solo', value: 'solo' }}
        iconName="service-kubernetes"
        iconLabel="sdosds"
        createConnectorText="something"
        connectToMonitoringSourceText="solo-dolo"
        firstTimeSetupText="+ something"
        onSuccess={onSuccessMockFn}
      />
    )

    await waitFor(() => expect(container.querySelector('[class*="wrapperForm"]')).not.toBeNull())
    expect(container.querySelector('input[value="Loading..."]')).not.toBeNull()
  })

  test('Ensure that when connectorDisabled prop is passed, the connector selection is disabled', async () => {
    const refetchMock = jest.fn()
    const useGetConnectorSpy = jest.spyOn(cdService, 'useGetConnector')
    useGetConnectorSpy.mockReturnValue({
      loading: false,
      data: { data: { connector: { name: 'solo', identifier: 'solo' } } },
      refetch: refetchMock as any
    } as UseGetReturn<any, any, any, any>)
    const onSuccessMockFn = jest.fn()
    const { container } = render(
      <WrapperComponent
        connectorType="K8sCluster"
        value={{ label: 'solo', value: 'solo' }}
        iconName="service-kubernetes"
        iconLabel="sdosds"
        createConnectorText="something"
        connectToMonitoringSourceText="solo-dolo"
        disableConnector={true}
        firstTimeSetupText="+ something"
        onSuccess={onSuccessMockFn}
      />
    )

    await waitFor(() => expect(container.querySelector('[class*="wrapperForm"]')).not.toBeNull())
    expect(container.querySelector('[class*="disabledConnector"] input')?.getAttribute('disabled')).toEqual('')
  })

  test('Ensure queryParams are correct', async () => {
    const params: ProjectPathProps = {
      accountId: '1234_accountId',
      projectIdentifier: '1234_projectIdentifier',
      orgIdentifier: '1234_orgIdentifier'
    }
    expect(getQueryParamsBasedOnScope('account.connectorName', params)).toEqual({ accountIdentifier: params.accountId })
    expect(getQueryParamsBasedOnScope('org.connectorName', params)).toEqual({
      accountIdentifier: params.accountId,
      orgIdentifier: params.orgIdentifier
    })
    expect(getQueryParamsBasedOnScope('connectorName', params)).toEqual({
      accountIdentifier: params.accountId,
      orgIdentifier: params.orgIdentifier,
      projectIdentifier: params.projectIdentifier
    })
  })
})
