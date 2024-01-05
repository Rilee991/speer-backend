const cluster = require("cluster");
const os = require("os");

if(cluster.isMaster) {
    const totalCpus = os.cpus().length;

    for(let i=0;i<totalCpus;i++) {
        cluster.fork();
    }
} else {
    require("./app.js");
}
