import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Layout, Text, IconName, Color, Icon } from '@wings-software/uicore'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'

const HEADER_HEIGHT = 145
const HEADER_HEIGHT_NO_TAGS = 120

interface DetailPageTemplateBreadcrumbLink {
  title: string
  url: string
}

export interface DetailPageTemplateProps {
  breadcrumbs: DetailPageTemplateBreadcrumbLink[]
  title: React.ReactNode
  titleIcon?: IconName | React.ReactNode
  subTitle?: string
  tags?: string[] | null | undefined
  identifier?: string

  /** Optional extra components to be added into header (context menu, edit button, etc...)  */
  /** Note: Use absolute position to style it */
  headerExtras?: React.ReactNode
}

export const DetailPageTemplate: React.FC<DetailPageTemplateProps> = ({
  breadcrumbs,
  title,
  titleIcon,
  subTitle,
  tags,
  identifier,
  headerExtras,
  children
}) => {
  const headerHeight = tags?.length ? HEADER_HEIGHT : HEADER_HEIGHT_NO_TAGS

  return (
    <>
      <Container
        height={headerHeight}
        padding={{ top: 'large', right: 'xlarge', bottom: 'large', left: 'xlarge' }}
        style={{
          background: 'rgba(219, 241, 255, .46)',
          position: 'relative',
          borderBottom: '.5px solid rgb(227 224 224 / 50%)'
        }}
      >
        <Layout.Vertical spacing="medium">
          <Layout.Horizontal spacing="small">
            {breadcrumbs.map(linkInfo => (
              <React.Fragment key={linkInfo.title + linkInfo.url}>
                <Link style={{ color: '#0092E4', fontSize: '12px' }} to={linkInfo.url}>
                  {linkInfo.title}
                </Link>
                <span>/</span>
              </React.Fragment>
            ))}
          </Layout.Horizontal>

          <Layout.Horizontal spacing="small" style={{ marginLeft: '-5px' }}>
            <Container style={{ borderRadius: '50%', overflow: 'hidden' }}>
              {typeof titleIcon === 'string' && <Icon name={titleIcon as IconName} size={40} />}
              {typeof titleIcon !== 'string' && <>{titleIcon}</>}
            </Container>
            <Container>
              <Layout.Horizontal spacing="medium">
                <Text style={{ fontSize: '20px', color: 'var(--black)' }}>{title}</Text>
                {identifier && <IdentifierText identifier={identifier} allowCopy style={{ marginBottom: 0 }} />}
              </Layout.Horizontal>
              {subTitle && (
                <Text color={Color.GREY_400} padding={{ top: 'xsmall' }}>
                  {subTitle}
                </Text>
              )}
            </Container>
          </Layout.Horizontal>

          {tags && (
            <Container>
              <TagsViewer tags={tags} style={{ background: '#CDF4FE' }} />
            </Container>
          )}
        </Layout.Vertical>
        {headerExtras}
      </Container>
      <Container style={{ height: `calc(100% - ${headerHeight}px)`, overflow: 'auto', background: '#e4ebf433' }}>
        {children}
      </Container>
    </>
  )
}
