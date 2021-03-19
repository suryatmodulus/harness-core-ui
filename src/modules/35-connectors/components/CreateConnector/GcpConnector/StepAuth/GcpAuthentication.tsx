import React, { useState, useEffect } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  FormikForm as Form,
  StepProps,
  Container,
  CardSelect,
  Color,
  Icon
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import {
  DelegateTypes,
  DelegateCardInterface,
  SecretReferenceInterface,
  setupGCPFormData
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'

import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { useStrings } from 'framework/exports'
import css from '../CreateGcpConnector.module.scss'

interface GcpAuthenticationProps {
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  onConnectorCreated: (data?: ConnectorConfigDTO) => void | Promise<void>
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface StepConfigureProps {
  closeModal?: () => void
  onSuccess?: () => void
}

interface GCPFormInterface {
  delegateType: string
  password: SecretReferenceInterface | void
}
const GcpAuthentication: React.FC<StepProps<StepConfigureProps> & GcpAuthenticationProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId } = props
  const { getString } = useStrings()

  const defaultInitialFormData: GCPFormInterface = {
    delegateType: DelegateTypes.DELEGATE_OUT_CLUSTER,
    password: undefined
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

  const DelegateCards: DelegateCardInterface[] = [
    {
      type: DelegateTypes.DELEGATE_OUT_CLUSTER,
      info: getString('connectors.GCP.delegateOutClusterInfo')
    },
    {
      type: DelegateTypes.DELEGATE_IN_CLUSTER,
      info: getString('connectors.GCP.delegateInClusterInfo')
    }
  ]

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupGCPFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as GCPFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepConfigureProps)
  }

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.secondStep}>
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {getString('details')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...props.prevStepData
        }}
        validationSchema={Yup.object().shape({
          password: Yup.object().when('delegateType', {
            is: DelegateTypes.DELEGATE_OUT_CLUSTER,
            then: Yup.object().required(getString('validation.encryptedKey'))
          })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <Form>
            <Container className={css.clusterWrapper}>
              <CardSelect
                onChange={(item: DelegateCardInterface) => {
                  formikProps?.setFieldValue('delegateType', item.type)
                }}
                data={DelegateCards}
                className={css.cardRow}
                renderItem={(item: DelegateCardInterface) => {
                  return (
                    <Container
                      className={cx(css.card, { [css.selectedCard]: item.type === formikProps.values.delegateType })}
                    >
                      <Text inline className={css.textInfo}>
                        {item.info}
                      </Text>
                      {item.type === formikProps.values.delegateType ? (
                        <Icon margin="small" name="deployment-success-new" size={16} />
                      ) : null}
                    </Container>
                  )
                }}
                selected={DelegateCards[DelegateCards.findIndex(card => card.type === formikProps.values.delegateType)]}
              />
              {formikProps.values.delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER ? (
                <SecretInput name={'password'} label={getString('encryptedKeyLabel')} type={'SecretFile'} />
              ) : (
                <></>
              )}
            </Container>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="gcpBackButton"
              />
              <Button type="submit" intent="primary" text={getString('saveAndContinue')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default GcpAuthentication
