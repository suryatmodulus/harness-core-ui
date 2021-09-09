import type React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { ModuleName } from 'framework/types/ModuleName'

export interface ModuleDashboardHandler {
  icon?: IconName
  label?: keyof StringsMap
  moduleDashboardRenderer?: () => React.ReactElement
}

class LandingDashboardFactory {
  private readonly map: Map<ModuleName, ModuleDashboardHandler>

  constructor() {
    this.map = new Map()
  }

  registerModuleDashboardHandler(moduleName: ModuleName, handler: ModuleDashboardHandler): void {
    this.map.set(moduleName, handler)
  }

  getModuleDashboardHandler(moduleName: ModuleName): ModuleDashboardHandler | undefined {
    return this.map.get(moduleName)
  }
}

export default new LandingDashboardFactory()
