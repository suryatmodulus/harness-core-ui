import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Card, Switch, Text, Color, Icon } from '@wings-software/uicore'
import { TagInput } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/components'
import { useUpdateWhitelistedDomains } from 'services/cd-ng'
import { useRestrictEmailDomains } from '@common/modals/RestrictEmailDomains/useRestrictEmailDomains'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import css from './RestrictEmailDomains.module.scss'

interface Props {
  whitelistedDomains: string[]
  refetchAuthSettings: () => void
}

const RestrictEmailDomains: React.FC<Props> = ({ whitelistedDomains, refetchAuthSettings }) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const emailRestrictionsEnabled = !!whitelistedDomains.length

  const { mutate: updateWhitelistedDomains, loading: updatingWhitelistedDomains } = useUpdateWhitelistedDomains({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const onSuccess = (): void => {
    refetchAuthSettings()
  }

  const { openRestrictEmailDomainsModal } = useRestrictEmailDomains({ onSuccess, whitelistedDomains })

  const disableWhitelistedDomains = async (): Promise<void> => {
    try {
      const disabled = await updateWhitelistedDomains([])

      /* istanbul ignore else */ if (disabled) {
        refetchAuthSettings()
        showSuccess(getString('common.authSettings.whitelistedDomainsDisabled'), 5000)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
    }
  }

  const { openDialog: confirmWhitelistedDomainsDisable } = useConfirmationDialog({
    titleText: getString('common.authSettings.disableWhitelistedDomains'),
    contentText: getString('common.authSettings.confirmDisableWhitelistedDomains'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        disableWhitelistedDomains()
      }
    }
  })

  const onChangeWhitelistedDomains = (e: React.FormEvent<HTMLInputElement>): void => {
    const enable = e.currentTarget.checked

    if (emailRestrictionsEnabled && !enable) {
      confirmWhitelistedDomainsDisable()
    } else if (!emailRestrictionsEnabled && enable) {
      openRestrictEmailDomainsModal()
    }
  }

  return (
    <Container margin="xlarge">
      <Card className={css.card}>
        <Switch
          labelElement={
            <Text inline color={Color.BLACK} font={{ weight: 'bold', size: 'normal' }}>
              {getString('common.authSettings.allowUsersWIthEmails')}
            </Text>
          }
          padding={{ bottom: 'medium' }}
          checked={emailRestrictionsEnabled}
          onChange={onChangeWhitelistedDomains}
          disabled={updatingWhitelistedDomains}
          data-testid="toggle-restrict-email-domains"
        />
        {emailRestrictionsEnabled && (
          <TagInput
            disabled
            values={whitelistedDomains}
            rightElement={
              <Icon
                name="edit"
                intent="primary"
                margin="small"
                className={css.editIcon}
                onClick={openRestrictEmailDomainsModal}
                data-testid="update-restrict-email-domains"
              />
            }
            className={css.input}
            tagProps={{ minimal: true }}
          />
        )}
      </Card>
    </Container>
  )
}

export default RestrictEmailDomains
