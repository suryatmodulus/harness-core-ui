import React from 'react'
import { FormInput } from '@wings-software/uicore'
import type { FormikContext } from 'formik'
import { useStrings } from 'framework/strings'

import type { SecretDTOV2 } from 'services/cd-ng'

interface LocalFormFieldsProps {
  type: SecretDTOV2['type']
  editing: boolean
}

interface FormikContextProps<T> {
  formik?: FormikContext<T>
}

const LocalFormFields: React.FC<LocalFormFieldsProps & FormikContextProps<any>> = ({ editing, type }) => {
  const { getString } = useStrings()
  return (
    <>
      {type === 'SecretText' ? (
        <FormInput.Text
          name="value"
          label={getString('secrets.labelValue')}
          placeholder={editing ? getString('encrypted') : getString('secret.placeholderSecretValue')}
          inputGroup={{ type: 'password' }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            event.target.value.trim()
          }}
        />
      ) : null}
      {type === 'SecretFile' ? (
        <FormInput.FileInput name="file" label={getString('secret.labelSecretFile')} multiple />
      ) : null}
      <FormInput.TextArea name="description" isOptional={true} label={getString('description')} />
      <FormInput.KVTagInput name="tags" isOptional={true} label={getString('tagsLabel')} />
    </>
  )
}

export default LocalFormFields
