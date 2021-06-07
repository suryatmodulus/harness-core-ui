import React, { useState, useEffect } from 'react'
import Draggable from 'react-draggable'
import { Container, Layout, Text } from '@wings-software/uicore'
import cx from 'classnames'
import css from './WorkloadSlider.module.scss'

interface WorkloadSliderProps {
  height?: number
  width: number
  selectedValue?: number
  onSelected: (value: number) => void
  scale: number
}

export const WorkloadSlider: React.FC<WorkloadSliderProps> = props => {
  const sliderWidth = props.width
  const divi = (sliderWidth * 0.9) / props.scale
  const [workload, setWorkload] = useState(1)
  useEffect(() => {
    if (props.selectedValue) {
      setWorkload(props.selectedValue)
    }
  }, [props.selectedValue])
  return (
    <Layout.Vertical width={sliderWidth}>
      <Draggable
        axis="x"
        bounds={{ right: sliderWidth * 0.9, left: 1 }}
        defaultClassNameDragging={css.draggingHandle}
        position={{ x: (props.selectedValue || 0) * divi, y: 7 }}
        onDrag={(e, data) => {
          e.stopPropagation()
          setWorkload((data.x / divi) | 0)
        }}
        onStop={() => {
          props.onSelected(workload)
        }}
      >
        <Container className={css.handleWrapper}>
          <Text font={{ size: 'small' }} width={30} className={css.score}>
            {workload}
          </Text>
          <Container className={css.handle} />
        </Container>
      </Draggable>
      <Layout.Horizontal>
        <div style={{ width: (workload * sliderWidth) / props.scale }} className={cx(css.bar, css.bar1)} />
        <div
          style={{ width: sliderWidth - (workload * sliderWidth) / props.scale }}
          className={cx(css.bar, css.bar2)}
        />
        <div style={{ width: sliderWidth * 0.1 }} className={cx(css.bar, css.bar3)} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
