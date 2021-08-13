import React from 'react'
import { Text, Layout, Color, Avatar, Card } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import { useListAggregatedServiceAccounts } from 'services/cd-ng'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import type { ModulePathParams, ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import { PrincipalType, useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import ApiKeyList from '@rbac/components/ApiKeyList/ApiKeyList'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import css from './ServiceAccountDetails.module.scss'

const ServiceAccountDetails: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps & ModulePathParams
  >()

  const { data, loading, error, refetch } = useListAggregatedServiceAccounts({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      identifiers: [serviceAccountIdentifier]
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: refetch
  })

  const serviceAccountData = data?.data?.content?.[0]

  useDocumentTitle([serviceAccountData?.serviceAccount?.name || '', getString('serviceAccount')])

  if (loading) return <PageSpinner />
  if (error) return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  if (!serviceAccountData) return <PageError onClick={() => refetch()} />

  return (
    <>
      <Page.Header
        size="xlarge"
        className={css.header}
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toAccessControl({ accountId, orgIdentifier, projectIdentifier, module }),
                label: getString('accessControl')
              },
              {
                url: routes.toServiceAccounts({ accountId, orgIdentifier, projectIdentifier, module }),
                label: getString('rbac.serviceAccounts.label')
              }
            ]}
          />
        }
        title={
          <Layout.Horizontal spacing="medium">
            <Avatar
              name={serviceAccountData.serviceAccount.name}
              email={serviceAccountData.serviceAccount.email}
              hoverCard={false}
              size="medium"
            />
            <Layout.Vertical padding={{ left: 'small' }} spacing="xsmall" className={css.width}>
              <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'start' }}>
                <Text color={Color.BLACK} lineClamp={1} font="medium" className={css.wrap}>
                  {serviceAccountData.serviceAccount.name}
                </Text>
                <Text icon="main-email" lineClamp={1} className={css.wrap}>
                  {serviceAccountData.serviceAccount.email}
                </Text>
              </Layout.Horizontal>
              <Text lineClamp={1} className={css.wrap}>
                {serviceAccountData.serviceAccount.description}
              </Text>
              <Layout.Horizontal padding={{ top: 'small' }}>
                <TagsRenderer
                  tags={serviceAccountData.serviceAccount.tags || /* istanbul ignore next */ {}}
                  length={6}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal flex>
            <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
              <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>
                {getString('created')}
              </Text>
              <Text font="small" color={Color.BLACK}>
                {moment(serviceAccountData.createdAt).format('MM/DD/YYYY hh:mm:ss a')}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical spacing="xsmall" padding={{ left: 'xlarge' }}>
              <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>
                {getString('common.lastModifiedTime')}
              </Text>
              <Text font="small" color={Color.BLACK}>
                {moment(serviceAccountData.lastModifiedAt).format('MM/DD/YYYY hh:mm:ss a')}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        }
      />
      <Page.Body className={css.body}>
        <Layout.Vertical spacing="medium" padding={{ bottom: 'large' }}>
          <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
            {getString('rbac.roleBinding')}
          </Text>
          <Card className={css.card}>
            <RoleBindingsList data={serviceAccountData.roleAssignmentsMetadataDTO} />
          </Card>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} padding={{ top: 'medium' }}>
            <RbacButton
              data-testid={'addRole-ServiceAccount'}
              text={getString('common.plusNumber', { number: getString('common.role') })}
              minimal
              onClick={event => {
                event.stopPropagation()
                openRoleAssignmentModal(
                  PrincipalType.SERVICE,
                  serviceAccountData.serviceAccount,
                  serviceAccountData.roleAssignmentsMetadataDTO
                )
              }}
              permission={{
                permission: PermissionIdentifier.EDIT_SERVICEACCOUNT,
                resource: {
                  resourceType: ResourceType.SERVICEACCOUNT,
                  resourceIdentifier: serviceAccountData.serviceAccount.identifier
                }
              }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
        <ApiKeyList />
      </Page.Body>
    </>
  )
}

export default ServiceAccountDetails
