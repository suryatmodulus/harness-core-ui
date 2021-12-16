import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ManifestConfig } from 'services/cd-ng'
import { GitRepoName, ManifestStoreMap } from '../Manifesthelper'

export const getRepositoryName = (prevStepData: any, initialValues: ManifestConfig): string => {
  const gitConnectionType: string = prevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account
  let repoName = ''
  if (getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED) {
    repoName = prevStepData?.connectorRef
  } else if (prevStepData?.connectorRef) {
    if (connectionType === GitRepoName.Repo) {
      repoName = prevStepData?.connectorRef?.connector?.spec?.url
    } else {
      const connectorScope = getScopeFromValue(initialValues?.spec?.store?.spec?.connectorRef)
      if (connectorScope === Scope.ACCOUNT) {
        if (
          initialValues?.spec?.store.spec?.connectorRef ===
          `account.${prevStepData?.connectorRef?.connector?.identifier}`
        ) {
          repoName = initialValues?.spec?.store?.spec?.repoName
        } else {
          repoName = ''
        }
      } else {
        repoName =
          prevStepData?.connectorRef?.connector?.identifier === initialValues?.spec?.store?.spec?.connectorRef
            ? initialValues?.spec?.store?.spec?.repoName
            : ''
      }
    }
    return repoName
  }
  return repoName
}
