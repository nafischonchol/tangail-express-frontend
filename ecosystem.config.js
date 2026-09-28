module.exports = {
  apps: [{
    name: "mohimaa",
    script: "npm",
    args: "start",
    env: {
      PORT: 3090,
      NODE_ENV: "production",
    }
  }]
}

//pm2 start ecosystem.config.js