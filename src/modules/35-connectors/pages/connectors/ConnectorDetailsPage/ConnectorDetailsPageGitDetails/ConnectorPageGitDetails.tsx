import React from 'react'
import { Layout, Icon, Text, Color, SelectOption, Select, MultiSelectOption } from '@wings-software/uicore'
import { Menu } from '@blueprintjs/core'
import type { EntityGitDetails } from 'services/cd-ng'
import css from '../ConnectorDetailsPage.module.scss'

interface ConnectorPageGitDetailsProps {
  gitDetails?: EntityGitDetails
  handleBranchClick: (selected: string) => void
  branchSelectOptions: MultiSelectOption[]
  selectedBranch: string
  onQueryChange: (query: string) => void
  loadingBranchList: boolean
}

const ConnectorPageGitDetails: React.FC<ConnectorPageGitDetailsProps> = ({
  gitDetails,
  handleBranchClick,
  onQueryChange,
  selectedBranch,
  branchSelectOptions,
  loadingBranchList
}) => {
  return (
    <Layout.Horizontal border={{ left: true, color: Color.GREY_300 }} spacing="medium">
      <Layout.Horizontal spacing="small">
        <Icon name="repository" margin={{ left: 'large' }}></Icon>
        <Text lineClamp={1} className={css.filePath}>{`${gitDetails?.rootFolder}${gitDetails?.filePath}`}</Text>
      </Layout.Horizontal>

      <Layout.Horizontal spacing="small">
        <Icon name="git-new-branch" margin={{ left: 'large' }}></Icon>
        <Select
          name="branch"
          className={css.gitBranch}
          value={{ label: selectedBranch, value: selectedBranch }}
          items={branchSelectOptions}
          onQueryChange={onQueryChange}
          itemRenderer={(item: SelectOption): React.ReactElement => {
            return (
              <Menu.Item
                key={item.value as string}
                active={item.value === selectedBranch}
                onClick={() => handleBranchClick(item.value as string)}
                text={item.value}
              />
            )
          }}
        />
        {loadingBranchList ? <Icon margin={{ top: 'xsmall' }} name="spinner" /> : null}
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

export default ConnectorPageGitDetails
