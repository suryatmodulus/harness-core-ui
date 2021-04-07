import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import { TimeAgo } from '@common/exports'
import { useStrings } from 'framework/exports'

export enum FeatureFlagStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  NEVER_REQUESTED = 'never-requested'
}

export interface FlagStatusProps {
  status?: FeatureFlagStatus
  lastAccess?: number
}

export const FlagStatus: React.FC<FlagStatusProps> = ({ status, lastAccess }) => {
  const { getString } = useStrings()
  const isNeverRequested = status === FeatureFlagStatus.NEVER_REQUESTED
  const textStyle = {
    fontWeight: 600,
    fontSize: '10px',
    lineHeight: '16px',
    textAlign: 'center',
    borderRadius: '5px',
    padding: '2px 6px',
    ...{ color: '#8EB0F4', background: '#EDF8FF' },
    ...(status === FeatureFlagStatus.INACTIVE ? { background: '#F3F3FA', color: '#9293AB' } : undefined),
    ...(isNeverRequested
      ? {
          color: 'rgba(146, 170, 202, 0.8)',
          background: 'transparent',
          border: '1px solid rgba(189, 210, 219, 0.6)',
          padding: '0 4px'
        }
      : undefined)
  } as React.CSSProperties
  const subTextStyle = { color: '#8F90A6', fontSize: '12px' }
  const ComponentLayout = isNeverRequested ? Layout.Vertical : Layout.Horizontal

  if (!status || !lastAccess) {
    return null
  }

  return (
    <ComponentLayout spacing="xsmall" style={{ alignItems: isNeverRequested ? 'baseline' : 'center' }}>
      <Text inline style={textStyle}>
        {(status || '').toLocaleUpperCase()}
      </Text>
      {(!isNeverRequested && <TimeAgo time={lastAccess} icon={undefined} style={subTextStyle} />) || (
        <Text style={subTextStyle}>{getString('cf.featureFlags.makeSure')}</Text>
      )}
    </ComponentLayout>
  )
}
