import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { NewRelicMonitoringSource } from '../NewRelicMonitoringSource'
import { NewRelicDSConfig, transformNewRelicDSConfigIntoNewRelicSetupSource } from '../NewRelicMonitoringSourceUtils'

const MockDSConfig = {
  accountId: '1234_accountId',
  orgIdentifier: 'harness_test',
  projectIdentifier: 'raghu_p',
  productName: 'apm',
  connectorIdentifier: 'newRelic',
  identifier: 'MyNewRelicSourceharness_test-raghu_p',
  monitoringSourceName: 'MyNewRelicSourceharness_test-raghu_p',
  newRelicServiceConfigList: [
    {
      applicationName: 'My Application',
      applicationId: 107019083,
      envIdentifier: 'test',
      serviceIdentifier: 'todolist',
      metricPacks: [
        {
          uuid: '1234_uuid',
          createdAt: 0,
          lastUpdatedAt: 0,
          accountId: '1234_accountId',
          orgIdentifier: 'harness_test',
          projectIdentifier: 'raghu_p',
          dataSourceType: 'NEW_RELIC',
          identifier: 'Performance',
          category: 'Performance',
          metrics: [
            { name: 'Calls per Minute', type: 'THROUGHPUT', jsonPath: null, included: true, thresholds: null },
            {
              name: 'Average Response Time (ms)',
              type: 'RESP_TIME',
              jsonPath: null,
              included: true,
              thresholds: null
            },
            { name: 'Errors per Minute', type: 'ERROR', jsonPath: null, included: true, thresholds: null }
          ]
        }
      ]
    }
  ],
  type: 'NEW_RELIC'
}

describe('Unit tests for NewRelicMonitoringSources', () => {
  test('Ensure basic render works', async () => {
    const { container, getAllByText } = render(
      <TestWrapper>
        <NewRelicMonitoringSource />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('.bp3-tabs')).not.toBeNull())
    expect(getAllByText('cv.onboarding.monitoringSources.defineMonitoringSource').length).toBe(2)
  })

  test('Ensure edit flow is handled', async () => {
    // withuot data
    expect(
      transformNewRelicDSConfigIntoNewRelicSetupSource({
        accountId: '1234_accountId',
        orgIdentifier: '1234_org',
        projectIdentifier: '1234_project'
      })
    ).toEqual({
      accountId: '1234_accountId',
      identifier: 'NewRelic',
      isEdit: false,
      mappedServicesAndEnvs: new Map(),
      monitoringSourceName: 'NewRelic',
      orgIdentifier: '1234_org',
      productName: 'apm',
      projectIdentifier: '1234_project',
      type: 'NEW_RELIC'
    })
    // with data
    expect(
      transformNewRelicDSConfigIntoNewRelicSetupSource(
        {
          accountId: '1234_accountId',
          orgIdentifier: '1234_org',
          projectIdentifier: '1234_project'
        },
        (MockDSConfig as unknown) as NewRelicDSConfig
      )
    ).toEqual({
      accountId: '1234_accountId',
      connectorIdentifier: 'newRelic',
      connectorRef: {
        label: 'newRelic',
        value: 'newRelic'
      },
      identifier: 'MyNewRelicSourceharness_test-raghu_p',
      isEdit: true,
      mappedServicesAndEnvs: new Map([
        [
          107019083,
          {
            applicationId: 107019083,
            applicationName: 'My Application',
            environment: {
              label: 'test',
              value: 'test'
            },
            service: {
              label: 'todolist',
              value: 'todolist'
            }
          }
        ]
      ]),
      monitoringSourceName: 'MyNewRelicSourceharness_test-raghu_p',
      orgIdentifier: 'harness_test',
      productName: 'apm',
      projectIdentifier: 'raghu_p',
      type: 'NEW_RELIC'
    })
  })
})
