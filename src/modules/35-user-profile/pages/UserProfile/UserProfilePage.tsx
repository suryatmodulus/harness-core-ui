import React from 'react'
import { Text, Layout, Container, Avatar, Color, Switch, Button } from '@wings-software/uicore'
import { useChangePassword } from '@user-profile/modals/useChangePassword/useChangePassword'
import { useUserProfile } from '@user-profile/modals/UserProfile/useUserProfile'
import { useAppStore, useStrings } from 'framework/exports'
import { Page } from '@common/components'
import UserOverView from './views/UserOverView'
import css from './UserProfile.module.scss'

const UserProfilePage: React.FC = () => {
  const { getString } = useStrings()
  const { openPasswordModal } = useChangePassword()

  const { currentUserInfo: user } = useAppStore()

  const { openUserProfile } = useUserProfile({})

  return (
    <Page.Body filled>
      <Layout.Horizontal height="inherit">
        <Container width="30%" className={css.details}>
          <Layout.Vertical>
            <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
              <Button icon="edit" data-testid="editUserProfile" minimal onClick={() => openUserProfile(user)} />
            </Layout.Horizontal>
            <Layout.Vertical spacing="medium">
              <Avatar email={user.email} size="large" hoverCard={false} className={css.avatar} />
              <Text color={Color.BLACK} font={{ size: 'large', weight: 'semi-bold' }}>
                {user.name}
              </Text>
            </Layout.Vertical>

            <Layout.Vertical padding={{ top: 'huge', bottom: 'huge' }} spacing="medium">
              <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }} padding={{ bottom: 'medium' }}>
                {getString('userProfile.basicInformation')}
              </Text>
              <Text icon="main-email" iconProps={{ padding: { right: 'medium' } }}>
                {user.email}
              </Text>
              {__DEV__ ? (
                <Text icon="lock" iconProps={{ padding: { right: 'medium' } }}>
                  <Button minimal onClick={openPasswordModal} font={{ weight: 'semi-bold' }} className={css.button}>
                    {getString('userProfile.changePassword')}
                  </Button>
                </Text>
              ) : null}
            </Layout.Vertical>
            {__DEV__ ? (
              <Layout.Horizontal spacing="huge" padding="large" className={css.authentication} flex>
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
                  {getString('userProfile.twofactorAuth')}
                </Text>
                <Switch />
              </Layout.Horizontal>
            ) : null}
          </Layout.Vertical>
        </Container>
        <Container width="70%" className={css.overview}>
          <UserOverView />
        </Container>
      </Layout.Horizontal>
    </Page.Body>
  )
}

export default UserProfilePage
