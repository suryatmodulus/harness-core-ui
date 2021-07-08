import React, { useEffect, useState } from 'react'
import { Classes, Button, MenuItem, PopoverPosition } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import { Select } from '@blueprintjs/select'
import { Menu } from '@blueprintjs/core'
import cx from 'classnames'

import { Text, Layout, Color, Container, Icon } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { Project, useGetProjectList } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import pointerImage from './pointer.svg'
import css from './ProjectSelector.module.scss'

export interface ProjectSelectorProps {
  onSelect: (project: Project) => void
  moduleFilter?: Required<Project>['modules'][0]
}

const ProjectSelect = Select.ofType<Project>()

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onSelect, moduleFilter }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { selectedProject, updateAppStore } = useAppStore()
  const { getString } = useStrings()
  const history = useHistory()
  const [searchTerm, setSearchTerm] = useState<string>()
  const { data, loading } = useGetProjectList({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: moduleFilter,
      searchTerm: searchTerm,
      pageSize: 10
    },
    debounce: 300
  })

  let projects = data?.data?.content?.map(response => response.project)

  if (data?.data?.totalItems && data.data.totalItems > 10) {
    projects = projects?.concat({
      name: getString('common.moreRefineSearch', { number: data.data.totalItems - 10 }),
      identifier: '$disabled$'
    })
  }

  useEffect(() => {
    // deselect current project if user switches module
    // and the new module isn't added on selected project
    if (moduleFilter && !selectedProject?.modules?.includes(moduleFilter)) {
      updateAppStore({ selectedProject: undefined })
    }
  }, [moduleFilter])

  return (
    <>
      <div className={css.projectSelector}>
        <Button
          minimal
          className={cx(css.button, css.projectButton)}
          disabled={!selectedProject}
          text={
            <Layout.Vertical spacing="xsmall">
              <Text font={{ size: 'small' }}>{getString('projectLabel')}</Text>
              <Text lineClamp={1} color={selectedProject ? Color.WHITE : Color.GREY_400} font={{ size: 'normal' }}>
                {selectedProject ? selectedProject.name : getString('selectProject')}
              </Text>
            </Layout.Vertical>
          }
          onClick={() => {
            selectedProject &&
              history.push(
                routes.toProjectDetails({
                  accountId,
                  orgIdentifier: selectedProject.orgIdentifier as string,
                  projectIdentifier: selectedProject.identifier
                })
              )
          }}
        />
        <ProjectSelect
          items={loading ? [] : projects || []}
          className={css.projectSelect}
          popoverProps={{
            minimal: true,
            className: Classes.DARK,
            fill: true,
            usePortal: false,
            position: PopoverPosition.RIGHT_TOP
          }}
          onItemSelect={onSelect}
          onQueryChange={query => {
            setSearchTerm(query)
          }}
          itemRenderer={(item, { handleClick }) => (
            <MenuItem
              className={item.identifier === '$disabled$' ? css.removeMarginPadding : css.addMargin}
              disabled={item.identifier === '$disabled$'}
              text={
                <Layout.Vertical>
                  {item.identifier === '$disabled$' ? (
                    <>
                      <Menu.Divider className={css.dividerColorMargin} />
                      <Text className={css.addPadding} color={Color.GREY_400}>
                        {item.name}
                      </Text>
                    </>
                  ) : (
                    <Text color={Color.WHITE}>{item.name}</Text>
                  )}
                  {item.orgIdentifier === 'default' ? null : (
                    <Text font={{ size: 'small' }} color={Color.GREY_400}>
                      {item.orgIdentifier}
                    </Text>
                  )}
                </Layout.Vertical>
              }
              key={item.name}
              onClick={handleClick}
            />
          )}
          noResults={
            loading ? (
              <Container flex={{ align: 'center-center' }} padding="small">
                <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
              </Container>
            ) : (
              <Text padding="small">{getString('noSearchResultsFoundPeriod')}</Text>
            )
          }
          inputProps={{
            placeholder: getString('projectSelector.placeholder', { number: data?.data?.totalItems })
          }}
        >
          <Button
            minimal
            className={cx(css.button, css.selectButton)}
            icon={'caret-right'}
            data-testid={'project-select-dropdown'}
          />
        </ProjectSelect>
      </div>
      {selectedProject ? null : (
        <div style={{ backgroundImage: `url(${pointerImage})` }} className={css.pickProjectHelp}>
          {getString('pickProject')}
        </div>
      )}
    </>
  )
}
