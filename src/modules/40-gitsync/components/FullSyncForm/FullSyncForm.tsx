/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { Popover, Position } from '@blueprintjs/core'
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
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  PageSpinner,
  FontVariation,
  useToaster
} from '@harness/uicore'
import * as Yup from 'yup'
import { debounce, defaultTo, isEmpty } from 'lodash-es'
import type { FormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import {
  GitSyncConfig,
  GitSyncFolderConfigDTO,
  GitBranchDTO,
  getListOfBranchesWithStatusPromise,
  ResponseGitBranchListDTO,
  GitFullSyncConfigRequestDTO,
  createGitFullSyncConfigPromise,
  triggerFullSyncPromise
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './FullSyncForm.module.scss'

interface FullSyncFormProps {
  orgIdentifier: string
  projectIdentifier: string
  isNewUser: boolean
}

interface ModalConfigureProps {
  onClose?: () => void
  onSuccess?: () => void
}

const FullSyncForm: React.FC<ModalConfigureProps & FullSyncFormProps> = props => {
  const { isNewUser = true, orgIdentifier, projectIdentifier, onClose, onSuccess } = props
  const config = {} as GitFullSyncConfigRequestDTO
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()

  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const [rootFolderSelectOptions, setRootFolderSelectOptions] = React.useState<SelectOption[]>([])
  const [repoSelectOptions, setRepoSelectOptions] = React.useState<SelectOption[]>([])
  const [isNewBranch, setIsNewBranch] = React.useState(false)

  const [branches, setBranches] = React.useState<SelectOption[]>()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const formikRef = useRef<FormikContext<GitFullSyncConfigRequestDTO>>()
  const [createPR, setCreatePR] = useState<boolean>(false) //used for rendering PR title
  const [disableCreatePR, setDisableCreatePR] = useState<boolean>()
  const [disableBranchSelection, setDisableBranchSelection] = useState<boolean>(true)

  const defaultInitialFormData: GitFullSyncConfigRequestDTO = {
    baseBranch: config?.baseBranch,
    branch: '',
    createPullRequest: false,
    newBranch: false,
    prTitle: getString('gitsync.deafaultSyncTitle'),
    repoIdentifier: config?.repoIdentifier || '',
    rootFolder: config?.rootFolder || '',
    targetBranch: ''
  }

  const handleBranchTypeChange = (isNew: boolean, formik: FormikContext<GitFullSyncConfigRequestDTO>): void => {
    const defaultBranch = gitSyncRepos.find(
      (repo: GitSyncConfig) => repo.identifier === formikRef.current?.values.repoIdentifier
    )?.branch
    if (isNewBranch !== isNew) {
      setIsNewBranch(isNew)

      formik.setFieldValue('branch', `${defaultBranch}-patch`)
      formik.setFieldTouched('branch', false)
    }
    formik.setFieldValue('targetBranch', isNew ? defaultBranch || '' : '')
    formik.setFieldTouched('targetBranch', false)
    formik.setFieldValue('createPullRequest', false)
    formik.setFieldTouched('createPullRequest', false)
    formikRef.current?.setFieldValue('createPullRequest', false)
    setDisableCreatePR(false)
    setCreatePR(false)
    setDisableBranchSelection(true)
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
      defaultInitialFormData.baseBranch = selectedRepo?.branch
      fetchBranches(defaultInitialFormData.repoIdentifier)
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

  const fetchBranches = (repoIdentifier: string, query?: string): void => {
    getListOfBranchesWithStatusPromise({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        yamlGitConfigIdentifier: repoIdentifier,
        page: 0,
        size: 10,
        searchTerm: query
      }
    })
      .then((response: ResponseGitBranchListDTO) => {
        const branchesInResponse = response?.data?.branches?.content
        /* Show error in case no branches exist on a git repo at all */
        /* A valid git repo should have atleast one branch in it(a.k.a default branch) */
        if (!query && isEmpty(branchesInResponse)) {
          setDisableCreatePR(true)
          setDisableBranchSelection(true)
          modalErrorHandler?.showDanger(getString('common.git.noBranchesFound'))
          return
        }
        const branchOptions = branchesInResponse?.map((branch: GitBranchDTO) => {
          return { label: branch?.branchName, value: branch?.branchName }
        }) as SelectOption[]

        if (!isNewBranch && isEmpty(branchOptions)) {
          setDisableCreatePR(true)
          setDisableBranchSelection(true)
        } else {
          setBranches(branchOptions)
          setDisableCreatePR(false)
          setDisableBranchSelection(false)
        }
      })
      .catch(e => {
        modalErrorHandler?.showDanger(e.data?.message || e.message)
      })
  }

  const saveAndTriggerFullSync = async (fullSyncData: GitFullSyncConfigRequestDTO): Promise<void> => {
    const queryParams = {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
    modalErrorHandler?.hide()
    try {
      const fullSyncConfigData = await createGitFullSyncConfigPromise({
        queryParams,
        body: { ...fullSyncData, newBranch: isNewBranch }
      })
      if (fullSyncConfigData.status !== 'SUCCESS') {
        throw fullSyncConfigData
      }
      const triggerFullSync = await triggerFullSyncPromise({ queryParams, body: {} as unknown as void })
      if (triggerFullSync.status !== 'SUCCESS') {
        throw triggerFullSync
      }
      showSuccess(getString('gitsync.syncSucessToaster'))
      onSuccess?.()
    } catch (err) {
      modalErrorHandler?.showDanger(defaultTo(err.data?.message, err.message))
    }
  }

  const debounceFetchBranches = debounce((repoIdentifier: string, query?: string): void => {
    try {
      fetchBranches(repoIdentifier, query)
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }, 1000)

  const CreatePR = React.useMemo(() => {
    return (
      <>
        <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }} padding={{ top: 'small' }}>
          <FormInput.CheckBox
            disabled={disableCreatePR}
            name="createPullRequest"
            label={getString('common.git.startPRLabel')}
            onChange={e => {
              formikRef.current?.setFieldValue('createPullRequest', e.currentTarget.checked)
              formikRef.current?.setFieldTouched('targetBranch', false)
              setCreatePR(e.currentTarget.checked)
              if (e.currentTarget.checked) {
                fetchBranches(formikRef.current?.values.repoIdentifier || '')
              } else {
                setDisableBranchSelection(true)
              }
            }}
          />
          {disableCreatePR ? (
            <Popover
              position={Position.TOP}
              content={
                <Text padding="medium" color={Color.RED_400}>
                  {getString('common.git.onlyDefaultBranchFound')}
                </Text>
              }
              isOpen={disableCreatePR}
              popoverClassName={css.tooltip}
            >
              <Container margin={{ bottom: 'xlarge' }}></Container>
            </Popover>
          ) : null}
          <FormInput.Select
            name="targetBranch"
            items={branches || []}
            disabled={disableBranchSelection || disableCreatePR}
            data-id="create-pr-branch-select"
            onQueryChange={(query: string) =>
              debounceFetchBranches(formikRef.current?.values.repoIdentifier || '', query)
            }
            selectProps={{ usePortal: true, popoverClassName: css.gitBranchSelectorPopover }}
            className={css.branchSelector}
          />
        </Layout.Horizontal>
        {createPR ? (
          <FormInput.Text name="prTitle" className={css.prTitle} label={getString('gitsync.PRTitle')} />
        ) : null}
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    disableCreatePR,
    disableBranchSelection,
    branches,
    isNewBranch,
    formikRef.current?.values,
    formikRef.current?.values.createPullRequest
  ])

  return (
    <Container height={'inherit'} className={css.modalContainer}>
      {loadingRepos ? (
        <PageSpinner />
      ) : (
        <>
          <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xlarge' }}>
            {getString('gitsync.fullSyncTitle')}
          </Text>
          <ModalErrorHandler bind={setModalErrorHandler} />
          <Container className={css.modalBody}>
            <Formik<GitFullSyncConfigRequestDTO>
              initialValues={defaultInitialFormData}
              formName="fullSyncConfigForm"
              validationSchema={Yup.object().shape({
                repoIdentifier: Yup.string().trim().required(getString('common.validation.repositoryName')),
                branch: Yup.string()
                  .trim()
                  .required(getString('validation.branchName'))
                  .when('createPullRequest', {
                    is: true,
                    then: Yup.string().notOneOf(
                      [Yup.ref('targetBranch')],
                      getString('common.git.validation.sameBranches')
                    )
                  }),
                targetBranch: Yup.string()
                  .trim()
                  .when('createPullRequest', {
                    is: true,
                    then: Yup.string().required(getString('common.git.validation.targetBranch'))
                  }),
                prTitle: Yup.string().trim().min(1).required(getString('common.git.validation.PRTitleRequired'))
              })}
              onSubmit={formData => {
                saveAndTriggerFullSync(formData)
              }}
            >
              {formik => {
                formikRef.current = formik
                return (
                  <FormikForm>
                    <Container className={css.formBody}>
                      <Text margin={{ bottom: 'small' }} font={{ size: 'medium' }} color={Color.GREY_700}>
                        {getString('common.gitSync.harnessFolderLabel')}
                      </Text>

                      <FormInput.Select
                        name="repoIdentifier"
                        label={getString('common.git.selectRepoLabel')}
                        items={repoSelectOptions}
                        disabled={isNewUser}
                      />
                      <FormInput.Select
                        name="rootFolder"
                        label={getString('common.gitSync.harnessFolderLabel')}
                        items={rootFolderSelectOptions}
                        disabled={isNewUser}
                      />

                      <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} margin={{ top: 'large' }}>
                        {getString('gitsync.syncBranchTitle')}
                      </Text>
                      <Layout.Vertical spacing="medium" margin={{ bottom: 'medium' }}>
                        <Container
                          className={css.branchSection}
                          padding={{
                            top: 'small',
                            bottom: 'xSmall'
                          }}
                        >
                          <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}>
                            <Radio large onChange={() => handleBranchTypeChange(false, formik)} checked={!isNewBranch}>
                              <Icon name="git-branch-existing"></Icon>
                              <Text margin={{ left: 'small' }} inline>
                                {getString('gitsync.selectBranchTitle')}
                              </Text>
                            </Radio>
                            <FormInput.Select
                              name="branch"
                              items={branches || []}
                              disabled={isNewBranch}
                              onQueryChange={(query: string) =>
                                debounceFetchBranches(formik.values.repoIdentifier, query)
                              }
                              selectProps={{ usePortal: true, popoverClassName: css.gitBranchSelectorPopover }}
                              className={css.branchSelector}
                            />
                          </Layout.Horizontal>
                          {!isNewBranch && CreatePR}
                        </Container>
                        <Container
                          className={css.branchSection}
                          padding={{
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
                              {getString('gitsync.createBranchTitle')}
                            </Text>
                          </Radio>
                          {isNewBranch && (
                            <Container padding={{ top: 'small' }}>
                              <FormInput.Text
                                className={css.branchInput}
                                name="branch"
                                label={getString('common.git.branchName')}
                              />
                              {CreatePR}
                            </Container>
                          )}
                        </Container>
                      </Layout.Vertical>
                    </Container>

                    <Layout.Horizontal padding={{ top: 'medium' }} spacing="medium">
                      <Button type="submit" intent="primary" text={getString('save')} />
                      <Button text={getString('cancel')} margin={{ left: 'medium' }} onClick={onClose} />
                    </Layout.Horizontal>
                  </FormikForm>
                )
              }}
            </Formik>
          </Container>
        </>
      )}
    </Container>
  )
}

export default FullSyncForm
