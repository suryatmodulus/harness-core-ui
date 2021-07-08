import React, { useMemo, useCallback, useState, useRef } from 'react'
import { Container, Text, Color, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import type { SeriesLineOptions } from 'highcharts'
import type { LogData } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import getLogAnalysisLineChartOptions from './LogAnalysisLineChartConfig'
import { LogAnalysisRiskAndJiraModal } from '../LogAnalysisRiskAndJiraModal/LogAnalysisRiskAndJiraModal'
// import LogAnalysisCompareDrawer from '../LogAnalysisCompareDrawer/LogAnalysisCompareDrawer'
import css from './LogAnalysisRow.module.scss'

export type LogAnalysisRowData = {
  clusterType: LogData['tag']
  message: string
  count: number
  messageFrequency: SeriesLineOptions[]
}

interface LogAnalysisRowProps {
  data: LogAnalysisRowData[]
  className?: string
}

interface LogAnalysisDataRowProps {
  rowData: LogAnalysisRowData
  onSelect: (
    isSelected: boolean,
    selectedData: LogAnalysisRowData,
    index: number,
    chartOptions: Highcharts.Options
  ) => void
  index: number
  isSelected: boolean
}

type CompareLogEventsInfo = {
  data: LogAnalysisRowData
  index: number
}

function getEventTypeFromClusterType(tag: LogData['tag'], getString: UseStringsReturn['getString']): string {
  switch (tag) {
    case 'KNOWN':
      return getString('cv.known')
    case 'UNKNOWN':
      return getString('cv.unknown')
    case 'UNEXPECTED':
      return getString('cv.unexpected')
    default:
      return ''
  }
}

function ColumnHeaderRow(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={cx(css.mainRow, css.columnHeader)}>
      <Text color={Color.BLACK} className={css.logRowColumnHeader} margin={{ left: 'large' }}>
        {getString('cv.clusterType')}
      </Text>
      <Text color={Color.BLACK} className={css.logRowColumnHeader}>
        {getString('cv.sampleMessage')}
      </Text>
      <Text color={Color.BLACK} className={css.logRowColumnHeader}>
        {getString('instanceFieldOptions.instanceHolder')}
      </Text>
      <Text color={Color.BLACK} className={css.logRowColumnHeader}>
        {getString('cv.messageFrequency')}
      </Text>
      <Text color={Color.BLACK} className={css.logRowColumnHeader}>
        {getString('pipeline.triggers.triggerConfigurationPanel.actions')}
      </Text>
    </Container>
  )
}

function DataRow(props: LogAnalysisDataRowProps): JSX.Element {
  const { onSelect, rowData, index, isSelected } = props
  const chartOptions = useMemo(
    () => getLogAnalysisLineChartOptions(rowData?.messageFrequency || []),
    [rowData?.messageFrequency]
  )
  const { getString } = useStrings()
  const [displayRiskEditModal, setDisplayRiskEditModal] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<{ risk: string; message: string } | undefined>(undefined)
  const logTextRef = useRef<HTMLParagraphElement>(null)
  const onShowRiskEditModalCallback = useCallback(() => setDisplayRiskEditModal(true), [])
  const onHideRiskEditModalCallback = useCallback((data?) => {
    if (data?.risk || data?.message) setFeedbackGiven(data)
    setDisplayRiskEditModal(false)
  }, [])

  return (
    <Container className={cx(css.mainRow, css.dataRow, css.highlightRow)}>
      <Container className={cx(css.dataColumn, css.openModalColumn, css.compareDataColumn)}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onSelect?.(e.currentTarget.checked, rowData, index, chartOptions)
          }}
        />
        {rowData.clusterType && (
          <Text onClick={onShowRiskEditModalCallback}>
            {getEventTypeFromClusterType(rowData.clusterType, getString)}
          </Text>
        )}
      </Container>
      <Container className={cx(css.logText, css.dataColumn, css.openModalColumn)} onClick={onShowRiskEditModalCallback}>
        <p className={css.logRowText} ref={logTextRef}>
          {rowData.message}
        </p>
      </Container>
      <Text className={cx(css.dataColumn, css.logRowText, css.openModalColumn)} onClick={onShowRiskEditModalCallback}>
        {rowData.count}
      </Text>
      <Container className={cx(css.lineChartContainer, css.dataColumn)}>
        <HighchartsReact highchart={Highcharts} options={chartOptions} />
      </Container>
      <Container className={cx(css.actions, css.dataColumn)}>
        <Icon name="service-jira" margin={{ right: 'small' }} />
        <Icon name="share" />
      </Container>
      {displayRiskEditModal ? (
        <LogAnalysisRiskAndJiraModal
          onHide={onHideRiskEditModalCallback}
          trendData={chartOptions}
          count={rowData.count || 0}
          activityType={rowData.clusterType}
          logMessage={rowData.message || ''}
          feedback={feedbackGiven}
        />
      ) : undefined}
    </Container>
  )
}

export function LogAnalysisRow(props: LogAnalysisRowProps): JSX.Element {
  const { data = [] } = props
  // const [displayCompareDataModal, setDisplayCompareDataModal] = useState(false)
  const [dataToCompare, setDataToCompare] = useState<CompareLogEventsInfo[]>([])
  const onCompareSelectCallback = useCallback(
    (isSelect: boolean, selectedData: LogAnalysisRowData, index: number) => {
      let updatedDataToCompare = [...dataToCompare]
      if (!isSelect) {
        updatedDataToCompare = updatedDataToCompare.filter(d => d.index !== index)
      } else {
        if (updatedDataToCompare.length === 2) updatedDataToCompare.pop()
        updatedDataToCompare.unshift({ data: selectedData, index })
      }

      // if (updatedDataToCompare?.length === 2) setDisplayCompareDataModal(true)
      setDataToCompare(updatedDataToCompare)
    },
    [dataToCompare]
  )
  const selectedIndices = useMemo(() => new Set(dataToCompare.map(d => d.index)), [dataToCompare])
  // const selectedRowData = useMemo(
  //   () => dataToCompare.map(({ data: selectedData, trendLineOptions }) => ({ ...selectedData, trendLineOptions })),
  //   [dataToCompare]
  // )

  return (
    <Container className={cx(css.main, props.className)}>
      <ColumnHeaderRow />
      <Container className={css.dataContainer}>
        {data.map((row, index) => {
          if (!row) return undefined
          const { clusterType, count, message } = row
          return (
            <DataRow
              key={`${clusterType}-${count}-${message}`}
              rowData={row}
              index={index}
              onSelect={onCompareSelectCallback}
              isSelected={selectedIndices.has(index)}
            />
          )
        })}
      </Container>
      {/* {displayCompareDataModal && (
        <LogAnalysisCompareDrawer rowsToCompare={undefined} onHide={() => setDisplayCompareDataModal(false)} />
      )} */}
    </Container>
  )
}
