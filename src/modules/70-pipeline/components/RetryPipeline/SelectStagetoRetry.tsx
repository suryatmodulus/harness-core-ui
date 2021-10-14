import React, { useState, useEffect, FormEvent } from 'react'
import { Color, Layout, Select, SelectOption, Text } from '@wings-software/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { RetryGroup, RetryInfo } from 'services/pipeline-ng'
import type { ParallelStageOption } from './RetryPipeline'
import css from './RetryPipeline.module.scss'

interface SelectStagetoRetryProps {
  stageResponse?: RetryInfo
  selectedStage: SelectOption | ParallelStageOption | null
  isParallelStage: boolean
  isAllStage: boolean
  isLastIndex: boolean
  handleStageChange: (value: SelectOption | ParallelStageOption) => void
  handleStageType: (e: FormEvent<HTMLInputElement>) => void
}

const SelectStagetoRetry = ({
  stageResponse,
  selectedStage,
  isParallelStage,
  isAllStage,
  isLastIndex,
  handleStageChange,
  handleStageType
}: SelectStagetoRetryProps): React.ReactElement | null => {
  const { getString } = useStrings()
  const [stageList, setStageList] = useState<SelectOption[]>([])

  useEffect(() => {
    if (stageResponse?.groups?.length) {
      const stageListValues = stageResponse.groups.map((stageGroup, idx) => {
        if (stageGroup.info?.length === 1) {
          return { label: stageGroup.info[0].name, value: stageGroup.info[0].identifier }
        } else {
          const parallelStagesLabel = stageGroup.info?.map(stageName => stageName.name).join(' | ')
          return {
            label: parallelStagesLabel,
            value: parallelStagesLabel,
            isLastIndex: idx === (stageResponse.groups as RetryGroup[])?.length - 1
          }
        }
      })
      setStageList(stageListValues as SelectOption[])
    }
  }, [stageResponse])

  return (
    <div className={css.selectStageWrapper}>
      <Text
        tooltipProps={{ dataTooltipId: 'selectRetryStageText' }}
        color={Color.GREY_700}
        font={{ size: 'small', weight: 'semi-bold' }}
      >
        {stageResponse?.errorMessage ? stageResponse.errorMessage : getString('pipeline.stagetoRetryFrom')}
      </Text>
      {!!stageResponse?.groups?.length && (
        <Layout.Horizontal
          margin={{ top: 'medium' }}
          spacing="medium"
          flex={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
        >
          <Select value={selectedStage} items={stageList} onChange={handleStageChange} className={css.selectStage} />
          {isParallelStage && isLastIndex && (
            <RadioGroup inline selectedValue={isAllStage ? 'allparallel' : 'failedStages'} onChange={handleStageType}>
              <Radio label={getString('pipeline.runAllParallelstages')} value="allparallel" />
              <Radio label={getString('pipeline.runFailedStages')} value="failedStages" />
            </RadioGroup>
          )}
        </Layout.Horizontal>
      )}
    </div>
  )
}

export default SelectStagetoRetry
