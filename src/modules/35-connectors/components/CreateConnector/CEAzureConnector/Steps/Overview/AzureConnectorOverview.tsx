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
  Heading, // Added by akash.bhardwaj@harness.io
  FormInput // Added by akash.bhardwaj@harness.io
} from '@wings-software/uicore'
import { useParams } from 'react-router'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import * as Yup from 'yup'
import { pick } from 'lodash-es'
import {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ResponseBoolean,
  validateTheIdentifierIsUniquePromise,
  Failure,
  EntityGitDetails
} from 'services/cd-ng'
import { String, useStrings } from 'framework/strings'

// Added by akash.bhardwaj@harness.io
import { Description, Tags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'

import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm, { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { getHeadingIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import css from '../../CreateCeAzureConnector.module.scss'

export type DetailsForm = Pick<ConnectorInfoDTO, 'name' | 'identifier' | 'description' | 'tags'> & GitContextProps

interface ConnectorDetailsStepProps extends StepProps<ConnectorInfoDTO> {
  type: ConnectorInfoDTO['type']
  name: string
  setFormData?: (formData: ConnectorConfigDTO) => void
  formData?: ConnectorConfigDTO
  isEditMode?: boolean
  connectorInfo?: ConnectorInfoDTO | void
  gitDetails?: EntityGitDetails
  mock?: ResponseBoolean
}

type Params = {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
}

const Overview: React.FC<StepProps<ConnectorConfigDTO> & ConnectorDetailsStepProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Params>()
  const { isGitSyncEnabled } = useAppStore()
  const mounted = useRef(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [loading, setLoading] = useState(false)
  const isEdit = props.isEditMode || prevStepData?.isEdit
  const { getString } = useStrings()

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

  const getInitialValues = () => {
    // TODO: Check how to add subId and tenantId to the initial values - akash.bhardwaj
    if (isEdit) {
      return { ...pick(props.connectorInfo, ['name', 'identifier', 'description', 'tags']) }
    } else {
      return {
        name: '',
        description: '',
        identifier: '',
        subscriptionId: '',
        tenantId: '',
        tags: {}
      }
    }
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString(getHeadingIdByType(props.type))}
      </Heading>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<DetailsForm>
        onSubmit={formData => {
          handleSubmit(formData)
        }}
        formName="connectorOverviewForm"
        validationSchema={Yup.object().shape({
          name: NameSchema(),
          identifier: IdentifierSchema()
        })}
        initialValues={{
          ...(getInitialValues() as DetailsForm),
          ...prevStepData,
          ...props.formData
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container style={{ minHeight: 460 }}>
                <Container className={cx(css.main, css.dataFields)}>
                  <FormInput.InputWithIdentifier
                    inputLabel="Connector name"
                    idLabel="Connector_name"
                    {...{ inputName: 'name', isIdentifierEditable: !isEdit }}
                  />
                  <FormInput.Text name={'tenantId'} label={'Specify Azure Tenant ID'} />
                  <FormInput.Text name={'subscriptionId'} label={'Specify Azure Subscription ID'} />
                  <Description descriptionProps={{}} hasValue={!!formikProps?.values.description} />
                  <Tags tagsProps={{}} isOptional={true} hasValue={!isEmpty(formikProps?.values.tags)} />
                </Container>
                {isGitSyncEnabled && (
                  <GitSyncStoreProvider>
                    <GitContextForm
                      formikProps={formikProps}
                      gitDetails={props.gitDetails}
                      className={'gitDetailsContainer'}
                    />
                  </GitSyncStoreProvider>
                )}
              </Container>
              <Layout.Horizontal>
                <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={loading}>
                  <String stringID="continue" />
                </Button>
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default Overview
