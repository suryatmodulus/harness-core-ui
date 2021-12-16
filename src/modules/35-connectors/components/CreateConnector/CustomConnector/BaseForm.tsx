import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Container, FormikForm, Layout, FormInput, Formik, Button, Text } from '@wings-software/uicore'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
// eslint-disable-next-line no-restricted-imports
import { HTTPRequestMethod } from '@cv/pages/health-source/common/HealthSourceHTTPRequestMethod/HealthSourceHTTPRequestMethod.types'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { KeyValuePairs } from './KeyValuePairs'
import { prepareCustomConnectorInfo } from './prepareCustomConnectorInfo'
import { ValidationProps } from './Validation'
import css from './CreatePrometheusConnector.module.scss'

export function BaseForm(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, projectIdentifier, orgIdentifier, accountId, name } = props
  const { getString } = useStrings()
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    requestMethod: HTTPRequestMethod.GET,
    accountId,
    projectIdentifier,
    orgIdentifier
  })

  // TODO: we must change this

  useEffect(() => {
    const updatedInitialValues = prepareCustomConnectorInfo(
      prevStepData,
      accountId,
      projectIdentifier,
      orgIdentifier,
      name!
    )
    console.log('ppppppp', updatedInitialValues)
    if (updatedInitialValues) {
      setInitialValues({ ...updatedInitialValues })
    }
  }, [prevStepData])

  return (
    <Container>
      <Text height="40px">Details</Text>
      <Formik
        enableReinitialize
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('connectors.prometheus.urlValidation'))
        })}
        formName="customConnector"
        onSubmit={async (formData: ConnectorConfigDTO): Promise<any> => {
          console.log('dddddddd', formData)

          nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })
        }}
      >
        {formik => (
          <FormikForm>
            <FormInput.Text label={'Base URL'} name={`url`} />
            <Text className={css.header}>{name}</Text>

            {name === 'validation' ? (
              <ValidationProps type={HTTPRequestMethod.GET} formik={formik} key={name} />
            ) : (
              <KeyValuePairs name={name} formik={formik} prevStepData={prevStepData} key={name} />
            )}
            <Layout.Horizontal spacing="large" style={{ marginTop: '50px' }}>
              <Button onClick={() => props.previousStep?.({ ...props.prevStepData })} text={getString('back')} />
              <Button type="submit" text={getString('next')} intent="primary" />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}
