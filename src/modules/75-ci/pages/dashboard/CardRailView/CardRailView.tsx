import React, { useRef, useEffect, useState } from 'react'
import { Container, Link, Text } from '@wings-software/uicore'
import classnames from 'classnames'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import EmptyRepositories from './EmptyRepositories.svg'
import EmptyFailedBuilds from './EmptyFailedBuilds.svg'
import EmptyActiveBuilds from './EmptyActiveBuilds.svg'
import RepoIconUrl from './RepoIcon.svg'
import FailedBuildIconUrl from './FailedBuildIcon.svg'
import ActiveBuildIconUrl from './ActiveBuildIcon.svg'
import styles from './CardRailView.module.scss'

export interface CardRailViewProps {
  contentType: 'REPOSITORY' | 'FAILED_BUILD' | 'ACTIVE_BUILD'
  titleSideContent?: React.ReactNode
  isLoading?: boolean
  onShowAll?(): void
  children?: React.ReactNode
}

export default function CardRailView({
  contentType,
  titleSideContent,
  isLoading,
  onShowAll,
  children
}: CardRailViewProps) {
  const { getString } = useStrings()
  const contentRef = useRef<HTMLDivElement>(null)
  const [scrollbarVisible, setScrollbarVisible] = useState(false)
  const titles = {
    REPOSITORY: getString('repositories'),
    FAILED_BUILD: getString('ci.dashboard.failedBuilds'),
    ACTIVE_BUILD: getString('ci.dashboard.activeBuilds')
  }

  const icons = {
    REPOSITORY: RepoIconUrl,
    FAILED_BUILD: FailedBuildIconUrl,
    ACTIVE_BUILD: ActiveBuildIconUrl
  }

  const emptyIcons = {
    REPOSITORY: EmptyRepositories,
    FAILED_BUILD: EmptyFailedBuilds,
    ACTIVE_BUILD: EmptyActiveBuilds
  }

  const emptyMsg = {
    REPOSITORY: getString('ci.dashboard.noRepositories'),
    FAILED_BUILD: getString('ci.dashboard.noFailedBuilds'),
    ACTIVE_BUILD: getString('ci.dashboard.noActiveBuilds')
  }

  const onResize = () => {
    if (contentRef.current) {
      const visible = contentRef.current.scrollHeight > contentRef.current.offsetHeight
      if (scrollbarVisible !== visible) {
        setScrollbarVisible(visible)
      }
    }
  }

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  const isEmpty = !isLoading && React.Children.count(children) === 0

  return (
    <Container className={styles.main}>
      <Container className={styles.header}>
        <img src={icons[contentType]} />
        <Text className={styles.title}>{titles[contentType]}</Text>
        {titleSideContent}
      </Container>
      <Container
        ref={contentRef}
        padding={scrollbarVisible ? { right: 'xsmall' } : undefined}
        className={classnames(styles.content, { [styles.contentEmpty]: isEmpty })}
      >
        {isEmpty && (
          <Container className={styles.emptyView}>
            <Container className={styles.emptyViewItem} />
            <Container className={styles.emptyViewItem} />
            <Container className={styles.emptyViewCard}>
              <img src={emptyIcons[contentType]} />
              <Text>{emptyMsg[contentType]}</Text>
            </Container>
          </Container>
        )}
        {isLoading && (
          <>
            <Container height={60} className={Classes.SKELETON} />
            <Container height={60} className={Classes.SKELETON} />
            <Container height={60} className={Classes.SKELETON} />
          </>
        )}
        {!isEmpty && !isLoading && children}
      </Container>
      {onShowAll && !isEmpty && !isLoading && (
        <Link className={styles.showMoreLink} withoutHref onClick={onShowAll}>
          {getString('seeAll')}
        </Link>
      )}
    </Container>
  )
}
