/**
 * caseControllers is a container for all case related Controllers
 */
angular.module('caseControllers', [
    // Angular dependencies
    'ngCookies',

    // 3rd party
    'ui.bootstrap',

    // Lily dependencies
    'caseServices'
])

    /**
     * CaseListController controller to show list of cases
     *
     */
    .controller('CaseListController', [
        '$scope',
        '$cookieStore',
        '$window',
        '$location',
        'Case',
        'Cookie',
        'HLDate',
        'HLFilters',
        function($scope, $cookieStore, $window, $location, Case, Cookie, HLDate, HLFilters) {
            Cookie.prefix ='caseList';

            // Setup search query
            var searchQuery = '';

            // Check if filter is set as query parameter
            var search = $location.search().search;
            if (search != undefined) {
                searchQuery = search;
            } else {
                // Get searchQuery from cookie
                searchQuery = Cookie.getCookieValue('searchQuery', '');
            }

            /**
             * table object: stores all the information to correctly display the table
             */
            $scope.table = {
                page: 1,  // current page of pagination: 1-index
                pageSize: 60,  // number of items per page
                totalItems: 0, // total number of items
                searchQuery: searchQuery,  // search query
                archived: Cookie.getCookieValue('archived', false),
                order:  Cookie.getCookieValue('order', {
                    ascending: true,
                    column:  'expires'  // string: current sorted column
                }),
                visibility: Cookie.getCookieValue('visibility', {
                    caseId: true,
                    client: true,
                    subject: true,
                    priority: true,
                    type: true,
                    status: true,
                    expires: true,
                    assignedTo: true,
                    createdBy: true,
                    tags: true
                })};

            $scope.displayFilterClear = false;

            getFilterList();

            /**
             * Gets the filter list. Is either the value in the cookie or a new list
             *
             * @returns filterList (object): object containing the filter list
             */
            function getFilterList () {
                var filterListCookie = Cookie.getCookieValue('filterList', null);

                if (!filterListCookie) {
                    var filterList = [
                        {
                            name: 'Assigned to me',
                            value: 'assigned_to_id:' + currentUser.id,
                            selected: false
                        },
                        {
                            name: 'Assigned to nobody',
                            value: 'NOT(assigned_to_id:*)',
                            selected: false
                        },
                        {
                            name: 'Expired 7 days or more ago',
                            value: 'expires:[* TO ' + HLDate.getSubtractedDate(7) + ']',
                            selected: false
                        },
                        {
                            name: 'Expired 30 days or more ago',
                            value: 'expires:[* TO ' + HLDate.getSubtractedDate(30) + ']',
                            selected: false
                        },
                        {
                            name: 'Archived',
                            value: '',
                            selected: false,
                            id: 'archived'
                        }
                    ];

                    // Update filterList for now
                    $scope.filterList = filterList;

                    Case.getCaseTypes().then(function (cases) {
                        for (var key in cases) {
                            if (cases.hasOwnProperty(key)) {
                                filterList.push({
                                    name: 'Case type ' + cases[key],
                                    value: 'casetype_id:' + key,
                                    selected: false
                                });
                            }
                        }

                        // Update filterList once AJAX call is done
                        $scope.filterList = filterList;
                        // Watch doesn't get triggered here, so manually call updateTableSettings
                        updateTableSettings();
                    });
                }
                else {
                    // Cookie is set, so use it as the filterList
                    $scope.filterList = filterListCookie;
                }
            }

            /**
             * updateTableSettings() sets scope variables to the cookie
             */
            function updateTableSettings() {
                Cookie.setCookieValue('searchQuery', $scope.table.searchQuery);
                Cookie.setCookieValue('archived', $scope.table.archived);
                Cookie.setCookieValue('order', $scope.table.order);
                Cookie.setCookieValue('visibility', $scope.table.visibility);
                Cookie.setCookieValue('filterList', $scope.filterList);
            }

            /**
             * updateCases() reloads the cases trough a service
             *
             * Updates table.items and table.totalItems
             */
            function updateCases() {
                Case.query(
                    $scope.table
                ).then(function(data) {
                        $scope.table.items = data.cases;
                        $scope.table.totalItems = data.total;
                    }
                );
            }

            /**
             * Watches the model info from the table that, when changed,
             * needs a new set of cases
             */
            $scope.$watchGroup([
                'table.page',
                'table.order.column',
                'table.order.ascending',
                'table.searchQuery',
                'table.archived',
                'table.filterQuery'
            ], function() {
                updateTableSettings();
                updateCases();
            });

            /**
             * Watches the model info from the table that, when changed,
             * needs to store the info to the cache
             */
            $scope.$watchCollection('table.visibility', function() {
               updateTableSettings();
            });

            /**
             * Watches the filters so when the cookie is loaded,
             * the filterQuery changes and a new set of deals is fetched
             */
            $scope.$watchCollection('filterList', function() {
                $scope.updateFilterQuery();
            });

            /**
             * setSearchQuery() sets the search query of the table
             *
             * @param queryString string: string that will be set as the new search query on the table
             */
            $scope.setSearchQuery = function(queryString) {
                $scope.table.searchQuery = queryString;
            };

            $scope.toggleArchived = function() {
                $scope.table.archived = !$scope.table.archived;
            };

            $scope.updateFilterQuery = function() {
                HLFilters.updateFilterQuery($scope);
            };

            $scope.clearFilters = function() {
                HLFilters.clearFilters($scope);
            };
        }
    ]
);
