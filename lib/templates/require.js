describe('<%= variable('name') %> module', function() {

	var <%= variable('name') %>;
	
	it('should load without throwing', function() {
		expect(function() {
			<%= variable('name') %> = require(<%= variable('path') %>);
		}).not.toThrow();
	});

});

