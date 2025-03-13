require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pmbnx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
    const database = client.db("reviewsDB");
    const reviewsCollection = database.collection("reviewsCollection");
    const watchList = database.collection("watchListCollection");
    // The database to use
    app.get("/", (req, res) => {
      res.send("Welcome to the root directory");
    });

    app.get("/reviews", async (req, res) => {
      const reviews = await reviewsCollection.find().toArray();
      res.send(reviews);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    //Fetch A Review
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
      res.send(review);
    });
    // Update A Review
    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const review = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };
      const updateReview = {
        $set: {
          gameCover: review.gameCover,
          gameTitle: review.gameTitle,
          genre: review.genre,
          publishingYear: review.publishingYear,
          rating: review.rating,
          review: review.review,
        },
      };
      const result = await reviewsCollection.updateOne(
        filter,
        updateReview,
        options
      );
      res.send(result);
    });
    // Delete A Review
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });
    // Fetch Personalized Reviews by User Email
    app.get("/reviews/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const review = await reviewsCollection.find(query).toArray();
      res.send(review);
    });

    // Watch List
    app.get("/watch-list", async (req, res) => {
      const result = await watchList.find().toArray();
      res.send(result);
    });
    app.get("/watch-list/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await watchList.find(query).toArray();
      res.send(result);
    });

    app.post("/watch-list", async (req, res) => {
      const data = req.body;
      const result = await watchList.insertOne(data);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
