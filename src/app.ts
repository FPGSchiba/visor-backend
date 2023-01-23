import express from 'express';
import expressWinston from 'express-winston';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { loggerOptions } from './util';
const app = express();
import pj from '../package.json';
import { runMigration } from './util/migration-manager';
import managementRouter from './router/management.router';
import { adminAuthentication } from './middleware/admin-auth';
import managementController from './controller/management.controller';
import { orgAuthentication } from './middleware/visor-auth';
import usersRouter from './router/users.router';
import visorRouter from './router/visor.router';
import usersController from './controller/users.controller';
import dataRouter from './router/data.router';
import orgDataRouter from './router/org-data.router';

app.use(expressWinston.logger(loggerOptions));

runMigration();


/** Parse the body of the request */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
    createParentPath: true
}))

/* Rules */ 
app.use((req, res, next) => {
    res.locals.access = { path: req.path, method: req.method }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', '*');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.use('/api', adminAuthentication, managementRouter);

app.use('/data-api', adminAuthentication, dataRouter);

app.use('/users', orgAuthentication, usersRouter);

app.use('/visor', orgAuthentication, visorRouter);

app.use('/data', orgAuthentication, orgDataRouter)

app.post('/activate-org', managementController.activateOrgReq);

app.get('/user', usersController.getCurrentUser)

app.get('/', (req, res) => {
    res.send(`<h1>VISOR Backend v${pj.version}</h1>
    <h2>${pj.description}</h2>`);
});

export default app;
