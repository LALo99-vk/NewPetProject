const express = require('express');
const cors = require('cors');
const app=express();
//require jwt
const jwt =require('jsonwebtoken')
//cookie
const cookieParser=require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe =require('stripe')(process.env.STRIPE_SECRET_KEY)
const port=process.env.PORT || 5007;

//middleware
app.use(cors({
  origin:[
    'https://pet-adoption-platform-cc33e.web.app',
    'http://localhost:5173'
  ],
  credentials:true,
  optionSuccessStatus: 200
}));
app.use(cookieParser());
app.use(express.json());





//const uri = "mongodb+srv://<username>:<password>@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middleware for cookie parser
const logger=(req,res,next)=>{
  console.log('cookiee',req.method,req.url);
  next();
}
// const verifyToken=(req,res,next)=>{
//   const token=req?.cookies?.token;
//   console.log('middleware verify token:',token);
//   if(!token){
//     return res.status(401).send({message:'Unautharized Access'})
//   }
//   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded))
//   {
//     if(err){
//     return res.status(401).send({message:'Unautharized Access'})
//     req.user=decoded;
//     next();
//   }
// }
// }
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available 
  if (!token) {
      return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
      }
      req.user = decoded;
      next();
  })
}



async function run() {
    try {
     
    const PetCategoryCollection =client.db('PetAdoption').collection('PetCategory')
    const petsCollection=client.db('PetAdoption').collection('pets')
    const addAdoptCollection=client.db('PetAdoption').collection('addtoadopt')
    const addDonationCampCollection=client.db('PetAdoption').collection('adddonationcamp')
    const usersCollection=client.db('PetAdoption').collection('users')
    const paymentCollection = client.db("PetAdoption").collection("payments");

//jwt login
app.post('/jwt',async(req,res)=>{
  const user=req.body;
  console.log('user for token',user);
  const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
  res.cookie('token',token,{
    httpOnly:true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  })
  .send({success:true});
 })

 //jwt logout
 app.post('/logout',async(req,res)=>{
  const user = req.body;
  // res.clearCookie('token',{maxAge:0,secure: process.env.NODE_ENV === 'production', 
  // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',})
  // send({success:true})
 res.clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true }).send({ success: true })
 })


    //home page a book category niyechi
    app.get('/PetCategory',async(req,res)=>{
      const cursor=PetCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })
  app.get('/petbycategory/:category',async(req,res)=>{
    const category = req.params.category;
    query={category:category }
      const result = await petsCollection.find(query).toArray();
    res.send(result);
  })
  
  app.get('/pets',async(req,res)=>{
    const cursor=petsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})
app.post('/pets',async(req,res)=>{
  const newPet=req.body;
  console.log(newPet); 

 const result=await petsCollection.insertOne(newPet);
 res.send(result)
 
})
// Add this endpoint to fetch a pet by ID
app.get('/pets/:id', async (req, res) => {
  const petId = req.params.id;

  try {
    const result = await petsCollection.findOne({ _id:new ObjectId(petId) });
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: 'Pet not found' });
    }
  } catch (error) {
    console.error('Error fetching pet data:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

app.get('/addtoadopt',async(req,res)=>{
 
  const cursor=addAdoptCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})
app.post('/addtoadopt',async(req,res)=>{
  const addtoadopt=req.body;
  console.log(addtoadopt); 

 const result=await addAdoptCollection.insertOne(addtoadopt);
 res.send(result)
 
})


// Backend API endpoint to fetch donation campaign details by ID
// app.get('/donationcampaigndetails/:id', async (req, res) => {
//   const id = req.params.id;

//   try {
//     const result = await addDonationCampCollection.findOne({ _id: new ObjectId(id) });

//     if (result) {
//       res.send(result);
//     } else {
//       res.status(404).send({ message: 'Donation campaign not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching donation campaign data:', error);
//     res.status(500).send({ message: 'Internal server error', error: error.message });
//   }
// });
app.get('/adddonationcamp/:id',async(req,res)=>{
  const id= req.params.id;
  const query ={_id: new ObjectId(id)}
 
  const result = await  addDonationCampCollection.findOne(query);
  res.send(result);
})

app.post('/adddonationcamp',async(req,res)=>{
    const newdonationcamp=req.body;
    console.log(newdonationcamp); 
  
   const result=await addDonationCampCollection.insertOne(newdonationcamp);
   res.send(result)
   
  })
  app.get('/adddonationcamp', async (req, res) => {
    try {
      const cursor = addDonationCampCollection.find();
      const result = await cursor.toArray();
      console.log('Fetched donation camp data:', result);
      res.send(result);
    } catch (error) {
      console.error('Error fetching donation camp data:', error);
      res.status(500).send({ error: 'Internal server error' });
    }
  });
app.put('/pets/:petId',async(req,res)=>{
  const id =req.params.petId;
  console.log(id);
  const filter={_id:new ObjectId(id)}
  const options={upsert:true};
  const updatedpet=req.body;
  const pet={
    $set:{
      name:updatedpet.name,
      image:updatedpet.image,
      category:updatedpet.category,
      age:updatedpet.age,
      location:updatedpet.location,
      
      shortdesp:updatedpet.shortdesp,
      longdesp:updatedpet.longdesp,
     
    }
  }
  console.log(pet);
  const result = await petsCollection.updateOne(filter,pet,options);
  res.send(result)
})

app.delete('/pets/:id', async(req,res)=>{
  const id =req.params.id;
  console.log(id);
  const query={_id:new ObjectId(id)}
  const result = await petsCollection.deleteOne(query);
  res.send(result);
})


app.patch('/pets/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Validate if id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ObjectId' });
    }

    // Find the pet by id and update adopt_req status
    const updatedPet = await petsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { adopted: true } },
      { returnDocument: 'after' } // Return the updated document
    );

    if (!updatedPet.value) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(updatedPet.value);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// update donation camp
// Update donation campaign route
app.put('/updatedonationcamp/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const existingDonationCamp = await addDonationCampCollection.findOne({ _id: new ObjectId(id) });

    if (!existingDonationCamp) {
      return res.status(404).json({ error: 'Donation campaign not found' });
    }

    // Update the donation campaign fields
    existingDonationCamp.name = req.body.name;
    existingDonationCamp.image = req.body.image;
    existingDonationCamp.max_donation_limit = req.body.max_donation_limit;
    existingDonationCamp.last_donation_date = req.body.last_donation_date;
    existingDonationCamp.shortdesp = req.body.shortdesp;
    existingDonationCamp.longdesp = req.body.longdesp;
    existingDonationCamp.addedDate = req.body.addedDate;
    existingDonationCamp.userEmail = req.body.userEmail;
    existingDonationCamp.Pause = req.body.Pause;

    // Save the updated donation campaign
    const updatedDonationCamp = await addDonationCampCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: existingDonationCamp },
      { returnDocument: 'after' }
    );

    res.status(200).json({ updated: true, updatedDonationCamp });
  } catch (error) {
    console.error('Error updating donation campaign:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/users',async(req,res)=>{
  const newuser=req.body;
  
  const query={email:newuser.email}
  const existingUser=await usersCollection.findOne(query);
  if(existingUser){
    return res.send({message:'user already exists',insertedId:null})
  }
  console.log('server',newuser); 

 const result=await usersCollection.insertOne(newuser);
 res.send(result)
 
})
//get all users
app.get('/users',async(req,res)=>{
 
  const cursor=usersCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})
//make admin
app.patch('/users/admin/:id',async(req,res)=>{
 const id =req.params.id;
 const filter={_id:new ObjectId(id)};
 const updatedDoc={
  $set:{
    role:'Admin'
  }
 }
 
  const result = await usersCollection.updateOne(filter,updatedDoc);
  res.send(result);
})
//make adopted 
app.patch('/admin/adopted/:id',async(req,res)=>{
  const id =req.params.id;
  const filter={_id:new ObjectId(id)};
  const updatedDoc={
   $set:{
     adopted:true,
   }
  }
  
   const result = await petsCollection.updateOne(filter,updatedDoc);
   res.send(result);
 })
 app.patch('/admin/notadopted/:id',async(req,res)=>{
  const id =req.params.id;
  const filter={_id:new ObjectId(id)};
  const updatedDoc={
   $set:{
     adopted:false,
   }
  }
  
   const result = await petsCollection.updateOne(filter,updatedDoc);
   res.send(result);
 })
 app.delete('/adddonationcamp/:id', async (req, res) => {
  const id = req.params.id;
  console.log('Deleting donation camp with ID:', id);

  try {
    const result = await addDonationCampCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 1) {
      console.log('Donation camp deleted successfully.');
      res.status(200).json({ message: 'Donation camp deleted successfully' });
    } else {
      console.log('Donation camp not found.');
      res.status(404).json({ message: 'Donation camp not found' });
    }
  } catch (error) {
    console.error('Error deleting donation camp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// pause donation

app.patch('/admin/pause/:id',async(req,res)=>{
  const id =req.params.id;
  const filter={_id:new ObjectId(id)};
  const updatedDoc={
   $set:{
     pause:true,
   }
  }
  
   const result = await addDonationCampCollection.updateOne(filter,updatedDoc);
   res.send(result);
 })

//  resume
app.patch('/admin/resume/:id',async(req,res)=>{
  const id =req.params.id;
  const filter={_id:new ObjectId(id)};
  const updatedDoc={
   $set:{
     pause:false,
   }
  }
  
   const result = await addDonationCampCollection.updateOne(filter,updatedDoc);
   res.send(result);
 })

// accpt
app.patch('/admin/accept/:id',async(req,res)=>{
  const id =req.params.id;
  const filter={_id:new ObjectId(id)};
  const updatedDoc={
   $set:{
     adopt_Req:true,
   }
  }
  
   const result = await addAdoptCollection.updateOne(filter,updatedDoc);
   res.send(result);
 })

//  reject
app.patch('/admin/reject/:id',async(req,res)=>{
  const id =req.params.id;
  const filter={_id:new ObjectId(id)};
  const updatedDoc={
   $set:{
     adopt_Req:false,
   }
  }
  
   const result = await addAdoptCollection.updateOne(filter,updatedDoc);
   res.send(result);
 })




// payment intent
app.post('/create-payment-intent', async (req, res) => {
  const { donationAmount } = req.body;
  const amount = parseInt(donationAmount * 100);
  console.log(amount, 'amount inside the intent')

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  })
});

app.post('/payments', async (req, res) => {
  const payment = req.body;
  console.log('payment',payment);
  const paymentResult = await paymentCollection.insertOne(payment);

  //  carefully delete each item from the cart
  console.log('payment info', payment);
  const query = {
    _id: {
      $in: payment.cartIds.map(id => new ObjectId(id))
    }
  };

  const deleteResult = await cartCollection.deleteMany(query);

  res.send({ paymentResult, deleteResult });
})

// get payment
app.get('/payments',async(req,res)=>{
 
  const cursor=paymentCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

// pay delete

app.delete('/payments/:id', async(req,res)=>{
  const id =req.params.id;
  console.log(id);
  const query={_id:new ObjectId(id)}
  const result = await paymentCollection.deleteOne(query);
  res.send(result);
})


//show donator
app.get('/payments/:ownerEmail', async (req, res) => {
  try {
    const donators = await paymentCollection.find({ ownerEmail: req.params.ownerEmail });
    res.json(donators);
    console.log(req.params.ownerEmail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.get('/donatorInfo/:email', async (req, res) => {
//   try {
//     const donator = await paymentCollection.findOne({ ownerEmail: req.params.ownerEmail });
//     res.json(donator);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
     
    }
  }
  run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('pet adoption is running in server')
})
app.listen(port,()=>{
    console.log(`pet adoptionis running on port : ${port}`);
})


