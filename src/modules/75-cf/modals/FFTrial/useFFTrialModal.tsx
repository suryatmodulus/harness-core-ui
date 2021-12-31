import React from 'react'
import { useModalHook, Dialog } from '@wings-software/uicore'
import cx from 'classnames'

import { TrialModalTemplate } from '@pipeline/components/TrialModalTemplate/TrialModalTemplate'
import type { UseTrialModalProps, UseTrialModalReturns } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import { useGetFormPropsByTrialType } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import ffImage from '../images/ff.png'
import css from './useFFTrialModal.module.scss'

interface FFTrialTemplateProps {
  children: React.ReactElement
}

const FFTrialTemplate: React.FC<FFTrialTemplateProps> = ({ children }) => {
  return <TrialModalTemplate imgSrc={ffImage}>{children}</TrialModalTemplate>
}

const FFTrial: React.FC<UseTrialModalProps> = ({ trialType, actionProps, onCloseModal }) => {
  const { child } = useGetFormPropsByTrialType({
    trialType,
    actionProps,
    module: 'cf',
    onCloseModal
  })

  return <FFTrialTemplate>{child}</FFTrialTemplate>
}

const FFTrialDialog = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): React.ReactElement => {
  return (
    <Dialog isOpen={true} enforceFocus={false} className={cx(css.dialog, css.ffTrial)} onClose={onCloseModal}>
      <FFTrial trialType={trialType} actionProps={actionProps} onCloseModal={onCloseModal} />
    </Dialog>
  )
}

export const useFFTrialModal = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): UseTrialModalReturns => {
  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      onCloseModal?.()
      hideModal()
    }
    return <FFTrialDialog actionProps={actionProps} trialType={trialType} onCloseModal={onClose} />
  }, [])

  return {
    openTrialModal: showModal,
    closeTrialModal: hideModal
  }
}
