import {
  getUserJourneysCall,
  listMonitoredServices,
  listMonitoredServicesCallResponse,
  listSLOsCall,
  listUserJourneysCallResponse,
  updatedListSLOsCallResponse,
  getSLORiskCount,
  getSLORiskCountWithUserJourneyNewOne,
  getSLORiskCountWithUserJourneySecondJourney,
  getMonitoredService,
  listSLOsCallResponse,
  deleteSLOData,
  listSLOsCallWithUserJourneyNewOne,
  listSLOsCallWithUserJourneySecondJourney,
  listSLOsCallWithCVNGProd,
  listSLOsCallWithCVNGDev,
  getSLORiskCountWithCVNGDev,
  getSLORiskCountWithCVNGProd,
  listSLOsCallWithCalender,
  listSLOsCallWithRolling,
  getSLORiskCountWithCalender,
  getSLORiskCountWithRolling,
  listSLOsCallWithAvailability,
  listSLOsCallWithLatency,
  getSLORiskCountWithAvailability,
  getSLORiskCountWithLatency,
  listSLOsCallWithUnhealthy,
  listSLOsCallWithHealthy,
  errorResponse,
  getSLORiskCountResponse,
  getMonitoredServiceResponse
} from '../../../support/85-cv/slos/constants'

describe('CVSLOsListingPage', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.login('test', 'test')
    cy.visitChangeIntelligence()
  })

  it('it should ensure SLO card features are working fine', () => {
    cy.intercept('GET', listSLOsCall, errorResponse)
    cy.intercept('DELETE', deleteSLOData, errorResponse)
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', getSLORiskCount, getSLORiskCountResponse)
    cy.intercept('GET', getMonitoredService, getMonitoredServiceResponse)

    cy.contains('p', 'SLOs').click()

    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('be.visible')

    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse)

    cy.contains('span', 'Retry').click()

    cy.contains('p', 'cvng_prod').should('be.visible')
    cy.contains('p', 'Latency').should('be.visible')
    cy.contains('p', 'appd_cvng_prod').should('be.visible')
    cy.contains('p', 'Rolling').should('be.visible')
    cy.contains('p', '7 days').should('be.visible')
    cy.contains('h2', '138.44%').should('be.visible')
    cy.contains('h2', '6').should('be.visible')

    cy.contains('h2', '99.00%').should('be.visible')
    cy.contains('h2', '100.00%').should('be.visible')
    cy.contains('span', '99%').should('be.visible')

    cy.contains('div', 'Error Budget').click()

    cy.contains('span', '100.00%').should('be.visible')
    cy.contains('text', '104').should('be.visible')
    cy.contains('p', '104').should('be.visible')

    cy.contains('p', 'prod').click()

    cy.contains('div', 'Service Health').should('be.visible')
    cy.contains('p', 'SLOs').click()
    cy.contains('h2', 'SLO-1').should('be.visible')

    cy.get('[data-icon="Options"]').click()
    cy.get('[icon="trash"]').click()
    cy.contains('p', 'Delete SLO-1?').should('be.visible')
    cy.contains('p', 'Are you sure you want to delete SLO: SLO-1?').should('be.visible')
    cy.contains('span', 'Delete').click({ force: true })

    cy.contains('span', 'Oops, something went wrong on our end. Please contact Harness Support.').should('be.visible')
  })

  it('should verify filters', () => {
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithUserJourneySecondJourney, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithUserJourneyNewOne, updatedListSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithCVNGDev, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithCVNGProd, updatedListSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithCalender, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithRolling, updatedListSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithAvailability, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithLatency, updatedListSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithUnhealthy, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithHealthy, updatedListSLOsCallResponse)
    cy.intercept('GET', getSLORiskCount, getSLORiskCountResponse)
    cy.intercept('GET', getSLORiskCountWithUserJourneySecondJourney, getSLORiskCountResponse)
    cy.intercept('GET', getSLORiskCountWithUserJourneyNewOne, getSLORiskCountResponse)
    cy.intercept('GET', getSLORiskCountWithCVNGDev, getSLORiskCountResponse)
    cy.intercept('GET', getSLORiskCountWithCVNGProd, getSLORiskCountResponse)
    cy.intercept('GET', getSLORiskCountWithCalender, getSLORiskCountResponse)
    cy.intercept('GET', getSLORiskCountWithRolling, getSLORiskCountResponse)
    cy.intercept('GET', getSLORiskCountWithAvailability, getSLORiskCountResponse)
    cy.intercept('GET', getSLORiskCountWithLatency, getSLORiskCountResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)

    cy.contains('p', 'SLOs').click()

    cy.contains('h2', 'SLO-1').should('be.visible')

    cy.findByTestId('userJourney-filter').click()
    cy.contains('p', 'Second Journey').click({ force: true })
    cy.contains('p', 'No SLOs Present.').should('be.visible')
    cy.findByTestId('userJourney-filter').click()
    cy.contains('p', 'new-one').click({ force: true })
    cy.contains('h2', 'SLO-1').should('be.visible')

    cy.findByTestId('userJourney-filter').click()
    cy.contains('p', 'All').click({ force: true })

    cy.findAllByTestId('monitoredServices-filter').click()
    cy.contains('p', 'cvng_dev').click({ force: true })
    cy.contains('p', 'No SLOs Present.').should('be.visible')
    cy.findAllByTestId('monitoredServices-filter').click()
    cy.contains('p', 'cvng_prod').click({ force: true })
    cy.contains('h2', 'SLO-1').should('be.visible')

    cy.findByTestId('monitoredServices-filter').click()
    cy.contains('p', 'All').click({ force: true })

    cy.findAllByTestId('sloTargetAndBudget-filter').click()
    cy.contains('p', 'Calender').click({ force: true })
    cy.contains('p', 'No SLOs Present.').should('be.visible')
    cy.findAllByTestId('sloTargetAndBudget-filter').click()
    cy.contains('p', 'Rolling').click({ force: true })
    cy.contains('h2', 'SLO-1').should('be.visible')

    cy.findByTestId('sloTargetAndBudget-filter').click()
    cy.contains('p', 'All').click({ force: true })

    cy.findAllByTestId('sliType-filter').click()
    cy.contains('p', 'Availability').click({ force: true })
    cy.contains('p', 'No SLOs Present.').should('be.visible')
    cy.findAllByTestId('sliType-filter').click()
    cy.contains('p', 'Latency').click({ force: true })
    cy.contains('h2', 'SLO-1').should('be.visible')

    cy.contains('span', 'Clear Filters').click()
    cy.contains('span', 'Clear Filters').should('not.exist')

    cy.contains('p', 'Unhealthy').click()
    cy.contains('p', 'No SLOs Present.').should('be.visible')
    cy.contains('p', 'Healthy').click()
    cy.contains('h2', 'SLO-1').should('be.visible')
  })
})
