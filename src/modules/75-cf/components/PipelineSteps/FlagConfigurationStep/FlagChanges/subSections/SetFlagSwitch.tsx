import React, { FC, useEffect } from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import SubSection, { SubSectionProps } from '../SubSection'
import css from './SetFlagSwitch.module.scss'

export interface SetFlagSwitchProps extends SubSectionProps {
  clearField: (fieldName: string) => void
}

const SetFlagSwitch: FC<SetFlagSwitchProps> = ({ clearField, ...props }) => {
  const { getString } = useStrings()

  useEffect(
    () => () => {
      clearField('spec.state')
    },
    []
  )

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
