import React, { useState, useRef } from 'react'
import { Formik, FormikForm, Container, Text } from '@wings-software/uicore'
import { object as yupObject } from 'yup'
import {
  ConnectorSelection,
  SelectOrCreateConnectorFieldNames
} from '@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import { buildConnectorRef } from '@cv/pages/onboarding/CVOnBoardingUtils'
import { useStrings } from 'framework/strings'
import ValidateKubernetesConnector from './ValidateKubernetesConnector'
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
  const refetchConnectorValidation = useRef({
    call: () => null
  })
  const { onPrevious, onSubmit, data, isEditMode } = props
  const { getString } = useStrings()
  const [submitValue, setSubmitValue] = useState<KubernetesActivitySourceInfo | null>(null)

  const validateAndSubmit = (values: React.SetStateAction<KubernetesActivitySourceInfo | null>): void => {
    if (submitValue) {
      // for triggering refetch in ValidateKubernetesConnector
      refetchConnectorValidation.current.call()
    } else {
      setSubmitValue(values)
    }
  }

  return (
    <Formik
      initialValues={data || buildKubernetesActivitySourceInfo()}
      validationSchema={ValidationSchema}
      formName="cvSelectk8"
      onSubmit={values => validateAndSubmit(values)}
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
            {!!submitValue && (
              <ValidateKubernetesConnector
                values={submitValue}
                onSuccess={onSubmit}
                callRefetch={refetchConnectorValidation}
              />
            )}
          </Container>
          <SubmitAndPreviousButtons onPreviousClick={onPrevious} />
        </FormikForm>
      )}
    </Formik>
  )
}
