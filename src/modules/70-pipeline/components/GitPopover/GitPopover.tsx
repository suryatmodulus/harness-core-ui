import React from 'react'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { Color, Icon, Layout, Popover, Text } from '@wings-software/uicore'
import type { MarginProps } from '@wings-software/uicore/dist/styled-props/margin/MarginProps'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'

export interface GitPopoverProps {
  data: EntityGitDetails
  iconSize?: number
  iconMargin?: MarginProps
}

export default function GitPopover(props: GitPopoverProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { data, iconSize = 16, iconMargin = {} } = props
  if (!data.repoIdentifier) {
    return null
  }

  return (
    <Popover interactionKind={PopoverInteractionKind.HOVER}>
      <Icon name={'service-github'} color={Color.GREY_500} size={iconSize} margin={iconMargin} />
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
              {data.repoIdentifier}
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
        <Layout.Vertical spacing="large">
          <Text font={{ size: 'small' }} color={Color.GREY_400}>
            {getString('secret.labelFile')}
          </Text>
          <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
            <Icon name="service-github" size={14} color={Color.GREY_700} />
            <Text font={{ size: 'small' }} lineClamp={1} style={{ maxWidth: 300 }} color={Color.GREY_800}>
              {data.rootFolder}{data.filePath}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </Popover>
  )
}
