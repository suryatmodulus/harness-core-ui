import React from 'react'
import { Button } from '@wings-software/uicore'
import { Popover, Position } from '@blueprintjs/core'

import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { String } from 'framework/exports'
import { getPipelineStagesMap } from '@pipeline/utils/executionUtils'
import { ServicePopoverCard } from '@pipeline/components/ServicePopoverCard/ServicePopoverCard'
import type { CDPipelineModuleInfo, CDStageModuleInfo, ServiceExecutionSummary } from 'services/cd-ng'

import css from '../ExecutionCard.module.scss'

const SERVICES_LIMIT = 2

export interface ServicesDeployedProps {
  pipelineExecution: PipelineExecutionSummary
}

export default function ServicesDeployed(props: ServicesDeployedProps): React.ReactElement {
  const { pipelineExecution } = props
  const serviceIdentifiers: string[] =
    ((pipelineExecution?.moduleInfo?.cd as CDPipelineModuleInfo)?.serviceIdentifiers as string[]) || []
  const [showMore, setShowMore] = React.useState(false)
  const length = serviceIdentifiers.length

  const servicesMap = React.useMemo(() => {
    const stagesMap = getPipelineStagesMap(pipelineExecution.layoutNodeMap, pipelineExecution.startingNodeId)
    const map = new Map<string, ServiceExecutionSummary>()

    stagesMap.forEach(stage => {
      const serviceInfo = (stage.moduleInfo?.cd as CDStageModuleInfo)?.serviceInfo
      if (serviceInfo?.identifier) {
        map.set(serviceInfo.identifier, serviceInfo)
      }
    })

    return map
  }, [pipelineExecution])
  const items = showMore && length > SERVICES_LIMIT ? serviceIdentifiers : serviceIdentifiers?.slice(0, SERVICES_LIMIT)

  function toggle(e: React.MouseEvent<Element>): void {
    e.preventDefault()
    e.stopPropagation()
    setShowMore(status => !status)
  }

  return (
    <div className={css.servicesDeployed}>
      <String
        tagName="div"
        className={css.serviceLabel}
        stringID="executionList.servicesDeployedText"
        vars={{ size: length }}
      />
      <div className={css.servicesList}>
        {items.map((identifier: string) => {
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
              <div className={css.serviceName}>{service.displayName}</div>
              <ServicePopoverCard service={service} />
            </Popover>
          )
        })}
      </div>
      {length > SERVICES_LIMIT ? (
        <Button
          className={css.infoToggle}
          rightIcon={showMore ? 'chevron-up' : 'chevron-down'}
          minimal
          small
          intent="primary"
          onClick={toggle}
          text={showMore ? null : `(+${length - SERVICES_LIMIT})`}
        />
      ) : null}
    </div>
  )
}
