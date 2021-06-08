import { Button, Container } from '@wings-software/uicore'
import React from 'react'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Page } from '@common/exports'
import { EmailVerificationBanner } from '@common/components/Banners/EmailVerificationBanner'
import i18n from './AdminPage.i18n'
import css from './AdminPage.module.scss'

const AdminPage: React.FC = () => {
  const { currentUserInfo: user } = useAppStore()
  const bodyClassName = user.emailVerified ? '' : css.hasBanner
  return (
    <>
      <EmailVerificationBanner />
      <Page.Header
        title={i18n.title}
        toolbar={
          <Container>
            <Button text={i18n.addUser} />
          </Container>
        }
      />
      <Page.Body className={bodyClassName}>
        <Page.NoDataCard
          icon="user"
          message={i18n.noData}
          buttonText={i18n.addUser}
          onClick={() => {
            alert('TBD')
          }}
        />
      </Page.Body>
    </>
  )
}

export default AdminPage
