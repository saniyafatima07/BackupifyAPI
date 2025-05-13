import puppeteer from "puppeteer";
import scrapedDataModel from '../models/scrapedData.js';

export default async function scrape(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('article', { timeout: 60000 });  

  const content = await page.evaluate(() => {

    const getTitle = () => {
        return document.querySelector('h1')?.innerText || document.title || '';
    };

    const getDate = () =>{
      return(
        document.querySelector('time')?.innerText ||
        document.querySelector('meta[class="date"]')?.content ||
        document.querySelector('[class*="item-date"]')?.innerText ||
        ''
      );
    };

    const getMainContent = () => {
        const containers = [
          document.querySelector('article'),
          document.querySelector('main'),
          document.querySelector('section'),
          document.getElementsByClassName('content'),
          document.body,
        ];

        for(const container of containers){
          if(container){
            const paragraphs = container.querySelectorAll('p');
            const raw = Array.from(paragraphs)
            .map(p => p.innerText.trim())
            .filter(p => p.length>0)

            if(raw.length > 0)
                return raw;
          }
        }
        return [];
    };

    const cleanContent = (arr) =>{
        return arr.map(p => p.replace(/\s/g, ' ').trim()).filter(p => p.length>0);
    };

    return {
      title: getTitle(),
      authorDate: getDate(),
      content: cleanContent(getMainContent())
    };
  });
  
  await browser.close();

  const dataToSave = new scrapedDataModel({
      title: content.title,
      authorDate: content.authorDate,
      url: url,
      content: content.content.join('\n'),
      date: new Date().toISOString()
  });

  try{
    await dataToSave.save();
    console.log("Scraped data saved to MongoDB");
  }catch(err){
    console.error("Error in saving data to MongoDB");
  }

  return content;
}
