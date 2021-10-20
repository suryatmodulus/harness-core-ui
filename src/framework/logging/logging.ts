import type { ModuleName } from 'framework/types/ModuleName'

declare global {
  interface Window {
    bugsnagClient: any // eslint-disable-line
  }
}

type LogFunction = (message: string, obj?: Record<string, unknown>) => void

interface Logger {
  error: LogFunction
  info: LogFunction
  warn: LogFunction
  debug: LogFunction
}

const ERROR = 'ERROR'
const WARN = 'WARN'
const INFO = 'INFO'
const DEBUG = 'DEBUG'

enum BUGSNAG_FILTERS {
  ACCOUNT = 'account'
}

export interface BugsnagAccountMeta {
  id: string
}

function log(type: string, module: ModuleName, subModule?: string) {
  return function (message: string, obj: Record<string, unknown> = {}) {
    // Message format: `ModuleName/SubModuleName: Actual Message`, obj
    // This format will make it easier to query logs against a module
    const _message = `${module}${subModule ? `/${subModule}` : ''}: ${message}`

    if (type === ERROR || type === WARN) {
      // Log to Bugsnag if it's available
      window.bugsnagClient?.notify?.(new Error(_message), {
        severity: type === ERROR ? 'error' : 'warning',
        user: obj
      })
    }

    if (type === ERROR) {
      console.error(_message, obj) // eslint-disable-line
    } else if (type === INFO) {
      console.info(_message, obj) // eslint-disable-line
    } else if (type === DEBUG) {
      console.debug(_message, obj) // eslint-disable-line
    } else if (type === WARN) {
      console.warn(_message, obj) // eslint-disable-line
    }
  }
}

export function setBugsnagAccountMeta(data: BugsnagAccountMeta): void {
  window.bugsnagClient?.addMetadata(BUGSNAG_FILTERS.ACCOUNT, data)
}

export function setBugsnagUser(id?: string, email?: string, name?: string): void {
  window.bugsnagClient?.setUser(id, email, name)
}

export const loggerFor = (module: ModuleName, subModule?: string): Logger => ({
  error: log(ERROR, module, subModule),
  info: log(INFO, module, subModule),
  warn: log(WARN, module, subModule),
  debug: log(DEBUG, module, subModule)
})
