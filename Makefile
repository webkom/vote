BIN = node_modules/.bin
MOCHA = $(BIN)/_mocha
ISTANBUL = $(BIN)/istanbul
JSHINT = $(BIN)/jshint
STYLUS = $(BIN)/stylus

HOSTNAME = $(shell hostname -f)
CORRECT = abakus.no

MONGO_URL = mongodb://localhost:27017/ads-test
TESTS = $(shell find test -name "*.test.js")
STYL = $(shell find public/styles -name "*.styl")

install: node_modules

node_modules: package.json
	@npm install

jshint:
	$(JSHINT) .

public/styles/main.css: node_modules $(STYL)
ifeq ($(findstring $(CORRECT),$(HOSTNAME)),$(CORRECT))
	$(STYLUS) --compress --include node_modules/nib/lib < public/styles/main.styl > public/styles/main.css
else
	$(STYLUS) --sourcemap --include node_modules/nib/lib < public/styles/main.styl > public/styles/main.css
endif


test: node_modules jshint public/styles/main.css
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

