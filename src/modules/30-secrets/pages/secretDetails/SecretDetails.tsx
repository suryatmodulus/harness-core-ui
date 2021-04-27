import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { parse, stringify } from 'yaml'
import cx from 'classnames'
import { omit, without } from 'lodash-es'
import { Layout, Text, Color, Container, Button } from '@wings-software/uicore'

import {
  useGetSecretV2,
  SecretTextSpecDTO,
  usePutSecretViaYaml,
  ResponseSecretResponseWrapper,
  useGetYamlSchema,
  useGetYamlSnippetMetadata,
  useGetYamlSnippet,
  Error
} from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { PageError } from '@common/components/Page/PageError'
import { PageHeader } from '@common/components/Page/PageHeader'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { SnippetFetchResponse, YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useConfirmationDialog, useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'

import type { UseGetMockData } from '@common/utils/testUtils'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import type { SecretIdentifiers } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type { ModulePathParams, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import { getSnippetTags } from '@common/utils/SnippetUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import ViewSecretDetails from './views/ViewSecretDetails'

import i18n from './SecretDetails.i18n'
import css from './SecretDetails.module.scss'

enum Mode {
  VISUAL,
  YAML
}
interface SecretDetailsProps {
  mockSecretDetails?: UseGetMockData<ResponseSecretResponseWrapper>
  mockKey?: ResponseSecretResponseWrapper
  mockPassword?: ResponseSecretResponseWrapper
  mockPassphrase?: ResponseSecretResponseWrapper
}

const SecretDetails: React.FC<SecretDetailsProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier, module, secretId } = useParams<
    ProjectPathProps & SecretsPathProps & ModulePathParams
  >()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [edit, setEdit] = useState<boolean>()
  const [mode, setMode] = useState<Mode>(Mode.VISUAL)
  const [fieldsRemovedFromYaml, setFieldsRemovedFromYaml] = useState(['draft', 'createdAt', 'updatedAt'])
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [snippetFetchResponse, setSnippetFetchResponse] = React.useState<SnippetFetchResponse>()
  const { loading, data, refetch, error } = useGetSecretV2({
    identifier: secretId,
    queryParams: { accountIdentifier: accountId, projectIdentifier: projectIdentifier, orgIdentifier: orgIdentifier },
    mock: props.mockSecretDetails
  })
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

  const { openCreateSSHCredModal } = useCreateSSHCredModal({ onSuccess: refetch })
  const { openCreateSecretModal } = useCreateUpdateSecretModal({ onSuccess: refetch })
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
        showSuccess(i18n.updateSuccess)
        setEdit(false)
        refetch()
      } catch (err) {
        showError(err.data.message)
      }
    }
  }
  useDocumentTitle([secretData?.secret.name || '', getString('common.secrets')])

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
      snippetStr = snippet?.data ? stringify(snippet.data, { indent: 4 }) : ''
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
        refetch()
      }
    }
  })

  const resetEditor = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault()
    event.stopPropagation()
    openDialog()
  }

  if (loading) return <PageSpinner />
  if (error) return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  if (!secretData) return <div>{getString('noData')}</div>

  return (
    <>
      <PageHeader
        title={
          <Layout.Vertical>
            <Breadcrumbs
              links={[
                {
                  url: routes.toResourcesConnectors({ accountId, orgIdentifier, projectIdentifier, module }),
                  label: getString('resources')
                },
                {
                  url: routes.toResourcesSecrets({ accountId, orgIdentifier, projectIdentifier, module }),
                  label: getString('common.secrets')
                },
                {
                  url: '#',
                  label: data?.data?.secret.name || getString('secretDetails')
                }
              ]}
            />
            <Text font={{ size: 'medium' }} color={Color.BLACK}>
              {data?.data?.secret.name || getString('secretDetails')}
            </Text>
          </Layout.Vertical>
        }
      />
      <Container padding={{ top: 'large', left: 'huge', right: 'huge' }}>
        <Container padding={{ bottom: 'large' }}>
          {edit ? null : (
            <Layout.Horizontal flex>
              <div className={css.switch}>
                <div
                  className={cx(css.item, { [css.selected]: mode === Mode.VISUAL })}
                  onClick={() => setMode(Mode.VISUAL)}
                >
                  {getString('visual')}
                </div>
                <div
                  className={cx(css.item, { [css.selected]: mode === Mode.YAML })}
                  onClick={() => setMode(Mode.YAML)}
                >
                  {getString('yaml')}
                </div>
              </div>
              <RbacButton
                text={getString('editDetails')}
                icon="edit"
                onClick={() => {
                  mode === Mode.VISUAL
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
                  resourceScope: {
                    accountIdentifier: accountId,
                    orgIdentifier,
                    projectIdentifier
                  },
                  resource: {
                    resourceType: ResourceType.SECRET,
                    resourceIdentifier: secretData.secret.identifier
                  }
                }}
              />
            </Layout.Horizontal>
          )}
        </Container>
        {mode === Mode.YAML ? (
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
                showSnippetSection={false}
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
