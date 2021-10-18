import React from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { Color, Layout, Text } from '@wings-software/uicore'
import { Position } from '@blueprintjs/core'
import { isEmpty } from 'lodash-es'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/strings'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { templateColorStyleMap } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { TemplateListContextMenu } from '@templates-library/pages/TemplatesPage/views/TemplatesListView/TemplateListCardContextMenu/TemplateListContextMenu'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'
import type { TemplatesViewProps } from '@templates-library/pages/TemplatesPage/views/TemplatesView'
import css from './TemplatesListView.module.scss'

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  onPreview?: (template: TemplateSummaryResponse) => void
  onOpenEdit?: (template: TemplateSummaryResponse) => void
  onOpenSettings?: (templateIdentifier: string) => void
  onDelete?: (templateIdentifier: string) => void
}

const RenderColumnMenu: Renderer<CellProps<TemplateSummaryResponse>> = ({ row, column }) => {
  const data = row.original

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <TemplateListContextMenu
        template={data}
        onPreview={(column as CustomColumn<TemplateSummaryResponse>).onPreview}
        onOpenEdit={(column as CustomColumn<TemplateSummaryResponse>).onOpenEdit}
        onOpenSettings={(column as CustomColumn<TemplateSummaryResponse>).onOpenSettings}
        onDelete={(column as CustomColumn<TemplateSummaryResponse>).onDelete}
      />
    </Layout.Horizontal>
  )
}

const RenderColumnType: Renderer<CellProps<TemplateSummaryResponse>> = ({ row }) => {
  const data = row.original
  const templateEntityType = data.templateEntityType
  const style = templateColorStyleMap[templateEntityType || 'Step']

  return (
    <Layout.Horizontal
      className={css.templateColor}
      spacing="large"
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
    >
      <svg width="8" height="64" viewBox="0 0 8 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.5 63.5L7.5 0.5H5C2.51472 0.5 0.5 2.51472 0.5 5L0.5 59C0.5 61.4853 2.51472 63.5 5 63.5H7.5Z"
          fill={style.fill}
          stroke={style.stroke}
        />
      </svg>
      {templateEntityType && (
        <Text font={{ size: 'xsmall', weight: 'bold' }} style={{ color: style.color, letterSpacing: 2 }}>
          {templateEntityType.toUpperCase()}
        </Text>
      )}
    </Layout.Horizontal>
  )
}

const RenderColumnTemplate: Renderer<CellProps<TemplateSummaryResponse>> = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="xsmall" data-testid={data.identifier} padding={{ right: 'medium' }}>
      <Text
        color={Color.GREY_800}
        tooltipProps={{ position: Position.BOTTOM }}
        lineClamp={1}
        tooltip={
          <Layout.Vertical
            color={Color.GREY_800}
            spacing="small"
            padding="medium"
            style={{ maxWidth: 400, overflowWrap: 'anywhere' }}
          >
            <Text color={Color.GREY_800}>{getString('nameLabel', { name: data.name })}</Text>
            <br />
            <Text>{getString('descriptionLabel', { description: data.description || '-' })}</Text>
          </Layout.Vertical>
        }
      >
        {data.name}
      </Text>
      <Text tooltipProps={{ position: Position.BOTTOM }} color={Color.GREY_400} font={{ size: 'small' }} lineClamp={1}>
        {getString('idLabel', { id: data.identifier })}
      </Text>
    </Layout.Vertical>
  )
}

const RenderColumnLabel: Renderer<CellProps<TemplateSummaryResponse>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal padding={{ right: 'medium' }}>
      <Text color={Color.GREY_800} font={{ weight: 'semi-bold' }} lineClamp={1}>
        {data.versionLabel}
      </Text>
    </Layout.Horizontal>
  )
}

const RenderColumnTags: Renderer<CellProps<TemplateSummaryResponse>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal width={'100%'} padding={{ right: 'medium' }} style={{ alignItems: 'center' }}>
      {data.tags && !isEmpty(data.tags) ? (
        <TemplateTags tags={data.tags} />
      ) : (
        <Text color={Color.GREY_400} font={{ weight: 'semi-bold' }}>
          -
        </Text>
      )}
    </Layout.Horizontal>
  )
}

export const TemplateListView: React.FC<TemplatesViewProps> = (props): JSX.Element => {
  const { getString } = useStrings()
  const { data, selectedIdentifier, gotoPage, onPreview, onOpenEdit, onOpenSettings, onDelete, onSelect } = props

  const hideMenu = !onPreview && !onOpenEdit && !onOpenSettings && !onDelete

  const columns: CustomColumn<TemplateSummaryResponse>[] = React.useMemo(
    () => [
      {
        Header: getString('typeLabel').toUpperCase(),
        accessor: 'templateEntityType',
        width: '15%',
        Cell: RenderColumnType
      },
      {
        Header: 'Template',
        accessor: 'name',
        width: hideMenu ? '35%' : '30%',
        Cell: RenderColumnTemplate
      },
      {
        Header: getString('version').toUpperCase(),
        accessor: 'versionLabel',
        width: '25%',
        Cell: RenderColumnLabel,
        disableSortBy: true
      },
      {
        Header: getString('tagsLabel').toUpperCase(),
        accessor: 'tags',
        width: '25%',
        Cell: RenderColumnTags,
        disableSortBy: true
      },
      {
        Header: '',
        accessor: 'version',
        width: '5%',
        Cell: RenderColumnMenu,
        disableSortBy: true,
        onPreview,
        onOpenEdit,
        onOpenSettings,
        onDelete
      }
    ],
    [onPreview]
  )

  if (hideMenu) {
    columns.pop()
  }

  return (
    <Table<TemplateSummaryResponse>
      className={css.table}
      columns={columns}
      data={data?.content || []}
      onRowClick={item => onSelect(item)}
      pagination={{
        itemCount: data?.totalElements || 0,
        pageSize: data?.size || 10,
        pageCount: data?.totalPages || -1,
        pageIndex: data?.number || 0,
        gotoPage
      }}
      getRowClassName={row => (row.original.identifier === selectedIdentifier ? css.selected : '')}
    />
  )
}
