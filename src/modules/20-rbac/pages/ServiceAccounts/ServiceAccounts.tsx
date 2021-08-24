import React, { useState } from 'react'
import { ExpandingSearchInput, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useServiceAccountModal } from '@rbac/modals/ServiceAccountModal/useServiceAccountModal'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useListAggregatedServiceAccounts } from 'services/cd-ng'
import ServiceAccountsListView from '@rbac/pages/ServiceAccounts/views/ServiceAccountsListView'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

const ServiceAccountsPage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  useDocumentTitle(getString('rbac.serviceAccounts.label'))
  const [searchTerm, setsearchTerm] = useState<string>('')
  const [page, setPage] = useState(0)

  const { data, loading, error, refetch } = useListAggregatedServiceAccounts({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      searchTerm: encodeURIComponent(searchTerm),
      pageIndex: page,
      pageSize: 10
    },
    debounce: 300
  })

  const { openServiceAccountModal } = useServiceAccountModal({ onSuccess: () => refetch() })
  const { openRoleAssignmentModal } = useRoleAssignmentModal({ onSuccess: refetch })

  return (
    <>
      <Page.Header
        title={
          <Layout.Horizontal padding={{ left: 'large' }} spacing="small">
            <RbacButton
              text={getString('rbac.serviceAccounts.newServiceAccount')}
              intent="primary"
              icon="plus"
              onClick={() => openServiceAccountModal()}
              permission={{
                permission: PermissionIdentifier.EDIT_SERVICEACCOUNT,
                resource: {
                  resourceType: ResourceType.SERVICEACCOUNT
                }
              }}
            />
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              alwaysExpanded
              placeholder={getString('common.searchPlaceholder')}
              onChange={text => {
                setsearchTerm(text.trim())
              }}
              width={250}
            />
          </Layout.Horizontal>
        }
      />

      <Page.Body
        loading={loading}
        error={(error as any)?.data?.message || error?.message}
        retryOnError={() => refetch()}
        noData={
          !searchTerm
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('rbac.serviceAccounts.noDataDescription'),
                button: (
                  <RbacButton
                    text={getString('rbac.serviceAccounts.newServiceAccount')}
                    intent="primary"
                    icon="plus"
                    onClick={() => openServiceAccountModal()}
                    permission={{
                      permission: PermissionIdentifier.EDIT_SERVICEACCOUNT,
                      resource: {
                        resourceType: ResourceType.SERVICEACCOUNT
                      }
                    }}
                  />
                )
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('rbac.serviceAccounts.noServiceAccounts')
              }
        }
      >
        <ServiceAccountsListView
          data={data?.data}
          reload={refetch}
          openRoleAssignmentModal={openRoleAssignmentModal}
          openServiceAccountModal={openServiceAccountModal}
          gotoPage={(pageNumber: number) => setPage(pageNumber)}
        />
      </Page.Body>
    </>
  )
}

export default ServiceAccountsPage
