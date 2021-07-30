import React from 'react'
import { Dialog, Spinner } from '@blueprintjs/core'
import * as yup from 'yup'
import {
  Button,
  ButtonProps,
  CardSelect,
  Container,
  Formik,
  FormInput,
  Label,
  Layout,
  Text,
  useModalHook
} from '@wings-software/uicore'
import { AddAPIKeyQueryParams, ApiKey, useAddAPIKey } from 'services/cf/index'
import { useEnvStrings } from '@cf/hooks/environment'
import { useToaster } from '@common/exports'
import { EnvironmentSDKKeyType, getErrorMessage } from '@cf/utils/CFUtils'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './AddKeyDialog.module.scss'

interface Props {
  disabled?: boolean
  primary?: boolean
  environment: EnvironmentResponseDTO
  onCreate: (newKey: ApiKey, hideModal: () => void) => void
  buttonProps?: ButtonProps
  keyType?: EnvironmentSDKKeyType
}

interface KeyValues {
  name: string
  type: EnvironmentSDKKeyType
}

const AddKeyDialog: React.FC<Props> = ({ disabled, primary, environment, onCreate, buttonProps, keyType }) => {
  const { showError } = useToaster()
  const { getString, getEnvString } = useEnvStrings()
  const { mutate: createKey, loading } = useAddAPIKey({
    queryParams: {
      account: environment.accountId as string,
      accountIdentifier: environment.accountId as string,
      environment: environment.identifier as string,
      org: environment.orgIdentifier as string,
      project: environment.projectIdentifier as string
    } as AddAPIKeyQueryParams
  })

  const keyTypes = [
    {
      text: getEnvString('apiKeys.clientType'),
      value: EnvironmentSDKKeyType.CLIENT
    },
    {
      text: getEnvString('apiKeys.serverType'),
      value: EnvironmentSDKKeyType.SERVER
    }
  ].filter(type => !keyType || keyType === type.value)

  const initialValues: KeyValues = {
    name: '',
    type: EnvironmentSDKKeyType.SERVER
  }

  const getTypeOption = (value: string) => keyTypes.find(k => k.value === value) || keyTypes[0]

  const handleSubmit = (values: KeyValues) => {
    createKey({
      identifier: values.name,
      name: values.name,
      type: values.type
    })
      .then((created: ApiKey) => onCreate(created, hideModal))
      .catch(error => showError(getErrorMessage(error), undefined, 'cf.create.key.error'))
  }

  const labelStyle = {
    color: '#627386',
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px'
  }

  const [openModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen
        enforceFocus={false}
        onClose={hideModal}
        title={
          <Text
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--black)',
              lineHeight: '20px',
              padding: 'var(--spacing-large) 0 0 var(--spacing-small)'
            }}
          >
            {getEnvString('apiKeys.addKeyTitle')}
          </Text>
        }
      >
        <Formik
          initialValues={initialValues}
          formName="addKeyDialog"
          validationSchema={yup.object().shape({
            name: yup.string().trim().required(getEnvString('apiKeys.emptyName'))
          })}
          onSubmit={handleSubmit}
          onReset={hideModal}
        >
          {formikProps => (
            <Layout.Vertical spacing="large" padding="xxlarge">
              <Layout.Vertical spacing="small">
                <Label style={labelStyle}>{getString('name')}</Label>
                <FormInput.Text name="name" inputGroup={{ autoFocus: true }} />
              </Layout.Vertical>
              <Layout.Vertical spacing="small">
                <Label style={labelStyle}>{getEnvString('apiKeys.keyType')}</Label>
                <CardSelect
                  cornerSelected
                  data={keyTypes}
                  selected={getTypeOption(formikProps.values.type)}
                  className={css.cardSelect}
                  onChange={nextValue => formikProps.setFieldValue('type', nextValue.value)}
                  renderItem={cardData => (
                    <Container flex={{ align: 'center-center', distribution: 'space-between' }} className="cardBody">
                      {cardData.text}
                    </Container>
                  )}
                />
              </Layout.Vertical>
              <Layout.Horizontal padding={{ top: 'xxxlarge' }}>
                <Button
                  text={getString('createSecretYAML.create')}
                  onClick={() => formikProps.handleSubmit()}
                  intent="primary"
                  disabled={loading}
                />
                <Button text={getString('cancel')} onClick={() => formikProps.handleReset()} minimal />
                {loading && <Spinner size={16} />}
              </Layout.Horizontal>
            </Layout.Vertical>
          )}
        </Formik>
      </Dialog>
    )
  }, [loading, keyType])

  return (
    <RbacButton
      disabled={disabled}
      onClick={openModal}
      text={getString('cf.environments.apiKeys.addKey')}
      minimal={!primary}
      intent="primary"
      permission={{
        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: environment.identifier },
        permission: PermissionIdentifier.EDIT_ENVIRONMENT
      }}
      {...buttonProps}
    />
  )
}

export default AddKeyDialog
