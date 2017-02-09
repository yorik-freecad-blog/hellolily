angular.module('app.calls').factory('Call', SharedEmailConfig);

SharedEmailConfig.$inject = ['$resource'];
function SharedEmailConfig($resource) {
    var _call = $resource(
        '/api/calls/:id/',
        null,
        {
            update: {
                method: 'PUT',
                params: {
                    id: '@id',
                },
            },
            patch: {
                method: 'PATCH',
                params: {
                    id: '@id',
                },
            },
            delete: {
                method: 'DELETE',
            },
            getLatestCall: {
                url: '/api/calls/latest/',
            },
        });

    return _call;
}
