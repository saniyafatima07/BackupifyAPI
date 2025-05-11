import express from 'express';
import path from 'path';
import scrape from './scraper/puppeteer.js';
import {connectDB} from './mongodb.js';

const app = express();
const port = 3000;

connectDB();

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

        if (data) {
            res.json(data);
        }

        else {
            res.status(500).json({ error: "Scraping failed" });
        }
    }catch(err){
        console.log("Scraping failed: ", err);
        res.status(500).json({error: "Something went wrong during scraping"})
    }
});

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`)
})