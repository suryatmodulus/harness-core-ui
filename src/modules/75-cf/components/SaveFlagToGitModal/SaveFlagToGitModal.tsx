import React, { ReactElement } from 'react'
import * as yup from 'yup'
import { Formik, FormikForm } from '@wings-software/uicore'
import { useGitSync } from '@cf/hooks/useGitSync'
import SaveFlagToGitSubFormModal from '../SaveFlagToGitSubFormModal/SaveFlagToGitSubFormModal'

interface SaveFlagToGitModalProps {
  flagName: string
  flagIdentifier: string
  onSubmit: () => void
  onClose: () => void
}

const SaveFlagToGitModal = ({ flagName, flagIdentifier, onSubmit, onClose }: SaveFlagToGitModalProps): ReactElement => {
  const { getGitSyncFormMeta } = useGitSync()

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
      onSubmit={onSubmit}
    >
      {formikProps => {
        return (
          <FormikForm {...formikProps}>
            <SaveFlagToGitSubFormModal
              onSubmit={() => formikProps.submitForm()} //todo needed?
              onClose={onClose}
              title="Save Flag to Git"
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export default SaveFlagToGitModal
