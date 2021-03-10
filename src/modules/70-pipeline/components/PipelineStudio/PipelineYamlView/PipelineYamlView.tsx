import React from 'react'
import { useParams } from 'react-router-dom'
import { isEqual, isEqualWith, isNil } from 'lodash-es'
import { parse, stringify } from 'yaml'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { SnippetFetchResponse, YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { PageSpinner } from '@common/components'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useGetYamlSnippet, useGetYamlSnippetMetadata } from 'services/cd-ng'
import { getSnippetTags } from '@common/utils/SnippetUtils'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { useVariablesExpression } from '../PiplineHooks/useVariablesExpression'
import { usePipelineSchema } from '../PipelineSchema/PipelineSchemaContext'
import css from './PipelineYamlView.module.scss'

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */
export const YamlBuilderMemo = React.memo(YAMLBuilder, (prevProps, nextProps) => {
  if (isNil(prevProps.schema) && !isNil(nextProps.schema)) {
    return false
  }
  return isEqualWith(nextProps, prevProps, (_arg1, _arg2, key) => {
    if (['existingJSON', 'onExpressionTrigger', 'onSnippetCopy', 'schema'].indexOf(key as string) > -1) {
      return true
    }
  })
})

let Interval: number | undefined
const PipelineYamlView: React.FC = () => {
  const [snippetFetchResponse, setSnippetFetchResponse] = React.useState<SnippetFetchResponse>()
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()
  const {
    state: {
      pipeline,
      pipelineView: { isDrawerOpened }
    },
    stepsFactory,
    updatePipeline,
    setYamlHandler: setYamlHandlerContext
  } = React.useContext(PipelineContext)
  const { pipelineSchema } = usePipelineSchema()
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
  const { expressions } = useVariablesExpression()
  // setup polling
  React.useEffect(() => {
    try {
      if (yamlHandler && !isDrawerOpened) {
        Interval = window.setInterval(() => {
          const pipelineFromYaml = parse(yamlHandler.getLatestYaml())?.pipeline
          if (!isEqual(pipeline, pipelineFromYaml)) {
            updatePipeline(pipelineFromYaml)
          }
        }, POLL_INTERVAL)
        return () => {
          window.clearInterval(Interval)
        }
      }
    } catch (e) {
      // Ignore Error
    }
  }, [yamlHandler, pipeline, isDrawerOpened])

  const { data: snippet, refetch, cancel, loading: isFetchingSnippet, error: errorFetchingSnippet } = useGetYamlSnippet(
    {
      identifier: '',
      requestOptions: { headers: { accept: 'application/json' } },
      lazy: true,
      queryParams: {
        projectIdentifier,
        orgIdentifier,
        scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
      }
    }
  )

  React.useEffect(() => {
    if (yamlHandler) {
      setYamlHandlerContext(yamlHandler)
    }
  }, [yamlHandler, setYamlHandlerContext])

  React.useEffect(() => {
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
    await refetch({
      pathParams: {
        identifier
      }
    })
  }

  return (
    <div className={css.yamlBuilder}>
      {isFetchingSnippets ? (
        <PageSpinner />
      ) : (
        <>
          {!isDrawerOpened && (
            <YamlBuilderMemo
              fileName="Pipeline.yaml"
              entityType="Pipelines"
              existingJSON={{ pipeline }}
              bind={setYamlHandler}
              onSnippetCopy={onSnippetCopy}
              onExpressionTrigger={() => {
                return Promise.resolve(expressions.map(item => ({ label: item, insertText: `${item}>`, kind: 1 })))
              }}
              showIconMenu={true}
              snippetFetchResponse={snippetFetchResponse}
              yamlSanityConfig={{ removeEmptyString: false, removeEmptyObject: false, removeEmptyArray: false }}
              height={'calc(100vh - 150px)'}
              invocationMap={stepsFactory.getInvocationMap()}
              showSnippetSection={true}
              schema={pipelineSchema?.data}
              snippets={snippetMetaData?.data?.yamlSnippets}
            />
          )}
        </>
      )}
    </div>
  )
}

export default PipelineYamlView
