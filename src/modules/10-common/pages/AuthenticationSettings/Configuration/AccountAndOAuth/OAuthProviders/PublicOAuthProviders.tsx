import React from 'react'
import { useParams } from 'react-router-dom'
import { Collapse, Text, Container, Card, Color, Switch } from '@wings-software/uicore'
import { useToaster } from '@common/components'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useStrings } from 'framework/strings'
import type { AuthenticationSettingsResponse, OAuthSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useUpdateOauthProviders, useUpdateAuthMechanism, useRemoveOauthMechanism } from 'services/cd-ng'
import { AuthenticationMechanisms } from '@common/constants/Utils'
import { OAuthProviders, Providers } from '@common/constants/OAuthProviders'
import cssConfiguration from '@common/pages/AuthenticationSettings/Configuration/Configuration.module.scss'
import css from './PublicOAuthProviders.module.scss'

interface Props {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
}

const PublicOAuthProviders: React.FC<Props> = ({ authSettings, refetchAuthSettings }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { showError, showSuccess, showWarning } = useToaster()

  const oauthSettings: OAuthSettings | undefined = authSettings.ngAuthSettings?.find(
    settings => settings.settingsType === AuthenticationMechanisms.OAUTH
  )

  const oauthEnabled =
    !!oauthSettings &&
    (authSettings.authenticationMechanism === AuthenticationMechanisms.USER_PASSWORD ||
      authSettings.authenticationMechanism === AuthenticationMechanisms.OAUTH)

  const { mutate: updateOAuthProviders, loading: updatingOauthProviders } = useUpdateOauthProviders({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteOAuthProviders, loading: deletingOauthProviders } = useRemoveOauthMechanism({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: updateAuthMechanism, loading: updatingAuthMechanism } = useUpdateAuthMechanism({})

  const { openDialog: confirmOAuthDisable } = useConfirmationDialog({
    titleText: getString('common.authSettings.disableOAuthLogin'),
    contentText: getString('common.authSettings.confirmDisableOAuthLogin'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const response = await updateAuthMechanism(undefined, {
            queryParams: {
              accountIdentifier: accountId,
              authenticationMechanism: AuthenticationMechanisms.USER_PASSWORD
            }
          })

          /* istanbul ignore else */ if (response) {
            try {
              const deleted = await deleteOAuthProviders('' as any)

              /* istanbul ignore else */ if (deleted) {
                refetchAuthSettings()
                showSuccess(getString('common.authSettings.publicOAuthLoginDisabled'), 5000)
              }
            } catch (e) {
              /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
            }
          }
        } catch (e) {
          /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
        }
      }
    }
  })

  const toggleOAuthProviders = async (e: React.FormEvent<HTMLInputElement>): Promise<void> => {
    const enable = e.currentTarget.checked

    if (!oauthEnabled && enable) {
      try {
        const response = await updateOAuthProviders({
          allowedProviders: OAuthProviders.map(provider => provider.type) as Providers[],
          settingsType: AuthenticationMechanisms.OAUTH
        })
        /* istanbul ignore else */ if (response) {
          try {
            const authMechanismUpdated = await updateAuthMechanism(undefined, {
              queryParams: {
                accountIdentifier: accountId,
                authenticationMechanism: AuthenticationMechanisms.OAUTH
              }
            })

            /* istanbul ignore else */ if (authMechanismUpdated) {
              refetchAuthSettings()
              showSuccess(getString('common.authSettings.publicOAuthLoginEnabled'), 5000)
            }
          } catch (err) {
            /* istanbul ignore next */ showError(err.data?.message || err.message, 5000)
          }
        }
      } catch (err) {
        /* istanbul ignore next */ showError(err.data?.message || err.message, 5000)
      }
    } /* istanbul ignore else */ else if (oauthEnabled && !enable) {
      confirmOAuthDisable()
    }
  }

  const handleOAuthChange = async (e: React.FormEvent<HTMLInputElement>): Promise<void> => {
    const { value, checked } = e.currentTarget

    if (oauthSettings?.allowedProviders?.length === 1 && !checked) {
      showWarning(getString('common.authSettings.keepAtLeastOneProviderEnabled'))
      return
    }

    let allowedProviders: Providers[]

    if (oauthSettings?.allowedProviders?.includes(value as Providers)) {
      allowedProviders = oauthSettings.allowedProviders.filter(provider => provider !== value)
    } else {
      allowedProviders = [...(oauthSettings?.allowedProviders || []), value as Providers]
    }

    try {
      const response = await updateOAuthProviders({
        allowedProviders,
        settingsType: AuthenticationMechanisms.OAUTH
      })

      /* istanbul ignore else */ if (response) {
        refetchAuthSettings()
        showSuccess(getString('common.authSettings.oauthSettingsHaveBeenUpdated'), 5000)
      }
    } catch (err) {
      /* istanbul ignore next */ showError(err.data?.message || err.message, 5000)
    }
  }

  const loading = updatingOauthProviders || updatingAuthMechanism || deletingOauthProviders

  return (
    <Collapse
      isOpen={oauthEnabled}
      collapseHeaderClassName={cssConfiguration.collapseHeaderClassName}
      collapseClassName={cssConfiguration.collapseClassName}
      collapsedIcon="main-chevron-down"
      expandedIcon="main-chevron-up"
      heading={
        <Switch
          label={getString('common.authSettings.usePublicOAuth')}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          checked={oauthEnabled}
          onChange={toggleOAuthProviders}
          disabled={loading || authSettings.authenticationMechanism === AuthenticationMechanisms.SAML}
          data-testid="toggle-oauth-providers"
        />
      }
    >
      {oauthSettings && (
        <Container className={css.container} margin={{ bottom: 'large' }}>
          {OAuthProviders.sort((a, b) => a.name.localeCompare(b.name)).map(provider => {
            return (
              <Card key={provider.type} className={css.card}>
                <Switch
                  labelElement={
                    <Text icon={provider.iconName} iconProps={{ size: 25 }} color={Color.BLACK}>
                      {provider.name}
                    </Text>
                  }
                  value={provider.type}
                  checked={oauthSettings?.allowedProviders?.includes(provider.type as Providers)}
                  onChange={handleOAuthChange}
                  disabled={loading}
                  className={css.switch}
                  data-testid={`toggle-oauth-${provider.type.toLowerCase()}`}
                />
              </Card>
            )
          })}
        </Container>
      )}
    </Collapse>
  )
}

export default PublicOAuthProviders
