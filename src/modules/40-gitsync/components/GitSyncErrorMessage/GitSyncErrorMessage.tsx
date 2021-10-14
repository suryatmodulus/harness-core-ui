import React from 'react'
import ReactTimeago from 'react-timeago'
import { Card, Color, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import {
  GitSyncErrorMessageItem,
  GitSyncErrorMessageProps
} from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessageItem'
import styles from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessage.module.scss'

const renderComponentConditionally = (Component: React.ReactElement, condition: boolean): React.ReactElement => {
  if (condition) {
    return Component
  }
  return <></>
}

const CountComponent: React.FC<{ count?: number }> = ({ count }) => {
  return (
    <Layout.Horizontal margin={{ right: 'medium' }}>
      <Icon name="warning-sign" color={Color.RED_600} padding={{ right: 'small' }} />
      <Text font={{ weight: 'bold' }} color={Color.RED_600} data-testid="gitSyncErrorCount">
        {count}
      </Text>
    </Layout.Horizontal>
  )
}

const IconValue: React.FC<{ icon: IconName; value?: string; background?: Color; color?: Color; type: string }> = ({
  icon,
  value,
  background,
  color,
  type
}) => {
  return (
    <Layout.Horizontal
      background={background || Color.GREY_100}
      padding={{ left: 'small', right: 'small', top: 'small', bottom: 'small' }}
      margin={{ right: 'medium' }}
    >
      <Icon name={icon} color={color || Color.GREY_600} size={14} padding={{ right: 'small' }}></Icon>
      <Text
        font={{ weight: 'semi-bold', size: 'small' }}
        color={color || Color.GREY_900}
        data-testid={`gitSyncErrorIconValue${type}`}
      >
        {value}
      </Text>
    </Layout.Horizontal>
  )
}

const TimestampComponent: React.FC<{ timestamp?: number }> = ({ timestamp }) => {
  return (
    <Layout.Horizontal
      className={styles.timestamp}
      padding={{ left: 'medium' }}
      data-testid="gitSyncErrorTimestamp"
      data-value={timestamp}
    >
      <ReactTimeago date={timestamp || 0} />
    </Layout.Horizontal>
  )
}

export const GitSyncErrorMessage: React.FC<GitSyncErrorMessageProps> = props => {
  const { title, count, repo, branch, commitId, timestamp, items } = props
  return (
    <Card className={styles.gitSyncErrorMessage} data-testid="gitSyncErrorMessage">
      <Layout.Vertical>
        <Layout.Horizontal className={styles.section} flex={{ justifyContent: 'space-between' }}>
          <Text font={{ weight: 'bold' }} color={Color.GREY_900} data-testid="gitSyncErrorTitle">
            {title}
          </Text>
          <Layout.Horizontal flex={{ alignItems: 'center' }}>
            {renderComponentConditionally(<CountComponent count={count} />, !!count)}
            {renderComponentConditionally(<IconValue type="Repo" icon={'repository'} value={repo} />, !!repo)}
            {renderComponentConditionally(<IconValue type="Branch" icon={'git-new-branch'} value={branch} />, !!branch)}
            {renderComponentConditionally(
              <IconValue
                icon={'git-commit'}
                type="CommitId"
                value={commitId}
                background={Color.PRIMARY_1}
                color={Color.PRIMARY_7}
              />,
              !!commitId
            )}
            {renderComponentConditionally(<TimestampComponent timestamp={timestamp} />, !!timestamp)}
          </Layout.Horizontal>
        </Layout.Horizontal>
        {(items || []).map((item, key) => (
          <GitSyncErrorMessageItem key={key} {...item} />
        ))}
      </Layout.Vertical>
    </Card>
  )
}
