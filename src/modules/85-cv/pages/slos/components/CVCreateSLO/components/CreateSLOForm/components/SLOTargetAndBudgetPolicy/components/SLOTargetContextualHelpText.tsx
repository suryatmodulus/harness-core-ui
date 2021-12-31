import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const SLOTargetContextualHelpText = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <>
      <Text className={css.title}>{getString('cv.slos.contextualHelp.target.compliance')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.complianceDefinition')}</Text>
      <Text margin={{ bottom: 'xsmall' }}>{getString('cv.slos.contextualHelp.target.complianceDefinition2')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.complianceDefinition3')}</Text>
      <Text className={css.title}>{getString('cv.slos.contextualHelp.target.rollingWindowBased')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.rollingWindowDefinition')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.rollingWindowDefinition2')}</Text>
      <Text className={css.title}>{getString('cv.slos.contextualHelp.target.calendarBased')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.calendarBasedDefinition')}</Text>
      <Text>{getString('cv.slos.contextualHelp.target.calendarBasedDefinition2')}</Text>
    </>
  )
}

export default SLOTargetContextualHelpText
