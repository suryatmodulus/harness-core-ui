import React, { useState, useEffect } from 'react'
import { Formik, Accordion, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { useParams } from 'react-router-dom'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'

import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'

import { useCDNGVerificationJobs, VerificationJobDTO } from 'services/cv'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ContinousVerificationData } from '../../types'
import BaseContinousVerification from './components/BaseContinousVerification'
import DefineVerificationJob from './components/DefineVerificationJob'
import ConfigureVerificationJob from './components/ConfigureVerificationJob/ConfigureVerificationJob'
import type { ContinousVerificationWidgetProps } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1485670459/Continous+Verification+Step
 */

export function ContinousVerificationWidget(
  { initialValues, onUpdate, isNewStep }: ContinousVerificationWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const [jobContents, setJobContents] = useState<VerificationJobDTO[]>([])
  const values = { ...initialValues, spec: { ...initialValues.spec } }
  const { getString } = useStrings()
  const defaultCVSchema = Yup.object().shape({
    name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
    spec: Yup.object().shape({
      verificationJobRef: Yup.mixed().test('jobName', 'Job Name is required', value => value !== ''),
      spec: Yup.object().shape({
        duration: Yup.mixed().test('duration', 'Duration is required', value => value !== ''),
        sensitivity: Yup.mixed().test('sensitivity', 'Sensitivity is required', value => value !== ''),
        baseline: Yup.mixed().test('baseline', 'Baseline is required', value => value !== ''),
        trafficsplit: Yup.mixed().test('trafficsplit', 'Trafficsplit is required', value => value !== ''),
        deploymentTag: Yup.mixed().test('deploymentTag', 'DeploymentTag is required', value => value !== '')
      })
    }),
    ...IdentifierValidation()
  })
  const validationSchema = defaultCVSchema
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const selectedStage = getStageFromPipeline(selectedStageId as string)?.stage
  const envIdentifier = selectedStage?.stage?.spec?.infrastructure?.environmentRef
  const serviceIdentifier = selectedStage?.stage?.spec?.serviceConfig.serviceRef
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()

  //passing service and env identifier only when they are fixed inputs
  const { data, loading, error } = useCDNGVerificationJobs({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      ...(envIdentifier !== RUNTIME_INPUT_VALUE && { envIdentifier }),
      ...(serviceIdentifier !== RUNTIME_INPUT_VALUE && { serviceIdentifier })
    },
    debounce: 400
  })
  const content: VerificationJobDTO[] | undefined = data?.data

  useEffect(() => {
    if (content && !loading && !error) {
      setJobContents(content)
    }
  }, [content, error, loading])

  return (
    <Formik<ContinousVerificationData>
      onSubmit={submit => {
        onUpdate?.(submit)
      }}
      initialValues={values}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ContinousVerificationData>) => {
        setFormikRef(formikRef, formik)
        return (
          <Accordion activeId="step-1" className={stepCss.accordion}>
            <Accordion.Panel
              id="step-1"
              summary={getString('basic')}
              details={<BaseContinousVerification formik={formik} isNewStep={isNewStep} />}
            />
            <Accordion.Panel
              id="step-2"
              summary={getString('connectors.cdng.defineVerificationJob')}
              details={
                <DefineVerificationJob formik={formik} jobContents={jobContents} loading={loading} error={error} />
              }
            />
            <Accordion.Panel
              id="step-3"
              summary={getString('connectors.cdng.configureVerificationJob')}
              details={<ConfigureVerificationJob formik={formik} jobContents={jobContents} />}
            />
          </Accordion>
        )
      }}
    </Formik>
  )
}

export const ContinousVerificationWidgetWithRef = React.forwardRef(ContinousVerificationWidget)
