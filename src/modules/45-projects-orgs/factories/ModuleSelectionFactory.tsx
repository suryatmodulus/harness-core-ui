import type { ModuleName } from 'framework/types/ModuleName'

class ModuleSelectionFactory {
  private readonly moduleSelectionMap: Map<ModuleName, JSX.Element>

  constructor() {
    this.moduleSelectionMap = new Map()
  }

  registerModuleSelection(moduleName: ModuleName, ele: JSX.Element): void {
    this.moduleSelectionMap.set(moduleName, ele)
  }
  getModuleSelectionEle(moduleName: ModuleName): JSX.Element | undefined {
    return this.moduleSelectionMap.get(moduleName)
  }
}

export default new ModuleSelectionFactory()
