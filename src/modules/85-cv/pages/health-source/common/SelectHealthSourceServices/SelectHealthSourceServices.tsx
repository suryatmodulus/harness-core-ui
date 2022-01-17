/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { HealthSourceServices } from './SelectHealthSourceServices.constant'
import { RiskProfile } from './components/RiskProfile/RiskProfile'
import type { SelectHealthSourceServicesProps } from './SelectHealthSourceServices.types'
import css from './SelectHealthSourceServices.module.scss'

export default function SelectHealthSourceServices({
  values,
  metricPackResponse,
  labelNamesResponse,
  hideServiceIdentifier = false,
  hideCV,
  hideSLIAndHealthScore
}: SelectHealthSourceServicesProps): JSX.Element {
  const { getString } = useStrings()
  const { continuousVerification, healthScore } = values
  return (
    <Container className={css.main}>
      <Container className={css.checkBoxGroup}>
        <Text className={css.groupLabel}>{getString('cv.monitoredServices.assignLabel')}</Text>

        {!hideCV ? (
          <FormInput.CheckBox
            label={getString('cv.monitoredServices.continuousVerification')}
            name={HealthSourceServices.CONTINUOUS_VERIFICATION}
          />
        ) : null}

        {!hideSLIAndHealthScore ? (
          <>
            <FormInput.CheckBox label={getString('cv.healthScore')} name={HealthSourceServices.HEALTHSCORE} />
            <FormInput.CheckBox label={getString('cv.slos.sli')} name={HealthSourceServices.SLI} />
          </>
        ) : null}
      </Container>
      {(continuousVerification || healthScore) && (
        <RiskProfile
          metricPackResponse={metricPackResponse}
          labelNamesResponse={labelNamesResponse}
          continuousVerificationEnabled={continuousVerification && !hideServiceIdentifier}
        />
      )}
    </Container>
  )
}
