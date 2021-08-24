import React, { useEffect, useState } from 'react'
import { StepProps, Formik, FormikForm, FormInput, Layout, Text, Color, Button } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

export interface AWSCCDetailsStepProps extends StepProps<ConnectorConfigDTO> {
  isEditMode: boolean
  connectorInfo?: ConnectorInfoDTO
}

export default function AWSCCDetailsStep(props: AWSCCDetailsStepProps) {
  const { getString } = useStrings()
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    urlType: 'Region',
    url: undefined
  })

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    props.nextStep?.({ ...props.prevStepData, ...formData })
  }

  useEffect(() => {
    if (props.isEditMode) {
      setInitialValues({
        urlType: props?.connectorInfo?.spec?.type,
        url: props?.connectorInfo?.spec?.url
      })
    }
  }, [])

  return (
    <Formik
      enableReinitialize
      initialValues={{
        ...initialValues,
        ...props.prevStepData
      }}
      formName="awsCCDetailsForm"
      validationSchema={Yup.object().shape({
        urlType: Yup.string().required(),
        url: Yup.string().required()
      })}
      onSubmit={handleSubmit}
    >
      <FormikForm>
        <Layout.Vertical spacing="large" padding="small" width="60%" style={{ minHeight: 440 }}>
          <Text
            font="medium"
            margin={{ top: 'small' }}
            color={Color.BLACK}
            tooltipProps={{ dataTooltipId: 'awsCCDetailsTooltip' }}
          >
            {getString('details')}
          </Text>
          <FormInput.RadioGroup
            name="urlType"
            label={getString('common.git.urlType')}
            items={[
              { value: 'Region', label: getString('regionLabel') },
              { value: 'Repo', label: getString('repository') }
            ]}
            radioGroup={{ inline: true }}
          />
          <FormInput.Text
            name="url"
            label={getString('connectors.awsCodeCommit.repoUrl')}
            placeholder={getString('UrlLabel')}
          />
        </Layout.Vertical>
        <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
          <Button onClick={() => props.previousStep?.({ ...props.prevStepData })} text={getString('back')} />
          <Button type="submit" intent="primary" rightIcon="chevron-right" text={getString('saveAndContinue')} />
        </Layout.Horizontal>
      </FormikForm>
    </Formik>
  )
}
