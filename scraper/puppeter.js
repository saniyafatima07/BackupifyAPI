const puppeteer = require('puppeteer');

async function scrape(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('article', { timeout: 60000 });  

  const content = await page.evaluate(() => {
    const title = document.querySelector('h1')?.innerText || '';
    const authorDate = document.querySelector('[class="mntl-attribution__item-date"]')?.innerText || '';

    const paragraphElements = document.querySelectorAll('article p'); 
    const rawContent = Array.from(paragraphElements)
      .map(p => p.innerText.trim())
      .filter(text => text.length > 0);

    const cleanContent = (content) =>{
        const cleanedContent = content.split('\n').map(paragraph => paragraph.trim()).filter(paragraph => paragraph.length>0);
        return cleanedContent;
    };

    const formattedContent = cleanContent(rawContent.join('\n'));

    return {
      title,
      authorDate,
      content: formattedContent,
    };
  });

  await browser.close();
  return content;
}

module.exports = scrape;
