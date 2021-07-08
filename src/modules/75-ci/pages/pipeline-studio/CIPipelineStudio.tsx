import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { getCIPipelineStages } from '@ci/components/PipelineStudio/CIPipelineStagesUtils'
import { getCITrialDialog } from '@ci/modals/CITrial/useCITrialModal'
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
import { useStrings } from 'framework/strings'
import { PipelineProvider } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStudio } from '@pipeline/components/PipelineStudio/PipelineStudio'

import type { NgPipeline } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import { LICENSE_STATE_VALUES, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { FeatureFlag } from '@common/featureFlags'
import css from './CIPipelineStudio.module.scss'

const CIPipelineStudio: React.FC = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { getString } = useStrings()
  const history = useHistory()

  const getTrialPipelineCreateForm = (
    onSubmit: (values: NgPipeline) => void,
    onClose: () => void
  ): React.ReactElement => getCITrialDialog({ onSubmit, onClose, isSelect: false })

  const { modal, branch, repoIdentifier } = useQueryParams<{ modal?: string } & GitQueryParams>()

  const getOtherModal = modal === 'trial' ? getTrialPipelineCreateForm : undefined

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
        getCIPipelineStages(
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
        getOtherModal={getOtherModal}
      />
    </PipelineProvider>
  )
}

export default CIPipelineStudio
