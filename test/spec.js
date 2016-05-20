/*global describe, beforeEach, inject, it, expect, angular, document */
'use strict';
describe('cgBusy', function() {

	var scope,
      compile,
      q,
      httpBackend,
      timeout,
      cgBusyProfiles;

	var testProfile1 = {
		delay: 200,
		minDuration: 100
	},

	testProfile2 = {
		message: 'foo',
		delay: 100
	};

	beforeEach(module('app', function(cgBusyProfilesProvider) {
		cgBusyProfilesProvider.addProfile('testProfile1', testProfile1);
		cgBusyProfilesProvider.addProfile('testProfile2', testProfile2);
	}));

	beforeEach(inject(function(
        $rootScope,
        $compile,
        $q,
        $httpBackend,
        $templateCache,
        $timeout,
        _cgBusyProfiles_) {

		scope = $rootScope.$new();
		compile = $compile;
		q = $q;
		httpBackend = $httpBackend;
		timeout = $timeout;
		cgBusyProfiles = _cgBusyProfiles_;
		// httpBackend.when('GET', '/test-custom-template.html').respond(function(method, url, data, headers){

			// return [[200],'<div id="custom">test-custom-template-contents</div>'];
		// });
    httpBackend.whenGET('../test-custom-template.html').respond(function(method, url, data, headers){
			return [[200],'<div id="custom">test-custom-template-contents</div>'];
		});

    httpBackend.whenGET('../custom-cgbusy-template.html').respond(function(method, url, data, headers){
			return [[200],'<div id="custom">custom cg busy contents</div>'];
		});

    httpBackend.whenGET('angular-busy.html').respond(function(method, url, data, headers){
			return [[200],'<div id="custom">angular busy contents</div>'];
		});

	}));

	it('should show the overlay during promise', function() {
		this.element = compile('<div cg-busy="my_promise"></div>')(scope);
		angular.element(document.body).append(this.element);

    this.testPromise = q.defer();
		scope.my_promise = this.testPromise.promise;

		//httpBackend.flush();

		scope.$apply();

		expect(this.element.children().length).toBe(2); //ensure the elements are added

		expect(this.element.children().css('display')).toBe('block');//ensure its visible (promise is ongoing)

		this.testPromise.resolve();
		scope.$apply();

		expect(this.element.children().css('display')).toBe('none'); //ensure its now invisible as the promise is resolved
	});

	it('should show the overlay during multiple promises', function() {
		this.element = compile('<div cg-busy="[my_promise,my_promise2]"></div>')(scope);
		angular.element('body').append(this.element);

		this.testPromise = q.defer();
		scope.my_promise = this.testPromise.promise;

		this.testPromise2 = q.defer();
		scope.my_promise2 = this.testPromise2.promise;

		//httpBackend.flush();

		scope.$apply();

		expect(this.element.children().length).toBe(2); //ensure the elements are added

		expect(this.element.children().css('display')).toBe('block');//ensure its visible (promise is ongoing)

		this.testPromise.resolve();
		scope.$apply();

		expect(this.element.children().css('display')).toBe('block'); //ensure its still visible (promise is ongoing)

		this.testPromise2.resolve();
		scope.$apply();
		expect(this.element.children().css('display')).toBe('none'); //ensure its now invisible as the promise is resolved
	});

	it('should load custom templates', function(){
		this.element = compile('<div cg-busy="{promise:my_promise,templateUrl:\'../test-custom-template.html\'}"></div>')(scope);
		angular.element('<body>').append(this.element);

		httpBackend.flush();

		scope.$apply();

		expect(angular.element('#custom').html()).toBe('test-custom-template-contents');
	});

	it('should delay when delay provided.', function() {
		this.element = compile('<div cg-busy="{promise:my_promise,delay:300}"></div>')(scope);
		angular.element('body').append(this.element);

		this.testPromise = q.defer();
		scope.my_promise = this.testPromise.promise;

		scope.$apply();

		expect(this.element.children().length).toBe(2); //ensure the elements are added

		expect(this.element.children().css('display')).toBe('none');

		timeout.flush(200);
		expect(this.element.children().css('display')).toBe('none');

		timeout.flush(301);
		expect(this.element.children().css('display')).toBe('block');
		this.testPromise.resolve();
		scope.$apply();
		expect(this.element.children().css('display')).toBe('none');
	});

	it('should use minDuration correctly.', function() {
		this.element = compile('<div cg-busy="{promise:my_promise,minDuration:1000}"></div>')(scope);
		angular.element('body').append(this.element);

		this.testPromise = q.defer();
		scope.my_promise = this.testPromise.promise;

		scope.$apply();

		expect(this.element.children().length).toBe(2); //ensure the elements are added

		expect(this.element.children().css('display')).toBe('block');

		timeout.flush(200);
		expect(this.element.children().css('display')).toBe('block');

		this.testPromise.resolve();
		timeout.flush(400);
		expect(this.element.children().css('display')).toBe('block');

		timeout.flush(300); //900ms total
		expect(this.element.children().css('display')).toBe('block');

		timeout.flush(101); //1001ms total
		expect(this.element.children().css('display')).toBe('none');
	});

	it('cgBusyProfiles addProfile/get/keys should work correctly.', function() {
		expect(cgBusyProfiles.get('testProfile1')).toEqual(testProfile1);
		expect(cgBusyProfiles.get('testProfile2')).toEqual(testProfile2);

		var keys = cgBusyProfiles.keys();
		expect(keys.length).toBe(2);
		expect(keys).toContain('testProfile1');
		expect(keys).toContain('testProfile2');
	});

	it('should use cgBusyProfiles correctly.', function() {
		this.element = compile('<div cg-busy="{promise:my_promise,delay:100,profile:\'testProfile2\'}"></div>')(scope);
		angular.element('body').append(this.element);

		this.testPromise = q.defer();
		scope.my_promise = this.testPromise.promise;

		scope.$apply();

		expect(this.element.children().length).toBe(2); //ensure the elements are added

		expect(this.element.children().css('display')).toBe('none');
		expect(this.element.find('.cg-busy-default-text').text()).toBe('foo');

		timeout.flush(100);
		expect(this.element.children().css('display')).toBe('block');

		this.testPromise.resolve();
		timeout.flush(400);
		expect(this.element.children().css('display')).toBe('none');
	});

});
