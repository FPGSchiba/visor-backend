import app from "./app";
import { LOG } from "./util";
import * as dotenv from 'dotenv';
import { UserKeyManager } from "./util/key-manager";
dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => LOG.info(`VISOR API is listening on port: ${port}`));