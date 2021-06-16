import React, { useEffect } from 'react'
import cx from 'classnames'
import { Container, Heading } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { PageError } from '@common/components/Page/PageError'
import css from './ListingPageTemplate.module.scss'

const HEADER_HEIGHT = 80
const TOOLBAR_HEIGHT = 64
const PAGINATION_HEIGHT = 60

export interface ListingPageTemplateProps {
  pageTitle: string

  header: React.ReactNode
  headerStyle?: React.CSSProperties
  headerClassName?: string

  toolbar?: React.ReactNode
  toolbarStyle?: React.CSSProperties
  toolbarClassName?: string

  bodyStyle?: React.CSSProperties
  bodyClassName?: string

  content: React.ReactNode
  contentStyle?: React.CSSProperties
  contentClassName?: string

  pagination?: React.ReactNode
  paginationStyle?: React.CSSProperties
  paginationClassName?: string

  loading?: boolean
  error?: unknown
  retryOnError?: () => void

  headerHeight?: number
  toolbarHeight?: number
  paginationHeight?: number
}

export const ListingPageTitle: React.FC<React.ComponentProps<typeof Heading>> = ({
  height,
  style,
  children,
  ...props
}) => (
  <Heading
    data-name="header"
    level={1}
    height={height}
    style={{
      fontWeight: 'bold',
      fontSize: '20px',
      lineHeight: '28px',
      color: '#22272D',
      paddingLeft: 'var(--spacing-xxlarge)',
      display: 'flex',
      alignItems: 'center',
      background: 'var(--white)',
      borderBottom: '0.5px solid #d9dae6',
      ...style
    }}
    {...props}
  >
    {children}
  </Heading>
)

/**
 * This page template implements a common layout for a listing page in which:
 *  - Header with title on the top
 *  - Toolbar below header (optional)
 *  - Content below toolbar
 *  - Pagination at the bottom (optional)
 *
 * This template also support:
 *   - Page loading state
 *   - Page error state
 *
 * See Feature Flags listing page as an example.
 */
export const ListingPageTemplate: React.FC<ListingPageTemplateProps> = ({
  pageTitle,
  header,
  headerStyle,
  headerClassName,
  bodyStyle,
  bodyClassName,
  toolbar,
  toolbarStyle,
  toolbarClassName,
  content,
  contentStyle,
  contentClassName,
  pagination,
  paginationStyle,
  paginationClassName,
  error,
  retryOnError,
  loading,
  headerHeight = HEADER_HEIGHT,
  toolbarHeight = TOOLBAR_HEIGHT,
  paginationHeight = PAGINATION_HEIGHT
}) => {
  const { getString } = useStrings()

  useEffect(() => {
    const harness = getString('harness')
    document.title = `${harness} | ${pageTitle}`
    return () => {
      document.title = harness
    }
  }, [])

  return (
    <>
      {(typeof header === 'string' && (
        <ListingPageTitle height={headerHeight} style={headerStyle} className={headerClassName}>
          {header}
        </ListingPageTitle>
      )) || (
        <Container
          data-name="header"
          height={headerHeight}
          style={{
            background: 'var(--white)',
            borderBottom: '0.5px solid #d9dae6',
            ...headerStyle
          }}
          className={headerClassName}
        >
          {header}
        </Container>
      )}

      <Container
        data-name="body"
        style={{
          height: `calc(100% - ${headerHeight}px)`,
          overflow: 'hidden',
          backgroundColor: '#F8FAFB',
          ...bodyStyle
        }}
        className={bodyClassName}
      >
        {toolbar && (
          <Container
            data-name="toolbar"
            style={{
              height: toolbarHeight,
              padding: 'var(--spacing-medium) var(--spacing-xxlarge)',
              borderBottom: '0.5px solid #d9dae6',
              alignItems: 'center',
              backgroundColor: 'var(--white)',
              top: 0,
              zIndex: 1,
              ...toolbarStyle
            }}
            className={toolbarClassName}
          >
            {toolbar}
          </Container>
        )}

        <Container
          data-name="content"
          style={{
            height: `calc(100% - ${toolbar ? toolbarHeight : 0}px - ${pagination ? paginationHeight : 0}px)`,
            overflow: 'auto',
            ...contentStyle
          }}
          className={contentClassName}
        >
          {!error && content}
          {error && <PageError message={getErrorMessage(error)} onClick={retryOnError} />}
        </Container>

        {pagination && !error && (
          <Container
            data-name="pagination"
            className={cx(css.pagination, paginationClassName)}
            style={{
              height: paginationHeight,
              padding: '0 var(--spacing-xxlarge)',
              ...paginationStyle
            }}
          >
            {pagination}
          </Container>
        )}

        {loading && (
          <Container
            style={{
              position: 'fixed',
              top: `${headerHeight + (toolbar ? toolbarHeight : 0)}px`,
              left: '290px',
              width: 'calc(100% - 290px)',
              height: `calc(100% - ${headerHeight + (toolbar ? toolbarHeight : 0)}px)`
            }}
          >
            <ContainerSpinner />
          </Container>
        )}
      </Container>
    </>
  )
}

//
// Sample:
//
// export default function () {
//   return (
//     <ListingPageTemplate
//       pageTitle="Feature Flags"
//       header="Feature Flags"
//       toolbar={
//         <Layout.Horizontal>
//           <Button intent="primary" text="+Flag" width={140} />
//           <FlexExpander />
//           <Button text="Edit"/>
//         </Layout.Horizontal>
//       }
//       content={
//         <Container padding={{ top: 'medium', right: 'xxlarge', left: 'xxlarge' }}>
//           {Array.from(Array(100).keys()).map(key => (
//             <Text key={key}>Line {key}</Text>
//           ))}
//         </Container>
//       }
//       pagination={<Pagination itemCount={10} pageSize={10} pageCount={100} pageIndex={1} gotoPage={_index => {}} />}
//       error={null}
//       loading={false}
//     />
//   )
// }
