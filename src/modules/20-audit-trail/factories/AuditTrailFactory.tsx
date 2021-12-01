import type { IconName } from '@wings-software/uicore'
import type { AuditEventDTO } from 'services/audit'

export type Module = AuditEventDTO['module']

interface AuditTrailModuleHandlerProps {
  iconName: IconName
  resourceRenderer?: (data: AuditEventDTO) => React.ReactElement
}

class AuditTrailFactory {
  private map: Map<Module, AuditTrailModuleHandlerProps>

  constructor() {
    this.map = new Map()
  }

  registerModuleHandler(module: Module, props: AuditTrailModuleHandlerProps): void {
    this.map.set(module, props)
  }

  getModuleProperties(module: Module): AuditTrailModuleHandlerProps | undefined {
    return this.map.get(module)
  }
}

export default new AuditTrailFactory()
