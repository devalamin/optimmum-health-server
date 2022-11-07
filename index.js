const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const port = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER_OPTIMUM}:${process.env.DB_PASSWORD_OPTIMUM}@cluster0.3b5klku.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const servicesCollection = client.db('optimumdb').collection('services')


        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const services = await cursor.toArray();
            res.send(services)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.findOne(query);
            res.send(result)
        })

    }
    finally {

    }


}

run().catch(err => console.log(err))



app.get('/', (req, res) => {
    res.send('optimum server running')
})



app.listen(port, () => {
    console.log('server running on', port);
})