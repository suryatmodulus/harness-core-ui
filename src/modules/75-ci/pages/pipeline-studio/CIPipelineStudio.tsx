import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { getCIPipelineStages } from '@ci/components/PipelineStudio/CIPipelineStagesUtils'
import { getCITrialModal } from '@ci/modals/CITrial/useCITrialModal'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import routes from '@common/RouteDefinitions'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PipelineProvider } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStudio } from '@pipeline/components/PipelineStudio/PipelineStudio'

import type { NgPipeline } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import css from './CIPipelineStudio.module.scss'

const CIPipelineStudio: React.FC = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<PipelinePathProps & AccountPathProps>
  >()
  const { getString } = useStrings()
  const { selectedProject } = useAppStore()
  const history = useHistory()

  const getTrialPipelineCreateForm = (
    onSubmit: (values: NgPipeline) => void,
    onClose: () => void
  ): React.ReactElement => {
    return getCITrialModal(onSubmit, onClose, false)
  }

  const { modal } = useQueryParams<{ modal?: string }>()

  const getOtherModal = modal === 'trial' ? getTrialPipelineCreateForm : undefined

  const handleRunPipeline = (): void => {
    history.push(
      routes.toRunPipeline({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module
      })
    )
  }
  const isApprovalStageEnabled = useFeatureFlag('NG_HARNESS_APPROVAL')
  return (
    <PipelineProvider
      stagesMap={stagesCollection.getAllStagesAttributes(getString)}
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier }}
      pipelineIdentifier={pipelineIdentifier}
      renderPipelineStage={args =>
        getCIPipelineStages(
          args,
          getString,
          true,
          selectedProject?.modules && selectedProject.modules.indexOf?.('CD') > -1,
          selectedProject?.modules && selectedProject.modules.indexOf?.('CF') > -1,
          isApprovalStageEnabled
        )
      }
      stepsFactory={factory}
      runPipeline={handleRunPipeline}
    >
      <PipelineStudio
        className={css.container}
        routePipelineStudio={routes.toPipelineStudio}
        routePipelineDetail={routes.toPipelineDetail}
        routePipelineProject={routes.toDeployments}
        routePipelineList={routes.toPipelines}
        getOtherModal={getOtherModal}
      />
    </PipelineProvider>
  )
}

export default CIPipelineStudio
