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
  labelNamesResponse
}: SelectHealthSourceServicesProps): JSX.Element {
  const { getString } = useStrings()
  const { continuousVerification, healthScore } = values
  return (
    <Container className={css.main}>
      <Container className={css.checkBoxGroup}>
        <Text className={css.groupLabel}>{getString('cv.monitoredServices.assignLabel')}</Text>
        <FormInput.CheckBox
          label={getString('cv.monitoredServices.continuousVerification')}
          name={HealthSourceServices.CONTINUOUS_VERIFICATION}
        />
        <FormInput.CheckBox label={getString('cv.healthScore')} name={HealthSourceServices.HEALTHSCORE} />
        <FormInput.CheckBox label={getString('cv.slos.sli')} name={HealthSourceServices.SLI} />
      </Container>
      {(continuousVerification || healthScore) && (
        <RiskProfile
          metricPackResponse={metricPackResponse}
          labelNamesResponse={labelNamesResponse}
          continuousVerificationEnabled={continuousVerification}
        />
      )}
    </Container>
  )
}
