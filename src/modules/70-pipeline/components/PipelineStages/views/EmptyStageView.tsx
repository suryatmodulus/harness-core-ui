import React from 'react'
import cx from 'classnames'
import { Icon, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import css from './AddStageView.module.scss'

const EmptyStageView = (): React.ReactElement => {
  const { getString } = useStrings()

  return (
    <div className={css.emptyStageView}>
      <Icon
        name="main-close"
        size={12}
        className={css.closeIcon}
        onClick={() => window.dispatchEvent(new CustomEvent('CLOSE_CREATE_STAGE_POPOVER'))}
      />
      <Layout.Vertical margin={{ top: 'xxlarge', bottom: 'xxlarge', right: 'medium', left: 'medium' }}>
        <Layout.Horizontal margin={{ bottom: 'medium', top: 'large' }} flex={{ justifyContent: 'center' }}>
          <Icon name="add-stage" size={74} />
        </Layout.Horizontal>
        <div className={cx(css.stageDescription, css.hoverStageDescription)}>
          {getString('pipeline.addStage.description')}
        </div>
      </Layout.Vertical>
    </div>
  )
}

export default EmptyStageView
