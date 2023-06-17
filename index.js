const express = require("express");
const app = express();
const cors = require("cors");
// const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// const verifyJWT = (req, res, next) => {
//   const authorization = req.headers.authorization;
//   if (!authorization) {
//     return res
//       .status(401)
//       .send({ error: true, message: "unauthorized access" });
//   }

//   // bearer token
//   const token = authorization.split("")[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res
//         .status(401)
//         .send({ error: true, message: "unauthorized access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// };

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v7y5nyp.mongodb.net/?retryWrites=true&w=majority`;

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

    const classesCollection = client.db("fluencyDb").collection("classes");
    const selectedClassesCollection = client
      .db("fluencyDb")
      .collection("selectedClass");
    const instructorsCollection = client
      .db("fluencyDb")
      .collection("instructors");
    const usersCollection = client.db("fluencyDb").collection("users");

    // // jwt token
    // app.post("/jwt", (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "1hr",
    //   });
    //   res.send({ token });
    // });

    // users api
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const role = req.query.role;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: role,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // verify admin verifyJWT,
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        res.send({ admin: false });
      }

      const query = { email: email };
      const user = await usersCollection.findOne(query);

      if (user) {
        const result = { admin: user?.role === "admin" };
        res.send(result);
      }
    });

    // verify instructor
    // app.get("/users/instructor/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const decodedEmail = req.decoded.email;
    //   if (email !== decodedEmail) {
    //     res.send({ instructor: false });
    //   }

    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query);
    //   if (user) {
    //     const result = { instructor: user?.role === "instructor" };
    //     res.send(result);
    //   }
    // });

    // classes api
    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    app.post("/classes", async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await classesCollection.insertOne(query);
      res.send(result);
    });

    // instructors api
    app.get("/instructors", async (req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    });

    // student selected class
    app.get("/selectedClass/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await selectedClassesCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/selectedClass", async (req, res) => {
      const classData = req.body;
      console.log(classData);
      const result = await selectedClassesCollection.insertOne(classData);
      res.send(result);
    });

    app.delete("/selectedClass/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassesCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("fluency factory is running");
});

app.listen(port, () => {
  console.log(`Fluency factory is running on port ${port}`);
});
