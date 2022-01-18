/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Icon,
  NestedAccordionPanel,
  NestedAccordionProvider,
  ExpandingSearchInput,
  Color,
  Layout,
  Text,
  FontVariation,
  PageError
} from '@wings-software/uicore'
import { get } from 'lodash-es'

import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import PipelineCard from './Cards/PipelineCard'
import StageCard from './Cards/StageCard'
import VariableAccordionSummary from './VariableAccordionSummary'
// import { DrawerTypes } from '../PipelineContext/PipelineActions'
import css from './PipelineVariables.module.scss'

export const PipelineVariables: React.FC = (): JSX.Element => {
  const {
    updatePipeline,
    stepsFactory,
    state: {
      pipeline: originalPipeline
      // pipelineView
    },
    isReadonly,
    allowableTypes

    // updatePipelineView,
    // fetchPipeline
  } = usePipelineContext()
  const {
    variablesPipeline,
    metadataMap,
    error,
    initLoading,
    onSearchInputChange,
    searchIndex = 0,
    searchResults = [],
    goToNextSearchResult,
    goToPrevSearchResult
  } = usePipelineVariables()
  const { getString } = useStrings()

  const pipelineVariablesRef = React.useRef()
  React.useLayoutEffect(() => {
    if (searchIndex === null && pipelineVariablesRef.current) {
      ;(pipelineVariablesRef.current as any)?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }
  }, [searchIndex])
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
                path="pipeline"
                allowableTypes={allowableTypes}
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
            path="pipeline"
            allowableTypes={allowableTypes}
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
            <div className={css.variableTitle}>
              <Layout.Horizontal>
                <Icon name="pipeline-variables" size={24} color={Color.PRIMARY_7} />
                <Text font={{ variation: FontVariation.H4 }} tooltipProps={{ dataTooltipId: 'pipelineVariables' }}>
                  {getString('variablesText')}
                </Text>
              </Layout.Horizontal>
            </div>
            <div>
              {/* WIP Variabes Search */}
              <ExpandingSearchInput
                alwaysExpanded
                width={450}
                onChange={onSearchInputChange}
                showPrevNextButtons
                fixedText={`${Math.min((searchIndex || 0) + 1, searchResults?.length)} / ${searchResults?.length}`}
                onNext={goToNextSearchResult}
                onPrev={goToPrevSearchResult}
                onEnter={goToNextSearchResult}
                placeholder={getString('search')}
              />
            </div>

            <div className={css.searchActions}></div>
          </div>
          <div className={css.variableListHeader}>
            <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_600}>
              {getString('variableLabel')}{' '}
            </Text>
            <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_600}>
              {getString('common.input')}{' '}
            </Text>
          </div>
          <div className={css.variableList} ref={pipelineVariablesRef as any}>
            <GitSyncStoreProvider>
              <NestedAccordionPanel
                noAutoScroll
                isDefaultOpen
                key="pipeline"
                id="pipeline"
                addDomId
                collapseProps={{
                  keepChildrenMounted: true
                }}
                summary={<VariableAccordionSummary>{getString('common.pipeline')}</VariableAccordionSummary>}
                summaryClassName={css.stageSummary}
                detailsClassName={css.pipelineDetails}
                panelClassName={css.pipelineMarginBottom}
                details={
                  <>
                    <PipelineCard
                      variablePipeline={variablesPipeline}
                      pipeline={originalPipeline}
                      stepsFactory={stepsFactory}
                      updatePipeline={updatePipeline}
                      metadataMap={metadataMap}
                      readonly={isReadonly}
                      allowableTypes={allowableTypes}
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
