import React from 'react'
import { Intent, Text } from '@wings-software/uicore'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import { useRemoveTargetsFromIncludeList, TargetSegmentParams } from '@cf/utils/SegmentUtils'
import { useToaster } from '@common/exports'
import { useConfirmAction } from '@common/hooks'
import type { Target, TargetDetailSegment } from 'services/cf'
import { ItemBriefInfo } from '@cf/components/ItemBriefInfo/ItemBriefInfo'

export const IncludeSegmentRow: React.FC<{
  target?: Target | null
  segment: TargetDetailSegment
  patchParams: TargetSegmentParams
  refetch: () => void
}> = ({ target, segment, patchParams, refetch }) => {
  const { identifier, name, description } = segment as TargetDetailSegment & { description: string }
  const _useRemoveTargetsFromIncludeList = useRemoveTargetsFromIncludeList(patchParams)
  const { showError } = useToaster()
  const { getString } = useStrings()
  const remove = useConfirmAction({
    title: getString('cf.targetDetail.removeFromIncludeListTitle'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{
            __html: getString('cf.targetDetail.removeFromIncludeList', {
              targetName: target?.name,
              segmentName: segment.name
            })
          }}
        />
      </Text>
    ),
    intent: Intent.DANGER,
    action: async () => {
      try {
        _useRemoveTargetsFromIncludeList(segment.identifier as string, [target?.identifier as string])
          .then(refetch)
          .catch(error => {
            showError(getErrorMessage(error), undefined, 'cf.remove.target.list.error')
          })
      } catch (error) {
        showError(getErrorMessage(error), undefined, 'cf.remove.target.list.error')
      }
    }
  })

  return <ItemBriefInfo key={identifier} name={name as string} description={description} onRemoveClick={remove} />
}
