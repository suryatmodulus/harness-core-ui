import React, { useEffect, useState, useCallback } from 'react'
import { Formik, FormikForm, Container, Text } from '@wings-software/uicore'
import { object as yupObject } from 'yup'
import { useParams } from 'react-router-dom'
import {
  ConnectorSelection,
  SelectOrCreateConnectorFieldNames
} from '@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import { buildConnectorRef } from '@cv/pages/onboarding/CVOnBoardingUtils'
import { useStrings } from 'framework/strings'
import { useValidateConnector } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ValidateConnector } from './components'
import type { KubernetesActivitySourceInfo } from '../KubernetesActivitySourceUtils'
import { buildKubernetesActivitySourceInfo } from '../KubernetesActivitySourceUtils'
import css from './SelectKubernetesConnector.module.scss'

interface SelectKubernetesConnectorProps {
  onSubmit: (data: KubernetesActivitySourceInfo) => void
  onPrevious: () => void
  data?: KubernetesActivitySourceInfo
  isEditMode?: boolean
}

const ValidationSchema = yupObject().shape({
  [SelectOrCreateConnectorFieldNames.CONNECTOR_REF]: yupObject().required('Connector Reference is required.')
})

export function SelectKubernetesConnector(props: SelectKubernetesConnectorProps): JSX.Element {
  const { onPrevious, onSubmit, data, isEditMode } = props
  const { getString } = useStrings()
  const [showValidation, setShowValidation] = useState(false)
  const [formData, setformData] = useState<KubernetesActivitySourceInfo | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { loading: validationInProgress, error, refetch } = useValidateConnector({ lazy: true })

  const validateConnector = useCallback(
    async (formikData: KubernetesActivitySourceInfo): Promise<KubernetesActivitySourceInfo> => {
      setShowValidation(true)
      await refetch({
        queryParams: {
          accountId,
          projectIdentifier,
          orgIdentifier,
          connectorIdentifier: formikData?.connectorRef?.value.toString() || '',
          tracingId: `${formikData?.connectorRef?.value.toString()}:testConnection`,
          dataSourceType: 'KUBERNETES'
        }
      })
      setformData(formikData)
      return formikData
    },
    [formData]
  )

  useEffect(() => {
    if (!error && showValidation && !validationInProgress && formData) {
      onSubmit(formData)
    }
  }, [formData])

  return (
    <Formik
      initialValues={data || buildKubernetesActivitySourceInfo()}
      validationSchema={ValidationSchema}
      formName="cvSelectk8"
      onSubmit={validateConnector}
    >
      {formikProps => (
        <FormikForm id="onBoardingForm">
          <Container className={css.main}>
            <Text font={{ size: 'medium' }} margin={{ top: 'large', bottom: 'large' }}>
              {getString('cv.activitySources.kubernetes.selectKubernetesSource.selectConnectorHeading')}
            </Text>
            <CVSelectionCard
              isSelected={true}
              className={css.monitoringCard}
              iconProps={{
                name: 'service-kubernetes',
                size: 40
              }}
              cardLabel={getString('kubernetesText')}
              renderLabelOutsideCard={true}
            />
            <ConnectorSelection
              connectorType="K8sCluster"
              value={formikProps.values.connectorRef}
              createConnectorText={getString(
                'cv.activitySources.kubernetes.selectKubernetesSource.createConnectorText'
              )}
              firstTimeSetupText={getString('cv.activitySources.kubernetes.selectKubernetesSource.firstTimeSetupText')}
              disableConnector={isEditMode}
              connectToMonitoringSourceText={getString('pipelineSteps.kubernetesInfraStep.stepName')}
              onSuccess={connectorInfo => {
                formikProps.setFieldValue(
                  SelectOrCreateConnectorFieldNames.CONNECTOR_REF,
                  buildConnectorRef(connectorInfo)
                )
              }}
            />
            {showValidation && <ValidateConnector progress={validationInProgress} error={error} />}
          </Container>
          <SubmitAndPreviousButtons onPreviousClick={onPrevious} />
        </FormikForm>
      )}
    </Formik>
  )
}
