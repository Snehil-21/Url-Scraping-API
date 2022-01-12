// import required dependencies
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";

// Initialise express server object
const app = express();

// Configure server settings
app.use(express.json());
app.use(cors());

// Define port number to be used
const PORT = process.env.PORT || 3000;

// Home route
app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Task API" });
});

// URL Scraping Route  GET Method
app.get("/getMentors", async (req, res) => {
  // try-catch block for exception handling
  try {
    // get offset and limit query params from url or set deafult
    const offset = parseInt(req.query.offset ? req.query.offset : 10);
    const limit = parseInt(req.query.limit ? req.query.limit : 10);

    // fetch xml response from the url api
    const xmlList = await fetch(
      "https://crmapi.upgrad.com/consumer/v2/profile/list",
      {
        mode: "cors",
        headers: {
          "Content-Type": "application/xhtml+xml",
        },
      }
    );

    // parse xml response from url api to string and then to JSON
    let mentorList = JSON.parse(await xmlList.text());

    // get the length of the response
    const len = mentorList.length;

    // check criteria for correct params and then slice the mentor list accordingly or throw an error
    if (offset >= 0 && limit + offset <= len) {
      mentorList = mentorList.slice(offset, offset + limit);
    } else if (offset < 0) {
      throw new Error("Offset out of bounds");
    } else {
      throw new Error("Not enough data");
    }

    // write the filtered mentor list to a file
    fs.writeFile("mentors.json", JSON.stringify(mentorList), (error) => {
      if (error) throw new Error("Error saving the file");
      return res
        .status(200)
        .json({ mentorList, success: "File saved successfully" });
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Make sure the express server listens to requests on the specified port number
app.listen(PORT, () => {
  console.log(`Express server up on port ${PORT}`);
});
