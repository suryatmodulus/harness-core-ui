import React from 'react'

import { Button, Layout, StepProps, Heading, Text, Container } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'

import type { K8sDelegateWizardData } from '../DelegateSetupStep/DelegateSetupStep'
import StepProcessing from '../../components/StepProcessing/StepProcessing'

import css from '../CreateK8sDelegate.module.scss'

interface StepSuccessVerifcationProps {
  onClose?: any
}
const StepSuccessVerification: React.FC<StepProps<K8sDelegateWizardData> & StepSuccessVerifcationProps> = props => {
  const { previousStep } = props
  const { getString } = useStrings()

  const onClickBack = (): void => {
    if (previousStep) {
      previousStep(props?.prevStepData)
    }
  }
  return (
    <>
      <Layout.Horizontal className={css.verificationBody}>
        <Layout.Vertical className={css.panelLeft}>
          <Layout.Horizontal>
            <Heading level={2} className={css.titleYamlVerification}>
              {getString('delegate.successVerification.applyYAMLTitle')}
            </Heading>
          </Layout.Horizontal>
          <Layout.Horizontal className={css.descriptionVerificationWrapper}>
            <Text font="normal" width={408}>
              {getString('delegate.successVerification.description1')}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal>
            <Text font={{ weight: 'bold', size: 'normal' }} width={408}>
              {getString('delegate.successVerification.description2')}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="medium" className={css.verificationFieldWrapper}>
            <Container
              intent="primary"
              padding="small"
              font={{
                align: 'center'
              }}
              flex
              className={css.verificationField}
            >
              <Text style={{ marginRight: '24px' }} font="small">
                {getString('delegate.verifyDelegateYamlCmnd')}
              </Text>
              <CopyToClipboard content={getString('delegate.verifyDelegateYamlCmnd').slice(2)} />
            </Container>
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical>
          <hr className={css.verticalLine} />
        </Layout.Vertical>
        <Layout.Vertical>
          <StepProcessing name={props.prevStepData?.name} replicas={props.prevStepData?.replicas} />
        </Layout.Vertical>
      </Layout.Horizontal>
      <Layout.Horizontal padding="xxxlarge">
        <Button
          id="stepReviewScriptBackButton"
          text={getString('back')}
          onClick={onClickBack}
          icon="chevron-left"
          margin={{ right: 'small' }}
        />
        <Button
          text={getString('done')}
          intent="primary"
          padding="small"
          onClick={() => {
            props?.onClose()
          }}
        />
      </Layout.Horizontal>
    </>
  )
}

export default StepSuccessVerification
