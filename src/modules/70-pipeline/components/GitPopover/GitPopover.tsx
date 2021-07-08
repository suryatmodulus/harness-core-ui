import React from 'react'
import { IPopoverProps, PopoverInteractionKind } from '@blueprintjs/core'
import { Color, Icon, Layout, Popover, Text } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'

import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider, useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'

export interface GitPopoverProps {
  data: EntityGitDetails
  iconProps?: Omit<IconProps, 'name'>
  popoverProps?: IPopoverProps
}

export function RenderGitPopover(props: GitPopoverProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { data, iconProps, popoverProps } = props
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()

  if (!data.repoIdentifier) {
    return null
  }

  return (
    <Popover interactionKind={PopoverInteractionKind.HOVER} {...popoverProps}>
      <Icon name={'service-github'} color={Color.GREY_500} {...iconProps} size={iconProps?.size || 16} />
      <Layout.Vertical padding={{ top: 'large', bottom: 'large', left: 'xlarge', right: 'xlarge' }}>
        <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>
          {getString('pipeline.gitDetails').toUpperCase()}
        </Text>
        <Layout.Vertical spacing="large">
          <Text font={{ size: 'small' }} color={Color.GREY_400}>
            {getString('repository')}
          </Text>
          <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
            <Icon name="repository" size={16} color={Color.GREY_700} />
            <Text font={{ size: 'small' }} color={Color.GREY_800}>
              {(!loadingRepos && getRepoDetailsByIndentifier(data?.repoIdentifier, gitSyncRepos)?.name) || ''}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical spacing="large">
          <Text font={{ size: 'small' }} color={Color.GREY_400}>
            {getString('pipelineSteps.deploy.inputSet.branch')}
          </Text>
          <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
            <Icon name="git-new-branch" size={14} color={Color.GREY_700} />
            <Text font={{ size: 'small' }} color={Color.GREY_800}>
              {data.branch}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </Popover>
  )
}

export default function GitPopover(props: GitPopoverProps): React.ReactElement | null {
  return (
    <GitSyncStoreProvider>
      <RenderGitPopover {...props} />
    </GitSyncStoreProvider>
  )
}
