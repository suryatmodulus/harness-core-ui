import React from 'react'
import { get } from 'lodash-es'
import { Position } from '@blueprintjs/core'
import { Popover } from '@wings-software/uicore'

import { String as StrTemplate } from 'framework/strings'
import type { StageDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { ServicePopoverCard } from '@cd/components/ServicePopoverCard/ServicePopoverCard'

import css from './CDStageDetails.module.scss'

export function CDStageDetails(props: StageDetailProps): React.ReactElement {
  const { stage } = props

  return (
    <div className={css.main}>
      <div>
        <StrTemplate className={css.title} tagName="div" stringID="serviceOrServices" />
        <ul className={css.values}>
          <li>
            <Popover
              wrapperTagName="div"
              targetTagName="div"
              interactionKind="hover"
              position={Position.BOTTOM_RIGHT}
              className={css.serviceWrapper}
            >
              <div className={css.serviceName}>{get(stage, 'moduleInfo.cd.serviceInfo.displayName', null)}</div>
              <ServicePopoverCard service={get(stage, 'moduleInfo.cd.serviceInfo')} />
            </Popover>
          </li>
        </ul>
      </div>
      <div>
        <StrTemplate className={css.title} tagName="div" stringID="environmentOrEnvironments" />
        <ul className={css.values}>
          <li>{get(stage, 'moduleInfo.cd.infraExecutionSummary.name', null)}</li>
        </ul>
      </div>
    </div>
  )
}
