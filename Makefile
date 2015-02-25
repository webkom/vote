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

TEST_DB = mongodb://localhost:27017/vote-test
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
	@$(BOWER) install

selenium:
	$(WEBDRIVER_MANAGER) update

protractor: selenium all
	NODE_ENV=test MONGO_URL=$(TEST_DB) $(PROTRACTOR) ./features/protractor-conf.js

jscs: $(FRONTEND_FILES) $(BACKEND_FILES) $(CUCUMBER_FILES)
	$(JSCS) .

jshint: $(FRONTEND_FILES) $(BACKEND_FILES) $(CUCUMBER_FILES)
	$(JSHINT) .

mocha:
	NODE_ENV=test MONGO_URL=$(TEST_DB) $(ISTANBUL) cover $(MOCHA) $(TESTS)
	$(ISTANBUL) report cobertura

test: jshint jscs mocha protractor

public/main.css: $(STYL)
ifeq ($(findstring $(CORRECT),$(HOSTNAME)),$(CORRECT))
	$(STYLUS) --compress --include node_modules/nib/lib public/styles/main.styl -o public
else
	$(STYLUS) --sourcemap --include node_modules/nib/lib public/styles/main.styl -o public
endif

public/js/vote.min.js: $(FRONTEND_FILES)
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

server:
	@supervisor index

production: node_modules public/js/vote.min.js public/main.css
ifeq ($(findstring $(CORRECT),$(HOSTNAME)),$(CORRECT))
	git fetch && git reset --hard origin/master
	make install
	forever restart $(PWD)/index.js
else
	@echo "Not in a production environment!"
endif

clean:
	rm -f public/main.css

.PHONY: server install test jshint selenium protractor selenium jscs production all clean
