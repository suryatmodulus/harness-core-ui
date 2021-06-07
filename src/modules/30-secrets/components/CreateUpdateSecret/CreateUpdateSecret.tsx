import React, { useEffect, useState } from 'react'
import {
  Formik,
  FormikForm,
  FormInput,
  Button,
  SelectOption,
  Text,
  ModalErrorHandlerBinding,
  ModalErrorHandler
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import {
  usePutSecret,
  usePutSecretFileV2,
  usePostSecretFileV2,
  usePostSecret,
  useGetConnectorList,
  SecretDTOV2,
  SecretResponseWrapper,
  SecretRequestWrapper,
  ConnectorInfoDTO,
  ConnectorResponse,
  VaultConnectorDTO,
  useGetConnector,
  useGetSecretV2,
  ResponseSecretResponseWrapper
} from 'services/cd-ng'
import type { SecretTextSpecDTO, SecretFileSpecDTO } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { UseGetMockData } from '@common/utils/testUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import VaultFormFields from './views/VaultFormFields'
import LocalFormFields from './views/LocalFormFields'

export type SecretFormData = Omit<SecretDTOV2, 'spec'> & SecretTextSpecDTO & SecretFileSpecDTO

export interface SecretIdentifiers {
  identifier: string
  projectIdentifier?: string
  orgIdentifier?: string
}

interface CreateUpdateSecretProps {
  mockSecretDetails?: UseGetMockData<ResponseSecretResponseWrapper>
  secret?: SecretIdentifiers
  type?: SecretResponseWrapper['secret']['type']
  onChange?: (data: SecretDTOV2) => void
  onSuccess?: (data: SecretFormData) => void
}

const LocalFormFieldsSMList = ['Local', 'GcpKms', 'AwsKms']
const CreateUpdateSecret: React.FC<CreateUpdateSecretProps> = props => {
  const { getString } = useStrings()
  const { onSuccess } = props
  const propsSecret = props.secret
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const secretTypeFromProps = props.type
  const [type, setType] = useState<SecretResponseWrapper['secret']['type']>(secretTypeFromProps || 'SecretText')
  const [secret, setSecret] = useState<SecretDTOV2>()

  const { loading: loadingSecret, data: secretResponse, refetch, error: getSecretError } = useGetSecretV2({
    identifier: propsSecret?.identifier || '',
    queryParams: {
      accountIdentifier,
      projectIdentifier: propsSecret?.projectIdentifier,
      orgIdentifier: propsSecret?.orgIdentifier
    },
    mock: props.mockSecretDetails,
    lazy: true
  })

  useEffect(() => {
    if (getSecretError) {
      modalErrorHandler?.showDanger(getSecretError.message)
      refetch?.()
    }
  }, [getSecretError])

  useEffect(() => {
    if (propsSecret?.identifier) {
      refetch?.()
    }
  }, [propsSecret?.identifier])

  const {
    data: secretManagersApiResponse,
    loading: loadingSecretsManagers,
    refetch: getSecretManagers
  } = useGetConnectorList({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      category: 'SECRET_MANAGER'
    },
    lazy: true
  })

  const { data: connectorDetails, loading: loadingConnectorDetails, refetch: getConnectorDetails } = useGetConnector({
    identifier:
      (secret?.spec as SecretTextSpecDTO)?.secretManagerIdentifier ||
      (secretResponse?.data?.secret?.spec as SecretTextSpecDTO)?.secretManagerIdentifier,
    lazy: true
  })
  const { mutate: createSecretText, loading: loadingCreateText } = usePostSecret({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier }
  })
  const { mutate: createSecretFile, loading: loadingCreateFile } = usePostSecretFileV2({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier }
  })
  const { mutate: updateSecretText, loading: loadingUpdateText } = usePutSecret({
    identifier: secret?.identifier as string,
    queryParams: {
      accountIdentifier,
      projectIdentifier: propsSecret?.projectIdentifier,
      orgIdentifier: propsSecret?.orgIdentifier
    }
  })
  const { mutate: updateSecretFile, loading: loadingUpdateFile } = usePutSecretFileV2({
    identifier: secret?.identifier as string,
    queryParams: {
      accountIdentifier,
      projectIdentifier: propsSecret?.projectIdentifier,
      orgIdentifier: propsSecret?.orgIdentifier
    }
  })

  const loading = loadingCreateText || loadingUpdateText || loadingCreateFile || loadingUpdateFile
  const editing = !!propsSecret

  useEffect(() => {
    if (!editing) {
      getSecretManagers()
    } else if (secretResponse?.data?.secret && !loadingSecret) {
      setSecret(secretResponse?.data?.secret)
      getConnectorDetails({
        queryParams: {
          accountIdentifier,
          ...pick(secretResponse?.data.secret, ['orgIdentifier', 'projectIdentifier'])
        }
      })
    }
  }, [secretResponse])

  const createFormData = (data: SecretFormData, editFlag?: boolean): FormData => {
    const formData = new FormData()
    formData.set(
      'spec',
      JSON.stringify({
        secret: {
          type,
          ...pick(data, ['name', 'identifier', 'description', 'tags']),
          orgIdentifier: editFlag ? propsSecret?.orgIdentifier : orgIdentifier,
          projectIdentifier: editFlag ? propsSecret?.projectIdentifier : projectIdentifier,
          spec: {
            ...pick(data, ['secretManagerIdentifier'])
          } as SecretFileSpecDTO
        } as SecretDTOV2
      })
    )
    const file = (data as any)?.['file']?.[0]
    file && formData.set('file', file)
    return formData
  }

  const createSecretTextData = (data: SecretFormData, editFlag?: boolean): SecretRequestWrapper => {
    return {
      secret: {
        type,
        ...pick(data, ['name', 'identifier', 'description', 'tags']),
        orgIdentifier: editFlag ? propsSecret?.orgIdentifier : orgIdentifier,
        projectIdentifier: editFlag ? propsSecret?.projectIdentifier : projectIdentifier,
        spec: {
          ...pick(data, ['secretManagerIdentifier', 'value', 'valueType'])
        } as SecretTextSpecDTO
      }
    }
  }

  const handleSubmit = async (data: SecretFormData): Promise<void> => {
    try {
      if (editing) {
        if (type === 'SecretText') {
          await updateSecretText(createSecretTextData(data, editing))
        }
        if (type === 'SecretFile') {
          await updateSecretFile(createFormData(data, editing) as any)
        }
        showSuccess(`Secret '${data.name}' updated successfully`)
      } else {
        if (type === 'SecretText') {
          await createSecretText(createSecretTextData(data))
        }
        if (type === 'SecretFile') {
          await createSecretFile(createFormData(data) as any)
        }
        showSuccess(`Secret '${data.name}' created successfully`)
      }

      onSuccess?.(data)
    } catch (error) {
      modalErrorHandler?.showDanger(error.data.message)
    }
  }

  const secretManagersOptions: SelectOption[] = editing
    ? [
        {
          label: connectorDetails?.data?.connector?.name || '',
          value: connectorDetails?.data?.connector?.identifier || ''
        }
      ]
    : secretManagersApiResponse?.data?.content?.map((item: ConnectorResponse) => {
        return {
          label: item.connector?.name || '',
          value: item.connector?.identifier || ''
        }
      }) || []

  const defaultSecretManagerId = secretManagersApiResponse?.data?.content?.filter(
    item => item.connector?.spec?.default
  )[0]?.connector?.identifier
  const secretTypeOptions = [
    { label: getString('secret.labelText'), value: 'SecretText' },
    { label: getString('secret.labelFile'), value: 'SecretFile' }
  ]

  const [selectedSecretManager, setSelectedSecretManager] = useState<ConnectorInfoDTO | undefined>()
  const [readOnlySecretManager, setReadOnlySecretManager] = useState<boolean>()

  // update selectedSecretManager and readOnly flag in state when we get new data
  useEffect(() => {
    const selectedSM = editing
      ? // when editing, use connector from api response directly, since user cannot change SM
        connectorDetails?.data?.connector
      : // when creating, iterate over all secret managers to find default SM
        secretManagersApiResponse?.data?.content?.filter(
          itemValue => itemValue.connector?.identifier === defaultSecretManagerId
        )?.[0]?.connector

    setSelectedSecretManager(selectedSM)
    setReadOnlySecretManager((selectedSM?.spec as VaultConnectorDTO)?.readOnly)
  }, [defaultSecretManagerId, connectorDetails])

  // if the selected secret manager changes, update readOnly flag in state
  useEffect(() => {
    selectedSecretManager?.type === 'Vault'
      ? setReadOnlySecretManager((selectedSecretManager?.spec as VaultConnectorDTO)?.readOnly)
      : setReadOnlySecretManager(false)
  }, [selectedSecretManager])

  return (
    <>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<SecretFormData>
        initialValues={{
          name: '',
          description: '',
          identifier: '',
          tags: {},
          valueType: readOnlySecretManager ? 'Reference' : 'Inline',
          type,
          secretManagerIdentifier: selectedSecretManager?.identifier || defaultSecretManagerId || '',
          orgIdentifier,
          projectIdentifier,
          ...pick(secret, ['name', 'identifier', 'description', 'tags']),
          ...pick(secret?.spec, ['valueType', 'secretManagerIdentifier'])
        }}
        formName="createUpdateSecretForm"
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          name: NameSchema(),
          identifier: IdentifierSchema(),
          value:
            editing || type === 'SecretFile'
              ? Yup.string().trim()
              : Yup.string().trim().required(getString('secret.validationValue')),
          secretManagerIdentifier: Yup.string().required(getString('secret.validationKms'))
        })}
        validate={formData => {
          props.onChange?.({
            type: formData.type,
            ...pick(formData, ['name', 'description', 'identifier', 'tags']),
            spec: pick(formData, ['value', 'valueType', 'secretManagerIdentifier']) as SecretTextSpecDTO
          })
        }}
        onSubmit={data => {
          handleSubmit(data)
        }}
      >
        {formikProps => {
          const typeOfSelectedSecretManager = selectedSecretManager?.type

          return (
            <FormikForm>
              <FormInput.Select
                name="secretManagerIdentifier"
                label={getString('secrets.labelSecretsManager')}
                items={secretManagersOptions}
                disabled={editing || loadingSecretsManagers || loadingConnectorDetails}
                onChange={item => {
                  setSelectedSecretManager(
                    secretManagersApiResponse?.data?.content?.filter(
                      itemValue => itemValue.connector?.identifier === item.value
                    )?.[0]?.connector
                  )
                }}
              />
              {!secretTypeFromProps ? (
                <FormInput.RadioGroup
                  name="type"
                  label={getString('secret.labelSecretType')}
                  items={secretTypeOptions}
                  radioGroup={{ inline: true }}
                  onChange={ev => {
                    setType((ev.target as HTMLInputElement).value as SecretResponseWrapper['secret']['type'])
                  }}
                />
              ) : null}
              <FormInput.InputWithIdentifier
                inputName="name"
                inputLabel={getString('secrets.labelSecretName')}
                idName="identifier"
                isIdentifierEditable={!editing}
                inputGroupProps={{ disabled: loadingSecret }}
              />
              {!typeOfSelectedSecretManager ? <Text>{getString('secret.messageSelectSM')}</Text> : null}
              {LocalFormFieldsSMList.findIndex(val => val === typeOfSelectedSecretManager) !== -1 ? (
                <LocalFormFields formik={formikProps} type={type} editing={editing} />
              ) : null}
              {typeOfSelectedSecretManager === 'Vault' || typeOfSelectedSecretManager === 'AzureKeyVault' ? (
                <VaultFormFields formik={formikProps} type={type} editing={editing} readonly={readOnlySecretManager} />
              ) : null}
              <Button
                intent="primary"
                type="submit"
                text={loading ? getString('secret.saving') : getString('save')}
                margin={{ top: 'large' }}
                disabled={loading || !typeOfSelectedSecretManager}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export default CreateUpdateSecret
