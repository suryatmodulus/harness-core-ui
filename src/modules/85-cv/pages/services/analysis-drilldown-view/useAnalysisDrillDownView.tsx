import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Color, Layout, useModalHook, Text, Container } from '@wings-software/uicore'
import React, { useState } from 'react'
import { isNumber, omit } from 'lodash-es'
import moment from 'moment'
import { RiskScoreTile } from '@cv/components/RiskScoreTile/RiskScoreTile'
import { useStrings } from 'framework/strings'
import { AnalysisDrillDownView, AnalysisDrillDownViewProps } from './AnalysisDrillDownView'
import css from './useAnalysisDrillDownView.module.scss'

interface UseAnalysisDrillDownViewProps {
  analysisProps: AnalysisDrillDownViewProps
  categoryRiskScore: number
}

interface CategoryAndRiskScoreProps {
  riskScore: number
  categoryName: string
  startTime: number
  endTime: number
}

type UseAnalysisDrillDownViewReturnType = {
  openDrillDown: (info: UseAnalysisDrillDownViewProps) => void
  closeDrillDown: () => void
}

const bpDialogProps: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  title: '',
  className: css.main,
  style: { width: 900, height: 570 }
}

function CategoryAndRiskScore(props: CategoryAndRiskScoreProps): JSX.Element {
  const { riskScore, categoryName, startTime, endTime } = props
  const { getString } = useStrings()
  return (
    <Container>
      <Container className={css.categoryAndRiskScore}>
        <RiskScoreTile riskScore={riskScore} className={css.riskScore} isLarge />
        <Layout.Vertical className={css.riskInfo}>
          <Text color={Color.BLACK} font={{ weight: 'bold' }}>
            {categoryName}
          </Text>
          <Text color={Color.GREY_300}>{getString('cv.riskScore')}</Text>
        </Layout.Vertical>
      </Container>
      {isNumber(endTime) && isNumber(startTime) && (
        <Text className={css.timeRange}>{`${getString('cv.selectedTimeInterval')} ${moment(startTime).format(
          'MMM D, h:mm a'
        )} - ${moment(endTime).format('MMM D, h:mm a')}`}</Text>
      )}
    </Container>
  )
}

export default function useAnalysisDrillDownView(
  drillDownInfo?: UseAnalysisDrillDownViewProps
): UseAnalysisDrillDownViewReturnType {
  const [drillDownProps, setDrillDownProps] = useState<UseAnalysisDrillDownViewProps | undefined>(drillDownInfo)
  const [openModal, hideModal] = useModalHook(
    () =>
      drillDownProps && drillDownProps.analysisProps ? (
        <Dialog
          {...bpDialogProps}
          isOpen={true}
          onClose={hideModal}
          title={
            <CategoryAndRiskScore
              riskScore={drillDownProps.categoryRiskScore || 0}
              categoryName={drillDownProps.analysisProps.categoryName as string}
              startTime={drillDownProps.analysisProps.startTime}
              endTime={drillDownProps.analysisProps.endTime}
            />
          }
        >
          <AnalysisDrillDownView
            {...omit(drillDownProps.analysisProps, 'categoryRiskScore')}
            className={css.drillDownContent}
            asModal={true}
            historyStartTime={moment(drillDownProps.analysisProps.startTime).subtract(2, 'hours').valueOf()}
          />
        </Dialog>
      ) : null,
    [drillDownProps]
  )

  return {
    openDrillDown: (updatedInfo: UseAnalysisDrillDownViewProps) => {
      setDrillDownProps(updatedInfo)
      openModal()
    },
    closeDrillDown: hideModal
  }
}
