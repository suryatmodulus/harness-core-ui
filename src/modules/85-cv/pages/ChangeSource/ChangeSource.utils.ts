import type { IconName } from '@wings-software/uicore'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import type { ChangeSourceDTO } from 'services/cv'
import { HARNESS_CD } from './ChangeSourceDrawer/ChangeSourceDrawer.constants'

export const getIconBySource = (source: ChangeSourceDTO['type']): IconName => {
  switch (source) {
    case HARNESS_CD:
      return 'cd-main' as IconName
    default:
      return getConnectorIconByType(source || '')
  }
}
