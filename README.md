# Selenium-Page

Selenium-Page is an superset of [Selenium-Webdriver](https://github.com/SeleniumHQ/selenium).

The main feature are Intellisense and the easy access to WebElements, Switch Frames, wait elements not been visible, error handlers and screenshot on errors. 

I'm working on it on my free time. Feel free to suggest improvements.

## Installation

Selenium-Page may be installed via npm with

```sh
npm i selenium-page
```
Also, download the driver for browser that you want to work with, as per [@selenium-webdriver#installation]( https://github.com/SeleniumHQ/selenium/blob/trunk/javascript/node/selenium-webdriver/README.md#installation )

>You will need to download additional components to work with each of the major
browsers. The drivers for Chrome, Firefox, and Microsoft's IE and Edge web
browsers are all standalone executables that should be placed on your system
[PATH]. Apple's safaridriver is shipped with Safari 10 for OS X El Capitan and
macOS Sierra. You will need to enable Remote Automation in the Develop menu of
Safari 10 before testing.

>
>| Browser           | Component                          |
>| ----------------- | ---------------------------------- |
>| Chrome            | [chromedriver(.exe)][chrome]       |
>| Internet Explorer | [IEDriverServer.exe][release]      |
>| Edge              | [MicrosoftWebDriver.msi][edge]     |
>| Firefox           | [geckodriver(.exe)][geckodriver]   |
>| Opera             | [operadriver(.exe)][operadriver]   |
>| Safari            | [safaridriver]                     |
>


## Usage

A Demo of Selenium-Page using Mocha can be found in the `demo` directory. 

Bellow are same features samples.

```javascript
const { Page, Key, PageDefs } = require("selenium-page")

(async function example() {
  
  const objPage = new Page()
  await objPage.open("https://www.google.com")
  await (await objPage.driver).getTitle()
  await (await objPage.findBy.name("q")).sendKeys(searchingText, Key.RETURN)
  const searchResults = await objPage.findAllBy.css("#search .g")
  await objPage.close()

})()
```

## Features

### Class Page

When instantiate the a Page object you may send as parameter a PageDefinition object. It tell the driver how to work in general, such as browser, browser arguments (parameters), resolution and default Page.findBy behave.

```javascript
const { Page, Key, PageDefs } = require("selenium-page")

const objPage = new Page()

//the same as 

const objPage = new Page({
  browser: PageDefs.browsers.chrome,
  browserArgs: [],
  browserCapability: [
    {
      prop: "setPageLoadStrategy", 
      value: "normal"
    }
  ],
  findConfig: {
    dataTestAttr: "data-test",
    screenshot: true
  },
  resolution: PageDefs.resolutions.maximize
})

```

### Page Properties

**`Page.findBy`** encapsulate the object Selenium-Webdriver By, you can access all the By options. It will return a `Promise<WebElement>`. Eg. of `<div id='12345'>ACME Content</div>`

```javascript
const el = await objPage.findBy.id("12345")
//or
const el = await objPage.findBy.css("#12345")
```

If the element is not found, it will raise an exception. The error will display what's the By selector not found. eg `By: By(css selector, #12345)`. Also an screenshot can be taken at the moment of the error. The screenshot is set to True by default on Page constructor, as mentioned above.

You can also add some parameters on the findBy, such as error message or delays to find the element.

```javascript
const el = await objPage.findBy.id("12345", "Div 12344 was not found")
//or
const el = await objPage.findBy.css("#12345", {
  message: "Div 12344 was not found",
  timeoutMs: 2000,
  waitBeVisible: true,
  waitBeEnabled: true,
  waitBeEnabledMs: 2000,
  screenshotName: "",
  message: "",
  mustFind: true
  }
)
```

**`Page.findAllBy`** similar to Page.findBy, but search for all WebElements that match the selector. It will return a `Promise<WebElement[]>`. Eg. of `<div class='myClass'>ACME 1</div><div class='myClass'>ACME 2</div>`


```javascript
const els = await objPage.findAllBy.css("myClass")
console.log(els.length) // 2
```

**`Page.switchToFrame`** Provide the Frames or iFrames WebElement that you want the WebDriver to switch to.
Use the switchToFrame.toDefault function to return to default frame. 

```javascript
const iFrame = await objPage.findBy.xpath("//iframe")
await objPage.switchToFrame.element(iFrame)
...
await objPage.switchToFrame.toDefault()
```

**`Page.waitDisappearBy`** will wait until the element not be displayed or the timeout.

```javascript
await objPage.waitDisappearBy.id("12345", {timeoutMs: 3000, message: "Div 12344 was still displayed after 3 seconds"})
```

**`Page.By`** direct access to selenium-webdriver By
\
**`Page.until`** direct access to selenium-webdriver until
\
\
<a href="https://aesmerio.swoofee.com" target="_blank">
<img height="32" style="border:0px;height:32px;" src="https://az743702.vo.msecnd.net/cdn/kofi3.png?v=a" border="0" alt="Buy Me a Coffee"></a>


