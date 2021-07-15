import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout, Button, Container, ExpandingSearchInput, FlexExpander } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/components/Page/Page'
import { useToaster } from '@common/components'
import { useCreatePerspective, useDeletePerspective, CEView } from 'services/ce'
import { QlceView, useFetchAllPerspectivesQuery, ViewState } from 'services/ce/services'
import { generateId, CREATE_CALL_OBJECT } from '@ce/utils/perspectiveUtils'
import PerspectiveListView from '@ce/components/PerspectiveViews/PerspectiveListView'
import PerspectiveGridView from '@ce/components/PerspectiveViews/PerspectiveGridView'
import css from './PerspectiveListPage.module.scss'

enum Views {
  LIST,
  GRID
}

const PerspectiveListPage: React.FC = () => {
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const [searchParam, setSearchParam] = useState<string>('')
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [view, setView] = useState(Views.GRID)

  const [result, executeQuery] = useFetchAllPerspectivesQuery()
  const { data, fetching } = result

  const { mutate: createView, loading: createViewLoading } = useCreatePerspective({
    queryParams: {
      accountId: accountId
    }
  })

  const { mutate: deleteView } = useDeletePerspective({
    queryParams: {
      accountId: accountId
    }
  })

  const createNewPerspective: (values: QlceView | Record<string, string>, isClone: boolean) => void = async (
    values = {},
    isClone
  ) => {
    const valuesToBeSent = pick(values, ['name', 'viewTimeRange', 'viewVisualization'])
    let formData: Record<string, any> = {
      ...valuesToBeSent,
      viewVersion: 'v1'
    }

    formData['name'] = isClone ? `${formData['name']}-clone` : `Perspective-${generateId(6).toUpperCase()}`
    formData = { ...CREATE_CALL_OBJECT, ...formData }

    try {
      const response = await createView(formData as CEView)
      const { resource } = response

      const uuid = resource?.uuid

      if (uuid) {
        history.push(
          routes.toCECreatePerspective({
            accountId: accountId,
            perspectiveId: uuid
          })
        )
      }
    } catch (e) {
      const errMessage = e.data.message
      showError(errMessage)
    }
  }

  const deletePerpsective: (perspectiveId: string) => void = async perspectiveId => {
    try {
      await deleteView(void 0, {
        queryParams: {
          perspectiveId: perspectiveId,
          accountId: accountId
        }
      })
      executeQuery({
        requestPolicy: 'cache-and-network'
      })
    } catch (e) {
      const errMessage = e.data.message
      showError(errMessage)
    }
  }

  const navigateToPerspectiveDetailsPage: (perspectiveId: string, viewState?: ViewState) => void = (
    perspectiveId,
    viewState
  ) => {
    if (viewState !== ViewState.Draft) {
      history.push(
        routes.toPerspectiveDetails({
          accountId: accountId,
          perspectiveId: perspectiveId,
          perspectiveName: perspectiveId
        })
      )
    } else {
      history.push(
        routes.toCECreatePerspective({
          accountId,
          perspectiveId
        })
      )
    }
  }

  const pespectiveList = data?.perspectives?.customerViews || []

  const filteredPerspectiveData = pespectiveList.filter(per => {
    if (!per?.name) {
      return false
    }
    if (per.name.toLowerCase().indexOf(searchParam.toLowerCase()) < 0) {
      return false
    }
    return true
  }) as QlceView[]
  return (
    <>
      <Page.Header title="Perspectives" />
      <Layout.Horizontal spacing="large" className={css.header}>
        <Button
          intent="primary"
          text="New Perspective"
          icon="plus"
          onClick={async () => {
            await createNewPerspective({}, false)
          }}
        />
        <FlexExpander />

        <ExpandingSearchInput
          placeholder={getString('ce.perspectives.searchPerspectives')}
          onChange={text => {
            setSearchParam(text.trim())
          }}
          className={css.search}
        />
        <Layout.Horizontal>
          <Button
            minimal
            icon="grid-view"
            intent={view === Views.GRID ? 'primary' : undefined}
            onClick={() => {
              setView(Views.GRID)
            }}
          />
          <Button
            minimal
            icon="list"
            intent={view === Views.LIST ? 'primary' : undefined}
            onClick={() => {
              setView(Views.LIST)
            }}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Page.Body>
        {(fetching || createViewLoading) && <Page.Spinner />}
        <Container padding="xxxlarge">
          {pespectiveList ? (
            view === Views.GRID ? (
              <PerspectiveGridView
                pespectiveData={filteredPerspectiveData}
                navigateToPerspectiveDetailsPage={navigateToPerspectiveDetailsPage}
                deletePerpsective={deletePerpsective}
                clonePerspective={createNewPerspective}
              />
            ) : (
              <PerspectiveListView
                pespectiveData={filteredPerspectiveData}
                navigateToPerspectiveDetailsPage={navigateToPerspectiveDetailsPage}
                deletePerpsective={deletePerpsective}
                clonePerspective={createNewPerspective}
              />
            )
          ) : null}
        </Container>
      </Page.Body>
    </>
  )
}

export default PerspectiveListPage
