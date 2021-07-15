import React from 'react'
import { Container, Tab, Tabs, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { Target } from 'services/cf'
import { DetailHeading } from '../DetailHeading'
import { TabAttributes } from '../attributes/TabAtrributes'
import { TabSegments } from '../segments/TabSegments'
import css from '../TargetDetailPage.module.scss'

export const TargetSettings: React.FC<{ target?: Target | undefined | null }> = ({ target }) => {
  const { getString } = useStrings()

  return (
    <Container
      width={480}
      height="100%"
      style={{ background: '#F8FAFB', overflow: 'auto', minWidth: '480px' }}
      className={css.targetSettings}
    >
      <DetailHeading style={{ paddingBottom: 0 }} data-tooltip-id="ff_targetTargetSettings_heading">
        {getString('cf.targetDetail.targetSetting')}
      </DetailHeading>
      <Container className={css.tabContainer}>
        <Tabs id="targetSettings">
          <Tab
            id="attributes"
            title={
              <Text className={css.tabTitle}>
                {/* At minimal, there are always two attributes: name and identifier */}
                {getString('cf.targetDetail.attributes', { counter: Object.keys(target?.attributes || {}).length + 2 })}
              </Text>
            }
            panel={<TabAttributes target={target} />}
          />
          <Tab
            id="segments"
            title={<Text className={css.tabTitle}>{getString('cf.shared.segments')}</Text>}
            panel={<TabSegments target={target} />}
          />
        </Tabs>
      </Container>
    </Container>
  )
}
