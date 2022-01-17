/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { ExpandingSearchInput, Layout, Container, ButtonVariation } from '@wings-software/uicore'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { OrganizationAggregateDTO, useGetOrganizationAggregateDTOList, Error } from 'services/cd-ng'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useOrganizationModal } from '@projects-orgs/modals/OrganizationModal/useOrganizationModal'
import { OrganizationCard } from '@projects-orgs/components/OrganizationCard/OrganizationCard'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
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
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      text={getString('projectsOrgs.newOrganization')}
      onClick={() => openOrganizationModal()}
      permission={{
        permission: PermissionIdentifier.CREATE_ORG,
        resource: {
          resourceType: ResourceType.ORGANIZATION
        }
      }}
      featuresProps={{
        featuresRequest: {
          featureNames: [FeatureIdentifier.MULTIPLE_ORGANIZATIONS]
        }
      }}
    />
  )

  return (
    <>
      <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('orgsText')} />
      <Page.Header
        title={<Layout.Horizontal padding="small">{newOrgButton()}</Layout.Horizontal>}
        toolbar={
          <ExpandingSearchInput
            alwaysExpanded
            placeholder={getString('projectsOrgs.searchPlaceHolder')}
            onChange={text => {
              setSearchParam(text.trim())
            }}
            className={css.search}
            width={320}
          />
        }
      />
      <Page.Body
        loading={loading}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={
          !searchParam
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-dashboard',
                message: getString('projectsOrgs.noDataMessage'),
                button: newOrgButton()
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-dashboard',
                message: getString('projectsOrgs.noOrganizations')
              }
        }
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
