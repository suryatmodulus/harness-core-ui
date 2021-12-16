import type { UseStringsReturn } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'

export function dsconfigTypetoResourcesConnectorDetailsTitle(
  type: ConnectorInfoDTO['type'],
  getString: UseStringsReturn['getString']
): string {
  switch (type) {
    case 'Prometheus':
      return getString('connectors.prometheusConnectorDetails')
    case 'AppDynamics':
      return getString('connectors.appDynamicsDetails')
    case 'NewRelic':
      return getString('connectors.newRelicConnectorDetails')
    case 'Datadog':
      return getString('connectors.datadogConnectorDetails')
    case 'Dynatrace':
      return getString('connectors.dynatraceConnectorDetails')
    case 'SumoLogic':
      return getString('connectors.sumoLogicConnectorDetails')
    case 'Splunk':
      return getString('connectors.splunkConnectorDetails')
    case 'PagerDuty':
      return getString('connectors.pagerDutyConnectorDetails')
    case 'CustomHealth':
      return getString('connectors.customConnectorDetails')
    default:
      return ''
  }
}
