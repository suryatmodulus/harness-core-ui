import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Card, Switch, Text, Color } from '@wings-software/uicore'
import { TagInput } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/components'
import { useUpdateWhitelistedDomains } from 'services/cd-ng'
import { useRestrictEmailDomains } from '@auth-settings/modals/RestrictEmailDomains/useRestrictEmailDomains'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { PermissionRequest } from '@auth-settings/pages/Configuration/Configuration'
import css from './RestrictEmailDomains.module.scss'

interface Props {
  whitelistedDomains: string[]
  refetchAuthSettings: () => void
  permissionRequest: PermissionRequest
  canEdit: boolean
}

const RestrictEmailDomains: React.FC<Props> = ({
  whitelistedDomains,
  refetchAuthSettings,
  canEdit,
  permissionRequest
}) => {
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
        showSuccess(getString('authSettings.whitelistedDomainsDisabled'), 5000)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
    }
  }

  const { openDialog: confirmWhitelistedDomainsDisable } = useConfirmationDialog({
    titleText: getString('authSettings.disableWhitelistedDomains'),
    contentText: getString('authSettings.confirmDisableWhitelistedDomains'),
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
              {getString(
                emailRestrictionsEnabled
                  ? 'authSettings.allowUsersWithEmails'
                  : 'authSettings.restrictUsersToEmailDomains'
              )}
            </Text>
          }
          checked={emailRestrictionsEnabled}
          onChange={onChangeWhitelistedDomains}
          disabled={!canEdit || updatingWhitelistedDomains}
          data-testid="toggle-restrict-email-domains"
        />
        {emailRestrictionsEnabled && (
          <TagInput
            disabled
            values={whitelistedDomains}
            rightElement={
              <RbacButton
                minimal
                intent="primary"
                icon="edit"
                onClick={openRestrictEmailDomainsModal}
                disabled={!canEdit}
                data-testid="update-restrict-email-domains"
                permission={{
                  ...permissionRequest,
                  permission: PermissionIdentifier.EDIT_AUTHSETTING
                }}
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
