import React from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import { TrialModalTemplate } from '@templates-library/components/TrialModalTemplate/TrialModalTemplate'
import { isCDCommunity, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type {
  UseTrialModalProps,
  PipelineProps
} from '@templates-library/components/TrialModalTemplate/trialModalUtils'
import { useGetFormPropsByTrialType } from '@templates-library/components/TrialModalTemplate/trialModalUtils'
import cdImage from '../images/illustration.png'
import css from './useCDTrialModal.module.scss'

export interface UseCDTrialModalReturn {
  openCDTrialModal: () => void
  closeCDTrialModal: () => void
}

interface CDTrialTemplateData {
  description: string
  children: React.ReactElement
  rightWidth?: string
}

const CDTrialTemplate: React.FC<CDTrialTemplateData> = ({ description, children, rightWidth }) => {
  const { getString } = useStrings()
  const { licenseInformation } = useLicenseStore()
  return (
    <TrialModalTemplate
      iconName="cd-main"
      title={getString('cd.continuous')}
      description={description}
      imgSrc={cdImage}
      rightWidth={rightWidth}
      hideTrialBadge={isCDCommunity(licenseInformation)}
    >
      {children}
    </TrialModalTemplate>
  )
}

const CDTrial: React.FC<UseTrialModalProps> = ({ trialType, actionProps }) => {
  const { child, description, rightWidth } = useGetFormPropsByTrialType({ trialType, actionProps, module: 'ci' })

  return (
    <CDTrialTemplate description={description} rightWidth={rightWidth}>
      {child}
    </CDTrialTemplate>
  )
}

const CDTrialDialog = ({ actionProps, trialType }: UseTrialModalProps): React.ReactElement => {
  const pipelineProps = actionProps as PipelineProps
  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      onClose={pipelineProps.onCloseModal}
      className={cx(css.dialog, Classes.DIALOG, css.cdTrial)}
    >
      <CDTrial trialType={trialType} actionProps={actionProps} />
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

export const getCDTrialDialog = ({ actionProps, trialType }: UseTrialModalProps): React.ReactElement => (
  <CDTrialDialog actionProps={actionProps} trialType={trialType} />
)

export const useCDTrialModal = ({ actionProps, trialType }: UseTrialModalProps): UseCDTrialModalReturn => {
  const pipelineProps = actionProps as PipelineProps
  const [showModal, hideModal] = useModalHook(() => {
    const onCloseModal = (): void => {
      hideModal()
      pipelineProps.onCloseModal?.()
    }
    const newActionProps = { ...actionProps, onCloseModal }
    return <CDTrialDialog actionProps={newActionProps} trialType={trialType} />
  }, [])

  return {
    openCDTrialModal: showModal,
    closeCDTrialModal: hideModal
  }
}
