import React, { useMemo } from 'react'
import { noop } from 'lodash-es'
import { Text, Container, Color, Icon, Layout, Button, ButtonVariation } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ChangeTitleData } from '../../ChangeEventCard.types'
import { getIconByChangeType } from './ChangeTitle.utils'
import css from './ChangeTitle.module.scss'

export default function ChangeTitle({ changeTitleData }: { changeTitleData: ChangeTitleData }): JSX.Element {
  const { getString } = useStrings()
  const { name, executionId, type, url } = changeTitleData
  const titleOptions = useMemo(
    () =>
      url
        ? {
            tooltip: name,
            className: css.addEllipsis
          }
        : {},
    [url, name]
  )

  return (
    <Container padding={{ top: 'medium', bottom: 'medium' }} className={css.main}>
      <Icon name={getIconByChangeType(type)} size={24} />
      <Layout.Vertical>
        <Text {...titleOptions} font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_800}>
          {name}
        </Text>
        <Text font={{ size: 'xsmall' }} color={Color.GREY_800}>
          {getString('cd.serviceDashboard.executionId')}
          <span>{executionId}</span>
        </Text>
      </Layout.Vertical>
      {url ? (
        <Button
          onClick={() => {
            url ? window.open(`/#${url}`, '_blank') : noop
          }}
          className={css.redirectButton}
          text={getString('cv.changeSource.changeSourceCard.viewPipeline')}
          icon="share"
          iconProps={{ size: 12 }}
          variation={ButtonVariation.SECONDARY}
        />
      ) : null}
    </Container>
  )
}
