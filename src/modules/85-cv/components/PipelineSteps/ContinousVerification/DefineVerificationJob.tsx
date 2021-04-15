import React, { useEffect } from 'react'
import { SelectOption, FormInput, Layout, Text } from '@wings-software/uicore'
import { useParams, Link } from 'react-router-dom'

import type { FormikProps } from 'formik'
import cx from 'classnames'
import type { GetDataError } from 'restful-react'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'

import routes from '@common/RouteDefinitions'
import type { Failure, VerificationJobDTO } from 'services/cv'
import { useStrings } from 'framework/exports'
import type { ContinousVerificationFormData } from './continousVerificationTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function DefineVerificationJob(props: {
  formik: FormikProps<ContinousVerificationFormData>
  jobContents: VerificationJobDTO[] | undefined
  loading: boolean
  error: GetDataError<Failure | Error> | null
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    jobContents,
    loading,
    error
  } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const cvJobNames: SelectOption[] =
    jobContents?.map((el: VerificationJobDTO) => {
      return {
        value: el.identifier as string,
        label: el.jobName as string
      }
    }) || []

  useEffect(() => {
    if (jobContents && !loading && !error && formValues?.spec.verificationJobRef) {
      let verificationJobRef: SelectOption | undefined

      jobContents?.forEach((el: VerificationJobDTO) => {
        if (el.identifier === formValues?.spec.verificationJobRef) {
          verificationJobRef = { value: el.identifier as string, label: el.jobName as string }
        }
      })

      if (verificationJobRef) {
        const newValues = { verificationJobRef }
        const newSpecs = { ...formValues.spec, ...newValues }
        setFieldValue('spec', newSpecs)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {!error && !loading && cvJobNames && cvJobNames.length > 0 && (
        <div className={cx(stepCss.formGroup)}>
          <FormInput.Select
            name="spec.verificationJobRef"
            label={getString('cv.connectors.cdng.jobName')}
            items={cvJobNames}
            value={(formValues as ContinousVerificationFormData).spec?.verificationJobRef as SelectOption}
            onChange={el => {
              //whenever selectedJob is changed then resetting the specs, so that jobConfig data can be fetched from selected job
              const updatedSpecs = { verificationJobRef: el, spec: {} }
              const newSpecs = { ...formValues.spec, ...updatedSpecs }
              setFieldValue('spec', newSpecs)
            }}
          />
        </div>
      )}
      {!error && !loading && cvJobNames && cvJobNames.length === 0 && (
        <Layout.Horizontal spacing="xsmall">
          <Text>{getString('cv.connectors.cdng.noJobsConfigured')}</Text>
          <Link
            to={routes.toCVAdminSetupVerificationJob({
              accountId,
              projectIdentifier,
              orgIdentifier
            })}
            target="_blank"
          >
            {getString('cv.connectors.cdng.createCVJob')}
          </Link>
        </Layout.Horizontal>
      )}
      {error && getString('cv.connectors.cdng.error')}
      {loading && getString('cv.connectors.cdng.loadingJobs')}
    </>
  )
}
