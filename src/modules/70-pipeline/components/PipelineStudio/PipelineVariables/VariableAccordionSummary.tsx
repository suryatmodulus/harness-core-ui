import React from 'react'
import { Icon } from '@wings-software/uicore'
import css from './PipelineVariables.module.scss'

const VariableAccordionSummary = (props: { children: React.ReactNode; hideIcons?: boolean }) => {
  return (
    <div className={css.accordionSummary}>
      <div>
        {/* //className={css.variableSummaryIcons}> */}
        {!props.hideIcons && (
          <>
            <Icon name="accordion-collapsed" className={css.iconCollapsed} />
            <Icon name="accordion-expanded" className={css.iconExpanded} />
          </>
        )}
      </div>
      <div>{props.children}</div>
    </div>
  )
}

export default VariableAccordionSummary
