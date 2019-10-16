module.exports = {
  from: "EMS Bot <no_reply@4iresearch.com>",
  port: 8090,
  db: {
    name: "ems",
    user: "test",
    pwd: "test",
    port: "27017",
    host: "localhost",
    uri: function() {
      return `mongodb://${this.user}:${this.pwd}@${this.host}:${this.port}/${this.name}`;
    }
  },
  api: {
    mail:
      "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"
  }
};
