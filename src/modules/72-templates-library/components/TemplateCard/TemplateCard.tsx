import React from 'react'
import { defaultTo, isEmpty, noop } from 'lodash-es'
import { Card, Text, Color, Container, Tag, Layout, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import { Position } from '@blueprintjs/core'
import { TimeAgoPopover } from '@common/components'
import { getIconForTemplate, templateColorStyleMap } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'
import { useStrings } from 'framework/strings'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import type { NGTemplateInfoConfig, TemplateSummaryResponse } from 'services/template-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { TemplateListCardContextMenu } from '@templates-library/pages/TemplatesPage/views/TemplateListCardContextMenu/TemplateListCardContextMenu'
import { TemplateColor } from './TemplateColor/TemplateColor'
import css from './TemplateCard.module.scss'

export interface TemplateCardProps {
  template: TemplateSummaryResponse
  onSelect?: (template: NGTemplateInfoConfig | TemplateSummaryResponse) => void
  isSelected?: boolean
  onPreview?: (template: NGTemplateInfoConfig | TemplateSummaryResponse) => void
  onOpenEdit?: (template: NGTemplateInfoConfig | TemplateSummaryResponse) => void
  onOpenSettings?: (templateIdentifier: string) => void
  onDelete?: (template: TemplateSummaryResponse) => void
  onDeleteTemplate?: (commitMsg: string, versions?: string[]) => Promise<void>
}

export function TemplateCard(props: TemplateCardProps): JSX.Element {
  const { getString } = useStrings()
  const { template, onSelect, isSelected, onPreview, onOpenEdit, onOpenSettings, onDelete, onDeleteTemplate } = props

  const { isGitSyncEnabled } = useAppStore()
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()

  const templateEntityType =
    (template as TemplateSummaryResponse)?.templateEntityType || (template as NGTemplateInfoConfig)?.type
  const style = templateColorStyleMap[templateEntityType]
  const showMenu = !onPreview && !onOpenEdit && !onOpenSettings && !onDelete

  return (
    <Container className={cx(css.container, { [css.bordered]: !!onSelect }, { [css.selected]: !!isSelected })}>
      <Card className={css.templateCard} onClick={() => onSelect?.(template)}>
        {!showMenu ? (
          <TemplateListCardContextMenu
            template={template}
            onPreview={onPreview || noop}
            onOpenEdit={onOpenEdit || noop}
            onOpenSettings={onOpenSettings || noop}
            onDelete={onDelete || noop}
            className={css.actionButton}
            position={Position.RIGHT_TOP}
            onDeleteTemplate={onDeleteTemplate}
          />
        ) : (
          <div />
        )}
        <Container>
          <Icon name={getIconForTemplate(template, getString)} size={18} />
        </Container>
        <Container>
          <Text
            lineClamp={1}
            font={{ weight: 'semi-bold' }}
            color={template.name ? Color.GREY_800 : Color.GREY_400}
            data-testid={template.identifier}
          >
            {template.name || getString('templatesLibrary.createNewModal.namePlaceholder')}
          </Text>
          <Text font="small" lineClamp={1} color={Color.GREY_400} margin={{ top: 'xsmall' }}>
            {getString('idLabel', { id: template.identifier })}
          </Text>
        </Container>
        {!!template.tags && !isEmpty(template.tags) && <TemplateTags tags={template.tags} />}
        <Container height={1} background={Color.GREY_100} />
        {isGitSyncEnabled && !!template.gitDetails?.repoIdentifier && !!template.gitDetails.branch && (
          <>
            <Container className={css.infoContainer}>
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                <Text className={css.label} font="small" width={80} color={Color.GREY_700}>
                  {getString('pipeline.gitRepo')}
                </Text>
                <Layout.Horizontal style={{ alignItems: 'center' }} spacing={'small'}>
                  <Icon name="repository" size={10} color={Color.GREY_600} />
                  <Text
                    font={{ size: 'small' }}
                    color={Color.BLACK}
                    title={template?.gitDetails?.repoIdentifier}
                    lineClamp={1}
                    width={40}
                  >
                    {(!loadingRepos &&
                      getRepoDetailsByIndentifier(template.gitDetails.repoIdentifier, gitSyncRepos)?.name) ||
                      ''}
                  </Text>
                </Layout.Horizontal>
              </Layout.Horizontal>

              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                <Text className={css.label} font="small" width={80} color={Color.GREY_700}>
                  {getString('pipelineSteps.deploy.inputSet.branch')}
                </Text>
                <Layout.Horizontal style={{ alignItems: 'center' }} spacing={'small'}>
                  <Icon name="git-new-branch" size={10} color={Color.GREY_500} />
                  <Text
                    font={{ size: 'small' }}
                    color={Color.BLACK}
                    title={template?.gitDetails?.branch}
                    lineClamp={1}
                    width={40}
                  >
                    {template.gitDetails.branch}
                  </Text>
                </Layout.Horizontal>
              </Layout.Horizontal>
            </Container>
            <Container height={1} background={Color.GREY_100} />
          </>
        )}
        <Container>
          <Tag className={cx(css.version, { [css.empty]: !template.versionLabel })}>
            {template.versionLabel || 'Version1'}
          </Tag>
        </Container>
        {(template as TemplateSummaryResponse).lastUpdatedAt && (
          <Container>
            <Layout.Horizontal spacing={'xsmall'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text font={{ size: 'xsmall' }} color={Color.GREY_800}>
                {getString('lastUpdated')}
              </Text>
              <TimeAgoPopover
                font="xsmall"
                color={Color.GREY_800}
                time={defaultTo((template as TemplateSummaryResponse).lastUpdatedAt, 0)}
              />
            </Layout.Horizontal>
          </Container>
        )}
        <Container flex={{ justifyContent: 'center' }} padding={{ top: 'medium' }}>
          <TemplateColor
            fill={style.fill as string}
            stroke={style.stroke as string}
            textColor={style.color as string}
            title={templateEntityType.toUpperCase()}
          />
        </Container>
      </Card>
    </Container>
  )
}
