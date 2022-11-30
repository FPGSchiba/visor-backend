import express from 'express';
import expressWinston from 'express-winston';
import { loggerOptions } from './util';
const app = express();
import pj from '../package.json';

app.use(expressWinston.logger(loggerOptions));


/** Parse the body of the request */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* Rules */ 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.get('/', (req, res) => {
    res.send(`<h1>FISOR Backend v${pj.version}</h1>
    <h2>${pj.description}</h2>`);
});

export default app;
