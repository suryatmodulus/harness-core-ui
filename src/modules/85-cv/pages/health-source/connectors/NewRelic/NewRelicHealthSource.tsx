import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import {
  Color,
  Text,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  SelectOption,
  Utils
} from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetNewRelicApplications, AppdynamicsValidationResponse, MetricPackDTO } from 'services/cv'
import { Connectors } from '@connectors/constants'
import { useToaster } from '@common/components/Toaster/useToaster'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import {
  getOptions,
  getInputGroupProps,
  renderValidationStatus,
  validateMetrics,
  createMetricDataFormik
} from '../MonitoredServiceConnector.utils'

import MetricPack from '../MetrickPack'
import { ValidationStatus } from '../MonitoredServiceConnector.constants'
import { HealthSoureSupportedConnectorTypes } from '../MonitoredServiceConnector.constants'
import { validateNewRelic } from './NewRelicHealthSource.utils'
import css from './NewrelicMonitoredSource.module.scss'

const guid = Utils.randomId()

export default function NewRelicHealthSource({
  data: newRelicData,
  onSubmit,
  onPrevious
}: {
  data: any
  onSubmit: (healthSourcePayload: any) => void
  onPrevious: () => void
}): JSX.Element {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()

  const [selectedMetricPacks, setSelectedMetricPacks] = useState<MetricPackDTO[]>([])
  const [validationResultData, setValidationResultData] = useState<AppdynamicsValidationResponse[]>()
  const [newRelicValidation, setNewRelicValidation] = useState<{
    status: string
    result: AppdynamicsValidationResponse[] | []
  }>({
    status: '',
    result: []
  })

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const connectorIdentifier = newRelicData?.connectorRef?.connector?.identifier || newRelicData?.connectorRef

  const {
    data: applicationsData,
    loading: applicationLoading,
    error: applicationError
  } = useGetNewRelicApplications({
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      offset: 0,
      pageSize: 10000,
      filter: '',
      tracingId: guid
    }
  })

  const onValidate = async (appName: string, appId: string, metricObject: { [key: string]: any }): Promise<void> => {
    setNewRelicValidation({ status: ValidationStatus.IN_PROGRESS, result: [] })
    const filteredMetricPack = selectedMetricPacks?.filter(item => metricObject[item.identifier as string])
    const { validationStatus, validationResult } = await validateMetrics(
      filteredMetricPack || [],
      {
        appId,
        appName,
        accountId,
        connectorIdentifier: connectorIdentifier,
        orgIdentifier,
        projectIdentifier,
        requestGuid: guid
      },
      HealthSoureSupportedConnectorTypes.NEW_RELIC
    )
    setNewRelicValidation({
      status: validationStatus as string,
      result: validationResult as AppdynamicsValidationResponse[]
    })
  }

  const applicationOptions: SelectOption[] = useMemo(
    () =>
      getOptions(applicationLoading, applicationsData?.data, HealthSoureSupportedConnectorTypes.NEW_RELIC, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicationLoading]
  )

  useEffect(() => {
    if (
      newRelicData.isEdit &&
      selectedMetricPacks.length &&
      newRelicValidation.status !== ValidationStatus.IN_PROGRESS
    ) {
      onValidate(
        newRelicData?.applicationName,
        newRelicData?.applicationId,
        createMetricDataFormik(newRelicData?.metricPacks)
      )
    }
  }, [selectedMetricPacks, applicationLoading, newRelicData.isEdit])

  const initPayload = useMemo(() => {
    return {
      ...newRelicData,
      newRelicApplication: { label: newRelicData?.applicationName, value: newRelicData?.applicationId }
    }
  }, [newRelicData?.applicationName, newRelicData?.applicationId])

  if (applicationError) {
    clear()
    applicationError && showError(getErrorMessage(applicationError))
  }

  return (
    <Formik
      enableReinitialize
      formName={'newRelicHealthSourceform'}
      validate={values => validateNewRelic(values, getString)}
      validationSchema={Yup.object().shape({
        newRelicApplication: Yup.string().required(
          getString('cv.healthSource.connectors.AppDynamics.validation.application')
        )
      })}
      initialValues={initPayload}
      onSubmit={async values => {
        await onSubmit(values)
      }}
    >
      {formik => {
        return (
          <FormikForm className={css.formFullheight}>
            <CardWithOuterTitle title={getString('cv.healthSource.connectors.AppDynamics.applicationsAndTiers')}>
              <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
                <Container margin={{ bottom: 'small' }} width={'300px'} color={Color.BLACK}>
                  <FormInput.Select
                    className={css.applicationDropdown}
                    onChange={item => {
                      formik.setFieldValue('newRelicApplication', item)
                      setNewRelicValidation({ status: '', result: [] })
                      onValidate(item?.label, item?.value.toString(), formik?.values?.metricData)
                    }}
                    value={
                      !formik?.values?.newRelicApplication
                        ? { label: '', value: '' }
                        : applicationOptions.find(
                            (item: SelectOption) => item.label === formik?.values?.newRelicApplication.label
                          )
                    }
                    name={'newRelicApplication'}
                    placeholder={
                      applicationLoading
                        ? getString('loading')
                        : getString('cv.healthSource.connectors.AppDynamics.applicationPlaceholder')
                    }
                    items={applicationOptions}
                    label={getString('cv.healthSource.connectors.NewRelic.applicationLabel')}
                    {...getInputGroupProps(() => formik.setFieldValue('newRelicApplication', ''))}
                  />
                </Container>
                <Container width={'300px'} color={Color.BLACK}>
                  {formik?.values?.newRelicApplication.label &&
                    formik?.values?.newRelicApplication.value &&
                    renderValidationStatus(
                      newRelicValidation.status,
                      getString,
                      newRelicValidation.result,
                      setValidationResultData,
                      () =>
                        onValidate(
                          formik?.values?.newRelicApplication?.label,
                          formik?.values?.newRelicApplication?.value,
                          formik?.values?.metricData
                        )
                    )}
                </Container>
              </Layout.Horizontal>
            </CardWithOuterTitle>
            <CardWithOuterTitle title={getString('metricPacks')}>
              <Layout.Vertical>
                <Text color={Color.BLACK}>{getString('cv.healthSource.connectors.AppDynamics.metricPackLabel')}</Text>
                <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
                  <MetricPack
                    formik={formik}
                    setSelectedMetricPacks={setSelectedMetricPacks}
                    connector={HealthSoureSupportedConnectorTypes.NEW_RELIC}
                    value={formik.values.metricPacks}
                    onChange={async metricValue => {
                      await onValidate(
                        formik?.values?.newRelicApplication?.label,
                        formik?.values?.newRelicApplication?.value,
                        metricValue
                      )
                    }}
                  />
                  {validationResultData && (
                    <MetricsVerificationModal
                      verificationData={validationResultData}
                      guid={guid}
                      onHide={setValidationResultData as () => void}
                      verificationType={Connectors.NEW_RELIC}
                    />
                  )}
                </Layout.Horizontal>
              </Layout.Vertical>
            </CardWithOuterTitle>
            <DrawerFooter isSubmit onPrevious={onPrevious} onNext={formik.submitForm} />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
