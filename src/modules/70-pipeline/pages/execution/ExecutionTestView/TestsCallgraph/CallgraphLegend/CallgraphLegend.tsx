import React from 'react'
import classNames from 'classnames'
import { useStrings } from 'framework/strings'
import css from './CallgraphLegend.module.scss'

interface CallgraphLegendProps {
  totalTestsCount: number
  totalSourcesCount: number
  updatedTestsCount: number
  updatedSourcesCount: number
  selectedTests: number
}

export const CallgraphLegend = (props: CallgraphLegendProps): React.ReactElement => {
  const { totalSourcesCount, totalTestsCount, updatedTestsCount, updatedSourcesCount, selectedTests } = props
  const { getString } = useStrings()
  return (
    <div className={css.legend}>
      <div className={css.col}>
        <div className={css.item}>
          <span className={classNames(css.circle, css.test, css.transparent)}></span>
          <span className={css.label}>{getString('pipeline.testsReports.testMethods')}</span>
          <span className={classNames(css.count, css.test)}>{totalTestsCount}</span>
        </div>
        <div className={css.item}>
          <span className={classNames(css.circle, css.source, css.transparent)}></span>
          <span className={css.label}>{getString('pipeline.testsReports.sourceMethods')}</span>
          <span className={classNames(css.count, css.source)}>{totalSourcesCount}</span>
        </div>
      </div>
      <div className={css.col}>
        <div className={css.item}>
          <span className={classNames(css.circle, css.test)}></span>
          <span className={css.label}>{getString('pipeline.testsReports.changedTestMethods')}</span>
          <span className={classNames(css.count, css.test)}>{updatedTestsCount}</span>
          <span className={classNames(css.count, css.test)}>{`(${((updatedTestsCount / totalTestsCount) * 100).toFixed(
            2
          )}%)`}</span>
        </div>
        <div className={css.item}>
          <span className={classNames(css.circle, css.source)}></span>
          <span className={css.label}>{getString('pipeline.testsReports.changedSourceMethods')}</span>
          <span className={classNames(css.count, css.source)}>{updatedSourcesCount}</span>
          <span className={classNames(css.count, css.test)}>{`(${(
            (updatedSourcesCount / totalSourcesCount) *
            100
          ).toFixed(2)}%)`}</span>
        </div>
      </div>
      <div className={css.col}>
        <div className={classNames(css.item, css.selected)}>
          <span className={classNames(css.circle, css.test)}></span>
          <span className={css.label}>{getString('pipeline.testsReports.selectedTestMethods')}</span>
          <span className={classNames(css.count, css.test)}>{selectedTests}</span>
          <span className={classNames(css.count, css.test)}>{`(${((selectedTests / totalTestsCount) * 100).toFixed(
            2
          )}%)`}</span>
        </div>
      </div>
    </div>
  )
}
