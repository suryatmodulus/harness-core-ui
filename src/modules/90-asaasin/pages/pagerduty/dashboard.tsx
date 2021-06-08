import React from 'react'
import { Layout, Text, Container, Heading } from '@wings-software/uicore'
import { usePagerdutySavings } from 'services/asaasin'

const AsaasinPagerdutyDashboard: React.FC = () => {
  const { data: savings, loading: loading } = usePagerdutySavings({
    debounce: 300
  })
  return (
    <>
      <Layout.Vertical
        spacing="large"
        style={{
          justifyContent: 'left',
          alignItems: 'left',
          margin: '20px'
        }}
      >
        <Layout.Horizontal spacing="xxlarge">
          <img
            src="https://img.apksum.com/32/com.pagerduty.android/6.01/icon.png"
            style={{ height: '80px', width: '80px' }}
          ></img>
          <Text font="large" style={{ lineHeight: '24px', marginTop: '20px' }}>
            PagerDuty
          </Text>
        </Layout.Horizontal>

        {!loading && savings != null && (
          <>
            <Layout.Horizontal spacing="xxlarge">
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#05AAB6' }}>
                    ${savings.yearly_savings?.current_spend}
                  </Heading>
                  <Text style={{ color: '#05AAB6' }}>Est. Annual Spend</Text>
                </Layout.Vertical>
              </Container>
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#9872e7' }}>
                    ${savings.yearly_savings?.potential_savings}
                  </Heading>
                  <Text style={{ color: '#9872e7' }}>Est. Annual Savings</Text>
                </Layout.Vertical>
              </Container>
              {savings.yearly_savings && savings.yearly_savings.potential_savings && (
                <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                  <Layout.Vertical spacing="small">
                    <Heading level={1} style={{ color: '#05AAB6' }}>
                      {savings.yearly_savings.savings_percent}%
                    </Heading>
                    <Text style={{ color: '#05AAB6' }}>Savings</Text>
                  </Layout.Vertical>
                </Container>
              )}
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#05AAB6' }}>
                    {savings.total_users}
                  </Heading>
                  <Text style={{ color: '#05AAB6' }}>Total Users</Text>
                </Layout.Vertical>
              </Container>
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#9872e7' }}>
                    {savings.active_users}
                  </Heading>
                  <Text style={{ color: '#9872e7' }}>Active Users</Text>
                </Layout.Vertical>
              </Container>
            </Layout.Horizontal>
          </>
        )}
      </Layout.Vertical>
    </>
  )
}

export default AsaasinPagerdutyDashboard
