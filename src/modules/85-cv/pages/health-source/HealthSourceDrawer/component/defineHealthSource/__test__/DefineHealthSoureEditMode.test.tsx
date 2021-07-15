import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { Container, FormInput } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { SourceDataMock } from './DefineHealthSource.mock'
import DefineHealthSource from '../DefineHealthSource'

const editModeProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesEdit({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    identifier: 'MonitoredService',
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

const MockConnectorObj = {
  connector: {
    identifier: '1234_ident',
    name: 'connector'
  }
}

jest.mock('@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector', () => ({
  ...(jest.requireActual('@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector') as any),
  ConnectorSelection: function MockComponent(props: any) {
    return (
      <Container className="mockInput">
        <FormInput.Text name="connectorRef" />
        <button onClick={() => props.onSuccess(MockConnectorObj)} />
      </Container>
    )
  }
}))

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { ...SourceDataMock },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

describe('DefineHealthSource', () => {
  test('should populate value in edit mode', async () => {
    const { container, getByText } = render(
      <TestWrapper {...editModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )

    fireEvent.click(getByText('next'))
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          appdApplicationName: 'Harness-CI-Manager',
          appdTierName: 'manager',
          connectorRef: 'AppD_Connector_102',
          environmentIdentifier: 'AppDTestEnv',
          environmentName: 'AppDTestEnv',
          healthSourceList: [
            {
              environment: 'AppDTestEnv',
              identifier: 'Test_AppD_101',
              name: 'Test  AppD  101',
              service: 'AppDService',
              spec: {
                appdApplicationName: 'Harness-CI-Manager',
                appdTierName: 'manager',
                connectorRef: 'AppD_Connector_102',
                feature: 'Application Monitoring',
                metricPacks: [{ identifier: 'Errors' }]
              },
              type: 'AppDynamics'
            }
          ],
          healthSourceName: 'Test  AppD  101',
          healthSourceidentifier: 'Test_AppD_101',
          isEdit: true,
          metricPacks: [{ identifier: 'Errors' }],
          monitoredServiceIdentifier: 'Test_Monitored_service',
          monitoringSourceName: 'Test Monitored service ',
          product: { label: 'Application Monitoring', value: 'Application Monitoring' },
          serviceIdentifier: 'AppDService',
          serviceName: 'AppDService',
          sourceType: 'AppDynamics'
        }),
        { tabStatus: 'SUCCESS' }
      )
    )

    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'healthSourceName',
      value: 'AppDHealthSourceName'
    })

    fireEvent.click(getByText('next'))

    await waitFor(() =>
      expect(onNextMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ healthSourceName: 'AppDHealthSourceName' }),
        {
          tabStatus: 'SUCCESS'
        }
      )
    )
  })
})
