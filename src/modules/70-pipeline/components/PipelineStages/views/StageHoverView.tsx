import React from 'react'
import { FontVariation, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { SelectedAddStageTypeData } from './AddStageView'
import css from './AddStageView.module.scss'

interface StageHoverViewProps {
  selectedStageType: SelectedAddStageTypeData | undefined
}
const StageHoverView = ({ selectedStageType }: StageHoverViewProps): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <div className={css.hoverStageSection}>
      {selectedStageType?.isComingSoon && <div className={css.comingSoonBanner}>{getString('common.comingSoon2')}</div>}
      <Icon
        name="main-close"
        size={12}
        className={css.closeIcon}
        onClick={() => window.dispatchEvent(new CustomEvent('CLOSE_CREATE_STAGE_POPOVER'))}
      />
      <Layout.Vertical
        flex={{ justifyContent: 'space-between' }}
        height={'100%'}
        style={{ paddingTop: selectedStageType?.isComingSoon ? 'var(--spacing-8)' : '' }}
      >
        <Layout.Vertical>
          <Layout.Horizontal margin={{ bottom: 'medium' }} flex={{ justifyContent: 'flex-start' }}>
            <Text font={{ variation: FontVariation.H6 }} className={css.hoverTitle}>
              {selectedStageType?.title}
            </Text>
          </Layout.Horizontal>
          <Text font={{ variation: FontVariation.BODY2 }} className={css.stageDescription}>
            {selectedStageType?.description}
          </Text>
        </Layout.Vertical>
        <Icon size={120} name={selectedStageType?.hoverIcon as IconName} />
      </Layout.Vertical>
    </div>
  )
}

export default StageHoverView
