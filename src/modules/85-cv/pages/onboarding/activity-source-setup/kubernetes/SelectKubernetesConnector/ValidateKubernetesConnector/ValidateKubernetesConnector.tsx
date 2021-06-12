import React, { useEffect } from 'react'
import { Text, Color, Icon, IconName } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useValidateConnector } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { KubernetesActivitySourceInfo } from '../../KubernetesActivitySourceUtils'

interface StatusMap {
  [key: string]: {
    style: {
      icon: string
      label: string
    }
    icon: IconName
    testId: string
  }
}

const STATUSMAP: StatusMap = {
  error: {
    style: {
      icon: Color.RED_500,
      label: Color.RED_600
    },
    icon: 'error',
    testId: 'connectorError'
  },
  success: {
    style: {
      icon: Color.GREEN_500,
      label: Color.GREEN_600
    },
    icon: 'tick',
    testId: 'connectorSuccess'
  },
  progress: {
    style: {
      icon: Color.YELLOW_500,
      label: Color.GREY_600
    },
    icon: 'steps-spinner',
    testId: 'connectorProgress'
  }
}

function LoaderAndLabel(status: string, message: string): JSX.Element {
  const { style, icon, testId } = STATUSMAP[status]
  return (
    <div style={{ display: 'flex', marginTop: '1em' }}>
      <Icon name={icon} size={16} color={style.icon} margin={{ right: 'small' }} />
      <Text test-id={testId} color={style.label}>
        {message}
      </Text>
    </div>
  )
}

export default function ValidateConnector(props: {
  values: KubernetesActivitySourceInfo | null
  onSuccess: (values: KubernetesActivitySourceInfo) => void
}): JSX.Element | null {
  const { values, onSuccess } = props
  const { connectorRef } = values || {}
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { data, loading, error, refetch } = useValidateConnector({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      connectorIdentifier: 'dasdasdada', //connectorRef?.value.toString() || '',
      tracingId: `${connectorRef?.value.toString()}:testConnection`,
      dataSourceType: 'KUBERNETES'
    }
  })

  useEffect(() => {
    if (!loading && !error) {
      values && onSuccess({ ...values })
    }
  }, [data, loading, error, refetch])

  // useEffect(() => {
  //   if (!loading && error) {
  // refetch({
  //   queryParams: {
  //     accountId,
  //     projectIdentifier,
  //     orgIdentifier,
  //     connectorIdentifier: 'dasdasdada', //connectorRef?.value.toString() || '',
  //     tracingId: `${connectorRef?.value.toString()}:testConnection`,
  //     dataSourceType: 'KUBERNETES'
  //   }
  // })
  //   }
  // }, [data, loading, error, refetch])

  if (!loading) {
    if (error) {
      return LoaderAndLabel('error', (error?.data as Error)?.message || error?.message)
    } else {
      return LoaderAndLabel('success', `Connector validation successful`)
    }
  } else {
    return LoaderAndLabel('progress', `Validating selected connector`)
  }
}
