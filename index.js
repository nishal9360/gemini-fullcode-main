const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express()
app.use(express.json())

app.use(
  cors({
    origin: [
      "https://gemini-ai-ten-omega.vercel.app", 
      "http://localhost:5173",            
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("mongodb connected successfully");

}).catch((err) => {
  console.log("failed to connect mongodb", err);

})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Backend is running ");
});
const geminiSchema = new mongoose.Schema
  (
    {
      title: String,
      content: String,
      summary: String,
      tags: [String],
      createdBy: String,
    },
    {
      timestamps: true,
      collection: "documents",
    },

  )

const geminiModel = mongoose.model("Gemini", geminiSchema)

app.get("/doclist", async function (req, res) {
await  geminiModel.find().then((retdata) => {
    res.send(retdata)
  }).catch((err) => {
    res.send("error to retdata", err)
    console.log(err);

  })
})

app.get("/adddoc/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await geminiModel.findById(id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(doc);
  } catch (err) {
    console.error("Error fetching doc:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/addnewdoc", async function (req, res) {
  const { title, content, tags, summary, createdBy } = req.body

  try {
    const newDoc = new geminiModel(
      {
        title,
        content,
        summary,
        tags,
        createdBy,
      }
    )
    await newDoc.save()
    res.json(newDoc)
  } catch (err) {
    res.status(501).send("internal error")
  }
})

app.put("/updatedoc/:id", async (req, res) => {
  const { id } = req.params
  const updatedoc = {
    title: req.body.title,
    content: req.body.content,
  }
  try {
    const update = await geminiModel.findByIdAndUpdate(
      id,
      updatedoc,
      { new: true }
    );

    if (!update) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(update);

  } catch (err) {
    res.status(500).send("internal error while update")
  }
})

app.delete("/deletedoc/:id", async (req, res) => {
  try {
    const { id } = req.params
    await geminiModel.findByIdAndDelete(id)
    res.json({ success: true, message: "document deleted successfully" })
  } catch (err) {
    res.status(500).send("internal server error", err)
  }

})

//summary from gemini
app.post("/generateSummary", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Ask Gemini to generate summary and tags
    const prompt = `
      Summarize the following content in 2-3 sentences.
      Also, extract 2-3 intelligent tags.

      Content:
      ${content}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const [summary, tagsLine] = text.split("Tags:");
    const tags = tagsLine
      ? tagsLine.split(",").map((t) => t.trim())
      : [];

    res.json({
      summary: summary.trim(),
      tags,
    });
  } catch (err) {
    console.error("Error in generateSummary:", err);
    res.status(500).json({ error: "Failed to generate summary and tags" });
  }
});

//search filter
app.get("/search", async (req, res) => {
  const { title } = req.query;

  try {
    const docs = await geminiModel.find({
      title: { $regex: title, $options: "i" },
    });
    res.json(docs);
  } catch (err) {
    console.error("Error searching docs", err);
    res.status(500).send("Internal Server Error");
  }
});



app.post("/questionans", async (req, res) => {
  const { question } = req.body;

  try {
    const docs = await geminiModel.find().lean();

    const context = docs
      .map((doc) => `Title: ${doc.title}\nContent: ${doc.content}\nSummary: ${doc.summary}`)
      .join("\n\n");

    const prompt = `You are a helpful assistant. Answer the user's question based ONLY on the following documents:${context} Question: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (err) {
    console.error("Error in Q&A:", err);
    res.status(500).json({ error: "Failed to answer question" });
  }
});