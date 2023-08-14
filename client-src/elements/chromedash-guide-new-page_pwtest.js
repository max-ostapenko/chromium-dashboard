// @ts-check
import {test, expect} from '@playwright/test';
// import playwright from "playwright";

const delay = (/** @type {number | undefined} */ ms) =>
   new Promise((resolve) => setTimeout(resolve, ms));

// Timeout for logging in, in milliseconds.
// Initially set to longer timeout, in case server needs to warm up and
// respond to the login.  Changed to shorter timeout after login is successful.
let loginTimeout = 30000;


// (async () => {
//   const browser = await playwright.chromium.launch();
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   // let consoleMsgs = []
//   page.on("console", (message) => {
//     // if (message.type() === "error") {
//     // consoleMsgs.push([message.type(), message.text()])
//     // }
//     console.log(message.type(), message.text());
//   });
//   // await page.evaluate(() => {
//   //   console.error("hello from the browser console.error");
//   //   console.log("hello from the browser console.log");
//   //   console.info("hello from the browser console.info");
//   // });
//   // if (consoleMsgs.length > 0) {
//   //   console.log('console messages: ', consoleMsgs);
//   //   consoleMsgs = [];
//   // }
//   // await browser.close();
//   // if (consoleMsgs.length > 0) {
//   //   console.log('After browser.close(); console messages: ', consoleMsgs);
//   //   consoleMsgs = [];
//   // }

//     // Wait for all messages to be received.
//     await page.waitForNavigation();

//     // Close the browser instance.
//     await browser.close();
//  })();


async function login(page) {
  page.on('console', async msg => {
    if (msg.type() === 'warn') { return } // ignore warnings
    const values = [];
    for (const arg of msg.args())
      values.push(await arg.jsonValue());
    console.log(`console.${msg.type()}: `, ...values);
  });

  // await expect(page).toHaveScreenshot('roadmap.png');
  // Always reset to the roadmap page.
  await page.goto('/', {timeout: 20000});
  await page.waitForURL('**/roadmap', {timeout: 20000});

  await delay(5000);
  await expect(page).toHaveTitle(/Chrome Status/);
  page.mouse.move(0, 0); // Move away from content on page.

  await delay(5000);
  // Check whether we are already logged in.
  let navContainer = page.locator('[data-testid=nav-container]');
  while (await navContainer.isVisible()) {
    // Already logged in. Need to logout.
    await navContainer.hover({timeout: 5000});
    const signOutLink = page.locator('[data-testid=sign-out-link]');
    await expect(signOutLink).toBeVisible();

    await signOutLink.hover({timeout: 5000});
    await signOutLink.click({timeout: 5000});

    await delay(5000);
    await page.waitForURL('**/roadmap');
    await expect(page).toHaveTitle(/Chrome Status/);
    page.mouse.move(0, 0); // Move away from content on page.

    await delay(5000);
    navContainer = page.locator('[data-testid=nav-container]');
  }

  // Expect login button to be present.
  console.info('expect login button to be present and visible');
  const loginButton = page.locator('button[data-testid=dev-mode-sign-in-button]');
  await expect(loginButton).toBeVisible({timeout: loginTimeout});

  await delay(5000);

  // // Expect nav container to not be present.
  // const navContainer = page.locator('[data-testid=nav-container]');
  // await expect(navContainer).toHaveCount(0);

  // // Take a screenshot of the initial page before login.
  // if (!loginScreenshots) {
  //   await expect(page).toHaveScreenshot('before-login.png');
  // }

  // Need to wait for the google signin button to be ready, to avoid
  // loginButton.waitFor('visible');
  await loginButton.click({timeout: 10000});
  await delay(5000);

  // await page.goto('/', {timeout: 30000});
  // await page.waitForURL('**/roadmap', {timeout: 20000});

  // Expect the title to contain a substring.
  await expect(page).toHaveTitle(/Chrome Status/);
  page.mouse.move(0, 0); // Move away from content on page.
  await delay(5000);

  await expect(page).toHaveScreenshot('after-login-click.png');

  // Check that we are logged in now.
  // Expect a nav container to be present.
  // This sometimes fails, even though the screenshot seems correct.
  navContainer = page.locator('[data-testid=nav-container]');
  await expect(navContainer).toBeVisible({timeout: loginTimeout});
  loginTimeout = 10000; // After first login, reduce timeout.

  // if (!loginScreenshots) {
  //   // Take a screenshot of the page after login.
  //   await expect(page).toHaveScreenshot('after-login.png', {timeout: 10000});
  //   loginScreenshots = true;
  // }
}

// let logoutScreenshots = false;

async function logout(page) {
  // Attempt to sign out after running each test.
  // First reset to the roadmap page.
  await page.goto('/');
  await page.waitForURL('**/roadmap');
  await delay(5000);

  await expect(page).toHaveTitle(/Chrome Status/);
  page.mouse.move(0, 0); // Move away from content on page.
  await delay(5000);

  const navContainer = page.locator('[data-testid=nav-container]');
  await expect(navContainer).toBeVisible({timeout: 20000});

  await delay(5000);

  await navContainer.hover({timeout: 5000});
  const signOutLink = page.locator('[data-testid=sign-out-link]');
  await expect(signOutLink).toBeVisible();

  await signOutLink.hover({timeout: 5000});
  // if (!logoutScreenshots) {
  //   await expect(page).toHaveScreenshot('sign-out-link.png');
  // }
  await signOutLink.click({timeout: 5000});

  await page.waitForURL('**/roadmap');
  // await page.goto('/');
  // await page.waitForURL('**/roadmap');
  await expect(page).toHaveTitle(/Chrome Status/);
  // page.mouse.move(0, 0); // Move away from content on page.

  // await page.goto('/');
  // await page.waitForURL('**/roadmap');
  // page.mouse.move(0, 0); // Move away from content on page.

  // if (!logoutScreenshots) {
  //   await expect(page).toHaveScreenshot('after-sign-out.png', { timeout: 10000 });
  //   logoutScreenshots = true;
  // }

  // Wait for sign in button to appear.
  // This sometimes fails, even though the screenshot seems correct.
  // const loginButton = page.locator('[data-testid=dev-mode-sign-in-button]');
  // await loginButton.waitFor('visible', {timeout: 10000});
  // await expect(loginButton).toBeVisible({timeout: 10000});
}


test.beforeEach(async ({page}) => {
  test.setTimeout(60000 + loginTimeout);
  // Attempt to login before running each test.
  await login(page);
});

test.afterEach(async ({page}) => {
  test.setTimeout(60000 + loginTimeout);
  await logout(page);
});


test('navigate to create feature page', async ({page}) => {
  // await page.goto('/');
  // await page.waitForURL('**/roadmap');

  // Take a screenshot of header with "Create feature" button.
  // await expect(page.locator('header')).toHaveScreenshot('create-feature-button-check.png');

  // Expect create feature button to be present.
  const createFeatureButton = page.locator('[data-testid=create-feature-button]');
  await expect(createFeatureButton).toBeVisible({timeout: 30000});

  // Take a screenshot of header with "Create feature" button.
  await expect(page.locator('[data-testid=header]')).toHaveScreenshot('create-feature-button.png');

  // Navigate to the new feature page by clicking.
  createFeatureButton.click();
  // await page.waitForURL('**/guide/new', {timeout: 20000});

  // Expect "Add a feature" header to be present.
  const addAFeatureHeader = page.locator('[data-testid=add-a-feature]');
  await expect(addAFeatureHeader).toBeVisible();

  // Take a screenshot of the content area.
  await expect(page).toHaveScreenshot('new-feature-page.png');
});

// test('new feature page content', async ({page}) => {
//   // Navigate to the new feature page.
//   await page.goto('/guide/new', {timeout: 20000});
//   // await page.waitForURL('**/guide/new', {timeout: 30000});

//   // Expect "Add a feature" header to be present.
//   const addAFeatureHeader = page.locator('[data-testid=add-a-feature]');
//   await expect(addAFeatureHeader).toBeVisible({timeout: 30000});

//   // Take a screenshot
//   await expect(page.locator('chromedash-guide-new-page'))
//     .toHaveScreenshot('new-feature-page-content.png');
// });

test('enter feature name', async ({page}) => {
  test.setTimeout(90000);

  // Navigate to the new feature page.
  const createFeatureButton = page.locator('[data-testid=create-feature-button]');
  createFeatureButton.click({timeout: 10000});

  const featureNameInput = page.locator('input[name="name"]');
  await expect(featureNameInput).toBeVisible({timeout: 60000});

  // Expand the extra help.
  const extraHelpButton = page.locator('chromedash-form-field[name="name"] sl-icon-button');
  await expect(extraHelpButton).toBeVisible();
  extraHelpButton.click();

  // Enter a feature name.
  featureNameInput.fill('Test feature name');

  await expect(page).toHaveScreenshot('feature-name.png');
});
