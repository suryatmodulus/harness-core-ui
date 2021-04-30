import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PrometheusMonitoringSource } from '../PrometheusMonitoringSource'
import { transformPrometheusDSConfigIntoPrometheusSetupSource } from '../utils'
import type { PrometheusDSConfig } from '../constants'

const MockDSConfig = {
  accountId: '1234_accountId',
  orgIdentifier: 'harness_test',
  projectIdentifier: 'raghu_p',
  productName: 'apm',
  connectorIdentifier: 'prometheus',
  identifier: 'PrometheusForEnv',
  monitoringSourceName: 'PrometheusForEnv',
  type: 'PROMETHEUS',
  url: 'https://promtheusurl.com'
}

describe('Unit tests for NewRelicMonitoringSources', () => {
  test('Ensure basic render works', async () => {
    const { container, getAllByText } = render(
      <TestWrapper>
        <PrometheusMonitoringSource />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('.bp3-tabs')).not.toBeNull())
    expect(getAllByText('cv.onboarding.monitoringSources.defineMonitoringSource').length).toBe(2)
  })

  test('Ensure edit flow is handled', async () => {
    // withuot data
    expect(
      transformPrometheusDSConfigIntoPrometheusSetupSource({
        accountId: '1234_accountId',
        orgIdentifier: '1234_org',
        projectIdentifier: '1234_project'
      })
    ).toEqual({
      accountId: '1234_accountId',
      identifier: 'Prometheus',
      isEdit: false,
      url: '',
      monitoringSourceName: 'Prometheus',
      orgIdentifier: '1234_org',
      productName: 'apm',
      projectIdentifier: '1234_project',
      type: 'PROMETHEUS'
    })
    // with data
    expect(
      transformPrometheusDSConfigIntoPrometheusSetupSource(
        {
          accountId: '1234_accountId',
          orgIdentifier: '1234_org',
          projectIdentifier: '1234_project'
        },
        (MockDSConfig as unknown) as PrometheusDSConfig
      )
    ).toEqual({
      accountId: '1234_accountId',
      connectorIdentifier: 'prometheus',
      connectorRef: {
        label: 'prometheus',
        value: 'prometheus'
      },
      identifier: 'PrometheusForEnv',
      isEdit: true,
      url: 'https://promtheusurl.com',
      monitoringSourceName: 'PrometheusForEnv',
      orgIdentifier: 'harness_test',
      productName: 'apm',
      projectIdentifier: 'raghu_p',
      type: 'PROMETHEUS'
    })
  })
})
