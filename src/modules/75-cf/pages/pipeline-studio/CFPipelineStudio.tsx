import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import type { UseStringsReturn } from 'framework/strings'
import { PipelineStages, PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import routes from '@common/RouteDefinitions'
import { StageType } from '@pipeline/utils/stageHelpers'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { PipelineProvider } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStudio } from '@pipeline/components/PipelineStudio/PipelineStudio'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { LICENSE_STATE_VALUES, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { FeatureFlag } from '@common/featureFlags'
import css from './CFPipelineStudio.module.scss'

const CIPipelineStudio: React.FC = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const history = useHistory()
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
  const isCDEnabled = useFeatureFlag(FeatureFlag.CDNG_ENABLED)
  const isCFEnabled = useFeatureFlag(FeatureFlag.CFNG_ENABLED)
  const isCIEnabled = useFeatureFlag(FeatureFlag.CING_ENABLED)
  const { CI_LICENSE_STATE, FF_LICENSE_STATE, CD_LICENSE_STATE } = useLicenseStore()
  return (
    <PipelineProvider
      stagesMap={stagesCollection.getAllStagesAttributes(getString)}
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      pipelineIdentifier={pipelineIdentifier}
      renderPipelineStage={args =>
        getCFPipelineStages(
          args,
          getString,
          CI_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE && isCIEnabled,
          CD_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE && isCDEnabled,
          FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE && isCFEnabled,
          true
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
      />
    </PipelineProvider>
  )
}

export const getCFPipelineStages: (
  args: Omit<PipelineStagesProps, 'children'>,
  getString: UseStringsReturn['getString'],
  isCIEnabled?: boolean,
  isCDEnabled?: boolean,
  isCFEnabled?: boolean,
  isApprovalStageEnabled?: boolean
) => React.ReactElement<PipelineStagesProps> = (
  args,
  getString,
  _isCIEnabled = false,
  _isCDEnabled = false,
  isCFEnabled = false,
  isApprovalStageEnabled = true
) => {
  return (
    <PipelineStages {...args}>
      {stagesCollection.getStage(StageType.FEATURE, isCFEnabled, getString)}
      {/* {stagesCollection.getStage(StageType.DEPLOY, isCDEnabled, getString)}
      {stagesCollection.getStage(StageType.BUILD, isCIEnabled, getString)}
      {stagesCollection.getStage(StageType.PIPELINE, false, getString)} */}
      {stagesCollection.getStage(StageType.APPROVAL, isApprovalStageEnabled, getString)}
      {/* {stagesCollection.getStage(StageType.CUSTOM, false, getString)} */}
    </PipelineStages>
  )
}

export default CIPipelineStudio
