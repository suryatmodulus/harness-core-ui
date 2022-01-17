/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Popover } from '@wings-software/uicore'
import { Position } from '@blueprintjs/core'

import { String } from 'framework/strings'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import type { CDPipelineModuleInfo, CDStageModuleInfo, ServiceExecutionSummary } from 'services/cd-ng'
import { getPipelineStagesMap } from '@pipeline/utils/executionUtils'
import { ServicePopoverCard } from '@cd/components/ServicePopoverCard/ServicePopoverCard'
import { CardVariant } from '@pipeline/utils/constants'

import css from './CDExecutionCardSummary.module.scss'

const SERVICES_LIMIT = 5

export function CDExecutionCardSummary(props: ExecutionCardInfoProps): React.ReactElement {
  const { data, nodeMap, startingNodeId, variant } = props
  const serviceIdentifiers: string[] = ((data as CDPipelineModuleInfo)?.serviceIdentifiers as string[]) || []
  const [showMore, setShowMore] = React.useState(false)
  const servicesMap = React.useMemo(() => {
    const stagesMap = getPipelineStagesMap(nodeMap, startingNodeId)
    const map = new Map<string, ServiceExecutionSummary>()

    stagesMap.forEach(stage => {
      const serviceInfo = (stage.moduleInfo?.cd as CDStageModuleInfo)?.serviceInfo

      // istanbul ignore else
      if (serviceInfo?.identifier) {
        map.set(serviceInfo.identifier, serviceInfo)
      }
    })

    return map
  }, [nodeMap, startingNodeId])
  const hasMoreItems = serviceIdentifiers.length > SERVICES_LIMIT
  const items = showMore && hasMoreItems ? serviceIdentifiers : serviceIdentifiers?.slice(0, SERVICES_LIMIT)

  function toggleSection(e: React.SyntheticEvent): void {
    e.stopPropagation()
    setShowMore(status => !status)
  }

  function killEvent(e: React.SyntheticEvent): void {
    e.stopPropagation()
  }

  return (
    <div className={css.cardSummary}>
      <String
        tagName="div"
        className={css.heading}
        stringID="executionList.servicesDeployedText"
        vars={{ size: serviceIdentifiers.length }}
      />
      {serviceIdentifiers.length > 0 ? (
        <div className={css.servicesContainer}>
          <Icon name="services" className={css.servicesIcon} size={16} />
          <div className={css.servicesList}>
            {items.map((identifier: string) => {
              if (variant === CardVariant.Default) {
                const service = servicesMap.get(identifier)

                if (!service) return null

                return (
                  <Popover
                    key={identifier}
                    wrapperTagName="div"
                    targetTagName="div"
                    interactionKind="hover"
                    position={Position.BOTTOM_RIGHT}
                    className={css.serviceWrapper}
                  >
                    <div className={css.serviceName} onClick={killEvent}>
                      {service.displayName}
                    </div>
                    <ServicePopoverCard service={service} />
                  </Popover>
                )
              } else {
                return (
                  <div className={css.serviceWrapper}>
                    <div key={identifier} className={css.serviceName}>
                      {identifier}
                    </div>
                  </div>
                )
              }
            })}
          </div>
          {hasMoreItems ? (
            <String
              className={css.toggle}
              onClick={toggleSection}
              stringID={showMore ? 'common.showLess' : 'common.plusNumberNoSpace'}
              vars={{ number: Math.abs(serviceIdentifiers.length - SERVICES_LIMIT) }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
