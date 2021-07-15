import React from 'react'
import cx from 'classnames'
import { Button, Container } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './SetupSourceLayout.module.scss'

export interface FooterCTAProps {
  onNext?: () => void
  onPrevious?: () => void
  isSubmit?: boolean
  className?: string
}

export interface SetupSourceLayoutProps {
  content: React.ReactNode
  leftPanelContent?: React.ReactNode
  rightPanelContent?: React.ReactNode
  footerCTAProps?: FooterCTAProps
  centerOnlyLayout?: boolean
}

export function FooterCTA(props: FooterCTAProps): JSX.Element {
  const { onNext, onPrevious, isSubmit, className } = props
  const { getString } = useStrings()
  return (
    <Container className={cx(css.footerCta, className)}>
      {onPrevious && (
        <Button icon="chevron-left" onClick={() => onPrevious()} minimal>
          {getString('previous')}
        </Button>
      )}
      {onNext && (
        <Button icon="chevron-right" className={css.nextButton} intent="primary" onClick={() => onNext()}>
          {isSubmit ? getString('submit') : getString('next')}
        </Button>
      )}
    </Container>
  )
}

export function SetupSourceLayout(props: SetupSourceLayoutProps): JSX.Element {
  const { content, leftPanelContent, rightPanelContent, centerOnlyLayout = false, footerCTAProps } = props
  return (
    <Container className={css.main}>
      <Container className={css.contentContainer}>
        {!centerOnlyLayout && <Container className={css.leftPanel}>{leftPanelContent}</Container>}
        <Container className={css.content}>{content}</Container>
        {!centerOnlyLayout && <Container className={css.rightPanel}>{rightPanelContent}</Container>}
      </Container>
      {footerCTAProps && <FooterCTA {...footerCTAProps} />}
    </Container>
  )
}
