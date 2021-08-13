import { Connectors } from '@connectors/constants'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { HealthSourceTypes } from '@cv/pages/health-source/types'

export const HEALTHSOURCE_LIST = [
  {
    name: HealthSourceTypes.AppDynamics,
    icon: getConnectorIconByType(Connectors.APP_DYNAMICS)
  },
  {
    name: HealthSourceTypes.GoogleCloudOperations,
    icon: 'service-stackdriver'
  },
  {
    name: HealthSourceTypes.Prometheus,
    icon: getConnectorIconByType(Connectors.PROMETHEUS)
  },
  {
    name: HealthSourceTypes.NewRelic,
    icon: getConnectorIconByType(Connectors.NEW_RELIC)
  }
]

export const NewRelicProductNames = {
  APM: 'apm'
}

export const ConnectorRefFieldName = 'connectorRef'
