import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Radio, Container, Collapse, Color, Card, Text, Button, Popover } from '@wings-software/uicore'
import { Menu, MenuItem } from '@blueprintjs/core'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { AuthenticationSettingsResponse, SamlSettings } from 'services/cd-ng'
import { useDeleteSamlMetaData, useUpdateAuthMechanism, useGetSamlLoginTest } from 'services/cd-ng'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { AuthenticationMechanisms } from '@common/constants/Utils'
import { useSAMLProviderModal } from '@common/modals/SAMLProvider/useSAMLProvider'
import cssConfiguration from '@common/pages/AuthenticationSettings/Configuration/Configuration.module.scss'
import css from './SAMLProvider.module.scss'

interface Props {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
}

const SAMLProvider: React.FC<Props> = ({ authSettings, refetchAuthSettings }) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [testSucceeded, setTestSucceeded] = React.useState(false)
  const samlEnabled = authSettings.authenticationMechanism === AuthenticationMechanisms.SAML
  const samlSettings = authSettings.ngAuthSettings?.find(
    settings => settings.settingsType === AuthenticationMechanisms.SAML
  ) as SamlSettings | undefined

  const onSuccess = (): void => {
    refetchAuthSettings()
  }

  const { openSAMlProvider } = useSAMLProviderModal({ onSuccess })

  const { data: samlLoginTestData, error: samlLoginTestDataError, refetch: getSamlLoginTestData } = useGetSamlLoginTest(
    {
      queryParams: {
        accountId: accountId
      },
      lazy: true
    }
  )

  const { mutate: deleteSamlSettings, loading: deletingSamlSettings } = useDeleteSamlMetaData({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: updateAuthMechanismToSaml, loading: updatingAuthMechanismToSaml } = useUpdateAuthMechanism({
    queryParams: {
      accountIdentifier: accountId,
      authenticationMechanism: AuthenticationMechanisms.SAML
    }
  })

  const { openDialog: confirmSamlSettingsDelete } = useConfirmationDialog({
    titleText: getString('common.authSettings.deleteSamlProvider'),
    contentText: (
      <React.Fragment>
        <span>{getString('common.authSettings.deleteSamlProviderDescription')} </span>
        <Text inline font={{ weight: 'bold' }} color={Color.GREY_800}>
          {samlSettings?.displayName}
        </Text>
        ?
      </React.Fragment>
    ),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteSamlSettings('' as any)
          /* istanbul ignore else */ if (deleted) {
            refetchAuthSettings()
            showSuccess(getString('common.authSettings.samlProviderDeleted'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
        }
      }
    }
  })

  const testSamlProvider = async (): Promise<void> => {
    if (samlLoginTestData?.resource?.ssorequest?.idpRedirectUrl) {
      localStorage.setItem('samlTestResponse', 'testing')
      const childWindow = window.open(samlLoginTestData.resource.ssorequest.idpRedirectUrl)
      window.addEventListener('storage', () => {
        const samlTestResponse = localStorage.getItem('samlTestResponse')
        /* istanbul ignore else */ if (samlTestResponse === 'true' || samlTestResponse === 'false') {
          if (samlTestResponse === 'true') {
            setTestSucceeded(true)
            showSuccess(getString('common.authSettings.samlTestSuccessful'), 5000)
          } else {
            setTestSucceeded(false)
            showError(getString('common.authSettings.samlTestFailed'), 5000)
          }
          childWindow?.close()
          localStorage.removeItem('samlTestResponse')
        }
      })
      childWindow?.focus()
    } else {
      /* istanbul ignore next */ showError(samlLoginTestDataError?.message, 5000)
    }
  }

  React.useEffect(() => {
    /* istanbul ignore else */ if (samlLoginTestData || samlLoginTestDataError) {
      testSamlProvider()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samlLoginTestData, samlLoginTestDataError])

  const { openDialog: enableSamlProvide } = useConfirmationDialog({
    titleText: getString('common.authSettings.enableSamlProvider'),
    contentText: getString('common.authSettings.enableSamlProviderDescription'),
    confirmButtonText: getString('confirm'),
    customButtons: (
      <Container flex width="100%">
        <Button
          className={css.leftMarginAuto}
          intent="primary"
          text={getString(testSucceeded ? 'tested' : 'test')}
          onClick={() => {
            if (testSucceeded) setTestSucceeded(false)
            getSamlLoginTestData()
          }}
        />
      </Container>
    ),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        try {
          const response = await updateAuthMechanismToSaml(undefined)

          /* istanbul ignore else */ if (response) {
            refetchAuthSettings()
            showSuccess(getString('common.authSettings.samlLoginEnabled'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
        }
      }
    }
  })

  return (
    <Container margin="xlarge" background={Color.WHITE}>
      {samlSettings ? (
        <Collapse
          isOpen={samlEnabled}
          collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName, cssConfiguration.height60)}
          collapseClassName={cssConfiguration.collapseClassName}
          collapsedIcon="main-chevron-down"
          expandedIcon="main-chevron-up"
          heading={
            <Container margin={{ left: 'xlarge' }}>
              <Radio
                checked={samlEnabled}
                font={{ weight: 'bold', size: 'normal' }}
                color={Color.GREY_900}
                label={getString('common.authSettings.loginViaSAML')}
                onChange={enableSamlProvide}
                disabled={updatingAuthMechanismToSaml}
              />
            </Container>
          }
        >
          <Container padding={{ bottom: 'large' }}>
            <Card className={css.card}>
              <Container margin={{ left: 'xlarge' }}>
                <Radio font={{ weight: 'bold', size: 'normal' }} checked={samlEnabled} readOnly />
              </Container>
              <Text color={Color.GREY_800} font={{ weight: 'bold' }} width="30%">
                {samlSettings.displayName}
              </Text>
              <Text color={Color.GREY_800} width="70%">
                {samlSettings.authorizationEnabled ? (
                  <span>
                    {getString('common.authSettings.authorizationEnabledFor')}
                    <Text font={{ weight: 'semi-bold' }} color={Color.GREY_800} inline>
                      {samlSettings.groupMembershipAttr}
                    </Text>
                  </span>
                ) : (
                  getString('common.authSettings.authorizationNotEnabled')
                )}
              </Text>
              <Button
                minimal
                intent="primary"
                className={css.testButton}
                onClick={() => {
                  if (testSucceeded) setTestSucceeded(false)
                  getSamlLoginTestData()
                }}
              >
                {getString(testSucceeded ? 'tested' : 'test')}
              </Button>
              <Popover
                interactionKind="click"
                position="left-top"
                content={
                  <Menu>
                    <MenuItem text={getString('edit')} onClick={() => openSAMlProvider(samlSettings)} />
                    <MenuItem
                      text={getString('delete')}
                      disabled={deletingSamlSettings}
                      onClick={confirmSamlSettingsDelete}
                    />
                  </Menu>
                }
              >
                <Button minimal icon="Options" data-testid="provider-button" />
              </Popover>
            </Card>
          </Container>
        </Collapse>
      ) : (
        <Card className={css.cardWithRadioBtn}>
          <Container margin={{ left: 'xlarge', top: 'xsmall' }}>
            <Radio
              checked={samlEnabled}
              font={{ weight: 'semi-bold', size: 'normal' }}
              onClick={() => openSAMlProvider()}
              color={Color.BLUE_800}
              label={getString('common.authSettings.plusSAMLProvider')}
            />
          </Container>
        </Card>
      )}
    </Container>
  )
}

export default SAMLProvider
