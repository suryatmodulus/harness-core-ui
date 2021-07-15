import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { omit, without } from 'lodash-es'
import { Layout, Container, Button } from '@wings-software/uicore'

import {
  SecretTextSpecDTO,
  usePutSecretViaYaml,
  ResponseSecretResponseWrapper,
  useGetYamlSchema,
  useGetYamlSnippetMetadata,
  useGetYamlSnippet
} from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import { PageHeader } from '@common/components/Page/PageHeader'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { SnippetFetchResponse, YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useConfirmationDialog, useToaster } from '@common/exports'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import type { SecretIdentifiers } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type { ModulePathParams, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import { getSnippetTags } from '@common/utils/SnippetUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import VisualYamlToggle from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import ViewSecretDetails from './views/ViewSecretDetails'
import './SecretDetails.module.scss'

interface SecretDetailsProps {
  secretData?: ResponseSecretResponseWrapper
  refetch?: () => void
}

const yamlSanityConfig = {
  removeEmptyString: false
}

const SecretDetails: React.FC<SecretDetailsProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier, secretId } = useParams<
    ProjectPathProps & SecretsPathProps & ModulePathParams
  >()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [edit, setEdit] = useState<boolean>()
  const [mode, setMode] = useState<SelectedView>(SelectedView.VISUAL)
  const [fieldsRemovedFromYaml, setFieldsRemovedFromYaml] = useState(['draft', 'createdAt', 'updatedAt'])
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [snippetFetchResponse, setSnippetFetchResponse] = React.useState<SnippetFetchResponse>()
  const data = props.secretData
  const { mutate: updateSecretYaml } = usePutSecretViaYaml({
    identifier: secretId,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    // this is required to make sure backend understands the content type correctly
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
  const { data: snippetData } = useGetYamlSnippetMetadata({
    queryParams: {
      tags: getSnippetTags('Secrets')
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })
  const { data: secretSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Secrets'
    }
  })

  const [secretData, setSecretData] = useState(data?.data)

  const { openCreateSSHCredModal } = useCreateSSHCredModal({ onSuccess: props.refetch })
  const { openCreateSecretModal } = useCreateUpdateSecretModal({ onSuccess: props.refetch })
  const handleSaveYaml = async (): Promise<void> => {
    const yamlData = yamlHandler?.getLatestYaml()
    let jsonData
    try {
      jsonData = parse(yamlData || '')
    } catch (err) {
      showError(err.message)
    }

    if (yamlData && jsonData) {
      try {
        await updateSecretYaml(yamlData as any)
        showSuccess(getString('secret.updateSuccess'))
        setEdit(false)
        props.refetch?.()
      } catch (err) {
        showError(err.data?.errors[0]?.error || err.data.message)
      }
    }
  }
  useDocumentTitle([getString('overview'), secretData?.secret.name || '', getString('common.secrets')])

  useEffect(() => {
    setSecretData(data?.data)
  }, [data?.data])
  const {
    data: snippet,
    refetch: refetchSnippet,
    cancel,
    loading: isFetchingSnippet,
    error: errorFetchingSnippet
  } = useGetYamlSnippet({
    identifier: '',
    lazy: true
  })

  useEffect(() => {
    let snippetStr = ''
    try {
      snippetStr = snippet?.data ? yamlStringify(snippet.data, { indent: 4 }) : ''
    } catch {
      /**/
    }
    setSnippetFetchResponse({
      snippet: snippetStr,
      loading: isFetchingSnippet,
      error: errorFetchingSnippet
    })
  }, [isFetchingSnippet])

  const onSnippetCopy = async (identifier: string): Promise<void> => {
    cancel()
    await refetchSnippet({
      pathParams: {
        identifier
      }
    })
  }
  useEffect(() => {
    if (secretData?.secret.type === 'SecretText') {
      switch ((secretData?.secret.spec as SecretTextSpecDTO)?.valueType) {
        case 'Inline':
          setFieldsRemovedFromYaml([...fieldsRemovedFromYaml, 'secret.spec.value'])
          break
        case 'Reference':
          // 'value' field should be persisted in visual->yaml transistion for reference type
          setFieldsRemovedFromYaml(without(fieldsRemovedFromYaml, 'secret.spec.value'))
          break
      }
    }
  }, [secretData])

  const { openDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('continueWithoutSavingText'),
    titleText: getString('continueWithoutSavingTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        setEdit(false)
        props.refetch?.()
      }
    }
  })

  const resetEditor = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault()
    event.stopPropagation()
    openDialog()
  }
  if (!secretData)
    return (
      <Container flex={{ align: 'center-center' }} padding="xxlarge">
        {getString('noData')}
      </Container>
    )
  return (
    <>
      <PageHeader size="standard" title={getString('overview')} />
      <Container padding={{ top: 'large', left: 'huge', right: 'huge' }}>
        <Container padding={{ bottom: 'large' }}>
          {edit ? null : (
            <Layout.Horizontal flex>
              <VisualYamlToggle
                initialSelectedView={mode}
                beforeOnChange={(nextMode, callback) => {
                  setMode(nextMode)
                  callback(nextMode)
                }}
              />
              <RbacButton
                text={getString('editDetails')}
                icon="edit"
                onClick={() => {
                  mode === SelectedView.VISUAL
                    ? secretData.secret.type === 'SSHKey'
                      ? openCreateSSHCredModal(data?.data?.secret)
                      : openCreateSecretModal(secretData.secret.type, {
                          identifier: secretData.secret?.identifier,
                          orgIdentifier: secretData.secret?.orgIdentifier,
                          projectIdentifier: secretData.secret?.projectIdentifier
                        } as SecretIdentifiers)
                    : setEdit(true)
                }}
                permission={{
                  permission: PermissionIdentifier.UPDATE_SECRET,
                  resource: {
                    resourceType: ResourceType.SECRET,
                    resourceIdentifier: secretData.secret.identifier
                  }
                }}
              />
            </Layout.Horizontal>
          )}
        </Container>
        {mode === SelectedView.YAML ? (
          <Container>
            {edit && (
              <YamlBuilder
                entityType={'Secrets'}
                fileName={`${secretData.secret.name}.yaml`}
                existingJSON={omit(secretData, fieldsRemovedFromYaml)}
                bind={setYamlHandler}
                onSnippetCopy={onSnippetCopy}
                snippetFetchResponse={snippetFetchResponse}
                schema={secretSchema?.data}
                isReadOnlyMode={false}
                snippets={snippetData?.data?.yamlSnippets}
                yamlSanityConfig={yamlSanityConfig}
              />
            )}
            {!edit && (
              <YamlBuilder
                entityType={'Secrets'}
                existingJSON={omit(secretData, fieldsRemovedFromYaml)}
                fileName={`${secretData.secret.name}.yaml`}
                isReadOnlyMode={true}
                showSnippetSection={false}
                onEnableEditMode={() => setEdit(true)}
                yamlSanityConfig={yamlSanityConfig}
              />
            )}
            {edit && (
              <Layout.Horizontal spacing="medium">
                <Button text={getString('cancel')} margin={{ top: 'large' }} onClick={resetEditor} />
                <Button intent="primary" text={getString('save')} onClick={handleSaveYaml} margin={{ top: 'large' }} />
              </Layout.Horizontal>
            )}
          </Container>
        ) : (
          //View in Visual Mode
          <ViewSecretDetails secret={secretData} />
        )}
      </Container>
    </>
  )
}

export default SecretDetails
