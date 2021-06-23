import React from 'react'
import { useParams } from 'react-router-dom'
import { Text, Layout, Container, Avatar, Color, Button } from '@wings-software/uicore'
import { useChangePassword } from '@user-profile/modals/useChangePassword/useChangePassword'
import { useUserProfile } from '@user-profile/modals/UserProfile/useUserProfile'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGetAuthenticationSettings } from 'services/cd-ng'
import type { UsernamePasswordSettings } from 'services/cd-ng'
import { Page } from '@common/components'
import TwoFactorAuthentication from '@user-profile/components/TwoFactorAuthentication/TwoFactorAuthentication'
import useSwitchAccountModal from '@common/modals/SwitchAccount/useSwitchAccountModal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { EmailVerificationBanner } from '@common/components/Banners/EmailVerificationBanner'
import { AuthenticationMechanisms } from '@auth-settings/constants/utils'
import UserOverView from './views/UserOverView'
import css from './UserProfile.module.scss'

const UserProfilePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { openSwitchAccountModal } = useSwitchAccountModal({})
  const { openUserProfile } = useUserProfile({})
  const { currentUserInfo: user } = useAppStore()

  const {
    data: loginSettingsData,
    loading: fetchingAuthSettings,
    error: errorWhileFetchingAuthSettings,
    refetch: refetchLoginSettings
  } = useGetAuthenticationSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const userPasswordSettings = loginSettingsData?.resource?.ngAuthSettings?.find(
    ({ settingsType }) => settingsType === AuthenticationMechanisms.USER_PASSWORD
  ) as UsernamePasswordSettings | undefined

  const passwordStrengthPolicy = userPasswordSettings?.loginSettings?.passwordStrengthPolicy

  const { openPasswordModal } = useChangePassword()
  const className = user.emailVerified ? css.noBanner : css.hasBanner

  return (
    <>
      <EmailVerificationBanner />
      <Page.Body
        error={errorWhileFetchingAuthSettings?.message}
        retryOnError={() => refetchLoginSettings()}
        className={className}
      >
        <Layout.Horizontal height="inherit">
          <Container width="30%" className={css.details}>
            <Layout.Vertical>
              <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
                <Button icon="edit" data-testid="editUserProfile" minimal onClick={() => openUserProfile(user)} />
              </Layout.Horizontal>
              <Layout.Vertical spacing="medium">
                <Avatar name={user.name} email={user.email} size="large" hoverCard={false} className={css.avatar} />
                <Text
                  color={Color.BLACK}
                  font={{ size: 'large', weight: 'semi-bold' }}
                  lineClamp={1}
                  className={css.overflow}
                >
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
                <Text icon="lock" iconProps={{ padding: { right: 'medium' } }}>
                  <Button
                    minimal
                    onClick={() => openPasswordModal(passwordStrengthPolicy)}
                    font={{ weight: 'semi-bold' }}
                    className={css.button}
                    disabled={fetchingAuthSettings}
                  >
                    {getString('userProfile.changePassword')}
                  </Button>
                </Text>
                <Text icon="people" iconProps={{ padding: { right: 'medium' } }}>
                  <Button
                    minimal
                    onClick={openSwitchAccountModal}
                    font={{ weight: 'semi-bold' }}
                    className={css.button}
                  >
                    {getString('common.switchAccount')}
                  </Button>
                </Text>
              </Layout.Vertical>
              <Layout.Horizontal spacing="huge" padding="large" className={css.authentication} flex>
                <TwoFactorAuthentication
                  twoFactorAuthenticationDisabled={
                    !!loginSettingsData?.resource?.twoFactorEnabled || fetchingAuthSettings
                  }
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Container>
          <Container width="70%" className={css.overview}>
            <UserOverView />
          </Container>
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default UserProfilePage
