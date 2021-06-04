import React, { useRef, useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  StepProps,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  FormikForm,
  Container,
  FormInput,
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router'
import * as Yup from 'yup'
import type { IOptionProps } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ResponseBoolean,
  validateTheIdentifierIsUniquePromise,
  Failure
} from 'services/cd-ng'
import { String, useStrings } from 'framework/strings'
import { GitUrlType, GitConnectionType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
import css from './ConnectorDetailsStep.module.scss'

interface ConnectorDetailsStepProps extends StepProps<ConnectorInfoDTO> {
  type: ConnectorInfoDTO['type']
  name: string
  setFormData?: (formData: ConnectorConfigDTO) => void
  formData?: ConnectorConfigDTO
  isEditMode?: boolean
  connectorInfo: ConnectorInfoDTO | void
  mock?: ResponseBoolean
}

interface DetailsStepInterface {
  urlType: string
  connectionType: string
  url: string
}

const GitDetailsStep: React.FC<StepProps<ConnectorConfigDTO> & ConnectorDetailsStepProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const mounted = useRef(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [loading, setLoading] = useState(false)
  const isEdit = props.isEditMode || prevStepData?.isEdit
  const { getString } = useStrings()

  const urlTypeOptions: IOptionProps[] = [
    {
      label: getString('account'),
      value: GitUrlType.ACCOUNT
    },
    {
      label: getString('repository'),
      value: GitUrlType.REPO
    }
  ]

  const connectionTypeOptions: IOptionProps[] = [
    {
      label: getString('HTTP'),
      value: GitConnectionType.HTTP
    },
    {
      label: getString('SSH'),
      value: GitConnectionType.SSH
    }
  ]

  const getUrlLabel = (connectorType: ConnectorInfoDTO['type'], urlType: string): string => {
    switch (connectorType) {
      case Connectors.GIT:
        return urlType === GitUrlType.ACCOUNT
          ? getString('common.git.gitAccountUrl')
          : getString('common.git.gitRepoUrl')
      case Connectors.GITHUB:
        return urlType === GitUrlType.ACCOUNT
          ? getString('common.git.gitHubAccountUrl')
          : getString('common.git.gitHubRepoUrl')
      case Connectors.GITLAB:
        return urlType === GitUrlType.ACCOUNT
          ? getString('common.git.gitLabAccountUrl')
          : getString('common.git.gitLabRepoUrl')
      case Connectors.BITBUCKET:
        return urlType === GitUrlType.ACCOUNT
          ? getString('common.git.bitbucketAccountUrl')
          : getString('common.git.bitbucketRepoUrl')
      default:
        return ''
    }
  }

  const getUrlLabelPlaceholder = (connectorType: ConnectorInfoDTO['type'], connectionType: string): string => {
    switch (connectorType) {
      case Connectors.GIT:
      case Connectors.GITHUB:
        return connectionType === GitConnectionType.HTTP
          ? getString('common.git.gitHubUrlPlaceholder')
          : getString('common.git.gitHubUrlPlaceholderSSH')
      case Connectors.GITLAB:
        return connectionType === GitConnectionType.HTTP
          ? getString('common.git.gitLabUrlPlaceholder')
          : getString('common.git.gitLabUrlPlaceholderSSH')
      case Connectors.BITBUCKET:
        return connectionType === GitConnectionType.HTTP
          ? getString('common.git.bitbucketUrlPlaceholder')
          : getString('common.git.bitbucketPlaceholderSSH')
      default:
        return ''
    }
  }

  const handleSubmit = async (formData: ConnectorConfigDTO): Promise<void> => {
    mounted.current = true
    if (isEdit) {
      //In edit mode validateTheIdentifierIsUnique API not required
      props.setFormData?.(formData)
      nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData })
    } else {
      setLoading(true)
      try {
        const response = await validateTheIdentifierIsUniquePromise({
          queryParams: {
            identifier: formData.identifier,
            accountIdentifier: accountId,
            orgIdentifier: orgIdentifier,
            projectIdentifier: projectIdentifier
          },
          mock: props.mock
        })
        setLoading(false)

        if ('SUCCESS' === response.status) {
          if (response.data) {
            props.setFormData?.(formData)
            nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData })
          } else {
            modalErrorHandler?.showDanger(
              getString('validation.duplicateIdError', {
                connectorName: formData.name,
                connectorIdentifier: formData.identifier
              })
            )
          }
        } else {
          throw response as Failure
        }
      } catch (error) {
        setLoading(false)
        modalErrorHandler?.showDanger(error.message)
      }
    }
  }

  const getInitialValues = (): DetailsStepInterface => {
    if (isEdit && props.connectorInfo) {
      return {
        urlType:
          props.type === Connectors.GIT ? props.connectorInfo?.spec?.connectionType : props.connectorInfo?.spec?.type,
        url: props.connectorInfo?.spec?.url,
        connectionType:
          props.type === Connectors.GIT
            ? props.connectorInfo?.spec?.type
            : props.connectorInfo?.spec?.authentication?.type
      }
    } else {
      return {
        urlType: GitUrlType.ACCOUNT,
        connectionType: GitConnectionType.HTTP,
        url: ''
      }
    }
  }

  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep}>
      <div className={css.heading}>{getString('details')}</div>
      <ModalErrorHandler bind={setModalErrorHandler} />

      <Container padding="small" className={css.connectorForm}>
        <Formik
          onSubmit={formData => {
            handleSubmit(formData)
          }}
          formName="gitDetailsStepForm"
          validationSchema={Yup.object().shape({
            url: Yup.string().trim().required(getString('validation.UrlRequired'))
          })}
          initialValues={{
            ...getInitialValues(),
            ...prevStepData,
            ...props.formData
          }}
        >
          {(formikProps: FormikProps<DetailsStepInterface>) => {
            return (
              <FormikForm>
                <Container style={{ minHeight: 460 }}>
                  <Text>{getString('common.git.urlType')}</Text>
                  <FormInput.RadioGroup
                    style={{ fontSize: 'normal' }}
                    radioGroup={{ inline: true }}
                    name="urlType"
                    items={urlTypeOptions}
                  />
                  <Text>{getString('common.git.connectionType')}</Text>
                  <FormInput.RadioGroup
                    style={{ fontSize: 'normal' }}
                    name="connectionType"
                    radioGroup={{ inline: true }}
                    items={connectionTypeOptions}
                  />
                  <FormInput.Text
                    className={css.formElm}
                    name="url"
                    label={getUrlLabel(props.type, formikProps.values.urlType)}
                    placeholder={getUrlLabelPlaceholder(props.type, formikProps.values.connectionType)}
                  />
                </Container>
                <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => props?.previousStep?.(props?.prevStepData)}
                    data-name="commonGitBackButton"
                  />
                  <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={loading}>
                    <String stringID="continue" />
                  </Button>
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

export default GitDetailsStep
