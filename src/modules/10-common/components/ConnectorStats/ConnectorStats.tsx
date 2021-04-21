import React from 'react'
import * as moment from 'moment'
import { Layout, Text, Color } from '@wings-software/uicore'
import { StringUtils } from '@common/exports'
import type { ConnectorConnectivityDetails } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import css from './ConnectorStats.module.scss'

interface ConnectorStatsProps {
  createdAt: number
  lastTested?: number
  lastUpdated?: number
  lastConnected?: number
  status: ConnectorConnectivityDetails['status']
  className?: string
}
const TestStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}

const getValue = (value?: number) => {
  return value ? moment.unix(value / 1000).format(StringUtils.DEFAULT_DATE_FORMAT) : null
}

const ConnectorStats: React.FC<ConnectorStatsProps> = props => {
  const { createdAt, lastUpdated, lastTested, lastConnected, className } = props
  const { getString } = useStrings()
  const nameValue = [
    {
      name: getString('common.connectorStats.connectorCreated'),
      value: getValue(createdAt)
    },
    {
      name: getString('common.connectorStats.lastTested'),
      value: getValue(lastTested)
    },
    {
      name: getString('common.connectorStats.lastUpdated'),
      value: getValue(lastUpdated)
    },
    {
      name: getString('common.lastConnectionSuccess'),
      value: getValue(lastConnected)
    }
  ]
  return (
    <>
      <Layout.Vertical className={className || css.connectorStats} spacing="large">
        {nameValue.map((item, index) => {
          if (item.value) {
            return (
              <Layout.Horizontal key={index} spacing="large" className={css.nameValueItem}>
                <span className={css.name}>{item.name}</span>
                <span className={css.value}>{item.value}</span>
                {item.name === getString('common.connectorStats.lastTested') && lastTested ? (
                  <Text
                    inline
                    icon={props.status === TestStatus.SUCCESS ? 'full-circle' : 'warning-sign'}
                    iconProps={{
                      size: props.status === TestStatus.SUCCESS ? 6 : 12,
                      color: props.status === TestStatus.SUCCESS ? Color.GREEN_500 : Color.RED_500
                    }}
                  >
                    {props.status === TestStatus.SUCCESS ? getString('common.successful') : getString('common.failed')}
                  </Text>
                ) : null}
              </Layout.Horizontal>
            )
          }
        })}
      </Layout.Vertical>
    </>
  )
}
export default ConnectorStats
