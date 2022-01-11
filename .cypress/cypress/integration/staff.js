Cypress.Commands.add('cleanUpXHR', function() {
    cy.visit('/404', { failOnStatusCode: false });
});

describe('Staff user tests', function() {
    it('report as defaults to body', function() {
        cy.server();
        cy.route('/report/new/ajax*').as('report-ajax');
        cy.request({
          method: 'POST',
          url: '/auth?r=/',
          form: true,
          body: { username: 'cs_full@example.org', password_sign_in: 'password' }
        });
        cy.visit('/');
        cy.contains('Go');
        cy.get('[name=pc]').type(Cypress.env('postcode'));
        cy.get('[name=pc]').parents('form').submit();
        cy.url().should('include', '/around');
        cy.get('#map_box').click(240, 249);
        cy.get('[name=form_as]').should('have.value', 'body');
        cy.cleanUpXHR();
    });

    it('report title and detail are correctly prefilled', function() {
        cy.server();
        cy.route('/report/new/ajax*').as('report-ajax');
        cy.request({
          method: 'POST',
          url: '/auth?r=/',
          form: true,
          body: { username: 'cs_full@example.org', password_sign_in: 'password' }
        });
        cy.visit('/');
        cy.contains('Go');
        cy.get('[name=pc]').type(Cypress.env('postcode'));
        cy.get('[name=pc]').parents('form').submit();
        cy.url().should('include', '/around');
        cy.get('#map_box').click(240, 249);
        cy.wait('@report-ajax');
        cy.pickCategory('Graffiti (offensive)');
        cy.get('[name=title]').should('have.value', 'A Graffiti (offensive) problem has been found');
        cy.get('[name=detail]').should('have.value', 'A Graffiti (offensive) problem has been found by Borsetshire County Council');
        cy.cleanUpXHR();
    });

    it('does not let staff update their name, phone or email address whilst reporting or updating', function() {
        // (Lest CS staff forget to select 'report as another user' and type the reporter's details into their own account.)
        cy.server();
        cy.route('**mapserver/peterborough*highways*', 'fixture:peterborough.xml').as('ptboro-roads-layer');

        // log in
        cy.visit('http://peterborough.localhost:3001/auth');
        cy.get('[name=username]').type('cs@peterborough.example.org');
        cy.contains('Sign in with a password').click();
        cy.get('[name=password_sign_in]').type('password');
        cy.get('[name=sign_in_by_password]').last().click();

        // Peterborough, in front of town hall
        cy.visit('http://peterborough.localhost:3001/report/new?latitude=52.571475&longitude=-0.241525');
        cy.wait('@ptboro-roads-layer');
        // pick category: with check to avoid race condition
        // but doesn't always work, so have added {force:true} as well
        cy.get('input[value="General fly tipping"]').should('be.visible').click({force:true});
        cy.nextPageReporting();

        // hazardous waste question
        cy.get('#form_hazardous').select('No');
        cy.nextPageReporting();

        // photos page
        cy.get('div[aria-label="Tips for perfect photos"] + button').click();
        cy.get('#form_title').type('fly tipped sofa');
        cy.get('#form_detail').type('looks like a chesterfield');
        cy.nextPageReporting();

        // about you page
        cy.get('[name=username]').should('be.disabled'); // (already protected)
        cy.get('[name=phone]').should('be.disabled');
        cy.get('[name=name]').should('have.attr', 'readonly');
        cy.get('#map_sidebar').parents('form').submit();

        // now check update page
        cy.get('h1 > a').click();
        cy.get('textarea#form_update').type('this is an update');
        cy.get('button.js-reporting-page--next').click();

        // update about you
        cy.get('[name=username]').should('be.disabled'); // (already protected)
        cy.get('[name=name]').should('have.attr', 'readonly');
        cy.get('input[name=submit_register]').click();
    });

});
