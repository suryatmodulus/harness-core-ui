import type { GroupedCreatedMetrics } from './components/SelectedAppsSideNav/components/GroupedSideNav.types'
import type { MultiItemsSideNavProps } from './MultiItemsSideNav'

interface OnRemoveGroupAndItemInterface {
  removedItem: string
  index: number
  setCreatedMetrics: (value: React.SetStateAction<string[]>) => void
  groupedCreatedMetrics?: GroupedCreatedMetrics
  setSelectedMetric: (value: React.SetStateAction<string | undefined>) => void
  onRemoveMetric: MultiItemsSideNavProps['onRemoveMetric']
}

export const onRemoveGroupAndItem = ({
  removedItem,
  index,
  setCreatedMetrics,
  groupedCreatedMetrics,
  setSelectedMetric,
  onRemoveMetric
}: OnRemoveGroupAndItemInterface): any => {
  setCreatedMetrics(oldMetrics => {
    if (groupedCreatedMetrics) {
      const copyMetric = Object.values(groupedCreatedMetrics)
        .map(item => item[0].metricName || '')
        .reverse()
        .reverse()

      copyMetric.splice(index, 1)
      const updateIndex = index === 0 ? 0 : index - 1
      const updatedMetric = copyMetric[updateIndex] || ''
      setSelectedMetric(updatedMetric)
      onRemoveMetric(removedItem, updatedMetric, [...copyMetric], updateIndex)
      return [...copyMetric]
    } else {
      oldMetrics?.splice(index, 1)
      const updateIndex = index === 0 ? 0 : index - 1
      const updatedMetric = oldMetrics[updateIndex]
      setSelectedMetric(updatedMetric)
      onRemoveMetric(removedItem, updatedMetric, [...oldMetrics], updateIndex)
      return [...oldMetrics]
    }
  })
}

export const getCreatedMetricLength = (
  createdMetrics: string[],
  groupedCreatedMetrics?: GroupedCreatedMetrics
): number => {
  return groupedCreatedMetrics && Object.keys(groupedCreatedMetrics).length > 1
    ? Object.keys(groupedCreatedMetrics || {}).length
    : createdMetrics.length
}
