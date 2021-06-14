import React, { useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  StepProps,
  // ModalErrorHandlerBinding,
  // ModalErrorHandler,
  FormikForm,
  Container,
  Heading, // Added by akash.bhardwaj@harness.io
  FormInput, // Added by akash.bhardwaj@harness.io
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router'
import { isEmpty, pick, get } from 'lodash-es'
import cx from 'classnames'
import * as Yup from 'yup'
import {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ResponseBoolean,
  EntityGitDetails,
  GetConnectorListV2QueryParams,
  useGetConnectorListV2,
  ConnectorFilterProperties,
  ConnectorResponse
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

const guid = (value: string) => {
  const regex = /^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/
  return regex.test(value)
}

interface OverviewForm extends DetailsForm {
  tenantId: string
  subscriptionId: string
}

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
  const { accountId } = useParams<Params>()
  const { isGitSyncEnabled } = useAppStore()
  // const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [loading, setLoading] = useState(false)
  const isEdit = props.isEditMode || prevStepData?.isEdit
  const { getString } = useStrings()

  const [isUniqueConnector, setIsUniqueConnector] = useState(true)
  const [existingConnectorDetails, setExistingConnectorDetails] = useState<ConnectorResponse | undefined>(undefined)

  const defaultQueryParams: GetConnectorListV2QueryParams = {
    pageIndex: 0,
    pageSize: 10,
    accountIdentifier: accountId,
    getDistinctFromBranches: false
  }

  const filterParams: ConnectorFilterProperties = {
    types: ['CEAzure'],
    filterType: 'Connector'
  }

  const { mutate } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const fetchConnectors = async (formData: ConnectorConfigDTO) => {
    return mutate({
      ...filterParams,
      ccmConnectorFilter: {
        azureTenantId: formData.tenantId,
        azureSubscriptionId: formData.subscriptionId
      }
    })
  }

  const fetchBillingExport = async (formData: ConnectorConfigDTO) => {
    const { status, data } = await mutate({
      ...filterParams,
      ccmConnectorFilter: {
        featuresEnabled: ['BILLING'],
        azureTenantId: formData.tenantId
      }
    })

    return { status, spec: data?.content?.[0]?.connector?.spec }
  }

  const handleSubmit = async (formData: ConnectorConfigDTO): Promise<void> => {
    if (isEdit) {
      nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData })
      return
    }

    setLoading(true)
    const billingExport = fetchBillingExport(formData)
    const connectors = await fetchConnectors(formData)

    if ('SUCCESS' === connectors.status) {
      const hasExistingConnector = !!connectors?.data?.pageItemCount
      if (hasExistingConnector) {
        setIsUniqueConnector(false)
        setExistingConnectorDetails(connectors?.data?.content?.[0])
        setLoading(false)
        return
      }

      const { status, spec } = await billingExport
      if ('SUCCESS' === status) {
        const hasBillingFeatureEnabled = !!spec?.featuresEnabled.find((f: string) => f === 'BILLING')
        if (hasBillingFeatureEnabled) {
          nextStep?.({
            ...props.connectorInfo,
            ...prevStepData,
            ...formData,
            billingExportSpec: spec?.billingExportSpec,
            tenantId: spec?.tenantId,
            subscriptionId: spec?.subscriptionId
          })
          return
        }

        nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData })
      }
      setLoading(false)
    }

    // TODO: handle error cases here
    setLoading(false)
  }

  const getInitialValues = () => {
    if (isEdit) {
      return {
        tenantId: get(props.connectorInfo, 'spec.tenantId'),
        subscriptionId: get(props.connectorInfo, 'spec.subscriptionId'),
        ...pick(props.connectorInfo, ['name', 'identifier', 'description', 'tags'])
      }
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
      {/* <ModalErrorHandler bind={setModalErrorHandler} /> */}
      <Formik<OverviewForm>
        onSubmit={formData => {
          handleSubmit(formData)
        }}
        formName="connectorOverviewForm"
        validationSchema={Yup.object().shape({
          name: NameSchema(),
          identifier: IdentifierSchema(),
          tenantId: Yup.string()
            .required('Tenant ID is required')
            .test('tenantId', 'It has to match GUID pattern. Example: "123e4567-e89b-12d3-a456-9AC7CBDCEE52"', guid),
          subscriptionId: Yup.string()
            .required('Subscription ID is required')
            .test('tenantId', 'It has to match GUID pattern. Example: "123e4567-e89b-12d3-a456-9AC7CBDCEE52"', guid)
        })}
        initialValues={{
          ...(getInitialValues() as OverviewForm),
          ...prevStepData,
          ...props.formData
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container style={{ minHeight: 550 }}>
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

                {!isUniqueConnector && <ExistingConnectorMessage {...existingConnectorDetails} />}
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

const ExistingConnectorMessage = (props: ConnectorResponse) => {
  const accountId = props.connector?.spec?.tenantId
  const name = props.connector?.name

  return (
    <div className={css.connectorExistBox}>
      <Layout.Vertical spacing="medium">
        <Text
          inline
          icon="circle-cross"
          iconProps={{ size: 18, color: 'red700', padding: { right: 'small' } }}
          color="red700"
        >
          Connector already exists for the cloud account
        </Text>
        <Container>
          <Text inline font={'small'} icon="info" iconProps={{ size: 16, padding: { right: 'small' } }} color="grey700">
            The cloud account {accountId} already has a connector “{name}” linked to it. The connector has permissions
            for Cost Visibility.
          </Text>
        </Container>
        <Container>
          <Text
            inline
            font={{ size: 'small', weight: 'semi-bold' }}
            icon="lightbulb"
            iconProps={{ size: 16, padding: { right: 'small' } }}
            color="grey700"
          >
            Try these suggestions
          </Text>
          <Text padding={{ left: 'xlarge' }} color="grey700" font={'small'}>
            Edit the connector <a href="#">{name}</a> if required.
          </Text>
        </Container>
      </Layout.Vertical>
    </div>
  )
}

export default Overview

// TenantId:  b229b2bb-5f33-4d22-bce0-730f6474e906
// Sub: 20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0
