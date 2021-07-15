import { Connectors } from '@connectors/constants'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'

export const HEALTHSOURCE_LIST = [
  {
    name: Connectors.APP_DYNAMICS,
    icon: getConnectorIconByType(Connectors.APP_DYNAMICS)
  },
  {
    name: 'Splunk',
    icon: 'service-splunk'
  },
  {
    name: Connectors.GCP,
    icon: getConnectorIconByType(Connectors.GCP)
  }
]
