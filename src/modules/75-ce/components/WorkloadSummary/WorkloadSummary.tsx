import React from 'react'
import { Container, Layout, Text, Icon } from '@wings-software/uicore'
import type { Maybe, PerspectiveTrendStats, ClusterData } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import type { CCM_PAGE_TYPE } from '@ce/types'
import { OVERVIEW_FIELD_MAPPER } from './constants'
import css from './WorkloadSummary.module.scss'

interface KeyValuePairRendererProps {
  keyVal?: React.ReactNode
  value?: React.ReactNode
}

const KeyValuePairRenderer: (props: KeyValuePairRendererProps) => JSX.Element = ({ keyVal, value }) => {
  return (
    <Layout.Horizontal className={css.keyValueTable}>
      <Text lineClamp={1} className={css.key} width={132}>
        {keyVal}
      </Text>
      <Text lineClamp={1} className={css.value} width={160}>
        {value}
      </Text>
    </Layout.Horizontal>
  )
}

const CostDetails: ({ summaryData }: { summaryData: PerspectiveTrendStats }) => JSX.Element = ({ summaryData }) => {
  const { cost, idleCost, utilizedCost } = summaryData

  return (
    <Container>
      {cost && <KeyValuePairRenderer keyVal={cost.statsLabel} value={cost.statsValue} />}
      {idleCost && (
        <KeyValuePairRenderer
          keyVal={idleCost.statsLabel}
          value={`${idleCost.statsValue} (${idleCost.statsDescription})`}
        />
      )}
      {utilizedCost && (
        <KeyValuePairRenderer
          keyVal={utilizedCost.statsLabel}
          value={`${utilizedCost.statsValue} (${utilizedCost.statsDescription})`}
        />
      )}
    </Container>
  )
}

const NodeDetails: ({ infoData, pageType }: { infoData: ClusterData; pageType: CCM_PAGE_TYPE }) => JSX.Element = ({
  infoData,
  pageType
}) => {
  const fieldTables = OVERVIEW_FIELD_MAPPER[pageType]
  return (
    <Container>
      {fieldTables?.length
        ? fieldTables.map((table, idx) => (
            <div key={`overview-field-${idx}`}>
              {table.map(({ name, key }) => {
                const accessor = key as keyof ClusterData
                const value = (infoData && infoData[accessor]) || ''
                return <KeyValuePairRenderer key={accessor} keyVal={name} value={value} />
              })}
            </div>
          ))
        : null}
    </Container>
  )
}

interface WorkloadSummaryProps {
  fetching: boolean
  summaryData: Maybe<PerspectiveTrendStats> | undefined
  infoData: ClusterData
  pageType: CCM_PAGE_TYPE
}

const WorkloadSummary: (props: WorkloadSummaryProps) => JSX.Element = ({
  fetching,
  summaryData,
  infoData,
  pageType
}) => {
  const { getString } = useStrings()
  if (fetching) {
    return (
      <Container className={css.loadingContainer}>
        <Icon name="spinner" size={26} color="blue500" />
      </Container>
    )
  }

  if (!summaryData) {
    return (
      <Container>
        <Icon name="error" size={26} />
      </Container>
    )
  }

  return (
    <Layout.Horizontal className={css.summaryDetailsContainer}>
      <Container className={css.container}>
        <Text className={css.headingText}>{getString('ce.perspectives.workloadDetails.workloadDetailsText')}</Text>
        <NodeDetails infoData={infoData} pageType={pageType} />
      </Container>
      <Container className={css.container}>
        <Text className={css.headingText}>{getString('ce.perspectives.workloadDetails.costDetailsText')}</Text>
        <CostDetails summaryData={summaryData} />
      </Container>
    </Layout.Horizontal>
  )
}

export default WorkloadSummary
