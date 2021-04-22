import React from 'react'
import { FormInput, Layout, Button, Text, SelectOption } from '@wings-software/uicore'
import { IOptionProps, MenuItem } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import type { FormikProps } from 'formik'

import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { SSHConfigFormData } from '@secrets/modals/CreateSSHCredModal/views/StepAuthentication'
import { useStrings } from 'framework/exports'

const CustomSelect = Select.ofType<SelectOption>()

interface SSHAuthFormFieldsProps {
  formik: FormikProps<SSHConfigFormData>
  secretName?: string
  editing?: boolean
}

const credentialTypeOptions: (getString: Function) => SelectOption[] = getString => [
  {
    label: getString('secrets.optionKey'),
    value: 'KeyReference'
  },
  {
    label: getString('secrets.optionKeypath'),
    value: 'KeyPath'
  },
  {
    label: getString('secrets.password'),
    value: 'Password'
  }
]

const authSchemeOptions: (getString: Function) => IOptionProps[] = getString => [
  {
    label: getString('secrets.optionSSHKey'),
    value: 'SSH'
  },
  {
    label: getString('secrets.optionKerberos'),
    value: 'Kerberos'
  }
]

const tgtGenerationMethodOptions: (getString: Function) => IOptionProps[] = getString => [
  {
    label: getString('secrets.labelKeyTab'),
    value: 'KeyTabFilePath'
  },
  {
    label: getString('secrets.password'),
    value: 'Password'
  },
  {
    label: getString('secrets.optionKerbNone'),
    value: 'None'
  }
]

const SSHAuthFormFields: React.FC<SSHAuthFormFieldsProps> = props => {
  const { formik } = props
  const { getString } = useStrings()
  return (
    <>
      <FormInput.RadioGroup
        name="authScheme"
        label={getString('secrets.labelType')}
        items={authSchemeOptions(getString)}
        radioGroup={{ inline: true }}
      />
      {formik.values.authScheme === 'SSH' ? (
        <>
          <Layout.Horizontal margin={{ bottom: 'medium' }}>
            <Text icon="lock" style={{ flex: 1 }}>
              {getString('secrets.labelAuth')}
            </Text>
            <CustomSelect
              items={credentialTypeOptions(getString)}
              filterable={false}
              itemRenderer={(item, { handleClick }) => (
                <MenuItem key={item.value as string} text={item.label} onClick={handleClick} />
              )}
              onItemSelect={item => {
                formik.setFieldValue('credentialType', item.value)
              }}
              popoverProps={{ minimal: true }}
            >
              <Button
                inline
                minimal
                rightIcon="chevron-down"
                font="small"
                text={
                  credentialTypeOptions(getString).filter(opt => opt.value === formik.values.credentialType)?.[0]
                    ?.label || 'Select...'
                }
              />
            </CustomSelect>
          </Layout.Horizontal>
          <FormInput.Text name="userName" label={getString('secrets.labelUsername')} />
          {formik.values.credentialType === 'KeyReference' ? (
            <>
              <SecretInput name="key" label={getString('secrets.labelFile')} type="SecretFile" />
              <SecretInput name={'encryptedPassphrase'} label={getString('secrets.labelPassphrase')} />
            </>
          ) : null}
          {formik.values.credentialType === 'KeyPath' ? (
            <>
              <FormInput.Text name="keyPath" label={getString('secrets.labelKeyFilePath')} />
              <SecretInput name={'encryptedPassphrase'} label={getString('secrets.labelPassphrase')} />
            </>
          ) : null}
          {formik.values.credentialType === 'Password' ? (
            <SecretInput name={'password'} label={getString('secrets.password')} />
          ) : null}
          <FormInput.Text name="port" label={getString('secrets.labelSSHPort')} />
        </>
      ) : null}
      {formik.values.authScheme === 'Kerberos' ? (
        <>
          <FormInput.Text name="principal" label={getString('secrets.labelPrincipal')} />
          <FormInput.Text name="realm" label={getString('secrets.labelRealm')} />
          <FormInput.Text name="port" label={getString('secrets.labelSSHPort')} />
          <FormInput.RadioGroup
            name="tgtGenerationMethod"
            label={getString('secrets.labelTGT')}
            items={tgtGenerationMethodOptions(getString)}
            radioGroup={{ inline: true }}
          />
          {formik.values.tgtGenerationMethod === 'KeyTabFilePath' ? (
            <FormInput.Text name="keyPath" label={getString('secrets.labelKeyTab')} />
          ) : null}
          {formik.values.tgtGenerationMethod === 'Password' ? (
            <SecretInput name={'password'} label={getString('secrets.password')} />
          ) : null}
        </>
      ) : null}
    </>
  )
}

export default SSHAuthFormFields
