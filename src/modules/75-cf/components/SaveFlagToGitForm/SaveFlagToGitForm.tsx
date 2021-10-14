import React, { ReactElement, ReactNode } from 'react'
import {
  Container,
  FormikForm,
  Formik,
  FormInput,
  Layout,
  Text,
  Color,
  Icon,
  Checkbox,
  FontVariation,
  Heading
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useGetGitRepo } from 'services/cf'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import type { FlagWizardFormValues } from '../CreateFlagWizard/FlagWizard'
import css from './SaveFlagToGitForm.module.scss'

export interface SaveFlagRepoDialogFormProps {
  title?: string
  flagName: string
  flagIdentifier: string
  formButtons: ReactNode
  onSubmit: (formData: Partial<FlagWizardFormValues>) => void
}

const SaveFlagToGitForm = ({
  onSubmit,
  title,
  formButtons,
  flagName,
  flagIdentifier
}: SaveFlagRepoDialogFormProps): ReactElement => {
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
    flagName,
    flagIdentifier,
    repoIdentifier: gitRepo?.data?.repoDetails?.repoIdentifier || '',
    rootFolder: gitRepo?.data?.repoDetails?.rootFolder || '',
    filePath: gitRepo?.data?.repoDetails?.filePath || '',
    gitDetails: {
      commitMsg: ''
    },
    autoCommit: false
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialFormData}
      formName="saveFlagRepoConfig"
      validationSchema={Yup.object().shape({
        gitDetails: Yup.object({
          commitMsg: Yup.string().trim().required(getString('common.git.validation.commitMessage'))
        })
      })}
      onSubmit={formData => {
        onSubmit(formData)
      }}
    >
      <FormikForm data-testid="save-flag-to-git-form" className="save-flag-to-git-form">
        {title && (
          <Heading level={3} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xlarge' }}>
            {title}
          </Heading>
        )}
        <Layout.Vertical spacing="small">
          <Container width="50%">
            <FormInput.InputWithIdentifier
              inputName="flagName"
              inputLabel={getString('name')}
              idName="flagIdentifier"
              isIdentifierEditable={false}
              inputGroupProps={{ disabled: true }}
            />
          </Container>
          <Container>
            <Heading
              level={4}
              font={{ variation: FontVariation.H5 }}
              margin={{ bottom: 'small' }}
              color={Color.GREY_600}
            >
              {getString('common.gitSync.harnessFolderLabel')}
            </Heading>
            <Layout.Horizontal className={css.formRow} spacing="small">
              <FormInput.Text name="repoIdentifier" label={getString('common.git.selectRepoLabel')} disabled />
              <FormInput.Text name="rootFolder" label={getString('common.gitSync.harnessFolderLabel')} disabled />
            </Layout.Horizontal>
            <FormInput.Text name="filePath" label={getString('common.git.filePath')} disabled />
          </Container>
          <Container>
            <Heading
              level={4}
              font={{ variation: FontVariation.H5 }}
              margin={{ bottom: 'small' }}
              color={Color.GREY_600}
            >
              {getString('common.gitSync.commitDetailsLabel')}
            </Heading>
            <FormInput.TextArea
              name="gitDetails.commitMsg"
              label={getString('common.git.commitMessage')}
              placeholder={getString('common.git.commitMessage')}
            />
            <Icon name="git-branch-existing"></Icon>
            <Text margin={{ left: 'small' }} inline>
              {getString('common.git.existingBranchCommitLabel')}:
            </Text>
            <Text
              data-testid="default-branch"
              margin={{ left: 'small' }}
              inline
              padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
              background={Color.PRIMARY_2}
              border={{ radius: 5 }}
              color={Color.BLACK}
            >
              {gitRepo?.data?.repoDetails?.branch}
            </Text>
            <Container padding={{ left: 'xlarge', top: 'small' }} data-testid="commit-details-section">
              <Checkbox large name="autoCommit">
                <Text inline color={Color.GREY_450}>
                  {getString('cf.creationModal.git.autoCommitMessage')}
                </Text>
              </Checkbox>
            </Container>
          </Container>
          <Container>{formButtons}</Container>
        </Layout.Vertical>
      </FormikForm>
    </Formik>
  )
}

export default SaveFlagToGitForm
