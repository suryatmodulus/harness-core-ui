import React from 'react'
import { Button, ButtonSize, ButtonVariation, Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import templateIllustration from '@templates-library/pages/TemplatesPage/images/templates-illustration.svg'
import { useStrings } from 'framework/strings'
import { NewTemplatePopover } from '@templates-library/pages/TemplatesPage/views/NewTemplatePopover'
import css from './NoResultsView.module.scss'

export interface NoResultsViewProps {
  hasSearchParam?: boolean
  onReset?: () => void
  text: string
  minimal?: boolean
}

export default function NoResultsView({
  hasSearchParam = false,
  onReset,
  text,
  minimal = false
}: NoResultsViewProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <Container height={'100%'} className={css.main}>
      {hasSearchParam ? (
        <Layout.Vertical height={'100%'} spacing={'xlarge'} flex={{ align: 'center-center' }}>
          <Icon color={Color.GREY_400} name="template-library" size={50} />
          <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_400}>
            {getString('common.filters.noMatchingFilterData')}
          </Text>
          <Button
            variation={ButtonVariation.LINK}
            size={ButtonSize.LARGE}
            onClick={onReset}
            text={getString('common.filters.clearFilters')}
          />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical
          spacing={minimal ? 'large' : 'xxxlarge'}
          height={'100%'}
          flex={{ align: 'center-center' }}
          className={minimal ? css.minimal : ''}
        >
          <img src={templateIllustration} className={css.illustration} />
          <Text className={css.infoText} color={Color.GREY_700}>
            {text}
          </Text>
          {!minimal && <NewTemplatePopover />}
        </Layout.Vertical>
      )}
    </Container>
  )
}
