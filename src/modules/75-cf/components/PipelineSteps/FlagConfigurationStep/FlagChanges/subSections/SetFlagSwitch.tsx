/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect } from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { CFPipelineInstructionType } from '../../types'
import SubSection, { SubSectionProps } from '../SubSection'
import css from './SetFlagSwitch.module.scss'

export interface SetFlagSwitchProps extends SubSectionProps {
  prefix: (fieldName: string) => string
  setField: (fieldName: string, value: unknown) => void
}

const SetFlagSwitch: FC<SetFlagSwitchProps> = ({ setField, prefix, ...props }) => {
  const { getString } = useStrings()

  useEffect(() => {
    setField('identifier', `${CFPipelineInstructionType.SET_FEATURE_FLAG_STATE}Identifier`)
    setField('type', CFPipelineInstructionType.SET_FEATURE_FLAG_STATE)
  }, [])

  return (
    <SubSection data-testid="flagChanges-setFlagSwitch" {...props}>
      <FormInput.Select
        className={css.hideLabelText}
        name={prefix('spec.state')}
        items={[
          { label: getString('common.ON'), value: FeatureFlagActivationStatus.ON },
          { label: getString('common.OFF'), value: FeatureFlagActivationStatus.OFF }
        ]}
        label={getString('cf.pipeline.flagConfiguration.switchTo')}
        placeholder={getString('cf.pipeline.flagConfiguration.selectOnOrOff')}
      />
    </SubSection>
  )
}

export default SetFlagSwitch
