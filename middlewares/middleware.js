const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const configureMiddleware = (app) => {
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(morgan('dev'));
    app.use(cors());
    app.use(cookieParser());
};

module.exports = configureMiddleware;
