import { useParams } from 'react-router-dom'
import type { ModuleName as ModuleNameEnum } from 'framework/types/ModuleName'

type ModuleName = Exclude<keyof typeof ModuleNameEnum, 'COMMON' | 'FRAMEWORK' | 'DX'>

export interface UseCurrentModulePayload {
  module: string | undefined
  isModule: (moduleName: ModuleName) => boolean
}

export default function useCurrentModule(): UseCurrentModulePayload {
  const { module } = useParams<{ module: string }>()
  const isModule = (moduleName: ModuleName): boolean => moduleName.toLowerCase() === module

  return { module, isModule }
}
