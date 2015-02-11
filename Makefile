BIN = node_modules/.bin
MOCHA = $(BIN)/_mocha
ISTANBUL = $(BIN)/istanbul
JSHINT = $(BIN)/jshint
JSCS = $(BIN)/jscs
STYLUS = $(BIN)/stylus

HOSTNAME = $(shell hostname -f)
CORRECT = abakus.no

MONGO_URL = mongodb://localhost:27017/ads-test
TESTS = $(shell find test -name "*.test.js")
STYL = $(shell find public/styles -name "*.styl")

all: node_modules public/main.css

install: node_modules

node_modules: package.json
	@npm install

jshint:
	$(JSHINT) .

jscs:
	$(JSCS) app public/js test

public/main.css: $(STYL)
ifeq ($(findstring $(CORRECT),$(HOSTNAME)),$(CORRECT))
	$(STYLUS) --compress --include node_modules/nib/lib public/styles/main.styl -o public
else
	$(STYLUS) --sourcemap --include node_modules/nib/lib public/styles/main.styl -o public
endif

test: node_modules jshint jscs public/styles/main.css
	NODE_ENV=test MONGO_URL=$(MONGO_URL) $(ISTANBUL) cover $(MOCHA) $(TESTS)
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

clean:
	rm -f public/main.css

.PHONY: server install test jshint jscs production all clean
