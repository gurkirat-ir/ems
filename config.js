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
