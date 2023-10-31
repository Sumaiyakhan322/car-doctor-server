const express = require('express');
const cors = require('cors');
const app=express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port =process.env.PORT  || 5001
//middle ware
app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ej2tmfe.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   


    const serviceCollection= client.db('carDoctor').collection('services')
    const BookingCollection= client.db('carDoctor').collection('booking')
    app.get('/services',async(req,res)=>{
        const cursor=serviceCollection.find()
        const result=await cursor.toArray()
        res.send(result)

    })

    app.get('/services/:id',async(req,res)=>{
        const id=req.params.id
        const query={_id:new ObjectId(id)}
        const options = {
            // Sort returned documents in ascending order by title (A->Z)
            sort: { title: 1 },
            // Include only the `title` and `imdb` fields in each returned document
            projection: {  title: 1, price: 1,service_id:1 ,img:1},
          };
        const result=await serviceCollection.findOne(query,options)
        res.send(result)
    })


    //bookings
    app.post('/bookings',async(req,res)=>{
        const booking=req.body;
        const result=await BookingCollection.insertOne(booking)
        res.send(result)
    })
    //use query
    app.get('/bookings',async(req,res)=>{
      
      let query={}
      if(req.query?.customerEmail){
        query={customerEmail:req.query.customerEmail}
      }
        const cursor=BookingCollection.find(query)
      
        const result=await cursor.toArray()
        
        res.send(result)


    })
    //delete

    app.delete('/bookings/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id :new ObjectId(id)}
      const result=await BookingCollection.deleteOne(query)
     
      res.send(result)
     
    })
    //update
    app.patch('/bookings/:id',async(req,res)=>{
      const updatedBooking=req.body;
      const id=req.params.id;
      
      const filter={_id:new ObjectId(id)}
      const updateDoc={
        $set:{
            status:updatedBooking.status
        }
      }  
      const result=await BookingCollection.updateOne(filter,updateDoc)  
      res.send(result)  
    })

   


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("doctor is running")

})
app.listen(port, ()=>{
    console.log("Server is running");
})