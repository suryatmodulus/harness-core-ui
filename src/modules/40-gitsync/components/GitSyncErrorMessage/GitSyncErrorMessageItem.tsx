import React from 'react'
import { Color, Icon, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import styles from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessage.module.scss'

export interface GitSyncErrorMessageProps {
  mode: 'COMMIT' | 'FILE' | 'CONNECTIVITY'
  title: string
  count?: number
  repo?: string
  branch?: string
  commitId?: string
  timestamp?: number
  items: {
    title?: string
    reason: string
    showDetails?: () => void
    fixCommit?: string
  }[]
}

export const GitSyncErrorMessageItem: React.FC<GitSyncErrorMessageProps['items'][number]> = ({
  title,
  reason,
  showDetails,
  fixCommit
}) => {
  const { getString } = useStrings()
  const CustomComponent: React.ReactElement = React.useMemo(() => {
    if (showDetails) {
      return (
        <Text
          font={{ size: 'small', weight: 'semi-bold' }}
          color={Color.PRIMARY_7}
          className={styles.errorItemViewContent}
          onClick={() => showDetails()}
        >
          {getString('common.viewContent')}
        </Text>
      )
    }
    if (fixCommit) {
      return (
        <Layout.Horizontal
          className={styles.errorItemErrorFixed}
          background={Color.GREY_100}
          padding={{ left: 'small', right: 'small', top: 'small', bottom: 'small' }}
        >
          <Layout.Horizontal margin={{ right: 'medium' }}>
            <Icon name="command-artifact-check" color={Color.GREEN_500} size={14} margin={{ right: 'small' }} />
            <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
              {getString('gitsync.errorFixed')}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal>
            <Icon name="git-commit" color={Color.PRIMARY_7} margin={{ right: 'small' }} />
            <Text
              font={{ size: 'small', weight: 'semi-bold' }}
              color={Color.PRIMARY_7}
              data-testid="gitSyncErrorMessageItemFixCommit"
            >
              {fixCommit?.slice(0, 7)}
            </Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
      )
    }
    return <></>
  }, [showDetails, fixCommit, getString])
  return (
    <Layout.Horizontal
      className={styles.section}
      flex={{ justifyContent: 'space-between' }}
      data-testid="gitSyncErrorMessageItem"
    >
      <Layout.Vertical>
        {title ? (
          <Text
            font={{ size: 'small', weight: 'semi-bold' }}
            className={styles.errorItemTitle}
            data-testid="gitSyncErrorMessageItemTitle"
          >
            {title}
          </Text>
        ) : null}
        <Layout.Horizontal>
          <Text font={{ size: 'small' }} color={Color.RED_600} margin={{ right: 'large' }}>
            {getString('failed')}
          </Text>
          <Text font={{ size: 'small' }} color={Color.GREY_900} data-testid="gitSyncErrorMessageItemReason">
            {reason}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
      {CustomComponent}
    </Layout.Horizontal>
  )
}
