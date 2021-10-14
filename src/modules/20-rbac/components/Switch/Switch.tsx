import React from 'react'

import { Switch as CoreSwitch, SwitchProps as CoreSwitchProps, Popover } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import type { FeatureRequest } from 'framework/featureStore/FeaturesContext'
import { useFeature } from '@common/hooks/useFeatures'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarning'

interface SwitchProps extends CoreSwitchProps {
  featureProps: FeatureProps
}

interface FeatureProps {
  featureRequest: FeatureRequest
}

const FeatureSwitch: React.FC<SwitchProps> = ({ featureProps, ...restProps }) => {
  const { enabled: featureEnabled, featureDetail } = useFeature({
    featureRequest: featureProps?.featureRequest
  })

  const module = featureDetail?.moduleType && (featureDetail.moduleType.toLowerCase() as Module)

  const toolTip = <FeatureWarningTooltip featureName={featureProps.featureRequest.featureName} module={module} />

  if (featureEnabled) {
    return <CoreSwitch {...restProps} />
  }

  return (
    <Popover interactionKind={PopoverInteractionKind.HOVER} content={toolTip}>
      <CoreSwitch {...restProps} disabled />
    </Popover>
  )
}

export default FeatureSwitch
