BIN = node_modules/.bin
MOCHA = $(BIN)/_mocha
ISTANBUL = $(BIN)/istanbul
JSHINT = $(BIN)/jshint

HOSTNAME = $(shell hostname -f)
CORRECT = abakus.no

MONGO_URL = mongodb://localhost:27017/ads-test
TESTS = $(shell find test -name "*.test.js")

install: node_modules

node_modules: package.json
	@npm install

jshint:
	$(JSHINT) .

test: node_modules jshint
	MONGO_URL=$(MONGO_URL) $(ISTANBUL) cover $(MOCHA) $(TESTS)
	$(ISTANBUL) report cobertura

server:
	@supervisor index

production:
ifeq ($(findstring $(CORRECT),$(HOSTNAME)),$(CORRECT))
	git fetch && git reset --hard origin/master
	npm install
	forever restart $(PWD)/index.js
else
	@echo "Not in a production environment!"
endif

.PHONY: server install test jshint production
