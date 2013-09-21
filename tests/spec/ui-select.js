describe('ui-select', function() {
    var UISelect = require('ui-select');

    before(function() {
        this.el = document.querySelector('select');
        this.select = new UISelect(this.el, {
            search: true
        });
    });

    after(function() {

    });

    it('should return instance of ui-select', function() {
        expect(this.select).to.be.an.instanceof(UISelect);
    });

    it('should respondTo init and destroy methods', function() {
        expect(this.select).to.respondTo('init');
        expect(this.select).to.respondTo('destroy');
    });

});
