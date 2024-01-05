const { RateLimiterMemory } = require("rate-limiter-flexible");

const options = {
    duration: 60, // Represents 60 sec
    points: 20 // Number of requests per unit duration (60secs in our case)
};

const rateLimiter = new RateLimiterMemory(options);

const rateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip)
    .then((rateLimiterResp) => {
        res.setHeader("Retry-After", rateLimiterResp.msBeforeNext / 1000);
        res.setHeader("X-RateLimit-Limit", options.points);
        res.setHeader("X-RateLimit-Remaining", rateLimiterResp.remainingPoints);
        res.setHeader("X-RateLimit-Reset", new Date(Date.now() + rateLimiterResp.msBeforeNext));
        next();
    })
    .catch(err => {
        res.status(429).json({ message: "Too many requests. Please try again after sometime." });
    })
}

module.exports = {
    rateLimiterMiddleware
}
