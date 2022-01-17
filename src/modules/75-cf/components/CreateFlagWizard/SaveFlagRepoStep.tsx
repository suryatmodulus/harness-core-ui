/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { FormikForm, Formik, Layout, Button } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import type { StepProps } from '@common/components/WizardWithProgress/WizardWithProgress'

import { useGitSync } from '@cf/hooks/useGitSync'
import type { FlagWizardFormValues } from './FlagWizard'
import SaveFlagToGitSubForm from '../SaveFlagToGitSubForm/SaveFlagToGitSubForm'

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

  const { getGitSyncFormMeta, gitSyncLoading } = useGitSync()

  const { gitSyncValidationSchema, gitSyncInitialValues } = getGitSyncFormMeta()

  if (gitSyncLoading) {
    return <PageSpinner />
  }

  const initialFormData = {
    flagName: prevStepData?.name || '',
    flagIdentifier: prevStepData?.identifier || '',
    gitDetails: gitSyncInitialValues.gitDetails,
    autoCommit: false
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialFormData}
      formName="saveFlagRepoStep"
      validationSchema={Yup.object().shape({
        gitDetails: gitSyncValidationSchema
      })}
      onSubmit={formValues => nextStep?.({ ...prevStepData, ...formValues })}
    >
      <FormikForm data-testid="save-flag-to-git-form">
        <SaveFlagToGitSubForm title={getString('cf.selectFlagRepo.dialogTitle')} />

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
      </FormikForm>
    </Formik>
  )
}

export default SaveFlagRepoStep
