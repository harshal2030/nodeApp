const app = require('./app')
const port = process.env.PORT;

app.listen(port, '192.168.43.26', () => {
    console.log("Server listening on ", +port);
})