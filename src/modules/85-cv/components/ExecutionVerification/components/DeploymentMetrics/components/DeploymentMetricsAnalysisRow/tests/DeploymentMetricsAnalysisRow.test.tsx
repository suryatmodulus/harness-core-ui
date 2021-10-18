import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { getRiskColorValue, RiskValues } from '@cv/utils/CommonUtils'
import { DeploymentMetricsAnalysisRow } from '../DeploymentMetricsAnalysisRow'
import { healthSourceTypeToLogo } from '../DeploymentMetricsAnalysisRow.utils'
import { InputData } from './DeploymentMetricsAnalysisRow.mocks'

describe('Unit tests for DeploymentMetricsAnalysisRow', () => {
  test('Ensure given data is rendered correctly', async () => {
    const { container, getByText } = render(<DeploymentMetricsAnalysisRow {...InputData[0]} />)
    await waitFor(() => expect(container.querySelector('[class*="transactionMetric"]')).not.toBeNull())
    expect(container.querySelector('[class*="graphs"]')?.children.length).toBe(8)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.NO_DATA)}"]`).length).toBe(3)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.NO_ANALYSIS)}"]`).length).toBe(1)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.HEALTHY)}"]`).length).toBe(2)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.OBSERVE)}"]`).length).toBe(3)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.NEED_ATTENTION)}"]`).length).toBe(2)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.UNHEALTHY)}"]`).length).toBe(1)
    expect(container.querySelector('[class*="transactionMetric"] [data-icon="service-appdynamics"]')).not.toBeNull()
    getByText('Internal Server Error : 500')
    getByText('Number of Errors')
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
