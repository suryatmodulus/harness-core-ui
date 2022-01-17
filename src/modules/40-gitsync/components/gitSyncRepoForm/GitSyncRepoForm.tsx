/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  ModalErrorHandler,
  FormikForm,
  ModalErrorHandlerBinding,
  Container,
  Color,
  Icon,
  FormInput,
  IconName,
  Card,
  SelectOption,
  shouldShowError
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { noop, pick, debounce, isEmpty, defaultTo } from 'lodash-es'
import { useToaster, StringUtils } from '@common/exports'
import {
  usePostGitSync,
  GitSyncConfig,
  getListOfBranchesByConnectorPromise,
  useGetTestGitRepoConnectionResult,
  ResponseConnectorValidationResult
} from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { getConnectorDisplayName, GitUrlType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import {
  ConnectorReferenceField,
  ConnectorSelectedValue
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  ConnectorCardInterface,
  getCompleteGitPath,
  getHarnessFolderPathWithSuffix,
  gitCards,
  getRepoUrl
} from '@gitsync/common/gitSyncUtils'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { TestConnectionWidget, TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import { HARNESS_FOLDER_NAME_PLACEHOLDER, HARNESS_FOLDER_SUFFIX } from '@gitsync/common/Constants'
import { getScopeFromDTO, ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import css from './GitSyncRepoForm.module.scss'

export interface GitSyncRepoFormProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  isEditMode: boolean
  isNewUser: boolean
  gitSyncRepoInfo?: GitSyncConfig
}

interface ModalConfigureProps {
  onClose?: () => void
  onSuccess?: (data?: GitSyncConfig) => void
}

interface GitSyncFormInterface {
  gitConnectorType: GitSyncConfig['gitConnectorType']
  repo: string
  name: string
  identifier: string
  branch: string
  rootfolder: string
  gitConnector: ConnectorSelectedValue | undefined
}

const getRepoUrlForConnectorType = (formValues: GitSyncFormInterface, repoNameParam?: string): string => {
  const repoName = defaultTo(repoNameParam, formValues.repo)
  if (formValues.gitConnector?.connector?.spec?.type === GitUrlType.REPO) {
    return repoName
  }
  return getRepoUrl(formValues.gitConnector?.connector?.spec?.url, repoName)
}

const GitSyncRepoForm: React.FC<ModalConfigureProps & GitSyncRepoFormProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier, isNewUser } = props
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [branchSelectOptions, setBranchSelectOptions] = React.useState<SelectOption[]>([])
  const [loadingBranchList, setLoadingBranchList] = React.useState<boolean>(false)
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.NOT_INITIATED)

  const { mutate: createGitSyncRepo, loading: creatingGitSync } = usePostGitSync({
    queryParams: { accountIdentifier: accountId }
  })

  const { mutate: testRepo, loading: testing } = useGetTestGitRepoConnectionResult({
    identifier: '',
    pathParams: {
      identifier: ''
    },
    queryParams: {
      repoURL: ''
    }
  })

  const defaultInitialFormData: GitSyncFormInterface = {
    gitConnectorType: Connectors.GITHUB as GitSyncConfig['gitConnectorType'],
    repo: '',
    name: '',
    identifier: '',
    branch: '',
    rootfolder: '',
    gitConnector: undefined
  }

  const [connectorType, setConnectorType] = useState(defaultInitialFormData.gitConnectorType)

  const getConnectorIdentifierWithScope = (scope: Scope, identifier: string): string => {
    return scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${identifier}` : identifier
  }

  const handleCreate = async (data: GitSyncConfig): Promise<void> => {
    try {
      if (isNewUser) {
        props.onSuccess?.(data)
        return
      }
      modalErrorHandler?.hide()
      const response = await createGitSyncRepo(data)
      showSuccess(getString('gitsync.successfullCreate', { name: data.name }))
      props.onSuccess?.(response)
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  const debounceFetchBranches = debounce((connectorIdentifierRef: string, repoURL: string) => {
    setLoadingBranchList(true)
    getListOfBranchesByConnectorPromise({
      queryParams: {
        connectorIdentifierRef,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        repoURL
      }
    })
      .then(response => {
        setLoadingBranchList(false)
        modalErrorHandler?.hide()
        if (response.status !== 'SUCCESS') {
          throw response
        } else {
          if (!isEmpty(response.data)) {
            setBranchSelectOptions(
              response.data?.length
                ? response.data.map((branch: string) => {
                    return {
                      label: defaultTo(branch, ''),
                      value: defaultTo(branch, '')
                    }
                  })
                : []
            )
          } else {
            modalErrorHandler?.showDanger(getString('common.git.noBranchesFound'))
          }
        }
      })
      .catch(e => {
        modalErrorHandler?.hide()
        modalErrorHandler?.showDanger(defaultTo(e.data?.message, e.message))
      })
  }, 1000) // Fetching branches after user input of repoUrl

  const testConnection = async ({
    identifier,
    _orgIdentifier,
    _projectIdentifier,
    repoURL
  }: {
    identifier: string
    _orgIdentifier?: string
    _projectIdentifier?: string
    repoURL: string
  }): Promise<void> => {
    modalErrorHandler?.hide()
    setTestStatus(TestStatus.IN_PROGRESS)
    testRepo(undefined, {
      pathParams: {
        identifier
      },
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: _orgIdentifier,
        projectIdentifier: _projectIdentifier,
        repoURL
      }
    })
      .then((response: ResponseConnectorValidationResult) => {
        if (response?.data?.status !== 'SUCCESS') {
          setTestStatus(TestStatus.FAILED)
        } else {
          setTestStatus(TestStatus.SUCCESS)
        }
      })
      .catch(e => {
        setTestStatus(TestStatus.FAILED)
        if (shouldShowError(e)) {
          modalErrorHandler?.showDanger(defaultTo(e.data?.message, e.message))
        }
      })
  }

  return (
    <Container height={'inherit'} className={css.modalContainer} margin="large">
      <Container padding={{ top: 'small' }}>
        <ModalErrorHandler bind={setModalErrorHandler} style={{ marginBottom: 'var(--spacing-medium)' }} />
      </Container>
      <Text font={{ size: 'large', weight: 'semi-bold' }} color={Color.BLACK}>
        {isNewUser ? getString('gitsync.configureHarnessFolder') : getString('enableGitExperience')}
      </Text>
      <Layout.Horizontal>
        <Container width={'60%'}>
          <Formik<GitSyncFormInterface>
            initialValues={defaultInitialFormData}
            formName="gitSyncRepoForm"
            validationSchema={Yup.object().shape({
              name: Yup.string().trim().required(getString('validation.nameRequired')),
              identifier: Yup.string().when('name', {
                is: val => val?.length,
                then: Yup.string()
                  .trim()
                  .required(getString('validation.identifierRequired'))
                  .matches(StringUtils.regexIdentifier, getString('validation.validIdRegex'))
                  .notOneOf(StringUtils.illegalIdentifiers)
              }),
              repo: Yup.string().trim().required(getString('common.validation.repositoryName')),
              branch: Yup.string().trim().required(getString('validation.branchName')),
              rootfolder: Yup.string()
                .trim()
                .matches(
                  StringUtils.HarnessFolderName,
                  getString('common.validation.harnessFolderNamePatternIsNotValid')
                )
            })}
            onSubmit={formData => {
              const gitSyncRepoData = {
                ...pick(formData, ['gitConnectorType', 'branch', 'name', 'identifier']),
                repo: getRepoUrlForConnectorType(formData),
                gitConnectorRef: (formData.gitConnector as ConnectorSelectedValue)?.value,
                gitSyncFolderConfigDTOs: [
                  {
                    rootFolder: getHarnessFolderPathWithSuffix(formData.rootfolder.trim(), HARNESS_FOLDER_SUFFIX),
                    isDefault: true
                  }
                ],
                projectIdentifier: projectIdentifier,
                orgIdentifier: orgIdentifier
              }
              // handleUpdate(data, formData) Edit of gitSync is not supported now
              if (!props.isEditMode) {
                handleCreate(gitSyncRepoData)
              }
            }}
          >
            {({ values: formValues, setFieldValue }) => (
              <FormikForm>
                <Container className={css.formBody}>
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
                    <Icon name="git-configure" size={18} />
                    <Text
                      font={{ size: 'medium', weight: 'semi-bold' }}
                      margin={{ top: 'large', bottom: 'large' }}
                      color={Color.BLACK}
                    >
                      {getString('selectGitProvider')}
                    </Text>
                  </Layout.Horizontal>
                  <Layout.Horizontal margin={{ bottom: 'medium', left: 'xlarge' }}>
                    {gitCards.map((cardData: ConnectorCardInterface) => {
                      const isSelected = cardData.type === formValues.gitConnectorType
                      return (
                        <Layout.Vertical key={cardData.type} className={css.cardWrapper}>
                          <Card
                            data-testid={`${cardData.type}-card`}
                            onMouseOver={noop}
                            disabled={cardData.disabled}
                            interactive
                            className={cx(css.card, {
                              [css.selectedCard]: isSelected
                            })}
                            onClick={e => {
                              if (cardData.disabled) return
                              e.stopPropagation()
                              setFieldValue('gitConnectorType', cardData.type)
                              setFieldValue('gitConnector', '')
                              setFieldValue('repo', '')
                              setFieldValue('branch', '')
                              setConnectorType(cardData.type as GitSyncConfig['gitConnectorType'])
                            }}
                          >
                            <Icon
                              margin="large"
                              className={css.connectorTypeIcon}
                              inline={false}
                              name={(isSelected ? cardData.icon?.selected : cardData.icon?.default) as IconName}
                              size={40}
                            />
                          </Card>

                          <Text inline={false} color={isSelected ? Color.BLUE_500 : Color.GREY_500}>
                            {getConnectorDisplayName(cardData.type)}
                          </Text>
                        </Layout.Vertical>
                      )
                    })}
                  </Layout.Horizontal>
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
                    <Icon name="folder-upload" size={18} />
                    <Text
                      font={{ size: 'medium', weight: 'semi-bold' }}
                      margin={{ top: 'large', bottom: 'large' }}
                      color={Color.BLACK}
                    >
                      {getString('gitsync.folderDetails')}
                    </Text>
                  </Layout.Horizontal>
                  <Layout.Vertical padding={{ left: 'xlarge' }}>
                    <Container className={css.formElm}>
                      <NameId
                        identifierProps={{ inputName: 'name' }}
                        nameLabel={getString('common.git.selectRepoLabel')}
                      />
                    </Container>
                    <ConnectorReferenceField
                      name="gitConnector"
                      width={350}
                      type={connectorType}
                      selected={formValues.gitConnector}
                      label={getString('selectGitConnectorTypeLabel', {
                        type: getConnectorDisplayName(connectorType)
                      })}
                      placeholder={getString('select')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      onChange={(value, scope) => {
                        modalErrorHandler?.hide()
                        setFieldValue('gitConnector', {
                          label: defaultTo(value.name, ''),
                          value: getConnectorIdentifierWithScope(scope, value?.identifier),
                          scope: scope,
                          live: value?.status?.status === 'SUCCESS',
                          connector: value
                        })
                        let repoValue = ''
                        if (value?.spec?.type === GitUrlType.REPO) {
                          repoValue = value?.spec?.url
                          debounceFetchBranches(
                            getConnectorIdentifierWithScope(getScopeFromDTO(value), value.identifier),
                            value?.spec?.url
                          )
                        }
                        setFieldValue('repo', repoValue)
                        setTestStatus(TestStatus.NOT_INITIATED)
                      }}
                    />
                    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="medium">
                      <Layout.Vertical>
                        <FormInput.Text
                          className={cx({
                            [css.noSpacing]: formValues.gitConnector?.connector?.spec?.type !== GitUrlType.REPO
                          })}
                          name="repo"
                          label={getString('common.repositoryName')}
                          disabled={formValues.gitConnector?.connector?.spec?.type === GitUrlType.REPO}
                          onChange={e => {
                            formValues.gitConnector?.connector.identifier &&
                              debounceFetchBranches(
                                getConnectorIdentifierWithScope(
                                  getScopeFromDTO(formValues?.gitConnector?.connector as ScopedObjectDTO),
                                  formValues?.gitConnector?.connector?.identifier
                                ),
                                getRepoUrlForConnectorType(formValues, (e.target as HTMLInputElement)?.value)
                              )
                            setTestStatus(TestStatus.NOT_INITIATED)
                          }}
                        />
                        {formValues.gitConnector?.connector?.spec?.type !== GitUrlType.REPO ? (
                          <Text
                            padding={{ top: 'xsmall', bottom: 'medium' }}
                            color={Color.GREY_250}
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={getRepoUrlForConnectorType(formValues)}
                          >
                            {getRepoUrlForConnectorType(formValues)}
                          </Text>
                        ) : null}
                      </Layout.Vertical>
                      {formValues.gitConnector?.connector?.identifier ? (
                        <Container flex className={css.testConnection}>
                          <TestConnectionWidget
                            testStatus={testStatus}
                            onTest={() => {
                              return testConnection({
                                identifier: defaultTo(formValues.gitConnector?.connector.identifier, ''),
                                _orgIdentifier: formValues.gitConnector?.connector?.orgIdentifier,
                                _projectIdentifier: formValues.gitConnector?.connector?.projectIdentifier,
                                repoURL: getRepoUrlForConnectorType(formValues)
                              })
                            }}
                          />
                        </Container>
                      ) : null}
                    </Layout.Horizontal>
                    <FormInput.Text
                      className={cx(css.placeholder, { [css.noSpacing]: formValues.rootfolder })}
                      name="rootfolder"
                      label={getString('gitsync.selectHarnessFolder')}
                      placeholder={HARNESS_FOLDER_NAME_PLACEHOLDER}
                    />
                    <Text
                      padding={{ top: 'xsmall', bottom: 'medium' }}
                      color={Color.GREY_250}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={getCompleteGitPath(
                        getRepoUrlForConnectorType(formValues),
                        formValues.rootfolder,
                        HARNESS_FOLDER_SUFFIX
                      )}
                    >
                      {getCompleteGitPath(
                        getRepoUrlForConnectorType(formValues),
                        formValues.rootfolder,
                        HARNESS_FOLDER_SUFFIX
                      )}
                    </Text>
                    <Layout.Horizontal>
                      <FormInput.Select
                        name="branch"
                        disabled={loadingBranchList}
                        items={branchSelectOptions}
                        label={getString('gitsync.selectDefaultBranch')}
                        selectProps={{ usePortal: true, popoverClassName: css.gitBranchSelectorPopover }}
                      />
                      {loadingBranchList ? (
                        <Layout.Horizontal spacing="small" flex padding={{ top: 'xsmall', left: 'xsmall' }}>
                          <Icon name="steps-spinner" size={18} color={Color.PRIMARY_7} />
                          <Text>{getString('gitsync.fetchingBranches').concat('...')}</Text>
                        </Layout.Horizontal>
                      ) : null}
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </Container>

                <Layout.Horizontal padding={{ top: 'small', left: 'xlarge' }} spacing="medium">
                  <Button
                    className={css.formButton}
                    type="submit"
                    intent="primary"
                    text={isNewUser ? getString('continue') : getString('save')}
                    disabled={creatingGitSync || testing || testStatus === TestStatus.FAILED}
                  />
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
        <Container width={'40%'}>
          <Layout.Vertical background={Color.GREY_100} padding="xxlarge" className={css.helpText}>
            <Layout.Horizontal padding={{ bottom: 'xxxlarge' }}>
              <Icon size={28} name="help"></Icon>
              <Container>
                <Text
                  margin={{ bottom: 'small' }}
                  font={{ size: 'medium', weight: 'semi-bold' }}
                  color={Color.GREY_700}
                >
                  {getString('gitsync.harnessFolderHeader')}
                </Text>
                <Text> {getString('gitsync.harnessFolderText')}</Text>
              </Container>
            </Layout.Horizontal>
            <Layout.Horizontal>
              <Icon size={28} name="help"></Icon>
              <Container>
                <Text
                  margin={{ bottom: 'small' }}
                  font={{ size: 'medium', weight: 'semi-bold' }}
                  color={Color.GREY_700}
                >
                  {getString('connecectorHelpHeader')}
                </Text>
                <Text> {getString('connecectorHelpText')}</Text>
              </Container>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default GitSyncRepoForm
