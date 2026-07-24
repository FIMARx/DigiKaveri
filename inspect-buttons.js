import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Go to localhost
  await page.goto('http://localhost:3000/');
  
  // Open preferences modal
  await page.evaluate(() => {
    const btn = document.querySelector('.cc-link[href*="preferences"], button[data-cc="show-preferencesModal"]');
    if (btn) btn.click();
  });
  
  // Wait for modal to render
  await new Promise(r => setTimeout(r, 1000));
  
  const buttons = await page.evaluate(() => {
    const btns = document.querySelectorAll('#cc-main .pm__btn');
    return Array.from(btns).map(b => ({
      text: b.innerText,
      width: b.getBoundingClientRect().width,
      height: b.getBoundingClientRect().height,
    }));
  });
  
  console.log('--- PREFERENCES MODAL BUTTONS ---');
  console.table(buttons);

  const bannerButtons = await page.evaluate(() => {
    const btns = document.querySelectorAll('#cc-main .cm__btn');
    return Array.from(btns).map(b => ({
      text: b.innerText,
      width: b.getBoundingClientRect().width,
      height: b.getBoundingClientRect().height,
    }));
  });

  console.log('--- BANNER BUTTONS ---');
  console.table(bannerButtons);
  
  await browser.close();
})();
