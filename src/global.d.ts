/* eslint-disable @typescript-eslint/no-explicit-any */
declare const __DEV__: boolean
declare const Bugsnag: any
declare const __ON_PREM__: booelan
declare const __BUGSNAG_RELEASE_VERSION__: string
declare module '*.png' {
  const value: string
  export default value
}
declare module '*.jpg' {
  const value: string
  export default value
}
declare module '*.svg' {
  const value: string
  export default value
}

declare module '*.gif' {
  const value: string
  export default value
}

declare module '*.mp4' {
  const value: string
  export default value
}
declare module '*.yaml' {
  const value: Record<string, any>
  export default value
}

declare module '*.yml' {
  const value: Record<string, any>
  export default value
}

declare module '*.gql' {
  const query: string
  export default query
}

declare interface Window {
  apiUrl: string
  segmentToken: string
  HARNESS_ENABLE_NG_AUTH_UI: boolean
  bugsnagClient: any
  bugsnagToken: string
  Harness: {
    openNgTooltipEditor: () => void
  }
  MktoForms2: any
}

declare const monaco: any

declare module 'event-source-polyfill'
