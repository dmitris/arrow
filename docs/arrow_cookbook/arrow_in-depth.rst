==============
Arrow In-Depth
==============

Arrow provides you with a variety of tools to help you organize, execute and configure your tests

Test Suite Organization
-----------------------

Test Descriptor files allow you to organize your tests into test suites, while also allowing you to control when and which tests execute at a given phase of your development cycle.

Consider the following scenario:
You have just finished creating a suite of tests that validate the application we discussed in the `Arrow Tutorial <./arrow_tutorial.rst>`_ chapter.

At this point you have the following test files:

* Fuctional Tests
* Integration Tests

For this sample, we'll pretend unit tests are being addressed elsewhere.

If you recall, to execute the two test files above against our mock and HTTP End-Ponit, we'd type something like this:

::

  arrow test-func.js  --page=testMock.html --lib=test-lib.js
  arrow test-func.js  --page=http://www.doctor46.com/tabview.html --lib=test-lib.js
  arrow test-int.js  --page=http://www.doctor46.com/tabview.html --lib=test-lib.js

Let's pretend we wanted to easily decide which test files executed and which didn't. Test Descriptors_ allow you to do this easily and in one location

.. _Descriptors:

Test Descriptors
================

Test descriptors provide a way to describe, organize and factorize your tests. During test development, you'll probably execute each test from the Arrow command line. However, once you have created tests to validate your module, you need a way to organize and factorize the tests.

.. TODO... needs to be updated


::

    [
        {
            "settings": [ "master" ],

            "name" : "tabview",

            "commonlib" : "./test-lib.js",

            "config" :{
                "baseUrl" : "http://www.doctor46.com"
            },

            "dataprovider" : {

                "dom" : {
                    "params" : {
                        "test" : "test-func.js",
                        "page" : "testMock.html"
                    },
                    "group" : "unit"
                },

               "dom_int" : {
                    "params" : {
                        "test" : "test-func.js",
                        "page" : "$$config.baseUrl$$/tabview.html"
                      },
                    "group" : "smoke"
                },

                "int" : {
                    "params" : {
                        "test" : "test-int.js",
                        "page" : "$$config.baseUrl$$/tabview.html"
                    },
                    "group" : "smoke"
                }

            }

        },

        {
            "settings": [ "environment:development" ]
        }

    ]


**Suite Settings**

These settings are accessible by all tests in the suite

::

 "name" : "tabview",
 "commonlib" : "./test-lib.js",

name and commonlib

* `name:` Allows you to give your descriptor a name. In Arrow you can run multiple test descriptors in a single execution. Giving it a name allows you to separate the results
* `commonlib:` Behaves like a suite-level `--lib` parameter. Rather than calling each necessary dependency or lib in the tests, you can do that here. `commonlib` is not limited to only one dependency. If you have more than one dependency, you can specify them with commas.

**Suite Configuration**

The settings here, allow you to override default config settings and apply to the entire suite

::

 "config" :{
 "defaultAppHost" : "http://www.doctor46.com"
 },

In this example we have a key called `defaultAppHost`. The value assigned to this key can be picked up using the `$$` annotation, for example  `$$config.defaultAppHost$$`.

This is one way we can parametrize our tests and make them easier to execute/share.

**Individual Test Settings**

This section uses the `Suite Settings` and the `Suite Configuration` to create instances of your tests.

::

    "dom_int" : {
    "params" : {
       "test" : "test-func.js",
          "page" :"testMock.html"
        },
     "group" : "unit"
    },

* The first object is the name of the test. In this case, the test name is `dom_int`.
* The next object, `params`, includes the necessary parameters for the test.
* `test`: Tells Arrow which file to execute
* `page`: Tells Arrow against which page to execute. The `page` value can be a local mock page served by arrow_server, or an HTTP End-Point
* `group`: Allows you to *group* your tests for execution. Each test `file` contains a set of tests or assertions. At the time of creation, tests do not have a context (at least not implied). A `group` gives those test `files` context, enabling you to execute only a given set of tests during a given execution.

Executing using a Test Descriptor
=================================

To Execute *All* tests in a given test descriptor file simply type (remember in this example, the name of our file is `test-descriptor.json`):

::

  arrow test-descriptor.json

However, if you wanted to *only* execute tests `grouped` as `func`, you would type:

::

 arrow test-descriptor.json --group=func

Similarly, you can choose to *only* execute a given test, based on its name. You can do that by typing:

::

 arrow test-descriptor.json --testName=dom


Test Descriptor Best Practices
==============================

One Test Descriptor Per Module
..............................

One test descriptor per module is recommended. You do not need a *parent* test descriptor file to include multiple modules. There are different tools which do this for you. Given a root directory, Arrow traverses the child directories and picks up the required test descriptor files.

For example, suppose you have the following directory structure, and within each module/test folder you have tests and a test descriptor file.

::

  project1
     |____ module1
     |        |_____src
     |        |_____test
     |            |_____test-descriptor1.json
     |
     |____ module2
     |        |_____src
     |        |_____test
     |            |_____test-descriptor2.json
     |
     |____ module3
     |        |_____src
     |        |_____test
     |            |_____test-descriptor3.json
     |
     |____ module4
              |_____src
              |_____test
                  |_____test-descriptor4.json

To execute *All* test descriptor files *within* each module, simply navigate to the project root (in this case `project1`) and type:

::

  arrow "**/*-descriptor.json"

Arrow will traverse through all sub-folders, pick up the test descriptors which match ``"**/*-descriptor.json"`` glob, and execute them sequentially.

Parametrize Test Descriptors
............................

There are tests which require parametrization. Specially in *Integration* tests (int), it is important to have a way to parametrize the host name of your AUT.

Test descriptors allow you to parametrize like this:

::

 "dom_int" : {
    "params" : {
       "test" : "test-func.js",
          "page" :"$$config.defaultAppHost$$/tabview.html"
        },
     "group" : "smoke"
 },

 "int" : {
      "params" : {
          "test" : "test-int.js",
          "page" : "$$config.defaultAppHost$$/tabview.html"
      },
      "group" : "smoke"
 }

Where `"defaultAppHost" : "http://doctor46.com"`


Test Descriptor Parametrization and Test Environments
-----------------------------------------------------

So far our parametrization examples have only applied to our curent file. If we want to run our tests across different environments (with different hostnames), we'd have to create multiple test-descriptor.json files to do this. However, we can use a `dimension` file to give our paramters additional `dimension` or context.

At the bottom of our test descriptor file there was this line:

::

    {
     "settings": [ "environment:development" ]
    }

We can make use of the line above, and a `dimension` file to dynamically change configuration values given a context.

With this `dimension` file we can set different contexts in our test descriptor:

::

    [
        {
            "dimensions": [
                {
                    "environment":
                    {
                        "development": {
                            "test": null
                        },
                        "integration": {
                            "test": null
                        },
                        "stage": {
                            "test": null
                        },
                        "production": {
                            "test": null
                        }
                    }
                }
            ]
        }
    ]

Now we can update our test decriptor like this

::

    {
        "settings": [ "environment:development" ],

        "config" :{
            "defaultAppHost" : "http://development.com"
        }
    },

    {
        "settings": [ "environment:integration" ],

        "config" :{
            "defaultAppHost" : "http://integration.com"
        }
    },

    {
        "settings": [ "environment:stage" ],

        "config" :{
            "defaultAppHost" : "http://stage.com"
        }
    },

    {
        "settings": [ "environment:production" ],

        "config" :{
            "defaultAppHost" : "http://production.com"
        }
    }

During execution, we can set the context like this:

::

     arrow test-descriptor.json --context=environment:development --dimensions=./dimensions.json

Or

::

     arrow test-descriptor.json --context=environment:stage --dimensions=./dimensions.json

In each case, Arrow will take the `context` and `dimensions` file and use those to map the correct `config` value for the current execution



Configuration
-------------
There are various ways to configure arrow. Normally, Arrow's configuration file will be installed here

.. todo need to update the location for NON-Yahoo Linux.

Configuration Location
======================

+-------+--------------------------------------------------------------------------------+
|MAC    | /usr/local/lib/node_modules/arrow/config/config.js                             |
+-------+--------------------------------------------------------------------------------+
|Linux  | TODO... needs to be updated                                                    |
+-------+--------------------------------------------------------------------------------+
|WIN    | `%USERPROFILE%\\AppData\\Roaming\\npm\\node_modules\\arrow\\config\\config.js` |
+-------+--------------------------------------------------------------------------------+

The standard arrow config file looks like this

::

    var config = {};

    // User default config
    config.seleniumHost = "";
    //example: config.seleniumHost = "http://gridhost:port/wd/hub";
    config.context = "";
    config.defaultAppHost = "";
    config.logLevel = "INFO";
    config.browser = "firefox";
    config.parallel = false;
    config.baseUrl = "";
    // Framework config
    config.arrowModuleRoot = global.appRoot + "/";
    config.dimensions = config.arrowModuleRoot + "config/dimensions.json";
    config.defaultTestHost = config.arrowModuleRoot + "lib/client/testHost.html";
    config.defaultAppSeed = "http://yui.yahooapis.com/3.6.0/build/yui/yui-min.js";
    config.testSeed = config.arrowModuleRoot + "lib/client/yuitest-seed.js";
    config.testRunner = config.arrowModuleRoot + "lib/client/yuitest-runner.js";
    config.autolib = config.arrowModuleRoot + "lib/common";
    config.descriptorName = "test_descriptor.json";

    module.exports = config;

As you can see there are two types of configuration sections:

* User Config: These are configuration parameters which directly affect how your test or test suite will execute
* Framework Config: These are configuration parameters which indirectly affect how your test or test suite will execute

Overriding Configuration Values
===============================

Obviously, you can update the config file to *override* its settings. However, you can also *override* individual config parameters on a per-execution basis. Every config parameter can be *overridden* during execution like this:

::

  arrow <some test or test descriptor> --config=value

Or

::

  arrow <some test or test descriptor> --seleniumHost=http://some.url.com:1234/wd/hub

Or

::

  arrow <some test or test descriptor> --logLevel=debug --baseUrl=http://basesurl.com --browser=chrome

You can basically override any config parameter in the command line.

You can also **completely** override all configuration values by placing a config.js file at the root of your execution. Arrow always looks at the current directory for config.js file. If it finds one, it will use **that** file over the default configuration.


Complex Test Scenarios
----------------------

There are situations where the default arrow controller will not allow you to create the type of test scenario you require. If you recall, the default arrow controller assumes the page you load is the page under test. To solve this you can use a different arrow controller called *locator*. The *locator* controller allows you to navigate to the page under test by allowing you to perform actions such as clicking and typing.

.. The controller samples can be found `here. - TODO... need the link to the controller samples (@dmitris)

.. TODO... needs to be updated


The Locator Controller
======================

To use the *locator* controller you need to use a test descriptor with an additional node, **scenario**.

Suppose you wanted to test finance.yahoo.com's ticker quotes engine. To do that, you would build a scenario like this:

1. Open http://finance.yahoo.com
2. Use the *locator* controller and look for the *ticker* input textbox and enter *yhoo*
3. Use the *locator* controller and *click* on the submit button
4. Wait for the page to load **and** now test for quotes

Based on the scenario above, our test descriptor file would look like this:

::

  "dataprovider" : {

      "Test YHOO Ticker" : {
          "group" : "func",
          "params" :{
              "scenario": [
                  {
                      "page": "$$config.baseUrl$$"
                  },
                  {
                      "controller": "locator",
                      "params": {
                          "value": "#txtQuotes",
                          "text": "yhoo"
                      }
                  },
                  {
                      "controller": "locator",
                      "params": {
                          "value": "#btnQuotes",
                          "click": true
                      }
                  },
                  {
                       "test": "test-quote.js",
                       "quote": "Yahoo! Inc. (YHOO)"
                  }
              ]
          }
      }
  }

Our first step is to open the page (Arrow will use the *default* controller when none is specified). Secondly we look for an input field with a locator value of *#txtQuotes* and we enter *yhoo*. Then we use the *locator* controller to *click* on *#btnQuotes*. Finally we inject our test JS file and using *this.params,* we pass the value in *quote* to the test file.

Our test continues being a simple YUI test which takes input from the test descriptor in order to do its validation

::

 YUI({ useBrowserConsole: true }).use("node", "test", function(Y) {
     var suite = new Y.Test.Suite("Quote Page test of the test");
     suite.add(new Y.Test.Case({
         "test quote": function() {

             //In order to paramertize this, instead of having a static quote, we call it from the config
             var quote = this.testParams["quote"];
             Y.Assert.areEqual(quote, Y.one(".yfi_rt_quote_summary").one("h2").get('text'));
         }
     }));

     Y.Test.Runner.add(suite);
 });

To execute we simply type the following:

::

 arrow test-descriptor.json --driver=selenium

As you can see, the *locator* controller is quite powerful. It can take the following *params*

* **value**: locator value
* **click**: true or false
* **text**: value ot enter
* **using**: by default, Arrow will assume you want to use *css* locators for *value*. However you can use any **By** strategy supported by WebDriver: className, id, linkText, name, text, xpath, etc.

For example, you could have the following in your test descriptor

::

  {
      "controller": "locator",
      "params": {
          "using": "xpath",
          "value": "//*[@id="btnQuotes"]",
          "click": true
      }
  }


Re-Using Browser Sessions
-------------------------

As you develop your tests, you may find it necessary to *test* them against a real browser, such as those supported by Selenium. However, one of the disadvantages of this approach is that normally, for each test file, a new browser sesssion is started and stopped. This is time consuming and counter-productive during development.

Arrow supports the concept of **Session Reuse**.

Using Session-Reuse
===================

Webdriver has a concept of sessions. Once a Selenium/WebDriver server instance is running, you can tell Selenium to *reuse* a given session. This is a very powerful and helpful idea because:

* It expedites execution since a new browser window does not need to be instantiated. This greatly cuts down on execution time and puts *real* browser test execution time in-par with PhantomJS
* As a developer, you can tell Selenium to *use* your preferred *profile* for the session. This means that if you have special plugins (such firebug, or developer tools, etc) installed, you can make use of them during test execution.

However, one should keep in mind that this approach means your test will have a sterile environment as session and cookie information will be **reused**

To use *Session-Reuse* do the following:

1. From within the machine running Selenium server go to: http://localhost:4444/wd/hub/static/resource/hub.html
2. Click on *create session* and choose the browser you want
3. A new Browser will start (that is your session) and set itself to a blank page
4. To tell Arrow to **Reuse** that session type:

::

  arrow <some test or test descriptor> --reuseSession=true

Arrow will contact the Selenium Server in the config and will ask it if there are any *reusable* sessions. If so, it will direct all tests to them.

Note Arrow will direct all tests to **ALL OPEN** sessions. If you want to further expedite your test execution time, you can start sessions for different browser and Arrow will execute your tests in parallel against all of them.

Using Session-Reuse With Specific Profiles
==========================================

If you want to *reuse* your default profile, or a specific profile you use for developing simply type this when you start Selenium server

::

 java -Dwebdriver.firefox.profile=default -jar ./path/to/selenium/sever.jar

Or

::

 java -Dwebdriver.firefox.profile=profile_name -jar ./path/to/selenium/sever.jar

Once Selenium is started, the same steps for *reusing* sessions apply.

Parallelism
-----------

Arrow supports Parallel execution of tests. By default **parallel** is set to *false*. You can update the value to the *maximum number* of threads you want to use. Keep in mind Arrow will try to create one Browser Session **PER** parallel count. It is important that you have enough system resources to support this

How To Use
==========

::

  arrow <some test or test descriptor> --parallel=N

Or

::

  arrow <some test or test descriptor> --parallel=5


Reporting
---------

Arrow supports two reporting formats, the ever-popular JUnit.xml format and Arrow's own JSON format. Reporting is particularly important if you use test descriptors to execute your tests, because each test.js file will have its own set of results. However, using Arrow's reporting feature will merge the individual results into one report.

How To Use
==========

To tell Arrow you would like to create reports simply type:

::

  arrow <some test or test descriptor> --report=true

After the test executes two files will be created under the location from which you executed Arrow; *report.xml* and *report.json*.

Running multiple descriptors using ``'arrow "**/*-descriptor.json" --report=true'`` , will create report.xml and report.json under directory structure where each descriptor files reside.

Hudson supports report globbing, so you can pass ``**/test-descriptor-report.xml``, and it will pick up all your result files.

report.xml sample
.................

::

   <testsuite failures='0' time='26.14' errors='0' skipped='0' tests='1' name='controllers'>
       <properties>
           <property name='descriptor' value='test-descriptor.json'/>
       </properties>
       <testcase time='10' classname='Test YHOO Ticker.testCaseyui_3_2_0_18_133850857473827' name='test quote'/>
   </testsuite>



report.json sample
..................

::

  [
      {
          "passed":1,
          "failed":0,
          "total":1,
          "ignored":0,
          "duration":15,
          "type":"report",
          "name":"Quote Page test of the test",
          "testCaseyui_3_2_0_18_133850857473827":{
              "passed":1,
              "failed":0,
              "total":1,
              "ignored":0,
              "duration":10,
              "type":"testcase",
              "name":"testCaseyui_3_2_0_18_133850857473827",
              "test quote":{
                  "result":"pass",
                  "message":"Test passed",
                  "type":"test",
                  "name":"test quote",
                  "duration":1
              }
          },
          "timestamp":"Thu May 31 16:56:33 2012",
          "ua":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:12.0) Gecko/20100101 Firefox/12.0",
          "testName":"Test YHOO Ticker"
      }
  ]