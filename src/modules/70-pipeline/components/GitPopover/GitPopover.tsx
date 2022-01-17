/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IPopoverProps, PopoverInteractionKind } from '@blueprintjs/core'
import { Color, Icon, Layout, Popover, Text } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'

import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'

export interface GitPopoverProps {
  data: EntityGitDetails
  iconProps?: Omit<IconProps, 'name'>
  popoverProps?: IPopoverProps
  customUI?: JSX.Element
}

export function RenderGitPopover(props: GitPopoverProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { data, iconProps, popoverProps, customUI } = props
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()

  const gitPopover = React.useCallback(() => {
    return (
      <Popover interactionKind={PopoverInteractionKind.HOVER} {...popoverProps}>
        <Icon
          name={'service-github'}
          color={Color.GREY_700}
          {...iconProps}
          size={iconProps?.size || 16}
          data-testid={'git-popover'}
        />
        <Layout.Vertical padding={{ top: 'large', bottom: 'large', left: 'xlarge', right: 'xlarge' }}>
          <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>
            {getString('pipeline.gitDetails').toUpperCase()}
          </Text>
          {customUI ?? (
            <>
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
            </>
          )}
        </Layout.Vertical>
      </Popover>
    )
  }, [gitSyncRepos, data, loadingRepos, iconProps, popoverProps])

  if (!data.repoIdentifier) {
    return null
  }

  return <>{gitPopover()}</>
}

export default function GitPopover(props: GitPopoverProps): React.ReactElement | null {
  return <RenderGitPopover {...props} />
}
