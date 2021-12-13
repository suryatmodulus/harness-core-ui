import React from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, TrialActions, PageNames } from '@common/constants/TrackingConstants'

import { TrialModalTemplate } from '@templates-library/components/TrialModalTemplate/TrialModalTemplate'
import type {
  UseTrialModalProps,
  PipelineProps,
  UseTrialModalReturns
} from '@templates-library/components/TrialModalTemplate/trialModalUtils'
import { useGetFormPropsByTrialType } from '@templates-library/components/TrialModalTemplate/trialModalUtils'
import ciImage from '../images/illustration.png'

import css from './useCITrialModal.module.scss'

const CITrial: React.FC<UseTrialModalProps> = ({ trialType, actionProps }) => {
  const { getString } = useStrings()

  const { child, description, rightWidth } = useGetFormPropsByTrialType({ trialType, actionProps, module: 'ci' })

  return (
    <TrialModalTemplate
      iconName="ci-main"
      title={getString('ci.continuous')}
      description={description}
      imgSrc={ciImage}
      rightWidth={rightWidth}
    >
      {child}
    </TrialModalTemplate>
  )
}

const CITrialDialog = ({ actionProps, trialType }: UseTrialModalProps): React.ReactElement => {
  const { trackEvent } = useTelemetry()
  const handleClose = (): void => {
    const pipelineProps = actionProps as PipelineProps
    pipelineProps.onCloseModal?.()
    trackEvent(TrialActions.TrialModalPipelineSetupCancel, { category: Category.SIGNUP, module: 'ci' })
  }

  useTelemetry({
    pageName: PageNames.TrialSetupPipelineModal,
    category: Category.SIGNUP,
    properties: { module: 'ci' }
  })

  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      onClose={handleClose}
      className={cx(css.dialog, Classes.DIALOG, css.ciTrial)}
    >
      <CITrial trialType={trialType} actionProps={actionProps} />
      <Button
        aria-label="close modal"
        minimal
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={handleClose}
        className={css.crossIcon}
      />
    </Dialog>
  )
}

export const getCITrialDialog = ({ actionProps, trialType }: UseTrialModalProps): React.ReactElement => (
  <CITrialDialog actionProps={actionProps} trialType={trialType} />
)

export const useCITrialModal = ({ actionProps, trialType }: UseTrialModalProps): UseTrialModalReturns => {
  const [showModal, hideModal] = useModalHook(() => {
    const onCloseModal = (): void => {
      const pipelineProps = actionProps as PipelineProps
      hideModal()
      pipelineProps.onCloseModal?.()
    }
    const newActionProps = { ...actionProps, onCloseModal }
    return <CITrialDialog actionProps={newActionProps} trialType={trialType} />
  })

  return {
    openTrialModal: showModal,
    closeTrialModal: hideModal
  }
}
