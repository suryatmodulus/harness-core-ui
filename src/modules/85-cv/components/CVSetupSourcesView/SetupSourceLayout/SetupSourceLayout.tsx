import React from 'react'
import { Button, Container } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import css from './SetupSourceLayout.module.scss'

export interface FooterCTAProps {
  onNext?: () => void
  onPrevious?: () => void
  isSubmit?: boolean
}

export interface SetupSourceLayoutProps {
  content: React.ReactNode
  leftPanelContent?: React.ReactNode
  rightPanelContent?: React.ReactNode
  footerCTAProps?: FooterCTAProps
}

export function FooterCTA(props: FooterCTAProps): JSX.Element {
  const { onNext, onPrevious, isSubmit } = props
  const { getString } = useStrings()
  return (
    <Container className={css.footerCta}>
      {onPrevious && (
        <Button icon="chevron-left" onClick={() => onPrevious()}>
          {getString('previous')}
        </Button>
      )}
      {onNext && (
        <Button icon="chevron-right" className={css.nextButton} onClick={() => onNext()}>
          {isSubmit ? getString('submit') : getString('next')}
        </Button>
      )}
    </Container>
  )
}

export function SetupSourceLayout(props: SetupSourceLayoutProps): JSX.Element {
  const { content, leftPanelContent, rightPanelContent, footerCTAProps } = props
  return (
    <Container className={css.main}>
      <Container className={css.contentContainer}>
        <Container className={css.leftPanel}>{leftPanelContent}</Container>
        <Container className={css.content}>{content}</Container>
        <Container className={css.rightPanel}>{rightPanelContent}</Container>
      </Container>
      {footerCTAProps && <FooterCTA {...footerCTAProps} />}
    </Container>
  )
}
