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
import { pick } from 'lodash-es'
import type { FormikContext } from 'formik'
import {
  GitSyncConfig,
  GitSyncEntityDTO,
  getListOfBranchesByGitConfigPromise,
  GitSyncFolderConfigDTO,
  EntityGitDetails
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PageSpinner } from '../Page/PageSpinner'
import { NameId } from '../NameIdDescriptionTags/NameIdDescriptionTags'
import css from './SaveToGitForm.module.scss'

export interface GitResourceInterface {
  type: GitSyncEntityDTO['entityType']
  name: string
  identifier: string
  gitDetails?: EntityGitDetails
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
  name?: string
  identifier?: string
  repoIdentifier: string
  rootFolder: string
  filePath: string
  isNewBranch: boolean
  branch: string
  commitMsg: string
  createPr: boolean
}

const SaveToGitForm: React.FC<ModalConfigureProps & SaveToGitFormProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier, isEditing = false, resource } = props
  const { getString } = useStrings()
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const [rootFolderSelectOptions, setRootFolderSelectOptions] = React.useState<SelectOption[]>([])
  const [repoSelectOptions, setRepoSelectOptions] = React.useState<SelectOption[]>([])
  const [branchSelectOptions, setBranchSelectOptions] = React.useState<SelectOption[]>([])
  const [isNewBranch, setIsNewBranch] = React.useState(false)
  const [loadingBranchList, setLoadingBranchList] = React.useState<boolean>(false)

  const defaultInitialFormData: SaveToGitFormInterface = {
    name: resource.name,
    identifier: resource.identifier,
    repoIdentifier: resource.gitDetails?.repoIdentifier || '',
    rootFolder: resource.gitDetails?.rootFolder || '',
    filePath: resource.gitDetails?.filePath || '',
    isNewBranch: false,
    branch: resource.gitDetails?.branch || '',
    commitMsg: '',
    createPr: false
  }

  const handleBranchTypeChange = (isNew: boolean, formik: FormikContext<SaveToGitFormInterface>): void => {
    if (isNewBranch !== isNew) {
      setIsNewBranch(isNew)
      formik.setFieldValue('branch', '')
      formik.setFieldTouched('branch', false)
    }
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

  const getRootFolderSelectOptions = (folders: GitSyncFolderConfigDTO[] | undefined): SelectOption[] => {
    return folders?.length
      ? folders.map((folder: GitSyncFolderConfigDTO) => {
          return {
            label: folder.rootFolder || '',
            value: folder.rootFolder || ''
          }
        })
      : []
  }

  useEffect(() => {
    if (projectIdentifier && gitSyncRepos?.length) {
      defaultInitialFormData.repoIdentifier = gitSyncRepos[0].identifier || ''
      fetchBranches(defaultInitialFormData.repoIdentifier)
      setRepoSelectOptions(
        gitSyncRepos?.map((gitRepo: GitSyncConfig) => {
          return {
            label: gitRepo.name || '',
            value: gitRepo.identifier || ''
          }
        })
      )

      setRootFolderSelectOptions(getRootFolderSelectOptions(gitSyncRepos[0].gitSyncFolderConfigDTOs))

      const defaultRootFolder = gitSyncRepos[0].gitSyncFolderConfigDTOs?.find(
        (folder: GitSyncFolderConfigDTO) => folder.isDefault
      )
      defaultInitialFormData.rootFolder = defaultRootFolder?.rootFolder || ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitSyncRepos, projectIdentifier])

  const BranchSelect: React.FC<{ isNewSelected: boolean; isNewContainer: boolean }> = branchSelectProps => {
    const { isNewSelected, isNewContainer } = branchSelectProps

    return isNewSelected === isNewContainer ? (
      <Container margin={{ left: 'huge' }}>
        {isNewContainer ? (
          <FormInput.Text className={css.branchInput} name="branch" label={getString('common.git.branchName')} />
        ) : (
          <FormInput.Select
            name="branch"
            className={css.branchInput}
            items={branchSelectOptions}
            disabled={loadingBranchList}
            label={getString('common.git.branchName')}
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
            props.onSuccess?.({
              ...pick(formData, ['repoIdentifier', 'rootFolder', 'filePath', 'branch', 'commitMsg', 'createPr']),
              isNewBranch
            })
          }}
        >
          {formik => {
            return (
              <FormikForm>
                <Container className={css.formBody}>
                  <NameId
                    identifierProps={{
                      inputName: 'name',
                      isIdentifierEditable: false,
                      inputGroupProps: { disabled: true }
                    }}
                  />
                  <Layout.Horizontal spacing="medium" className={css.formRow}>
                    <FormInput.Select
                      name="repoIdentifier"
                      label={getString('common.git.selectRepoLabel')}
                      items={repoSelectOptions}
                      disabled={isEditing}
                      onChange={(selected: SelectOption) => {
                        formik.setFieldValue('branch', '')
                        formik.setFieldValue('rootFolder', '')
                        fetchBranches(selected.value as string)
                        const selectedRepo = gitSyncRepos.find(
                          (repo: GitSyncConfig) => repo.identifier === selected.value
                        )

                        const defaultRootFolder = selectedRepo?.gitSyncFolderConfigDTOs?.find(
                          (folder: GitSyncFolderConfigDTO) => !!folder.isDefault
                        )

                        defaultRootFolder && formik.setFieldValue('rootFolder', defaultRootFolder.rootFolder)
                        setRootFolderSelectOptions(getRootFolderSelectOptions(selectedRepo?.gitSyncFolderConfigDTOs))
                      }}
                    />
                    <FormInput.Select
                      name="rootFolder"
                      label={getString('common.gitSync.rootFolderLabel')}
                      items={rootFolderSelectOptions}
                      disabled={isEditing}
                    />
                  </Layout.Horizontal>

                  <FormInput.Text name="filePath" label={getString('common.git.filePath')} disabled={isEditing} />
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
                    <Radio large onClick={() => handleBranchTypeChange(false, formik)} checked={!isNewBranch}>
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
                    <Radio
                      data-test="newBranchRadioBtn"
                      large
                      onClick={() => handleBranchTypeChange(true, formik)}
                      checked={isNewBranch}
                    >
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
            )
          }}
        </Formik>
      </Container>
    </Container>
  )
}

export default SaveToGitForm
