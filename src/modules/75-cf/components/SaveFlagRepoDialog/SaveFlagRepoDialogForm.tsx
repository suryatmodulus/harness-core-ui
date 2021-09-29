import React, { ReactElement } from 'react'
import { Container, FormikForm, Formik, Button, FormInput, Layout, SelectOption } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { GitRepoRequestRequestBody } from 'services/cf'
import css from './SaveFlagRepoDialog.module.scss'

export interface SaveFlagRepoDialogFormProps {
  initialFormData: GitRepoRequestRequestBody
  repoSelectOptions: SelectOption[]
  rootFolderSelectOptions: SelectOption[]
  handleRepoOptionChange: (selectedRepo: string | number | symbol) => void
  onSubmit: (formData: GitRepoRequestRequestBody) => void
  onClose: () => void
}

const SaveFlagRepoDialogForm = ({
  initialFormData,
  repoSelectOptions,
  rootFolderSelectOptions,
  handleRepoOptionChange,
  onSubmit,
  onClose
}: SaveFlagRepoDialogFormProps): ReactElement => {
  const { getString } = useStrings()
  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialFormData}
      formName="saveFlagRepoConfig"
      validationSchema={Yup.object().shape({
        repoIdentifier: Yup.string().trim().required(getString('common.validation.repositoryName')),
        filePath: Yup.string()
          .trim()
          .required(getString('common.git.validation.filePath'))
          .matches(new RegExp(/^[0-9a-zA-Z/_-]+\.(yaml)+$/g))
      })}
      onSubmit={formData => {
        onSubmit(formData)
      }}
    >
      {formik => {
        return (
          <FormikForm data-testid="save-flag-repo-dialog-form">
            <Container>
              <Layout.Horizontal spacing="medium" className={css.formRow}>
                <FormInput.Select
                  name="repoIdentifier"
                  label={getString('common.git.selectRepoLabel')}
                  items={repoSelectOptions}
                  onChange={(option: SelectOption) => {
                    formik.setFieldValue('repoIdentifier', option.value)
                    handleRepoOptionChange(option.value)
                  }}
                />
                <FormInput.Text name="branch" label={getString('common.git.branchName')} disabled />
              </Layout.Horizontal>
              <FormInput.Select
                name="rootFolder"
                label={getString('common.gitSync.harnessFolderLabel')}
                items={rootFolderSelectOptions}
              />
              <FormInput.Text name="filePath" label={getString('common.git.filePath')} disabled />
            </Container>

            <Layout.Horizontal padding={{ top: 'medium' }} spacing="medium">
              <Button type="submit" intent="primary" text={getString('save')} />
              <Button
                text={getString('cancel')}
                margin={{ left: 'medium' }}
                onClick={e => {
                  e.preventDefault()
                  onClose()
                }}
              />
            </Layout.Horizontal>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export default SaveFlagRepoDialogForm
