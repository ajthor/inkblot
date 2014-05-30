describe('<%= description %>', function() {

	var <%= variable('name') %>;

	it('should exist', function() {
		expect(<%= variable('name') %>).to.exist;
	});
	
<%= code %><%= children %>});

