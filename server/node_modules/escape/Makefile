NAME = escape
TESTS = test/unit/*.test.js
TESTTIMEOUT = 6000
REPORTER = dot
JSCOVERAGE = ./node_modules/visionmedia-jscoverage/jscoverage

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TESTS)

test-cov: lib-cov
	@ESCAPE_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov: clean
	@jscoverage lib $@

clean:
	@rm -rf *-cov
	@rm -f coverage.html

.PHONY: test test-cov lib-cov clean