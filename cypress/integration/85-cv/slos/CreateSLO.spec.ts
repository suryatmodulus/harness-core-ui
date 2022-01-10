import {
  getSLOMetrics,
  getUserJourneysCall,
  listMonitoredServices,
  listMonitoredServicesCallResponse,
  listSLOMetricsCallResponse,
  listSLOsCall,
  listSLOsCallResponse,
  listUserJourneysCallResponse,
  updatedListSLOsCallResponse
} from '../../../support/85-cv/slos/constants'

describe('Create SLO', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.login('test', 'test')

    cy.visitChangeIntelligence()
  })

  it('should be able to create SLO by filling all the details.', () => {
    cy.intercept('GET', listSLOsCall, listSLOsCallResponse)
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', getSLOMetrics, listSLOMetricsCallResponse)

    // Verifying NO SLOs state.
    cy.contains('p', 'SLOs').click()
    cy.contains('p', 'No SLOs Present.').should('be.visible')

    cy.contains('span', 'New SLO').click()

    // Filling details Under Name tab for SLO creation
    cy.fillName('SLO-1')
    cy.get('input[placeholder="Select or create user journey"]').click()
    cy.contains('p', 'new-one').click({ force: true })

    cy.wait(2000)
    cy.contains('span', 'Continue').click()

    // selecting monitored service
    cy.get('input[placeholder="- Select Monitored Service -"]').click()
    cy.contains('p', 'cvng_prod').click({ force: true })

    // selecting health source
    cy.get('input[placeholder="- Select Health Source -"]').click()
    cy.contains('p', 'appd_cvng_prod').click({ force: true })

    // selecting event type
    cy.get('input[name="eventType"]').click()
    cy.contains('p', 'Bad').click({ force: true })

    // selecting Metric for Good requests
    cy.get('input[name="goodRequestMetric"]').click()
    cy.contains('p', 'number_of_slow_calls').click({ force: true })

    cy.wait(1000)

    // selecting Metric for Good requests
    cy.get('input[name="validRequestMetric"]').click()
    cy.contains('p', 'https_errors_per_min').click({ force: true })

    // Filling objective value
    cy.get('input[name="objectiveValue"]').type('2')

    // selecting condition for SLI value
    cy.get('input[name="objectiveComparator"]').click({ force: true })
    cy.contains('p', '<').click({ force: true })

    cy.wait(2000)
    cy.contains('span', 'Continue').click()

    // selecting condition for SLI value
    cy.get('input[name="periodLength"]').click()
    cy.contains('p', '7').click({ force: true })

    cy.contains('span', 'Save').click()

    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse)

    cy.contains('span', 'SLO created successfully').should('be.visible')
    cy.contains('p', 'cvng_prod').should('be.visible')
    cy.contains('p', 'Latency').should('be.visible')
    cy.contains('p', 'appd_cvng_prod').should('be.visible')
    cy.contains('p', 'Rolling').should('be.visible')
    cy.contains('p', '7 days').should('be.visible')
  })
})
