import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Radio, Container, Color, Layout, Collapse, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { AuthenticationSettingsResponse } from 'services/cd-ng'
import { useUpdateAuthMechanism } from 'services/cd-ng'
import { AuthenticationMechanisms } from '@common/constants/Utils'
import { useToaster } from '@common/components'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import HarnessAccount from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount'
import PublicOAuthProviders from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/OAuthProviders/PublicOAuthProviders'
import cssConfiguration from '@common/pages/AuthenticationSettings/Configuration/Configuration.module.scss'

interface Props {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
}

const AccountAndOAuth: React.FC<Props> = ({ authSettings, refetchAuthSettings }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const userPasswordOrOauthEnabled =
    authSettings.authenticationMechanism === AuthenticationMechanisms.USER_PASSWORD ||
    /* istanbul ignore next */ authSettings.authenticationMechanism === AuthenticationMechanisms.OAUTH

  const { mutate: updateAuthMechanism, loading: updatingAuthMechanism } = useUpdateAuthMechanism({})

  const submitUserPasswordUpdate = async (
    authenticationMechanism: keyof typeof AuthenticationMechanisms,
    message: string
  ): Promise<void> => {
    try {
      const response = await updateAuthMechanism(undefined, {
        queryParams: {
          accountIdentifier: accountId,
          authenticationMechanism: authenticationMechanism
        }
      })

      /* istanbul ignore else */ if (response) {
        refetchAuthSettings()
        showSuccess(message, 5000)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
    }
  }

  const { openDialog: enableAccountAndOauthLogin } = useConfirmationDialog({
    titleText: getString('common.authSettings.enableHarnessAccountOrOauthLogin'),
    contentText: (
      <React.Fragment>
        <Text color={Color.BLACK} padding={{ bottom: 'xlarge' }}>
          {getString('common.authSettings.changeLoginToHarnessAccountOrOauth')}
        </Text>
        <Text inline color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }}>
          {getString('common.note')}
        </Text>
        <Text inline color={Color.BLACK} font={{ size: 'normal' }}>
          : {getString('common.authSettings.changeLoginToHarnessAccountOrOauthDescription')} {getString('common.link')}
        </Text>
        {/*TODO: forgot-password link will be replaced with constant once it's available in RouteDefinitions */}
        {/* <Link to="/forgot-password">{getString('common.link')}</Link>. */}
      </React.Fragment>
    ),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        submitUserPasswordUpdate(
          AuthenticationMechanisms.USER_PASSWORD,
          getString('common.authSettings.accountOrOAuthLoginEnabledSuccessfully')
        )
      }
    }
  })

  return (
    <Container margin="xlarge" background={Color.WHITE}>
      <Collapse
        isOpen={userPasswordOrOauthEnabled}
        collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName, cssConfiguration.height60)}
        collapseClassName={cssConfiguration.collapseClassName}
        collapsedIcon="main-chevron-down"
        expandedIcon="main-chevron-up"
        heading={
          <Container margin={{ left: 'xlarge' }}>
            <Radio
              label={getString('common.authSettings.accountOrOAuthLogin')}
              font={{ weight: 'bold', size: 'normal' }}
              color={Color.GREY_900}
              checked={userPasswordOrOauthEnabled}
              disabled={updatingAuthMechanism}
              onChange={enableAccountAndOauthLogin}
            />
          </Container>
        }
      >
        <Layout.Vertical spacing="large" margin={{ left: 'xxlarge', right: 'xxlarge' }}>
          <HarnessAccount
            authSettings={authSettings}
            refetchAuthSettings={refetchAuthSettings}
            submitUserPasswordUpdate={submitUserPasswordUpdate}
            updatingAuthMechanism={updatingAuthMechanism}
          />
          <PublicOAuthProviders authSettings={authSettings} refetchAuthSettings={refetchAuthSettings} />
          <Container height={10} />
        </Layout.Vertical>
      </Collapse>
    </Container>
  )
}

export default AccountAndOAuth
