import React, { useMemo } from 'react'
import * as Yup from 'yup'
import { Formik, FormikForm, FormInput, Layout, Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectionConfigProps } from '@connectors/components/CreateConnector/CommonCVConnector/constants'
import { HTTPRequestMethodOption } from './components/HTTPRequestMethod/HTTPRequestMethod'
import type { CustomHealthValidationPathFormFields } from './CustomHealthValidationPath.types'
import { CustomHealthValidationPathFieldNames } from './CustomHealthValidationPath.constants'
import { HTTPRequestMethod } from './components/HTTPRequestMethod/HTTPRequestMethod.types'
import { transformDataToStepData } from './CustomHealthValidationPath.utils'
import css from './CustomHealthValidationPath.module.scss'

export function CustomHealthValidationPath(props: ConnectionConfigProps): JSX.Element {
  const { prevStepData, accountId, projectIdentifier, orgIdentifier, connectorInfo, nextStep, previousStep } = props
  const { getString } = useStrings()
  const initialValues: CustomHealthValidationPathFormFields = useMemo(
    () => transformDataToStepData(prevStepData),
    [prevStepData]
  )

  return (
    <Formik<CustomHealthValidationPathFormFields>
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        [CustomHealthValidationPathFieldNames.REQUEST_METHOD]: Yup.string().required(
          getString('connectors.customHealth.requestMethod')
        ),
        [CustomHealthValidationPathFieldNames.VALIDATION_PATH]: Yup.string()
          .nullable()
          .required(getString('connectors.customHealth.validationPath')),
        [CustomHealthValidationPathFieldNames.REQUEST_BODY]: Yup.string()
          .nullable()
          .when(CustomHealthValidationPathFieldNames.REQUEST_METHOD, {
            is: HTTPRequestMethod.POST,
            then: Yup.string().trim().required(getString('connectors.customHealth.requestBody'))
          })
      })}
      formName="customConnector-validationPath"
      onSubmit={(formData): void =>
        nextStep?.({ ...connectorInfo, ...prevStepData, ...formData, accountId, projectIdentifier, orgIdentifier })
      }
    >
      {formik => (
        <FormikForm>
          <HTTPRequestMethodOption
            onChange={val => {
              if (val === HTTPRequestMethod.GET) {
                formik.setFieldValue('requestBody', null)
              }
            }}
          />
          <FormInput.Text
            label={getString('connectors.validationPath')}
            name={CustomHealthValidationPathFieldNames.VALIDATION_PATH}
          />
          {formik.values?.requestMethod === HTTPRequestMethod.POST && (
            <FormInput.TextArea
              className={css.httpRequestMethodPostBodyTextArea}
              label={getString('common.smtp.labelBody')}
              name={CustomHealthValidationPathFieldNames.REQUEST_BODY}
            />
          )}
          <Layout.Horizontal spacing="large">
            <Button onClick={() => previousStep?.({ ...props.prevStepData })} text={getString('back')} />
            <Button type="submit" text={getString('next')} intent="primary" />
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}
