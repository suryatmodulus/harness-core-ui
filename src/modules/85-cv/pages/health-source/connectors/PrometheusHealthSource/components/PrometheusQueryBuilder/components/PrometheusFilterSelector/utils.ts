import type { MultiSelectOption } from '@wings-software/uicore'

export function updateLabelOfSelectedFilter(
  selectedValue: string,
  item: MultiSelectOption,
  items: MultiSelectOption[]
): MultiSelectOption {
  const currentItem = items.find(listItem => listItem.value === item.value)
  if (currentItem) {
    const splitString = (currentItem.label as string).split(':')[0]
    return { ...currentItem, label: `${splitString}:${selectedValue}` }
  }

  return item
}

export function updateMultiSelectOption(
  newOption: MultiSelectOption,
  currentList: MultiSelectOption[]
): MultiSelectOption[] {
  if (!currentList?.length) {
    return []
  }

  const newOptionIndex = currentList.findIndex(listItem => listItem.value === newOption.value)
  if (newOptionIndex > -1) {
    currentList[newOptionIndex] = newOption
  }

  return Array.from(currentList)
}
