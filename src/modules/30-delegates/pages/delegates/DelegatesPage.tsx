import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Scope } from '@common/interfaces/SecretsInterface'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import type { GetDelegateGroupsNGV2WithFilterQueryParams } from 'services/portal'
import { useListDelegateConfigsNgV2WithFilter } from 'services/cd-ng'
import type { DelegateProfileDetailsNg } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

const DelegatesPage: React.FC = ({ children }) => {
  const params = useParams<PipelineType<ProjectPathProps>>()
  const { accountId, orgIdentifier, projectIdentifier, module } = params
  const { getString } = useStrings()
  const [profiles, setProfiles] = useState<DelegateProfileDetailsNg[]>([])

  const { mutate: getDelegateProfiles } = useListDelegateConfigsNgV2WithFilter({
    accountId,
    queryParams: { orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const getDelegates = async () => {
    const delProfilesResponse = await getDelegateProfiles(
      {
        filterType: 'DelegateProfile'
      },
      {
        queryParams: {
          accountId,
          module,
          pageSize: 10,
          searchTerm: ''
        } as GetDelegateGroupsNGV2WithFilterQueryParams
      }
    )
    const resource = delProfilesResponse?.resource as any
    setProfiles(resource?.response || [])
  }

  useEffect(() => {
    getDelegates()
  }, [getDelegateProfiles])

  const links = [
    {
      label: getString('delegate.delegates'),
      to: routes.toDelegateList({ accountId, orgIdentifier, projectIdentifier, module })
    }
  ]
  if (profiles.length > 0) {
    links.push({
      label: getString('delegate.delegateConfigurations'),
      to: routes.toDelegateConfigs({ accountId, orgIdentifier, projectIdentifier, module })
    })
  }
  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: getString('delegate.delegates'),
              [Scope.ORG]: getString('delegates.delegatesTitle'),
              [Scope.ACCOUNT]: getString('delegates.delegatesTitle')
            }}
          />
        }
        toolbar={<TabNavigation size={'small'} links={links} />}
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default DelegatesPage
