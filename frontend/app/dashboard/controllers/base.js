angular.module('app.dashboard').config(dashboardConfig);

dashboardConfig.$inject = ['$stateProvider'];
function dashboardConfig($stateProvider) {
    $stateProvider.state('base.dashboard', {
        url: '/',
        views: {
            '@': {
                templateUrl: 'dashboard/controllers/base.html',
                controller: DashboardController,
                controllerAs: 'db',
            },
        },
        ncyBreadcrumb: {
            label: 'Dashboard',
        },
    });
}

angular.module('app.dashboard').controller('DashboardController', DashboardController);

DashboardController.$inject = ['$compile', '$scope', '$state', '$templateCache', '$timeout', 'LocalStorage',
    'Settings', 'Tenant', 'User'];
function DashboardController($compile, $scope, $state, $templateCache, $timeout, LocalStorage,
                             Settings, Tenant, User) {
    var db = this;
    var storage = new LocalStorage($state.current.name + 'widgetInfo');

    db.widgetSettings = storage.get('', {});
    db.showConnectEmailWidget = false;

    db.openWidgetSettingsModal = openWidgetSettingsModal;
    db.openWidgetEmailConnectModal = openWidgetEmailConnectModal;

    Settings.page.setAllTitles('custom', 'Dashboard');

    activate();

    //////

    function activate() {
        Tenant.query({}, function(tenant) {
            db.tenant = tenant;
        });

        User.me({}, function(user) {
            db.showConnectEmailWidget = !user.connected_or_dismissed;
        });
    }

    function openWidgetSettingsModal() {
        swal({
            title: messages.alerts.dashboard.title,
            html: $compile($templateCache.get('dashboard/controllers/widget_settings.html'))($scope),
            showCancelButton: true,
            showCloseButton: true,
        }).then(function(isConfirm) {
            if (isConfirm) {
                storage.put('', db.widgetSettings);
                $state.reload();
            }
        }).done();
    }

    function openWidgetEmailConnectModal() {
        var args = {
            id: 'me',
            connected_or_dismissed: true,
        };
        db.showConnectEmailWidget = false;

        swal({
            title: messages.alerts.requestEmail.title,
            html: $compile($templateCache.get('dashboard/controllers/widget_request_email_account.html'))($scope),
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: messages.alerts.requestEmail.confirmButtonText,
        }).then(function(isConfirm) {
            // Only show the request to connect an email account once.
            User.patch(args).$promise;

            if (isConfirm) {
                // Redirect to email account setup page.
                $state.go('base.preferences.emailaccounts');
            }
        }).done();
    }
}
