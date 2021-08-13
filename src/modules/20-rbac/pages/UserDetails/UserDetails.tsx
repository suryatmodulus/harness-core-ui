import React from 'react'
import { Text, Layout, Color, Card, Avatar, Icon } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useGetAggregatedUser } from 'services/cd-ng'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import type { PipelineType, ProjectPathProps, UserPathProps } from '@common/interfaces/RouteInterfaces'
import { PrincipalType, useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import ManagePrincipalButton from '@rbac/components/ManagePrincipalButton/ManagePrincipalButton'
import UserGroupTable from './views/UserGroupTable'
import css from './UserDetails.module.scss'

const UserDetails: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module, userIdentifier } =
    useParams<PipelineType<ProjectPathProps & UserPathProps>>()

  const { data, loading, error, refetch } = useGetAggregatedUser({
    userId: userIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: refetch
  })

  const user = data?.data?.user

  useDocumentTitle([user?.name || '', getString('users')])

  if (loading) return <PageSpinner />
  if (error) return <PageError message={error.message} onClick={() => refetch()} />
  if (!user) return <></>
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
                url: routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }),
                label: getString('users')
              }
            ]}
          />
        }
        title={
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
            {user.locked ? (
              <Icon
                name="lock"
                border
                className={css.lockIcon}
                width={72}
                height={72}
                size={32}
                color={Color.WHITE}
                background={Color.GREY_300}
                flex={{ align: 'center-center' }}
                margin={{ left: 'xsmall', right: 'xsmall' }}
              />
            ) : (
              <Avatar name={user.name || user.email} email={user.email} size="large" hoverCard={false} />
            )}

            <Layout.Vertical padding={{ left: 'medium' }} spacing="xsmall">
              <Layout.Horizontal flex={{ alignItems: 'baseline' }} spacing="xsmall">
                <Text color={Color.BLACK} font="medium">
                  {user.name}
                </Text>
                {user.locked ? <Text color={Color.GREY_400}>{getString('rbac.usersPage.lockedOutLabel')}</Text> : null}
              </Layout.Horizontal>
              <Text>{user.email}</Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        }
      />
      <Page.Body className={css.body}>
        <Layout.Vertical width="100%" padding="large">
          <UserGroupTable />
          <Layout.Vertical spacing="medium" padding={{ bottom: 'large' }}>
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('rbac.roleBinding')}
            </Text>
            <Card className={css.card}>
              <RoleBindingsList data={data?.data?.roleAssignmentMetadata} />
            </Card>
            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              padding={{ top: 'medium' }}
            >
              <ManagePrincipalButton
                data-testid={'addRole-UserGroup'}
                text={getString('common.plusNumber', { number: getString('common.role') })}
                minimal
                intent="primary"
                onClick={event => {
                  event.stopPropagation()
                  openRoleAssignmentModal(PrincipalType.USER, user, data?.data?.roleAssignmentMetadata)
                }}
                resourceIdentifier={user.uuid}
                resourceType={ResourceType.USER}
              />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default UserDetails
