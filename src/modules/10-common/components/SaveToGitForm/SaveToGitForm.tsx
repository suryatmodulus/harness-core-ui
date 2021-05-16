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
  Icon,
  Avatar
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { pick } from 'lodash-es'
import type { FormikContext } from 'formik'
import { Link } from 'react-router-dom'
import type { GitSyncConfig, GitSyncEntityDTO, GitSyncFolderConfigDTO, EntityGitDetails } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import paths from '@common/RouteDefinitions'
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
  const { accountId, projectIdentifier, isEditing = false, resource } = props
  const { getString } = useStrings()
  const { currentUserInfo } = useAppStore()
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const [rootFolderSelectOptions, setRootFolderSelectOptions] = React.useState<SelectOption[]>([])
  const [repoSelectOptions, setRepoSelectOptions] = React.useState<SelectOption[]>([])
  const [isNewBranch, setIsNewBranch] = React.useState(false)

  const defaultInitialFormData: SaveToGitFormInterface = {
    name: resource.name,
    identifier: resource.identifier,
    repoIdentifier: resource.gitDetails?.repoIdentifier || '',
    rootFolder: resource.gitDetails?.rootFolder || '',
    filePath: resource.gitDetails?.filePath || '',
    isNewBranch: false,
    branch: resource.gitDetails?.branch || '',
    commitMsg: getString('common.gitSync.updateResource', { resource: resource.name }),
    createPr: false
  }

  const handleBranchTypeChange = (isNew: boolean, formik: FormikContext<SaveToGitFormInterface>): void => {
    if (isNewBranch !== isNew) {
      setIsNewBranch(isNew)
      formik.setFieldValue('branch', `${resource.gitDetails?.branch}-patch`)
      formik.setFieldTouched('branch', false)
    }
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
      defaultInitialFormData.repoIdentifier = defaultInitialFormData.repoIdentifier || gitSyncRepos[0].identifier || ''
      const selectedRepo = gitSyncRepos.find(
        (repo: GitSyncConfig) => repo.identifier === defaultInitialFormData.repoIdentifier
      )

      setRepoSelectOptions(
        gitSyncRepos?.map((gitRepo: GitSyncConfig) => {
          return {
            label: gitRepo.name || '',
            value: gitRepo.identifier || ''
          }
        })
      )

      setRootFolderSelectOptions(getRootFolderSelectOptions(selectedRepo?.gitSyncFolderConfigDTOs))

      const defaultRootFolder = selectedRepo?.gitSyncFolderConfigDTOs?.find(
        (folder: GitSyncFolderConfigDTO) => folder.isDefault
      )
      defaultInitialFormData.rootFolder = defaultInitialFormData.rootFolder || defaultRootFolder?.rootFolder || ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitSyncRepos, projectIdentifier])

  const CreatePR: React.FC = () => {
    return (
      <Container>
        <FormInput.CheckBox
          name="createPr"
          disabled
          label={getString('common.git.startPRLabel')}
          // margin={{ left: 'large', top: 'small' }}
        />
        {/* Todo: enable and add target branch dropdown once PR support is added */}
      </Container>
    )
  }

  return loadingRepos ? (
    <PageSpinner />
  ) : (
    <Container height={'inherit'} className={css.modalContainer}>
      {currentUserInfo?.name && (
        <Layout.Horizontal className={css.userInfo} flex={{ alignItems: 'center' }} margin={{ top: 'xsmall' }}>
          <Avatar size="small" name={currentUserInfo?.name} backgroundColor={Color.PRIMARY_7} hoverCard={false} />
          <Text color={Color.GREY_700}>{getString('common.git.currentUserLabel', { user: currentUserInfo.name })}</Text>
        </Layout.Horizontal>
      )}
      <Text
        className={css.modalHeader}
        font={{ weight: 'semi-bold' }}
        color={Color.GREY_800}
        padding={{ bottom: 'small' }}
        margin={{ bottom: 'small', top: 'xlarge' }}
      >
        {getString('common.git.saveResourceLabel', { resource: props.resource.type })}
      </Text>
      {!currentUserInfo?.name && (
        <Layout.Horizontal className={css.addUserContainer} spacing="small">
          <Icon name="warning-sign" color={Color.ORANGE_700}></Icon>
          <div>
            <Text font={{ size: 'small' }} color={Color.BLACK}>
              {getString('common.git.noUserLabel')}
            </Text>
            <Link to={paths.toUserProfile({ accountId })}>
              <Text inline margin={{ top: 'xsmall' }} font={{ size: 'small', weight: 'bold' }} color={Color.PRIMARY_7}>
                {getString('common.git.addUserCredentialLabel')}
              </Text>
            </Link>
          </div>
        </Layout.Horizontal>
      )}
      <Container className={css.modalBody}>
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
                      disabled
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
                    font={{ size: 'medium' }}
                    color={Color.GREY_600}
                    padding={{ bottom: 'small' }}
                    margin={{ top: 'large' }}
                  >
                    {getString('common.git.branchSelectHeader')}
                  </Text>
                  <Container
                    className={css.branchSection}
                    padding={{
                      top: 'small',
                      bottom: 'xSmall'
                    }}
                  >
                    <Radio large onChange={() => handleBranchTypeChange(false, formik)} checked={!isNewBranch}>
                      <Icon name="git-branch-existing"></Icon>
                      <Text margin={{ left: 'small' }} inline>
                        {getString('common.git.existingBranchCommitLabel')}
                      </Text>
                      <Text
                        margin={{ left: 'small' }}
                        inline
                        padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
                        background={Color.PRIMARY_2}
                        border={{ radius: 5 }}
                      >
                        {defaultInitialFormData.branch}
                      </Text>
                    </Radio>
                    {!isNewBranch && <CreatePR />}
                  </Container>

                  <Container
                    className={css.branchSection}
                    padding={{
                      top: 'small',
                      bottom: isNewBranch ? 'xSmall' : 'small'
                    }}
                  >
                    <Radio
                      data-test="newBranchRadioBtn"
                      large
                      onChange={() => handleBranchTypeChange(true, formik)}
                      checked={isNewBranch}
                    >
                      <Icon name="git-new-branch" color={Color.GREY_700}></Icon>
                      <Text inline margin={{ left: 'small' }}>
                        {getString('common.git.newBranchCommitLabel')}
                      </Text>
                    </Radio>
                    {isNewBranch && (
                      <Container>
                        <FormInput.Text
                          className={css.branchInput}
                          name="branch"
                          label={getString('common.git.branchName')}
                        />
                        <CreatePR />
                      </Container>
                    )}
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
