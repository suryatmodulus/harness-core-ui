import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'

import { CreateOrSelectAProjectTemplate } from '@projects-orgs/components/CreateOrSelectAProjectTemplate/CreateOrSelectAProjectTemplate'
import { CreatePipelineForm } from '@pipeline/components/CreatePipelineForm/CreatePipelineForm'
import { SelectOrCreatePipelineForm } from '@pipeline/components/SelectOrCreatePipelineForm/SelectOrCreatePipelineForm'
import { TrialModalTemplate } from '@common/components/TrialModalTemplate/TrialModalTemplate'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { PipelineInfoConfig } from 'services/cd-ng'
import cdImage from '../images/illustration.png'
import css from './useCDTrialModal.module.scss'

type CreateOrSelectProjectProps = {
  onCreateProject: () => void
}
type onCreatePipeline = (values: PipelineInfoConfig) => void
type onSelectPipeline = (value: string) => void
type PipelineProps = {
  onSuccess: onCreatePipeline | onSelectPipeline
  onCloseModal?: () => void
}
export interface UseCDTrialModalProps {
  actionProps: PipelineProps | CreateOrSelectProjectProps
  trialType: TrialType
}

export interface UseCDTrialModalReturn {
  openCDTrialModal: () => void
  closeCDTrialModal: () => void
}

export enum TrialType {
  CREATE_OR_SELECT_PIPELINE,
  CREATE_OR_SELECT_PROJECT,
  SET_UP_PIPELINE
}

interface CDTrialTemplateData {
  description: string
  children: React.ReactElement
  rightWidth?: string
}

const CDTrialTemplate: React.FC<CDTrialTemplateData> = ({ description, children, rightWidth }) => {
  const { getString } = useStrings()

  return (
    <TrialModalTemplate
      iconName="cd-main"
      title={getString('cd.continuous')}
      description={description}
      imgSrc={cdImage}
      rightWidth={rightWidth}
    >
      {children}
    </TrialModalTemplate>
  )
}

interface CDTrialProps {
  trialType: TrialType
  actionProps: PipelineProps | CreateOrSelectProjectProps
}

const CDTrial: React.FC<CDTrialProps> = ({ trialType, actionProps }) => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()
  const { selectedProject } = useAppStore()

  let child = <></>
  let description = ''
  let rightWidth = '30%'

  switch (trialType) {
    case TrialType.SET_UP_PIPELINE: {
      child = (
        <CreatePipelineForm
          handleSubmit={(actionProps as PipelineProps).onSuccess as onCreatePipeline}
          closeModal={(actionProps as PipelineProps).onCloseModal}
        />
      )
      description = getString('cd.cdTrialHomePage.startTrial.description')
      break
    }
    case TrialType.CREATE_OR_SELECT_PIPELINE: {
      child = (
        <SelectOrCreatePipelineForm
          handleSubmit={(actionProps as PipelineProps).onSuccess as onSelectPipeline}
          openCreatPipeLineModal={() => {
            history.push(
              routes.toPipelineStudio({
                orgIdentifier: selectedProject?.orgIdentifier || '',
                projectIdentifier: selectedProject?.identifier || '',
                pipelineIdentifier: '-1',
                accountId,
                module: 'cd'
              })
            )
          }}
          closeModal={(actionProps as PipelineProps).onCloseModal}
        />
      )
      description = getString('pipeline.selectOrCreateForm.description')
      break
    }
    case TrialType.CREATE_OR_SELECT_PROJECT: {
      child = (
        <CreateOrSelectAProjectTemplate
          onCreateProject={() => {
            ;(actionProps as PipelineProps).onCloseModal?.(),
              (actionProps as CreateOrSelectProjectProps).onCreateProject()
          }}
          closeModal={(actionProps as PipelineProps).onCloseModal}
          moduleDescription={getString('cd.continuous')}
        />
      )
      rightWidth = '40%'
    }
  }

  return (
    <CDTrialTemplate description={description} rightWidth={rightWidth}>
      {child}
    </CDTrialTemplate>
  )
}

const CDTrialDialog = ({ actionProps, trialType }: CDTrialProps): React.ReactElement => (
  <Dialog
    isOpen={true}
    enforceFocus={false}
    onClose={(actionProps as PipelineProps).onCloseModal}
    className={cx(css.dialog, Classes.DIALOG, css.cdTrial)}
  >
    <CDTrial trialType={trialType} actionProps={actionProps} />
    <Button
      aria-label="close modal"
      minimal
      icon="cross"
      iconProps={{ size: 18 }}
      onClick={(actionProps as PipelineProps).onCloseModal}
      className={css.crossIcon}
    />
  </Dialog>
)

export const getCDTrialDialog = ({ actionProps, trialType }: CDTrialProps): React.ReactElement => (
  <CDTrialDialog actionProps={actionProps} trialType={trialType} />
)

export const useCDTrialModal = ({ actionProps, trialType }: UseCDTrialModalProps): UseCDTrialModalReturn => {
  const [showModal, hideModal] = useModalHook(() => {
    const onCloseModal = (): void => {
      hideModal(), (actionProps as PipelineProps).onCloseModal?.()
    }
    const newActionProps = { ...actionProps, onCloseModal }
    return <CDTrialDialog actionProps={newActionProps} trialType={trialType} />
  }, [])

  return {
    openCDTrialModal: showModal,
    closeCDTrialModal: hideModal
  }
}
