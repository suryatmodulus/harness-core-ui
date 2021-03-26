import React from 'react'
import { Text, Layout, Container, Avatar, Color, Switch, Button } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/exports'
import { Page } from '@common/components'
import { useUserProfile } from '@common/modals/UserProfile/useUserProfile'
import { useChangePassword } from '@common/modals/useChangePassword/useChangePassword'
import UserOverView from './views/UserOverView'
import css from './UserProfile.module.scss'

// Replace with actual api response
const user = {
  email: 'olivia@harness.io',
  name: 'olivia'
}

const UserProfilePage: React.FC = () => {
  const { getString } = useStrings()
  const { openUserProfile } = useUserProfile({ onSuccess: noop })
  const { openPasswordModal } = useChangePassword()

  return (
    <Page.Body filled>
      <Layout.Horizontal height="inherit">
        <Container width="30%" padding="huge" className={css.details}>
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
              <Text icon="lock">
                <Button minimal onClick={openPasswordModal} font={{ weight: 'semi-bold' }} className={css.button}>
                  {getString('userProfile.changePassword')}
                </Button>
              </Text>
            </Layout.Vertical>
            <Layout.Horizontal spacing="huge" padding="large" className={css.authentication} flex>
              <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
                {getString('userProfile.twofactorAuth')}
              </Text>
              <Switch />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Container>
        <Container width="70%">
          <UserOverView />
        </Container>
      </Layout.Horizontal>
    </Page.Body>
  )
}

export default UserProfilePage
