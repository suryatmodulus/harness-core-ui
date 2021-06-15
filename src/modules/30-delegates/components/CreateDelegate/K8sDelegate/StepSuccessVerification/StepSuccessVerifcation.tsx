import React from 'react'

import { Button, Layout, StepProps, Heading, Text, Container } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { StepK8Data } from '@delegates/DelegateInterface'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'

import css from '../CreateK8sDelegate.module.scss'

interface StepSuccessVerifcationProps {
  onClose?: any
}
const StepSuccessVerification: React.FC<StepProps<StepK8Data> & StepSuccessVerifcationProps> = props => {
  const { previousStep } = props
  const { getString } = useStrings()

  const onClickBack = (): void => {
    previousStep?.(props?.prevStepData)
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
            <Text lineClamp={2} font="normal" width={600}>
              {getString('delegate.successVerification.description1')}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal>
            <Text lineClamp={2} font={{ weight: 'bold', size: 'normal' }} width={600}>
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
          <Layout.Horizontal>
            <Text lineClamp={2} font={{ size: 'normal' }} width={600}>
              {getString('delegates.checkDelegateInstalled')}
            </Text>
          </Layout.Horizontal>
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
