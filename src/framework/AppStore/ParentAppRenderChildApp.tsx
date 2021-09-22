import React from 'react'
// import RenderChildAppWrap from 'ChildApplication'
// import { LicenseStoreContext } from 'framework/LicenseStore/LicenseStoreContext'
// import { PermissionsContext } from 'framework/rbac/PermissionsContext'
// import { StringsContext } from 'framework/strings/StringsContext'
// import UseCreateSecretModalReturn from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
// import { AppStoreContext, useAppStore } from './AppStoreContext'
// import { CONTEXT_NAMES as CONTEXT_NAMES_ENUM } from './ChildApptypes'
// import type { ContextData, CONTEXT_NAMES, ParentContext, RenderChildApp, RenderChildAppProps ,SomeMap} from './ChildAppTypes'

export const RenderChildAppInsideParent = () => {
  //   const parentContext: ParentContext = {
  //     appStoreContext: AppStoreContext,
  //     licenseStoreProvider: LicenseStoreContext,
  //     permissionsContext: PermissionsContext,
  //     stringsContext: StringsContext
  //   }
  //   const updateParentContext = <T extends CONTEXT_NAMES_ENUM>(contextKey: T, data: SomeMap<T>) => {
  //     if (contextKey === CONTEXT_NAMES_ENUM.APPSTORE) {
  //       // eslint-disable-next-line react-hooks/rules-of-hooks
  //       const { updateAppStore } = useAppStore()
  //       updateAppStore(data)
  //     }
  //   }
  //   const childAppParams: RenderChildAppProps = {
  //     parentContextObj: {
  //       parentContext: parentContext,
  //     },
  //     commonComponents: { secrets: UseCreateSecretModalReturn }
  //   }

  return <>testing</>
}

export default RenderChildAppInsideParent
