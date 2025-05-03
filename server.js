const express = require('express')
const path = require('path')
const scrape = require('./scraper/puppeter')

const app = express()
const port = 3000;


app.get('/', (req, res) => {
    res.send("Server running, Yay!!")
})

app.get('/scrape', async (req, res) => {
    const url = "https://www.allrecipes.com/article/cooks-to-follow-shaurya-from-india/";
    const data = await scrape(url);

    if (data) {
        res.send(data);
    }

    else {
        res.status(500).json({ error: "Scraping failed" });
    }
});

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`)
})