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
      "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 "
  }
};
