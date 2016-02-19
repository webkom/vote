BIN = node_modules/.bin
MOCHA = $(BIN)/_mocha
ISTANBUL = $(BIN)/istanbul
ESLINT = $(BIN)/eslint
STYLUS = $(BIN)/stylus
UGLIFY = $(BIN)/uglifyjs
WEBDRIVER_MANAGER = $(BIN)/webdriver-manager
PROTRACTOR = $(BIN)/protractor
BOWER = $(BIN)/bower

HOSTNAME = $(shell hostname -f)
CORRECT = abakus.no

TEST_DB = mongodb://localhost:27017/vote-test
TESTS = $(shell find test -name "*.test.js")
STYL = $(shell find client/styles -name "*.styl")
FRONTEND_FILES = $(shell find client -name "*.js")
BACKEND_FILES = $(shell find app -name "*.js")
CUCUMBER_FILES = $(shell find features -name "*.js" -or -name "*.feature")

all: node_modules public/main.css

install: node_modules public/lib

node_modules: package.json
	@npm install

webdriver:
	$(WEBDRIVER_MANAGER) update --standalone false

public/lib: bower.json
	@$(BOWER) install --allow-root

protractor: webdriver all
	NODE_ENV=test MONGO_URL=$(TEST_DB) $(PROTRACTOR) ./features/protractor-conf.js

lint: $(FRONTEND_FILES) $(BACKEND_FILES) $(CUCUMBER_FILES)
	$(ESLINT) --ignore-path .gitignore .

mocha:
	NODE_ENV=test MONGO_URL=$(TEST_DB) $(ISTANBUL) cover $(MOCHA) $(TESTS)
	$(ISTANBUL) report cobertura

test: lint mocha protractor

server:
	@supervisor index

clean:
	rm -f public/main.css

.PHONY: server install test lint selenium protractor selenium all clean
