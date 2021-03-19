import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { Button, ExpandingSearchInput, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { OrganizationAggregateDTO, useGetOrganizationAggregateDTOList, Error } from 'services/cd-ng'

import { useOrganizationModal } from '@projects-orgs/modals/OrganizationModal/useOrganizationModal'
import { OrganizationCard } from '@projects-orgs/components/OrganizationCard/OrganizationCard'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import { useStrings } from 'framework/exports'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import i18n from './OrganizationsPage.i18n'
import css from './OrganizationsPage.module.scss'

const OrganizationsPage: React.FC = () => {
  const { accountId } = useParams()
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

  return (
    <>
      <Page.Header title={i18n.organizations} />
      <Page.Header
        title={
          <Layout.Horizontal padding="small">
            <Button intent="primary" icon="plus" text={i18n.newOrganization} onClick={() => openOrganizationModal()} />
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal padding={{ right: 'large' }}>
            <Layout.Horizontal flex>
              <ExpandingSearchInput
                placeholder={getString('orgs.searchPlaceHolder')}
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
          message: i18n.noDataMessage,
          buttonText: i18n.newOrganizationButtonText,
          onClick: () => openOrganizationModal()
        }}
        className={css.orgPage}
      >
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
      </Page.Body>
    </>
  )
}

export default OrganizationsPage
