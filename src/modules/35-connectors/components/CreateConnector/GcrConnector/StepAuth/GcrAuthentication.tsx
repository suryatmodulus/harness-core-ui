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
import { useParams } from 'react-router-dom'
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
import css from '../CreateGcrConnector.module.scss'

interface GcrAuthenticationProps {
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  onConnectorCreated?: (data?: ConnectorConfigDTO) => void | Promise<void>
  connectorInfo?: ConnectorInfoDTO | void
}

interface StepConfigureProps {
  closeModal?: () => void
  onSuccess?: () => void
}

interface GCPFormInterface {
  delegateType: string
  password: SecretReferenceInterface | void
}
const GcrAuthentication: React.FC<StepProps<StepConfigureProps> & GcrAuthenticationProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId } = useParams()
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
        {getString('connectors.GCR.stepTwoName')}
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

              {DelegateTypes.DELEGATE_OUT_CLUSTER === formikProps.values.delegateType ? (
                <SecretInput name={'password'} label={getString('encryptedKeyLabel')} type={'SecretFile'} />
              ) : null}
            </Container>
            <Button type="submit" intent="primary" text={getString('saveAndContinue')} rightIcon="chevron-right" />
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default GcrAuthentication
