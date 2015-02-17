BIN = node_modules/.bin
MOCHA = $(BIN)/_mocha
ISTANBUL = $(BIN)/istanbul
JSHINT = $(BIN)/jshint
JSCS = $(BIN)/jscs
STYLUS = $(BIN)/stylus
UGLIFY = $(BIN)/uglifyjs
WEBDRIVER_MANAGER = $(BIN)/webdriver-manager
PROTRACTOR = $(BIN)/protractor
BOWER = $(BIN)/bower

HOSTNAME = $(shell hostname -f)
CORRECT = abakus.no

MONGO_URL = mongodb://localhost:27017/ads-test
TESTS = $(shell find test -name "*.test.js")
STYL = $(shell find public/styles -name "*.styl")
FRONTEND_FILES = $(shell find public -name "*.js" -not -name "*.min.js")
BACKEND_FILES = $(shell find app -name "*.js")
CUCUMBER_FILES = $(shell find features -name "*.js" -or -name "*.feature")

all: node_modules public/main.css

install: node_modules public/lib

node_modules: package.json
	@npm install

public/lib: bower.json
	$(BOWER) install

jshint: $(FRONTEND_FILES) $(BACKEND_FILES) $(CUCUMBER_FILES)
	$(JSHINT) .

selenium:
	$(WEBDRIVER_MANAGER) update

protractor: $(FRONTEND_FILES) $(BACKEND_FILES) $(CUCUMBER_FILES) selenium
	NODE_ENV=test MONGO_URL=$(MONGO_URL) $(PROTRACTOR) ./features/protractor-conf.js

jscs: $(FRONTEND_FILES) $(BACKEND_FILES) $(CUCUMBER_FILES)
	$(JSCS) app public/js chrome_app test features

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
		public/js/services/*.js \
		public/js/controllers/*.js \
		public/js/directives/*.js \
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

.PHONY: server install test jshint selenium protractor selenium jscs production all clean
