import React from 'react'
import { Link } from 'react-router-dom'
import { connect, FormikContext } from 'formik'
import { Layout, Icon, Button, Container, Text, Color } from '@wings-software/uicore'

import { get, isPlainObject, pick } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import useCreateOrSelectSecretModal from '@secrets/modals/CreateOrSelectSecretModal/useCreateOrSelectSecretModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { SecretIdentifiers } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type { SecretResponseWrapper, ResponsePageSecretResponseWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import css from './SecretInput.module.scss'

interface SecretInputProps {
  name: string
  label?: string
  type?: SecretResponseWrapper['secret']['type']
  onSuccess?: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
}

interface FormikSecretInput extends SecretInputProps {
  formik: FormikContext<any>
}

const SecretInput: React.FC<FormikSecretInput> = props => {
  const { getString } = useStrings()
  const { formik, label, name, onSuccess, type = 'SecretText', secretsListMockData } = props

  const { openCreateOrSelectSecretModal } = useCreateOrSelectSecretModal(
    {
      type,
      onSuccess: secret => {
        formik.setFieldValue(name, secret)
        /* istanbul ignore next */
        onSuccess?.(secret)
      },
      secretsListMockData
    },
    [name, onSuccess]
  )
  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: formData => {
      const secret: SecretReference = {
        ...pick(formData, 'identifier', 'name', 'orgIdentifier', 'projectIdentifier'),
        referenceString: formik.values[name]['referenceString']
      }
      formik.setFieldValue(name, secret)
      onSuccess?.(secret)
    }
  })

  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  return (
    <FormGroup
      helperText={errorCheck() ? get(formik?.errors, name) : null}
      intent={errorCheck() ? Intent.DANGER : Intent.NONE}
    >
      <Layout.Vertical>
        {label ? <label className={'bp3-label'}>{label}</label> : null}
        <Container flex={{ alignItems: 'center', justifyContent: 'space-between' }} className={css.container}>
          <Link
            to="#"
            className={css.containerLink}
            data-testid={name}
            onClick={e => {
              e.preventDefault()
              openCreateOrSelectSecretModal()
            }}
          >
            <Icon size={24} height={12} name={'key-main'} />
            <Text
              color={Color.BLUE_500}
              flex={{ alignItems: 'center', justifyContent: 'flex-start', inline: false }}
              padding="small"
              className={css.containerLinkText}
            >
              <div>{formik.values[name] ? getString('secret.configureSecret') : getString('createOrSelectSecret')}</div>
              {formik.values[name] ? <div>{`<${formik.values[name]['name']}>`}</div> : null}
            </Text>
          </Link>
          {formik.values[name] ? (
            <Button
              minimal
              className={css.containerEditBtn}
              data-testid={`${name}-edit`}
              onClick={() =>
                openCreateSecretModal(type, {
                  identifier: formik.values[name]?.['identifier'],
                  projectIdentifier: formik.values[name]?.['projectIdentifier'],
                  orgIdentifier: formik.values[name]?.['orgIdentifier']
                } as SecretIdentifiers)
              }
              text={<Icon size={16} name={'edit'} color={Color.BLUE_500} />}
            />
          ) : null}
        </Container>
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikSecretInput, 'formik'>>(SecretInput)
