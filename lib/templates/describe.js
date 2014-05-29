describe('<%= description %>', function() {

	var <%= variable('name') %>;

	beforeEach(function() {
		<%= variable('name') %> = null;
	});
	
	it('should be defined', function() {
		expect(<%= variable('name') %>).toBeDefined();
	});
	
	<%= children %>
});

