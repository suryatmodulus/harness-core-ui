import React, { useState } from 'react'
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
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/exports'
import { regexName } from '@common/utils/StringUtils'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import { SourceCodeManagerDTO, useSaveSourceCodeManagers } from 'services/cd-ng'
import { AuthTypes, getAuthentication, SourceCodeTypes } from '@user-profile/utils/utils'
import type { TextReferenceInterface } from '@secrets/components/TextReference/TextReference'
import { useToaster } from '@common/exports'
import Authentication from './Authentication'
import css from '../useSourceCodeManager.module.scss'

interface SourceCodeManagerProps {
  onSubmit: () => void
  onClose: () => void
}

export interface SCMData {
  name: string
  authType?: AuthTypes
  username?: TextReferenceInterface
  password?: SecretReference
  sshKey?: SecretReference
  kerberosKey?: SecretReference
  accessToken?: SecretReference
}
interface SourceCodeType {
  text: string
  value: SourceCodeTypes
  icon: IconName
}

const SourceCodeManagerForm: React.FC<SourceCodeManagerProps> = props => {
  const { onSubmit, onClose } = props
  const { getString } = useStrings()
  const [selected, setSelected] = useState<SourceCodeType>()
  const { showSuccess, showError } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const { mutate: saveSourceCodeManager } = useSaveSourceCodeManagers({})

  const sourceCodeManagers: SourceCodeType[] = [
    { text: getString('repo-provider.githubLabel'), value: SourceCodeTypes.GITHUB, icon: 'github' },
    {
      text: getString('repo-provider.bitbucketLabel'),
      value: SourceCodeTypes.BITBUCKET,
      icon: 'bitbucket-blue'
    },
    { text: getString('repo-provider.gitlabLabel'), value: SourceCodeTypes.GITLAB, icon: 'service-gotlab' },
    {
      text: getString('repo-provider.awscodecommit'),
      value: SourceCodeTypes.AWS_CODECOMMIT,
      icon: 'service-aws-code-deploy'
    }
  ]

  const getDefaultSelected = (type?: SourceCodeTypes): AuthTypes | undefined => {
    switch (type) {
      case SourceCodeTypes.BITBUCKET:
      case SourceCodeTypes.GITHUB:
      case SourceCodeTypes.GITLAB:
        return AuthTypes.USERNAME_PASSWORD
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
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          },
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
          }
        ]
      default:
        return []
    }
  }

  const handleSubmit = async (values: SCMData): Promise<void> => {
    let dataToSubmit: SourceCodeManagerDTO
    if (selected?.value) {
      switch (selected.value) {
        case SourceCodeTypes.BITBUCKET: {
          dataToSubmit = {
            type: SourceCodeTypes.BITBUCKET,
            name: values.name,
            authentication: getAuthentication(values)
          }
          break
        }
        case SourceCodeTypes.GITHUB: {
          dataToSubmit = {
            type: SourceCodeTypes.GITHUB,
            name: values.name,
            authentication: getAuthentication(values)
          }
          break
        }
        case SourceCodeTypes.GITLAB: {
          dataToSubmit = {
            type: SourceCodeTypes.GITLAB,
            name: values.name,
            authentication: getAuthentication(values)
          }
          break
        }
        default:
          return undefined
      }

      try {
        if (dataToSubmit) {
          const saved = await saveSourceCodeManager(dataToSubmit)
          if (saved) {
            onSubmit()
            showSuccess(getString('userProfile.scmCreateSuccess'))
          } else showError(getString('userProfile.scmCreateFail'))
        }
      } catch (e) {
        modalErrorHandler?.showDanger(e.data?.message || e.message)
      }
    } else modalErrorHandler?.showDanger(getString('userProfile.selectSCM'))
  }

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('userProfile.addSCM')}
        </Text>
        <Formik<SCMData>
          initialValues={{
            name: ''
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .required(getString('validation.nameRequired'))
              .matches(regexName, getString('formValidation.name')),
            username: Yup.string().when(['authType'], {
              is: AuthTypes.USERNAME_PASSWORD || AuthTypes.USERNAME_TOKEN,
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
                  <Container width={300}>
                    <FormInput.Text name="name" label={getString('name')} />
                  </Container>
                  <Text color={Color.BLACK}>{getString('userProfile.selectSCM')}</Text>
                  <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                    <CardSelect
                      data={selected ? [selected] : sourceCodeManagers}
                      cornerSelected={true}
                      className={css.cardRow}
                      cardClassName={css.card}
                      renderItem={(item, selectedItem) => (
                        <CardBody.Icon icon={item.icon} iconSize={25}>
                          <Text
                            font={{
                              size: 'small',
                              align: 'center'
                            }}
                            flex={{ justifyContent: 'center' }}
                            color={selectedItem ? Color.GREY_900 : Color.GREY_350}
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
                    {selected ? (
                      <Button
                        text={getString('change')}
                        minimal
                        intent="primary"
                        onClick={() => {
                          setSelected(undefined)
                        }}
                      />
                    ) : null}
                  </Layout.Horizontal>
                </Layout.Vertical>
                {selected ? (
                  <Authentication formikProps={formikProps} authOptions={getAuthOptions(selected.value)} />
                ) : null}
                <Layout.Horizontal spacing="small" padding={{ top: 'huge' }}>
                  <Button intent="primary" text={getString('add')} type="submit" />
                  <Button text={getString('cancel')} onClick={onClose} />
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
