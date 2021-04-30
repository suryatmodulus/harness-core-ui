import React, { useContext, useEffect, useMemo, useState } from 'react'
import cx from 'classnames'
import { Card, Color, LabelPosition, Layout, Text, WeightedStack } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Ticker } from '@common/components/Ticker/Ticker'
import { DeploymentsTimeRangeContext } from '@dashboards/components/Services/common'
import type { TIME_RANGE_ENUMS } from '@dashboards/components/TimeRangeSelector/TimeRangeSelector'
import css from '@dashboards/components/Services/MostActiveServicesWidget/MostActiveServicesWidget.module.scss'

interface MostActiveServicesWidgetData {
  label: string
  value: number
  color: string
  change: number
}

export interface MostActiveServicesWidgetProps {
  environmentTypes?: string[]
  types?: string[]
  title?: string
  data: MostActiveServicesWidgetData[]
  updateData?: (args: {
    environmentType?: string
    timeRange?: TIME_RANGE_ENUMS
    type?: string
  }) => MostActiveServicesWidgetData[]
}

export const useDefaultEnvironmentTypes = (): string[] => {
  const { getString } = useStrings()
  return [
    getString('all'),
    getString('dashboards.serviceDashboard.prod'),
    getString('dashboards.serviceDashboard.nonProd')
  ]
}

export const useDefaultTypes = (): string[] => {
  const { getString } = useStrings()
  return [getString('deploymentsText'), getString('errors')]
}

export const MostActiveServicesWidget: React.FC<MostActiveServicesWidgetProps> = props => {
  const DEFAULT_ENVIRONMENT_TYPES = useMemo(useDefaultEnvironmentTypes, [])
  const DEFAULT_TYPES = useMemo(useDefaultTypes, [])
  const {
    environmentTypes = DEFAULT_ENVIRONMENT_TYPES,
    types = DEFAULT_TYPES,
    title,
    data: initialData,
    updateData
  } = props
  const [selectedEnvironmentType, setSelectedEnvironmentType] = useState(environmentTypes[0])
  const [selectedType, setSelectedType] = useState(types[0])
  const [data, setData] = useState(initialData)
  const { timeRange } = useContext(DeploymentsTimeRangeContext)
  useEffect(() => {
    if (updateData) {
      const updatedData = updateData?.({ environmentType: selectedEnvironmentType, timeRange, type: selectedType })
      setData(updatedData)
    }
  }, [selectedEnvironmentType, timeRange, selectedType, updateData])

  const EnvironmnentTypeComponent = useMemo(
    () => (
      <Layout.Horizontal>
        {environmentTypes.map(environmentType => (
          <Text
            key={environmentType}
            font={{ size: 'small', weight: 'semi-bold' }}
            intent={environmentType === selectedEnvironmentType ? 'primary' : 'none'}
            className={css.environmentType}
            onClick={() => setSelectedEnvironmentType(environmentType)}
          >
            {environmentType}
          </Text>
        ))}
      </Layout.Horizontal>
    ),
    [environmentTypes, selectedEnvironmentType]
  )

  const Tickers = useMemo(() => {
    return data.map((service, index) => {
      const { change } = service
      const color = change > 0 ? Color.RED_500 : Color.GREEN_500
      return (
        <div className={css.tickerContainer} key={index}>
          {change ? <Ticker value={`${Math.abs(change)}%`} color={color} /> : <></>}
        </div>
      )
    })
  }, [data])

  const weightedStackData = useMemo(
    () =>
      data.map(service => ({
        label: service.label,
        value: service.value,
        color: service.color
      })),
    [data]
  )

  const TypeComponent = useMemo(
    () =>
      types.map(type => (
        <div
          key={type}
          onClick={() => setSelectedType(type)}
          className={cx(css.typeContainer, { [css.typeSelected]: type === selectedType })}
        >
          <Text
            font={{ size: 'xsmall', weight: 'semi-bold' }}
            color={type === selectedType ? Color.WHITE : Color.BLACK}
          >
            {type}
          </Text>
        </div>
      )),
    [types, selectedType]
  )

  return (
    <Card className={css.card}>
      <Layout.Vertical>
        <Layout.Vertical margin={{ bottom: 'xxlarge' }}>
          {EnvironmnentTypeComponent}
          {title && (
            <Text font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
              {title}
            </Text>
          )}
        </Layout.Vertical>
        <Layout.Horizontal margin={{ bottom: 'large' }}>{TypeComponent}</Layout.Horizontal>
        <Layout.Horizontal flex={{ distribution: 'space-between' }} height={150} className={css.stackTickerContainer}>
          <div className={css.weightedStackContainer}>
            <WeightedStack
              data={weightedStackData}
              labelPosition={LabelPosition.INSIDE}
              stackStyles={css.stack}
              progressBarStyles={css.progressBar}
              labelStyles={css.label}
            />
          </div>
          <Layout.Vertical>{Tickers}</Layout.Vertical>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Card>
  )
}
