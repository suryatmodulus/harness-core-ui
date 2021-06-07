import React from 'react'
import { NestedAccordionProvider, useNestedAccordion, Icon } from '@wings-software/uicore'
import type { ITreeNode } from '@blueprintjs/core'
import { get } from 'lodash-es'
import cx from 'classnames'

import type { StageElementWrapper } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import { String, useStrings } from 'framework/strings'

import { PageError } from '@common/components/Page/PageError'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import StagesTree, { stagesTreeNodeClasses } from '@pipeline/components/StagesTree/StagesTree'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { getPipelineTree } from '../PipelineUtils'
import PipelineCard from './Cards/PipelineCard'
import StageCard from './Cards/StageCard'

import css from './PipelineVariables.module.scss'

export const PipelineVariables: React.FC = (): JSX.Element => {
  const {
    updatePipeline,
    stepsFactory,
    state: { pipeline: originalPipeline },
    isReadonly
  } = usePipelineContext()
  const { variablesPipeline, metadataMap, error, initLoading } = usePipelineVariables()
  const { getString } = useStrings()
  const { openNestedPath } = useNestedAccordion()
  const [nodes, updateNodes] = React.useState<ITreeNode[]>([])
  const [isSidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [selectedTreeNodeId, setSelectedTreeNodeId] = React.useState<string>('Pipeline_Variables')

  function toggleSidebar(): void {
    setSidebarCollapsed(status => !status)
  }

  React.useEffect(() => {
    updateNodes(getPipelineTree(originalPipeline, stagesTreeNodeClasses, getString))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalPipeline])

  const stagesCards: JSX.Element[] = []
  /* istanbul ignore else */
  if (variablesPipeline.stages && variablesPipeline.stages?.length > 0) {
    variablesPipeline.stages?.forEach((data, i) => {
      if (data.parallel && data.parallel.length > 0) {
        data.parallel.forEach((nodeP: StageElementWrapper, j: number) => {
          nodeP.stage &&
            stagesCards.push(
              <StageCard
                originalStage={get(originalPipeline, `stages[${i}].parallel[${j}].stage`)}
                key={nodeP.stage.identifier}
                stage={nodeP.stage}
                metadataMap={metadataMap}
              />
            )
        })
      } /* istanbul ignore else */ else if (data.stage) {
        stagesCards.push(
          <StageCard
            key={data.stage.identifier}
            stage={data.stage}
            originalStage={get(originalPipeline, `stages[${i}].stage`)}
            metadataMap={metadataMap}
            readonly={isReadonly}
          />
        )
      }
    })
  }

  function handleSelectionChange(id: string): void {
    setSelectedTreeNodeId(id)
    openNestedPath(id)

    document.getElementById(`${id}-panel`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (initLoading) return <PageSpinner />

  return (
    <div className={css.pipelineVariables}>
      {error ? (
        <PageError message={(error?.data as Error)?.message || error?.message} />
      ) : (
        <div className={cx(css.content, { [css.closed]: isSidebarCollapsed })}>
          <div className={css.lhs}>
            <String tagName="div" className={css.title} stringID="variablesText" />
            <StagesTree
              className={css.stagesTree}
              contents={nodes}
              selectedId={selectedTreeNodeId}
              selectionChange={handleSelectionChange}
            />
            <div className={css.collapse} onClick={toggleSidebar}>
              <Icon name="chevron-left" />
            </div>
          </div>

          <div className={css.variableList}>
            <String tagName="h4" className="bp3-heading" stringID="customVariables.pipelineVariablesTitle" />
            <String className={css.description} stringID="customVariables.pipelineVariablesDescription" />
            <String stringID="common.pipeline" className={css.title} />
            <div className={css.variableListHeader}>
              <String stringID="variableLabel" />
              <String stringID="valueLabel" />
            </div>
            <PipelineCard
              pipeline={variablesPipeline}
              originalPipeline={originalPipeline}
              stepsFactory={stepsFactory}
              updatePipeline={updatePipeline}
              metadataMap={metadataMap}
              readonly={isReadonly}
            />
            {stagesCards.length > 0 ? (
              <React.Fragment key="stages">
                <String stringID="stages" className={css.title} />
                <div className={css.variableListHeader}>
                  <String stringID="variableLabel" />
                  <String stringID="valueLabel" />
                </div>
                {stagesCards}
              </React.Fragment>
            ) : /* istanbul ignore next */ null}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PipelineVariablesWrapper(): React.ReactElement {
  return (
    <NestedAccordionProvider>
      <PipelineVariables />
    </NestedAccordionProvider>
  )
}
