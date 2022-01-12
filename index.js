import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Task API" });
});

app.get("/getMentors", async (req, res) => {
  try {
    const offset = parseInt(req.query.offset ? req.query.offset : 10);
    const limit = parseInt(req.query.limit ? req.query.limit : 10);

    const xmlList = await fetch(
      "https://crmapi.upgrad.com/consumer/v2/profile/list",
      {
        mode: "cors",
        headers: {
          "Content-Type": "application/xhtml+xml",
        },
      }
    );

    let mentorList = JSON.parse(await xmlList.text());

    const len = mentorList.length;

    if (offset >= 0 && limit + offset <= len) {
      mentorList = mentorList.slice(offset, offset + limit);
    } else if (offset < 0) {
      throw new Error("Offset out of bounds");
    } else {
      throw new Error("Not enough data");
    }

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

app.listen(PORT, () => {
  console.log(`Express server up on port ${PORT}`);
});
