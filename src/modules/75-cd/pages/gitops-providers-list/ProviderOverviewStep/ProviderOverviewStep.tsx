import React, { useRef, useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  FormikForm,
  Container,
  ButtonVariation
} from '@wings-software/uicore'
import { useParams } from 'react-router'
import * as Yup from 'yup'
import { pick } from 'lodash-es'
import { GitOpsProvider, validateProviderIdentifierIsUniquePromise, Failure } from 'services/cd-ng'
import { String, useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'
// import { useAppStore } from 'framework/AppStore/AppStoreContext'
// import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
// import GitContextForm, { GitContextProps, IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { saveCurrentStepData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { BaseProviderStepProps } from '../types'
import css from './ProviderOverviewStep.module.scss'

export type ProviderOverviewStepProps = BaseProviderStepProps

type Params = {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
}

const ProviderOverviewStep: React.FC<ProviderOverviewStepProps> = props => {
  const { prevStepData, nextStep, /*disableGitSync,*/ provider } = props
  const {
    accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<Params>()
  const projectIdentifier = provider ? provider.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = provider ? provider.orgIdentifier : orgIdentifierFromUrl
  // const { isGitSyncEnabled: gitSyncAppStoreEnabled } = useAppStore()
  // const isGitSyncEnabled = gitSyncAppStoreEnabled && !disableGitSync
  // const showGitContextForm = isGitSyncEnabled && orgIdentifier && projectIdentifier

  const mounted = useRef(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [loading, setLoading] = useState(false)
  const isEdit = props.isEditMode
  const { getString } = useStrings()

  const handleSubmit = async (formData: GitOpsProvider): Promise<void> => {
    mounted.current = true
    if (isEdit) {
      //In edit mode validateTheIdentifierIsUnique API not required
      // props.setFormData?.(formData)
      nextStep?.({ ...props.provider, ...prevStepData, ...formData })
      return
    }
    setLoading(true)
    try {
      const response = await validateProviderIdentifierIsUniquePromise({
        queryParams: {
          identifier: formData.identifier,
          accountIdentifier: accountId,
          orgIdentifier: orgIdentifier,
          projectIdentifier: projectIdentifier
        }
      })
      setLoading(false)

      if ('SUCCESS' !== response.status) {
        modalErrorHandler?.showDanger((response as Failure)?.message || '')
        return
      }
      if (response.data) {
        nextStep?.({ ...props.provider, ...prevStepData, ...formData })
      } else {
        modalErrorHandler?.showDanger(
          getString('cd.duplicateIdError', {
            providerName: formData.name,
            providerIdentifier: formData.identifier
          })
        )
      }
    } catch (error) {
      setLoading(false)
      modalErrorHandler?.showDanger(error.message)
    }
  }

  const getInitialValues = (): GitOpsProvider => {
    if (isEdit) {
      return pick(props.provider, ['name', 'identifier', 'description', 'tags', 'spec']) as GitOpsProvider
    } else {
      return {
        name: '',
        description: '',
        identifier: '',
        tags: {},
        spec: {}
      }
    }
  }

  return (
    <Layout.Vertical spacing="xxlarge" className={css.stepContainer}>
      <div className={css.heading}>{getString('cd.providerOverview')}</div>
      <Container className={css.connectorForm}>
        <Formik<GitOpsProvider>
          onSubmit={formData => {
            handleSubmit(formData)
          }}
          formName={`GitOpsProviderStepForm${provider?.spec?.type}`}
          validationSchema={Yup.object().shape({
            name: NameSchema(),
            identifier: IdentifierSchema()
          })}
          initialValues={{
            ...getInitialValues(),
            ...prevStepData
          }}
        >
          {formikProps => {
            saveCurrentStepData(props.getCurrentStepData, formikProps.values)
            return (
              <FormikForm>
                <Container style={{ minHeight: 460 }}>
                  <ModalErrorHandler
                    bind={setModalErrorHandler}
                    style={{ maxWidth: '740px', marginBottom: '20px', borderRadius: '3px', borderColor: 'transparent' }}
                  />

                  <NameIdDescriptionTags
                    className={css.formElm}
                    formikProps={formikProps}
                    identifierProps={{ inputName: 'name', isIdentifierEditable: !isEdit }}
                  />
                </Container>
                <Layout.Horizontal>
                  <Button
                    type="submit"
                    variation={ButtonVariation.PRIMARY}
                    rightIcon="chevron-right"
                    disabled={loading}
                  >
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

export default ProviderOverviewStep
