import React, { useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { NgPipeline } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, TrialActions, PageNames } from '@common/constants/TrackingConstants'

import { SelectOrCreatePipelineForm } from '@pipeline/components/SelectOrCreatePipelineForm/SelectOrCreatePipelineForm'
import { CreatePipelineForm } from '@pipeline/components/CreatePipelineForm/CreatePipelineForm'
import { TrialModalTemplate } from '@common/components/TrialModalTemplate/TrialModalTemplate'
import ciImage from '../images/illustration.png'

import css from './useCITrialModal.module.scss'

type onCreateSuccess = (data: NgPipeline) => void
type onSelectSuccess = () => void

interface DialogProps {
  onClose: () => void
  onSubmit: (values: NgPipeline) => void
  isSelect: boolean
}
export interface UseCITrialModalProps {
  onSubmit: onCreateSuccess | onSelectSuccess
  onCloseModal?: () => void
  isSelect?: boolean
}

export interface UseCITrialModalReturn {
  openCITrialModal: () => void
  closeCITrialModal: () => void
}

type handleSelectSubmit = (value: string) => void
type handleCreateSubmit = (value: NgPipeline) => void
interface CITrialModalData {
  onSubmit: handleSelectSubmit | handleCreateSubmit
  closeModal?: () => void
  isSelect: boolean
}

const CITrial: React.FC<CITrialModalData> = ({ isSelect, onSubmit, closeModal }) => {
  const { getString } = useStrings()

  const [select, setSelect] = useState(isSelect)

  const description = select
    ? getString('pipeline.selectOrCreateForm.description')
    : getString('ci.ciTrialHomePage.startTrial.description')
  const children = select ? (
    <SelectOrCreatePipelineForm
      handleSubmit={onSubmit as handleSelectSubmit}
      openCreatPipeLineModal={() => {
        setSelect(false)
      }}
      closeModal={closeModal}
    />
  ) : (
    <CreatePipelineForm handleSubmit={onSubmit as handleCreateSubmit} closeModal={closeModal} />
  )

  return (
    <TrialModalTemplate
      iconName="ci-main"
      title={getString('ci.continuous')}
      description={description}
      imgSrc={ciImage}
    >
      {children}
    </TrialModalTemplate>
  )
}

const CITrialDialog = ({ onClose, onSubmit, isSelect }: DialogProps): React.ReactElement => {
  const { trackEvent } = useTelemetry()
  const handleClose = (): void => {
    trackEvent(TrialActions.TrialModalPipelineSetupCancel, { category: Category.SIGNUP, module: 'ci' })
    onClose()
  }
  const handleSubmit = (values: NgPipeline): void => {
    trackEvent(TrialActions.TrialModalPipelineSetupSubmit, { category: Category.SIGNUP, module: 'ci' })
    onSubmit(values)
  }
  useTelemetry({
    pageName: PageNames.TrialSetupPipelineModal,
    category: Category.SIGNUP,
    properties: { module: 'ci' }
  })

  return (
    <Dialog isOpen={true} onClose={handleClose} className={cx(css.dialog, Classes.DIALOG, css.ciTrial)}>
      <CITrial isSelect={isSelect} onSubmit={handleSubmit} closeModal={handleClose} />
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

export const getCITrialDialog = ({ onClose, onSubmit, isSelect }: DialogProps): React.ReactElement => (
  <CITrialDialog onSubmit={onSubmit} onClose={onClose} isSelect={isSelect} />
)

export const useCITrialModal = ({
  onSubmit,
  onCloseModal,
  isSelect = false
}: UseCITrialModalProps): UseCITrialModalReturn => {
  const [showModal, hideModal] = useModalHook(() => (
    <CITrialDialog
      onClose={() => {
        hideModal(), onCloseModal?.()
      }}
      onSubmit={onSubmit}
      isSelect={isSelect}
    />
  ))

  return {
    openCITrialModal: showModal,
    closeCITrialModal: hideModal
  }
}
