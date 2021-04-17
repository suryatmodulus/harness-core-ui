import React from 'react'
import { Container, Formik, FormikForm } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useHistory, useParams } from 'react-router-dom'
import SyncStepDataValues from '@cv/utils/SyncStepDataValues'
import routes from '@common/RouteDefinitions'
import { StringUtils } from '@common/exports'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { useStrings } from 'framework/exports'
import ActivitySourceDetails from '../../ActivitySourceDetails/ActivitySourceDetails'

export interface HarnessCDActivitySourceDetailsProps {
  initialValues?: any
  onSubmit?: (data: any) => void
}

const HarnessCDActivitySourceDetails: React.FC<HarnessCDActivitySourceDetailsProps> = props => {
  const { getString } = useStrings()
  const { initialValues } = props
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId, activitySourceId }: any = useParams()
  return (
    <Container style={{ position: 'relative', top: 80 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('validation.nameRequired')),
          identifier: Yup.string().when('name', {
            is: val => val?.length,
            then: Yup.string()
              .trim()
              .required(getString('validation.identifierRequired'))
              .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
              .notOneOf(StringUtils.illegalIdentifiers)
          })
        })}
        onSubmit={values => {
          props.onSubmit?.(values)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <ActivitySourceDetails
                heading={getString('cv.activitySources.harnessCD.select')}
                iconLabel={getString('cv.activitySources.harnessCD.iconLabel')}
                iconName={'cd-main'}
                isEditMode={!!activitySourceId}
              />
              <SubmitAndPreviousButtons
                onPreviousClick={() =>
                  history.push(
                    routes.toCVAdminSetup({
                      projectIdentifier: projectIdentifier as string,
                      orgIdentifier: orgIdentifier as string,
                      accountId
                    })
                  )
                }
                onNextClick={() => {
                  formik.submitForm()
                }}
              />
              <SyncStepDataValues values={formik.values} listenToValues={initialValues} onUpdate={formik.setValues} />
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default HarnessCDActivitySourceDetails
