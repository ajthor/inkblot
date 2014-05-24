describe('module <%= variable('name') %>', function() {

	var <%= variable('name') %>;
	
	it('should load without throwing', function() {
		expect(function() {
			<%= variable('name') %> = require(<%= variable('path') %>);
		}).not.toThrow();
	});

});

