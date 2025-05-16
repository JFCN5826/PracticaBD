module.exports = {
    database: {
        host: 'localhost',
        user: 'root',
        password: 'tuqui1106',
        database: 'bdmedico',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    },
    server: {
        port: process.env.PORT || 3000
    }
}; 