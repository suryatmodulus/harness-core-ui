import React from 'react'
import { render } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import HealthSourceDrawerContent from '../HealthSourceDrawerContent'

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}
describe('HealthSource table', () => {
  test('should matchsnapshot', () => {
    const props = {
      serviceRef: { label: 'service1', value: 'service1' },
      environmentRef: { label: 'environment1', value: 'environment1' },
      monitoringSourcRef: { monitoredServiceIdentifier: 'ms 101', monitoredServiceName: 'ms_101' },
      setModalOpen: () => false,
      onSuccess: () => {
        return 'sucess'
      },
      modalOpen: true,
      createHeader: () => <h2>Header content</h2>,
      onClose: () => false,
      isEdit: false,
      rowData: null,
      tableData: []
    }
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <HealthSourceDrawerContent {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
