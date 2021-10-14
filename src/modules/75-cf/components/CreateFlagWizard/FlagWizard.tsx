import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { StepWizard, SelectOption, ModalErrorHandlerBinding } from '@wings-software/uicore'
import {
  useCreateFeatureFlag,
  FeatureFlagRequestRequestBody,
  CreateFeatureFlagQueryParams,
  useGetGitRepo
} from 'services/cf'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import { getErrorMessage, showToaster, FeatureFlagMutivariateKind } from '@cf/utils/CFUtils'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { useFeatureFlagTelemetry } from '@cf/hooks/useFeatureFlagTelemetry'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { PageSpinner } from '@common/components'
import FlagElemAbout from './FlagElemAbout'
import FlagElemBoolean from './FlagElemBoolean'
import FlagElemMultivariate from './FlagElemMultivariate'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import SaveFlagRepoStep from './SaveFlagRepoStep'
import css from './FlagWizard.module.scss'

interface FlagWizardProps {
  flagTypeView: string
  environmentIdentifier: string
  toggleFlagType: (newFlag: string) => void
  hideModal: () => void
  goBackToTypeSelections: () => void
}

export interface FlagWizardFormValues extends FeatureFlagRequestRequestBody {
  autoCommit: boolean
}

const FlagWizard: React.FC<FlagWizardProps> = props => {
  const { getString } = useStrings()
  const { currentUserInfo } = useAppStore()
  const flagTypeOptions: SelectOption[] = [
    { label: getString('cf.boolean'), value: FlagTypeVariations.booleanFlag },
    { label: getString('cf.multivariate'), value: FeatureFlagMutivariateKind.string }
  ]
  const { flagTypeView, environmentIdentifier, toggleFlagType, hideModal, goBackToTypeSelections } = props
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const history = useHistory()
  const { activeEnvironment, withActiveEnvironment } = useActiveEnvironment()

  const FF_GITSYNC = useFeatureFlag(FeatureFlag.FF_GITSYNC)

  const gitRepo = useGetGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      org: orgIdentifier
    }
  })

  const { mutate: createFeatureFlag, loading: isLoadingCreateFeatureFlag } = useCreateFeatureFlag({
    queryParams: {
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      environment: activeEnvironment
    } as CreateFeatureFlagQueryParams
  })

  const events = useFeatureFlagTelemetry()

  const onWizardSubmit = (formData: FeatureFlagRequestRequestBody | undefined): void => {
    modalErrorHandler?.hide()

    if (formData) {
      const valTags: any = formData?.tags?.map(elem => {
        return { name: elem, value: elem }
      })
      formData.tags = valTags
      // Note: Currently there's no official way to get current user. Rely on old token from
      // current gen login
      formData.owner = currentUserInfo.email || 'unknown'
      formData.project = projectIdentifier
    }

    if (formData) {
      createFeatureFlag(formData)
        .then(() => {
          events.createFeatureFlagCompleted()
          hideModal()
          history.push(
            withActiveEnvironment(
              routes.toCFFeatureFlagsDetail({
                orgIdentifier: orgIdentifier as string,
                projectIdentifier: projectIdentifier as string,
                featureFlagIdentifier: formData.identifier,
                accountId
              }),
              environmentIdentifier
            )
          )
          showToaster(getString('cf.messages.flagCreated'))
        })
        .catch(error => {
          showError(getErrorMessage(error), 0, 'cf.savegw.error')
        })
    } else {
      hideModal()
    }
  }

  return (
    <StepWizard className={css.flagWizardContainer} onCompleteWizard={onWizardSubmit}>
      {gitRepo?.loading ? <PageSpinner /> : null}

      <FlagElemAbout
        name={getString('cf.creationModal.aboutFlag.aboutFlagHeading')}
        goBackToTypeSelections={goBackToTypeSelections}
      />
      {flagTypeView === FlagTypeVariations.booleanFlag ? (
        <FlagElemBoolean
          name={getString('cf.creationModal.variationSettingsHeading')}
          toggleFlagType={toggleFlagType}
          flagTypeOptions={flagTypeOptions}
          setModalErrorHandler={setModalErrorHandler}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      ) : (
        <FlagElemMultivariate
          name={getString('cf.creationModal.variationSettingsHeading')}
          toggleFlagType={toggleFlagType}
          flagTypeOptions={flagTypeOptions}
          setModalErrorHandler={setModalErrorHandler}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      )}

      {FF_GITSYNC && gitRepo?.data?.repoSet ? (
        <SaveFlagRepoStep
          name={getString('common.gitSync.gitRepositoryDetails')}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      ) : null}
    </StepWizard>
  )
}

export default FlagWizard
