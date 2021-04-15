import React from 'react'
import { Container, Link, Icon, Text, IconName } from '@wings-software/uicore'
import classnames from 'classnames'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/exports'
import EmptyRepositories from './EmptyRepositories.svg'
import EmptyFailedBuilds from './EmptyFailedBuilds.svg'
import EmptyActiveBuilds from './EmptyActiveBuilds.svg'
import styles from './CardRailView.module.scss'

export interface CardRailViewProps {
  contentType: 'REPOSITORY' | 'FAILED_BUILD' | 'ACTIVE_BUILD'
  titleSideContent?: React.ReactNode
  isLoading: boolean
  onShowAll?(): void
  children: React.ReactNode
}

export default function CardRailView({
  contentType,
  titleSideContent,
  isLoading,
  onShowAll,
  children
}: CardRailViewProps) {
  const { getString } = useStrings()

  const titles = {
    REPOSITORY: getString('repositories'),
    FAILED_BUILD: getString('ci.dashboard.failedBuilds'),
    ACTIVE_BUILD: getString('ci.dashboard.activeBuilds')
  }

  const icons = {
    REPOSITORY: 'database',
    FAILED_BUILD: 'delete',
    ACTIVE_BUILD: 'warning-sign'
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

  const isEmpty = !isLoading && React.Children.count(children) === 0

  return (
    <Container className={styles.main}>
      <Container className={styles.header}>
        <Icon width={14} name={icons[contentType] as IconName} />
        <Text className={styles.title} font={{ size: 'medium' }}>
          {titles[contentType]}
        </Text>
        {titleSideContent}
      </Container>
      <Container className={classnames(styles.content, { [styles.contentEmpty]: isEmpty })}>
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
