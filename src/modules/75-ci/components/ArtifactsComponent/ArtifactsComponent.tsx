import React from 'react'
import cx from 'classnames'
import { CollapseList, CollapseListPanel, IconName, Text, Color, Link, Icon } from '@wings-software/uicore'
import type { IProps } from '@blueprintjs/core'
import stageArtifactsMock from './__test__/artifacts-mock.json'
import css from './ArtifactsComponent.module.scss'

export interface Artifact {
  name?: string
  url: string
}

export interface ArtifactGroup {
  name: string
  icon: IconName
  artifacts: Artifact[]
}

export interface ArtifactsComponentProps extends IProps {
  artifactGroups?: ArtifactGroup[]
}

const ArtifactsComponent: React.FC<ArtifactsComponentProps> = props => {
  const { artifactGroups = stageArtifactsMock as ArtifactGroup[], className } = props

  return (
    <div className={cx(css.main, className)}>
      {artifactGroups.map((artifactGroup, idx) => (
        <CollapseList key={idx}>
          <CollapseListPanel
            collapseHeaderProps={{
              heading: (
                <Text color={Color.GREY_900} font={{ weight: 'semi-bold' }} className={css.heading}>
                  <Icon name={artifactGroup.icon} color={Color.BLUE_500} />
                  {artifactGroup.name}
                </Text>
              )
            }}
            isOpen={true}
            footerContent={<div />}
          >
            <>
              {artifactGroup.artifacts.map((artifact, itemIdx) => (
                <div key={itemIdx} className={css.listItem}>
                  <Link href={artifact.url} target="_blank">
                    {artifact.name || artifact.url}
                  </Link>
                </div>
              ))}
            </>
          </CollapseListPanel>
        </CollapseList>
      ))}
    </div>
  )
}

export default ArtifactsComponent
