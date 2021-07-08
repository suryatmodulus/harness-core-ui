import React, { useState } from 'react'
import { Container, Button, Layout } from '@wings-software/uicore'
import { parse } from 'yaml'
import { useHistory, useParams } from 'react-router-dom'

import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { PageHeader } from '@common/components/Page/PageHeader'
import { useStrings } from 'framework/strings'
import type { SnippetFetchResponse, YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import {
  usePostSecretViaYaml,
  useGetYamlSchema,
  ResponseJsonNode,
  useGetYamlSnippetMetadata,
  useGetYamlSnippet
} from 'services/cd-ng'
import { useConfirmationDialog, useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { UseGetMockData } from '@common/utils/testUtils'
import { getSnippetTags } from '@common/utils/SnippetUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { yamlStringify } from '@common/utils/YamlHelperMethods'

const CreateSecretFromYamlPage: React.FC<{ mockSchemaData?: UseGetMockData<ResponseJsonNode> }> = props => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  useDocumentTitle(getString('createSecretYAML.createSecret'))
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()
  const [snippetFetchResponse, setSnippetFetchResponse] = React.useState<SnippetFetchResponse>()
  const { mutate: createSecret } = usePostSecretViaYaml({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
  const redirectToSecretsPage = (): void => {
    history.push(routes.toSecrets({ accountId, projectIdentifier, orgIdentifier, module }))
  }
  const { openDialog: openConfirmationDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('continueWithoutSavingText'),
    titleText: getString('continueWithoutSavingTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        redirectToSecretsPage()
      }
    }
  })

  const handleCancel = (): void => {
    if (yamlHandler?.getLatestYaml()) {
      openConfirmationDialog()
    } else {
      redirectToSecretsPage()
    }
  }
  const handleCreate = async (): Promise<void> => {
    const yamlData = yamlHandler?.getLatestYaml()
    let jsonData
    try {
      jsonData = parse(yamlData || '')?.secret
    } catch (err) {
      showError(err.message)
    }

    if (yamlData && jsonData) {
      try {
        await createSecret(yamlData as any)
        showSuccess(getString('createSecretYAML.secretCreated'))
        history.push(
          routes.toSecretDetails({
            secretId: jsonData['identifier'],
            accountId,
            orgIdentifier,
            projectIdentifier,
            module
          })
        )
      } catch (err) {
        showError(err.data?.message || err.message)
      }
    } else {
      showError(getString('createSecretYAML.invalidSecret'))
    }
  }

  const { data: secretSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Secrets'
    },
    mock: props.mockSchemaData
  })
  const { data: snippetData } = useGetYamlSnippetMetadata({
    queryParams: {
      tags: getSnippetTags('Secrets')
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })
  const {
    data: snippet,
    refetch,
    cancel,
    loading: isFetchingSnippet,
    error: errorFetchingSnippet
  } = useGetYamlSnippet({
    identifier: '',
    lazy: true
  })

  React.useEffect(() => {
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
    await refetch({
      pathParams: {
        identifier
      }
    })
  }
  return (
    <Container>
      <PageHeader title={getString('createSecretYAML.createSecret')} />
      <Container padding="xlarge">
        <YAMLBuilder
          fileName={getString('createSecretYAML.newSecret')}
          entityType={'Secrets'}
          bind={setYamlHandler}
          height="calc(100vh - 250px)"
          schema={secretSchema?.data}
          onSnippetCopy={onSnippetCopy}
          snippetFetchResponse={snippetFetchResponse}
          snippets={snippetData?.data?.yamlSnippets}
          showSnippetSection={false}
        />
        <Layout.Horizontal spacing="large">
          <Button
            text={getString('createSecretYAML.create')}
            intent="primary"
            margin={{ top: 'xlarge' }}
            onClick={handleCreate}
          />
          <Button text={getString('cancel')} intent="none" margin={{ top: 'xlarge' }} onClick={handleCancel} />
        </Layout.Horizontal>
      </Container>
    </Container>
  )
}

export default CreateSecretFromYamlPage
