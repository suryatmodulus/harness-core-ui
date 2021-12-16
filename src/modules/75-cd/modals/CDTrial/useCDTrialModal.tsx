import React from 'react'
import { useModalHook, Dialog } from '@wings-software/uicore'
import cx from 'classnames'

import { TrialModalTemplate } from '@pipeline/components/TrialModalTemplate/TrialModalTemplate'
import { isCDCommunity, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { UseTrialModalProps, UseTrialModalReturns } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import { useGetFormPropsByTrialType } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import cdImage from '../images/cd.png'
import css from './useCDTrialModal.module.scss'

interface CDTrialTemplateData {
  children: React.ReactElement
}

const CDTrialTemplate: React.FC<CDTrialTemplateData> = ({ children }) => {
  const { licenseInformation } = useLicenseStore()
  return (
    <TrialModalTemplate imgSrc={cdImage} hideTrialBadge={isCDCommunity(licenseInformation)}>
      {children}
    </TrialModalTemplate>
  )
}

const CDTrial: React.FC<UseTrialModalProps> = ({ trialType, actionProps, onCloseModal }) => {
  const { child } = useGetFormPropsByTrialType({
    trialType,
    actionProps,
    module: 'ci',
    onCloseModal
  })

  return <CDTrialTemplate>{child}</CDTrialTemplate>
}

const CDTrialDialog = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): React.ReactElement => {
  return (
    <Dialog isOpen={true} enforceFocus={false} onClose={onCloseModal} className={cx(css.dialog, css.cdTrial)}>
      <CDTrial trialType={trialType} actionProps={actionProps} onCloseModal={onCloseModal} />
    </Dialog>
  )
}

export const getCDTrialDialog = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): React.ReactElement => (
  <CDTrialDialog actionProps={actionProps} trialType={trialType} onCloseModal={onCloseModal} />
)

export const useCDTrialModal = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): UseTrialModalReturns => {
  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      onCloseModal?.()
      hideModal()
    }
    return <CDTrialDialog actionProps={actionProps} trialType={trialType} onCloseModal={onClose} />
  }, [])

  return {
    openTrialModal: showModal,
    closeTrialModal: hideModal
  }
}
