import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, Color, Container, Card, AvatarGroup, Button } from '@wings-software/uicore'
import { useGetBatchUserGroupList } from 'services/cd-ng'
import { useMutateAsGet } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import cssUserSummary from '@user-profile/components/UserSummary/UserSummary.module.scss'

const MyGroups: React.FC = () => {
  const { getString } = useStrings()
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<AccountPathProps>()

  const { data: userGroups, loading: fetchingUserGroups, error, refetch } = useMutateAsGet(useGetBatchUserGroupList, {
    body: {
      accountIdentifier: accountId,
      userIdentifierFilter: [currentUserInfo.uuid || '']
      // orgIdentifier,
      // projectIdentifier,
    }
  })

  return (
    <Layout.Vertical spacing="medium" margin={{ bottom: 'huge' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }} spacing="medium">
        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_900}>
          {getString('userProfile.myGroups')}
        </Text>
        {userGroups?.data && (
          <Text
            font={{ weight: 'bold' }}
            color={Color.BLUE_500}
            padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
            background={Color.BLUE_200}
            border={{ radius: 8 }} // Border radius is not working
          >
            {userGroups?.data?.length}
          </Text>
        )}
      </Layout.Horizontal>
      {error ? (
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
          <Text color={Color.RED_800}>{error?.message || getString('errorTitle')}</Text>
          <Button minimal onClick={() => refetch()} disabled={fetchingUserGroups}>
            {getString('retry')}
          </Button>
        </Layout.Horizontal>
      ) : userGroups?.data ? (
        userGroups.data.length ? (
          <Container className={cssUserSummary.myGroupsCardContainer}>
            {userGroups?.data?.map(userGroup => (
              <Card key={userGroup.identifier} className={cssUserSummary.card}>
                <Text
                  icon="search-user-groups"
                  iconProps={{ size: 35, padding: { right: 'medium' } }}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  color={Color.GREY_800}
                >
                  {userGroup.name}
                </Text>
                <AvatarGroup
                  avatars={
                    userGroup.users?.map(user => ({
                      name: user,
                      email: user
                    })) || []
                  }
                  restrictLengthTo={6}
                />
              </Card>
            ))}
          </Container>
        ) : (
          <Text color={Color.GREY_700}>{getString('rbac.userGroupPage.noUserGroups')}</Text>
        )
      ) : null}
    </Layout.Vertical>
  )
}

export default MyGroups
