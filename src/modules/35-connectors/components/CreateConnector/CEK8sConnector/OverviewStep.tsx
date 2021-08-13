import React, { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router'
import * as Yup from 'yup'
import { pick, omit as _omit } from 'lodash-es'
import cx from 'classnames'
import {
  Button,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  SelectOption,
  StepProps
} from '@wings-software/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { StringUtils, useToaster } from '@common/exports'
import { getHeadingIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useMutateAsGet } from '@common/hooks'
import { String, useStrings } from 'framework/strings'
import {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  Failure,
  ResponseBoolean,
  useGetConnectorListV2,
  validateTheIdentifierIsUniquePromise
} from 'services/cd-ng'
import type { DetailsForm } from '../commonSteps/ConnectorDetailsStep'
import css from '../commonSteps/ConnectorDetailsStep.module.scss'
import overviewCss from './CEK8sConnector.module.scss'

interface OverviewStepProps {
  type: ConnectorInfoDTO['type']
  name: string
  setFormData?: (formData: ConnectorConfigDTO) => void
  formData?: ConnectorConfigDTO
  isEditMode?: boolean
  connectorInfo?: ConnectorInfoDTO | void
  mock?: ResponseBoolean
}

type Params = {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
}

type OverviewDetailsForm = DetailsForm & { referenceConnector: string }

const OverviewStep: React.FC<StepProps<ConnectorConfigDTO> & OverviewStepProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Params>()
  const mounted = useRef(false)
  const { showError } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [loading, setLoading] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<SelectOption>()
  const isEdit = props.isEditMode || prevStepData?.isEdit
  const { getString } = useStrings()
  const defaultQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      searchTerm: '',
      pageIndex: 0,
      pageSize: 100
    }),
    [accountId]
  )

  const {
    data: connectorData,
    loading: connectorsLoading,
    error: connectorsError
  } = useMutateAsGet(useGetConnectorListV2, {
    body: { filterType: 'Connector', types: ['K8sCluster'] },
    queryParams: defaultQueryParams
  })
  if (connectorsError) {
    showError(connectorsError.message)
  }
  const connectorOptions: SelectOption[] =
    connectorData?.data?.content?.map(dataContent => ({
      value: dataContent.connector?.identifier as string,
      label: dataContent.connector?.name as string
    })) || []

  const handleSubmit = async (formData: ConnectorConfigDTO): Promise<void> => {
    mounted.current = true
    const spec = {
      featuresEnabled: ['VISIBILITY'],
      connectorRef: selectedConnector?.value || formData.referenceConnector
    }
    if (isEdit) {
      //In edit mode validateTheIdentifierIsUnique API not required
      props.setFormData?.(formData)
      nextStep?.(_omit({ ...props.connectorInfo, ...prevStepData, ...formData }, 'referenceConnector'))
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
            nextStep?.(_omit({ ...props.connectorInfo, ...prevStepData, ...formData, spec }, 'referenceConnector'))
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
    if (isEdit) {
      return {
        ...pick(props.connectorInfo, ['name', 'identifier', 'description', 'tags']),
        referenceConnector: (props.connectorInfo as ConnectorInfoDTO)?.spec?.connectorRef
      }
    } else {
      return {
        name: '',
        description: '',
        identifier: '',
        tags: {},
        referenceConnector: props.prevStepData?.spec?.connectorRef
      }
    }
  }

  return (
    <Layout.Vertical spacing="xxlarge" className={cx(css.firstep, overviewCss.overviewStep)}>
      <div className={css.heading}>{getString(getHeadingIdByType(props.type))}</div>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <div className={overviewCss.infoSection}>{getString('connectors.ceK8.infoText')}</div>
      <Container padding="small" className={css.connectorForm}>
        <Formik<OverviewDetailsForm>
          formName="overViewStepForm"
          onSubmit={formData => {
            handleSubmit(formData)
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(getString('validation.connectorName')),
            identifier: Yup.string().when('name', {
              is: val => val?.length,
              then: Yup.string()
                .trim()
                .required(getString('validation.identifierRequired'))
                .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
                .notOneOf(StringUtils.illegalIdentifiers)
            }),
            referenceConnector: Yup.string().required('Select a connector')
          })}
          initialValues={{
            ...(getInitialValues() as OverviewDetailsForm),
            ...prevStepData,
            ...props.formData
          }}
        >
          {formikProps => {
            return (
              <FormikForm>
                <Container style={{ minHeight: 460 }}>
                  <NameIdDescriptionTags
                    className={css.formElm}
                    formikProps={formikProps}
                    identifierProps={{ inputName: 'name', isIdentifierEditable: !isEdit }}
                  />
                  <FormInput.Select
                    name="referenceConnector"
                    label={getString('connectors.ceK8.selectConnectorLabel')}
                    items={connectorOptions}
                    disabled={connectorsLoading}
                    onChange={_item => {
                      setSelectedConnector(_item)
                    }}
                    className={overviewCss.selectConnector}
                  />
                </Container>
                <Layout.Horizontal>
                  <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={loading}>
                    <String stringID="saveAndContinue" />
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

export default OverviewStep
