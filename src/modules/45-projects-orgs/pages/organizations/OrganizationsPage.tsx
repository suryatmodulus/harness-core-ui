import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { ExpandingSearchInput, Layout, Container } from '@wings-software/uicore'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { OrganizationAggregateDTO, useGetOrganizationAggregateDTOList, Error } from 'services/cd-ng'

import { useOrganizationModal } from '@projects-orgs/modals/OrganizationModal/useOrganizationModal'
import { OrganizationCard } from '@projects-orgs/components/OrganizationCard/OrganizationCard'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import css from './OrganizationsPage.module.scss'

const OrganizationsPage: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const [searchParam, setSearchParam] = useState<string>()
  const history = useHistory()
  const { getString } = useStrings()
  useDocumentTitle(getString('orgsText'))
  const { loading, data, refetch, error } = useGetOrganizationAggregateDTOList({
    queryParams: { accountIdentifier: accountId, searchTerm: searchParam },
    debounce: 300
  })
  const { openOrganizationModal } = useOrganizationModal({
    onSuccess: () => refetch()
  })
  const { openCollaboratorModal } = useCollaboratorModal()

  const newOrgButton = (): JSX.Element => (
    <RbacButton
      intent="primary"
      icon="plus"
      text={getString('orgLabel')}
      onClick={() => openOrganizationModal()}
      permission={{
        permission: PermissionIdentifier.CREATE_ORG,
        resource: {
          resourceType: ResourceType.ORGANIZATION
        }
      }}
    />
  )

  return (
    <>
      <Page.Header title={getString('orgsText')} />
      <Page.Header
        title={<Layout.Horizontal padding="small">{newOrgButton()}</Layout.Horizontal>}
        toolbar={
          <Layout.Horizontal padding={{ right: 'large' }}>
            <Layout.Horizontal flex>
              <ExpandingSearchInput
                placeholder={getString('projectsOrgs.searchPlaceHolder')}
                onChange={text => {
                  setSearchParam(text.trim())
                }}
                className={css.search}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
        }
      />
      <Page.Body
        loading={loading}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={{
          when: () => !data?.data?.content?.length,
          icon: 'nav-dashboard',
          message: getString('projectsOrgs.noDataMessage'),
          button: newOrgButton()
        }}
        className={css.orgPage}
      >
        <Container className={css.masonry}>
          <Layout.Masonry
            center
            gutter={20}
            items={data?.data?.content || []}
            renderItem={(org: OrganizationAggregateDTO) => (
              <OrganizationCard
                data={org}
                editOrg={() => openOrganizationModal(org.organizationResponse.organization)}
                inviteCollab={() =>
                  openCollaboratorModal({ orgIdentifier: org.organizationResponse.organization.identifier })
                }
                reloadOrgs={() => refetch()}
                onClick={() =>
                  history.push(
                    routes.toOrganizationDetails({
                      orgIdentifier: org.organizationResponse.organization.identifier as string,
                      accountId
                    })
                  )
                }
              />
            )}
            keyOf={(org: OrganizationAggregateDTO) => org.organizationResponse.organization.identifier as string}
          />
        </Container>
      </Page.Body>
    </>
  )
}

export default OrganizationsPage
