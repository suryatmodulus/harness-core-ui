import React, { useState } from 'react'
import { Select, ItemListRenderer } from '@blueprintjs/select'
import { Button, MenuItem, Menu } from '@blueprintjs/core'
import cx from 'classnames'

import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import css from './BranchSelector.module.scss'

export interface Branch {
  name: string
}
interface BranchSelectorProps {
  branches: Branch[]
  currentBranch?: Branch
  isReadOnlyMode?: boolean
}

const BranchSelect = Select.ofType<Branch>()

export const BranchSelector = ({
  branches,
  currentBranch,
  isReadOnlyMode = false
}: BranchSelectorProps): JSX.Element => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>(currentBranch)
  const { getString } = useStrings()

  const handleSelect = (item: Branch, _event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => {
    setSelectedBranch(item)
  }

  const itemRenderer = (item: Branch): JSX.Element => {
    const { name } = item
    return (
      <Text lineClamp={1} width="70%">
        {name}
      </Text>
    )
  }

  const itemListRender: ItemListRenderer<Branch> = itemListProps => (
    <Menu>
      {selectedBranch ? (
        <Menu.Item
          text={<Text>{getString('common.authSettings.clearSelection')}</Text>}
          icon="cross"
          onClick={() => setSelectedBranch(undefined)}
          className={css.clear}
        />
      ) : null}
      {itemListProps.items.map((item, i) => itemListProps.renderItem(item, i))}
    </Menu>
  )

  return (
    <BranchSelect
      items={branches || []}
      className={css.branchSelect}
      onItemSelect={handleSelect}
      itemRenderer={(item, { handleClick }) => {
        return <MenuItem text={itemRenderer(item)} onClick={handleClick} key={item.name} />
      }}
      itemListRenderer={itemListRender}
      noResults={<Text padding="small">{getString('noSearchResultsFoundPeriod')}</Text>}
      activeItem={selectedBranch}
      inputProps={{
        placeholder: getString('search')
      }}
      disabled={isReadOnlyMode}
    >
      <Button
        className={cx(css.branchSelect, { [css.disable]: isReadOnlyMode })}
        rightIcon="chevron-down"
        data-testid="branch-select"
      >
        {selectedBranch ? (
          <Text lineClamp={1} alwaysShowTooltip={false}>
            {selectedBranch.name}
          </Text>
        ) : (
          <Text>{getString('common.authSettings.selectBranch')}</Text>
        )}
      </Button>
    </BranchSelect>
  )
}
