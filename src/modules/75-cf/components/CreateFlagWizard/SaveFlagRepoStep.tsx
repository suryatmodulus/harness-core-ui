import { Button, Layout, StepProps } from '@wings-software/uicore'
import React, { ReactElement } from 'react'
import { useStrings } from 'framework/strings'
import SaveFlagToGitForm from '../SaveFlagToGitForm/SaveFlagToGitForm'
import type { FlagWizardFormValues } from './FlagWizard'

export interface SaveFlagRepoStepProps extends StepProps<Partial<FlagWizardFormValues>> {
  isLoadingCreateFeatureFlag: boolean
}

const SaveFlagRepoStep = ({
  nextStep,
  previousStep,
  prevStepData,
  isLoadingCreateFeatureFlag
}: SaveFlagRepoStepProps): ReactElement => {
  const { getString } = useStrings()

  const FormButtons = (): ReactElement => (
    <Layout.Horizontal spacing="small" margin={{ top: 'large' }}>
      <Button
        text={getString('back')}
        onClick={event => {
          event.preventDefault()
          previousStep?.(prevStepData)
        }}
      />
      <Button
        type="submit"
        intent="primary"
        text={getString('cf.creationModal.saveAndClose')}
        disabled={isLoadingCreateFeatureFlag}
        loading={isLoadingCreateFeatureFlag}
      />
    </Layout.Horizontal>
  )

  return (
    <SaveFlagToGitForm
      onSubmit={formValues => nextStep?.({ ...prevStepData, ...formValues })}
      flagName={prevStepData?.name || ''}
      flagIdentifier={prevStepData?.identifier || ''}
      title={getString('cf.selectFlagRepo.dialogTitle')}
      formButtons={<FormButtons />}
    />
  )
}

export default SaveFlagRepoStep
