import React from 'react'

import { Switch as CoreSwitch, SwitchProps as CoreSwitchProps, Popover } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import type { FeatureRequest } from 'framework/featureStore/featureStoreUtil'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'

interface SwitchProps extends CoreSwitchProps {
  featureProps: FeatureProps
}

interface FeatureProps {
  featureRequest: FeatureRequest
}

const FeatureSwitch: React.FC<SwitchProps> = ({ featureProps, ...restProps }) => {
  const { enabled: featureEnabled } = useFeature({
    featureRequest: featureProps?.featureRequest
  })

  const toolTip = <FeatureWarningTooltip featureName={featureProps.featureRequest.featureName} />

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
