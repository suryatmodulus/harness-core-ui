import React from 'react'
import { Text, Layout, Color, Card, AvatarGroup } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { useStrings } from 'framework/exports'
import { useGetUserGroup } from 'services/cd-ng'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import css from './UserGroupDetails.module.scss'

const UserGroupDetails: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module, userGroupIdentifier } = useParams()

  const { data, loading, error, refetch } = useGetUserGroup({
    identifier: userGroupIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  const userGroup = data?.data
  const avatars =
    data?.data?.users?.map(user => {
      return { email: user }
    }) || []
  if (loading) return <PageSpinner />
  if (error) return <PageError message={error.message} onClick={() => refetch()} />
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
                  label: userGroup.name || ''
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
            {data?.data?.lastModifiedAt && (
              <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
                <Text>{getString('lastUpdated')}</Text>
                <ReactTimeago date={data.data.lastModifiedAt} />
              </Layout.Vertical>
            )}
          </Layout.Horizontal>
        }
      />
      <Page.Body>
        <Layout.Vertical className={css.body} padding="huge">
          <Layout.Vertical spacing="medium" padding={{ bottom: 'large' }}>
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('members')}
            </Text>
            <AvatarGroup avatars={avatars} overlap={false} />
          </Layout.Vertical>
          <Layout.Vertical spacing="medium" padding={{ bottom: 'large' }}>
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('rbac.roleBinding')}
            </Text>
            <Card className={css.card}>
              <RoleBindingsList />
            </Card>
          </Layout.Vertical>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default UserGroupDetails
