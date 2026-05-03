const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const logger = require("../utils/logger");

let emailQueue;
let connection;

if (process.env.REDIS_URL) {
  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
  emailQueue = new Queue("emailQueue", { connection });
} else {
  logger.warn("⚠️ REDIS_URL not found. BullMQ email queue is disabled. Emails will be sent synchronously as fallback.");
  // Fallback mock queue
  emailQueue = {
    add: async (name, data) => {
      logger.info(`Fallback: Executing email job synchronously`);
      const { sendEmail } = require("../utils/mailer");
      await sendEmail(data.to, data.subject, data.htmlContent);
    }
  };
}

module.exports = { emailQueue, connection };
