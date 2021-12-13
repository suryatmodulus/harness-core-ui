import React from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import { TrialModalTemplate } from '@templates-library/components/TrialModalTemplate/TrialModalTemplate'
import { isCDCommunity, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type {
  UseTrialModalProps,
  PipelineProps,
  UseTrialModalReturns
} from '@templates-library/components/TrialModalTemplate/trialModalUtils'
import { useGetFormPropsByTrialType } from '@templates-library/components/TrialModalTemplate/trialModalUtils'
import ffImage from '../images/illustration.png'
import css from './useFFTrialModal.module.scss'

interface FFTrialTemplateProps {
  description: string
  children: React.ReactElement
  rightWidth?: string
}

const FFTrialTemplate: React.FC<FFTrialTemplateProps> = ({ description, children, rightWidth }) => {
  const { getString } = useStrings()
  const { licenseInformation } = useLicenseStore()
  return (
    <TrialModalTemplate
      iconName="cf-main"
      title={getString('cf.continuous')}
      description={description}
      imgSrc={ffImage}
      rightWidth={rightWidth}
      hideTrialBadge={isCDCommunity(licenseInformation)}
    >
      {children}
    </TrialModalTemplate>
  )
}

const FFTrial: React.FC<UseTrialModalProps> = ({ trialType, actionProps }) => {
  const { child, description, rightWidth } = useGetFormPropsByTrialType({ trialType, actionProps, module: 'ci' })

  return (
    <FFTrialTemplate description={description} rightWidth={rightWidth}>
      {child}
    </FFTrialTemplate>
  )
}

const FFTrialDialog = ({ actionProps, trialType }: UseTrialModalProps): React.ReactElement => {
  const pipelineProps = actionProps as PipelineProps
  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      onClose={pipelineProps.onCloseModal}
      className={cx(css.dialog, Classes.DIALOG, css.cdTrial)}
    >
      <FFTrial trialType={trialType} actionProps={actionProps} />
      <Button
        aria-label="close modal"
        minimal
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={pipelineProps.onCloseModal}
        className={css.crossIcon}
      />
    </Dialog>
  )
}

export const useFFTrialModal = ({ actionProps, trialType }: UseTrialModalProps): UseTrialModalReturns => {
  const pipelineProps = actionProps as PipelineProps
  const [showModal, hideModal] = useModalHook(() => {
    const onCloseModal = (): void => {
      hideModal()
      pipelineProps.onCloseModal?.()
    }
    const newActionProps = { ...actionProps, onCloseModal }
    return <FFTrialDialog actionProps={newActionProps} trialType={trialType} />
  }, [])

  return {
    openTrialModal: showModal,
    closeTrialModal: hideModal
  }
}
