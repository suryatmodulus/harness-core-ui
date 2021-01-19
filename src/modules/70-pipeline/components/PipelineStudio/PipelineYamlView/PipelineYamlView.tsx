import React from 'react'
import { useParams } from 'react-router-dom'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useGetYamlSchema } from 'services/pipeline-ng'
import { PageSpinner } from '@common/components'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useGetYamlSnippetMetadata } from 'services/cd-ng'
import { getSnippetTags } from '@common/utils/SnippetUtils'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { PipelineContext } from '../PipelineContext/PipelineContext'

import css from './PipelineYamlView.module.scss'

const PipelineYamlView: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()
  const {
    state: { pipeline },
    stepsFactory,
    setYamlHandler: setYamlHandlerContext
  } = React.useContext(PipelineContext)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const { data: snippetMetaData, loading: isFetchingSnippets } = useGetYamlSnippetMetadata({
    queryParams: {
      tags: getSnippetTags('Pipelines', module)
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    requestOptions: { headers: { accept: 'application/json' } }
  })

  React.useEffect(() => {
    if (yamlHandler) {
      setYamlHandlerContext(yamlHandler)
    }
  }, [yamlHandler, setYamlHandlerContext])

  const { loading, data: pipelineSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Pipelines',
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  return (
    <div className={css.yamlBuilder}>
      {loading || isFetchingSnippets ? (
        <PageSpinner />
      ) : (
        <YAMLBuilder
          fileName="Pipeline.yaml"
          entityType="Pipelines"
          existingJSON={{ pipeline }}
          bind={setYamlHandler}
          showIconMenu={true}
          height={'calc(100vh - 200px)'}
          invocationMap={stepsFactory.getInvocationMap()}
          showSnippetSection={true}
          schema={pipelineSchema?.data}
          snippets={snippetMetaData?.data?.yamlSnippets}
          skipValidation={true}
        />
      )}
    </div>
  )
}

export default PipelineYamlView
