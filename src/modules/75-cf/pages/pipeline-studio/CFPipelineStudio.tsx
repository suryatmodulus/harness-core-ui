import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import routes from '@common/RouteDefinitions'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { PipelineProvider } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStudio } from '@pipeline/components/PipelineStudio/PipelineStudio'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { useQueryParams } from '@common/hooks'
import { LICENSE_STATE_VALUES, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { FeatureFlag } from '@common/featureFlags'
import { getCFPipelineStages } from '../../components/PipelineStudio/CFPipelineStagesUtils'
import css from './CFPipelineStudio.module.scss'

const CIPipelineStudio: React.FC = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const history = useHistory()
  const handleRunPipeline = (): void => {
    history.push(
      routes.toRunPipeline({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module,
        branch,
        repoIdentifier
      })
    )
  }
  const isApprovalStageEnabled = useFeatureFlag(FeatureFlag.NG_HARNESS_APPROVAL)
  const isCDEnabled = useFeatureFlag(FeatureFlag.CDNG_ENABLED)
  const isCFEnabled = useFeatureFlag(FeatureFlag.CFNG_ENABLED)
  const isCIEnabled = useFeatureFlag(FeatureFlag.CING_ENABLED)
  const { CI_LICENSE_STATE, FF_LICENSE_STATE } = useLicenseStore()
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
          isCDEnabled,
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
        routePipelineDetail={routes.toPipelineDetail}
        routePipelineProject={routes.toDeployments}
        routePipelineList={routes.toPipelines}
      />
    </PipelineProvider>
  )
}

export default CIPipelineStudio
