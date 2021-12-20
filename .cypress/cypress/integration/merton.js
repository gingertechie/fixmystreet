it('loads the Merton FMS Pro front page', function() {
    cy.visit('http://merton.localhost:3001/');
    cy.contains('Merton Council');
});
it('does not allow typing >255 chars in additional question fields', function() {
    cy.visit('http://merton.localhost:3001/report/new?latitude=51.40097&longitude=-0.19655');
    cy.get('input[value="Flytipping"]').click();
    cy.get('button').first().click();
    cy.get('input#form_evidence').as('evidence');
    cy.get('@evidence').type('a'.repeat(260));
    cy.get('@evidence').invoke('val').then(function(val){
        expect(val.length).to.be.at.most(255);
    });
    cy.get('#js-post-category-messages>button').click();
});
it('does not allow user to continue if additional question field value is >255', function() {
    cy.visit('http://merton.localhost:3001/report/new?latitude=51.40097&longitude=-0.19655');
    cy.get('input[value="Flytipping"]').click();
    cy.get('button').first().click();
    cy.get('input#form_evidence').as('evidence');
    cy.get('@evidence').invoke('val', 'a'.repeat(260));
    cy.get('@evidence').invoke('val').then(function(val){
        expect(val.length).to.equal(260);
    });
    cy.get('#js-post-category-messages>button').click();
    cy.contains("Please enter no more than 255 characters.");
});
