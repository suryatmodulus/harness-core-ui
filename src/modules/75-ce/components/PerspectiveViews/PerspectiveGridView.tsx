import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Icon, Text, Layout, Container, Card, FlexExpander, CardBody } from '@wings-software/uicore'
import { Menu, Classes } from '@blueprintjs/core'
import routes from '@common/RouteDefinitions'
import { QlceView, ViewTimeRangeType, ViewType, ViewState } from 'services/ce/services'
import { SOURCE_ICON_MAPPING } from '@ce/utils/perspectiveUtils'
import formatCost from '@ce/utils/formatCost'
import { useStrings } from 'framework/strings'
import css from './PerspectiveGridView.module.scss'

interface PerspectiveListViewProps {
  pespectiveData: QlceView[]
  navigateToPerspectiveDetailsPage: (perspectiveId: string, viewState?: ViewState) => void
  deletePerpsective: (perspectiveId: string) => void
  clonePerspective: (values: QlceView | Record<string, string>, isClone: boolean) => void
}

const PerspectiveListView: React.FC<PerspectiveListViewProps> = ({
  pespectiveData,
  navigateToPerspectiveDetailsPage,
  deletePerpsective,
  clonePerspective
}) => {
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { getString } = useStrings()

  const dateLabelToDisplayText: Record<string, string> = {
    [ViewTimeRangeType.Last_7]: getString('ce.perspectives.timeRangeConstants.last7Days'),
    [ViewTimeRangeType.Last_30]: getString('ce.perspectives.timeRangeConstants.last30Days'),
    [ViewTimeRangeType.LastMonth]: getString('ce.perspectives.timeRangeConstants.lastMonth')
  }

  const onEditClick: (perspectiveId: string) => void = perspectiveId => {
    history.push(
      routes.toCECreatePerspective({
        accountId: accountId,
        perspectiveId: perspectiveId
      })
    )
  }

  return (
    <Container className={css.mainGridContainer}>
      {pespectiveData.map(data => {
        const editClick: () => void = () => {
          data?.id && onEditClick(data.id)
        }

        const onDeleteClick: () => void = () => {
          data.id && deletePerpsective(data.id)
        }

        const onCloneClick: () => void = () => {
          clonePerspective(data, true)
        }

        const viewType = data?.viewType
        const isDefaultPerspective = viewType === ViewType.Default

        return data ? (
          <Card
            key={data?.id}
            interactive
            className={css.cardClass}
            onClick={() => {
              data.id && navigateToPerspectiveDetailsPage(data?.id, data.viewState || undefined)
            }}
          >
            <CardBody.Menu
              menuContent={
                <Container
                  onClick={e => {
                    e.stopPropagation()
                  }}
                >
                  <Menu>
                    <Menu.Item disabled={isDefaultPerspective} onClick={editClick} icon="edit" text="Edit" />
                    <Menu.Item onClick={onCloneClick} icon="duplicate" text="Clone" />
                    <Menu.Item
                      disabled={isDefaultPerspective}
                      className={Classes.POPOVER_DISMISS}
                      onClick={onDeleteClick}
                      icon="trash"
                      text="Delete"
                    />
                  </Menu>
                </Container>
              }
            />

            {data.viewState === ViewState.Draft && (
              <div className={css.ribbonTopLeft}>
                <span>Draft</span>
              </div>
            )}
            <Layout.Vertical spacing="small" className={css.cardContent}>
              {isDefaultPerspective && <Container className={css.sampleRibbon}></Container>}

              <Container height={23}>{isDefaultPerspective && <Icon name="harness" size={22} />}</Container>
              <Text font={{ weight: 'semi-bold' }} color="grey800" lineClamp={2}>
                {data?.name}
              </Text>
              {data && !isNaN(data?.totalCost) ? <Text color="grey800">{formatCost(data?.totalCost)}</Text> : null}
              {data?.timeRange ? (
                <Text font="small" color="grey400">
                  {dateLabelToDisplayText[data.timeRange] || getString('common.repo_provider.customLabel')}
                </Text>
              ) : null}
              <FlexExpander />
              {data?.dataSources && data.dataSources.length ? (
                <Container padding={{ top: 'large' }}>
                  <Text
                    font="xsmall"
                    color="grey400"
                    margin={{
                      bottom: 'small'
                    }}
                  >
                    Data Sources
                  </Text>

                  <Layout.Horizontal
                    spacing="small"
                    style={{
                      alignItems: 'center'
                    }}
                  >
                    {data.dataSources.map(source =>
                      source ? <Icon key={source} size={22} name={SOURCE_ICON_MAPPING[source]} /> : null
                    )}
                  </Layout.Horizontal>
                </Container>
              ) : null}
            </Layout.Vertical>
          </Card>
        ) : null
      })}
    </Container>
  )
}

export default PerspectiveListView
