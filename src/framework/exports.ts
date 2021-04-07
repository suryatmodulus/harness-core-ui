/*
 * This file contains Framework exports which can be consumed by Modules.
 * Note: You should never export internal Framework entities like LayoutManager, RouteMounter, SidebarMounter, etc...
 */
export { String, useStrings } from './strings/String'
export { useAppStore } from './AppStore/AppStoreContext'
export type { StringProps, UseStringsReturn } from './strings/String'
export type { StringsMap, StringKeys } from './strings/StringsContext'

export { loggerFor } from './logging/logging'
export { ModuleName } from './types/ModuleName'
export { SidebarIdentifier } from './types/SidebarIdentifider'
