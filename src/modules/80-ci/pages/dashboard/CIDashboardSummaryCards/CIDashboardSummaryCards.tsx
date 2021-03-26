import React from 'react'
import { Container, Text, Icon } from '@wings-software/uicore'
import styles from './CIDashboardSummaryCards.module.scss'

export interface SummaryCardProps {
  title: string
  text: string
  subContent?: React.ReactNode
  diff: {
    value: number
    isIncrease: boolean
    color: string
  }
}

export default function CIDashboardSummaryCards() {
  return (
    <Container className={styles.summaryCards}>
      <SummaryCard
        title="Total Builds"
        text="120"
        diff={{
          value: 12,
          isIncrease: true,
          color: 'var(--blue-500)'
        }}
      />
      <SummaryCard
        title="Test Cycle Time Saved"
        text="38m"
        subContent="445/1200 Tests Executed"
        diff={{
          value: 13,
          isIncrease: false,
          color: 'var(--blue-500)'
        }}
      />
      <SummaryCard
        title="Successful Builds"
        text="98"
        diff={{
          value: 4,
          isIncrease: true,
          color: 'var(--green-500)'
        }}
      />
      <SummaryCard
        title="Failed Builds"
        text="14"
        diff={{
          value: 7,
          isIncrease: false,
          color: 'var(--red-500)'
        }}
      />
    </Container>
  )
}

export function SummaryCard({ title, text, subContent, diff }: SummaryCardProps) {
  const arrowStyle = !diff.isIncrease ? { transform: 'rotate(180deg)' } : undefined
  return (
    <Container className={styles.card}>
      <Container className={styles.cardHeader}>{title}</Container>
      <Container className={styles.cardContent}>
        <Container className={styles.contentMain}>
          <Text>{text}</Text>
          <Container className={styles.subContent}>{subContent}</Container>
        </Container>
        <Container className={styles.diffContent}>
          <Text style={{ color: diff.color }}>{`${diff.value}%`}</Text>
          <Icon name="fat-arrow-up" style={arrowStyle} />
        </Container>
      </Container>
    </Container>
  )
}
