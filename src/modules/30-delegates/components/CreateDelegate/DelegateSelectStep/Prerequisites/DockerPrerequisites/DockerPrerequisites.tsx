import React from 'react'

import { Text } from '@wings-software/uicore'
import { useCommunity } from 'framework/LicenseStore/useCommunity'
import { useStrings } from 'framework/strings'
import css from './DockerPrerequisites.module.scss'

const DockerPrerequisites = () => {
  const { getString } = useStrings()
  const isCommunity = useCommunity()
  return (
    <div>
      <Text className={css.prereqTitle}>{getString('delegates.delegateCreation.dockerPrerequisites.title')}</Text>
      <Text font={{ size: 'normal' }} className={css.ensureText}>
        {getString('delegates.delegateCreation.dockerPrerequisites.ensureInst')}
      </Text>
      <Text font={{ size: 'normal' }} className={css.prereqText}>
        {getString('delegates.delegateCreation.dockerPrerequisites.sysReq')}
      </Text>
      <Text font={{ size: 'normal' }} className={css.prereqText}>
        {getString('delegates.delegateCreation.dockerPrerequisites.minCPU')}
      </Text>
      <Text font={{ size: 'normal' }} className={css.prereqText}>
        {isCommunity
          ? getString('delegates.delegateCreation.dockerPrerequisites.minMemCommunity')
          : getString('delegates.delegateCreation.dockerPrerequisites.minMem')}
      </Text>
    </div>
  )
}

export default DockerPrerequisites
