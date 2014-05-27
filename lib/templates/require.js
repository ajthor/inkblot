describe('<%= variable('name').value %> module', function() {

	var <%= variable('name').value %>;
	
	it('should load without throwing', function() {
		expect(function() {
			<%= variable('name').value %> = require(<%= variable('path').value %>);
		}).not.toThrow();
	});

});

