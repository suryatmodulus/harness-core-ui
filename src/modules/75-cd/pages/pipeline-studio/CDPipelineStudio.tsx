import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import routes from '@common/RouteDefinitions'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { getCDPipelineStages } from '@cd/components/PipelineStudio/CDPipelineStagesUtils'
import { useStrings } from 'framework/strings'
import { PipelineProvider } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStudio } from '@pipeline/components/PipelineStudio/PipelineStudio'
import { getCDTrialDialog, TrialType } from '@cd/modals/CDTrial/useCDTrialModal'
import type { NgPipeline } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import { LICENSE_STATE_VALUES, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { FeatureFlag } from '@common/featureFlags'
import css from './CDPipelineStudio.module.scss'

const CDPipelineStudio: React.FC = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()

  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()

  const history = useHistory()

  const getTrialPipelineCreateForm = (
    onSubmit: (values: NgPipeline) => void,
    onClose: () => void
  ): React.ReactElement => {
    return getCDTrialDialog({
      actionProps: { onSuccess: onSubmit, onCloseModal: onClose },
      trialType: TrialType.SET_UP_PIPELINE
    })
  }

  const { modal } = useQueryParams<{ modal?: string }>()

  const getOtherModal = modal === 'trial' ? getTrialPipelineCreateForm : undefined
  const handleRunPipeline = (): void => {
    history.push(
      routes.toPipelineStudio({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module,
        branch,
        repoIdentifier,
        runPipeline: true
      })
    )
  }
  const { CI_LICENSE_STATE, FF_LICENSE_STATE } = useLicenseStore()
  const isCFEnabled = useFeatureFlag(FeatureFlag.CFNG_ENABLED)
  const isCIEnabled = useFeatureFlag(FeatureFlag.CING_ENABLED)
  const { getString } = useStrings()
  const isApprovalStageEnabled = useFeatureFlag(FeatureFlag.NG_HARNESS_APPROVAL)
  return (
    <PipelineProvider
      stagesMap={stagesCollection.getAllStagesAttributes(getString)}
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      pipelineIdentifier={pipelineIdentifier}
      renderPipelineStage={args =>
        getCDPipelineStages(
          args,
          getString,
          CI_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE && isCIEnabled,
          true,
          FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE && isCFEnabled,
          isApprovalStageEnabled
        )
      }
      stepsFactory={factory}
      runPipeline={handleRunPipeline}
    >
      <PipelineStudio
        className={css.container}
        routePipelineStudio={routes.toPipelineStudio}
        routePipelineProject={routes.toDeployments}
        routePipelineDetail={routes.toPipelineDetail}
        routePipelineList={routes.toPipelines}
        getOtherModal={getOtherModal}
      />
    </PipelineProvider>
  )
}

export default CDPipelineStudio
