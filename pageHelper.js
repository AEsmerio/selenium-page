const { WebDriver, By, until, WebElement } = require('selenium-webdriver')
const { createObjBaseOn } = require('./pageMisc')
const fs = require('fs')

const findConfigDefault = {
  timeoutMs: 2000,
  waitBeVisible: true,
  waitBeEnabled: true,
  waitBeEnabledMs: 2000,
  screenshotName: "",
  message: "",
  mustFind: true,
}

const pageFindConfigDefault = {
  dataTestAttr: "data-test",
  screenshot: true
}

function getContextStack() {
  const stack = new Error().stack
  const contextStack = []
  stack.split("\n").some((rec, index) => {
    if (index > 1) contextStack.push(rec)
    return contextStack.toString().includes("at Context.")
  })
  return contextStack.join("\n")
}

/**
 * @param {WebDriver} driver 
 */
  async function takeScreenshot(data, name) {
  const base64Data = data.replace(/^data:image\/png;base64,/,"")
  const path = `${__dirname}/screenshot/`
  const filePath = `${path}${name}.png`
  await fs.promises.mkdir(path, { recursive: true }, console.error)
  await fs.promises.writeFile(filePath, base64Data, 'base64')
  return filePath
}


/** @template T */
class PageBaseFindBy {
  /**
   *  Locates elements on the Document
   * @param {WebDriver} driver The class name to search for.
   * @param {By} by The class name to search for.
   */
  constructor(driver, by, pageFindConfig = pageFindConfigDefault) {
    this.driver = driver
    this.by = by
    this.pageFindConfig = createObjBaseOn(pageFindConfig, pageFindConfigDefault)
  }

  /**
   * @param {By} by The class name to search for.
   * @returns {T}
  */
   async findElement() {}

  /**
   * @param {By} by The class name to search for.
   * @returns {Promise<T>}
  */
  async find(by, config = findConfigDefault) {
    const contextStack = getContextStack()
    if (typeof config === "string") config = { message: config }
    config = createObjBaseOn(config, findConfigDefault)
    try {
      return await this.findElement.call(this, by, config)
    } catch (error) {
      if (!config.mustFind && error.message.includes("Waiting for element to be locate")) return 
      error.message += `\nBy: ${by}`
      error.message += config.message ? `\nMessage: ${config.message}` : ""
      if (this.pageFindConfig.screenshot) {
        const imgBase64 = await this.driver.takeScreenshot()
        error.message += "\nScreenshot: " + await takeScreenshot(imgBase64, config.screenshotName || Date.now())
      }
      error.stack = error.stack.split("    at")[0] + "\n" + contextStack
      throw error
    }
  }

  /**
   * Locates elements whose `name` attribute has the given value.
   * @param {string} name The name attribute to search for.
   */
  async name(name, config = findConfigDefault) {
    return await this.find(this.by.name(name), config)
  }

  /**
 * Locates elements that have a specific class name.
 * @param {string} name The class name to search for.
 */
  async className(name, config = findConfigDefault) {
    return await this.find(this.by.className(name), config)
  }

  /**
   * Locates elements using a CSS selector.
   * @param {string} selector The CSS selector to use.
   */
  async css(selector, config = findConfigDefault) {
    return await this.find(this.by.css(selector), config)
  }

  /**
   * Locates elements by the ID attribute. This locator uses the CSS selector `*[id='$ID']`, _not_ `document.getElementById`.
   * @param {string} id The ID to search for.
   */
  async id(id, config = findConfigDefault) {
    return await this.find(this.by.id(id), config)
  }

  /**
   * Locates link elements whose {@linkplain WebElement#getText visible text} matches the given string.
   * @param {string} text The link text to search for.
   */
  async linkText(text, config = findConfigDefault) {
    return await this.find(this.by.linkText(text), config)
  }

  /**
  * Locates elements whose `name` attribute has the given value.
  * @param {string} name The name attribute to search for.
  */
  async name(name, config = findConfigDefault) {
    return await this.find(this.by.name(name), config)
  }

  /**
   * Locates link elements whose {@linkplain WebElement#getText visible text} contains the given substring.
   * @param {string} text The substring to check for in a link's visible text.
   */
  async partialLinkText(text, config = findConfigDefault) {
    return await this.find(this.by.partialLinkText(text), config)
  }

  /**
   * @param {string} xpath The XPath selector to use.
   */
  async xpath(xpath, config = findConfigDefault) {
    return await this.find(this.by.xpath(xpath), config)
  }

  /**
   * @param {string} value The data-test attribue value selector to use.
   */
  async dataTest(value, config = findConfigDefault) {
    return await this.find(this.by.css(this.dataTestCssBuilder(value)), config)
  }

  /**
   * Build the Css selector for the data-test attribute
   * @param {string} value The data-test attribue value selector to use.
   */
  dataTestCssBuilder(value) {
    return `*[${this.pageFindConfig.dataTestAttr}="${value}"]`
  }
}

/** @extends {PageBaseFindBy<WebElement>} */
class PageFindBy extends PageBaseFindBy {

  /**
   * @param {By} by The class name to search for.
   * @returns {T}
  */
  async findElement(by, config = findConfigDefault) {
    await this.driver.wait(until.elementLocated(by), config.timeoutMs)
    const el = await this.driver.findElement(by)
    if (config.waitBeVisible) await this.driver.wait(until.elementIsVisible(el), config.timeoutMs)
    if (config.waitBeEnabled) await this.driver.wait(until.elementIsEnabled(el), config.waitBeEnabledMs)
    return await this.driver.findElement(by)
  }
}


/** @extends {PageBaseFindBy<WebElement[]>} */
class PageFindAllBy extends PageBaseFindBy {
  
  /**
   * @param {By} by The class name to search for.
   * @returns {T}
  */
  async findElement(by, config = findConfigDefault) {
    await this.driver.wait(until.elementLocated(by), config.timeoutMs)
    const els = await this.driver.findElements(by)
    if (config.waitBeVisible)
      for (const el of els) await this.driver.wait(until.elementIsVisible(el), config.timeoutMs)
    if (config.waitBeEnabled)
      for (const el of els) await this.driver.wait(until.elementIsEnabled(el), config.waitBeEnabledMs)
    return els
  }
}

/** @extends {PageBaseFindBy<void>} */
class PageWaitDisappear extends PageBaseFindBy {

  /**
   * @param {By} by The class name to search for.
   * @returns {void}
  */
  async findElement(by, config = findConfigDefault) {
    try {
      const el = await this.driver.findElement(by)
      await this.driver.wait(until.elementIsNotVisible(el), config.timeoutMs)
    } catch (error) {
      if (error.name === "NoSuchElementError") return
      if (error.message.startsWith("Waiting until element is not visible")) error.message += "\nBy: " + JSON.stringify(by)
      throw error
    }
  }
}

class PageSwitchToFrame {
  /**
   *  Locates elements on the Document
   * @param {WebDriver} driver The class name to search for.
   * @param {By} by The class name to search for.
   */
  constructor(driver, by) {
    this.driver = driver
    this.by = by
  }

  /**
  * @param {(number|WebElement| By| null)} frame The frame locator.
  */
  async element(frame) {
    await this.driver.wait(until.ableToSwitchToFrame(frame))
  }
  async toDefault() {
    await this.driver.switchTo().defaultContent()
  }
}

module.exports = { PageFindBy, PageFindAllBy, PageSwitchToFrame, PageWaitDisappear, pageFindConfigDefault }