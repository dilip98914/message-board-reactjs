const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
const morgan=require('morgan');
const app=express();
const monk=require('monk');
const joi=require('joi');
const path=require('path');
app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname,'build')));
const connString=process.env.MONGODB_URI;
const db=monk(connString);
let messages=db.get('messages');


const schema=joi.object().keys({
	message:joi.string().max(500).required(),
	imageURL:joi.string(),
	created:joi.date()
});


function getAll(){
	return messages.find();
}

function create(message){
	const result=joi.validate(message,schema);
	if(result.error==null){
		message.created=new Date();
		return messages.insert(message);
	}else{
		return Promise.reject(result.error);
	}
}



//home route
app.get('/',(req,res)=>{
	res.json({
		message:'full Stack message Board! from reactjs'
	});
});

//message api
app.get('/messages',(req,res)=>{
	console.log('heya');
	getAll().then((messages)=>{
		console.log(messages);
		res.json(messages);
	});
});

//message add
app.post('/messages',(req,res)=>{
	create(req.body).then((message)=>{
		res.json(message);
	}).catch(err=>{
		res.status(500);
		res.json(err);
	});
});

// if(process.env.NODE_ENV=='production'){
// 	app.use(express.static('client/build'));
// 	app.get('*',(req,res)=>{
// 		res.sendFile(path.join(__dirname,'client','build','index.html'))
// 	});
// }

app.get('*',(req,res)=>{
	res.sendFile(path.join(__dirname,'build','index.html'));
});

const port=process.env.PORT || 5001;

app.listen(port,()=>{
	console.log(`server is listening on ${port}`);
});