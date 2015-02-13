BIN = node_modules/.bin
MOCHA = $(BIN)/_mocha
ISTANBUL = $(BIN)/istanbul
JSHINT = $(BIN)/jshint
JSCS = $(BIN)/jscs
STYLUS = $(BIN)/stylus
UGLIFY = $(BIN)/uglifyjs

HOSTNAME = $(shell hostname -f)
CORRECT = abakus.no

MONGO_URL = mongodb://localhost:27017/ads-test
TESTS = $(shell find test -name "*.test.js")
STYL = $(shell find public/styles -name "*.styl")
FRONTEND_FILES = $(shell find public -name "*.js")
BACKEND_FILES = $(shell find app -name "*.js")

all: node_modules public/main.css

install: node_modules

node_modules: package.json
	@npm install

jshint: $(FRONTEND_FILES) $(BACKEND_FILES)
	$(JSHINT) .

jscs: $(FRONTEND_FILES) $(BACKEND_FILES)
	$(JSCS) app public/js test

public/main.css: $(STYL)
ifeq ($(findstring $(CORRECT),$(HOSTNAME)),$(CORRECT))
	$(STYLUS) --compress --include node_modules/nib/lib public/styles/main.styl -o public
else
	$(STYLUS) --sourcemap --include node_modules/nib/lib public/styles/main.styl -o public
endif

public/js/ads.min.js: $(FRONTEND_FILES)
	$(UGLIFY) \
		public/libs/angular/angular.min.js \
		public/libs/angular-route/angular-route.min.js \
		public/libs/angular-bootstrap/ui-bootstrap-tpls.min.js \
		public/libs/angular-local-storage/dist/angular-local-storage.min.js \
		public/js/app.js \
		public/js/services/apiService.js \
		public/js/services/alertService.js \
		public/js/services/voteService.js \
		public/js/controllers/mainCtrl.js \
		public/js/controllers/electionCtrl.js \
		public/js/controllers/electionsCtrl.js \
		public/js/controllers/loginCtrl.js \
		public/js/controllers/createUserCtrl.js \
		public/js/controllers/createElectionCtrl.js \
		public/js/controllers/editElectionCtrl.js \
		public/js/directives/passwordDirective.js \
		public/js/directives/confirmVoteDirective.js \
		public/js/appRoutes.js \
	-o $@


public/js/ads.admin.min.js: $(FRONTEND_FILES)
	$(UGLIFY) \
	 	public/libs/angular/angular.min.js \
		public/libs/angular-route/angular-route.min.js \
		public/libs/angular-bootstrap/ui-bootstrap-tpls.min.js \
		public/libs/angular-local-storage/dist/angular-local-storage.min.js \
		public/js/app.js \
		public/js/services/apiService.js \
		public/js/services/alertService.js \
		public/js/controllers/mainCtrl.js \
		public/js/controllers/electionCtrl.js \
		public/js/controllers/electionsCtrl.js \
		public/js/controllers/loginCtrl.js \
		public/js/controllers/createUserCtrl.js \
		public/js/controllers/createElectionCtrl.js \
		public/js/controllers/editElectionCtrl.js \
		public/js/controllers/activateUserController.js \
		public/js/directives/passwordDirective.js \
		public/js/appRoutes.js \
	-o $@

test: all jshint jscs
	NODE_ENV=test MONGO_URL=$(MONGO_URL) $(ISTANBUL) cover $(MOCHA) $(TESTS)
	$(ISTANBUL) report cobertura

server:
	@supervisor index

production: node_modules public/js/ads.min.js public/js/ads.admin.min.js public/main.css
ifeq ($(findstring $(CORRECT),$(HOSTNAME)),$(CORRECT))
	git fetch && git reset --hard origin/master
	npm install
	forever restart $(PWD)/index.js
else
	@echo "Not in a production environment!"
endif

clean:
	rm -f public/main.css

.PHONY: server install test jshint jscs production all clean
