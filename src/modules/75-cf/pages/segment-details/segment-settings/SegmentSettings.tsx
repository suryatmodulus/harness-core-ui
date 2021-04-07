import React from 'react'
import { noop } from 'lodash-es'
import { Container, Tab, Tabs, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { Feature, Segment } from 'services/cf'
import { AuditLogs } from '@cf/components/AuditLogs/AuditLogs'
import { AuditLogObjectType } from '@cf/utils/CFUtils'
import { SegmentRules } from '../SegmentRules'
import css from './SegmentSettings.module.scss'

export const SegmentSettings: React.FC<{ segment?: Segment | undefined | null }> = ({ segment }) => {
  const { getString } = useStrings()

  return (
    <Container height="100%" width="100%" style={{ overflow: 'auto', background: '#fcfdfd' }}>
      <Container className={css.tabContainer}>
        <Tabs id="targetSettings">
          <Tab
            id="attributes"
            title={<Text className={css.tabTitle}>{getString('cf.shared.rules')}</Text>}
            panel={segment ? <SegmentRules segment={segment} onUpdate={noop} /> : undefined}
          />
          <Tab
            id="segments"
            title={<Text className={css.tabTitle}>{getString('activityLog')}</Text>}
            panel={
              <Container style={{ marginTop: '-20px', height: 'calc(100vh - 217px)', overflow: 'auto' }}>
                <AuditLogs
                  flagData={{ name: segment?.name, identifier: segment?.identifier } as Feature}
                  objectType={AuditLogObjectType.Segment}
                />
              </Container>
            }
          />
        </Tabs>
      </Container>
    </Container>
  )
}
