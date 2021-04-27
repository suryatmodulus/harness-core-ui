import React from 'react'
import { Text, Layout, Color, Card, Button, Avatar } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useGetAggregatedUser } from 'services/cd-ng'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PrincipalType, useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import css from './UserDetails.module.scss'

const UserDetails: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module, userIdentifier } = useParams<
    PipelineType<ProjectPathProps & { userIdentifier: string }>
  >()

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
  const roleBindings = data?.data?.roleBindings?.map(item => ({
    item: `${item.roleName} - ${item.resourceGroupName}`,
    managed: item.managedRole
  }))

  useDocumentTitle([user?.name || '', getString('users')])

  if (loading) return <PageSpinner />
  if (error) return <PageError message={error.message} onClick={() => refetch()} />
  if (!user) return <></>
  return (
    <>
      <Page.Header
        size="xlarge"
        className={css.header}
        title={
          <Layout.Vertical>
            <Breadcrumbs
              links={[
                {
                  url: routes.toAccessControl({ accountId, orgIdentifier, projectIdentifier, module }),
                  label: getString('accessControl')
                },
                {
                  url: routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }),
                  label: getString('users')
                },
                {
                  url: '#',
                  label: user.name || ''
                }
              ]}
            />
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
              <Avatar email={user.email} name={user.name} size="large" hoverCard={false} />
              <Layout.Vertical padding={{ left: 'medium' }} spacing="xsmall">
                <Text color={Color.BLACK} font="medium">
                  {user.name}
                </Text>
                <Text>{user.email}</Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
      />
      <Page.Body className={css.body}>
        <Layout.Vertical width="100%" padding="large">
          <Layout.Vertical spacing="medium" padding={{ bottom: 'large' }}>
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('rbac.roleBinding')}
            </Text>
            <Card className={css.card}>
              <RoleBindingsList data={roleBindings} />
            </Card>
            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              padding={{ top: 'medium' }}
            >
              <Button
                data-testid={'addRole-UserGroup'}
                text={getString('common.plusNumber', { number: getString('common.role') })}
                minimal
                className={css.addButton}
                onClick={event => {
                  event.stopPropagation()
                  openRoleAssignmentModal(PrincipalType.USER, user, data?.data?.roleBindings)
                }}
              />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default UserDetails
