import React, { useEffect, useState } from 'react'
import { FormInput } from '@wings-software/uicore'
import SecretInput, { SecretInputProps } from '@secrets/components/SecretInput/SecretInput'
import { useToaster } from '@common/exports'
import { setSecretField } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'

export interface ConnectorSecretFieldProps {
  secretInputProps: SecretInputProps
  secretFieldValue?: string
  accountIdentifier: string
  projectIdentifier?: string
  orgIdentifier?: string
  onSuccessfulFetch?: (result: ReturnType<typeof setSecretField['prototype']>) => void
}

export function ConnectorSecretField(props: ConnectorSecretFieldProps): JSX.Element {
  const {
    secretInputProps,
    secretFieldValue,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    onSuccessfulFetch
  } = props
  const { clear, showError } = useToaster()
  const { getString } = useStrings()
  const [loadingSecrets, setLoadingSecrets] = useState(Boolean(secretFieldValue))

  useEffect(() => {
    if (!secretFieldValue) return
    setSecretField(secretFieldValue, { accountIdentifier, orgIdentifier, projectIdentifier })
      .then(result => {
        onSuccessfulFetch?.(result)
        setLoadingSecrets(false)
      })
      .catch(e => {
        clear()
        showError(e, 7000)
        setLoadingSecrets(false)
      })
  }, [secretFieldValue])

  return loadingSecrets ? (
    <FormInput.Text name={''} label={secretInputProps.label} placeholder={getString('loading')} />
  ) : (
    <SecretInput {...secretInputProps} />
  )
}
