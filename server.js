const http=require('http');
const app = require('../Backend/app');
const port=3000

const server=http.createServer(app)
server.listen(port,()=>{
    console.log(`server Running on ${port}`)
});