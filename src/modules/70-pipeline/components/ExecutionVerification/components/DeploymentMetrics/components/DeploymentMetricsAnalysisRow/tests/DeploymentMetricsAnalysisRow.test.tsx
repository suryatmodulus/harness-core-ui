import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { DeploymentMetricsAnalysisRow } from '../DeploymentMetricsAnalysisRow'
import { healthSourceTypeToLogo, riskValueToLineColor } from '../DeploymentMetricsAnalysisRow.utils'
import { InputData } from './DeploymentMetricsAnalysisRow.mocks'

describe('Unit tests for DeploymentMetricsAnalysisRow', () => {
  test('Ensure given data is rendered correctly', async () => {
    const { container, getByText } = render(<DeploymentMetricsAnalysisRow {...InputData[0]} />)
    await waitFor(() => expect(container.querySelector('[class*="transactionMetric"]')).not.toBeNull())
    expect(container.querySelector('[class*="graphs"]')?.children.length).toBe(8)
    expect(container.querySelectorAll('path[stroke="var(--red-500)"]').length).toBe(1)
    expect(container.querySelectorAll('path[stroke="var(--grey-300)"]').length).toBe(7)
    expect(container.querySelectorAll('path[stroke="var(--grey-200)"]').length).toBe(1)
    expect(container.querySelector('[class*="transactionMetric"] [data-icon="service-appdynamics"]')).not.toBeNull()
    getByText('Internal Server Error : 500')
    getByText('Number of Errors')
  })

  test('Ensure riskToLineColor function returns correct colors', async () => {
    expect(riskValueToLineColor('NO_DATA')).toEqual('var(--grey-300)')
    expect(riskValueToLineColor('NO_ANALYSIS')).toEqual('var(--grey-300)')
    expect(riskValueToLineColor('MEDIUM')).toEqual('var(--yellow-500)')
    expect(riskValueToLineColor('HIGH')).toEqual('var(--red-500)')
    expect(riskValueToLineColor('LOW')).toEqual('var(--green-500)')
    expect(riskValueToLineColor('' as any)).toEqual('')
  })

  test('Ensure healthSourceTypeToLogo function returns correct logo', async () => {
    expect(healthSourceTypeToLogo('APP_DYNAMICS')).toEqual('service-appdynamics')
    expect(healthSourceTypeToLogo('NEW_RELIC')).toEqual('service-newrelic')
    expect(healthSourceTypeToLogo('PROMETHEUS')).toEqual('service-prometheus')
    expect(healthSourceTypeToLogo('SPLUNK')).toEqual('service-splunk')
    expect(healthSourceTypeToLogo('STACKDRIVER')).toEqual('service-stackdriver')
    expect(healthSourceTypeToLogo('STACKDRIVER_LOG')).toEqual('service-stackdriver')
  })
})
