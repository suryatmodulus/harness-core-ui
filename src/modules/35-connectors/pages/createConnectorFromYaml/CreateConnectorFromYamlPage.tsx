import React, { useState } from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import { noop, omit, pick } from 'lodash-es'
import * as Yup from 'yup'
import { Container, Button, Layout, useModalHook, Formik, FormikForm, Color, Text, Icon } from '@wings-software/uicore'
import { parse } from 'yaml'
import { useHistory, useParams } from 'react-router-dom'

import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { PageBody } from '@common/components/Page/PageBody'
import { PageHeader } from '@common/components/Page/PageHeader'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { EntityGitDetails, useCreateConnector, useGetYamlSchema } from 'services/cd-ng'
import { useToaster, useConfirmationDialog, StringUtils } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm from '@common/components/GitContextForm/GitContextForm'
import { useSaveToGitDialog, UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { sanitize } from '@common/utils/JSONUtils'
import type { SaveToGitFormInterface, GitResourceInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { Entities } from '@common/interfaces/GitSyncInterface'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { shouldShowError } from '@common/utils/errorUtils'
import css from './CreateConnectorFromYamlPage.module.scss'

const CreateConnectorFromYamlPage: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const history = useHistory()
  const { showError, showSuccess } = useToaster()
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const [editorContent, setEditorContent] = React.useState<Record<string, any>>()
  const { getString } = useStrings()
  const [hasConnectorChanged, setHasConnectorChanged] = useState<boolean>(false)
  const { isGitSyncEnabled } = useAppStore()
  const [gitResourceDetails, setGitResourceDetails] = useState<GitResourceInterface>({
    gitDetails: {} as EntityGitDetails,
    type: Entities.CONNECTORS,
    name: getString('newConnector'),
    identifier: ''
  })
  const [registeredWithGit, setRegisteredWithGit] = useState<boolean>()

  const onConnectorChange = (isEditorDirty: boolean): void => {
    if (isGitSyncEnabled && !registeredWithGit) {
      showModal()
    }
    setHasConnectorChanged(isEditorDirty)
  }

  const rerouteBasedOnContext = (connectorId: string): void => {
    history.push(routes.toConnectorDetails({ connectorId, accountId, orgIdentifier, projectIdentifier, module }))
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (_gitDetails: SaveToGitFormInterface): Promise<UseSaveSuccessResponse> => handleCreate(_gitDetails),
    onClose: noop
  })

  const handleCreate = async (gitData?: SaveToGitFormInterface): Promise<UseSaveSuccessResponse> => {
    const yamlData = yamlHandler?.getLatestYaml()
    let connectorJSON
    try {
      connectorJSON = parse(yamlData || '')
    } catch (err) {
      return {
        status: 'ERROR'
      }
    }
    const queryParams = gitData ? { accountIdentifier: accountId, ...gitData } : {}
    const response = await createConnector(connectorJSON, { queryParams })
    return {
      status: response.status,
      nextCallback: rerouteBasedOnContext.bind(undefined, response?.data?.connector?.identifier || '')
    }
  }

  const { data: connectorSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Connectors',
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const { openDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('continueWithoutSavingText'),
    titleText: getString('continueWithoutSavingTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        setEditorContent({})
        setHasConnectorChanged(false)
        setRegisteredWithGit(false)
      }
    }
  })

  const resetEditor = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault()
    event.stopPropagation()
    openDialog()
  }

  React.useEffect(() => {
    if (isGitSyncEnabled) {
      showModal()
    }
  }, [])

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog style={{ width: 600, paddingBottom: 0 }} isOpen={true} className={Classes.DIALOG}>
        <Container className={css.container}>
          {/* <Button icon="cross" minimal className={css.closeModal} onClick={hideModal} /> */}
          <Text padding="large" font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
            {getString('connectors.createFromYaml')}
          </Text>
          <Container padding="xsmall" className={css.layout}>
            <div>
              <Formik
                initialValues={{ identifier: '', name: '', description: '', tags: {}, repo: '', branch: '' }}
                validationSchema={Yup.object().shape({
                  name: Yup.string().trim().required(getString('validation.connectorName')),
                  identifier: Yup.string().when('name', {
                    is: val => val?.length,
                    then: Yup.string()
                      .trim()
                      .required(getString('validation.identifierRequired'))
                      .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
                      .notOneOf(StringUtils.illegalIdentifiers)
                  })
                })}
                onSubmit={values => {
                  setRegisteredWithGit(true)
                  setGitResourceDetails(prevState => ({
                    ...prevState,
                    name: values.name,
                    gitDetails: { branch: values.branch, repoIdentifier: values.repo } as EntityGitDetails
                  }))
                  try {
                    setEditorContent({
                      connector: sanitize({ ...omit(values, 'repo', 'branch'), projectIdentifier, orgIdentifier })
                    })
                    setHasConnectorChanged(true)
                    hideModal()
                  } catch (e) {
                    showError(e)
                  }
                }}
              >
                {formikProps => (
                  <FormikForm>
                    <div className={css.formInput}>
                      <NameIdDescriptionTags
                        formikProps={formikProps}
                        identifierProps={{
                          inputLabel: getString('connectors.name'),
                          isIdentifierEditable: true
                        }}
                      />
                    </div>
                    {isGitSyncEnabled ? (
                      <GitSyncStoreProvider>
                        <GitContextForm
                          formikProps={formikProps}
                          gitDetails={{
                            ...pick(formikProps.initialValues, ['repo', 'branch']),
                            getDefaultFromOtherRepo: false
                          }}
                        />
                      </GitSyncStoreProvider>
                    ) : null}
                    <Layout.Horizontal spacing="small" padding={{ top: 'small' }}>
                      <Button intent="primary" className={css.startBtn} type="submit" text={getString('start')} />
                    </Layout.Horizontal>
                  </FormikForm>
                )}
              </Formik>
            </div>
          </Container>
        </Container>
      </Dialog>
    )
  }, [])

  return (
    <>
      <PageHeader
        title={
          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
            <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
              {getString('connectors.createFromYaml')}
            </Text>
            <Layout.Horizontal border={{ left: true, color: Color.GREY_300 }} spacing="medium">
              {gitResourceDetails.gitDetails?.repoIdentifier ? (
                <Layout.Horizontal spacing="small">
                  <Icon name="repository" margin={{ left: 'large' }}></Icon>
                  <Text>{gitResourceDetails.gitDetails?.repoIdentifier}</Text>
                </Layout.Horizontal>
              ) : null}
              {gitResourceDetails.gitDetails?.branch ? (
                <Layout.Horizontal spacing="small">
                  <Icon name="git-new-branch" margin={{ left: 'large' }}></Icon>
                  <Text>{gitResourceDetails.gitDetails?.branch}</Text>
                </Layout.Horizontal>
              ) : null}
            </Layout.Horizontal>
          </Layout.Horizontal>
        }
      />
      <PageBody>
        <Container padding="xlarge">
          <YAMLBuilder
            fileName={`${gitResourceDetails.name}`.concat('.yaml')}
            entityType="Connectors"
            bind={setYamlHandler}
            showIconMenu={true}
            schema={connectorSchema?.data}
            existingJSON={editorContent}
            height="calc(100vh - 250px)"
            onChange={onConnectorChange}
            showSnippetSection={false}
            isReadOnlyMode={creating}
          />
          <Layout.Horizontal spacing="small">
            <Button
              text={getString('saveChanges')}
              intent="primary"
              margin={{ top: 'xlarge' }}
              onClick={() => {
                // only sanitized yaml allowed, invalid yaml with/out schema issues should be rejected
                const errorMap = yamlHandler?.getYAMLValidationErrorMap?.()
                if (errorMap && errorMap.size > 0) {
                  showError(getString('yamlBuilder.yamlError'))
                } else {
                  isGitSyncEnabled
                    ? openSaveToGitDialog({
                        isEditing: false,
                        resource: gitResourceDetails,
                        payload: parse(yamlHandler?.getLatestYaml?.() || '')
                      })
                    : handleCreate() /* Handling non-git flow */
                        .then(res => {
                          if (res.status === 'SUCCESS') {
                            showSuccess(getString('connectors.createdSuccessfully'))
                          } else {
                            /* TODO handle error with API status 200 */
                          }
                        })
                        .catch(e => {
                          if (shouldShowError(e)) {
                            showError(e.data?.message || e.message)
                          }
                        })
                }
              }}
              disabled={!hasConnectorChanged}
            />
            {hasConnectorChanged ? (
              <Button text={getString('cancel')} margin={{ top: 'xlarge' }} onClick={resetEditor} />
            ) : null}
          </Layout.Horizontal>
        </Container>
      </PageBody>
    </>
  )
}

export default CreateConnectorFromYamlPage
