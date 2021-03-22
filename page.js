const { Builder, By, until, Capabilities, Key, ThenableWebDriver } = require('selenium-webdriver')
const { PageFindBy, PageFindAllBy, PageSwitchToFrame, PageWaitDisappear, pageFindConfigDefault } = require('./pageHelper')
const { createObjBaseOn } = require('./pageMisc')

const browserChrome = "chrome"
const browserSafari = "safari"
const browserFirefox = "firefox"
const browserIE = "internet explorer"
const browserEdge = "MicrosoftEdge"
const browserOpera = "opera"
const Max = "Max"

const PageDefs = {
  browsers: { browserChrome, browserSafari, browserFirefox, browserIE, browserEdge, browserOpera },
  resolutions: {
    maximize: { width: Max, height: Max },
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 420, height: 730 },
  }
}

const pageConfigDefault = {
  browser: browserChrome,
  browserArgs: [],
  browserCapability: [
    { prop: "setPageLoadStrategy", value: "normal" }
  ],
  findConfig: pageFindConfigDefault,
  resolution: PageDefs.resolutions.maximize,
  /** 
   * if webdriverOverride is set, the params "browser", "browserArgs" and "browserCapability" will be ignored. 
   * Ensure webdriverOverride is correct and full configured. 
   * @type {ThenableWebDriver | Null} 
   * */
  webdriverOverride: null
}

class Page {

  constructor(pageConfig = pageConfigDefault) {
    try {
      const resolution = createObjBaseOn(pageConfig.resolution || {}, pageConfigDefault.resolution)
      const findConfig = createObjBaseOn(pageConfig.findConfig || {}, pageConfigDefault.findConfig)
      /** @type {pageConfigDefault} */
      this.pageConfig = createObjBaseOn(pageConfig, pageConfigDefault)
      this.pageConfig.findConfig = findConfig
      this.pageConfig.resolution = resolution

      if (this.pageConfig.webdriverOverride) {
        console.info("  Page > Webdriver was built outside Selenium-Page")
        this.driver = this.pageConfig.webdriverOverride
      } else {
        const caps = new Capabilities()
        this.pageConfig.browserCapability.forEach(cap => {
          caps.set(cap.prop, cap.value)
        })

        let options = null
        switch (this.pageConfig.browser) {
          case browserChrome:
            const chrome = require('selenium-webdriver/chrome')
            options = new chrome.Options()
            break
          case browserSafari:
            const safari = require('selenium-webdriver/safari')
            options = new safari.Options()
            break
          case browserFirefox:
            const firefox = require('selenium-webdriver/firefox')
            options = new firefox.Options()
            break
          case browserIE:
            const ie = require('selenium-webdriver/ie')
            options = new ie.Options()
            break
          case browserEdge:
            const edge = require('selenium-webdriver/edge')
            options = new edge.Options()
            break
          case browserOpera:
            const opera = require('selenium-webdriver/opera')
            options = new opera.Options()
            break
        }

        if (!options) throw new Error(`"${this.pageConfig.browser}" is not supported browser. Selenium-Page supports: ${Object.values(PageDefs.browsers).join(", ")}.`)

        this.pageConfig.browserArgs.forEach(arg => {
          options.addArguments(arg)
        })

        /** @type {ThenableWebDriver} */
        this.driver = new Builder()
          .setChromeOptions(options)
          .setSafariOptions(options)
          .setFirefoxOptions(options)
          .setIeOptions(options)
          .setEdgeOptions(options)
          .setOperaOptions(options)
          .withCapabilities(caps)
          .forBrowser(this.pageConfig.browser)
          .build()
        console.info(`  Page > Browser: "${this.pageConfig.browser}". Resolution: ${this.pageConfig.resolution.width} x ${this.pageConfig.resolution.height}.`)
      }

      this.By = By
      this.until = until
      this.findBy = new PageFindBy(this.driver, By, this.pageConfig.findConfig)
      this.findAllBy = new PageFindAllBy(this.driver, By, this.pageConfig.findConfig)
      this.waitDisappearBy = new PageWaitDisappear(this.driver, By, this.pageConfig.findConfig)
      this.switchToFrame = new PageSwitchToFrame(this.driver, By, this.pageConfig.findConfig)
    } catch (error) {
      return console.error(`  Page > Failure: ${error.message}`)
    }
  }

  /**
   * @param {string} url
   * @param {{width: number, height: number}} resolution PageDefs.resolutions has some templates. If resolution is not set, it will use the the PageConfig.resolution
   */
  async open(url, resolution) {
    resolution = resolution || this.pageConfig.resolution
    if (resolution.height === Max && resolution.width === Max) await this.driver.manage().window().maximize()
    else await this.driver.manage().window().setRect({ width: resolution.width, height: resolution.height })
    if (resolution !== this.pageConfig.resolution) console.info(`  Test > Resolution: ${JSON.stringify(this.pageConfig.resolution)}`)
    await this.driver.get(url)
  }

  async close() {
    await this.driver.close()
  }
}

module.exports = { Page, Key, PageDefs }