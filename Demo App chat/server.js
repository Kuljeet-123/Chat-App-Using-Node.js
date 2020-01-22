var express=require('express')
var bodyParser=require('body-parser')
var app=express()
var http=require('http').Server(app)
var io=require('socket.io')(http)
var mongoose=require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Kuljeet:Kuljeet@cluster0-gxlnb.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

mongoose.Promise=Promise

//var dbUrl='mongodb+srv://Kuljeet:Kuljeet@cluster0-gxlnb.mongodb.net/test?retryWrites=true&w=majority'

var Message=mongoose.model('Message',{
    name:String,
    message:String
})

app.get('/messages',(req,res)=>{
    Message.find({},(err,messages)=>{
        res.send(messages)  
    })
}) 
app.get('/messages/:user',(req,res)=>{
    var user=req.params.user
    Message.find({name:user},(err,messages)=>{
        res.send(messages)  
    })
})

app.post('/messages',async(req,res)=>{
    try{
        //throw 'Some error'
        var message=new Message(req.body)
    var savedMessage=await message.save()
        console.log('saved')
        var censored=await Message.findOne({message:'badword'})
        if(censored){
            //console.log('censored words fpond',censored)
            await Message.remove({__id:censored.id})
        }
        else{
        io.emit('message',req.body)
        }
        res.sendStatus(200)
    }
    catch(error){
       res.sendStatus(500)
       return console.error(error)
    }
    finally{
        //logger.log('message post called')
    }
})

io.on('connection',(socket)=>{
    console.log('A user connected')
})

mongoose.connect(uri,{useMongoClient:true},(err)=>{
    console.log('Mongodb connection',err)
})

var server=http.listen(3000,()=>{
    console.log('server is listening on port',server.address().port)
})