import { createContext, useContext } from 'react'
import type { SetStateAction } from 'react'

export enum ExecutionLayoutState {
  RIGHT = 'RIGHT',
  BOTTOM = 'BOTTOM',
  FLOATING = 'FLOATING',
  MINIMIZE = 'MINIMIZE'
}

export interface ExecutionLayoutContextParams {
  layout: ExecutionLayoutState
  setLayout(action: SetStateAction<ExecutionLayoutState>): void
  primaryPaneSize: number
  setPrimaryPaneSize(action: SetStateAction<number>): void
  tertiaryPaneSize: number
  setTertiaryPaneSize(action: SetStateAction<number>): void
  isStepDetailsVisible: boolean
  restoreDialog(): void
  setStepDetailsVisibility(action: SetStateAction<boolean>): void
}

export const ExecutionLayoutContext = createContext<ExecutionLayoutContextParams>({
  layout: ExecutionLayoutState.RIGHT,
  setLayout: /* istanbul ignore next */ () => void 0,
  primaryPaneSize: 0,
  tertiaryPaneSize: 0,
  setPrimaryPaneSize: /* istanbul ignore next */ () => void 0,
  setTertiaryPaneSize: /* istanbul ignore next */ () => void 0,
  isStepDetailsVisible: false,
  restoreDialog: /* istanbul ignore next */ () => void 0,
  setStepDetailsVisibility: /* istanbul ignore next */ () => void 0
})

export function useExecutionLayoutContext(): ExecutionLayoutContextParams {
  return useContext(ExecutionLayoutContext)
}
