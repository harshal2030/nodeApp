const app = require('./app')
const port = process.env.PORT;

app.listen(port, '192.168.1.103', () => {
    console.log("Server listening on ", +port);
})