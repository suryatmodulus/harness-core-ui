import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ActivityList from '../ActivityList'
import connectivitySummary from '../../ActivityHistory/__tests__/mockData/connectivitySummary.json'
import activityData from '../../ActivityHistory/__tests__/mockData/activityData.json'

describe('Activity List', () => {
  test('render all activity', () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors/dmfjhkd" pathParams={{ accountId: 'dummy' }}>
        <ActivityList
          activityList={activityData as any}
          connectivitySummary={connectivitySummary as any}
          entityIdentifier="entityId"
          dateRange={['From' as unknown as Date, 'To' as unknown as Date]}
          refetchActivities={jest.fn()}
          refetchConnectivitySummary={jest.fn()}
          showConnectivityChecks={true}
          showOtherActivity={true}
        />
      </TestWrapper>
    )
    expect(getByText('activityHistory.connectivityCheck')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
  test('render only connectivity check activity', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors/dmfjhkd" pathParams={{ accountId: 'dummy' }}>
        <ActivityList
          activityList={activityData as any}
          connectivitySummary={connectivitySummary as any}
          entityIdentifier="entityId"
          dateRange={['From' as unknown as Date, 'To' as unknown as Date]}
          refetchActivities={jest.fn()}
          refetchConnectivitySummary={jest.fn()}
          showConnectivityChecks={true}
          showOtherActivity={false}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
