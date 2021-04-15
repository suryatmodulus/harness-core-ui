import React, { useEffect } from 'react'
import {
  Container,
  Text,
  Color,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  Button,
  SelectOption,
  Radio,
  Icon
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { GitSyncConfig, GitSyncEntityDTO, getListOfBranchesByGitConfigPromise } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PageSpinner } from '../Page/PageSpinner'
import css from './SaveToGitForm.module.scss'

export interface GitResourceInterface {
  type: GitSyncEntityDTO['entityType']
}

interface SaveToGitFormProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  isEditing: boolean
  resource: GitResourceInterface
}

interface ModalConfigureProps {
  onClose?: () => void
  onSuccess?: (data: SaveToGitFormInterface) => void
}

export interface SaveToGitFormInterface {
  repoIdentifier: string
  filePath: string
  isNewBranch: boolean
  branch: string
  commitMsg: string
  createPr: boolean
}

const SaveToGitForm: React.FC<ModalConfigureProps & SaveToGitFormProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = props
  const { getString } = useStrings()
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const [repoSelectOptions, setRepoSelectOptions] = React.useState<SelectOption[]>([])
  const [branchSelectOptions, setBranchSelectOptions] = React.useState<SelectOption[]>([])
  const [isNewBranch, setIsNewBranch] = React.useState(false)
  const [loadingBranchList, setLoadingBranchList] = React.useState<boolean>(false)

  const defaultInitialFormData: SaveToGitFormInterface = {
    repoIdentifier: '',
    filePath: '',
    isNewBranch: false,
    branch: '',
    commitMsg: '',
    createPr: false
  }

  const handleBranchTypeChange = (isNew: boolean): void => {
    if (isNewBranch !== isNew) setIsNewBranch(isNew)
  }

  const fetchBranches = (repoId: string): void => {
    setLoadingBranchList(true)
    getListOfBranchesByGitConfigPromise({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        yamlGitConfigIdentifier: repoId
      }
    }).then(response => {
      setLoadingBranchList(false)
      if (response.data?.length) {
        defaultInitialFormData.repoIdentifier = response.data[0]
        setBranchSelectOptions(
          response.data.map((branch: string) => {
            return {
              label: branch || '',
              value: branch || ''
            }
          })
        )
      }
    })
  }

  useEffect(() => {
    if (projectIdentifier && gitSyncRepos?.length) {
      setRepoSelectOptions(
        gitSyncRepos?.map((gitRepo: GitSyncConfig) => {
          return {
            label: gitRepo.name || '',
            value: gitRepo.identifier || ''
          }
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitSyncRepos, projectIdentifier])

  const BranchSelect: React.FC<{ isNewSelected: boolean; isNewContainer: boolean }> = branchSelectProps => {
    const { isNewSelected, isNewContainer } = branchSelectProps

    return isNewSelected === isNewContainer ? (
      <Container margin={{ left: 'huge' }}>
        {isNewContainer ? (
          <FormInput.Text className={css.branchInput} name="branch" label={getString('connectors.git.branchName')} />
        ) : (
          <FormInput.Select
            name="branch"
            className={css.branchInput}
            items={branchSelectOptions}
            disabled={loadingBranchList}
            label={getString('connectors.git.branchName')}
          />
        )}
        <FormInput.CheckBox
          margin={{ left: 'xlarge' }}
          name="createPr"
          disabled
          label={getString('common.git.startPRLabel')}
        />
      </Container>
    ) : null
  }

  return loadingRepos ? (
    <PageSpinner />
  ) : (
    <Container height={'inherit'} className={css.modalContainer} margin="large">
      <Text
        className={css.modalHeader}
        font={{ weight: 'semi-bold' }}
        color={Color.GREY_800}
        padding={{ bottom: 'small' }}
        margin={{ bottom: 'small' }}
      >
        {getString('common.git.saveResourceLabel', { resource: props.resource.type })}
      </Text>

      <Container>
        <Formik<SaveToGitFormInterface>
          initialValues={defaultInitialFormData}
          validationSchema={Yup.object().shape({
            repoIdentifier: Yup.string().trim().required(getString('validation.repositoryName')),
            filePath: Yup.string().trim().required(getString('common.git.validation.filePath')),
            branch: Yup.string().trim().required(getString('validation.branchName'))
          })}
          onSubmit={formData => {
            props.onSuccess?.({ ...formData, isNewBranch })
          }}
        >
          {({ values: formValues, setFieldValue }) => (
            <FormikForm>
              <Container className={css.formBody}>
                <FormInput.Select
                  name="repoIdentifier"
                  label={getString('common.git.selectRepoLabel', { resource: props.resource.type })}
                  items={repoSelectOptions}
                  onChange={(selected: SelectOption) => {
                    setFieldValue(formValues.branch, '')
                    fetchBranches(selected.value as string)
                  }}
                />
                <FormInput.Text name="filePath" label={getString('common.git.filePath')} />
                <FormInput.TextArea name="commitMsg" label={getString('common.git.commitMessage')} />

                <Text
                  className={css.sectionHeader}
                  font={{ size: 'medium' }}
                  color={Color.GREY_600}
                  padding={{ bottom: 'small' }}
                  margin={{ top: 'large' }}
                >
                  {getString('common.git.branchSelectHeader')}
                </Text>
                <Container
                  className={css.sectionHeader}
                  padding={{
                    top: 'small',
                    bottom: isNewBranch ? 'small' : 'xSmall'
                  }}
                >
                  <Radio large onClick={() => handleBranchTypeChange(false)} checked={!isNewBranch}>
                    <Icon name="git-branch-existing"></Icon>
                    <Text margin={{ left: 'small' }} inline>
                      {getString('common.git.existingBranchCommitLabel')}
                    </Text>
                  </Radio>
                  <BranchSelect isNewSelected={isNewBranch} isNewContainer={false}></BranchSelect>
                </Container>

                <Container
                  className={css.sectionHeader}
                  padding={{
                    top: 'small',
                    bottom: isNewBranch ? 'xSmall' : 'small'
                  }}
                >
                  <Radio large onClick={() => handleBranchTypeChange(true)} checked={isNewBranch}>
                    <Icon name="git-new-branch"></Icon>
                    <Text inline margin={{ left: 'small' }}>
                      {getString('common.git.newBranchCommitLabel')}
                    </Text>
                  </Radio>
                  <BranchSelect isNewSelected={isNewBranch} isNewContainer={true}></BranchSelect>
                </Container>
              </Container>

              <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                <Button className={css.formButton} type="submit" intent="primary" text={getString('save')} />
                <Button
                  className={css.formButton}
                  text={getString('cancel')}
                  margin={{ left: 'medium' }}
                  onClick={props.onClose}
                />
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </Container>
    </Container>
  )
}

export default SaveToGitForm
