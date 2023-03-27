const express = require('express');
var cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const { default: axios } = require('axios')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb')
const KJUR = require('jsrsasign')
var qs = require('qs');
const port = process.env.PORT || 5000


const app = express();
app.use(bodyParser.json(), cors())
app.use('*', cors())
// process.env.Node_No_WARNINGS = 1;

// const cCPUs = 1;
// const now = (function(){
//     const year = new Date(new Date().getFullYear().toString()).getTime();
//     return function(){
//         return Date.now() // - Year
//     }
// })();


// if(cluster.isMaster){
//     //Create a worker for CPU
//     for(let i = 0; i < cCPUs; i++){
//         cluster.fork();
//     }

//     cluster.on('online', function(worker){
//         console.log('Worker '+ worker.process.pid + 'died.');
//     });
// }else{


//     app.use(bodyParser.urlencoded({
//         extended: true 
//     }))
//     app.use(bodyParser.json())
//     // app.listen(port);

    


    
// }


app.get('/', (req, res)=>res.send('port is on'))



// userName: zoom-demo
// Password: b4bOABECVBqTIaUq


const uri = "mongodb+srv://zoom-demo:b4bOABECVBqTIaUq@cluster0.zingp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// const collection = client.db("test").collection("devices");


async function run() {
    try {
      const database = client.db("sample_mflix");
      const movies = database.collection("movies");


        app.get('/zoomauth', async(req, res)=>{
            // return res.redirect(encodeURI(`https://zoom.us/oauth/authorize?response_type=code&client_id=aiWNRxRqQKGkR2V1puIg&redirect_uri=${encodeURI('https://localhost:5000/redirect')}`))
            const url = 'https://oauth-provider.com/authorize?' + qs.stringify({
                client_id: 'aiWNRxRqQKGkR2V1puIg',
                redirect_uri: 'https://localhost:5000/redirect',
                response_type: 'code',
            });
            res.redirect('/redirect');
        });


        app.get('/redirect', async(req, res)=>{
            console.log('redirect working');
            // let data = qs.stringify({
            //     code: req.query.code,
            //     grant_type: 'authorization_code',
            //     redirect_uri: 'https://localhost:5000/redirect'
            // });
            // console.log('redirect data', data);
            // const zHeaders = new Headers();
            // zHeaders.append("content-type", "application/x-www-form-urlencoded")
    
            // const urlencoded = new URLSearchParams();
            // urlencoded.append("test", "sdfsdfds");
    
            // const config = {
            //     method: 'post',
            //     url: 'https://zoom.us/oauth/token',
            //     headers:{
            //         "Authorization": "Basic" + Buffer.from(`aiWNRxRqQKGkR2V1puIg:v0DpxS39vBO9JjY6a60S3BOwrZUdQ1Me`).toString('base64'),
            //         "Content-Type": "application/x-www-form-urlencoded"
            //     },
            //     data: data
            // };

            // console.log('COnfig header and body',config);
    
            let result = await axios.post('https://oauth-provider.com/token',{
                grant_type: 'authorization_code',
                code:req.query.code,
                client_id: 'aiWNRxRqQKGkR2V1puIg',
                client_secret: 'v0DpxS39vBO9JjY6a60S3BOwrZUdQ1Me',
                redirect_uri: 'https://localhost:5000/redirect',
            })
                // .then( function (res){
                //     console.log('This is a data zoom',JSON.stringify(res.data));
                // })
                // .catch(function (err){
                //     console.log('this is a error',err);
                // });
                console.log(result);
                
            res.redirect('/');
        });






        app.get('/jwt', async(req, res)=>{
            
            const email = req.query.email;
            const payload = {
                iss:process.env.API_KEY,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 // Token expiration time (1 hour)
            };
            const token = jwt.sign(payload, process.env.SECRET_KEY);

            console.log('This is a token jwt alwys raedy', token);
            res.send({ accessToken: token })
            // res.status(403).send({ accessToken: '' })
            
        })

        app.post('/', async(req, res) =>{
            const iat = Math.round(new Date().getTime() / 1000) - 30;
            const exp = iat + 60 * 60 * 2

            const oHeader = { alg: 'HS256', typ: 'JWT' }

            const oPayload = {
                sdkKey: process.env.API_KEY,
                mn: req.body.meetingNumber,
                role: req.body.role,
                iat: iat,
                exp: exp,
                appKey: process.env.API_KEY,
                tokenExp: iat + 60 * 60 * 2
            }

            const sHeader = JSON.stringify(oHeader)
            const sPayload = JSON.stringify(oPayload)
            const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.SECRET_KEY)

            res.json({signature});
        })


        app.get('/zaktoken', async(req, res)=>{
            const payload = {
                iss: process.env.API_KEY,
                exp: Date.now() + 3600, // Token expiration time (1 hour from now)
                meetingNumber:process.env.METTING_NUMBER,
                role: process.env.ROLE
            }

            const zakToken = jwt.sign(payload, process.env.SECRET_KEY);

            // axios({
            //     method: 'POST',
            //     url: `https://api.zoom.us/v2/meetings/${process.env.METTING_NUMBER}/registrants`,
            //     headers: {
            //       Authorization: `Bearer ${zakToken}`,
            //       'Content-Type': 'application/json'
            //     },
            //     data: {
            //       email: 'rashedtechdr.786@gmail.com',
            //       first_name: 'Rasheder',
            //       last_name: 'Rahman'
            //     }
            //   })
            //   .then(response => {
            //     console.log(response.data);
            //     res.send(`Zak Token: ${zakToken}`);
            //   })
            //   .catch(error => {
            //     console.log(error);
            //     res.send(error);
            // });

        const response = await fetch('https://api.zoom.us/v2/users/me', {
        headers: {
          Authorization: `Bearer ${zakToken}`,
          'Content-Type': 'application/json',
        },
        })
        const data = await response.json();
        console.log(data);
        res.send({zakTokens: data});
        })

    } finally {
    //   await client.close();
    }
  }
run().catch(console.dir);

app.listen(port, () => console.log(`listening on port ${port}!`))

