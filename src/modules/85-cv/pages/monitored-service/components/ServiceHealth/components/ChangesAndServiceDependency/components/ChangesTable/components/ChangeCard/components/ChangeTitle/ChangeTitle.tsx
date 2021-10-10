import React from 'react'
import { Text, Container, Color, Icon, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ChangeTitleData } from '../../ChangeCard.types'
import { getIconByChangeType } from './ChangeTitle.utils'
import css from './ChangeTitle.module.scss'

export default function ChangeTitle({ changeTitleData }: { changeTitleData: ChangeTitleData }): JSX.Element {
  const { getString } = useStrings()
  const { name, executionId, type } = changeTitleData
  return (
    <Container padding={{ top: 'medium', bottom: 'medium' }} className={css.main}>
      <Icon name={getIconByChangeType(type)} size={24} />
      <Layout.Vertical>
        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_800}>
          {name}
        </Text>
        <Text font={{ size: 'xsmall' }} color={Color.GREY_800}>
          {getString('cd.serviceDashboard.executionId')}
          <span>{executionId}</span>
        </Text>
      </Layout.Vertical>
    </Container>
  )
}
