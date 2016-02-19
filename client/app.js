var angular = require('angular');
require('angular-route');
require('angular-local-storage');
require('angular-ui-bootstrap');
require('./styles/main');

angular
  .module('voteApp', ['ngRoute', 'ui.bootstrap', 'LocalStorageModule'])
  .config(require('./appRoutes'));

require('./controllers');
require('./directives');
require('./services');
