const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER_OPTIMUM}:${process.env.DB_PASSWORD_OPTIMUM}@cluster0.3b5klku.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_OPTIMUM, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'unauthorized' })
        }
        req.decoded = decoded;
        next()
    })

}

async function run() {
    try {
        const servicesCollection = client.db('optimumdb').collection('services')
        const reviewCollection = client.db('optimumdb').collection('reviews');

        app.post('/jwt', (req, res) => {
            const optimumUser = req.body;
            const token = jwt.sign(optimumUser, process.env.ACCESS_TOKEN_OPTIMUM, { expiresIn: '5d' })
            res.send({ token })

        })

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const services = await cursor.limit(3).toArray();
            res.send(services)
        });

        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const services = await cursor.toArray();
            res.send(services)
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.findOne(query);
            res.send(result)
        });

        app.post('/services', async (req, res) => {
            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);
            res.send(result)
        })

        app.post('/reviews', async (req, res) => {
            const reviewGiven = req.body;
            const result = await reviewCollection.insertOne(reviewGiven)
            res.send(result)
        });

        app.get('/singlereviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.findOne(query);
            res.send(result)
        });

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const review = req.body;
            const option = { upsert: true }
            const updatedReview = {
                $set: {
                    review: review.comment,
                    phone: review.phone
                }
            }
            const result = await reviewCollection.updateOne(query, updatedReview, option);
            res.send(result)
            console.log(review);

        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        });
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.findOne(query);
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.service_name) {
                query = {
                    service_name: req.query.service_name
                }
            }

            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        });

        app.get('/reviewsbyemail', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(403).send('unauthorized access')
            }

            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviewsByEmail = await cursor.toArray();
            res.send(reviewsByEmail)
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