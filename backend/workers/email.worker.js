const { Worker } = require("bullmq");
const { connection } = require("../queues/email.queue");
const { sendEmail } = require("../utils/mailer");
const logger = require("../utils/logger");

let emailWorker = null;

if (connection) {
  emailWorker = new Worker(
    "emailQueue",
    async (job) => {
      const { to, subject, htmlContent } = job.data;
      try {
        await sendEmail(to, subject, htmlContent);
        logger.info(`Email job ${job.id} processed successfully`);
      } catch (error) {
        logger.error(`Failed to process email job ${job.id}: ${error.message}`);
        throw error;
      }
    },
    { connection }
  );

  emailWorker.on("completed", (job) => {
    logger.info(`Email job ${job.id} has completed!`);
  });

  emailWorker.on("failed", (job, err) => {
    logger.error(`Email job ${job.id} has failed with ${err.message}`);
  });
}

module.exports = emailWorker;
