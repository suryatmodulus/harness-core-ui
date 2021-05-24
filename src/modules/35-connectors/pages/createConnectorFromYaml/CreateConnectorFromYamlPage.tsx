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
import { useCreateConnector, useGetYamlSchema } from 'services/cd-ng'
import { useToaster, useConfirmationDialog, StringUtils } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { NameIdDescriptionTags, PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm from '@common/components/GitContextForm/GitContextForm'
import useSaveToGitDialog from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { sanitize } from '@common/utils/JSONUtils'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'

import css from './CreateConnectorFromYamlPage.module.scss'

type CreateConnectorFromYamlModalType = {
  identifier: string
  name: string
  description: string
  tags: Record<string, string>
  repo: string
  branch: string
}

const CreateConnectorFromYamlPage: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    accountId: string
    projectIdentifier: string
    orgIdentifier: string
  }>()
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const [editorContent, setEditorContent] = React.useState<Record<string, any>>()
  const { getString } = useStrings()
  const [hasConnectorChanged, setHasConnectorChanged] = useState<boolean>(false)
  const { isGitSyncEnabled } = useAppStore()
  const [gitDetails, setGitDetails] = useState<CreateConnectorFromYamlModalType>()
  const [registeredWithGit, setRegisteredWithGit] = useState<boolean>()

  const onConnectorChange = (isEditorDirty: boolean): void => {
    if (isGitSyncEnabled && !registeredWithGit) {
      showModal()
    }
    setHasConnectorChanged(isEditorDirty)
  }

  const rerouteBasedOnContext = (connectorId: string): void => {
    if (projectIdentifier && orgIdentifier) {
      history.push(routes.toCDResourcesConnectorDetails({ projectIdentifier, orgIdentifier, connectorId, accountId }))
    } else if (orgIdentifier) {
      history.push(routes.toOrgResourcesConnectorDetails({ orgIdentifier, connectorId, accountId }))
    } else {
      history.push(routes.toResourcesConnectorDetails({ connectorId, accountId }))
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (_gitDetails: SaveToGitFormInterface): Promise<void> => handleCreate(_gitDetails),
    onClose: noop
  })

  const handleCreate = async (__gitDetails?: SaveToGitFormInterface): Promise<void> => {
    const yamlData = yamlHandler?.getLatestYaml()
    let jsonData
    try {
      jsonData = parse(yamlData || '')
    } catch (err) {
      showError(err.message)
    }
    if (yamlData && jsonData) {
      try {
        const queryParams = __gitDetails ? { accountIdentifier: accountId, ...__gitDetails } : {}
        const { status } = await createConnector(jsonData, { queryParams })
        if (status !== 'ERROR') {
          showSuccess(getString('connectors.successfullyCreated'))
          rerouteBasedOnContext(jsonData.connector?.['identifier'])
        } else {
          showError(getString('somethingWentWrong'))
        }
      } catch (err) {
        if (err?.data?.message) {
          showError(err?.data?.message)
          return
        }
        if (err?.message) {
          showError(err?.message)
          return
        }
      }
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
          <Button icon="cross" minimal className={css.closeModal} onClick={hideModal} />
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
                  setGitDetails(values)
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
                          gitDetails={pick(formikProps.initialValues, ['repo', 'branch'])}
                        />
                      </GitSyncStoreProvider>
                    ) : null}
                    <Layout.Horizontal spacing="small" padding={{ top: 'small' }}>
                      <Button intent="primary" className={css.startBtn} type="submit" text={getString('start')} />
                      <Button className={css.startBtn} text={getString('cancel')} onClick={hideModal} />
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
              {gitDetails?.repo ? (
                <Layout.Horizontal spacing="small">
                  <Icon name="repository" margin={{ left: 'large' }}></Icon>
                  <Text>{gitDetails.repo}</Text>
                </Layout.Horizontal>
              ) : null}
              {gitDetails?.branch ? (
                <Layout.Horizontal spacing="small">
                  <Icon name="git-new-branch" margin={{ left: 'large' }}></Icon>
                  <Text>{gitDetails.branch}</Text>
                </Layout.Horizontal>
              ) : null}
            </Layout.Horizontal>
          </Layout.Horizontal>
        }
      />
      <PageBody>
        <Container padding="xlarge">
          {creating ? <PageSpinner /> : null}
          <YAMLBuilder
            fileName={gitDetails?.name ?? getString('newConnector')}
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
                isGitSyncEnabled
                  ? openSaveToGitDialog(false, {
                      gitDetails,
                      type: 'Connectors',
                      name: `${gitDetails?.name ?? getString('newConnector')}.yaml`,
                      identifier: gitDetails?.identifier || ''
                    })
                  : handleCreate()
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
