import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { SelectedAppsSideNav } from '@cv/pages/monitoring-source/new-relic/MapNewRelicAppsToServicesAndEnvs/SelectedAppsSideNav/SelectedAppsSideNav'
import { useStrings } from 'framework/strings'
import css from './PrometheusMetricsSideNav.module.scss'

interface PrometheusMetricsSideNavProps {
  onSelectMetric: (selectedMetric: string, updatedList: string[], selectedMetricIndex: number) => void
  onRemoveMetric: (
    removedMetric: string,
    newSelectedMetric: string,
    updatedList: string[],
    selectedMetricIndex: number
  ) => void
  isValidInput: boolean
  renamedMetric?: string
  createdMetrics?: string[]
  defaultSelectedMetric?: string
}

export function PrometheusMetricsSideNav(props: PrometheusMetricsSideNavProps): JSX.Element {
  const {
    onSelectMetric,
    createdMetrics: propsCreatedMetrics,
    renamedMetric,
    onRemoveMetric,
    isValidInput,
    defaultSelectedMetric
  } = props
  const { getString } = useStrings()
  const defaultMetricName = getString('cv.monitoringSources.prometheus.prometheusMetric')
  const [filter, setFilter] = useState<string | undefined>()
  const [createdMetrics, setCreatedMetrics] = useState<string[]>(
    propsCreatedMetrics?.length ? propsCreatedMetrics : [defaultMetricName]
  )
  const [selectedMetric, setSelectedMetric] = useState<string | undefined>(defaultSelectedMetric || createdMetrics[0])

  useEffect(() => {
    if (renamedMetric && renamedMetric === selectedMetric) {
      return
    }

    let selectedMetricIndex = -1
    for (let metricIndex = 0; metricIndex < createdMetrics.length; metricIndex++) {
      const metric = createdMetrics[metricIndex]
      if (metric === renamedMetric) {
        // duplicate metric found so skip updating
        return
      }
      if (selectedMetric === metric) {
        selectedMetricIndex = metricIndex
      }
    }

    setCreatedMetrics(oldMetrics => {
      if (selectedMetricIndex !== -1) oldMetrics[selectedMetricIndex] = renamedMetric as string
      return Array.from(oldMetrics)
    })
    setSelectedMetric(renamedMetric)
  }, [renamedMetric])

  const metricsToRender = useMemo(() => {
    return filter
      ? createdMetrics.filter(metric => metric.toLocaleLowerCase().includes(filter?.toLocaleLowerCase()))
      : createdMetrics
  }, [filter, createdMetrics])

  return (
    <Container className={css.main}>
      <Button
        icon="plus"
        minimal
        intent="primary"
        disabled={!isValidInput}
        tooltip={!isValidInput ? getString('cv.monitoringSources.prometheus.addMetricTooltip') : undefined}
        tooltipProps={{ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
        onClick={() => {
          if (isValidInput) {
            setCreatedMetrics(oldMetrics => {
              onSelectMetric(defaultMetricName, [defaultMetricName, ...oldMetrics], 0)
              return [defaultMetricName, ...oldMetrics]
            })
            setSelectedMetric(defaultMetricName)
          }
        }}
      >
        {getString('cv.monitoringSources.addMetric')}
      </Button>
      <SelectedAppsSideNav
        onSelect={(newlySelectedMetric, index) => {
          onSelectMetric(newlySelectedMetric, createdMetrics, index)
          setSelectedMetric(newlySelectedMetric)
        }}
        selectedItem={selectedMetric}
        selectedApps={metricsToRender}
        onRemoveItem={
          createdMetrics.length > 1
            ? (removedItem, index) => {
                setCreatedMetrics(oldMetrics => {
                  oldMetrics.splice(index, 1)
                  const updateIndex = index === 0 ? 0 : index - 1
                  const updatedMetric = oldMetrics[updateIndex]
                  setSelectedMetric(updatedMetric)
                  onRemoveMetric(removedItem, updatedMetric, [...oldMetrics], updateIndex)
                  return [...oldMetrics]
                })
              }
            : undefined
        }
        filterProps={{
          onFilter: setFilter,
          className: css.metricsFilter
        }}
      />
    </Container>
  )
}
