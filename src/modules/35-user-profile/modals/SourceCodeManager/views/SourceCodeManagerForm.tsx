import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import {
  Button,
  Color,
  Formik,
  FormikForm as Form,
  Layout,
  Text,
  FormInput,
  CardSelect,
  CardBody,
  IconName,
  Container,
  SelectOption,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { NameSchema } from '@common/utils/Validation'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import { SourceCodeManagerDTO, useSaveSourceCodeManagers, useUpdateSourceCodeManagers } from 'services/cd-ng'
import {
  AuthTypes,
  getAuthentication,
  getFormDataBasedOnSCMType,
  getIconBySCM,
  SourceCodeTypes
} from '@user-profile/utils/utils'
import type { TextReferenceInterface } from '@secrets/components/TextReference/TextReference'
import { useToaster } from '@common/exports'
import Authentication from './Authentication'
import css from '../useSourceCodeManager.module.scss'

// We only support github scm ATM, remove this constant and its occurrences logically once more scms are supported
const MULTIPLE_SCM_TYPES_SUPPORTED = false

interface SourceCodeManagerProps {
  onSubmit: () => void
  onClose: () => void
  initialValues?: SourceCodeManagerDTO
}

export interface SCMData {
  name: string
  authType?: AuthTypes
  username?: TextReferenceInterface
  password?: SecretReference
  sshKey?: SecretReference
  kerberosKey?: SecretReference
  accessToken?: SecretReference
  accessKey?: TextReferenceInterface
  secretKey?: SecretReference
}
interface SourceCodeType {
  text: string
  value: SourceCodeTypes
  icon: IconName
}

const SourceCodeManagerForm: React.FC<SourceCodeManagerProps> = props => {
  const { onSubmit, onClose, initialValues } = props
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { accountId } = useParams<AccountPathProps>()
  const [data, setData] = useState({})
  const isEditMode = !isEmpty(initialValues)
  const [loading, setLoading] = useState(isEditMode)

  const { mutate: saveSourceCodeManager } = useSaveSourceCodeManagers({})
  const { mutate: updateSourceCodeManage } = useUpdateSourceCodeManagers({ identifier: initialValues?.id as string })

  const sourceCodeManagers: SourceCodeType[] = [
    {
      text: getString('common.repo_provider.githubLabel'),
      value: SourceCodeTypes.GITHUB,
      icon: getIconBySCM(SourceCodeTypes.GITHUB)
    },
    {
      text: getString('common.repo_provider.bitbucketLabel'),
      value: SourceCodeTypes.BITBUCKET,
      icon: getIconBySCM(SourceCodeTypes.BITBUCKET)
    },
    {
      text: getString('common.repo_provider.gitlabLabel'),
      value: SourceCodeTypes.GITLAB,
      icon: getIconBySCM(SourceCodeTypes.GITLAB)
    },
    {
      text: getString('common.repo_provider.awscodecommit'),
      value: SourceCodeTypes.AWS_CODE_COMMIT,
      icon: getIconBySCM(SourceCodeTypes.AWS_CODE_COMMIT)
    },
    {
      text: getString('common.repo_provider.azureDev'),
      value: SourceCodeTypes.AZURE_DEV_OPS,
      icon: getIconBySCM(SourceCodeTypes.AZURE_DEV_OPS)
    }
  ]

  const [selected, setSelected] = useState<SourceCodeType | undefined>(
    MULTIPLE_SCM_TYPES_SUPPORTED ? undefined : sourceCodeManagers[0]
  )

  useEffect(() => {
    if (loading && initialValues) {
      getFormDataBasedOnSCMType(initialValues, accountId).then(formData => {
        setData(formData)
        setLoading(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const getDefaultSelected = (type?: SourceCodeTypes): AuthTypes | undefined => {
    switch (type) {
      case SourceCodeTypes.GITHUB:
        return AuthTypes.USERNAME_TOKEN
      case SourceCodeTypes.BITBUCKET:
      case SourceCodeTypes.GITLAB:
      case SourceCodeTypes.AZURE_DEV_OPS:
        return AuthTypes.USERNAME_PASSWORD
      case SourceCodeTypes.AWS_CODE_COMMIT:
        return AuthTypes.AWSCredentials
      default:
        return undefined
    }
  }

  const getAuthOptions = (type: SourceCodeTypes): SelectOption[] => {
    switch (type) {
      case SourceCodeTypes.BITBUCKET:
        return [
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          },
          {
            label: getString('SSH_KEY'),
            value: AuthTypes.SSH_KEY
          }
        ]
      case SourceCodeTypes.GITHUB:
        return [
          // {
          //   label: getString('usernamePassword'),
          //   value: AuthTypes.USERNAME_PASSWORD
          // },
          {
            label: getString('usernameToken'),
            value: AuthTypes.USERNAME_TOKEN
          }
        ]
      case SourceCodeTypes.GITLAB:
        return [
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          },
          {
            label: getString('usernameToken'),
            value: AuthTypes.USERNAME_TOKEN
          },
          {
            label: getString('kerberos'),
            value: AuthTypes.KERBEROS
          },
          {
            label: getString('SSH_KEY'),
            value: AuthTypes.SSH_KEY
          }
        ]
      case SourceCodeTypes.AWS_CODE_COMMIT:
        return [
          {
            label: getString('userProfile.awsCredentials'),
            value: AuthTypes.AWSCredentials
          }
        ]
      case SourceCodeTypes.AZURE_DEV_OPS:
        return [
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          },
          {
            label: getString('usernameToken'),
            value: AuthTypes.USERNAME_TOKEN
          },
          {
            label: getString('SSH_KEY'),
            value: AuthTypes.SSH_KEY
          }
        ]
      default:
        return []
    }
  }

  const selectedValueToTypeMap: Record<SourceCodeTypes, SourceCodeTypes> = {
    [SourceCodeTypes.BITBUCKET]: SourceCodeTypes.BITBUCKET,
    [SourceCodeTypes.GITHUB]: SourceCodeTypes.GITHUB,
    [SourceCodeTypes.GITLAB]: SourceCodeTypes.GITLAB,
    [SourceCodeTypes.AWS_CODE_COMMIT]: SourceCodeTypes.AWS_CODE_COMMIT,
    [SourceCodeTypes.AZURE_DEV_OPS]: SourceCodeTypes.AZURE_DEV_OPS
  }

  const handleSubmit = async (values: SCMData): Promise<void> => {
    if (selected?.value) {
      const type = selectedValueToTypeMap[selected.value]
      if (!type) {
        return undefined
      }

      const dataToSubmit: SourceCodeManagerDTO = {
        name: values.name,
        authentication: getAuthentication(values),
        accountIdentifier: accountId,
        type
      }

      try {
        const successMessage = isEditMode
          ? getString('userProfile.scmUpdateSuccess')
          : getString('userProfile.scmCreateSuccess')
        const failMessage = isEditMode ? getString('userProfile.scmUpdateFail') : getString('userProfile.scmCreateFail')
        /* istanbul ignore else */ if (dataToSubmit) {
          const parsedDataToSubmit: SourceCodeManagerDTO = isEditMode
            ? { ...dataToSubmit, userIdentifier: initialValues?.userIdentifier }
            : dataToSubmit
          const saved = await (isEditMode ? updateSourceCodeManage : saveSourceCodeManager)(parsedDataToSubmit)
          if (saved) {
            onSubmit()
            showSuccess(successMessage)
          } else showError(failMessage)
        }
      } catch (e) {
        modalErrorHandler?.showDanger(e.data?.message || e.message)
      }
    } else modalErrorHandler?.showDanger(getString('userProfile.selectSCM'))
  }
  const formInitialValues = {
    name: '',
    ...(MULTIPLE_SCM_TYPES_SUPPORTED ? {} : { authType: getDefaultSelected(selected?.value) }),
    ...data
  }

  return loading ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.GREY_900} font={{ size: 'medium', weight: 'semi-bold' }}>
          {getString('userProfile.addSCM')}
        </Text>
        <Formik<SCMData>
          initialValues={formInitialValues}
          formName="sourceCodeManagerForm"
          validationSchema={Yup.object().shape({
            name: NameSchema(),
            username: Yup.string().when(['authType'], {
              is: authType => authType === AuthTypes.USERNAME_PASSWORD || authType === AuthTypes.USERNAME_TOKEN,
              then: Yup.string().trim().required(getString('validation.username')),
              otherwise: Yup.string().nullable()
            }),
            password: Yup.object().when(['authType'], {
              is: AuthTypes.USERNAME_PASSWORD,
              then: Yup.object().required(getString('validation.password')),
              otherwise: Yup.object().nullable()
            }),
            kerberosKey: Yup.object().when(['authType'], {
              is: AuthTypes.KERBEROS,
              then: Yup.object().required(getString('validation.kerberosKey')),
              otherwise: Yup.object().nullable()
            }),
            accessToken: Yup.object().when(['authType'], {
              is: AuthTypes.USERNAME_TOKEN,
              then: Yup.object().required(getString('validation.accessToken')),
              otherwise: Yup.object().nullable()
            }),
            sshKey: Yup.object().when(['authType'], {
              is: AuthTypes.SSH_KEY,
              then: Yup.object().required(getString('validation.sshKey')),
              otherwise: Yup.object().nullable()
            }),
            accessKey: Yup.string().when(['authType'], {
              is: AuthTypes.AWSCredentials,
              then: Yup.string().trim().required(getString('userProfile.scmValidation.accessKey')),
              otherwise: Yup.string().nullable()
            }),
            secretKey: Yup.object().when(['authType'], {
              is: AuthTypes.AWSCredentials,
              then: Yup.object().required(getString('userProfile.scmValidation.secretKey')),
              otherwise: Yup.object().nullable()
            })
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            handleSubmit(values)
          }}
        >
          {formikProps => {
            return (
              <Form>
                <Layout.Vertical spacing="medium">
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <Container width={400}>
                    <FormInput.Text name="name" label={getString('name')} />
                  </Container>
                  <Text color={Color.BLACK}>
                    {MULTIPLE_SCM_TYPES_SUPPORTED
                      ? getString('userProfile.selectSCM')
                      : getString('userProfile.selectedSCM')}
                  </Text>
                  <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                    <CardSelect
                      data={selected ? [selected] : sourceCodeManagers}
                      cornerSelected={true}
                      className={css.cardRow}
                      cardClassName={css.card}
                      renderItem={item => (
                        <CardBody.Icon icon={item.icon} iconSize={25}>
                          <Text
                            font={{
                              size: 'small',
                              align: 'center'
                            }}
                            flex={{ justifyContent: 'center' }}
                            color={Color.BLACK}
                          >
                            {item.text}
                          </Text>
                        </CardBody.Icon>
                      )}
                      onChange={value => {
                        setSelected(value)
                        modalErrorHandler?.hide()
                        formikProps.setFieldValue('authType', getDefaultSelected(value.value))
                      }}
                      selected={selected}
                    />
                    {selected && MULTIPLE_SCM_TYPES_SUPPORTED ? (
                      <Button
                        text={getString('change')}
                        variation={ButtonVariation.LINK}
                        onClick={() => {
                          setSelected(undefined)
                          formikProps.setFieldValue('authType', null)
                        }}
                      />
                    ) : null}
                  </Layout.Horizontal>
                </Layout.Vertical>
                {selected ? (
                  <Authentication formikProps={formikProps} authOptions={getAuthOptions(selected.value)} />
                ) : null}
                <Layout.Horizontal spacing="small" padding={{ top: 'huge' }}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={isEditMode ? getString('update') : getString('add')}
                    type="submit"
                  />
                  <Button text={getString('cancel')} onClick={onClose} variation={ButtonVariation.TERTIARY} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default SourceCodeManagerForm
