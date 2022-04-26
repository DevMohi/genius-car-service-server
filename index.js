const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
// aita na use korle body parse korte parbana 
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log('decoded', decoded)
        req.decoded = decoded;
        next();

    })

}


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
        // for checkout  
        const orderCollection = client.db('geniusCar').collection('order');

        //AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // for getting all the users services api
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


        //Order Collection api

        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            console.log(decodedEmail)
            const email = req.query.email;


            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running Genius server');
});
app.get('/hero', (req, res) => {
    res.send("Hero meets hero ku")
})

// for listening and running 
app.listen(port, () => {
    console.log('Listening to port ', port);
})

