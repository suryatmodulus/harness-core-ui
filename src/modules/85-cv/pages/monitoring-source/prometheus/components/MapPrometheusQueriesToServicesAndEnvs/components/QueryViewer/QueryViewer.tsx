import React, { useCallback, useEffect, useMemo, useState } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { IDrawerProps, Position, Drawer } from '@blueprintjs/core'
import cx from 'classnames'
import { Button, Color, Container, FormInput, Icon, Layout, StackTraceList, Text, Utils } from '@wings-software/uicore'
import { useParams } from 'react-router'
import { debounce, isNumber } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useGetSampleData } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { MapPrometheusQueryToService } from '@cv/pages/monitoring-source/prometheus/constants'
import { useConfirmationDialog } from '@common/exports'
import { MapPrometheusQueryToServiceFieldNames } from '../../constants'
import { transformPrometheusSampleData, createPrometheusQuery } from './utils'
import css from './QueryViewer.module.scss'

export interface QueryViewerProps {
  values?: MapPrometheusQueryToService
  className?: string
  connectorIdentifier?: string
  onChange: (fieldName: string, value: any) => void
}

interface ChartAndRecordsProps {
  query?: string
  connectorIdentifier?: string
  debounceValue?: number
  onChange: QueryViewerProps['onChange']
}

interface QueryViewDialogProps extends ChartAndRecordsProps {
  onHide: () => void
  isManualQuery: boolean
}

const DrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: false,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '50%'
}

export function ChartAndRecords(props: ChartAndRecordsProps): JSX.Element {
  const { query, connectorIdentifier, debounceValue, onChange } = props
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { data, refetch, error, cancel } = useGetSampleData({ lazy: true })
  const [loading, setLoading] = useState(false)
  const [, setDebouncedFunc] = useState<typeof debounce | undefined>()

  const apiFetch = useCallback(async () => {
    setLoading(true)
    await refetch({
      queryParams: {
        accountId,
        projectIdentifier,
        orgIdentifier,
        query: query || '',
        tracingId: Utils.randomId(),
        connectorIdentifier: connectorIdentifier as string
      }
    })

    setLoading(false)
  }, [connectorIdentifier, projectIdentifier, query])

  useEffect(() => {
    if (!connectorIdentifier || !query) return

    if (!isNumber(debounceValue)) {
      apiFetch()
    } else {
      setDebouncedFunc((prevDebounce?: any) => {
        prevDebounce?.cancel()
        cancel()
        const debouncedFunc = debounce(apiFetch, 750)
        debouncedFunc()
        return debouncedFunc as any
      })
    }
  }, [connectorIdentifier, projectIdentifier, query])

  const { options: highchartsOptions, records } = useMemo(() => {
    onChange(MapPrometheusQueryToServiceFieldNames.RECORD_COUNT, data?.data?.length)
    return transformPrometheusSampleData(data?.data)
  }, [data])

  let content
  if (error) {
    content = (
      <PageError
        message={getErrorMessage(error)}
        onClick={() => {
          apiFetch()
        }}
      />
    )
  } else if (loading) {
    content = <Icon name="steps-spinner" size={32} color={Color.GREY_600} className={css.centerElement} />
  } else if (!query || !connectorIdentifier) {
    content = (
      <Text
        icon="timeline-line-chart"
        className={cx(css.noQueryChart, css.centerElement)}
        iconProps={{ size: 50, intent: 'success' }}
      >
        {getString('cv.monitoringSources.prometheus.provideQueryToSeeRecords')}
      </Text>
    )
  } else if (!records?.length) {
    content = (
      <Container className={css.noRecords}>
        <NoDataCard
          icon="warning-sign"
          message={getString('cv.monitoringSources.prometheus.noRecordsForQuery')}
          onClick={() => {
            refetch()
          }}
          buttonText={getString('retry')}
        />
      </Container>
    )
  } else {
    content = (
      <>
        {records?.length > 1 && (
          <Text
            intent="danger"
            font={{ size: 'small' }}
            className={css.tooManyRecords}
            icon="warning-sign"
            iconProps={{ intent: 'danger' }}
          >
            {getString('cv.monitoringSources.prometheus.validation.recordCount')}
          </Text>
        )}
        <Container className={css.chart}>
          <HighchartsReact highcharts={Highcharts} options={highchartsOptions} />
        </Container>
        <StackTraceList stackTraceList={records} className={css.recordContainer} />
      </>
    )
  }

  return (
    <Container className={css.queryAndRecords}>
      <Text className={css.labelText}>{getString('cv.monitoringSources.prometheus.chartAndRecords')}</Text>
      <Container className={css.chartContainer}>{content}</Container>
    </Container>
  )
}

function QueryViewDialog(props: QueryViewDialogProps): JSX.Element {
  const { onHide, query, isManualQuery, connectorIdentifier, onChange } = props
  return (
    <Drawer {...DrawerProps} isOpen={true} onClose={onHide} className={css.queryViewDialog}>
      <FormInput.TextArea
        name={MapPrometheusQueryToServiceFieldNames.QUERY}
        label=""
        textArea={{ readOnly: !isManualQuery }}
        className={css.formQueryBox}
      />
      <ChartAndRecords
        debounceValue={isManualQuery ? 750 : undefined}
        query={query}
        connectorIdentifier={connectorIdentifier}
        onChange={onChange}
      />
    </Drawer>
  )
}

export function QueryViewer(props: QueryViewerProps): JSX.Element {
  const { values, className, connectorIdentifier, onChange } = props
  const { getString } = useStrings()
  const query = useMemo(() => {
    if (values?.isManualQuery) {
      return values.query?.length ? values.query : ''
    }
    return createPrometheusQuery(values)
  }, [
    values?.isManualQuery,
    values?.envFilter,
    values?.serviceFilter,
    values?.additionalFilter,
    values?.aggregator,
    values?.query,
    values?.prometheusMetric
  ])

  useEffect(() => {
    if (!isManualQuery) {
      onChange(MapPrometheusQueryToServiceFieldNames.QUERY, query)
    }
  }, [query])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { openDialog } = useConfirmationDialog({
    titleText: getString('cv.monitoringSources.prometheus.querySettingsNotEditable'),
    contentText: getString('cv.monitoringSources.prometheus.querySettingsSubtext'),
    confirmButtonText: getString('cv.proceedToEdit'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: (proceed: boolean) => {
      if (proceed) onChange(MapPrometheusQueryToServiceFieldNames.IS_MANUAL_QUERY, true)
    }
  })
  const isManualQuery = Boolean(values?.isManualQuery)
  return (
    <Container className={cx(css.main, className)}>
      <Text className={css.labelText}>{getString('cv.query')}</Text>
      <Container className={css.queryContainer}>
        <Layout.Horizontal className={css.queryIcons} spacing="small">
          {!isManualQuery && (
            <Button icon="main-edit" iconProps={{ size: 12 }} className={css.action} onClick={() => openDialog()} />
          )}
          <Button
            icon="fullscreen"
            iconProps={{ size: 12 }}
            className={css.action}
            onClick={() => setIsDialogOpen(true)}
          />
        </Layout.Horizontal>
        <FormInput.TextArea
          name={MapPrometheusQueryToServiceFieldNames.QUERY}
          label=""
          textArea={{ readOnly: !isManualQuery }}
          className={cx(css.formQueryBox)}
        />
      </Container>
      <ChartAndRecords
        debounceValue={isManualQuery ? 750 : undefined}
        query={query}
        connectorIdentifier={connectorIdentifier}
        onChange={onChange}
      />
      {isDialogOpen && (
        <QueryViewDialog
          onHide={() => setIsDialogOpen(false)}
          connectorIdentifier={connectorIdentifier}
          debounceValue={isManualQuery ? 750 : undefined}
          query={query}
          isManualQuery={isManualQuery}
          onChange={onChange}
        />
      )}
    </Container>
  )
}
