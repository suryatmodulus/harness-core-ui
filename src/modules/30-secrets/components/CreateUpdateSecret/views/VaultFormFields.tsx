import React from 'react'
import { FormInput } from '@wings-software/uicore'
import type { FormikContext } from 'formik'
import type { SecretDTOV2 } from 'services/cd-ng'

import { useStrings } from 'framework/exports'

interface VaultFormFieldsProps {
  type: SecretDTOV2['type']
  readonly?: boolean
  editing: boolean
}

interface FormikContextProps<T> {
  formik?: FormikContext<T>
}

const VaultFormFields: React.FC<VaultFormFieldsProps & FormikContextProps<any>> = ({
  formik,
  type,
  editing,
  readonly
}) => {
  const { getString } = useStrings()
  return (
    <>
      {type === 'SecretText' ? (
        <>
          <FormInput.RadioGroup
            name="valueType"
            radioGroup={{ inline: true }}
            items={[
              { label: getString('secret.inlineSecret'), value: 'Inline', disabled: readonly },
              { label: getString('secret.referenceSecret'), value: 'Reference' }
            ]}
          />
          {formik?.values['valueType'] === 'Inline' ? (
            <FormInput.Text
              name="value"
              label={getString('secret.labelSecretValue')}
              placeholder={editing ? getString('encrypted') : getString('secret.placeholderSecretValue')}
              inputGroup={{ type: 'password' }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                event.target.value.trim()
              }}
            />
          ) : null}
          {formik?.values['valueType'] === 'Reference' ? (
            <FormInput.Text
              name="value"
              label={getString('secret.labelSecretReference')}
              placeholder={getString('secret.placeholderSecretReference')}
            />
          ) : null}
        </>
      ) : null}
      {type === 'SecretFile' ? (
        <FormInput.FileInput name="file" label={getString('secret.labelSecretFile')} multiple />
      ) : null}
      <FormInput.TextArea name="description" label={getString('common.description')} />
      <FormInput.KVTagInput name="tags" label={getString('common.tagsLabel')} />
    </>
  )
}

export default VaultFormFields
