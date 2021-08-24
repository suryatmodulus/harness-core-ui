import React, { useCallback, useMemo, useReducer, useState } from 'react'
import debounce from 'p-debounce'
import cx from 'classnames'
import { get, isEqual } from 'lodash-es'

import { Container, Icon, Layout, Text, TextInput } from '@wings-software/uicore'
import useDidMountEffect from '@ce/common/useDidMountEffect'

import { useStrings } from 'framework/strings'
import type { NodeRecommendationDto, RecommendationOverviewStats, RecommendationResponse } from 'services/ce/services'
import { RecommendClusterRequest, useRecommendCluster } from 'services/ce/recommenderService'
import formatCost from '@ce/utils/formatCost'
import css from './NodeRecommendation.module.scss'

interface RecommenderProps {
  stats: RecommendationOverviewStats
  details: NodeRecommendationDto
}

interface IState {
  sumCpu: number
  sumMem: number
  maxNodes: number
  minNodes: number
}

export enum ACTIONS {
  'CPUS',
  'MEM',
  'MIN_NODES',
  'MAX_NODES'
}

interface Action {
  type: ACTIONS
  data: number
}

const reducer = (state: IState, action: Action) => {
  const { type, data } = action

  switch (type) {
    case ACTIONS.CPUS:
      return { ...state, sumCpu: data }
    case ACTIONS.MEM:
      return { ...state, sumMem: data }
    case ACTIONS.MIN_NODES:
      return { ...state, minNodes: data }
    case ACTIONS.MAX_NODES:
      return { ...state, maxNodes: data }
    default:
      return state
  }
}

const Recommender = (props: RecommenderProps) => {
  const { stats, details } = props
  const { sumCpu, sumMem, maxNodes, minNodes } = (details.resourceRequirement || {}) as RecommendClusterRequest
  const { provider, region, service } = (details.recommended || {}) as RecommendationResponse

  const [recomDetails, setRecomDetails] = useState(details)
  const [state, dispatch] = useReducer(
    reducer,
    useMemo(
      () =>
        ({
          sumCpu: +(sumCpu || 0).toFixed(2),
          sumMem: +(sumMem || 0).toFixed(2),
          maxNodes: +(maxNodes || 0).toFixed(2),
          minNodes: +(minNodes || 0).toFixed(2)
        } as IState),
      []
    )
  )

  const { mutate: fetchNewRecommendation, loading } = useRecommendCluster({
    provider: provider || '',
    region: region || '',
    service: service || ''
  })

  const debouncedFetchNewRecomm = useCallback(debounce(fetchNewRecommendation, 500), [])
  useDidMountEffect(async () => {
    const payload = { ...details.resourceRequirement, ...state }
    try {
      const response = await debouncedFetchNewRecomm(payload as RecommendClusterRequest)
      const newState = {
        ...recomDetails,
        recommended: { ...recomDetails.recommended, ...response }
      } as NodeRecommendationDto

      // TODO: check how we can avoid it.
      if (!isEqual(recomDetails, newState)) {
        setRecomDetails(newState)
      }
    } catch (e) {
      // console.log('Error in fetching recommended cluster ', e)
    }
  }, [state])

  return (
    <Container>
      <Preferences state={state} dispatch={dispatch} />
      <Comparison stats={stats} details={recomDetails} loading={loading} />
    </Container>
  )
}

const Preferences = ({ dispatch, state }: { dispatch: React.Dispatch<Action>; state: IState }) => {
  const { getString } = useStrings()
  return (
    <Container className={css.preferences}>
      <Layout.Vertical spacing="medium">
        <Text>{getString('preferences').toUpperCase()}</Text>
        <Container>
          <Layout.Horizontal spacing="xxxlarge">
            <Resources state={state} dispatch={dispatch} />
            <Nodes state={state} dispatch={dispatch} />
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

const Resources = ({ dispatch, state }: { dispatch: React.Dispatch<Action>; state: IState }) => {
  const { getString } = useStrings()
  return (
    <Container>
      <Layout.Vertical spacing="small">
        <Text>{getString('ce.nodeRecommendation.resourceNeed')}</Text>
        <Container>
          <Text inline color="grey800">
            {getString('ce.nodeRecommendation.cpus')}
          </Text>
          <TextInput
            defaultValue={`${state.sumCpu}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.CPUS, data: +e.target.value })
            }
          />
          <Text inline style={{ paddingLeft: 25 }} color="grey800">
            {getString('ce.nodeRecommendation.mem')}
          </Text>
          <TextInput
            defaultValue={`${state.sumMem}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.MEM, data: +e.target.value })
            }
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

const Nodes = ({ dispatch, state }: { dispatch: React.Dispatch<Action>; state: IState }) => {
  const { getString } = useStrings()
  return (
    <Container>
      <Layout.Vertical spacing="small">
        <Text>{getString('ce.nodeRecommendation.nodeCount')}</Text>
        <Container>
          <Text inline color="grey800">
            {getString('ce.nodeRecommendation.minNode')}
          </Text>
          <TextInput
            defaultValue={`${state.minNodes}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.MIN_NODES, data: +e.target.value })
            }
          />
          <Text inline style={{ paddingLeft: 25 }} color="grey800">
            {getString('ce.nodeRecommendation.maxNode')}
          </Text>
          <TextInput
            defaultValue={`${state.maxNodes}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.MAX_NODES, data: +e.target.value })
            }
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

interface ComparisonProps {
  stats: RecommendationOverviewStats
  details: NodeRecommendationDto
  loading: boolean
}

interface CardRow {
  label: string
  current: string | number
  spot: string | number
  demand: string | number
  renderer?: (data: CardRow, type: CardType) => React.ReactNode
}

const Comparison = (props: ComparisonProps) => {
  const { getString } = useStrings()
  const { stats, details, loading } = props

  const instanceTypeToLabel: Record<string, string> = useMemo(() => {
    return {
      ON_DEMAND: getString('ce.nodeRecommendation.onDemand'),
      SPOT: getString('ce.nodeRecommendation.spot')
    }
  }, [])

  const data: CardRow[] = useMemo(() => {
    const curInstanceType = details.current?.instanceCategory || ''
    const getCostPerNodePerHour = (obj: RecommendationResponse | null) => {
      if (curInstanceType === 'ON_DEMAND') {
        return get(obj, 'nodePools[0].vm.onDemandPrice', 0)
      }

      return get(obj, 'nodePools[0].vm.avgPrice', 0)
    }

    const getMonthlyCostFor = (type: CardType) => {
      const mp = details.recommended?.accuracy?.masterPrice || 0
      if (type === CardType.RECOMMENDED_SPOT) {
        return (mp + (details.recommended?.accuracy?.spotPrice || 0)) * 24 * 30
      }

      return (mp + (details.recommended?.accuracy?.workerPrice || 0)) * 24 * 30
    }

    const getEstimatedSavingsFor = (type: CardType) => {
      const recommendedMonthlyCost = getMonthlyCostFor(type)
      return stats.totalMonthlyCost - recommendedMonthlyCost
    }

    return [
      {
        label: '',
        current: curInstanceType,
        spot: 'SPOT',
        demand: 'ON_DEMAND',
        renderer: (value, type) => {
          const v = value[type!]
          return v && <div className={css.cardLabelPill}>{instanceTypeToLabel[v]}</div>
        }
      },
      {
        label: getString('regionLabel'),
        current: details.current?.region || '',
        spot: details.recommended?.region || '',
        demand: details.recommended?.region || ''
      },
      {
        label: getString('ce.nodeRecommendation.cpus'),
        current: get(details.current, 'nodePools[0].vm.cpusPerVm', 0).toFixed(2),
        spot: get(details.recommended, 'nodePools[0].vm.cpusPerVm', 0).toFixed(2),
        demand: get(details.recommended, 'nodePools[0].vm.cpusPerVm', 0).toFixed(2)
      },
      {
        label: getString('ce.nodeRecommendation.memory'),
        current: get(details.current, 'nodePools[0].vm.memPerVm', 0).toFixed(2),
        spot: get(details.recommended, 'nodePools[0].vm.memPerVm', 0).toFixed(2),
        demand: get(details.recommended, 'nodePools[0].vm.memPerVm', 0).toFixed(2)
      },
      {
        label: getString('ce.nodeRecommendation.instanceFam'),
        current: get(details.current, 'nodePools[0].vm.type', ''),
        spot: get(details.recommended, 'nodePools[0].vm.type', ''),
        demand: get(details.recommended, 'nodePools[0].vm.type', '')
      },
      {
        label: getString('ce.nodeRecommendation.nodeCount'),
        current: get(details.current, 'nodePools[0].sumNodes', 0),
        spot: get(details.recommended, 'nodePools[0].sumNodes', 0),
        demand: get(details.recommended, 'nodePools[0].sumNodes', 0)
      },
      {
        label: getString('ce.nodeRecommendation.costPerHour'),
        current: formatCost(getCostPerNodePerHour(details.current)),
        spot: formatCost(get(details.recommended, 'nodePools[0].vm.avgPrice', 0)),
        demand: formatCost(get(details.recommended, 'nodePools[0].vm.onDemandPrice', 0))
      },
      {
        label: getString('ce.nodeRecommendation.monthlyCost'),
        current: formatCost(stats.totalMonthlyCost),
        spot: formatCost(getMonthlyCostFor(CardType.RECOMMENDED_SPOT)),
        demand: formatCost(getMonthlyCostFor(CardType.RECOMMENDED_ON_DEMAND)),
        renderer: (value, type) => {
          const v = value[type!]
          const isRecommendation = type === CardType.RECOMMENDED_SPOT || type === CardType.RECOMMENDED_ON_DEMAND
          return (
            <Text
              color="grey700"
              font={{
                weight: isRecommendation ? 'bold' : 'light',
                size: 'small'
              }}
            >
              {v}
            </Text>
          )
        }
      },
      {
        label: getString('ce.nodeRecommendation.estimatedSavings'),
        current: 0,
        spot: getEstimatedSavingsFor(CardType.RECOMMENDED_SPOT),
        demand: getEstimatedSavingsFor(CardType.RECOMMENDED_ON_DEMAND),
        renderer: (value, type) => {
          const v = value[type!]
          const isRecommendation = type === CardType.RECOMMENDED_SPOT || type === CardType.RECOMMENDED_ON_DEMAND
          const isLabel = type === CardType.LABEL

          let color = 'grey700'
          if (isRecommendation) {
            color = v < 0 ? 'red500' : 'green700'
          }

          return (
            <Text
              color={color}
              font={{
                weight: 'bold',
                size: isLabel ? 'small' : 'medium'
              }}
            >
              {isLabel ? v : formatCost(+v)}
            </Text>
          )
        }
      }
    ]
  }, [stats, details])

  return (
    <Container className={css.comparisonCtn}>
      <Text className={css.title}>{getString('ce.nodeRecommendation.compare')}</Text>
      <Container>
        <Container className={css.cardCategory}>
          <Container />
          <Text color="grey700" font={{ size: 'medium', weight: 'semi-bold', align: 'center' }}>
            {getString('common.current')}
          </Text>
          <Container />
          <Container className={css.recommendationCategory}>
            <div className={css.line} />
            <Text color="grey700" font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('ce.nodeRecommendation.recommended')}
            </Text>
            <div className={css.line} />
          </Container>
        </Container>
        <Container className={css.cards}>
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow, css.leftAlign)} type={CardType.LABEL} />
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow)} emptyCards />
          <Card data={data} classNames={css.white} type={CardType.CURRENT} />
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow)} emptyCards />
          <Card data={data} classNames={css.blue} type={CardType.RECOMMENDED_SPOT} loading={loading} />
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow)} emptyCards />
          <Card data={data} classNames={css.blue} type={CardType.RECOMMENDED_ON_DEMAND} loading={loading} />
        </Container>
      </Container>
      <Container className={css.cardInfo}>
        <Container />
        <Text
          color="grey400"
          icon="info"
          font="small"
          iconProps={{
            size: 12,
            color: 'grey400'
          }}
        >
          {getString('ce.nodeRecommendation.suitable.qa')}
        </Text>
        <Text
          color="grey400"
          icon="info"
          font="small"
          iconProps={{
            size: 12,
            color: 'grey400'
          }}
        >
          {getString('ce.nodeRecommendation.suitable.prod')}
        </Text>
      </Container>
    </Container>
  )
}

const enum CardType {
  LABEL = 'label',
  CURRENT = 'current',
  RECOMMENDED_SPOT = 'spot',
  RECOMMENDED_ON_DEMAND = 'demand'
}

interface CardProps {
  classNames?: string
  data: CardRow[]
  type?: CardType
  emptyCards?: boolean
  loading?: boolean
}

const Card = (props: CardProps) => {
  const { classNames, data = [], type, emptyCards = false, loading = false } = props
  const isRecommendationCard = type === CardType.RECOMMENDED_ON_DEMAND || type === CardType.RECOMMENDED_SPOT

  if (loading) {
    return (
      <div className={cx(css.card)}>
        <Loader />
      </div>
    )
  }

  if (emptyCards) {
    return (
      <div className={cx(css.card, classNames)}>
        {data.map((_, idx) => (
          <div key={idx} className={css.cardItem} />
        ))}
      </div>
    )
  }

  return (
    <div className={cx(css.card, classNames)}>
      {isRecommendationCard && <div className={css.cardOverlay} />}
      {data.map(d => {
        return typeof d.renderer === 'function' ? (
          <div className={css.cardItem}>{d.renderer(d, type!)}</div>
        ) : (
          <Text className={css.cardItem} font="small">
            {d[type!]}
          </Text>
        )
      })}
    </div>
  )
}

const Loader = (props: { className?: string }) => {
  return (
    <Container className={cx(css.cardLoadingContainer, props.className)}>
      <Icon name="spinner" color="primary5" size={30} />
    </Container>
  )
}

export default Recommender
