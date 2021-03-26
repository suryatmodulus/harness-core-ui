import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Container, Tabs, Tab, Text, Card, Icon, Color, useModalHook } from '@wings-software/uicore'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'

import cx from 'classnames'
import type { AppdynamicsValidationResponse, AppdynamicsMetricValueValidationResponse } from 'services/cv'
import { useStrings } from 'framework/exports'
import { ThirdPartyCallLogModal } from '../ThirdPartyCallLogs/ThirdPartyCallLogs'
import i18n from './MetricsVerificationModal.i18n'

import css from './MetricsVerificationModal.module.scss'

const MAX_TEXT_WIDTH = 90
const ICON_SIZE = 8

interface MetricsVerificationModalProps {
  onHide: () => void
  verificationType: string
  verificationData?: AppdynamicsValidationResponse[]
  guid: string
}

interface StatusCard {
  metricName: string
}

interface SuccessMetricCardProps extends StatusCard {
  count: number
}

interface NoDataErrorCardProps extends StatusCard {
  viewCallLogs: (metricPackName: string, metricName: string) => void
  metricPackName: string
}

interface ErrorMetricCardProps extends NoDataErrorCardProps {
  errorMsg: string
}

interface MetricPackValidationResultProps {
  data: AppdynamicsValidationResponse[]
  viewCallLogs: (metricPackName: string, metricName: string) => void
}

const modalPropsLight: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  className: Classes.DIALOG,
  style: { width: 900, height: 570 }
}

function filterForMetricPacksByMetricStatus(
  data: AppdynamicsValidationResponse[],
  status: AppdynamicsMetricValueValidationResponse['apiResponseStatus']
): AppdynamicsValidationResponse[] {
  if (!data?.length) {
    return []
  }
  const filteredMetrics: Array<{ metricPackName: string; values: AppdynamicsMetricValueValidationResponse[] }> = []
  data.forEach((metricPack: AppdynamicsValidationResponse) => {
    const metrics = metricPack?.values?.filter((metric: AppdynamicsMetricValueValidationResponse) => {
      return metric.apiResponseStatus === status
    })
    if (metrics?.length && metricPack?.metricPackName) {
      filteredMetrics.push({ metricPackName: metricPack.metricPackName, values: metrics })
    }
  })
  return filteredMetrics
}

function SuccessMetricCard(props: SuccessMetricCardProps): JSX.Element {
  const { metricName, count } = props
  return (
    <Card className={cx(css.successCard, css.statusCard)}>
      <Icon name="deployment-success-legacy" className={css.statusIcon} size={ICON_SIZE} />
      <Container className={css.dataContainer}>
        <Text lineClamp={1} color={Color.GREEN_500} width={MAX_TEXT_WIDTH} className={css.dataTitle}>
          {metricName}
        </Text>
        <Text className={css.count} lineClamp={1} width={MAX_TEXT_WIDTH} color={Color.GREEN_500}>
          {count}
        </Text>
      </Container>
    </Card>
  )
}

function ErrorMetricCard(props: ErrorMetricCardProps): JSX.Element {
  const { metricName, errorMsg, viewCallLogs, metricPackName } = props
  return (
    <Card className={cx(css.errorCard, css.statusCard)}>
      <Icon name="deployment-failed-legacy" className={css.statusIcon} size={ICON_SIZE} />
      <Container className={css.dataContainer}>
        <Text intent="danger" lineClamp={1} width={MAX_TEXT_WIDTH} className={css.dataTitle}>
          {metricName}
        </Text>
        <Text intent="danger" lineClamp={1} width={MAX_TEXT_WIDTH} className={css.smallFont}>
          {errorMsg}
        </Text>
        <Text
          intent="primary"
          className={cx(css.smallFont, css.callLogs)}
          onClick={() => viewCallLogs(metricPackName, metricName)}
        >
          {i18n.viewCalls}
        </Text>
      </Container>
    </Card>
  )
}

function NoDataErrorCard(props: NoDataErrorCardProps): JSX.Element {
  const { metricName, viewCallLogs, metricPackName } = props
  return (
    <Card className={cx(css.noDataCard, css.statusCard)}>
      <Icon name="small-minus" className={css.statusIcon} size={ICON_SIZE} />
      <Container className={css.dataContainer}>
        <Text intent="none" lineClamp={1} width={MAX_TEXT_WIDTH} className={css.dataTitle}>
          {metricName}
        </Text>
        <Text intent="none" className={css.smallFont}>
          {i18n.noData}
        </Text>
        <Text
          intent="primary"
          className={cx(css.smallFont, css.callLogs)}
          onClick={() => viewCallLogs(metricPackName, metricName)}
        >
          {i18n.viewCalls}
        </Text>
      </Container>
    </Card>
  )
}

function MetricPackValidationResult(props: MetricPackValidationResultProps): JSX.Element {
  const { data = [], viewCallLogs } = props
  return (
    <Container className={css.content}>
      {data?.map((metricPack: AppdynamicsValidationResponse) => {
        const { metricPackName = '', values = [] } = metricPack || {}
        return (
          <Container key={metricPackName} className={css.metricPackContainer}>
            <Text className={css.metricPackName}>{metricPackName}</Text>
            <Container className={css.cardContainer}>
              {values.map((metric: AppdynamicsMetricValueValidationResponse) => {
                const { metricName = '', value = 0, errorMessage = '', apiResponseStatus } = metric || {}
                switch (apiResponseStatus) {
                  case 'SUCCESS':
                    return <SuccessMetricCard metricName={metricName} count={value} />
                  case 'FAILED':
                    return (
                      <ErrorMetricCard
                        metricName={metricName}
                        metricPackName={metricPackName}
                        errorMsg={errorMessage}
                        viewCallLogs={viewCallLogs}
                      />
                    )
                  default:
                    return (
                      <NoDataErrorCard
                        metricName={metricName}
                        metricPackName={metricPackName}
                        viewCallLogs={viewCallLogs}
                      />
                    )
                }
              })}
            </Container>
          </Container>
        )
      })}
    </Container>
  )
}

function MetricsModal(props: MetricsVerificationModalProps): JSX.Element {
  const { onHide, verificationData = [], guid, verificationType } = props
  const errorMetrics = useMemo(() => filterForMetricPacksByMetricStatus(verificationData, 'FAILED'), [verificationData])
  const noDataMetrics = useMemo(() => filterForMetricPacksByMetricStatus(verificationData, 'NO_DATA'), [
    verificationData
  ])
  const successMetrics = useMemo(() => filterForMetricPacksByMetricStatus(verificationData, 'SUCCESS'), [
    verificationData
  ])
  const [{ displayCallLog, guidWithMetricFilter }, setCallLogDisplay] = useState({
    displayCallLog: false,
    guidWithMetricFilter: guid
  })
  const displayCallLogCallback = useCallback(
    (metricPackName, metricName) =>
      setCallLogDisplay({ displayCallLog: true, guidWithMetricFilter: `${metricPackName}:${metricName}:${guid}` }),
    [guid]
  )
  const hideCallLogCallback = useCallback(
    () => () => setCallLogDisplay({ displayCallLog: false, guidWithMetricFilter: guid }),
    [guid]
  )
  const onHideCallback = useCallback(() => onHide(), [onHide])
  const { getString } = useStrings()
  return (
    <Dialog
      {...modalPropsLight}
      onClose={onHideCallback}
      className={css.main}
      title={getString('cv.monitoringSources.appD.metricsVerificationModalTitle')}
    >
      {!displayCallLog ? (
        <Tabs id="tabsId1">
          <Tab
            id={i18n.tabTitles.all}
            title={i18n.tabTitles.all}
            panel={<MetricPackValidationResult data={verificationData} viewCallLogs={displayCallLogCallback} />}
          />
          <Tab
            id={i18n.tabTitles.error}
            title={i18n.tabTitles.error}
            panel={<MetricPackValidationResult data={errorMetrics} viewCallLogs={displayCallLogCallback} />}
          />
          <Tab
            id={i18n.tabTitles.noData}
            title={i18n.tabTitles.noData}
            panel={<MetricPackValidationResult data={noDataMetrics} viewCallLogs={displayCallLogCallback} />}
          />
          <Tab
            id={i18n.tabTitles.success}
            title={i18n.tabTitles.success}
            panel={<MetricPackValidationResult data={successMetrics} viewCallLogs={displayCallLogCallback} />}
          />
        </Tabs>
      ) : (
        <ThirdPartyCallLogModal
          guid={guidWithMetricFilter}
          onHide={onHide}
          onBackButtonClick={hideCallLogCallback()}
          verificationType={verificationType}
        />
      )}
    </Dialog>
  )
}

export default function MetricsVerificationModal(props: MetricsVerificationModalProps): JSX.Element {
  const { onHide, verificationData = [], guid, verificationType } = props
  const [openModal, hideModal] = useModalHook(() => {
    const hidemodalCallback = (): void => {
      hideModal()
      onHide()
    }
    return (
      <MetricsModal
        onHide={hidemodalCallback}
        verificationData={verificationData}
        guid={guid}
        verificationType={verificationType}
      />
    )
  })
  useEffect(() => openModal(), [openModal])
  return <span />
}
