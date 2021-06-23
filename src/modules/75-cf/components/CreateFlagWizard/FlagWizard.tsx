import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { StepWizard, SelectOption, ModalErrorHandlerBinding } from '@wings-software/uicore'
import { useCreateFeatureFlag, FeatureFlagRequestRequestBody, CreateFeatureFlagQueryParams } from 'services/cf'
import AppStorage from 'framework/utils/AppStorage'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import { getErrorMessage, showToaster, FeatureFlagMutivariateKind } from '@cf/utils/CFUtils'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import FlagElemAbout from './FlagElemAbout'
import FlagElemBoolean from './FlagElemBoolean'
import FlagElemMultivariate from './FlagElemMultivariate'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import css from './FlagWizard.module.scss'

interface FlagWizardProps {
  flagTypeView: string
  environmentIdentifier: string
  toggleFlagType: (newFlag: string) => void
  hideModal: () => void
  goBackToTypeSelections: () => void
}

const FlagWizard: React.FC<FlagWizardProps> = props => {
  const { getString } = useStrings()
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
  const { mutate: createFeatureFlag, loading: isLoadingCreateFeatureFlag } = useCreateFeatureFlag({
    queryParams: {
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      environment: activeEnvironment
    } as CreateFeatureFlagQueryParams
  })
  const onWizardStepSubmit = (formData: FeatureFlagRequestRequestBody | undefined): void => {
    modalErrorHandler?.hide()

    if (formData) {
      const valTags: any = formData?.tags?.map(elem => {
        return { name: elem, value: elem }
      })
      formData.tags = valTags
      // Note: Currently there's no official way to get current user. Rely on old token from
      // current gen login
      formData.owner = AppStorage.decode64(localStorage.email || 'unknown')
    }

    if (formData) {
      createFeatureFlag(formData)
        .then(() => {
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
    <StepWizard className={css.flagWizardContainer} onCompleteWizard={onWizardStepSubmit}>
      <FlagElemAbout
        name={getString('cf.creationModal.aboutFlag.aboutFlagHeading')}
        goBackToTypeSelections={goBackToTypeSelections}
      />
      {flagTypeView === FlagTypeVariations.booleanFlag ? (
        <FlagElemBoolean
          name={getString('cf.creationModal.variationSettingsHeading')}
          toggleFlagType={toggleFlagType}
          flagTypeOptions={flagTypeOptions}
          onWizardStepSubmit={onWizardStepSubmit}
          projectIdentifier={projectIdentifier}
          setModalErrorHandler={setModalErrorHandler}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      ) : (
        <FlagElemMultivariate
          name={getString('cf.creationModal.variationSettingsHeading')}
          toggleFlagType={toggleFlagType}
          flagTypeOptions={flagTypeOptions}
          onWizardStepSubmit={onWizardStepSubmit}
          projectIdentifier={projectIdentifier}
          setModalErrorHandler={setModalErrorHandler}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      )}
    </StepWizard>
  )
}

export default FlagWizard
