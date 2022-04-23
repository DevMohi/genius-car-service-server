const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
// aita na use korle body parse korte parbana 
app.use(express.json())

//This is for connecting database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3nnot.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// ai ongsho ta code theke felai diba coz amra async die korbo
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     console.log('Genius Car DB Connected')
//     // perform actions on the collection object
//     client.close();
// });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');

        // for getting all the users
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })

        // ekta pawar jnno
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })

        //post to insert one document
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })

        //for deleting
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            // database theke query kortese 
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running Genius server');
});

// for listening and running 
app.listen(port, () => {
    console.log('Listening to port ', port);
})

