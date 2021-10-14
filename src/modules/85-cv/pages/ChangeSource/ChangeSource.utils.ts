import type { IconName } from '@wings-software/uicore'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import type { ChangeSourceDTO } from 'services/cv'
import { HARNESS_CD, HARNESS_CD_NEXTGEN } from './ChangeSourceDrawer/ChangeSourceDrawer.constants'

export const getIconBySource = (source: ChangeSourceDTO['type']): IconName => {
  switch (source) {
    case HARNESS_CD_NEXTGEN:
      return 'cd-main' as IconName
    case HARNESS_CD:
      return 'harness' as IconName
    default:
      return getConnectorIconByType(source || '')
  }
}
