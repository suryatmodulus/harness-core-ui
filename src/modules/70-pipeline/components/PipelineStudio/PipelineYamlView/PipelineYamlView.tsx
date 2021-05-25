import React from 'react'
import { isEqual, isEqualWith, isNil, omit } from 'lodash-es'
import { parse } from 'yaml'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
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
    if (['existingJSON', 'onExpressionTrigger', 'schema'].indexOf(key as string) > -1) {
      return true
    }
  })
})

let Interval: number | undefined
const PipelineYamlView: React.FC = () => {
  const {
    state: {
      pipeline,
      pipelineView: { isDrawerOpened }
    },
    stepsFactory,
    isReadonly,
    updatePipeline,
    setYamlHandler: setYamlHandlerContext
  } = React.useContext(PipelineContext)
  const { pipelineSchema } = usePipelineSchema()
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()

  const { expressions } = useVariablesExpression()
  const expressionRef = React.useRef<string[]>([])
  expressionRef.current = expressions

  // setup polling
  React.useEffect(() => {
    try {
      if (yamlHandler && !isDrawerOpened) {
        Interval = window.setInterval(() => {
          const pipelineFromYaml = parse(yamlHandler.getLatestYaml())?.pipeline
          if (!isEqual(omit(pipeline, 'repo', 'branch'), pipelineFromYaml)) {
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

  React.useEffect(() => {
    if (yamlHandler) {
      setYamlHandlerContext(yamlHandler)
    }
  }, [yamlHandler, setYamlHandlerContext])

  return (
    <div className={css.yamlBuilder}>
      <>
        {!isDrawerOpened && (
          <YamlBuilderMemo
            fileName="Pipeline.yaml"
            entityType="Pipelines"
            isReadOnlyMode={isReadonly}
            existingJSON={{ pipeline: omit(pipeline, 'repo', 'branch') }}
            bind={setYamlHandler}
            showSnippetSection={false}
            onExpressionTrigger={() => {
              return Promise.resolve(
                expressionRef.current.map(item => ({ label: item, insertText: `${item}>`, kind: 1 }))
              )
            }}
            yamlSanityConfig={{ removeEmptyString: false, removeEmptyObject: false, removeEmptyArray: false }}
            height={'calc(100vh - 200px)'}
            width="calc(100vw - 400px)"
            invocationMap={stepsFactory.getInvocationMap()}
            schema={pipelineSchema?.data}
            isEditModeSupported={!isReadonly}
          />
        )}
      </>
    </div>
  )
}

export default PipelineYamlView
