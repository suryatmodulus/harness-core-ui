import React from 'react'
import { defaultTo, isEmpty, noop } from 'lodash-es'
import { Card, Text, Color, Container, Tag, Layout, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import { Position } from '@blueprintjs/core'
import { TimeAgoPopover, UserLabel } from '@common/components'
import { getIconsForTemplates, templateColorStyleMap } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'
import { useStrings } from 'framework/strings'
import { TemplateListContextMenu } from '@templates-library/pages/TemplatesPage/views/TemplatesListView/TemplateListCardContextMenu/TemplateListContextMenu'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import type { NGTemplateInfoConfig, TemplateSummaryResponse } from 'services/template-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
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
}

export function TemplateCard(props: TemplateCardProps): JSX.Element {
  const { getString } = useStrings()
  const { template, onSelect, isSelected, onPreview, onOpenEdit, onOpenSettings, onDelete } = props

  const { isGitSyncEnabled } = useAppStore()
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()

  const templateEntityType =
    (template as TemplateSummaryResponse)?.templateEntityType || (template as NGTemplateInfoConfig)?.type
  const style = templateColorStyleMap[templateEntityType]
  const templateIcons = getIconsForTemplates(template)
  const showMenu = !onPreview && !onOpenEdit && !onOpenSettings && !onDelete

  return (
    <Container className={cx(css.container, { [css.bordered]: !!onSelect }, { [css.selected]: !!isSelected })}>
      <Card className={css.templateCard} onClick={() => onSelect?.(template)}>
        {!showMenu ? (
          <TemplateListContextMenu
            template={template}
            onPreview={onPreview || noop}
            onOpenEdit={onOpenEdit || noop}
            onOpenSettings={onOpenSettings || noop}
            onDelete={onDelete || noop}
            className={css.actionButton}
            position={Position.RIGHT_TOP}
          />
        ) : (
          <div />
        )}
        <Container>
          {!isEmpty(templateIcons) && (
            <Layout.Horizontal spacing={'xsmall'}>
              {templateIcons.map(iconObj => (
                <Icon key={iconObj.name} name={iconObj.name} size={22} />
              ))}
            </Layout.Horizontal>
          )}
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
        <Container>
          <Tag className={cx(css.version, { [css.empty]: !template.versionLabel })}>
            {template.versionLabel || 'Version 1'}
          </Tag>
        </Container>
        <Container height={1} background={Color.GREY_100} />
        {!!template.tags && !isEmpty(template.tags) && (
          <>
            <TemplateTags tags={template.tags} />
            <Container height={1} background={Color.GREY_100} />
          </>
        )}
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

        <Container className={css.userLabel}>
          <Layout.Horizontal>
            <UserLabel name={''} />
            {(template as TemplateSummaryResponse).lastUpdatedAt && (
              <TimeAgoPopover
                font="small"
                color={Color.BLACK}
                time={defaultTo((template as TemplateSummaryResponse).lastUpdatedAt, 0)}
              />
            )}
          </Layout.Horizontal>
        </Container>
        <Text color={Color.PRIMARY_7} font={{ size: 'xsmall', weight: 'semi-bold' }}>
          5 referenced
        </Text>
        <Container flex={{ justifyContent: 'center' }} padding={{ top: 'large' }}>
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
