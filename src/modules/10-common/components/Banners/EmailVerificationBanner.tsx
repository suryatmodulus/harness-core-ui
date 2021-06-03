import React, { useState } from 'react'
import { Text, Layout, Icon, Button, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useResendVerifyEmail } from 'services/cd-ng'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'
import { Page } from '../Page/Page'
import css from './EmailVerificationBanner.module.scss'

export const EmailVerificationBanner = (): React.ReactElement => {
  const { getString } = useStrings()
  const { currentUserInfo } = useAppStore()
  const { mutate: resendEmail, loading } = useResendVerifyEmail({
    userId: currentUserInfo.uuid || '',
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })
  const { showError } = useToaster()
  const [sendSuccess, setSendSuccess] = useState(false)

  const handleResendEmail = async (): Promise<void> => {
    try {
      await resendEmail()
      setSendSuccess(true)
    } catch (error) {
      showError(error.data?.message)
    }
  }

  if (currentUserInfo.emailVerified) {
    return <></>
  }

  return sendSuccess ? (
    <Page.Header
      className={cx(css.page, css.sendSuccess)}
      title={''}
      content={
        <Layout.Horizontal spacing="small" padding={{ right: 'xxxlarge' }}>
          <Icon style={{ paddingTop: 6, color: 'var(--green-500)' }} name="deployment-success-legacy" size={18} />
          <Text color={'var(--green-500)'} style={{ lineHeight: 2.5, fontWeight: 500 }}>
            {getString('common.banners.email.success' as keyof StringsMap)}
          </Text>
        </Layout.Horizontal>
      }
    />
  ) : (
    <Page.Header
      className={cx(css.page, css.notSend)}
      title={''}
      content={
        <Layout.Horizontal spacing="xxxlarge">
          <Layout.Horizontal spacing="small" padding={{ right: 'xxxlarge' }}>
            <Icon style={{ paddingTop: 6, color: 'var(--orange-500)' }} name="deployment-incomplete-legacy" size={18} />
            <Text style={{ lineHeight: 2.5, fontWeight: 500 }}>
              {getString('common.banners.email.description' as keyof StringsMap)}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="small">
            <Button
              padding="xsmall"
              disabled={loading}
              text={getString('common.banners.email.resend' as keyof StringsMap)}
              onClick={handleResendEmail}
            />
            {loading && <Icon name="steps-spinner" size={20} color={Color.BLUE_600} style={{ marginTop: 7 }} />}
          </Layout.Horizontal>
        </Layout.Horizontal>
      }
    />
  )
}
