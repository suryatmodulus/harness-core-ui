import React, { useState, useEffect } from 'react'
import { Formik, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { useParams } from 'react-router-dom'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'

import { useCDNGVerificationJobs } from 'services/cv'
import { IdentifierSchema } from '@common/utils/Validation'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ContinousVerificationData } from '../../types'
import type { ContinousVerificationWidgetProps, VerificationJob } from './types'
import { ContinousVerificationWidgetPanels } from './components/ContinousVerificationWidgetPanels/ContinousVerificationWidgetPanels'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1485670459/Continous+Verification+Step
 */

export function ContinousVerificationWidget(
  { initialValues, onUpdate, isNewStep }: ContinousVerificationWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const [jobContents, setJobContents] = useState<VerificationJob[]>([])
  const values = { ...initialValues, spec: { ...initialValues.spec } }
  const { getString } = useStrings()
  const defaultCVSchema = Yup.object().shape({
    name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
    spec: Yup.object().shape({
      verificationJobRef: Yup.string().required(getString('connectors.cdng.validations.jobNameRequired')),
      spec: Yup.object().shape({
        duration: Yup.mixed().test(
          'duration',
          getString('connectors.cdng.validations.durationRequired'),
          value => value !== ''
        ),
        sensitivity: Yup.mixed().test(
          'sensitivity',
          getString('connectors.cdng.validations.sensitivityRequired'),
          value => value !== ''
        ),
        deploymentTag: Yup.string().required(getString('connectors.cdng.validations.deploymentTagRequired'))
      })
    }),
    identifier: IdentifierSchema()
  })
  const validationSchema = defaultCVSchema
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const selectedStage = getStageFromPipeline(selectedStageId as string)?.stage
  const envIdentifier =
    selectedStage?.stage?.spec?.infrastructure?.environment?.identifier ||
    selectedStage?.stage?.spec?.infrastructure?.environmentRef
  const serviceIdentifier =
    selectedStage?.stage?.spec?.serviceConfig?.service?.identifier ||
    selectedStage?.stage?.spec?.serviceConfig?.serviceRef
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
  const content: VerificationJob[] | undefined = data?.data

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
      formName="cvData"
      initialValues={values}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ContinousVerificationData>) => {
        setFormikRef(formikRef, formik)
        return (
          <ContinousVerificationWidgetPanels
            formik={formik}
            isNewStep={isNewStep}
            jobContents={jobContents}
            loading={loading}
            error={error}
          />
        )
      }}
    </Formik>
  )
}

export const ContinousVerificationWidgetWithRef = React.forwardRef(ContinousVerificationWidget)
