/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, Layout, Button, Color, Page } from '@wings-software/uicore'
import cx from 'classnames'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useResendVerifyEmail } from 'services/cd-ng'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import css from './EmailVerificationBanner.module.scss'

export const EmailVerificationBanner = (): React.ReactElement => {
  const { getString } = useStrings()
  const { currentUserInfo } = useAppStore()
  const { mutate: resendEmail, loading } = useResendVerifyEmail({
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

  if (currentUserInfo.emailVerified === undefined || currentUserInfo.emailVerified) {
    return <></>
  }

  return sendSuccess ? (
    <Page.Header
      className={cx(css.page, css.sendSuccess)}
      title={''}
      content={
        <Text
          color={Color.GREEN_500}
          font={{ weight: 'semi-bold' }}
          icon={'deployment-success-legacy'}
          iconProps={{ size: 18 }}
        >
          {getString('common.banners.email.success')}
        </Text>
      }
    />
  ) : (
    <Page.Header
      className={cx(css.page, css.notSend)}
      title={''}
      content={
        <Layout.Horizontal spacing="xxxlarge">
          <Text font={{ weight: 'semi-bold' }} icon="deployment-incomplete-legacy" iconProps={{ size: 18 }}>
            {getString('common.banners.email.description')}
          </Text>

          <Button
            className={css.resend}
            padding="xsmall"
            disabled={loading}
            text={getString('common.banners.email.resend')}
            onClick={handleResendEmail}
          />
        </Layout.Horizontal>
      }
    />
  )
}
