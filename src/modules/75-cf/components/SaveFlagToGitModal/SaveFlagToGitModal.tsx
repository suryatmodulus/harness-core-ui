import React, { ReactElement } from 'react'
import * as yup from 'yup'
import { Formik, FormikForm } from '@wings-software/uicore'
import { GitSyncFormValues, useGitSync } from '@cf/hooks/useGitSync'
import { useStrings } from 'framework/strings'
import SaveFlagToGitSubFormModal from '../SaveFlagToGitSubFormModal/SaveFlagToGitSubFormModal'

export interface SaveFlagToGitModalProps {
  flagName: string
  flagIdentifier: string
  onSubmit: (formValues: GitSyncFormValues) => void
  onClose: () => void
}

const SaveFlagToGitModal = ({ flagName, flagIdentifier, onSubmit, onClose }: SaveFlagToGitModalProps): ReactElement => {
  const { getGitSyncFormMeta } = useGitSync()
  const { getString } = useStrings()

  const { gitSyncInitialValues, gitSyncValidationSchema } = getGitSyncFormMeta()

  return (
    <Formik
      formName="saveFlagToGitForm"
      initialValues={{
        flagName,
        flagIdentifier,
        gitDetails: gitSyncInitialValues.gitDetails,
        autoCommit: gitSyncInitialValues.autoCommit
      }}
      enableReinitialize={true}
      validationSchema={yup.object().shape({
        gitDetails: gitSyncValidationSchema
      })}
      validateOnChange
      validateOnBlur
      onSubmit={formValues => onSubmit(formValues)}
    >
      {formikProps => {
        return (
          <FormikForm data-testid="save-flag-to-git-modal">
            <SaveFlagToGitSubFormModal
              onSubmit={() => formikProps.submitForm()}
              onClose={onClose}
              title={getString('cf.gitSync.saveFlagToGit', {
                flagName: flagName
              })}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export default SaveFlagToGitModal
