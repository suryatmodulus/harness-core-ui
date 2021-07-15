import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { HealthSourceList } from './HealthSourceTable.mock'
import HealthSourceTable from '../HealthSourceTable'

const editModeProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesEdit({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    identifier: 'MonitoredService',
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

const healthSourceTableProps = {
  value: HealthSourceList,
  monitoringSourcRef: { monitoredServiceIdentifier: 'ms 101', monitoredServiceName: 'ms_101' },
  serviceRef: { label: 'service1', value: 'service1' },
  environmentRef: { label: 'environment1', value: 'environment1' },
  isEdit: false,
  type: 'AppDynamics',
  onSuccess: jest.fn(),
  onDelete: jest.fn()
}

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { productName: 'apm' },
      onNext: jest.fn(),
      onPrevious: jest.fn()
    })
  }
}))

jest.mock('@cv/components/ContextMenuActions/ContextMenuActions', () => (props: any) => {
  return (
    <>
      <div className="context-menu-mock-edit" onClick={props.onEdit} />
      <div className="context-menu-mock-delete" onClick={healthSourceTableProps.onDelete} />
    </>
  )
})

describe('HealthSource table', () => {
  test('check delete and edit row', async () => {
    const { container } = render(
      <TestWrapper {...editModeProps}>
        <HealthSourceTable
          isEdit={true}
          value={HealthSourceList}
          onSuccess={healthSourceTableProps.onSuccess}
          onDelete={healthSourceTableProps.onDelete}
          serviceRef={healthSourceTableProps.serviceRef}
          environmentRef={healthSourceTableProps.environmentRef}
          monitoringSourcRef={healthSourceTableProps.monitoringSourcRef}
        />
      </TestWrapper>
    )

    //render rows based on data
    await waitFor(() => expect(container.querySelectorAll('[role="row"]').length).toEqual(3))

    fireEvent.click(container.querySelector('.context-menu-mock-delete')!)
    await waitFor(() => expect(healthSourceTableProps.onDelete).toHaveBeenCalled())

    fireEvent.click(container.querySelector('.context-menu-mock-edit')!)
    await waitFor(() => expect(container.querySelector('.health-source-right-drawer')).toBeDefined())

    expect(container).toMatchSnapshot()
  })
})
