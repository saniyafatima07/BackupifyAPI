import mongoose from "mongoose";

const scrapedDataSchema = new mongoose.Schema ({
    title: String,
    authorDate: String,
    url: String,
    content: String,
    date: String
});

const scrapedDataModel = mongoose.model("Scraped data ", scrapedDataSchema);
export default scrapedDataModel;