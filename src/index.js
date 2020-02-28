const express = require('express');
const {Pool, Client} = require('pg');
const port = process.env.PORT || 3000;

const app = express();

app.listen(port, () => {
    console.log("Server listening on ", +port);
})