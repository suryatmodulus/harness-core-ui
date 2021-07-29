import React from 'react'
import { Icon, IconName, Layout } from '@wings-software/uicore'
import type { SelectedAddStageTypeData } from './AddStageView'

import css from './AddStageView.module.scss'

interface StageHoverViewProps {
  selectedStageType: SelectedAddStageTypeData | undefined
}
const StageHoverView = ({ selectedStageType }: StageHoverViewProps): React.ReactElement => {
  return (
    <div className={css.hoverStageSection}>
      <Icon
        name="main-close"
        size={12}
        className={css.closeIcon}
        onClick={() => window.dispatchEvent(new CustomEvent('CLOSE_CREATE_STAGE_POPOVER'))}
      />
      <Layout.Vertical flex={{ justifyContent: 'space-between' }} height={'100%'}>
        <Layout.Vertical>
          <Layout.Horizontal margin={{ bottom: 'medium' }} flex={{ justifyContent: 'center' }}>
            <div className={css.hoverTitle}> {selectedStageType?.title}</div>
          </Layout.Horizontal>
          <div className={css.stageDescription}>{selectedStageType?.description}</div>
        </Layout.Vertical>
        <Icon size={120} name={selectedStageType?.hoverIcon as IconName} />
      </Layout.Vertical>
    </div>
  )
}

export default StageHoverView
