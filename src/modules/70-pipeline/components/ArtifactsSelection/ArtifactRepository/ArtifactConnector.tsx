import React from 'react'
import { Formik, getMultiTypeFromValue, Layout, MultiTypeInputType, Button, StepProps } from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/exports'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'
import type { ConnectorDataType } from '../ArtifactInterface'
import css from './ArtifactConnector.module.scss'

interface ArtifactConnectorProps {
  handleViewChange: () => void
  name?: string
  expressions: string[]
  stepName: string
  newConnectorLabel: string
  initialValues: ConnectorDataType
  connectorType: ConnectorInfoDTO['type']
}

export const ArtifactConnector: React.FC<StepProps<ConnectorConfigDTO> & ArtifactConnectorProps> = props => {
  const {
    handleViewChange,
    previousStep,
    prevStepData,
    nextStep,
    initialValues,
    stepName,
    name,
    expressions,
    connectorType,
    newConnectorLabel
  } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const { getString } = useStrings()

  const primarySchema = Yup.object().shape({
    connectorId: Yup.string().trim().required(getString('validation.artifactServerRequired'))
  })

  const submitFirstStep = async (formData: any): Promise<void> => {
    nextStep?.({ ...formData })
  }

  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep} data-id={name}>
      <div className={css.heading}>{stepName}</div>
      <Formik
        initialValues={initialValues}
        validationSchema={primarySchema}
        onSubmit={formData => {
          submitFirstStep(formData)
        }}
      >
        {formik => (
          <Form>
            <div className={css.connectorForm}>
              <div className={css.connectorContainer}>
                <FormMultiTypeConnectorField
                  name="connectorId"
                  label={getString('connectors.selectConnectorLabel')}
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={410}
                  multiTypeProps={{ expressions }}
                  isNewConnectorLabelVisible={false}
                  type={connectorType}
                  enableConfigureOptions={false}
                  selected={formik?.values?.connectorId}
                />
                {getMultiTypeFromValue(formik.values.connectorId) === MultiTypeInputType.RUNTIME ? (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      value={(formik.values.connectorId as unknown) as string}
                      type={connectorType}
                      variableName="connectorId"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('connectorId', value)
                      }}
                    />
                  </div>
                ) : (
                  <Button
                    intent="primary"
                    minimal
                    text={newConnectorLabel}
                    icon="plus"
                    onClick={() => {
                      handleViewChange()
                      nextStep?.()
                    }}
                    className={css.addNewArtifact}
                  />
                )}
              </div>
            </div>
            <Layout.Horizontal spacing="xxlarge">
              <Button text={getString('back')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />

              <Button intent="primary" type="submit" text={getString('continue')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
