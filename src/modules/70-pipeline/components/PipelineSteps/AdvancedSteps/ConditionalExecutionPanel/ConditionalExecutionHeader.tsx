import React from 'react'
import { Color, Link, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ModeEntityNameMap } from './ConditionalExecutionPanelUtils'
import type { Modes } from '../common'

const DOCUMENT_URL = 'https://ngdocs.harness.io/'

export interface ConditionalExecutionStatusProps {
  mode: Modes
}

export default function ConditionalExecutionHeader(props: ConditionalExecutionStatusProps): React.ReactElement {
  const { mode } = props
  const { getString } = useStrings()

  return (
    <Text color={Color.GREY_700} style={{ fontSize: '12px' }}>
      {getString('pipeline.conditionalExecution.subTitle', { entity: ModeEntityNameMap[mode] })}{' '}
      <Link rel="noreferrer" color={Color.BLUE_400} target="_blank" href={DOCUMENT_URL} style={{ fontSize: '12px' }}>
        {getString('pipeline.createPipeline.learnMore')}
      </Link>
    </Text>
  )
}
