import React, { FC } from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import SubSection, { SubSectionProps } from '../SubSection'
import css from './SetFlagSwitch.module.scss'

const SetFlagSwitch: FC<SubSectionProps> = props => {
  const { getString } = useStrings()

  return (
    <SubSection data-testid="flagChanges-setFlagSwitch" {...props}>
      <FormInput.Select
        className={css.hideLabelText}
        name="spec.state"
        items={[
          { label: getString('cf.shared.on'), value: FeatureFlagActivationStatus.ON },
          { label: getString('cf.shared.off'), value: FeatureFlagActivationStatus.OFF }
        ]}
        label={getString('cf.pipeline.flagConfiguration.switchTo')}
        placeholder={getString('cf.pipeline.flagConfiguration.selectOnOrOff')}
      />
    </SubSection>
  )
}

export default SetFlagSwitch
