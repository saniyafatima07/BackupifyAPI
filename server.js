import express from 'express';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import scrape from './scraper/puppeteer.js';
import {connectDB} from './mongodb.js';

const app = express();
const port = 3000;

connectDB();

app.use('/downloads', express.static(path.join(process.cwd(),'downloads')));

app.get('/', (req, res) => {
    res.send("Server running, Yay!!")
})

app.get('/scrape', async (req, res) => {
    const url = req.query.url;

    if(!url || !url.startsWith('http')) {
        return res.status(500).json({error: "Invalid or missing url"});
    }   

    try {
        const data = await scrape(url);

        const fileName = `scraped_${Date.now()}.pdf`;
        const filePath = path.join('downloads', fileName);

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(22).text(data.title || "No Title", {underline: true});
        doc.moveDown();
        doc.fontSize(14).fillColor('black').text(`URL: `, {continued: true});
        doc.fillColor('blue').text(url);
        doc.fontSize(14).fillColor('black').text(`Date: ${data.authorDate || new Date().toISOString()}`);
        doc.moveDown();

        doc.fillColor('black');

        data.content.forEach(paragraph => {
            doc.text(paragraph,{
                wordSpacing: 3,
                lineGap: 6,
            });
            doc.moveDown();
        });

        doc.end();

        res.json({
            message: "Scraping done and data saved!",
            downloadLink: `http://localhost:${port}/downloads/${fileName}`
        })

    }catch(err){
        console.log("Scraping failed: ", err);
        res.status(500).json({error: "Something went wrong during scraping"})
    }
});

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`)
})