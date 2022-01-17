import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const SLIContextualHelpText = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.sli.intro')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.sli.healthSource')}</Text>
      <Text className={css.title}>{getString('cv.slos.contextualHelp.sli.whatIsSli')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.sli.sliDefinition')}</Text>
      <Text>{getString('cv.slos.contextualHelp.sli.sliDefinition2')}</Text>
    </>
  )
}

export default SLIContextualHelpText
