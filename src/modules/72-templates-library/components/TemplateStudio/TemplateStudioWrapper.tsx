import React from 'react'
import { useParams } from 'react-router-dom'
import { TemplateStudio } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { TemplateProvider } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type {
  GitQueryParams,
  ModulePathParams,
  TemplateStudioPathProps,
  TemplateStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'

export const TemplateStudioWrapper: React.FC = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { versionLabel, repoIdentifier, branch } = useQueryParams<TemplateStudioQueryParams & GitQueryParams>()
  return (
    <TemplateProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      templateIdentifier={templateIdentifier}
      versionLabel={versionLabel}
    >
      <GitSyncStoreProvider>
        <TemplateStudio />
      </GitSyncStoreProvider>
    </TemplateProvider>
  )
}
