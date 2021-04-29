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
  SelectOption
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { noop, pick, debounce } from 'lodash-es'
import { useToaster, StringUtils } from '@common/exports'
import { usePostGitSync, GitSyncConfig, getListOfBranchesByConnectorPromise } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { getConnectorDisplayName, GitUrlType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import {
  ConnectorReferenceField,
  ConnectorSelectedValue
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ConnectorCardInterface, gitCards } from '@gitsync/common/gitSyncUtils'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import css from './GitSyncRepoForm.module.scss'

interface GitSyncRepoFormProps {
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

const GitSyncRepoForm: React.FC<ModalConfigureProps & GitSyncRepoFormProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = props
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const [branchSelectOptions, setBranchSelectOptions] = React.useState<SelectOption[]>([])
  const [loadingBranchList, setLoadingBranchList] = React.useState<boolean>(false)
  const { getString } = useStrings()
  const { showSuccess } = useToaster()

  const { mutate: createGitSyncRepo, loading: creatingGitSync } = usePostGitSync({
    queryParams: { accountIdentifier: accountId }
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

  const handleCreate = async (data: GitSyncConfig): Promise<void> => {
    try {
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
    }).then(response => {
      setLoadingBranchList(false)
      setBranchSelectOptions(
        response.data?.length
          ? response.data.map((branch: string) => {
              return {
                label: branch || '',
                value: branch || ''
              }
            })
          : []
      )
    })
  }, 1000) // Fetching branches after user input of repoUrl

  return (
    <Container height={'inherit'} className={css.modalContainer} margin="large">
      <Text font={{ size: 'large', weight: 'semi-bold' }} color={Color.GREY_800}>
        {getString('enableGitExperience')}
      </Text>
      <ModalErrorHandler bind={setModalErrorHandler} style={{ marginBottom: 'var(--spacing-medium)' }} />
      <Layout.Horizontal>
        <Container width={'60%'}>
          <Formik<GitSyncFormInterface>
            initialValues={defaultInitialFormData}
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
              repo: Yup.string().trim().required(getString('validation.repositoryName')),
              branch: Yup.string().trim().required(getString('validation.branchName'))
            })}
            onSubmit={formData => {
              const gitSyncRepoData = {
                ...pick(formData, ['gitConnectorType', 'repo', 'branch', 'name', 'identifier']),
                gitConnectorRef: (formData.gitConnector as ConnectorSelectedValue)?.value,
                gitSyncFolderConfigDTOs: [
                  {
                    rootFolder: formData.rootfolder,
                    isDefault: true
                  }
                ],
                projectIdentifier: projectIdentifier,
                orgIdentifier: orgIdentifier
              }

              if (props.isEditMode) {
                // handleUpdate(data, formData) Edit of gitSync is not supported now
              } else {
                handleCreate(gitSyncRepoData)
              }
            }}
          >
            {({ values: formValues, setFieldValue }) => (
              <FormikForm>
                <Container className={css.formBody}>
                  <Text font={{ size: 'medium', weight: 'semi-bold' }} margin={{ top: 'large', bottom: 'large' }}>
                    {getString('selectGitProvider')}
                  </Text>
                  <Layout.Horizontal margin={{ bottom: 'large' }}>
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
                  <Container className={css.formElm}>
                    <NameId identifierProps={{ inputName: 'name' }} />
                  </Container>

                  <ConnectorReferenceField
                    name="gitConnector"
                    width={350}
                    type={connectorType}
                    selected={formValues.gitConnector}
                    label={getString('selectGitConnectorTypeLabel', { type: getConnectorDisplayName(connectorType) })}
                    placeholder={getString('select')}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    onChange={(value, scope) => {
                      setFieldValue('gitConnector', {
                        label: value.name || '',
                        value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                        scope: scope,
                        live: value?.status?.status === 'SUCCESS',
                        connector: value
                      })
                      setFieldValue('repo', value?.spec?.url)

                      if (value?.spec?.type === GitUrlType.REPO) {
                        debounceFetchBranches(value?.identifier, value?.spec?.url)
                      }
                    }}
                  />

                  <Layout.Horizontal>
                    <FormInput.Text
                      name="repo"
                      label={getString('repositoryUrlLabel')}
                      disabled={formValues.gitConnector?.connector?.spec?.type === GitUrlType.REPO}
                      onChange={e => {
                        formValues.gitConnector?.connector.identifier &&
                          debounceFetchBranches(
                            formValues.gitConnector.connector.identifier,
                            (e.target as HTMLInputElement)?.value
                          )
                      }}
                    />
                    {/* Todo: Add repo test after behaviour is finalized */}
                  </Layout.Horizontal>

                  <FormInput.Text name="rootfolder" label={getString('gitsync.rootfolderLabel')} />
                  <FormInput.Select
                    name="branch"
                    disabled={loadingBranchList}
                    items={branchSelectOptions}
                    label={getString('common.git.branchName')}
                  />
                </Container>

                <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                  <Button
                    className={css.formButton}
                    type="submit"
                    intent="primary"
                    text={getString('save')}
                    disabled={creatingGitSync}
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
          <Layout.Horizontal background={Color.GREY_200} padding="large" border={{ radius: 8 }}>
            <Icon size={28} name="help"></Icon>
            <Container>
              <Text margin={{ bottom: 'small' }} font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_700}>
                {getString('connecectorHelpHeader')}
              </Text>
              <Text> {getString('connecectorHelpText')}</Text>
            </Container>
          </Layout.Horizontal>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default GitSyncRepoForm
