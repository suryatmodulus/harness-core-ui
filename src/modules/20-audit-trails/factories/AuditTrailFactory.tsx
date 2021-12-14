import type { IconName } from '@wings-software/uicore'
import type { AuditEventDTO } from 'services/audit'

export type Module = AuditEventDTO['module']

interface Icon {
  iconName: IconName
  size?: number
}

interface AuditTrailModuleHandlerProps {
  icon: Icon
  resourceRenderer?: (data: AuditEventDTO) => React.ReactElement
  eventSummaryRenderer?: () => React.ReactElement
}

class AuditTrailFactory {
  private readonly map: Map<Module, AuditTrailModuleHandlerProps>

  constructor() {
    this.map = new Map()
  }

  registerHandler(module: Module, props: AuditTrailModuleHandlerProps): void {
    this.map.set(module, props)
  }

  getModuleProperties(module: Module): AuditTrailModuleHandlerProps | undefined {
    return this.map.get(module)
  }
}

export default new AuditTrailFactory()
