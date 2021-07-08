import React from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Card, Text, Color, Container, Layout, CardBody, Icon, Tag } from '@wings-software/uicore'
import { UserLabel } from '@common/components'
import type { TemplatesSummaryResponse } from '@templates-library/temporary-mock/model'
import { getIconsForTemplate, templateColorStyleMap } from '@templates-library/pages/TemplatesList/TemplatesListUtils'
import { TemplateCardContextMenu } from './TemplateCardContextMenu/TemplateCardContextMenu'

import css from './TemplateCard.module.scss'

export interface TemplateCardProps {
  template: TemplatesSummaryResponse
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }): JSX.Element => {
  // const { module, accountId, projectIdentifier, orgIdentifier, } = useParams<
  //   PipelineType<{
  //     orgIdentifier: string
  //     projectIdentifier: string
  //     accountId: string
  //   }>
  // >()
  //  const history = useHistory()
  //const { getString } = useStrings()

  return (
    <Card className={css.templateCard} interactive /* onClick={() => goToPipelineStudio(template)}*/>
      <div className={cx(css.sectionMargin, css.sectionBorder)}>
        <Container padding={{ bottom: 'medium' }} className={css.templateHeader}>
          <span>
            {getIconsForTemplate(template).map(iconObj => (
              <Icon key={iconObj.icon} name={iconObj.icon} size={iconObj.size} className={css.headerIcon} />
            ))}
          </span>
          <CardBody.Menu menuContent={<TemplateCardContextMenu template={template} />} className={css.menu} />
        </Container>
        <Layout.Horizontal padding={{ bottom: 'medium' }}>
          <div className={css.nameAndTagsSection}>
            <Text
              lineClamp={2}
              font="medium"
              color={Color.GREY_800}
              data-testid={template.identifier}
              className={css.templateName}
            >
              {template.name}
            </Text>

            <div className={css.tags}>
              {!isEmpty(template.tags) &&
                template.tags &&
                Object.keys(template.tags).map(key => {
                  const value = template?.tags?.[key]
                  return (
                    <Tag className={css.tag} key={key} color={'red'}>
                      {value ? `${key}:${value}` : key}
                    </Tag>
                  )
                })}
              + 4
            </div>
          </div>
        </Layout.Horizontal>
      </div>

      <div className={cx(css.sectionMargin)}>
        <Container padding={{ right: 'small', top: 'medium', bottom: 'small' }}>
          <div className={css.version}>
            Version: <strong>2.2</strong>
          </div>
          <div className={css.userLabel}>
            <UserLabel name={'4 minutes ago'} />
          </div>
          <Text color={Color.BLUE_600} font={{ size: 'small', weight: 'bold' }}>
            5 referenced
          </Text>
        </Container>
      </div>

      <div className={css.sectionMargin}>
        <Container flex={{ justifyContent: 'center' }} padding={{ top: 'large' }}>
          <div className={css.templateType} style={templateColorStyleMap[template.templateType]}>
            {template?.templateType?.toUpperCase()}
          </div>
          <div></div>
        </Container>
      </div>
    </Card>
  )
}
