/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, Layout, StepProps, Heading, Text, Container } from '@wings-software/uicore'
import { useCreateDelegateGroup } from 'services/portal'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { K8sDelegateWizardData } from '../DelegateSetupStep/DelegateSetupStep'
import StepProcessing from '../../components/StepProcessing/StepProcessing'

import css from '../CreateK8sDelegate.module.scss'

interface StepSuccessVerifcationProps {
  onClose?: any
}
const StepSuccessVerification: React.FC<StepProps<K8sDelegateWizardData> & StepSuccessVerifcationProps> = props => {
  const { previousStep, prevStepData, onClose } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()

  const onClickBack = (): void => {
    if (previousStep) {
      previousStep(prevStepData)
    }
  }

  const { mutate: createDelegateGroup } = useCreateDelegateGroup({
    queryParams: {
      accountId
    }
  })

  const onDone = async () => {
    const dockerData = {
      delegateType: 'KUBERNETES',
      orgIdentifier,
      projectIdentifier,
      name: prevStepData?.name,
      identifier: prevStepData?.identifier,
      description: prevStepData?.description,
      tags: prevStepData?.tags,
      tokenName: prevStepData?.tokenName
    } as any
    const response = (await createDelegateGroup(dockerData)) as any
    if (response?.ok) {
      onClose()
    } else {
      const err = (response as any)?.responseMessages?.[0]?.message
      showError(err)
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
        <Button text={getString('done')} intent="primary" padding="small" onClick={onDone} />
      </Layout.Horizontal>
    </>
  )
}

export default StepSuccessVerification
