import React, { ReactElement } from 'react'
import { FormikForm, Formik, Layout, Button } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useGetGitRepo } from 'services/cf'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import type { StepProps } from '@common/components/WizardWithProgress/WizardWithProgress'
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
  const { projectIdentifier, accountId, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()

  const gitRepo = useGetGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      org: orgIdentifier
    }
  })

  if (gitRepo?.loading) {
    return <PageSpinner />
  }

  const initialFormData = {
    flagName: prevStepData?.name || '',
    flagIdentifier: prevStepData?.identifier || '',
    gitDetails: {
      repoIdentifier: gitRepo?.data?.repoDetails?.repoIdentifier || '',
      rootFolder: gitRepo?.data?.repoDetails?.rootFolder || '',
      filePath: gitRepo?.data?.repoDetails?.filePath || '',
      commitMsg: ''
    },
    autoCommit: false
  }

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialFormData}
        formName="saveFlagRepoStep"
        validationSchema={Yup.object().shape({
          gitDetails: Yup.object({
            commitMsg: Yup.string().trim().required(getString('common.git.validation.commitMessage'))
          })
        })}
        onSubmit={formValues => nextStep?.({ ...prevStepData, ...formValues })}
      >
        <FormikForm data-testid="save-flag-to-git-form" className="save-flag-to-git-form">
          <SaveFlagToGitSubForm
            title={getString('cf.selectFlagRepo.dialogTitle')}
            branch={gitRepo?.data?.repoDetails?.branch || ''}
          />

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
    </>
  )
}

export default SaveFlagRepoStep
