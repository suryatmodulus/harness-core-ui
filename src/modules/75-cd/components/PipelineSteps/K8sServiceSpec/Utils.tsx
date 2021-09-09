import React from 'react'
import { get } from 'lodash-es'
import { isEmpty } from 'lodash-es'
import { Tooltip } from '@blueprintjs/core'
import { Icon, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ArtifactListConfig, ServiceSpec } from 'services/cd-ng'

import { getNonRuntimeFields } from './K8sServiceSpecHelper'
import css from './K8sServiceSpec.module.scss'

interface PrimaryArtifactTooltipProps {
  isPrimaryArtifactsRuntime: boolean
  artifacts?: ArtifactListConfig
  template?: ServiceSpec
}

export enum AsyncStatus {
  INIT = 'INIT',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  INPROGRESS = 'INPROGRESS'
}

export const PrimaryArtifactTooltip = ({
  isPrimaryArtifactsRuntime,
  artifacts,
  template
}: PrimaryArtifactTooltipProps) => {
  const { getString } = useStrings()
  return isPrimaryArtifactsRuntime ? (
    <Text className={css.inputheader}>
      {getString('primaryArtifactText')}
      {!isEmpty(
        JSON.parse(getNonRuntimeFields(get(artifacts, `primary.spec`), get(template, 'artifacts.primary.spec')))
      ) && (
        <Tooltip
          position="top"
          className={css.artifactInfoTooltip}
          content={getNonRuntimeFields(get(artifacts, `primary.spec`), get(template, 'artifacts.primary.spec'))}
        >
          <Icon name="info" />
        </Tooltip>
      )}
    </Text>
  ) : null
}
