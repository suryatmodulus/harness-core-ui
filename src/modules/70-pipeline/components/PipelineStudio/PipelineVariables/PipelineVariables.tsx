import React from 'react'
import { Icon, NestedAccordionPanel, NestedAccordionProvider } from '@wings-software/uicore'
import { get } from 'lodash-es'

import type {} from 'services/cd-ng'
import { Tooltip } from '@blueprintjs/core'
import { PageSpinner } from '@common/components'
import { String, useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PageError } from '@common/components/Page/PageError'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import PipelineCard from './Cards/PipelineCard'
import StageCard from './Cards/StageCard'
import VariableAccordionSummary from './VariableAccordionSummary'
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
  const stagesCards: JSX.Element[] = []
  /* istanbul ignore else */
  if (variablesPipeline.stages && variablesPipeline.stages?.length > 0) {
    variablesPipeline.stages?.forEach((data, i) => {
      if (data.parallel && data.parallel.length > 0) {
        data.parallel.forEach((nodeP, j: number) => {
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

  if (initLoading) return <PageSpinner />

  return (
    <div className={css.pipelineVariables}>
      {error ? (
        <PageError message={(error?.data as Error)?.message || error?.message} />
      ) : (
        <div className={css.content}>
          <div className={css.variablePanelHeader}>
            <div>
              <Icon name="pipeline-variables" />
              <String stringID="variablesText" />
              <Tooltip
                content={getString('customVariables.pipelineVariablesDescription')}
                portalClassName={css.descriptionTooltip}
              >
                <Icon size={12} name="info" className={css.description} />
              </Tooltip>
            </div>
            <div>
              {/* WIP Variabes Search */}
              {/* <TextInput leftIcon="search-list" className={css.searchInput} name="search-var" placeholder="Find..." /> */}
            </div>

            <div className={css.searchActions}>
              {/* WIP Variabes Search */}
              {/* <Button minimal className={css.applyChanges} text={getString('applyChanges')} onClick={noop} />
              <Button minimal className={css.discard} text={getString('pipeline.discard')} onClick={noop} /> */}
            </div>
          </div>
          <div className={css.variableList}>
            <GitSyncStoreProvider>
              <NestedAccordionPanel
                isDefaultOpen
                key={'pipeline'}
                id={'pipeline'}
                addDomId
                summary={<VariableAccordionSummary>{getString('common.pipeline')}</VariableAccordionSummary>}
                summaryClassName={css.stageSummary}
                detailsClassName={css.pipelineDetails}
                panelClassName={css.pipelineMarginBottom}
                details={
                  <>
                    <div className={css.variableListHeader}>
                      <String stringID="variableLabel" />
                      <String stringID="valueLabel" />
                    </div>

                    <PipelineCard
                      variablePipeline={variablesPipeline}
                      pipeline={originalPipeline}
                      stepsFactory={stepsFactory}
                      updatePipeline={updatePipeline}
                      metadataMap={metadataMap}
                      readonly={isReadonly}
                    />

                    {stagesCards.length > 0 ? stagesCards : null}
                  </>
                }
              />
            </GitSyncStoreProvider>
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
