import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { Layout, Button, Formik, FormInput, Text, FormikForm as Form, StepProps, Color } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { DelegateTypes, setupAWSFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import { PageSpinner } from '@common/components'
import type { ConnectorConfigDTO, ConnectorInfoDTO, AwsCredential } from 'services/cd-ng'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'

import type { ConnectorDetailsProps } from '@connectors/interfaces/ConnectorInterface'
import css from './StepAWSAuthentication.module.scss'
interface StepAWSAuthenticationProps extends ConnectorInfoDTO {
  name: string
}

interface AWSFormInterface {
  delegateType: AwsCredential['type']
  accessKey: TextReferenceInterface | void
  secretKeyRef: SecretReferenceInterface | void
  crossAccountAccess: boolean
  crossAccountRoleArn: string
  externalId: string
}

const defaultInitialFormData: AWSFormInterface = {
  delegateType: DelegateTypes.DELEGATE_OUT_CLUSTER,
  accessKey: undefined,
  secretKeyRef: undefined,
  crossAccountAccess: false,
  crossAccountRoleArn: '',
  externalId: ''
}

const StepAWSAuthentication: React.FC<StepProps<StepAWSAuthenticationProps> & ConnectorDetailsProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId } = useParams<{ accountId: string }>()
  const { getString } = useStrings()
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(props.isEditMode)

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupAWSFormData(props.connectorInfo as any, accountId).then(data => {
            setInitialValues(data as AWSFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepAWSAuthenticationProps)
  }

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical height={'inherit'} padding={{ left: 'small' }}>
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {getString('credentials')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        formName="stepAwsAuthForm"
        validationSchema={Yup.object().shape({
          accessKey: Yup.string()
            .nullable()
            .when('delegateType', {
              is: DelegateTypes.DELEGATE_OUT_CLUSTER,
              then: Yup.string().trim().required(getString('connectors.aws.validation.accessKey'))
            }),
          secretKeyRef: Yup.object().when('delegateType', {
            is: DelegateTypes.DELEGATE_OUT_CLUSTER,
            then: Yup.object().required(getString('connectors.aws.validation.secretKeyRef'))
          }),

          crossAccountRoleArn: Yup.string().when('crossAccountAccess', {
            is: true,
            then: Yup.string().trim().required(getString('connectors.aws.validation.crossAccountRoleArn'))
          })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <Form>
            <Layout.Vertical padding={{ top: 'xxlarge', bottom: 'large' }} className={css.formDataAws}>
              <FormInput.RadioGroup
                name="delegateType"
                items={[
                  { label: getString('connectors.aws.awsAccessKey'), value: DelegateTypes.DELEGATE_OUT_CLUSTER },
                  {
                    label: getString('connectors.aws.assumeIAMRole'),
                    value: DelegateTypes.DELEGATE_IN_CLUSTER
                  },
                  {
                    label: getString('connectors.aws.useIRSA'),
                    value: DelegateTypes.DELEGATE_IN_CLUSTER_IRSA
                  }
                ]}
                className={css.radioGroup}
              />
              {formikProps.values.delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER ? (
                <Layout.Vertical width={'56%'} spacing="large">
                  <Text color={Color.BLACK} tooltipProps={{ dataTooltipId: 'awsAuthentication' }}>
                    {getString('authentication')}
                  </Text>
                  <div>
                    <TextReference
                      name="accessKey"
                      stringId="connectors.aws.accessKey"
                      type={formikProps.values.accessKey ? formikProps.values.accessKey?.type : ValueType.TEXT}
                    />
                    <SecretInput name="secretKeyRef" label={getString('connectors.aws.secretKey')} />
                  </div>
                </Layout.Vertical>
              ) : (
                <></>
              )}

              <Layout.Vertical spacing="small">
                <FormInput.CheckBox name="crossAccountAccess" label={getString('connectors.aws.enableCrossAcc')} />
                {formikProps.values?.crossAccountAccess ? (
                  <>
                    <FormInput.Text
                      className={css.formInput}
                      name="crossAccountRoleArn"
                      label={getString('connectors.aws.crossAccURN')}
                    />
                    <FormInput.Text
                      className={css.formInput}
                      name="externalId"
                      label={getString('connectors.aws.externalId')}
                    />
                  </>
                ) : null}
              </Layout.Vertical>
            </Layout.Vertical>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="awsBackButton"
              />
              <Button type="submit" intent={'primary'} text={getString('continue')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepAWSAuthentication
