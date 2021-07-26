import { Connectors } from '@connectors/constants'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'

export const HEALTHSOURCE_LIST = [
  {
    name: Connectors.APP_DYNAMICS,
    icon: getConnectorIconByType(Connectors.APP_DYNAMICS)
  },
  {
    name: Connectors.GCP,
    icon: getConnectorIconByType(Connectors.GCP)
  },
  {
    name: Connectors.PROMETHEUS,
    icon: getConnectorIconByType(Connectors.PROMETHEUS)
  },
  {
    name: Connectors.NEW_RELIC,
    icon: getConnectorIconByType(Connectors.NEW_RELIC)
  }
]

export const NewRelicProductNames = {
  APM: 'apm'
}
