describe('<%= description %>', function() {

	var <%= variable('name') %>;

	it('should be defined', function() {
		expect(<%= variable('name') %>).toBeDefined();
	});
	
<%= children %>});

