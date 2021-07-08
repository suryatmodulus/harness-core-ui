import React from 'react'
import { Text, Layout, Color, Card, Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useGetUserGroupAggregate, UserGroupAggregateDTO } from 'services/cd-ng'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PrincipalType, useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useUserGroupModal } from '@rbac/modals/UserGroupModal/useUserGroupModal'
import { useLinkToSSOProviderModal } from '@rbac/modals/LinkToSSOProviderModal/useLinkToSSOProviderModal'
import MemberList from '@rbac/pages/UserGroupDetails/views/MemberList'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import ManagePrincipalButton from '@rbac/components/ManagePrincipalButton/ManagePrincipalButton'
import css from './UserGroupDetails.module.scss'

const UserGroupDetails: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module, userGroupIdentifier } =
    useParams<PipelineType<ProjectPathProps & { userGroupIdentifier: string }>>()

  const { data, loading, error, refetch } = useGetUserGroupAggregate({
    identifier: userGroupIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: refetch
  })

  const { openUserGroupModal } = useUserGroupModal({
    onSuccess: refetch
  })

  const { openLinkToSSOProviderModal } = useLinkToSSOProviderModal({
    onSuccess: refetch
  })

  const userGroupAggregateResponse: UserGroupAggregateDTO | undefined = data?.data
  const userGroup = userGroupAggregateResponse?.userGroupDTO

  useDocumentTitle([userGroup?.name || '', getString('common.userGroups')])

  if (loading) return <PageSpinner />
  if (error) return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  if (!userGroup) return <></>
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
                  url: routes.toUserGroups({ accountId, orgIdentifier, projectIdentifier, module }),
                  label: getString('common.userGroups')
                },
                {
                  url: '#',
                  label: userGroup.name
                }
              ]}
            />
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
              <Layout.Vertical padding={{ left: 'medium' }} spacing="xsmall">
                <Text color={Color.BLACK} font="medium">
                  {userGroup.name}
                </Text>
                <Text>{userGroup.description}</Text>
                <Layout.Horizontal padding={{ top: 'small' }}>
                  <TagsRenderer tags={userGroup.tags || /* istanbul ignore next */ {}} length={6} />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Horizontal flex>
            {userGroupAggregateResponse?.lastModifiedAt && (
              <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
                <Text>{getString('lastUpdated')}</Text>
                <ReactTimeago date={userGroupAggregateResponse?.lastModifiedAt} />
              </Layout.Vertical>
            )}
          </Layout.Horizontal>
        }
      />
      <Page.Body className={css.body}>
        <Container width="50%" padding={{ bottom: 'large' }} className={css.membersContainer}>
          <Layout.Horizontal flex>
            <Layout.Horizontal flex={{ alignItems: 'baseline' }} spacing="medium">
              <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
                {getString('members')}
              </Text>
              {userGroup.ssoLinked ? (
                <Layout.Horizontal className={css.truncatedText} flex={{ alignItems: 'center' }} spacing="xsmall">
                  <Text icon={'link'} iconProps={{ color: Color.BLUE_500, size: 10 }} color={Color.BLACK}>
                    {getString('rbac.userDetails.linkToSSOProviderModal.saml')}
                  </Text>
                  <Text lineClamp={1} width={70}>
                    {userGroup.linkedSsoDisplayName}
                  </Text>
                  <Text color={Color.BLACK}>{getString('rbac.userDetails.linkToSSOProviderModal.group')}</Text>
                  <Text lineClamp={1} width={70}>
                    {userGroup.ssoGroupName}
                  </Text>
                </Layout.Horizontal>
              ) : null}
            </Layout.Horizontal>
            <Layout.Horizontal className={cx({ [css.buttonPadding]: userGroup.ssoLinked })}>
              <ManagePrincipalButton
                text={
                  userGroup.ssoLinked
                    ? getString('rbac.userDetails.linkToSSOProviderModal.delinkLabel')
                    : getString('rbac.userDetails.linkToSSOProviderModal.linkLabel')
                }
                icon={userGroup.ssoLinked ? 'cross' : 'link'}
                minimal
                onClick={() => {
                  openLinkToSSOProviderModal(userGroup)
                }}
                resourceType={ResourceType.USERGROUP}
                resourceIdentifier={userGroupIdentifier}
              />
              <ManagePrincipalButton
                disabled={userGroup.ssoLinked}
                tooltip={
                  userGroup.ssoLinked
                    ? getString('rbac.userDetails.linkToSSOProviderModal.btnDisabledTooltipText')
                    : undefined
                }
                text={getString('common.plusNumber', { number: getString('members') })}
                minimal
                onClick={() => {
                  openUserGroupModal(userGroup, true)
                }}
                resourceType={ResourceType.USERGROUP}
                resourceIdentifier={userGroupIdentifier}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
          <MemberList ssoLinked={userGroup.ssoLinked} />
        </Container>
        <Container width="50%" className={css.detailsContainer}>
          <Layout.Vertical spacing="medium" padding={{ bottom: 'large' }}>
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('rbac.roleBinding')}
            </Text>
            <Card className={css.card}>
              <RoleBindingsList data={userGroupAggregateResponse?.roleAssignmentsMetadataDTO} />
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
                  openRoleAssignmentModal(PrincipalType.USER_GROUP, userGroup, data?.data?.roleAssignmentsMetadataDTO)
                }}
                resourceType={ResourceType.USERGROUP}
                resourceIdentifier={userGroupIdentifier}
              />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Container>
      </Page.Body>
    </>
  )
}

export default UserGroupDetails
