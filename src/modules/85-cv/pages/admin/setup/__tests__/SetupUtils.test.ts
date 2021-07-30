import { getIconBySourceType, getMonitoringSourceLabel } from '../SetupUtils'

describe('Unit tests for SetupUtils', () => {
  test('Ensure correct icon is returned based on type', async () => {
    expect(getIconBySourceType('KUBERNETES')).toBe('service-kubernetes')
    expect(getIconBySourceType('PROMETHEUS')).toBe('service-prometheus')
    expect(getIconBySourceType('Prometheus')).toBe('service-prometheus')
    expect(getIconBySourceType('NEW_RELIC')).toBe('service-newrelic')
    expect(getIconBySourceType('NewRelic')).toBe('service-newrelic')
    expect(getIconBySourceType('AppDynamics')).toBe('service-appdynamics')
    expect(getIconBySourceType('APP_DYNAMICS')).toBe('service-appdynamics')
    expect(getIconBySourceType('Stackdriver')).toBe('service-stackdriver')
    expect(getIconBySourceType('StackdriverLog')).toBe('service-stackdriver')
    expect(getIconBySourceType('STACKDRIVER_LOG')).toBe('service-stackdriver')
    expect(getIconBySourceType('HEALTH')).toBe('health')
  })

  test('Ensure monitoring source label is correct given type', async () => {
    expect(getMonitoringSourceLabel('APP_DYNAMICS')).toBe('App Dynamics')
    expect(getMonitoringSourceLabel('SPLUNK')).toBe('Splunk')
    expect(getMonitoringSourceLabel('STACKDRIVER')).toBe('Google Cloud Operations')
    expect(getMonitoringSourceLabel('PROMETHEUS')).toBe('Prometheus')
  })
})
