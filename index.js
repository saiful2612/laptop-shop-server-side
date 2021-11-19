const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();

//Config .env
require("dotenv").config();

//App running port
const PORT = process.env.PORT || 8000;

//Middleware
app.use(express.json());
app.use(cors());

//MongoDB uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mhs2r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    //DB connection
    await client.connect();
    const database = client.db("laptop_shop");

    //DB collections
    const smartphonesCollection = database.collection("laptops");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");

    /* ==================== Smartphones Api ========================= */
    //Get all smartphones from DB
    app.get("/phones", async (req, res) => {
      const result = await smartphonesCollection.find({});
      const users = await result.toArray();
      res.json(users);
    });
    //Get smartphone by id
    app.get("/phones/:_id", async (req, res) => {
      const result = await smartphonesCollection.findOne({
        _id: ObjectId(req.params._id),
      });
      res.json(result);
    });
    //Add a new Smartphone
    app.post("/phones", async (req, res) => {
      const result = await smartphonesCollection.insertOne(req.body);
      res.json(result);
    });
    //Delete a Smartphone by id
    app.delete("/phones/:_id", async (req, res) => {
      const result = await smartphonesCollection.deleteOne({
        _id: ObjectId(req.params._id),
      });
      res.json(result);
    });
    /* ==================== Orders Api ========================= */
    //Get all orders from DB
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find({});
      const users = await result.toArray();
      res.json(users);
    });
    //Get orders by Email
    app.get("/orders/:email", async (req, res) => {
      const result = await ordersCollection.find({
        email: req.params.email,
      });
      const userOrders = await result.toArray();
      res.json(userOrders);
    });
    //Add a new order
    app.post("/orders", async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.json(result);
    });

    //Update a order by id
    app.patch("/orders/:_id", async (req, res) => {
      const filter = { _id: ObjectId(req.params._id) };
      const updateDoc = {
        $set: req.body,
      };
      const result = await ordersCollection.findOneAndUpdate(filter, updateDoc);
      res.json(result);
    });

    //Delete a order by id
    app.delete("/orders/:_id", async (req, res) => {
      console.log(req);
      const result = await ordersCollection.deleteOne({
        _id: ObjectId(req.params._id),
      });
      res.json(result);
    });

    /* ==================== Reviews Api ========================= */
    //Get all reviews from DB
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find({});
      const reviews = await result.toArray();
      res.json(reviews);
    });
    //Add a new review
    app.post("/reviews", async (req, res) => {
      const result = await reviewsCollection.insertOne(req.body);
      res.json(result);
    });
    /* ==================== Users Api ========================= */
    //Check if user is Admin!
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;

      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //Add a new user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    //Update a user
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    //Update a user to Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //Catch error
  } catch (err) {
    console.error(err.message);
  }
}

run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send(`<h2>App running on port ${PORT}</h2>`);
});

app.listen(PORT, () => console.log(`listening to the port ${PORT}`));
